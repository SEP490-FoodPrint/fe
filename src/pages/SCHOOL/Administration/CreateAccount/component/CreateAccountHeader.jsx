import React from "react"
import { ArrowLeft } from "lucide-react"
import styles from "./CreateAccountHeader.module.scss"

/**
 * Header tối giản: Chỉ gồm nút quay lại và tiêu đề trang
 */
function CreateAccountHeader({ onBack }) {
  return (
    <div className={styles.headerContainer}>
      <button
        type="button"
        className={styles.backBtn}
        onClick={onBack}
        title="Quay lại danh sách tài khoản"
      >
        <ArrowLeft size={18} />
        <span>Quay lại</span>
      </button>
      <h1 className={styles.mainTitle}>Tạo tài khoản phòng ban</h1>
    </div>
  )
}

export default CreateAccountHeader
