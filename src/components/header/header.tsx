import React from 'react'
import styles from './style.module.scss'
import { Icon } from '@iconify/react'

export default function Header({getSettings} : {getSettings: () => void}) {
  return (
    <div className={styles.header}>
      <span></span>
      <h1>Home</h1>
      <button className='cursor-pointer' onClick={() => getSettings()}>
        <Icon 
          icon={"solar:settings-outline"}
        />
      </button>
    </div>
  )
}
