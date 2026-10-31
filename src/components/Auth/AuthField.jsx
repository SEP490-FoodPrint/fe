import React, { useRef, useState } from "react"
import { IconButton, InputAdornment, TextField } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import styles from "./AuthField.module.scss"

export default function AuthField({ id, label, type = "text", required = false, error, hint, inputProps, ...props }) {
  const [visible, setVisible] = useState(false)
  const input = useRef(null)
  const password = type === "password"
  const date = type === "date"
  const pickDate = () => { input.current?.focus(); try { input.current?.showPicker?.() } catch { /* Date remains editable with the keyboard. */ } }
  return <div className={styles.field}>
    <label htmlFor={id}>{label}{required && " *"}</label>
    <div className={`${styles.control} ${date ? styles.date : ""} ${date && !props.value ? styles.emptyDate : ""}`}>
      {date && !props.value && <span className={styles.datePlaceholder} aria-hidden="true">Chọn {label.toLowerCase()}</span>}
      <TextField {...props} inputRef={input} id={id} name={props.name || id} type={password && visible ? "text" : type} required={required} error={Boolean(error)} fullWidth size="small" className={styles.input}
        helperText={error || hint} slotProps={{ htmlInput: { ...inputProps }, input: password || date ? { endAdornment: <InputAdornment position="end">{date ? <IconButton type="button" className={styles.visibility} aria-label={`Chọn ${label.toLowerCase()}`} onClick={pickDate}><CalendarTodayOutlinedIcon /></IconButton> : <IconButton type="button" className={styles.visibility} aria-label={`${visible ? "Ẩn" : "Hiện"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(value => !value)} edge="end">{visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton>}</InputAdornment> } : undefined }} />
    </div>
  </div>
}
