'use client'
import React, { useEffect, useMemo, useState } from 'react'
import styles from './groups.module.scss'
import Group from './common/group'
import { useSearchParams } from 'next/navigation'
import AddGroup from '../addGroup/AddGroup'

type Group = { title: string }
type Props = {
  groupTitle?: Group[]
  userId: string
  onAdd: (group: string) => void
  onFilter: (group: string) => void
  onError: (error: string) => void
}

export default function Groups({ groupTitle, userId, onAdd, onFilter, onError }: Props) {
  const searchParam = useSearchParams()
  const groupParam = searchParam.get("group") ?? "AII"
  const [PGroup, setPGroup] = useState(groupParam)

  const groups = useMemo(() => {
    return [
      { name: "AII" },
      ...(groupTitle?.filter(g => g.title !== "AII").map(g => ({ name: g.title })) ?? [])
    ]
  }, [groupTitle])

  function handleAddGroup(newGroupName: string) {
    onAdd(newGroupName)
  }

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
        />
      ))}
      <AddGroup
        userId={userId}
        onAdd={handleAddGroup}
        onError={onError}
      />
    </div>
  )
}
