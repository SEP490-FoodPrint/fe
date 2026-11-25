import React from "react"
import PropTypes from "prop-types"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@mui/material"
import {
  ChevronRight,
  ErrorOutlineOutlined,
  GavelOutlined,
  ReplayOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatCode,
  formatDateTimeVi,
} from "src/services/FoodSafetyIncidentService"
import {
  DECISION_STATUS_OPTIONS,
  ENFORCEMENT_ACTION_TYPE_OPTIONS,
  EXECUTION_STATUS_OPTIONS,
  getActionTypeMeta,
  getDecisionStatusMeta,
  getExecutionStatusMeta,
} from "src/services/SupplierEnforcementService"
import styles from "../SupplierEnforcement.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  info: styles.toneInfo,
  muted: styles.toneMuted,
}

function StatusPill({ label, tone = "muted" }) {
  return (
    <span className={`${styles.badge} ${TONE_CLASS[tone] || styles.toneMuted}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

StatusPill.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.string,
}

function EnforcementListView({
  basePath,
  isSystemAdmin,
  isAuthority,
  actions,
  pagination,
  loading,
  error,
  filters,
  onFilterChange,
  onResetFilters,
  onPageChange,
  onRetry,
}) {
  const navigate = useNavigate()

  const hasActiveFilters = Boolean(
    filters.actionType || filters.decisionStatus || filters.executionStatus,
  )

  const handleRowClick = (event, url) => {
    if (event.target.closest("a, button")) return
    if (window.getSelection?.()?.toString()) return
    navigate(url)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>
            {isSystemAdmin
              ? "Phê duyệt chế tài nhà cung cấp"
              : "Đề nghị chế tài nhà cung cấp"}
          </h1>
          <p className={styles.pageSubtitle}>
            {isSystemAdmin
              ? "Xem xét đề nghị tạm dừng tiếp nhận, khóa tài khoản hoặc khôi phục nhà cung cấp từ cơ quan ATTP cấp xã và thực thi ngay khi phê duyệt."
              : "Theo dõi trạng thái phê duyệt và thực thi các đề nghị chế tài nhà cung cấp do đơn vị ATTP gửi lên Quản trị viên Hệ thống."}
          </p>
        </div>
      </div>

      <section className={styles.surface}>
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <select
              aria-label="Lọc theo loại chế tài"
              className={styles.selectInput}
              value={filters.actionType}
              onChange={e => onFilterChange("actionType", e.target.value)}
            >
              {ENFORCEMENT_ACTION_TYPE_OPTIONS.map(opt => (
                <option key={opt.value || "ALL"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc theo quyết định phê duyệt"
              className={styles.selectInput}
              value={filters.decisionStatus}
              onChange={e => onFilterChange("decisionStatus", e.target.value)}
            >
              {DECISION_STATUS_OPTIONS.map(opt => (
                <option key={opt.value || "ALL"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc theo trạng thái thực thi"
              className={styles.selectInput}
              value={filters.executionStatus}
              onChange={e => onFilterChange("executionStatus", e.target.value)}
            >
              {EXECUTION_STATUS_OPTIONS.map(opt => (
                <option key={opt.value || "ALL"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters ? (
              <Button
                type="button"
                size="small"
                variant="text"
                onClick={onResetFilters}
              >
                Xóa bộ lọc
              </Button>
            ) : null}
          </div>

          <span className={styles.countSummary}>
            Trang {pagination.page} · {actions.length} yêu cầu
          </span>
        </div>

        {error ? (
          <div className={styles.stateBox} role="alert">
            <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.stateTitle}>
              Không thể tải danh sách yêu cầu chế tài
            </p>
            <p className={styles.stateDesc}>{error.message}</p>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              startIcon={<ReplayOutlined />}
              onClick={onRetry}
            >
              Thử lại
            </Button>
          </div>
        ) : loading && actions.length === 0 ? (
          <div
            className={styles.skeletonStack}
            role="status"
            aria-live="polite"
            aria-label="Đang tải danh sách yêu cầu chế tài"
          >
            {SKELETON_ROWS.map(key => (
              <div key={key} className={styles.skeletonRow}>
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
              </div>
            ))}
          </div>
        ) : actions.length === 0 ? (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>
              <GavelOutlined />
            </div>
            <p className={styles.stateTitle}>
              {hasActiveFilters
                ? "Không có yêu cầu chế tài phù hợp bộ lọc"
                : "Chưa có yêu cầu chế tài nhà cung cấp nào"}
            </p>
            <p className={styles.stateDesc}>
              {hasActiveFilters
                ? "Thử bỏ bớt điều kiện lọc để xem toàn bộ các yêu cầu chế tài."
                : isSystemAdmin
                  ? "Khi cán bộ ATTP gửi đề nghị tạm dừng, khóa tài khoản hoặc khôi phục nhà cung cấp từ báo cáo ngộ độc, yêu cầu sẽ hiển thị tại đây."
                  : "Bạn có thể tạo đề nghị chế tài trực tiếp trong màn chi tiết báo cáo ngộ độc đã tiếp nhận."}
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
            ) : isAuthority ? (
              <Button
                component={Link}
                to={ROUTER.AUTHORITY_INCIDENTS}
                variant="outlined"
                color="primary"
              >
                Mở danh sách báo cáo ngộ độc
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table
                className={styles.table}
                aria-label="Danh sách yêu cầu chế tài nhà cung cấp"
              >
                <thead>
                  <tr>
                    <th scope="col">Báo cáo ngộ độc</th>
                    <th scope="col">Nhà cung cấp</th>
                    <th scope="col">Loại chế tài</th>
                    <th scope="col">Quyết định</th>
                    <th scope="col">Thực thi</th>
                    <th scope="col">Người đề nghị</th>
                    <th scope="col">Ngày gửi</th>
                    <th scope="col" className={styles.actionCell}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map(item => {
                    const detailUrl = `${basePath}/${item.id}`
                    const incidentUrl =
                      isAuthority && item.incident?.id
                        ? `${ROUTER.AUTHORITY_INCIDENTS}/${item.incident.id}`
                        : null
                    const typeMeta = getActionTypeMeta(item.actionType)
                    const decMeta = getDecisionStatusMeta(item.decisionStatus)
                    const execMeta = getExecutionStatusMeta(
                      item.executionStatus,
                    )

                    return (
                      <tr
                        key={item.id}
                        className={styles.clickableRow}
                        onClick={e => handleRowClick(e, detailUrl)}
                      >
                        <td>
                          {incidentUrl ? (
                            <Link to={incidentUrl} className={styles.primaryLink}>
                              <span className={styles.codeChip}>
                                {formatCode(item.incident?.code)}
                              </span>
                            </Link>
                          ) : (
                            <span className={styles.codeChip}>
                              {formatCode(item.incident?.code)}
                            </span>
                          )}
                          <div
                            className={styles.incidentSubline}
                            title={item.incident?.title || ""}
                          >
                            {item.incident?.title || "—"}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {item.supplier?.name || "—"}
                        </td>
                        <td>
                          <StatusPill
                            label={typeMeta.shortLabel}
                            tone={typeMeta.tone}
                          />
                        </td>
                        <td>
                          <StatusPill
                            label={decMeta.label}
                            tone={decMeta.tone}
                          />
                        </td>
                        <td>
                          <StatusPill
                            label={execMeta.label}
                            tone={execMeta.tone}
                          />
                        </td>
                        <td>{item.requestedBy?.fullName || "—"}</td>
                        <td className={styles.tabularNum}>
                          {formatDateTimeVi(item.createdAt)}
                        </td>
                        <td className={styles.actionCell}>
                          <Link to={detailUrl} className={styles.detailLink}>
                            <span>Chi tiết</span>
                            <ChevronRight fontSize="small" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileList}>
              {actions.map(item => {
                const detailUrl = `${basePath}/${item.id}`
                const typeMeta = getActionTypeMeta(item.actionType)
                const decMeta = getDecisionStatusMeta(item.decisionStatus)
                const execMeta = getExecutionStatusMeta(item.executionStatus)

                return (
                  <Link key={item.id} to={detailUrl} className={styles.mobileCard}>
                    <div className={styles.mobileCardTop}>
                      <span className={styles.codeChip}>
                        {formatCode(item.incident?.code)}
                      </span>
                      <StatusPill label={decMeta.label} tone={decMeta.tone} />
                    </div>
                    <div className={styles.mobileTitle}>
                      {item.supplier?.name || "Nhà cung cấp"}
                    </div>
                    <div className={styles.mobileMetaList}>
                      <div className={styles.mobileMetaRow}>
                        <span>Loại chế tài</span>
                        <span>{typeMeta.shortLabel}</span>
                      </div>
                      <div className={styles.mobileMetaRow}>
                        <span>Thực thi</span>
                        <span>{execMeta.label}</span>
                      </div>
                      <div className={styles.mobileMetaRow}>
                        <span>Người đề nghị</span>
                        <span>{item.requestedBy?.fullName || "—"}</span>
                      </div>
                      <div className={styles.mobileMetaRow}>
                        <span>Ngày gửi</span>
                        <span>{formatDateTimeVi(item.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className={styles.paginationFooter}>
              <span className={styles.paginationInfo}>
                Trang {pagination.page} · Hiển thị {actions.length} yêu cầu
              </span>
              <div className={styles.paginationActions}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => onPageChange(pagination.page - 1)}
                >
                  Trang trước
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  disabled={!pagination.hasNext || loading}
                  onClick={() => onPageChange(pagination.page + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

EnforcementListView.propTypes = {
  basePath: PropTypes.string.isRequired,
  isSystemAdmin: PropTypes.bool,
  isAuthority: PropTypes.bool,
  actions: PropTypes.array.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.object,
  filters: PropTypes.shape({
    actionType: PropTypes.string,
    decisionStatus: PropTypes.string,
    executionStatus: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
}

export default EnforcementListView
