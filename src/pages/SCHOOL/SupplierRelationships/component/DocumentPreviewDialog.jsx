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
  useMediaQuery,
} from "@mui/material"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileWarning,
  Minus,
  Plus,
  X,
} from "lucide-react"
import styles from "./DocumentPreviewDialog.module.scss"

const formatDate = value =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "Không có"

function DocumentPreviewDialog({ open, document, supplierName, onClose, onDownload }) {
  const fullScreen = useMediaQuery("(max-width:600px)")
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    if (!open) return undefined
    setLoading(true)
    setPage(1)
    setZoom(100)
    const timer = window.setTimeout(() => setLoading(false), 420)
    return () => window.clearTimeout(timer)
  }, [document?.id, open])

  const pageCount = document?.pageCount || 1
  const supported = ["pdf", "image"].includes(document?.fileType)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={false}
      fullWidth
      slotProps={{ paper: { className: styles.dialogPaper } }}
    >
      <DialogTitle className={styles.titleBar}>
        <div>
          <span>Xem tài liệu</span>
          <strong>{document?.certificationType || "Tài liệu nhà cung cấp"}</strong>
        </div>
        <IconButton onClick={onClose} aria-label="Đóng trình xem tài liệu">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <div className={styles.metadata}>
        <div><span>Nhà cung cấp</span><strong>{supplierName}</strong></div>
        <div><span>Số chứng nhận</span><strong>{document?.certificateNo || "Không có"}</strong></div>
        <div><span>Ngày cấp</span><strong>{formatDate(document?.issuedDate)}</strong></div>
        <div><span>Ngày hết hạn</span><strong>{formatDate(document?.expiryDate)}</strong></div>
      </div>

      <div className={styles.viewerToolbar}>
        <div>
          <IconButton
            size="small"
            disabled={page <= 1}
            onClick={() => setPage(current => Math.max(1, current - 1))}
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </IconButton>
          <span>Trang {page} / {pageCount}</span>
          <IconButton
            size="small"
            disabled={page >= pageCount}
            onClick={() => setPage(current => Math.min(pageCount, current + 1))}
            aria-label="Trang sau"
          >
            <ChevronRight size={18} />
          </IconButton>
        </div>
        <div>
          <IconButton
            size="small"
            disabled={zoom <= 70}
            onClick={() => setZoom(current => Math.max(70, current - 10))}
            aria-label="Thu nhỏ"
          >
            <Minus size={17} />
          </IconButton>
          <span>{zoom}%</span>
          <IconButton
            size="small"
            disabled={zoom >= 140}
            onClick={() => setZoom(current => Math.min(140, current + 10))}
            aria-label="Phóng to"
          >
            <Plus size={17} />
          </IconButton>
        </div>
      </div>

      <DialogContent className={styles.viewer}>
        {loading ? (
          <div className={styles.viewerState}>
            <CircularProgress size={30} />
            <span>Đang tải bản xem trước...</span>
          </div>
        ) : !document?.documentUrl ? (
          <div className={styles.viewerState}>
            <FileWarning size={34} />
            <strong>Không có tệp tài liệu</strong>
            <span>Hồ sơ này chưa có tệp để xem trước.</span>
          </div>
        ) : !supported ? (
          <div className={styles.viewerState}>
            <FileWarning size={34} />
            <strong>Không hỗ trợ xem trước định dạng này</strong>
            <span>Bạn có thể đóng trình xem và quay lại hồ sơ nhà cung cấp.</span>
          </div>
        ) : (
          <div className={styles.canvasScroller}>
            <article
              className={styles.documentCanvas}
              style={{ transform: `scale(${zoom / 100})` }}
              aria-label="Bản xem trước tài liệu mẫu"
            >
              <div className={styles.sampleBanner}>NỘI DUNG MẪU · KHÔNG CÓ GIÁ TRỊ PHÁP LÝ</div>
              <p className={styles.documentLabel}>HỒ SƠ NHÀ CUNG CẤP</p>
              <h2>{document.certificationType}</h2>
              <p className={styles.documentNumber}>Số tham chiếu: {document.certificateNo}</p>
              <div className={styles.documentRule} />
              <dl>
                <div><dt>Đơn vị cung cấp hồ sơ</dt><dd>{supplierName}</dd></div>
                <div><dt>Ngày cấp được khai báo</dt><dd>{formatDate(document.issuedDate)}</dd></div>
                <div><dt>Ngày hết hạn được khai báo</dt><dd>{formatDate(document.expiryDate)}</dd></div>
              </dl>
              <p className={styles.disclaimer}>
                Đây là bản mô phỏng không nhạy cảm phục vụ thiết kế giao diện. Việc hiển thị tài liệu không đồng nghĩa tài liệu đã được xác minh, phê duyệt hoặc xác nhận giá trị pháp lý.
              </p>
              <footer>Trang mẫu {page} / {pageCount}</footer>
            </article>
          </div>
        )}
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={onClose}>Đóng</Button>
        {document?.downloadAllowed && (
          <Button variant="outlined" startIcon={<Download size={17} />} onClick={onDownload}>
            Tải xuống
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

DocumentPreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  document: PropTypes.object,
  supplierName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
}

export default DocumentPreviewDialog
