import React from 'react'
import Image from 'next/image'
import styles from './style.module.scss'

type Props = {
  name: string,
  iamge: string
}

export default function WelcomeWrapper(props: Props) {
  return (
    <div className={styles.welcome}>
      <div>
        <p>Welcome back</p>
        <h1>{props.name}</h1>
      </div>
      <Image 
        src={props.iamge}
        alt={props.name}
        width={54}
        height={54}
        objectFit='cover'
      />
    </div>
  )
}
