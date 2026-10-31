import React from "react"
import { Card } from "@mui/material"
import styles from "./AuthCard.module.scss"

export default function AuthCard({ children, size = "default", centered = false, ...props }) {
  return <Card component="section" variant="outlined" className={`${styles.card} ${styles[size] || ""} ${centered ? styles.centered : ""}`} {...props}>{children}</Card>
}

export function AuthHeading({ eyebrow, title, description }) {
  return <div className={styles.heading}>
    <p className={styles.eyebrow}>{eyebrow}</p>
    <h1>{title}</h1>
    {description && <p className={styles.description}>{description}</p>}
  </div>
}

export function AuthStatusIcon({ children, tone = "success" }) {
  return <div className={styles.iconRow} aria-hidden="true"><span className={`${styles.statusIcon} ${styles[tone] || ""}`}>{children}</span></div>
}
