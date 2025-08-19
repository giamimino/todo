import { Icon } from '@iconify/react/dist/iconify.js';
import styles from './style.module.scss'
import Task from '../ui/common/Task';
import { useMemo, useState } from 'react';
import AddTaskToGroup from './AddGroup';
import { AnimatePresence, motion } from 'framer-motion';
import { addTask } from '@/actions/actions';

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
  tasks: Task[]
  onGroup: ( groupId: string, taskId: string ) => void
  onTaskCreate: (task: Task) => void,
  onGroupDel: ( taskId: string ) => void
}

export default function GroupSide(props: Props) {
  const [isControl, setIsControl] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const filteredTasks = useMemo(() => {
    return props.tasks.filter(task => task.groupId === props.groupId);
  }, [props.tasks, props.groupId]);




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
        props.onGroupDel(taskId)
      } else if(!data.success) {
        props.onError(data.message)
      }
    })
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
              />
              <button onClick={() => handleRemove(task.id)}>
                <Icon icon={'mingcute:close-fill'} />
              </button>
            </div>
          ))}
          {isControl &&
            <AddTaskToGroup
              userId={props.userId}
              groupId={props.groupId}
              tasks={props.tasks}
              addTask={handleSubmitEditTodo}
            />
          }
        </div>
      </div>
      <aside>
        <button><Icon icon={'solar:share-circle-bold'} /></button>
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