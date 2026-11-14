import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material"
import {
  Add,
  ChevronLeft,
  ChevronRight,
  EditOutlined,
  PauseCircleOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
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
  onEdit,
  onDeactivate,
  onPageChange,
}) {
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
              <th scope="col" className={styles.colCode}>
                Mã cơ sở
              </th>
              <th scope="col" className={styles.colName}>
                Tên cơ sở
              </th>
              <th scope="col" className={styles.colStatus}>
                Trạng thái
              </th>
              <th scope="col" className={styles.colDate}>
                Ngày tạo
              </th>
              <th scope="col" className={styles.colDate}>
                Cập nhật lần cuối
              </th>
              <th scope="col" className={styles.colActions}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {facilities.map(facility => {
              const isActive = facility.status === "ACTIVE"
              const detailPath = `${ROUTER.SUPPLIER_SOURCE_FACILITIES}/${facility.id}`

              return (
                <tr key={facility.id} className={styles.tableRow}>
                  <td className={styles.colCode}>
                    <span className={styles.codeBadge}>
                      {facility.facilityCode || "Chưa cấp mã"}
                    </span>
                  </td>

                  <td className={styles.colName}>
                    <Link to={detailPath} className={styles.nameLink}>
                      {facility.name}
                    </Link>
                  </td>

                  <td className={styles.colStatus}>
                    <span
                      className={`${styles.statusPill} ${
                        isActive ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {getFacilityStatusLabel(facility.status)}
                    </span>
                  </td>

                  <td className={styles.colDate}>
                    <span className={styles.dateText}>
                      {formatDateVi(facility.createdAt)}
                    </span>
                  </td>

                  <td className={styles.colDate}>
                    <span className={styles.dateText}>
                      {formatDateTimeVi(facility.updatedAt)}
                    </span>
                  </td>

                  <td className={styles.colActions}>
                    <div className={styles.actionGroup}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          component={Link}
                          to={detailPath}
                          size="small"
                          aria-label={`Xem chi tiết ${facility.name}`}
                          className={styles.actionIconBtn}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          aria-label={`Chỉnh sửa ${facility.name}`}
                          onClick={() => onEdit?.(facility)}
                          className={styles.actionIconBtn}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isActive && (
                        <Tooltip title="Dừng hoạt động">
                          <IconButton
                            size="small"
                            aria-label={`Dừng hoạt động ${facility.name}`}
                            onClick={() => onDeactivate?.(facility)}
                            className={`${styles.actionIconBtn} ${styles.deactivateIconBtn}`}
                          >
                            <PauseCircleOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList} aria-label="Danh sách cơ sở nguồn cung">
        {facilities.map(facility => {
          const isActive = facility.status === "ACTIVE"
          const detailPath = `${ROUTER.SUPPLIER_SOURCE_FACILITIES}/${facility.id}`

          return (
            <article key={facility.id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <span className={styles.codeBadge}>
                  {facility.facilityCode || "Chưa cấp mã"}
                </span>
                <span
                  className={`${styles.statusPill} ${
                    isActive ? styles.statusActive : styles.statusInactive
                  }`}
                >
                  {getFacilityStatusLabel(facility.status)}
                </span>
              </div>

              <div className={styles.mobileTitleGroup}>
                <Link to={detailPath} className={styles.mobileNameLink}>
                  {facility.name}
                </Link>
                <span className={styles.mobileMetaText}>
                  Cập nhật: {formatDateTimeVi(facility.updatedAt)}
                </span>
              </div>

              <div className={styles.mobileCardFooter}>
                <Button
                  component={Link}
                  to={detailPath}
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<VisibilityOutlined />}
                >
                  Chi tiết
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="text"
                  color="primary"
                  startIcon={<EditOutlined />}
                  onClick={() => onEdit?.(facility)}
                >
                  Chỉnh sửa
                </Button>
                {isActive && (
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    color="warning"
                    startIcon={<PauseCircleOutlined />}
                    onClick={() => onDeactivate?.(facility)}
                  >
                    Dừng hoạt động
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className={styles.tableFooter}>
        <span className={styles.resultCount}>
          Hiển thị <strong>{facilities.length}</strong> / {pageTotalCount} cơ sở
          {" · "}Trang <strong>{pagination?.page || 1}</strong>
        </span>

        <div className={styles.paginationControls}>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<ChevronLeft />}
            disabled={!pagination || pagination.page <= 1 || loading}
            onClick={() => onPageChange?.(pagination.page - 1)}
          >
            Trang trước
          </Button>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="primary"
            endIcon={<ChevronRight />}
            disabled={!pagination || !pagination.hasNext || loading}
            onClick={() => onPageChange?.(pagination.page + 1)}
          >
            Trang sau
          </Button>
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
  onEdit: PropTypes.func,
  onDeactivate: PropTypes.func,
  onPageChange: PropTypes.func,
}

export default FacilityListView
