import React from 'react'
import styles from './style.module.scss'
import Task from '../ui/common/Task'

type Props = {
  title: string,
  description: string,
}

export default function Run(props: Props) {
  return (
    <div className={styles.run}>
      <h1>Run</h1>
      <Task
        title={props.title}
        description={props.description}
        isRun={true}
      />
    </div>
  )
}
