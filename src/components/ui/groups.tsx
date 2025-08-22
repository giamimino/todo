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
  onFilter: (groupId: string) => void
  onError: (error: string) => void
  onClick: (id: string) => void
  isFavorite: boolean
}

export default function Groups({ groupTitle, userId, onAdd, onFilter, onError, onClick, isFavorite }: Props) {
  const [PGroup, setPGroup] = useState('AII')

  const groups = useMemo(() => {
    return [
      { name: "AII", id:"AII" },
      ...(groupTitle?.filter(g => g.title !== "AII").map(g => ({ name: g.title, id: g.id })) ?? [])
    ]
  }, [groupTitle])

  function handleSelect(group: string,  groupId: string) {
    setPGroup(group)
    onFilter(groupId)
  }

  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <Group
          key={group.name}
          id={group.id}
          title={group.name}
          fill={PGroup === group.name}
          onSelect={handleSelect}
          onClick={onClick}
        />
      ))}
      {isFavorite && (
        <Group
          key={'favorite-group'}
          title='Favorites'
          id={'Favorites'}
          fill={PGroup === 'Favorites'}
          onSelect={handleSelect}
          onClick={onClick}
        />
      )}
      <AddGroup
        userId={userId}
        onAdd={onAdd}
        onError={onError}
      />
    </div>
  )
}
