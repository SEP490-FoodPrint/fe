import React, { useRef } from "react"
import { Button, IconButton } from "@mui/material"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./DocumentUpload.module.scss"

export default function DocumentUpload({ id, title, label, files, onChange, error, multiple = false, existingDocuments = [], onRemoveExisting, disabled = false }) {
  const input = useRef(null)
  return <div className={styles.field}>
    <label id={`${id}-label`} htmlFor={`${id}-input`}>{title}</label>
    <input ref={input} id={`${id}-input`} type="file" accept="application/pdf,image/png,image/jpeg" className={styles.nativeInput} multiple={multiple} disabled={disabled} onChange={event => { onChange(Array.from(event.target.files || [])); event.target.value = "" }} />
    <Button id={id} type="button" variant="outlined" disabled={disabled} className={styles.picker} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} aria-labelledby={`${id}-label ${id}-action`} onClick={() => input.current?.click()}>
      <FileUploadOutlinedIcon aria-hidden="true" /><span id={`${id}-action`}>{label}</span><span className={styles.filename}>{files.length ? `${files.length} tệp được chọn` : existingDocuments.length ? "Tệp đã tải lên được giữ lại" : "Chưa có tệp được chọn"}</span>
    </Button>
    {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
    {!files.length && !!existingDocuments.length && <ul className={styles.files}>{existingDocuments.map(document => <li key={document.id}><span>{document.fileName} · Đã tải lên</span><IconButton type="button" disabled={disabled} onClick={() => onRemoveExisting(document.id)} aria-label={`Bỏ tệp ${document.fileName}`}><CloseIcon /></IconButton></li>)}</ul>}
    {!!files.length && <ul className={styles.files}>{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><IconButton type="button" disabled={disabled} onClick={() => onChange(files.filter((_, current) => current !== index))} aria-label={`Bỏ tệp ${file.name}`}><CloseIcon /></IconButton></li>)}</ul>}
  </div>
}
