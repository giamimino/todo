'use client'
import React, { useEffect, useRef, useState } from 'react'
import styles from './task.module.scss'
import { Icon } from '@iconify/react/dist/iconify.js'
import { addFavorite, removeFavorite } from '@/actions/actions';

type Task = {
  id: string,
  title: string;
  description: string;
  deadline: Date;
  group: { id: string, title: string } | null;
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
  addFavorite: (taskId: string, favoriteId: string) => void
  removeFavorite: (taskId: string) => void,
  favoriteId: string,
}


function Task(props: Props) {
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
      } else {
        props.onError(data.message || "Something went wrong.")
      }
    })
  }

  async function handleFavorite() {
    if (props.favoriteId === '') {
      const result = await addFavorite(props.id, props.userId)
      if (result.success) {
        props.addFavorite(result.favorite!.todoId, result.favorite!.id)
        setIsEdit(false)
      } else {
        props.onError(result.message || 'Something went wrong.')
      }
    } else {
      const result = await removeFavorite(props.favoriteId)
      if (result.success) {
        props.removeFavorite(props.id)
        setIsEdit(false)
      } else {
        props.onError(result.message || 'Something went wrong.')
      }
    }
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
          <div>
            <h1>{props.title}</h1>
            <p>{props.description}</p>
          </div>
          {props.favoriteId !== '' && <Icon icon={'solar:star-bold'} /> }
        </div>
        <aside className={`${styles.edit} ${isEdit ? styles.inEdit : ''}`}>
          <button onClick={handleFavorite}><span>{props.favoriteId === '' ? 'Add favorite' :'Remove favorite'}</span><span className={props.favoriteId !== '' ? styles.remove : ''}><Icon  icon={'solar:star-line-duotone'} /></span></button>
          <button><span>Remind me</span><Icon icon={'mage:calendar-3'} /></button>
          <button onClick={handleDelete}><span>Remove</span><Icon icon={'solar:trash-bin-minimalistic-linear'} /></button>
        </aside>
      </div>
    </>
  )
}

export default React.memo(Task);