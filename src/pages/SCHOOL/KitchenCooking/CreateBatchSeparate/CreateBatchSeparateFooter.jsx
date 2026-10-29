import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateBatchSeparateFooter.module.scss"

export default function CreateBatchSeparateFooter() {
  const navigate = useNavigate()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const handleSaveDraft = () => {
    setToastMessage("Đã lưu phương án chế biến (Nấu riêng) ở trạng thái Chưa xác nhận (DRAFT).")
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
    }, 3000)
  }

  const handleCreateBatch = () => {
    setToastMessage("Khởi tạo thành công 02 mẻ chế biến nấu riêng (CB-20261026-001 & CB-20261026-002)!")
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
      navigate("/school/kitchen-cooking/batches")
    }, 1500)
  }

  return (
    <>
      <div className={styles.footerBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate("/school/kitchen-cooking/batches")}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Quay lại danh sách</span>
        </button>

        <div className={styles.actionGroup}>
          <span className={styles.footerNote}>
            Khi lưu, hệ thống sẽ tạo các lô chế biến ở trạng thái Chưa xác nhận.
          </span>

          <div className={styles.buttonsWrap}>
            <button
              type="button"
              className={styles.draftBtn}
              onClick={handleSaveDraft}
            >
              Lưu phương án chế biến
            </button>

            <button
              type="button"
              className={styles.createBtn}
              onClick={handleCreateBatch}
            >
              <span className="material-symbols-outlined">soup_kitchen</span>
              <span>Tạo lô chế biến</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className={styles.toast}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}
