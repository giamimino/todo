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
import GroupSide from '@/components/group/Group'
import { AnimatePresence, motion } from 'framer-motion'


type Group = { id: string, title: string }
type Todo = { id: string; title: string; description: string; deadline: Date; group: Group | null }
type User = { id: string; name: string; profileImage: string; todo: Todo[]; group?: Group[] | null }
type Task = { id: string; title: string; description: string; deadline: Date; group: Group | null }

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("AII")
  const [searchValue, setSearchValue] = useState("")
  const [isGroupSide, setIsGroupSide] = useState("")
  

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

  const run = useMemo(() => {
    return user?.todo.reduce((acc, num) => acc > num ? num : acc, user.todo[0])
  }, [user])

  const filteredTasks = useMemo(() => {
    if (!user) return []
    if(searchValue !== "") {
      return user.todo.filter((task) => task.title.toLowerCase().includes(searchValue.toLowerCase()))
    }
    if (selectedGroup === "AII") {
      return user.todo
    }

    return user.todo.filter(todo => todo.group?.title === selectedGroup &&
      todo.title.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [user, selectedGroup, searchValue])

  function handleAddTask(task: Task) {
    const newTodo: Todo = { ...task, group: task.group || null }
    setUser(prev => prev ? { ...prev, todo: [...prev.todo, newTodo] } : prev)
  }

  function handleDelTask(taskId: string) {
    setUser(prev => prev ? { ...prev, todo: prev.todo.filter(t => t.id !== taskId) } : prev)
  }

  function handleAddGroup(group: string, id: string) {
    setUser(prev => prev ? { ...prev, group: [...(prev.group || []), { title: group, id: id }] } : prev)
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

  function handleGroupSide(title: string) {
    if (title !== "AII") {
      const group = user?.group?.find(g => g.title === title);
      if (group) setIsGroupSide(group.id);
    }
  }


  function handleCloseGroupSide() {
      setIsGroupSide("")
  }

  function handleGroupChange(group: {id: string, title: string}, taskId: string) {
    setUser(prev => prev ? {
      ...prev,
      todo: prev.todo.map(t => 
        t.id === taskId ?
        {
          ...t,
          group: {
            id: group.id,
            title: group.title
          }
        } : t
      )
    } : prev)
  }

  return (
    <div className={styles.page}>
      {error !== "" && <Error error={error} />}
      <AnimatePresence>
        {isGroupSide !== "" && (
          <motion.main
            initial={{ x: "200vw" }}
            animate={{ x: 0 }}
            exit={{ x: "200vw" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              height: "100%",
              width: "100%",
              zIndex: 9999,
            }}
          >
           <GroupSide
              userId={user.id} 
              tasks={user.todo} 
              onDel={handleDelTask} 
              onError={handleErrorMessage} 
              title={selectedGroup} 
              onClick={handleCloseGroupSide} 
              groupId={isGroupSide}
              onGroup={handleGroupChange}
            />
          </motion.main>
        )}
      </AnimatePresence>


      <Header />
      <WelcomeWrapper
        name={user.name || ""}
        iamge={user.profileImage === 'user' ? '/user.webp' : user.profileImage}
      />
      {run &&
        <div className={styles.run}>
          <h1>Run</h1>
          <Task
            userId={user.id}
            id={run.id}
            title={run.title}
            description={run.description}
            isRun={true}
            onDel={handleDelTask}
            delay={0}
            onError={handleErrorMessage}
          />
        </div>
      }
      <Search 
        onChange={handleFilterSearch}
      />
      <Groups
        userId={user.id}
        groupTitle={user.group || []}
        onAdd={handleAddGroup}
        onFilter={handleFilterGroups}
        onError={handleErrorMessage}
        onClick={handleGroupSide}
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
