import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import { Add } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatDateTimeVi,
  formatDateVi,
  getFacilityStatusLabel,
} from "src/services/SourceFacilityService"
import styles from "./FacilityListView.module.scss"

function FacilityListView({
  facilities,
  pageTotalCount,
  loading,
  hasActiveFilters,
  pagination,
  onResetFilters,
  onCreate,
  onPageChange,
}) {
  const currentPage = pagination?.page || 1
  const pageLimit = pagination?.limit || 20

  if (loading && facilities.length === 0) {
    return (
      <div className={styles.loadingState} role="status" aria-live="polite">
        <CircularProgress size={28} />
        <p className={styles.loadingText}>Đang tải danh sách cơ sở nguồn cung...</p>
      </div>
    )
  }

  if (facilities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không tìm thấy cơ sở nguồn cung phù hợp"
            : "Chưa có cơ sở nguồn cung nào"}
        </p>
        <p className={styles.emptyDesc}>
          {hasActiveFilters
            ? "Không có cơ sở nào trên trang hiện tại khớp với từ khóa hoặc trạng thái đã chọn."
            : "Nhấn \"Thêm cơ sở\" để khai báo cơ sở nguồn cung cho nhà cung cấp."}
        </p>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onResetFilters}
          >
            Xóa bộ lọc
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onCreate}
          >
            Thêm cơ sở
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.facilityTable}>
          <thead>
            <tr>
              <th scope="col" className={styles.colStt}>
                STT
              </th>
              <th scope="col" className={styles.colName}>
                Tên cơ sở
              </th>
              <th scope="col" className={styles.colCode}>
                Mã cơ sở
              </th>
              <th scope="col" className={styles.colStatus}>
                Trạng thái
              </th>
              <th scope="col" className={styles.colDate}>
                Ngày tạo
              </th>
              <th scope="col" className={styles.colUpdated}>
                Cập nhật lần cuối
              </th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility, idx) => {
              const isActive = facility.status === "ACTIVE"
              const detailPath = `${ROUTER.SUPPLIER_SOURCE_FACILITIES}/${facility.id}`
              const rowNumber = (currentPage - 1) * pageLimit + idx + 1

              return (
                <tr key={facility.id} className={styles.tableRow}>
                  <td className={`${styles.colStt} ${styles.cellStt}`}>
                    {rowNumber}
                  </td>

                  <td className={styles.colName}>
                    <div className={styles.nameTextStack}>
                      <Link to={detailPath} className={styles.nameLink}>
                        {facility.name}
                      </Link>
                      <Link to={detailPath} className={styles.viewDetailLink}>
                        Xem chi tiết
                      </Link>
                    </div>
                  </td>

                  <td className={styles.colCode}>
                    <span className={styles.codeChip}>
                      {facility.facilityCode || "Chưa cấp mã"}
                    </span>
                  </td>

                  <td className={styles.colStatus}>
                    <span
                      className={`${styles.statusBadge} ${
                        isActive ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {getFacilityStatusLabel(facility.status)}
                    </span>
                  </td>

                  <td className={`${styles.colDate} ${styles.cellMuted}`}>
                    {formatDateVi(facility.createdAt)}
                  </td>

                  <td className={`${styles.colUpdated} ${styles.cellMuted}`}>
                    {formatDateTimeVi(facility.updatedAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.cardList} aria-label="Danh sách cơ sở nguồn cung">
        {facilities.map(facility => {
          const isActive = facility.status === "ACTIVE"
          const detailPath = `${ROUTER.SUPPLIER_SOURCE_FACILITIES}/${facility.id}`

          return (
            <article key={facility.id} className={styles.facilityCard}>
              <Link to={detailPath} className={styles.cardHeaderLink}>
                <div className={styles.cardTitleGroup}>
                  <h2 className={styles.cardTitle}>{facility.name}</h2>
                  <p className={styles.cardSubMeta}>
                    Mã cơ sở: {facility.facilityCode || "Chưa cấp mã"}
                  </p>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    isActive ? styles.statusActive : styles.statusInactive
                  }`}
                >
                  {getFacilityStatusLabel(facility.status)}
                </span>
              </Link>

              <div className={styles.cardFooterRow}>
                <p className={styles.cardUpdatedText}>
                  Cập nhật: {formatDateTimeVi(facility.updatedAt)}
                </p>
                <Link to={detailPath} className={styles.viewDetailLink}>
                  Xem chi tiết
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      <div className={styles.paginationFooter}>
        <p className={styles.paginationSummary}>
          Hiển thị <strong>{facilities.length}</strong> / {pageTotalCount} cơ sở
          {" · "}Trang <strong>{currentPage}</strong>
        </p>

        <div className={styles.paginationControls}>
          <button
            type="button"
            className={`${styles.pageNavBtn} ${styles.pageNavBtnPrev}`}
            disabled={!pagination || currentPage <= 1 || loading}
            onClick={() => onPageChange?.(currentPage - 1)}
          >
            Trang trước
          </button>
          <button
            type="button"
            className={styles.pageNavBtn}
            disabled={!pagination || !pagination.hasNext || loading}
            onClick={() => onPageChange?.(currentPage + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </>
  )
}

FacilityListView.propTypes = {
  facilities: PropTypes.arrayOf(PropTypes.object).isRequired,
  pageTotalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  hasActiveFilters: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }).isRequired,
  onResetFilters: PropTypes.func,
  onCreate: PropTypes.func,
  onPageChange: PropTypes.func,
}

export default FacilityListView
