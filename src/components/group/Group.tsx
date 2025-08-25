import { Icon } from '@iconify/react/dist/iconify.js';
import styles from './style.module.scss'
import Task from '../ui/common/Task';
import { useContext, useMemo, useState } from 'react';
import AddTaskToGroup from './AddGroup';
import { AnimatePresence, motion } from 'framer-motion';
import { addTask, GroupRemove } from '@/actions/actions';
import React from 'react';
import { TaskContext } from '@/app/context/TaskContext';

type Task = { 
  id: string; 
  title: string; 
  description: string; 
  deadline: Date; 
  groupId: string | null 
}

type Props = {
  userId: string,
  onDel: ( taskId: string ) => void
  onError: ( error: string ) => void
  onClick: () => void
  groupId: string,
  onGroup: ( groupId: string, taskId: string ) => void
  onTaskCreate: (task: Task) => void,
  onGroupTaskDel: ( taskId: string ) => void
  onGroulDel: ( groupId: string ) => void
  addFavorite: (taskId: string, favoriteId: string) => void
  removeFavorite: (taskId: string) => void,
  favorites?: {id: string, todoId: string}[] | null
  getTimerSide: (taskId: string) => void
}

function GroupSide(props: Props) {
  const [isControl, setIsControl] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const tasks = useContext(TaskContext)
  const stableTasks = useMemo(() => tasks || [], [tasks]);

  const filteredTasks = useMemo(() => {
    return stableTasks.filter(task => task.groupId === props.groupId);
  }, [stableTasks, props.groupId]);

  function handleSubmitEditTodo(taskId: string) {
    fetch('/api/user/task/group/add', {
      method: 'POST',
      headers: { "Content-Type": 'application/json' },
      body: JSON.stringify({ groupId: props.groupId, taskId: taskId })
    }).then(res => res.json())
    .then(data => {
      if(data.success) {
        props.onGroup(data.task.groupId, taskId)
      } else {
        if(!data.success) {
          props.onError(data.message)
        }
      }
    })
  }

  async function handleSubmitTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget)
    const result = await addTask(formData, props.groupId)

    if(result.success) {
      props.onTaskCreate(result.task)
      setShowForm(false)
    } else {
      if(!result.success) {
        props.onDel(result.message)
      }
    }
  }

  function handleRemove(taskId: string) {
    fetch('/api/user/task/group/delete', {
      method: 'POST',
      headers: {"Content-Type": 'application/json'},
      body: JSON.stringify({ taskId: taskId})
    }).then(res => res.json())
    .then(data => {
      if(data.success) {
        props.onGroupTaskDel(taskId)
      } else if(!data.success) {
        props.onError(data.message)
      }
    })
  }

  async function handleGroupRemove() {

    const result = await GroupRemove(props.groupId)
    
    if(result.success) {
      props.onGroulDel(result.groupId || '')
      props.onClick()
    } else {
      if(!result.success) {
        props.onError(result.message || 'Something went wrong.')
      }
    }
  }

  return (
    <main className={`${styles.groupSlide}
    ${isControl ? styles.controling : ''}`}>
      <header>
        <button onClick={() => props.onClick()}>
          <Icon 
            icon={'pajamas:go-back'}
          />
        </button>
        <h1>Group</h1>
        <span></span>
      </header>
      <div>
        <h1>Task</h1>
        <div>
          {filteredTasks.map((task, index) => (
            <div key={task.id}>
              <Task
                title={task.title}
                description={task.description}
                delay={index * 100}
                id={task.id}
                userId={props.userId}
                isRun={false}
                onDel={props.onDel}
                onError={props.onError}
                addFavorite={props.addFavorite}
                removeFavorite={props.removeFavorite}
                favoriteId={props.favorites?.find(f => f.todoId === task.id)?.id || ''}
                getTimerSide={props.getTimerSide}
              />
              <button onClick={() => handleRemove(task.id)}>
                <Icon icon={'mingcute:close-fill'} />
              </button>
            </div>
          ))}
          <AnimatePresence>
            {isControl && (
              <motion.aside
                initial={{ y: 20, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AddTaskToGroup
                  userId={props.userId}
                  groupId={props.groupId}
                  addTask={handleSubmitEditTodo}
                />
              </motion.aside>
            )
            }
          </AnimatePresence>
        </div>
      </div>
      <aside>
        <button onClick={() => handleGroupRemove()} ><Icon icon={'solar:trash-bin-minimalistic-linear'} /></button>
        <button onClick={() => setIsControl(prev => !prev)}><Icon icon={'majesticons:edit-pen-2-line'} /></button>
        <button data-hovered onClick={() => setShowForm(prev => !prev)}><Icon icon="material-symbols:add-rounded" /></button>
      </aside>
      <AnimatePresence>
        {showForm && (
          <motion.form
            className={styles.form}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmitTask}
          >
            <motion.input
              placeholder="Title"
              name="title"
              type="text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            />

            <motion.input
              type="date"
              name="deadline"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />

            <motion.textarea
              placeholder="Description"
              name="description"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
            <motion.button
              type='submit'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Icon icon={'formkit:submit'} />
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </main>
  )
}

export default React.memo(GroupSide)