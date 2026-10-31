import React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import styles from "./AccountPagination.module.scss"

/**
 * AccountPagination - Phân trang danh sách tài khoản
 * Mặc định cố định 10 tài khoản / trang theo yêu cầu
 */
function AccountPagination({
  currentPage,
  pageSize = 10,
  totalItems,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Danh sách các số trang
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(totalPages, currentPage + 2)

      if (currentPage <= 3) {
        start = 1
        end = 5
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4
        end = totalPages
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={styles.paginationContainer} role="navigation" aria-label="Phân trang tài khoản">
      {/* Thông tin dải kết quả */}
      <div className={styles.rangeInfo}>
        <span>
          Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trong tổng số{" "}
          <strong>{totalItems}</strong> tài khoản
        </span>
        <span className={styles.defaultBadge}>10 tài khoản / trang</span>
      </div>

      {/* Các nút bấm phân trang */}
      <div className={styles.pageButtons}>
        {/* Nút về trang đầu */}
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Trang đầu tiên"
          aria-label="Trang đầu tiên"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Nút lùi 1 trang */}
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Trang trước"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Danh sách số trang */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            className={`${styles.pageNumberBtn} ${page === currentPage ? styles.pageActive : ""}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        {/* Nút tiến 1 trang */}
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          title="Trang tiếp theo"
          aria-label="Trang tiếp theo"
        >
          <ChevronRight size={16} />
        </button>

        {/* Nút đến trang cuối */}
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Trang cuối cùng"
          aria-label="Trang cuối cùng"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default AccountPagination
