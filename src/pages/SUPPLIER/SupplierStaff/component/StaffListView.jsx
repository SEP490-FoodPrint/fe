import React from "react"
import PropTypes from "prop-types"
import { generatePath, Link, useNavigate } from "react-router-dom"
import { Button } from "@mui/material"
import {
  Add,
  ChevronRight,
  GroupOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import StaffStatusBadge from "./StaffStatusBadge"
import styles from "./StaffListView.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]

function getStaffDetailPath(id) {
  return generatePath(ROUTER.SUPPLIER_STAFF_DETAIL, { id })
}

function StaffListView({
  staffList,
  pageTotalCount,
  loading,
  hasActiveFilters,
  pagination,
  onResetFilters,
  onOpenCreate,
  onPageChange,
}) {
  const navigate = useNavigate()
  const currentPage = pagination?.page || 1
  const pageLimit = pagination?.limit || 20

  const handleRowClick = (event, detailUrl) => {
    if (event.target.closest("a, button")) return
    const selectedText = window.getSelection?.()?.toString()
    if (selectedText) return
    navigate(detailUrl)
  }

  if (loading && pageTotalCount === 0) {
    return (
      <div
        className={styles.skeletonStack}
        role="status"
        aria-live="polite"
        aria-label="Đang tải danh sách nhân viên"
      >
        {SKELETON_ROWS.map(rowKey => (
          <div key={rowKey} className={styles.skeletonRow}>
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
          </div>
        ))}
      </div>
    )
  }

  if (staffList.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap} aria-hidden="true">
          <GroupOutlined />
        </div>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không tìm thấy tài khoản nhân viên phù hợp"
            : "Chưa có tài khoản nhân viên nào"}
        </p>
        <p className={styles.emptyDesc}>
          {hasActiveFilters
            ? "Thử xóa từ khóa tìm kiếm hoặc chọn lại trạng thái để xem toàn bộ danh sách."
            : "Tạo tài khoản nhân viên đầu tiên để phân quyền tiếp nhận đơn hàng và quản lý giao hàng."}
        </p>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outlined"
            color="primary"
            className={styles.emptyActionBtn}
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
            className={styles.emptyActionBtn}
            onClick={onOpenCreate}
          >
            Tạo nhân viên
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label="Danh sách nhân viên nhà cung cấp">
          <thead>
            <tr>
              <th scope="col" className={styles.indexCol}>
                STT
              </th>
              <th scope="col">Nhân viên</th>
              <th scope="col">Email</th>
              <th scope="col">Số điện thoại</th>
              <th scope="col">Vai trò</th>
              <th scope="col">Trạng thái</th>
              <th scope="col" className={styles.actionCol}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, index) => {
              const rowNumber = (currentPage - 1) * pageLimit + index + 1
              const detailUrl = getStaffDetailPath(staff.id)

              return (
                <tr
                  key={staff.id}
                  className={styles.tableRow}
                  onClick={event => handleRowClick(event, detailUrl)}
                >
                  <td className={styles.indexCell}>{rowNumber}</td>
                  <td>
                    <Link to={detailUrl} className={styles.staffPrimaryLink}>
                      {staff.fullName}
                    </Link>
                    <div className={styles.usernameSub}>@{staff.username}</div>
                  </td>
                  <td className={styles.emailCell} title={staff.email}>
                    {staff.email}
                  </td>
                  <td className={styles.phoneCell}>{staff.phone || "—"}</td>
                  <td className={styles.roleCell}>{staff.roleName}</td>
                  <td>
                    <StaffStatusBadge status={staff.status} />
                  </td>
                  <td className={styles.actionCell}>
                    <Link
                      to={detailUrl}
                      className={styles.detailLink}
                      aria-label={`Xem chi tiết và phân quyền cho ${staff.fullName}`}
                    >
                      <span>Chi tiết</span>
                      <ChevronRight className={styles.chevronIcon} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {staffList.map(staff => {
          const detailUrl = getStaffDetailPath(staff.id)
          return (
            <Link key={staff.id} to={detailUrl} className={styles.mobileCard}>
              <div className={styles.mobileCardTop}>
                <div className={styles.mobileNameGroup}>
                  <span className={styles.mobileName}>{staff.fullName}</span>
                  <span className={styles.usernameSub}>@{staff.username}</span>
                </div>
                <StaffStatusBadge status={staff.status} />
              </div>
              <div className={styles.mobileMetaList}>
                <div className={styles.mobileMetaRow}>
                  <span>Email</span>
                  <span className={styles.mobileMetaValue}>{staff.email}</span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>SĐT</span>
                  <span className={styles.mobileMetaValue}>{staff.phone || "—"}</span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>Vai trò</span>
                  <span className={styles.mobileMetaValue}>{staff.roleName}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className={styles.paginationFooter}>
        <span className={styles.paginationInfo}>
          Trang {currentPage} · Hiển thị {staffList.length} tài khoản
        </span>
        <div className={styles.paginationActions}>
          <Button
            type="button"
            variant="outlined"
            className={styles.pageBtn}
            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <Button
            type="button"
            variant="outlined"
            className={styles.pageBtn}
            disabled={!pagination?.hasNext || loading}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </>
  )
}

StaffListView.propTypes = {
  staffList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string,
      fullName: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      roleName: PropTypes.string,
      status: PropTypes.string,
    }),
  ).isRequired,
  pageTotalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  hasActiveFilters: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }),
  onResetFilters: PropTypes.func.isRequired,
  onOpenCreate: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
}

export default StaffListView
