import React from 'react'
import styles from './search.module.scss'
import InputForm from '../input'

export default function Search() {
  return (
    <div className={styles.search}>
      <InputForm 
        name='search'
        placeholder='search'
        icon='ri:search-2-line'
      />
    </div>
  )
}
