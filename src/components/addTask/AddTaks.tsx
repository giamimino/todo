import React, { useState, useEffect } from 'react'
import styles from './style.module.scss'
import { Icon } from '@iconify/react'
import { addTask } from '@/actions/actions'

type Task = {
  id: string,
  title: string;
  description: string;
  deadline: Date;
  groupId: string | null;
};

export default function AddTask({ onAdd, onError }: { onError: (error: string) => void, onAdd: (task: Task) => void }) {
  const [isAdding, setIsAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (isAdding) {
      setShowForm(true)
      setAnimating(true)
    } else if (showForm) {
      setAnimating(false)
      const timeout = setTimeout(() => setShowForm(false), 1200)
      return () => clearTimeout(timeout)
    }
  }, [isAdding, showForm])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget)
    const result = await addTask(formData)

    if(result.success) {
      onAdd(result.task);
      setIsAdding(prev => !prev)
    } else {
      if(!result.success) {
        onError(result.message || "Something went wrong.")
      }
    }
  }
  return (
    <>
      {showForm && (
        <form
          id='myForm'
          className={`${styles.form} ${animating ? styles.enter : styles.leave}`}
          onAnimationEnd={() => {
            if (!animating) {
              setShowForm(false)
            }
          }}
          onSubmit={handleSubmit}
        >
          <input placeholder='Title' name='title' type="text" />
          <input type="date" name='deadline' style={{ animationDelay: '200ms' }} />
          <textarea placeholder='Description' name='description' style={{ animationDelay: '100ms'}} >
          </textarea>
        </form>
      )}
      <div className={`${styles.task} ${isAdding ? styles.shown : ''}  ${animating ? styles.enter : styles.leave}`} >
        <button onClick={() => setIsAdding(prev => !prev)}>
          <Icon icon="material-symbols:add-rounded" />
        </button>
        {showForm && (
          <button onClick={() => {
            const form = document.getElementById('myForm') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}>
            <Icon icon={'formkit:submit'} />
          </button>
        )}
      </div>
    </>
  )
}
