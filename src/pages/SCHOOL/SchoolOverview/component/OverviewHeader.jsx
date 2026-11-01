import React from "react"
import styles from "./OverviewHeader.module.scss"

function OverviewHeader() {
  return (
    <section className={styles.header}>
      <div className={styles.headingGroup}>
        <h1>Tổng quan vận hành bán trú</h1>
      </div>
    </section>
  )
}

export default OverviewHeader
