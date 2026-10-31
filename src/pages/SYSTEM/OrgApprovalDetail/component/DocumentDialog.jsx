import React, { useEffect, useState } from "react"
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, useMediaQuery } from "@mui/material"
import { formatRequestDate } from "src/lib/registration"
import CloseIcon from "@mui/icons-material/Close"
import RegistrationService from "src/services/RegistrationService"
import styles from "./DocumentDialog.module.scss"

function documentUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value, window.location.origin)
    return ["https:", "http:", "blob:"].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

export default function DocumentDialog({ document, organization, onClose }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(null)
  const [retry, setRetry] = useState(0)
  const identity = document ? `${document.request_id || "legacy"}/${document.id || document.url || ""}` : ""
  useEffect(() => {
    setPreview(null); setFailed(false); setError("")
    if (!document || document.is_demo) { setLoading(false); return }
    setLoading(true)
    const controller = new AbortController()
    if (document.request_id && document.id) {
      RegistrationService.getDocument(document.request_id, document.id, { signal: controller.signal })
        .then(result => { if (!controller.signal.aborted) setPreview({ identity, url: result.url }) })
        .catch(error => { if (!controller.signal.aborted) { setFailed(true); setLoading(false); setError(error.message || "Không thể tải tài liệu.") } })
    } else {
      setPreview({ identity, url: document.url }); setLoading(Boolean(documentUrl(document.url)))
    }
    return () => controller.abort()
  }, [document, identity, retry])
  const isImage = document?.mime_type?.startsWith("image/")
  const url = preview?.identity === identity ? documentUrl(preview.url) : null
  return (
    <Dialog open={Boolean(document)} onClose={onClose} maxWidth={false} transitionDuration={reducedMotion ? 0 : undefined} className={styles.dialog} aria-labelledby="document-dialog-title">
      <DialogTitle id="document-dialog-title" className={styles.title}>Xem tệp minh chứng<IconButton onClick={onClose} aria-label="Đóng tệp minh chứng"><CloseIcon /></IconButton></DialogTitle>
      <DialogContent className={styles.content}>
        <p className={styles.muted}>{document?.file_name && `${document.file_name} · `}{isImage ? "Hình ảnh" : "Tài liệu PDF"}{document?.is_demo ? " · Bản minh họa" : ""}</p>
        {document?.is_demo ? <div className={styles.preview}>
          <article className={styles.paper} aria-label="Minh chứng minh họa">
            <p className={styles.watermark}>MINH CHỨNG MINH HỌA</p><h3>GIẤY CHỨNG NHẬN</h3><p className={styles.certificateName}>{document.name}</p><p>{organization}</p>
            <dl><div className={styles.full}><dt>Số chứng nhận</dt><dd>{document.number}</dd></div><div><dt>Ngày cấp</dt><dd>{formatRequestDate(document.issued_at)}</dd></div><div><dt>Ngày hết hạn</dt><dd>{formatRequestDate(document.expires_at)}</dd></div></dl>
            <p className={styles.muted}>Nội dung mẫu dùng để xem bố cục tệp minh chứng.</p><div className={styles.sample}>MẪU</div>
          </article>
        </div> : !url && loading ? <div role="status" aria-live="polite"><CircularProgress size={28} /><span>Đang tải tệp…</span></div> : !url || failed ? <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{error || "Không thể xem tệp này."}{url && <Button component="a" href={url} target="_blank" rel="noopener noreferrer">Mở tệp gốc</Button>}</Alert> : <div className={styles.realPreview}>
          {loading && <div className={styles.loading} role="status"><CircularProgress size={28} /><span>Đang tải tệp…</span></div>}
          {isImage ? <img key={url} src={url} referrerPolicy="no-referrer" alt={document?.file_name || document?.name || "Tệp minh chứng"} onLoad={() => setLoading(false)} onError={() => { setFailed(true); setLoading(false) }} />
            : <iframe key={url} src={url} referrerPolicy="no-referrer" title={document?.file_name || document?.name || "Tài liệu minh chứng"} onLoad={() => setLoading(false)} onError={() => { setFailed(true); setLoading(false) }} />}
          <Button component="a" href={url} target="_blank" rel="noopener noreferrer">Mở tệp gốc</Button>
          <Button onClick={() => setRetry(value => value + 1)}>Tải lại</Button>
        </div>}
      </DialogContent>
    </Dialog>
  )
}
