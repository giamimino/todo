import React from 'react'
import styles from './style.module.scss'
import Image from 'next/image'

type Props = {
  image: string,
  name: string,

}

export default function Profile(props: Props) {
  return (
    <div className={styles.profile}>
      <Image
        src={props.image}
        alt='profile-image'
        width={84}
        height={84}
      />
      <h1>{props.name}</h1>
    </div>
  )
}
