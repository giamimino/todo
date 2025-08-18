'use client'
import { Icon } from "@iconify/react/dist/iconify.js"
import { useEffect, useMemo, useRef, useState } from "react"
import styles from './style.module.scss'
import Search from "../ui/common/search"
import { AnimatePresence, motion } from "framer-motion"

type Task = { 
  id: string; 
  title: string; 
  description: string; 
  deadline: Date; 
  group: {id: string, title: string} | null 
}

type Props = {
  userId: string,
  groupId: string,
  tasks: Task[],
  addTask: (taskId: string) => void
}

type PropsTask = {
  id: string,
  title: string,
  des: string,
  delay: number,
  onClick: (taskId: string) => void,
}

export default function AddTaskToGroup({ userId, groupId, tasks, addTask }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [searchValue, setSearchValue] = useState('')  

  const filteredTasks = useMemo(() => {
      return tasks.filter((task) => task.title.toLowerCase().includes(searchValue.toLowerCase()))
  }, [searchValue])

  function handleClick(taskId: string) {
    setShowForm(false)
    addTask(taskId)
  }

  return (
    <>
      <button type="button" className={styles.toggle} onClick={() => setShowForm(prev => !prev)}>
        <Icon icon={'material-symbols:add-rounded'} />
      </button>
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ x: "200vw" }}
            animate={{ x: 0 }}
            exit={{ x: "200vw" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              height: "100%",
              width: "100%",
              zIndex: 10000,
            }}
          >
            <main className={`${styles.tasks}`}>
              <header>
                <button onClick={() => setShowForm(false)}>
                  <Icon 
                    icon={'pajamas:go-back'}
                  />
                </button>
                <h1>Group</h1>
                <span></span>
              </header>
              <Search
                onChange={(value: string) => setSearchValue(value)}
              />
              <aside>
                {filteredTasks?.map((task, index) => (
                  <Task
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    des={task.description}
                    delay={index * 100}
                    onClick={handleClick}
                  />
                ))}
              </aside>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Task(props: PropsTask) {
  const [inView, setInView] = useState(false)
  const taskRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if(entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.3 }
      )
  
      if(taskRef.current) {
        observer.observe(taskRef.current)
      }
  
      return () => {
        observer.disconnect()
      }
    }, [])

  return (
    <div ref={taskRef} 
    className={`${styles.task} ${inView ? styles.inView : ''}`}
    style={{
      transitionDelay: `${props.delay}ms`
    }} onClick={() => props.onClick(props.id)}>
      <h1>{props.title}</h1>
      <p>{props.des}</p>
    </div>
  )
}