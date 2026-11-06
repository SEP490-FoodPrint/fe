import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./SchoolPagination.module.scss";

function SchoolPagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 12,
  onPageChange,
  isLoading = false,
}) {
  // Tạo danh sách các số trang cần hiển thị (kèm dấu ...)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [page, totalPages]);

  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={styles.paginationContainer}>
      {/* 1. Thông số đếm số lượng */}
      <div className={styles.countInfo}>
        Hiển thị <strong>{startItem}</strong> – <strong>{endItem}</strong> trên tổng số{" "}
        <strong>{total}</strong> trường học
      </div>

      {/* 2. Dãy nút điều hướng phân trang */}
      {totalPages > 1 && (
        <div className={styles.navControls}>
          {/* Nút Trang trước */}
          <button
            type="button"
            className={`${styles.navBtn} ${page <= 1 ? styles.disabled : ""}`}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
            <span className={styles.btnText}>Trước</span>
          </button>

          {/* Dãy các số trang */}
          <div className={styles.pageList}>
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className={styles.dots}>
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn} ${
                    p === page ? styles.activePage : ""
                  }`}
                  onClick={() => onPageChange(p)}
                  disabled={p === page || isLoading}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Nút Trang sau */}
          <button
            type="button"
            className={`${styles.navBtn} ${
              page >= totalPages ? styles.disabled : ""
            }`}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            aria-label="Trang sau"
          >
            <span className={styles.btnText}>Sau</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

SchoolPagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  limit: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default SchoolPagination;
