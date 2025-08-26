'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import Profile from '@/components/profile/profile'
import Statistic from '@/components/profile/statistic/statistic'
import { AnimatePresence, motion } from 'framer-motion'
import { addGroup } from '@/actions/actions'

type Group = { id: string, title: string }
type Todo = { id: string; title: string; description: string; deadline: Date; groupId: string | null }
type User = { id: string; name: string; profileImage: string; todo: Todo[]; group?: Group[] | null }
type GroupProps = {
  title: string,
  tasks: number,
  id: string,
  onClick: (groupId: string) => void
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController()
    const theme = localStorage.getItem("theme") === "dark";

    if (theme) {
      document.body.classList.add("dark-mode");
    }
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
    if (!user?.group) return []

    const result: { groupTitle: string; tasks: number; id: string }[] =
      user.group.map((g) => ({
        groupTitle: g.title,
        tasks: 0,
        id: g.id,
      }))

      for (let i = 0; i < user.todo.length; i++) {
        const todo = user.todo[i]
        if (!todo.groupId) continue

        const group = result.find((g) => g.id === todo.groupId)
        if (group) group.tasks += 1
      }

    return result
  }, [user])


  if (loading) return <p>loading...</p>
  if (!user) return <p>{error}</p>
  

  function handleGroupSide(groupId: string) {
    router.push(`/home?g=${groupId}`)
  }

  async function handleSubmitGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const result = await addGroup(formData, user!.id)

    if(result.success) {
      setUser(prev => prev ? {
        ...prev,
        group: [...(prev.group || []), result.group as Group],
      } : prev)

      setShowForm(false)
    } else {
      if(!result.success) {
        alert(result.message)
      }
    }
  }

  

  return (
    <div className='p-2.5 flex flex-col gap-2.5'>
      <header className="flex w-full justify-between p-2.5 gap-2.5">
        <button 
        onClick={() => router.push('/home')}>
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
      <div className='p-2.5 flex flex-col gap-1.25 '>
        <h1 className='text-[var(--SeaShell-950)] text-xl font-bold'>Group</h1>
        <AnimatePresence>
          {groups.map((g, index) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40, }}
              transition={{ delay: index / 10, duration: 0.6,}}
            >
              <Group
                title={g.groupTitle}
                tasks={g.tasks}
                onClick={handleGroupSide}
                id={g.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>

          <button className="flex justify-center items-center cursor-pointer 
          w-8 h-8 rounded-full bg-[var(--BlushPink-400)] mx-auto text-white hover:opacity-80" 
          onClick={() => setShowForm(prev => !prev)}>
            <Icon icon="material-symbols:add-rounded" />
          </button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmitGroup}
            className='flex flex-col gap-2.5 fixed left-1/2 
            translate-x-[-50%] bottom-5'
          >
            <motion.input
              placeholder="Title"
              name="title"
              type="text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className='py-2 px-3.5 rounded-xl text-sm 
              bg-[var(--SeaShell-50)] border border-solid border-[var(--SeaShell-200)]
              focus:outline-none'
            />

            <motion.button
              type='submit'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center items-center cursor-pointer 
              w-8 h-8 rounded-full bg-[var(--BlushPink-400)] mx-auto text-white hover:opacity-80"
            >
              <Icon icon={'formkit:submit'} />
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function Group(props: GroupProps) {
  return (
    <div className='flex flex-col rounded-2xl 
    p-2.5 pl-5 gap-1 w-full bg-[var(--SeaShell-25)]
    cursor-pointer' 
    onClick={() => props.onClick(props.id)}>
      <h1 className='text-[var(--SeaShell-950)] text-xs font-bold'>{props.title}</h1>
      <p className='text-[var(--SeaShell-950)] text-[12px] opacity-50'>{props.tasks} task</p>
    </div>
  )
}