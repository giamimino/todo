import React from 'react'
import Image from 'next/image'
import styles from './style.module.scss'
import { useRouter } from 'next/navigation'

type Props = {
  name: string,
  iamge: string
}

function WelcomeWrapper(props: Props) {
  const router = useRouter()

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
        onClick={() => router.push('/home/profile')}
        priority
      />
    </div>
  )
}

export default React.memo(WelcomeWrapper);