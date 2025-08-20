'use client'
import React, { useEffect, useState } from 'react'
import styles from './page.module.scss'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import Profile from '@/components/profile/profile'
import Statistic from '@/components/profile/statistic/statistic'

type Group = { id: string, title: string }
type Todo = { id: string; title: string; description: string; deadline: Date; groupId: string | null }
type User = { id: string; name: string; profileImage: string; todo: Todo[]; group?: Group[] | null }

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
      <Profile
        image={user.profileImage === 'user' ? '/user.webp' : user.profileImage}
        name={user.name}
      />
      <Statistic
        curTotal={user.todo.length}
        total={user.todo.length}
      />
    </div>
  )
}
