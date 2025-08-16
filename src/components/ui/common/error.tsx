import React, { useState } from 'react'
import styles from './error.module.scss'

type Props = {
  error: string,
}

export default function Error(props: Props) {
  const [enter, setEnter] = useState(true)
  const [leave, setLeave] = useState(false)

  setTimeout(() => {
    setEnter(false)
    setLeave(true)
  }, 2000)

  return (
    <div className={`${styles.error} ${enter ? styles.enter : ''} ${leave ? styles.leave : ''}`}>
      {props.error}
    </div>
  )
}
