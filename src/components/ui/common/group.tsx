'use client'
import React from 'react'
import styles from '../groups.module.scss'

type Props = {
  title: string,
  fill?: boolean,
  onSelect: (group: string) => void,
  onClick: (title: string) => void
}

export default function Group(props: Props) {

  function handleClick() {
    if (props.fill) {
      props.onClick(props.title)
    } else {
      props.onSelect(props.title)
    }
  }
  
  return (
    <button onClick={handleClick} className={`${styles.button} ${props.fill ? styles.fill : ''}`}>
      <h1>{props.title}</h1>
    </button>
  )
}
