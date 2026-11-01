import React, { useState } from "react"
import { CheckCircle2, Copy, Check, Plus, ArrowRight } from "lucide-react"
import {
  getDepartmentConfig,
  DEFAULT_INITIAL_PASSWORD,
} from "../../Accounts/mockAccountsData"
import styles from "./SuccessModal.module.scss"

function SuccessModal({ isOpen, createdAccount, onCreateAnother, onGoToList }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !createdAccount) return null

  const deptConfig = getDepartmentConfig(createdAccount.departmentId)

  // Sao chép nhanh thông tin tài khoản
  const handleCopyCredentials = () => {
    const textToCopy = `Thông tin tài khoản phòng ban:
- Họ và tên: ${createdAccount.fullName}
- Mã nhân viên: ${createdAccount.code}
- Phòng ban: ${deptConfig.label}
- Email / Đăng nhập: ${createdAccount.email}
- Số điện thoại: ${createdAccount.phone}
- Mật khẩu khởi tạo: ${DEFAULT_INITIAL_PASSWORD}`

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconBox}>
          <CheckCircle2 size={32} />
        </div>

        <h2 className={styles.title}>Tạo tài khoản thành công!</h2>
        <p className={styles.description}>
          Tài khoản cho nhân sự đã được thêm vào hệ thống quản lý trường học.
        </p>

        {/* Thông tin tóm tắt */}
        <div className={styles.summaryBox}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Mã nhân viên:</span>
            <span className={`${styles.summaryValue} ${styles.codeHighlight}`}>
              {createdAccount.code}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Họ và tên:</span>
            <span className={styles.summaryValue}>{createdAccount.fullName}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Phòng ban:</span>
            <span
              className={styles.summaryValue}
              style={{ color: deptConfig.color }}
            >
              {deptConfig.label}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Email:</span>
            <span className={styles.summaryValue}>{createdAccount.email}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Số điện thoại:</span>
            <span className={styles.summaryValue}>{createdAccount.phone}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Mật khẩu khởi tạo:</span>
            <span className={`${styles.summaryValue} ${styles.passHighlight}`}>
              {DEFAULT_INITIAL_PASSWORD}
            </span>
          </div>
        </div>

        {copied && (
          <div className={styles.copySuccessNotice}>
            <Check size={14} />
            <span>Đã sao chép thông tin tài khoản!</span>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.copyAllBtn}
            onClick={handleCopyCredentials}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>Sao chép thông tin tài khoản</span>
          </button>

          <div className={styles.secondaryRow}>
            <button
              type="button"
              className={styles.createAnotherBtn}
              onClick={onCreateAnother}
            >
              <Plus size={15} />
              <span>Tạo tài khoản khác</span>
            </button>

            <button
              type="button"
              className={styles.goToListBtn}
              onClick={onGoToList}
            >
              <span>Về danh sách</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal
