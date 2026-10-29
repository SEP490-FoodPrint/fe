import React from "react"
import { useNavigate } from "react-router-dom"
import styles from "./CreateBatchFooter.module.scss"

export default function CreateBatchFooter() {
  const navigate = useNavigate()

  return (
    <div className={styles.footerBar}>
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate("/school/kitchen-cooking/batches")}
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Quay lại</span>
      </button>

      <div className={styles.statusNote}>
        <span className="material-symbols-outlined">info</span>
        <span>Mẻ chế biến sẽ được tạo ở trạng thái Chưa xác nhận (DRAFT)</span>
      </div>

      <div className={styles.actionGroup}>
        <button type="button" className={styles.draftBtn}>
          <span className="material-symbols-outlined">bookmark_border</span>
          <span>Lưu phương án</span>
        </button>

        <button
          type="button"
          className={styles.submitBtn}
          onClick={() => navigate("/school/kitchen-cooking/batches")}
        >
          <span className="material-symbols-outlined">soup_kitchen</span>
          <span>Khởi tạo 01 mẻ</span>
        </button>
      </div>
    </div>
  )
}
