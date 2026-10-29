import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateBatchSeparateFooter.module.scss"

export default function CreateBatchSeparateFooter() {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const handleDraft = () => {
    setToastMsg("Đã lưu nháp phương án 02 mẻ chế biến nấu riêng (DRAFT)")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  const handleCreate = () => {
    setToastMsg("Khởi tạo thành công 02 mẻ chế biến: CB-20261026-001 & CB-20261026-002!")
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      navigate("/school/kitchen-cooking/batches")
    }, 1500)
  }

  return (
    <>
      <div className={styles.actionBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate("/school/kitchen-cooking/batches")}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Quay lại</span>
        </button>

        <div className={styles.centerNote}>
          <span className="material-symbols-outlined">info</span>
          <span>Hai mẻ chế biến sẽ được tạo ở trạng thái Chưa xác nhận (DRAFT)</span>
        </div>

        <div className={styles.btnGroup}>
          <button
            type="button"
            className={styles.draftBtn}
            onClick={handleDraft}
          >
            <span className="material-symbols-outlined">bookmark_border</span>
            <span>Lưu phương án</span>
          </button>

          <button
            type="button"
            className={styles.createBtn}
            onClick={handleCreate}
          >
            <span className="material-symbols-outlined">soup_kitchen</span>
            <span>Khởi tạo 02 mẻ</span>
          </button>
        </div>
      </div>

      {showToast && (
        <div className={styles.toast}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  )
}
