import React from 'react'
import styles from './error.module.scss'

type Props = {
  error: string,
}

export default function Error(props: Props) {
  return (
    <div className={`${styles.error} ${styles.enter} ${styles.leave}`}>
      {props.error}
    </div>
  )
}
