import React from "react"
import PropTypes from "prop-types"
import { ExternalLink, FileText } from "lucide-react"
import { formatFileSize, isPdfFile, normalizeAttachments } from "./evidenceFiles"
import styles from "./EvidenceFiles.module.scss"

/** Danh sách file đã gửi (chỉ xem). Link là URL ký có hạn ngắn, mở ở tab mới. */
export default function EvidenceAttachmentList({ attachments, title = "", emptyText = "", className = "" }) {
  const items = normalizeAttachments(attachments)
  if (items.length === 0) return emptyText ? <p className={styles.empty}>{emptyText}</p> : null
  const images = items.filter(item => !isPdfFile(item) && item.url)
  const others = items.filter(item => isPdfFile(item) || !item.url)

  return (
    <div className={`${styles.attachments} ${className}`.trim()}>
      {title && <p className={styles.attachmentsTitle}>{title} ({items.length})</p>}
      {images.length > 0 && (
        <ul className={styles.imageGrid}>
          {images.map(item => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.imageLink} title={item.fileName}>
                <img src={item.url} alt={item.fileName} loading="lazy" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {others.length > 0 && (
        <ul className={styles.fileList}>
          {others.map(item => {
            const body = (
              <>
                <span className={styles.thumbIcon}><FileText size={18} /></span>
                <span className={styles.fileText}>
                  <span className={styles.fileName} title={item.fileName}>{item.fileName}</span>
                  <span className={styles.fileMeta}>{item.url ? formatFileSize(item.sizeBytes) : "Chưa mở được tệp, tải lại trang để thử lại"}</span>
                </span>
                {item.url && <ExternalLink size={14} className={styles.openIcon} aria-hidden="true" />}
              </>
            )
            return (
              <li key={item.id}>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.fileRow}>{body}</a>
                ) : (
                  <span className={`${styles.fileRow} ${styles.fileRowDisabled}`}>{body}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

EvidenceAttachmentList.propTypes = {
  attachments: PropTypes.array,
  title: PropTypes.string,
  emptyText: PropTypes.string,
  className: PropTypes.string,
}
