import React from 'react'
import styles from './search.module.scss'
import InputForm from '../input'

function Search({ onChange }: { onChange: (value: string) => void }) {
  function handleChange(value: string) {
    onChange(value)
  }
  return (
    <div className={styles.search}>
      <InputForm 
        name='search'
        placeholder='search'
        icon='ri:search-2-line'
        onChange={handleChange}
      />
    </div>
  )
}

export default React.memo(Search)