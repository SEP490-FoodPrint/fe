import React, { useEffect, useState } from "react"
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, useMediaQuery } from "@mui/material"
import { formatRequestDate } from "src/lib/registration"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./DocumentDialog.module.scss"

function documentUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value, window.location.origin)
    return ["https:", "http:", "blob:"].includes(url.protocol) ? url.href : null
  } catch { return null }
}

export default function DocumentDialog({ document, organization, onClose }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => { setLoading(true); setFailed(false) }, [document])
  const isImage = document?.mime_type?.startsWith("image/")
  const url = documentUrl(document?.url)
  return (
    <Dialog open={Boolean(document)} onClose={onClose} maxWidth={false} transitionDuration={reducedMotion ? 0 : undefined} className={styles.dialog} aria-labelledby="document-dialog-title">
      <DialogTitle id="document-dialog-title" className={styles.title}>Xem tệp minh chứng<IconButton onClick={onClose} aria-label="Đóng tệp minh chứng"><CloseIcon /></IconButton></DialogTitle>
      <DialogContent className={styles.content}>
        <p className={styles.muted}>{isImage ? "Hình ảnh" : "Tài liệu PDF"}{document?.is_demo ? " · Bản minh họa" : ""}</p>
        {document?.is_demo ? <div className={styles.preview}>
          <article className={styles.paper} aria-label="Minh chứng minh họa">
            <p className={styles.watermark}>MINH CHỨNG MINH HỌA</p><h3>GIẤY CHỨNG NHẬN</h3><p className={styles.certificateName}>{document.name}</p><p>{organization}</p>
            <dl><div className={styles.full}><dt>Số chứng nhận</dt><dd>{document.number}</dd></div><div><dt>Ngày cấp</dt><dd>{formatRequestDate(document.issued_at)}</dd></div><div><dt>Ngày hết hạn</dt><dd>{formatRequestDate(document.expires_at)}</dd></div></dl>
            <p className={styles.muted}>Nội dung mẫu dùng để xem bố cục tệp minh chứng.</p><div className={styles.sample}>MẪU</div>
          </article>
        </div> : !url || failed ? <Alert severity="info">Không thể xem tệp này.{url && <Button component="a" href={url} target="_blank" rel="noopener noreferrer">Mở tệp gốc</Button>}</Alert> : <div className={styles.realPreview}>
          {loading && <div className={styles.loading} role="status"><CircularProgress size={28} /><span>Đang tải tệp…</span></div>}
          {isImage ? <img src={url} alt={document?.name || "Tệp minh chứng"} onLoad={() => setLoading(false)} onError={() => { setFailed(true); setLoading(false) }} />
            : <iframe src={url} title={document?.name || "Tài liệu minh chứng"} onLoad={() => setLoading(false)} onError={() => { setFailed(true); setLoading(false) }} />}
          <Button component="a" href={url} target="_blank" rel="noopener noreferrer">Mở tệp gốc</Button>
        </div>}
      </DialogContent>
    </Dialog>
  )
}
