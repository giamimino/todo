import { Icon } from '@iconify/react'
import React from 'react'
import styles from './input.module.scss'

type Props = {
  name: string,
  placeholder: string,
  icon?: string,
}

export default function InputForm(props: Props) {
  return (
    <div className={styles.input}>
      {props.icon && <label htmlFor={props.name}><Icon icon={props.icon} /></label>}
      <input type={props.name} name={props.name} id={props.name} placeholder={props.placeholder} />
    </div>
  )
}
