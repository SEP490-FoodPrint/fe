import React from "react"
import styles from "./RequestFields.module.scss"

export default function RequestFields({ fields, columns = 2 }) {
  return (
    <dl className={`${styles.fields} ${columns === 1 ? styles.single : ""}`}>
      {fields.map(({ label, value }) => <div className={styles.field} key={label}><dt>{label}</dt><dd>{value ?? "Chưa cung cấp"}</dd></div>)}
    </dl>
  )
}
