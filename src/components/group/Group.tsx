import { Icon } from '@iconify/react/dist/iconify.js';
import styles from './style.module.scss'
import Task from '../ui/common/Task';
import { useState } from 'react';

type Task = { 
  id: string; 
  title: string; 
  description: string; 
  deadline: Date; 
  group: { title: string } | null 
}

type Props = {
  title: string,
  tasks?: Task[],
  userId: string,
  onDel: ( taskId: string ) => void
  onError: ( error: string ) => void
  onClick: () => void
}

export default function GroupSide(props: Props) {
  const [isControl, setIsControl] = useState(false)
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
          {props.tasks?.map((task, index) => (
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