'use client'
import React, { useEffect, useState } from 'react'
import styles from './groups.module.scss'
import Group from './common/group';
import { useSearchParams } from 'next/navigation';

type Props = {
  groupTitle?: string
}

export default function Groups(props: Props) {
  const searchParam = useSearchParams()
  const [PGroup, setPGroup] = useState("")

  useEffect(() => {
    const param = searchParam.get('group') as string
    if(!param) {
      setPGroup('aii')
    } else {
      setPGroup(param)
    }
  }, [searchParam])
  
  const GROUPS = [
    { name: "aii" },
  ];

  return (
    <div className={`${styles.groups}`}>
      {GROUPS.map((group) => (
        <Group
          key={group.name}
          title={group.name}
          fill={PGroup === group.name ? true : false}
        />
      ))}
    </div>
  )
}
