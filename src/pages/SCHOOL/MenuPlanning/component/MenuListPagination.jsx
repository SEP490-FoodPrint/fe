import React from "react"
import styles from "./MenuListPagination.module.scss"

export default function MenuListPagination({
  currentPage = 1,
  totalPages = 4,
  pageSize = 5,
  totalItems = 18,
  onPageChange
}) {
  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.summaryText}>
        Hiển thị <span className={styles.highlight}>{startItem} - {endItem}</span> trong tổng số{" "}
        <span className={styles.highlight}>{totalItems}</span> thực đơn
      </div>

      <div className={styles.pageButtons}>
        {/* Nút Trước */}
        <button
          type="button"
          className={`${styles.navBtn} ${currentPage === 1 ? styles.disabled : ""}`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className={`material-symbols-outlined ${styles.navIcon}`}>chevron_left</span>
          <span>Trước</span>
        </button>

        {/* Các nút trang số */}
        <div className={styles.numButtonGroup}>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${currentPage === p ? styles.active : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Nút Sau */}
        <button
          type="button"
          className={`${styles.navBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span>Sau</span>
          <span className={`material-symbols-outlined ${styles.navIcon}`}>chevron_right</span>
        </button>
      </div>
    </div>
  )
}

