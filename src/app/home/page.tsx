'use client'
import Header from '@/components/header/header'
import WelcomeWrapper from '@/components/ui/welcome/WelcomeWrapper'
import React, { useEffect, useState } from 'react'
import styles from './page.module.scss'
import AddTask from '@/components/addTask/AddTaks'

type Group = {
  title: string,
}

type Todo = {
  title: string,
  description: string,
  group: Group
}

type User = {
  name: string,
  profileImage: string,
  todo: Todo[]
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch('/api/user/get').then(res => res.json())
    .then(data => {
      if(data.success) {
        setUser(data.user)
        setLoading(false)
      } else {
        setLoading(false)
        if(!data.success) {
          setError("Something went wrong")
        }
      }
    })
  }, [])
  
  return (
    <>
      {loading ?
        <p>loading...</p> : 
        !user ? <p>{error}</p> :
        <div className={styles.page}>
        <Header />
        <WelcomeWrapper
          name={user.name || ""}
          iamge={user.profileImage === 'user' ? '/user.webp' : user.profileImage}
        />
        <AddTask />
      </div>
      }
    </>
  )
}
