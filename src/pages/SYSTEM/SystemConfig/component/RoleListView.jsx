import React from "react"
import PropTypes from "prop-types"
import { generatePath, Link, useNavigate } from "react-router-dom"
import { Button } from "@mui/material"
import { AdminPanelSettingsOutlined, ChevronRight } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import styles from "./RoleListView.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5]

function getRoleDetailPath(roleId) {
  return generatePath(ROUTER.SYSTEM_CONFIG_DETAIL, { id: roleId })
}

function RoleListView({
  roles,
  totalCount,
  loading,
  hasActiveFilters,
  onResetFilters,
}) {
  const navigate = useNavigate()

  const handleRowClick = (event, detailUrl) => {
    if (event.target.closest("a, button")) return
    const selectedText = window.getSelection?.()?.toString()
    if (selectedText) return
    navigate(detailUrl)
  }

  if (loading && totalCount === 0) {
    return (
      <div
        className={styles.skeletonStack}
        role="status"
        aria-live="polite"
        aria-label="Đang tải danh sách vai trò"
      >
        {SKELETON_ROWS.map(rowKey => (
          <div key={rowKey} className={styles.skeletonRow}>
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
          </div>
        ))}
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap} aria-hidden="true">
          <AdminPanelSettingsOutlined />
        </div>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không tìm thấy vai trò phù hợp"
            : "Chưa có vai trò nào có thể cấu hình"}
        </p>
        <p className={styles.emptyDesc}>
          {hasActiveFilters
            ? "Thử xóa từ khóa tìm kiếm hoặc chọn lại nhóm đơn vị để xem toàn bộ danh sách vai trò."
            : "Hệ thống chưa ghi nhận vai trò nghiệp vụ nào thuộc phạm vi cấu hình phân quyền."}
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
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label="Danh sách vai trò trên hệ thống">
          <thead>
            <tr>
              <th scope="col" className={styles.indexCol}>
                STT
              </th>
              <th scope="col">Tên vai trò</th>
              <th scope="col" className={styles.typeCol}>
                Nhóm đơn vị
              </th>
              <th scope="col" className={styles.actionCol}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => {
              const rowNumber = index + 1
              const detailUrl = getRoleDetailPath(role.id)

              return (
                <tr
                  key={role.id}
                  className={styles.tableRow}
                  onClick={event => handleRowClick(event, detailUrl)}
                >
                  <td className={styles.indexCell}>{rowNumber}</td>
                  <td>
                    <Link to={detailUrl} className={styles.rolePrimaryLink}>
                      {role.displayName}
                    </Link>
                  </td>
                  <td className={styles.typeCell}>
                    <span className={styles.typeBadge}>{role.typeLabel}</span>
                  </td>
                  <td className={styles.actionCell}>
                    <Link
                      to={detailUrl}
                      className={styles.detailLink}
                      aria-label={`Xem chi tiết và cấu hình quyền cho ${role.displayName}`}
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight
                        className={styles.chevronIcon}
                        aria-hidden="true"
                      />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {roles.map((role, index) => {
          const rowNumber = index + 1
          const detailUrl = getRoleDetailPath(role.id)

          return (
            <Link key={role.id} to={detailUrl} className={styles.mobileCard}>
              <div className={styles.mobileCardTop}>
                <div className={styles.mobileTitleGroup}>
                  <span className={styles.mobileIndexBadge}>#{rowNumber}</span>
                  <span className={styles.mobileRoleName}>
                    {role.displayName}
                  </span>
                </div>
                <ChevronRight
                  className={styles.mobileChevronIcon}
                  aria-hidden="true"
                />
              </div>
              <div className={styles.mobileMetaRow}>
                <span className={styles.typeBadge}>{role.typeLabel}</span>
                <span className={styles.mobileActionHint}>Cấu hình quyền</span>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

RoleListView.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string,
      displayName: PropTypes.string.isRequired,
      type: PropTypes.string,
      typeLabel: PropTypes.string,
      editable: PropTypes.bool,
    }),
  ).isRequired,
  totalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  hasActiveFilters: PropTypes.bool,
  onResetFilters: PropTypes.func.isRequired,
}

export default RoleListView
