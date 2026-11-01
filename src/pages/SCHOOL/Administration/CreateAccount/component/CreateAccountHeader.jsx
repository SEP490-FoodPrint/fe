import React from "react"
import { ArrowLeft } from "lucide-react"
import styles from "./CreateAccountHeader.module.scss"

function CreateAccountHeader({ onBack }) {
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
          <h1 className={styles.mainTitle}>Tạo tài khoản phòng ban</h1>
          <p className={styles.subTitle}>
            Khởi tạo tài khoản mới cho cán bộ, giáo viên và nhân viên các ban chuyên trách
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateAccountHeader
