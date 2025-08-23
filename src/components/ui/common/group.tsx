'use client'
import React from 'react'
import styles from '../groups.module.scss'

type Props = {
  title: string,
  id: string,
  fill?: boolean,
  onSelect: (group: string, groupId: string) => void,
  onClick: (id: string) => void
}

function Group(props: Props) {

  function handleClick() {
    if (props.fill) {
      props.onClick(props.id)
    } else {
      props.onSelect(props.title, props.id)
    }
  }
  
  return (
    <button onClick={handleClick} className={`${styles.button} ${props.fill ? styles.fill : ''}`}>
      <h1>{props.title}</h1>
    </button>
  )
}

export default React.memo(Group)