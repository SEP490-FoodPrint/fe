import React from "react"
import { AlertTriangle, Lock, Unlock, KeyRound, Trash2, X } from "lucide-react"
import styles from "./ConfirmDialog.module.scss"

/**
 * ConfirmDialog - Modal xác nhận hành động nguy hiểm hoặc quan trọng
 * - Khóa / Mở khóa
 * - Đặt lại mật khẩu
 * - Xóa tài khoản
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  type = "LOCK", // "LOCK" | "UNLOCK" | "RESET_PASSWORD" | "DELETE"
  account,
}) {
  if (!isOpen || !account) return null

  const config = {
    LOCK: {
      icon: <Lock size={22} />,
      iconTheme: "warning",
      title: "Tạm khóa tài khoản",
      message: (
        <>
          Bạn có chắc chắn muốn tạm khóa tài khoản <strong>{account.fullName}</strong> (
          <code>{account.code}</code>)? Tài khoản sẽ không thể đăng nhập vào hệ thống trường học
          cho đến khi được mở lại.
        </>
      ),
      confirmText: "Khóa tài khoản",
      confirmTheme: "warning",
    },
    UNLOCK: {
      icon: <Unlock size={22} />,
      iconTheme: "success",
      title: "Mở khóa tài khoản",
      message: (
        <>
          Bạn có chắc chắn muốn mở khóa cho tài khoản <strong>{account.fullName}</strong> (
          <code>{account.code}</code>)? Người dùng sẽ có thể đăng nhập bình thường.
        </>
      ),
      confirmText: "Mở khóa ngay",
      confirmTheme: "success",
    },
    RESET_PASSWORD: {
      icon: <KeyRound size={22} />,
      iconTheme: "primary",
      title: "Đặt lại mật khẩu",
      message: (
        <>
          Hệ thống sẽ đặt lại mật khẩu mặc định (<code>123456</code>) hoặc gửi liên kết đặt lại mật
          khẩu đến email <strong>{account.email}</strong> của tài khoản{" "}
          <strong>{account.fullName}</strong>.
        </>
      ),
      confirmText: "Xác nhận đặt lại",
      confirmTheme: "primary",
    },
    DELETE: {
      icon: <Trash2 size={22} />,
      iconTheme: "danger",
      title: "Xác nhận xóa tài khoản",
      message: (
        <>
          Bạn có chắc chắn muốn xóa tài khoản <strong>{account.fullName}</strong> (
          <code>{account.code}</code>)? Hành động này không thể hoàn tác và mọi liên kết phân quyền
          sẽ bị hủy.
        </>
      ),
      confirmText: "Xóa vĩnh viễn",
      confirmTheme: "danger",
    },
  }[type] || {}

  return (
    <div className={styles.dialogOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialogCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <div className={`${styles.iconWrap} ${styles[`icon_${config.iconTheme}`]}`}>
            {config.icon}
          </div>
          <div className={styles.titleWrap}>
            <h3 className={styles.dialogTitle}>{config.title}</h3>
            <p className={styles.dialogMessage}>{config.message}</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.dialogFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles[`btn_${config.confirmTheme}`]}`}
            onClick={() => {
              onConfirm(account, type)
              onClose()
            }}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
