import { editTask } from "@/actions/actions";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

type Task = {
  id: string,
  title: string,
  description: string
  deadline: Date,
}

type Props = {
  onDel: (taskId: string) => void;
  onError: (error: string) => void;
  getBack: () => void;
  task: Task
  onTaskEdit: (taskId: string, title: string, description: string) => void
};

export default function EditSide(props: Props) {
  const [isUptoDate, setIsUptoDate] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    if (!props.task?.deadline) return;
      const deadline = new Date(props.task.deadline);
      const now = Date.now();
      const target = deadline.getTime();

      if (now > target) {
        setIsUptoDate(true);
        setTimeLeft("0 Day");
      } else {
        const diff = target - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days} days ${days === 0 ? `${h}Hr ${m}m` : ""}`);
      }
  }, [props.task?.deadline]);

  async function handleDelete() {
    fetch('/api/user/task/delete', {
      method: 'POST',
      headers: { "Content-Type": 'application/json' },
      body: JSON.stringify({ taskId: props.task.id })
    }).then(res => res.json())
    .then(data => {
      if(data.success) {
        props.onDel(data.taskId)
        props.getBack()
      } else {
        props.onError(data.message || "Something went wrong.")
      }
    })
  }

  async function handleTaskEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const result = await editTask(formData, props.task.id)

    if(result.success) {
      props.onTaskEdit(
        result.taskId as string, 
        formData.get("title") as string,
        formData.get("description") as string
      )
    } else {
      props.onError(result.message || "Something went wrong.")
    }
    props.getBack()
  }

  const EditFields = React.memo(function EditFields() {
    return (
      <>
        <input type="text" defaultValue={props.task.title} name="title"
        className="text-xl font-bold text-[var(--SeaShell-950)] border rounded-lg
        border-[var(--SeaShell-200)] p-1
        focus:outline-[var(--SeaShell-300)] focus:p-2" />
        <textarea  defaultValue={props.task.description}
        className="text-base opacity-75 font-semibold text-[var(--SeaShell-950)] pl-2 border rounded-lg
        border-[var(--SeaShell-200)]
        focus:outline-[var(--SeaShell-300)] focus:p-2.5" name="description"></textarea>
        <motion.button 
          initial={{y: 20, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.3, delay: 0.1}}
          className="w-8 h-8 p-2.5 rounded-full bg-[var(--BlushPink-400)] flex justify-center
          items-center cursor-pointer text-white hover:text-white/80 mx-auto"
          type="submit"
        >
          <Icon icon={"formkit:submit"} />
        </motion.button>
      </>
    )
  })

  const DefaulFields = React.memo(function DefaulFields() {
    return (
      <>
        <h1 className="text-xl font-bold text-[var(--SeaShell-950)]">{props.task.title}</h1>
        <p className="text-base opacity-75 font-semibold text-[var(--SeaShell-950)] pl-1.5">{props.task.description}</p>
      </>
    )
  })

  return (
    <div
      className="flex flex-col gap-2.5 py-2.5 px-5 fixed
    top-0 left-0 w-full h-full z-9999 bg-[var(--SeaShell-25)] select-none"
    >
      <header className="flex gap-2.5 justify-between w-full p-2.5">
        <button className="cursor-pointer" onClick={() => props.getBack()}>
          <Icon icon={"pajamas:go-back"} />
        </button>
        <h1>Timer</h1>
        <span></span>
      </header>
      <div className="w-full flex flex-col items-center gap-7.5 p-5 select-none">
        <div className="w-37.5 h-37.5 bg-[var(--BlushPink-400)] 
        rounded-[50%] flex justify-center items-center p-2.5 relative">
          <p className="text-white text-xl z-10 text-center font-bold">{timeLeft}</p>
          <span className="w-45 h-45 bg-[#FF73FA] opacity-20 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] absolute"></span>
          <span className="w-45 h-45 rotate-180 bg-[#FF73FA] opacity-20 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] absolute"></span>
        </div>
        <h1 className="text-xl font-bold text-[var(--SeaShell-950)]">{isUptoDate ? "Time is up" : "Time left"}</h1>
      </div>
      <form onSubmit={handleTaskEdit}
      className="p-2.5 pb-6.25 flex flex-col gap-0.5 ">
        <AnimatePresence>
          {edit ? <EditFields /> : <DefaulFields />}
        </AnimatePresence>
      </form>
      <div className="flex gap-2.5 fixed left-1/2 translate-x-[-50%] bottom-2.5">
        <button onClick={handleDelete}
        className="w-11 h-11 p-2.5 bg-[var(--SeaShell-100)] text-[var(--SeaShell-950)]/50
        flex justify-center rounded-full items-center text-2xl cursor-pointer
        hover:bg-[var(--BlushPink-400)] hover:text-white parent">
          <Icon icon={'solar:trash-bin-minimalistic-linear'} />
        </button>
        <button onClick={() => setEdit(prev => !prev)}
        className="w-11 h-11 p-2.5 bg-[var(--SeaShell-100)] text-[var(--SeaShell-950)]/50
        flex justify-center rounded-full items-center text-2xl cursor-pointer
        hover:bg-[var(--BlushPink-400)] hover:text-white parent">
          <Icon icon={'majesticons:edit-pen-2-line'} />
        </button>
      </div>
    </div>
  );
}
