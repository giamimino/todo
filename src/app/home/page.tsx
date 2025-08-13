'use client'
import Header from '@/components/header/header'
import WelcomeWrapper from '@/components/ui/welcome/WelcomeWrapper'
import React, { useEffect, useState } from 'react'
import styles from './page.module.scss'
import AddTask from '@/components/addTask/AddTaks'
import Run from '@/components/run/Run'
import Task from '@/components/ui/common/Task'
import Search from '@/components/ui/common/search'
import Groups from '@/components/ui/groups'

type Group = {
  title: string,
}

type Todo = {
  title: string,
  description: string,
  group: Group | null
}

type User = {
  id: string,
  name: string,
  profileImage: string,
  todo: Todo[]
}

type Task = {
  title: string;
  description: string;
  deadline: Date;
  group: Group | null;
};

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

  function handleAddTask(task: Task) {
    const newTodo: Todo = {
      title: task.title,
      description: task.description,
      group: task.group || null
    }
    setUser(prev => prev ? {
      ...prev,
      todo: [...prev.todo, newTodo]
    } : prev)
  }
  
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
        <Run
          title='title'
          description='description'
        />
        <Search />
        <Groups />
        <main>
          {user.todo.map((task, index) => (
            <Task
              key={task.title}
              title={task.title}
              description={task.description}
              isRun={false}
              delay={index * 100}
            />
          ))}
        </main>
        <AddTask 
        onAdd={handleAddTask}
        />
      </div>
      }
    </>
  )
}
