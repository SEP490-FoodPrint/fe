import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material"
import {
  Close,
  DownloadOutlined,
  ErrorOutlineOutlined,
  OpenInNewOutlined,
  ReplayOutlined,
} from "@mui/icons-material"
import SupplierSchoolService, {
  extractBlobError,
  formatFileSize,
  getDocumentKindLabel,
} from "src/services/SupplierSchoolService"
import styles from "./DocumentPreviewModal.module.scss"

function DocumentPreviewModal({
  open,
  schoolId,
  contractId,
  document: doc,
  downloading = false,
  onDownload,
  onClose,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [resolvedMime, setResolvedMime] = useState("")
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    if (!open || !schoolId || !contractId || !doc?.id) {
      setPreviewUrl("")
      setError(null)
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    let activeObjectUrl = ""

    setLoading(true)
    setError(null)
    setPreviewUrl("")

    SupplierSchoolService.getDocumentContent({
      schoolId,
      contractId,
      documentId: doc.id,
      disposition: "inline",
      mimeType: doc.mimeType,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        activeObjectUrl = URL.createObjectURL(result.blob)
        setResolvedMime(result.mimeType)
        setPreviewUrl(activeObjectUrl)
      })
      .catch(async failure => {
        if (failure?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        const parsed = await extractBlobError(
          failure,
          "Không thể mở xem tệp tài liệu này.",
        )
        if (!controller.signal.aborted) {
          setError(parsed)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl)
      }
    }
  }, [open, schoolId, contractId, doc?.id, doc?.mimeType, reloadTick])

  const effectiveMime = resolvedMime || doc?.mimeType || ""
  const isImage = effectiveMime.startsWith("image/")

  const handleOpenNewTab = () => {
    if (!previewUrl) return
    window.open(previewUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="document-preview-dialog-title"
      slotProps={{
        paper: { className: styles.dialogPaper },
      }}
    >
      <DialogTitle
        id="document-preview-dialog-title"
        className={styles.dialogHeader}
      >
        <div className={styles.headerMeta}>
          <span className={styles.fileName}>
            {doc?.fileName || "Tệp tài liệu"}
          </span>
          {doc ? (
            <span className={styles.fileKindPill}>
              {getDocumentKindLabel(doc.kind)} · {formatFileSize(doc.size)}
            </span>
          ) : null}
        </div>
        <IconButton
          type="button"
          className={styles.closeIconBtn}
          onClick={onClose}
          aria-label="Đóng cửa sổ xem tệp"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {loading ? (
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>Đang tải nội dung tệp...</p>
          </div>
        ) : error ? (
          <div className={styles.stateBox} role="alert">
            <div className={styles.errorIconWrap} aria-hidden="true">
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.stateTitle}>Không thể đọc nội dung tệp</p>
            <p className={styles.stateDesc}>{error.message}</p>
            {error.status !== 404 && error.status !== 403 ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.retryBtn}
                onClick={() => setReloadTick(prev => prev + 1)}
              >
                Thử lại
              </Button>
            ) : null}
          </div>
        ) : previewUrl ? (
          isImage ? (
            <div className={styles.imageStage}>
              <img
                src={previewUrl}
                alt={doc?.fileName || "Bản xem trước tài liệu"}
                className={styles.previewImage}
              />
            </div>
          ) : (
            <iframe
              src={previewUrl}
              title={doc?.fileName || "Xem trước tệp PDF"}
              className={styles.pdfFrame}
            />
          )
        ) : null}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        {previewUrl ? (
          <div className={styles.actionGroupLeft}>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              startIcon={<OpenInNewOutlined />}
              className={styles.secondaryBtn}
              onClick={handleOpenNewTab}
            >
              Mở tab mới
            </Button>
          </div>
        ) : (
          <span />
        )}

        <div className={styles.actionGroupRight}>
          {doc ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<DownloadOutlined />}
              disabled={downloading}
              className={styles.primaryBtn}
              onClick={() => onDownload?.(contractId, doc)}
            >
              {downloading ? "Đang tải..." : "Tải về"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outlined"
            className={styles.closeBtn}
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}

DocumentPreviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  schoolId: PropTypes.string,
  contractId: PropTypes.string,
  document: PropTypes.shape({
    id: PropTypes.string,
    kind: PropTypes.string,
    fileName: PropTypes.string,
    mimeType: PropTypes.string,
    size: PropTypes.number,
  }),
  downloading: PropTypes.bool,
  onDownload: PropTypes.func,
  onClose: PropTypes.func.isRequired,
}

export default DocumentPreviewModal
