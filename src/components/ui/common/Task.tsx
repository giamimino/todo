'use client'
import React, { useEffect, useRef, useState } from 'react'
import styles from './task.module.scss'
import { Icon } from '@iconify/react/dist/iconify.js'

type Task = {
  id: string,
  title: string;
  description: string;
  deadline: Date;
  group: { title: string } | null;
};

type Props = {
  id: string,
  title: string,
  description: string,
  isRun: true | false,
  delay: number,
  userId: string,
  onDel: (taskId: string) => void
  onError: (error: string) => void
}


export default function Task(props: Props) {
  const [inView, setInView] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
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

  async function handleDelete() {
    fetch('/api/user/task/delete', {
      method: 'POST',
      headers: { "Content-Type": 'application/json' },
      body: JSON.stringify({ taskId: props.id })
    }).then(res => res.json())
    .then(data => {
      if(data.success) {
        props.onDel(data.taskId)
        setIsEdit(false)
      } else if(!data.success) {
        props.onError(data.message || "Something went wrong.")
      }
    })
  }


  return (
    <>
      <div ref={taskRef} className={styles.wrapper}>
        <span className={`${isEdit ? styles.blur : ''}`} 
        onClick={() => setIsEdit(prev => !prev)}></span>
        <div 
        style={{
          transitionDelay: `${props.delay}ms`,
        }}
        className={`${styles.task} 
        ${isEdit ? styles.inEdit : ''} 
        ${inView ? styles.inView : ''} 
        ${props.isRun ? styles.run : ''}`} 
        onClick={() => setIsEdit(prev => !prev)}>
          <h1>{props.title}</h1>
          <p>{props.description}</p>
        </div>
        <aside className={`${styles.edit} ${isEdit ? styles.inEdit : ''}`}>
          <button><span>Remove favorite</span><Icon icon={'solar:star-line-duotone'} /></button>
          <button><span>Remind me</span><Icon icon={'mage:calendar-3'} /></button>
          <button onClick={handleDelete}><span>Remove</span><Icon icon={'solar:trash-bin-minimalistic-linear'} /></button>
        </aside>
      </div>
    </>
  )
}
