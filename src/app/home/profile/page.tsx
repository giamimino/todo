'use client'
import React, { useEffect, useState } from 'react'
import styles from './page.module.scss'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'

type Group = { id: string, title: string }
type Todo = { id: string; title: string; description: string; deadline: Date; groupId: string | null }
type User = { id: string; name: string; profileImage: string; todo: Todo[]; group?: Group[] | null }
type Task = { id: string; title: string; description: string; deadline: Date; groupId: string | null }

export default function page() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const route = useRouter()
  useEffect(() => {
      const controller = new AbortController()
  
      fetch('/api/user/get', { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user)
          } else {
            setError("Something went wrong")
          }
          setLoading(false)
        })
        .catch(err => {
          if (err.name !== 'AbortError') console.error(err)
          setLoading(false)
        })
  
      return () => controller.abort()
    }, [])

    if (loading) return <p>loading...</p>
    if (!user) return <p>{error}</p>
  
  return (
    <div className={styles.page}>
      <header>
        <button onClick={() => route.push('/home')}>
          <Icon 
              icon={'pajamas:go-back'}
            />
        </button>
        <h1>Profile</h1>
        <span></span>
      </header>
    </div>
  )
}
