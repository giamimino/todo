'use client'
import React from 'react'
import styles from '../groups.module.scss'

type Props = {
  title: string,
  fill?: boolean,
  onSelect: (group: string) => void
}

export default function Group(props: Props) {
  return (
    <button onClick={() => props.onSelect(props.title)} className={`${styles.button} ${props.fill ? styles.fill : ''}`}>
      <h1>{props.title}</h1>
    </button>
  )
}
