import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material"
import styles from "./DisposeSampleModal.module.scss"

export default function DisposeSampleModal({
  open,
  sample,
  disposeNote,
  setDisposeNote,
  onClose,
  onConfirm,
  submitting,
}) {
  if (!sample) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={styles.modalTitle}>
        Xác nhận tiêu hủy mẫu lưu thực phẩm
      </DialogTitle>
      <DialogContent className={styles.modalContent}>
        <p className={styles.modalDesc}>
          Tiêu hủy mẫu{" "}
          <strong>SMP-{sample.id.slice(0, 8).toUpperCase()}</strong> sau khi đã
          bảo đảm thời gian lưu trữ tối thiểu 24 giờ.
        </p>
        <TextField
          fullWidth
          size="small"
          label="Ghi chú tiêu hủy"
          value={disposeNote}
          onChange={(e) => setDisposeNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions className={styles.modalActions}>
        <Button onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={submitting}
        >
          {submitting ? "Đang xử lý…" : "Xác nhận tiêu hủy"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

