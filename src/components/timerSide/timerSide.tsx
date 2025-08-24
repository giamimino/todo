import { TimerContext } from "@/app/context/timerContext";
import { Icon } from "@iconify/react";
import React, { useContext, useEffect, useState } from "react";

type Props = {
  getBack: () => void;
};

export default function TimerSide(props: Props) {
  const [isUptoDate, setIsUptoDate] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const task = useContext(TimerContext)

  useEffect(() => {
    if (!task?.deadline) return;
      const now = Date.now();
      const target = new Date(task.deadline).getTime();

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
  }, [task?.deadline]);

  return (
    <div
      className="flex flex-col gap-2.5 py-2.5 px-5 fixed
    top-0 left-0 w-full h-full z-9999 bg-[var(--SeaShell-25)]"
    >
      <header className="flex gap-2.5 justify-between w-full p-2.5">
        <button className="cursor-pointer" onClick={() => props.getBack()}>
          <Icon icon={"pajamas:go-back"} />
        </button>
        <h1>Timer</h1>
        <button className="cursor-pointer">
          <Icon icon={"solar:settings-outline"} />
        </button>
      </header>
      <div className="w-full flex flex-col items-center gap-7.5 p-5">
        <div className="w-37.5 h-37.5 bg-[var(--BlushPink-400)] 
        rounded-[50%] flex justify-center items-center p-2.5 relative">
          <p className="text-white text-xl z-10 text-center font-bold">{timeLeft}</p>
          <span className="w-45 h-45 bg-[#FF73FA] opacity-20 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] absolute"></span>
          <span className="w-45 h-45 rotate-180 bg-[#FF73FA] opacity-20 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] absolute"></span>
        </div>
        <h1 className="text-xl font-bold text-[var(--SeaShell-950)]">{isUptoDate ? "Time is up" : "Time left"}</h1>
      </div>
    </div>
  );
}
