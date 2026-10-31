import React, { useEffect, useRef } from "react"
import { Alert } from "@mui/material"
import styles from "./AuthForm.module.scss"

export default function FormErrors({ errors, message }) {
  const summary = useRef(null)
  const entries = Object.entries(errors || {})
  useEffect(() => { if (entries.length || message) summary.current?.focus() }, [errors, message])
  if (!entries.length && !message) return null
  return <Alert severity="error" tabIndex={-1} ref={summary} className={styles.feedback}>
    {message || "Vui lòng kiểm tra lại thông tin:"}
    {!!entries.length && <ul>{entries.map(([id, text]) => <li key={id}><a href={`#${id}`} onClick={event => { event.preventDefault(); document.getElementById(id)?.focus() }}>{text}</a></li>)}</ul>}
  </Alert>
}
