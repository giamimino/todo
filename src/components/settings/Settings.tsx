import { Icon } from '@iconify/react'
import React from 'react'
import styles from './style.module.scss'

type Props = {
  getBack: () => void,
  onThemeChange: (theme: string) => void,
  theme: boolean,
}

export default function Settings(props: Props) {

  const handleDarkTheme = (value: boolean) => 
    props.onThemeChange(value ? 'dark' : 'light');
  return (
    <div className={styles.settings}>
      <header>
        <button onClick={() => props.getBack()}>
          <Icon 
            icon={'pajamas:go-back'}
          />
        </button>
        <h1>Setting</h1>
        <span></span>
      </header>
      <div>
        <h1>Gerenal</h1>
        <div>
          <div>
            <Icon
              icon={'iconoir:half-moon'}
            />
            <span>
              Dark theme
            </span>
          </div>
          <input 
          type='checkbox' 
          id='toggle' 
          onChange={(e) => handleDarkTheme(e.currentTarget.checked)} 
          checked={props.theme} />
          <label htmlFor="toggle">
            <span></span>
          </label>
        </div>
      </div>
    </div>
  )
}
