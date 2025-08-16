import React, { useState, useEffect } from 'react'
import styles from '../addTask/style.module.scss'
import { Icon } from '@iconify/react'
import { addGroup } from '@/actions/actions'

export default function ({ userId, onAdd, onError }: { onError: (error: string) => void,userId: string, onAdd: (group: string) => void }) {
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
  }, [isAdding])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const result = await addGroup(formData, userId)

    if(result.success) {
      onAdd(result.group!.title)
      setIsAdding(false)
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
          className={`${styles.form} ${animating ? styles.enter : styles.leave}`}
          onAnimationEnd={() => {
            if (!animating) {
              setShowForm(false)
            }
          }}
          onSubmit={handleSubmit}
        >
          <input placeholder='Title' name='title' type="text" />
          <button style={{
            animationDelay: '100ms',
          }}>
            <Icon icon={'formkit:submit'} />
          </button>
        </form>
      )}
      <div className={`${styles.group} ${isAdding ? styles.shown : ''}  ${animating ? styles.enter : styles.leave}`} >
        <button onClick={() => setIsAdding(prev => !prev)}>
          <Icon icon="material-symbols:add-rounded" />
        </button>
      </div>
    </>
  )
}
