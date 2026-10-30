import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle2, FileText, PlusCircle } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./CreateBatchSeparateFooter.module.scss"

export default function CreateBatchSeparateFooter() {
  const navigate = useNavigate()
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const handleSaveDraft = () => {
    setToastMessage("Đã lưu phương án 02 lô chế biến nấu riêng ở trạng thái DRAFT.")
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
    }, 2500)
  }

  const handleCreateBatch = () => {
    setToastMessage("Khởi tạo thành công 02 lô chế biến Thịt heo kho nước dừa!")
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
      navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)
    }, 1200)
  }

  return (
    <>
      {/* 1. Desktop Footer Bar (Hiện trên Desktop >= 768px) */}
      <div className={styles.desktopFooterBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          aria-label="Quay lại danh sách lô"
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách</span>
        </button>

        <div className={styles.actionGroup}>
          <span className={styles.footerNote}>
            Hệ thống sẽ tạo 02 lô chế biến mới độc lập ở trạng thái Chờ nấu.
          </span>

          <div className={styles.buttonsWrap}>
            <button
              type="button"
              className={styles.draftBtn}
              onClick={handleSaveDraft}
            >
              <FileText size={16} />
              <span>Lưu phương án</span>
            </button>

            <button
              type="button"
              className={styles.createBtn}
              onClick={handleCreateBatch}
            >
              <PlusCircle size={17} />
              <span>Tạo 02 lô chế biến</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mobile Sticky Bottom Bar (Ghim cố định đáy màn hình < 768px cho ngón cái) */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileBarInner}>
          <button
            type="button"
            className={styles.mobDraftBtn}
            onClick={handleSaveDraft}
            aria-label="Lưu phương án dạng nháp"
          >
            <FileText size={16} />
            <span>Lưu nháp</span>
          </button>

          <button
            type="button"
            className={styles.mobCreateBtn}
            onClick={handleCreateBatch}
            aria-label="Khởi tạo 02 lô chế biến mới"
          >
            <PlusCircle size={18} />
            <span>Tạo 02 lô chế biến</span>
          </button>
        </div>
      </div>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className={styles.toast} role="status" aria-live="polite">
          <CheckCircle2 size={18} className={styles.toastIcon} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}
