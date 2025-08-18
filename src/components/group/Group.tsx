import { Icon } from '@iconify/react/dist/iconify.js';
import styles from './style.module.scss'
import Task from '../ui/common/Task';
import { useMemo, useState } from 'react';
import AddTaskToGroup from './AddGroup';

type Task = { 
  id: string; 
  title: string; 
  description: string; 
  deadline: Date; 
  group: { id: string, title: string } | null 
}

type Group = {
  id: string,
  title: string,
}

type Props = {
  title: string,
  userId: string,
  onDel: ( taskId: string ) => void
  onError: ( error: string ) => void
  onClick: () => void
  groupId: string,
  tasks: Task[]
  onGroup: ( group: Group, taskId: string ) => void
}

export default function GroupSide(props: Props) {
  const [isControl, setIsControl] = useState(false)

  const filteredTasks = useMemo(() => {
    return props.tasks.filter((task) => task.group?.id === props.groupId)
  }, [props.tasks, props.groupId])


  function handleSubmitEditTodo(taskId: string) {
    fetch('/api/user/task/group/add', {
      method: 'POST',
      headers: { "Content-Type": 'application/json' },
      body: JSON.stringify({ groupId: props.groupId, taskId: taskId })
    }).then(res => res.json())
    .then(data => {
      if(data.success) {
        props.onGroup(data.task, taskId)
      } else {
        if(!data.success) {
          props.onError(data.message)
        }
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
                userId={task.id}
                isRun={false}
                onDel={props.onDel}
                onError={props.onError}
              />
              <button>
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
        <button data-hovered><Icon icon="material-symbols:add-rounded" /></button>
      </aside>
    </main>
  )
}