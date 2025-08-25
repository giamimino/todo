'use client'
import { TaskContext } from '@/app/context/TaskContext'
import React, { useContext, useState } from 'react'
import Task from './Task'

type Props = {
  onError: (error: string) => void
  userId: string
  addFavorite: (taskId: string, favoriteId: string) => void
  removeFavorite: (taskId: string) => void,
  onDel: (taskId: string) => void
  getTimerSide: (taskId: string) => void
  favorites?: {id: string, todoId: string}[] | null
}

export default function Tasks(props: Props) {
  const [visibleCount, setVisibleCount] = useState(4);
  const tasks = useContext(TaskContext) ?? []

  function handleScroll(e: React.UIEvent<HTMLElement>) {
    const target = e.currentTarget;
    console.log("scrollHeight:", target.scrollHeight);
    console.log("scrollTop:", target.scrollTop);
    console.log("clientHeight:", target.clientHeight);
    
    if (target.scrollHeight - (target.scrollTop * 2) <= target.clientHeight) {
      setVisibleCount((prev: number) => prev + 1);
    }
  }

  function throttle(fn: Function, wait: number) {
    let last = 0;
    return function(...args: any) {
      const now = Date.now();
      if (now - last >= wait) {
        fn(...args);
        last = now;
      }
    };
  }
  const handleScrollThrottled = throttle(handleScroll, 350);

  return (
    <main
      className={`h-[35vh] overflow-y-auto flex flex-col w-full gap-1.25 p-1.5 pb-18`}
      onScroll={handleScrollThrottled}
    >
      {tasks.slice(0, visibleCount).map((task, index) => (
        <Task
          key={task.id}
          id={task.id}
          title={task.title}
          description={task.description}
          delay={index * 50}
          onDel={props.onDel}
          onError={props.onError}
          userId={props.userId}
          isRun={false}
          addFavorite={props.addFavorite}
          removeFavorite={props.removeFavorite}
          getTimerSide={props.getTimerSide}
          favoriteId={
            props.favorites?.find((fav) => fav.todoId === task.id)?.id || ""
          }
        />
      ))}
    </main>
  )
}