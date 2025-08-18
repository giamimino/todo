'use client'
import React, { useMemo, useState } from 'react'
import styles from './groups.module.scss'
import Group from './common/group'
import AddGroup from '../addGroup/AddGroup'

type Group = { id: string, title: string }
type Props = {
  groupTitle?: Group[]
  userId: string
  onAdd: (group: string, id: string) => void
  onFilter: (group: string) => void
  onError: (error: string) => void
  onClick: (title: string) => void
}

export default function Groups({ groupTitle, userId, onAdd, onFilter, onError, onClick }: Props) {
  const [PGroup, setPGroup] = useState('AII')

  const groups = useMemo(() => {
    return [
      { name: "AII" },
      ...(groupTitle?.filter(g => g.title !== "AII").map(g => ({ name: g.title })) ?? [])
    ]
  }, [groupTitle])

  function handleSelect(group: string) {
    setPGroup(group)
    onFilter(group)
  }

  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <Group
          key={group.name}
          title={group.name}
          fill={PGroup === group.name}
          onSelect={handleSelect}
          onClick={onClick}
        />
      ))}
      <AddGroup
        userId={userId}
        onAdd={onAdd}
        onError={onError}
      />
    </div>
  )
}
