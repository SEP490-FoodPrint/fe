import React from "react"
import { ArrowLeft } from "lucide-react"
import styles from "./EditAccountHeader.module.scss"

function EditAccountHeader({ onBack, account }) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.leftArea}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          title="Quay lại danh sách tài khoản"
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>
        <div className={styles.titleGroup}>
          {account && (
            <p className={styles.subTitle}>
              Đang chỉnh sửa: <strong>{account.fullName}</strong> ({account.code})
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditAccountHeader
