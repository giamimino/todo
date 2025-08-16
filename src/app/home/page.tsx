'use client'
import Header from '@/components/header/header'
import WelcomeWrapper from '@/components/ui/welcome/WelcomeWrapper'
import React, { useEffect, useState, useMemo } from 'react'
import styles from './page.module.scss'
import AddTask from '@/components/addTask/AddTaks'
import Task from '@/components/ui/common/Task'
import Search from '@/components/ui/common/search'
import Groups from '@/components/ui/groups'
import Error from '@/components/ui/common/error'

type Group = { title: string }
type Todo = { id: string; title: string; description: string; deadline: Date; group: Group | null }
type User = { id: string; name: string; profileImage: string; todo: Todo[]; group?: Group[] | null }
type Task = { id: string; title: string; description: string; deadline: Date; group: Group | null }

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("AII")
  const [searchValue, setSearchValue] = useState("")

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

  const filteredTasks = useMemo(() => {
    if (!user) return []
    if (selectedGroup === "AII" || searchValue !== "") {
      return user.todo.filter((task) => task.title.includes(searchValue))
    }
    if(searchValue !== "" || selectedGroup) {
      const newTasks = user.todo.filter(todo => todo.group?.title === selectedGroup)
      newTasks.filter((task) => task.title.includes(searchValue))
      return newTasks
    }
  }, [user, selectedGroup, searchValue])

  function handleAddTask(task: Task) {
    const newTodo: Todo = { ...task, group: task.group || null }
    setUser(prev => prev ? { ...prev, todo: [...prev.todo, newTodo] } : prev)
  }

  function handleDelTask(taskId: string) {
    setUser(prev => prev ? { ...prev, todo: prev.todo.filter(t => t.id !== taskId) } : prev)
  }

  function handleAddGroup(group: string) {
    setUser(prev => prev ? { ...prev, group: [...(prev.group || []), { title: group }] } : prev)
  }

  function handleFilterGroups(group: string) {
    setSelectedGroup(group)
  }

  if (loading) return <p>loading...</p>
  if (!user) return <p>{error}</p>

  function handleErrorMessage(error: string) {
    setError(error)
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  function handleFilterSearch(value: string) {
    setSearchValue(value)
  }

  return (
    <div className={styles.page}>
      {error !== "" && <Error error={error} />}
      <Header />
      <WelcomeWrapper
        name={user.name || ""}
        iamge={user.profileImage === 'user' ? '/user.webp' : user.profileImage}
      />
      <div className={styles.run}>
      <h1>Run</h1>
      <Task
        userId={user.id}
        id={`jwdahdiawhdhawuihd`}
        title={'title'}
        description='description'
        isRun={true}
        onDel={handleDelTask}
        delay={0}
        onError={handleErrorMessage}
      />
    </div>
      <Search 
        onChange={handleFilterSearch}
      />
      <Groups
        userId={user.id}
        groupTitle={user.group || []}
        onAdd={handleAddGroup}
        onFilter={handleFilterGroups}
        onError={handleErrorMessage}
      />
      <main>
        {filteredTasks!.map((task, index) => (
          <Task
            key={task.id}
            title={task.title}
            description={task.description}
            isRun={false}
            delay={index * 100}
            userId={user.id}
            id={task.id}
            onDel={handleDelTask}
            onError={handleErrorMessage}
          />
        ))}
      </main>
      <AddTask onAdd={handleAddTask} onError={handleErrorMessage} />
    </div>
  )
}
