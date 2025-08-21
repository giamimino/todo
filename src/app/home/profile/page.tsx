'use client'
import React, { useEffect, useMemo, useState } from 'react'
import styles from './page.module.scss'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import Profile from '@/components/profile/profile'
import Statistic from '@/components/profile/statistic/statistic'

type Group = { id: string, title: string }
type Todo = { id: string; title: string; description: string; deadline: Date; groupId: string | null }
type User = { id: string; name: string; profileImage: string; todo: Todo[]; group?: Group[] | null }
type GroupProps = {
  title: string,
  tasks: number,
  id: string,
  onClick: (groupId: string) => void
}

export default function page() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
  
  const groups = useMemo(() => {
    if(!user?.group) return []
    const groups: { groupTitle: string; tasks: number, id: string }[] = []
    for(let i = 0; i < user.group.length; i++) {
      for(let k = 0; k < user.todo.length; k++) {
        if(user.group[i].id === user.todo[k].groupId) {
          const existingGroup = groups.find(
            (g) => g.id === user.group![i].id
          )

          if(existingGroup) {
            existingGroup.tasks += 1
          } else {
            groups.push({
              groupTitle: user.group[i].title,
              tasks: 1,
              id: user.group[i].id
            });
          }
        }
      }
    }

    return groups;
  }, [user])

  if (loading) return <p>loading...</p>
  if (!user) return <p>{error}</p>
  

  function handleGroupSide(groupId: string) {
    router.push(`/home?g=${groupId}`)
  }

  return (
    <div className={styles.page}>
      <header>
        <button onClick={() => router.push('/home')}>
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
      <div className={styles.group}>
        <h1>Group</h1>
          {groups.map((g) => (
            <Group 
              key={g.id}
              title={g.groupTitle}
              tasks={g.tasks}
              onClick={handleGroupSide}
              id={g.id}
            />
          )) }
      </div>
    </div>
  )
}

function Group(props: GroupProps) {
  return (
    <div onClick={() => props.onClick(props.id)}>
      <h1>{props.title}</h1>
      <p>{props.tasks} task</p>
    </div>
  )
}