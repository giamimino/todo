import React from 'react'
import styles from '../style.module.scss'

type Props = {
  total: number,
  curTotal: number
}

type StaticProps = {
  title: string,
  num: number,
}

export default function Statistic(props: Props) {
  return (
    <div className={styles.statistic}>
      <h1>Statistic</h1>
      <div>
        <Static
          num={props.curTotal}
          title={'Current task'}
        />
        <Static
          num={props.total}
          title={'Total task'}
        />
      </div>
    </div>
  )
}

function Static(props: StaticProps) {
  return (
    <div className={styles.static}>
      <h1>{props.num}</h1>
      <p>{props.title}</p>
    </div>
  )
}