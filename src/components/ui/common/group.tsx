'use client'
import React from 'react'
import styles from '../groups.module.scss'
import { useRouter, useSearchParams } from 'next/navigation'

type Props = {
  title: string,
  fill?: boolean
}

export default function Group(props: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()

  function handleParam(value: string) {
    const param = new URLSearchParams(searchParams.toString())
    if(value !== 'aii') {
      param.set('group', value)
      router.push(`/home?${param.toString()}`)
    } else {
      router.push(`/home`)
    }
  }

  return (
    <button onClick={() => handleParam(props.title)} className={`${styles.button} ${props.fill ? styles.fill : ''}`}>
      <h1>{props.title}</h1>
    </button>
  )
}
