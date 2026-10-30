import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material"
import { Link2, Link2Off } from "lucide-react"
import styles from "./ConfirmRelationshipDialog.module.scss"

function ConfirmRelationshipDialog({
  open,
  mode,
  school,
  supplier,
  submitting,
  onCancel,
  onConfirm,
}) {
  const fullScreen = useMediaQuery("(max-width:600px)")
  const isUnlink = mode === "unlink"

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onCancel}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { className: styles.dialogPaper } }}
    >
      <DialogTitle className={styles.title}>
        <span className={isUnlink ? styles.dangerIcon : styles.primaryIcon}>
          {isUnlink ? <Link2Off size={22} /> : <Link2 size={22} />}
        </span>
        <div>
          <strong>{isUnlink ? "Hủy liên kết nhà cung cấp" : "Xác nhận liên kết"}</strong>
          <span>{isUnlink ? "Kiểm tra thông tin trước khi hủy" : "Kiểm tra thông tin trước khi thiết lập"}</span>
        </div>
      </DialogTitle>

      <DialogContent className={styles.content}>
        <div className={styles.summary}>
          <div><span>Nhà trường</span><strong>{school?.name}</strong><small>{school?.code}</small></div>
          <div><span>Nhà cung cấp</span><strong>{supplier?.name}</strong><small>MST: {supplier?.taxCode || "—"}</small></div>
        </div>
        <p className={styles.question}>
          {isUnlink
            ? "Bạn có chắc chắn muốn hủy liên kết giữa nhà trường và nhà cung cấp này?"
            : "Bạn có chắc chắn muốn thiết lập liên kết với nhà cung cấp này?"}
        </p>
        <p className={styles.explanation}>
          {isUnlink
            ? "Thao tác kết thúc mối liên kết hiện tại. Các dữ liệu nghiệp vụ đã phát sinh vẫn được giữ nguyên."
            : "Thao tác ghi nhận mối liên kết giữa nhà trường và nhà cung cấp trên FoodPrint. Đây không phải là bước phê duyệt tài liệu hay xác lập hợp đồng."}
        </p>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button disabled={submitting} onClick={onCancel}>
          {isUnlink ? "Giữ liên kết" : "Hủy"}
        </Button>
        <Button
          variant="contained"
          color={isUnlink ? "error" : "primary"}
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting
            ? "Đang xử lý..."
            : isUnlink
              ? "Xác nhận hủy liên kết"
              : "Xác nhận liên kết"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmRelationshipDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["link", "unlink"]),
  school: PropTypes.object,
  supplier: PropTypes.object,
  submitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default ConfirmRelationshipDialog
