import React, { useEffect, useId, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { FileText, Paperclip, X } from "lucide-react"
import { EVIDENCE_ACCEPT, EVIDENCE_MAX_FILES, formatFileSize, isPdfFile, mergeEvidenceFiles } from "./evidenceFiles"
import styles from "./EvidenceFiles.module.scss"

function FileThumb({ file }) {
  const pdf = isPdfFile(file)
  const [url, setUrl] = useState("")
  useEffect(() => {
    if (pdf) return undefined
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file, pdf])
  if (pdf || !url) return <span className={styles.thumbIcon}><FileText size={18} /></span>
  return <img className={styles.thumb} src={url} alt="" />
}

FileThumb.propTypes = { file: PropTypes.object.isRequired }

/** Chọn tối đa 5 ảnh/PDF chứng cứ (tùy chọn); file không hợp lệ bị loại kèm thông báo. */
export default function EvidenceFilePicker({ value = [], onChange, disabled = false, label = "Tệp đính kèm", max = EVIDENCE_MAX_FILES, compact = false, error: externalError = "" }) {
  const id = useId()
  const [error, setError] = useState("")
  const files = useMemo(() => (Array.isArray(value) ? value : []), [value])
  const full = files.length >= max

  useEffect(() => { if (files.length === 0) setError("") }, [files.length])

  const select = event => {
    const picked = Array.from(event.target.files || [])
    event.target.value = ""
    if (picked.length === 0) return
    const result = mergeEvidenceFiles(files, picked, max)
    setError(result.error)
    onChange(result.files)
  }

  const remove = index => {
    setError("")
    onChange(files.filter((_, i) => i !== index))
  }

  const shownError = externalError || error

  return (
    <div className={`${styles.picker} ${compact ? styles.pickerCompact : ""}`.trim()}>
      {!compact && (
        <div className={styles.pickerHead}>
          <span className={styles.label}>{label}</span>
          <span className={styles.hint}>JPG, PNG, WEBP, PDF · tối đa {max} file, 5 MB/file</span>
        </div>
      )}
      <label
        htmlFor={id}
        className={`${styles.addButton} ${disabled || full ? styles.addButtonDisabled : ""}`.trim()}
        title={compact ? `Đính kèm ảnh/PDF (tối đa ${max} file, 5 MB/file)` : undefined}
      >
        <Paperclip size={15} aria-hidden="true" />
        <span>{compact ? "Đính kèm" : "Chọn file"}</span>
        {files.length > 0 && <span className={styles.count}>{files.length}/{max}</span>}
        <input
          id={id}
          className={styles.input}
          type="file"
          multiple
          accept={EVIDENCE_ACCEPT}
          disabled={disabled || full}
          onChange={select}
        />
      </label>
      {files.length > 0 && (
        <ul className={styles.pickedList}>
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`} className={styles.pickedItem}>
              <FileThumb file={file} />
              <span className={styles.fileText}>
                <span className={styles.fileName} title={file.name}>{file.name}</span>
                <span className={styles.fileMeta}>{formatFileSize(file.size)}</span>
              </span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Bỏ ${file.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {shownError && <p className={styles.error} role="alert">{shownError}</p>}
    </div>
  )
}

EvidenceFilePicker.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  max: PropTypes.number,
  compact: PropTypes.bool,
  error: PropTypes.string,
}
