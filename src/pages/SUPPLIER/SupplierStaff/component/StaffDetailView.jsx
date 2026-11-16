import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  InfoOutlined,
  KeyboardArrowLeft,
  LockOpenOutlined,
  LockOutlined,
  ReplayOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  canToggleStaffStatus,
  formatDateTimeVi,
  getPermissionModuleLabel,
  getStaffStatusMeta,
  STAFF_STATUS,
} from "src/services/SupplierStaffService"
import StaffStatusBadge from "./StaffStatusBadge"
import styles from "./StaffDetailView.module.scss"

const SKELETON_PERMISSIONS = [0, 1, 2, 3, 4]

function StaffDetailView({
  staff,
  loading = false,
  error = null,
  permissions = [],
  loadingPermissions = false,
  permissionsError = null,
  togglingPermissionId = null,
  onRetryDetail,
  onRetryPermissions,
  onRequestStatusChange,
  onTogglePermission,
}) {
  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_STAFF}
              className={styles.backBtn}
              aria-label="Quay lại danh sách nhân viên"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết nhân viên</h1>
          </div>
        </div>
        <div className={styles.surfaceCard}>
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>Đang tải thông tin nhân viên...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !staff) {
    const isNotFound = error?.status === 404 || !error
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_STAFF}
              className={styles.backBtn}
              aria-label="Quay lại danh sách nhân viên"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết nhân viên</h1>
          </div>
        </div>

        <div className={styles.surfaceCard}>
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {error?.status === 403
                ? "Bạn không có quyền xem tài khoản nhân viên này"
                : isNotFound
                  ? "Không tìm thấy tài khoản nhân viên"
                  : "Không thể tải chi tiết nhân viên"}
            </p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Tài khoản không tồn tại hoặc không thuộc nhà cung cấp hiện tại."}
            </p>
            {error && !isNotFound && error?.status !== 403 && onRetryDetail ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.stateActionBtn}
                onClick={onRetryDetail}
              >
                Thử lại
              </Button>
            ) : (
              <Button
                component={Link}
                to={ROUTER.SUPPLIER_STAFF}
                variant="outlined"
                color="primary"
                className={styles.stateActionBtn}
              >
                Quay lại danh sách
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const isStaffActive = staff.status === STAFF_STATUS.ACTIVE
  const isStaffLocked = staff.status === STAFF_STATUS.LOCKED
  const toggleAllowed = canToggleStaffStatus(staff.status)
  const targetStatus = isStaffActive ? STAFF_STATUS.LOCKED : STAFF_STATUS.ACTIVE
  const enabledCount = permissions.filter(item => item.enabled).length
  const statusMeta = getStaffStatusMeta(staff.status)

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderBar}>
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SUPPLIER_STAFF}
            className={styles.backBtn}
            aria-label="Quay lại danh sách nhân viên"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>
              {staff.fullName || staff.username || "Chi tiết nhân viên"}
            </h1>
            <StaffStatusBadge status={staff.status} />
          </div>
        </div>

        {toggleAllowed ? (
          <div className={styles.headerActions}>
            {isStaffActive ? (
              <Button
                type="button"
                variant="outlined"
                className={styles.lockBtn}
                startIcon={<LockOutlined />}
                onClick={() => onRequestStatusChange(STAFF_STATUS.LOCKED)}
              >
                Khóa tài khoản
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                className={styles.unlockBtn}
                startIcon={<LockOpenOutlined />}
                onClick={() => onRequestStatusChange(targetStatus)}
              >
                Mở khóa tài khoản
              </Button>
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.contentGrid}>
        <section
          className={styles.surfaceCard}
          aria-labelledby="staff-profile-section-title"
        >
          <div className={styles.sectionHeader}>
            <h2 id="staff-profile-section-title" className={styles.sectionTitle}>
              Thông tin tài khoản
            </h2>
          </div>

          <dl className={styles.metaList}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Họ và tên</dt>
              <dd className={styles.metaValue}>{staff.fullName || "—"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Tên đăng nhập</dt>
              <dd className={styles.metaValue}>@{staff.username}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Vai trò</dt>
              <dd className={styles.metaValue}>{staff.roleName}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Email</dt>
              <dd className={styles.metaValue}>{staff.email || "—"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Số điện thoại</dt>
              <dd className={styles.metaValue}>
                {staff.phone || "Chưa cập nhật"}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Ngày tạo</dt>
              <dd className={styles.metaValue}>
                {formatDateTimeVi(staff.createdAt)}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Cập nhật lần cuối</dt>
              <dd className={styles.metaValue}>
                {formatDateTimeVi(staff.updatedAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className={styles.surfaceCard}
          aria-labelledby="staff-permissions-section-title"
        >
          <div className={styles.sectionHeader}>
            <h2
              id="staff-permissions-section-title"
              className={styles.sectionTitle}
            >
              Phân quyền thao tác
            </h2>
            {isStaffActive && !loadingPermissions && !permissionsError ? (
              <span className={styles.permissionCounter}>
                {enabledCount}/{permissions.length} đang bật
              </span>
            ) : null}
          </div>

          {!isStaffActive ? (
            <div className={styles.inactiveNotice}>
              <div className={styles.noticeBanner} role="status">
                <InfoOutlined className={styles.noticeIcon} aria-hidden="true" />
                <span>
                  {isStaffLocked
                    ? "Tài khoản đang ở trạng thái Đã khóa. Vui lòng mở khóa tài khoản để xem và điều chỉnh quyền thao tác."
                    : `Tài khoản đang ở trạng thái ${statusMeta.label}. Chỉ quản lý quyền đối với tài khoản đang hoạt động.`}
                </span>
              </div>
              {isStaffLocked ? (
                <Button
                  type="button"
                  variant="contained"
                  className={styles.unlockBtn}
                  startIcon={<LockOpenOutlined />}
                  onClick={() => onRequestStatusChange(STAFF_STATUS.ACTIVE)}
                >
                  Mở khóa tài khoản
                </Button>
              ) : null}
            </div>
          ) : loadingPermissions && permissions.length === 0 ? (
            <div
              className={styles.permSkeletonList}
              role="status"
              aria-live="polite"
              aria-label="Đang tải danh sách quyền"
            >
              {SKELETON_PERMISSIONS.map(item => (
                <div key={item} className={styles.permSkeletonRow}>
                  <div className={styles.permSkeletonText}>
                    <div className={styles.skeletonLineLg} />
                    <div className={styles.skeletonLineSm} />
                  </div>
                  <div className={styles.skeletonPill} />
                </div>
              ))}
            </div>
          ) : permissionsError ? (
            <div className={styles.stateBox} role="alert">
              <p className={styles.stateTitle}>Không thể tải danh sách quyền</p>
              <p className={styles.stateDesc}>{permissionsError.message}</p>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.stateActionBtn}
                onClick={onRetryPermissions}
              >
                Thử lại
              </Button>
            </div>
          ) : permissions.length === 0 ? (
            <div className={styles.stateBox}>
              <p className={styles.stateTitle}>Chưa có cấu hình quyền nào</p>
              <p className={styles.stateDesc}>
                Vai trò hiện tại chưa có quyền thao tác nào được gán trên hệ thống.
              </p>
            </div>
          ) : (
            <div className={styles.permissionList}>
              {permissions.map(permission => {
                const isToggling = togglingPermissionId === permission.id
                const switchDisabled = isToggling || !permission.isActive

                return (
                  <div key={permission.id} className={styles.permissionRow}>
                    <div className={styles.permissionInfo}>
                      <div className={styles.permissionHeadingLine}>
                        <span className={styles.permissionName}>
                          {permission.name}
                        </span>
                        <span className={styles.moduleTag}>
                          {getPermissionModuleLabel(permission.module)}
                        </span>
                      </div>
                      {permission.description ? (
                        <p className={styles.permissionDesc}>
                          {permission.description}
                        </p>
                      ) : null}
                      {!permission.isActive ? (
                        <span className={styles.systemInactiveTag}>
                          Quyền đang tạm vô hiệu trên hệ thống
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.switchWrap}>
                      <span
                        className={`${styles.switchStateText} ${permission.enabled ? styles.switchStateActive : ""}`}
                      >
                        {isToggling
                          ? "Đang lưu..."
                          : permission.enabled
                            ? "Đang bật"
                            : "Đã tắt"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={permission.enabled}
                        aria-label={`${permission.enabled ? "Tắt" : "Bật"} quyền ${permission.name}`}
                        disabled={switchDisabled}
                        className={`${styles.switchBtn} ${permission.enabled ? styles.switchBtnChecked : ""}`}
                        onClick={() => onTogglePermission(permission)}
                      >
                        <span className={styles.switchThumb} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

StaffDetailView.propTypes = {
  staff: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
    fullName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    roleName: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string,
      name: PropTypes.string,
      module: PropTypes.string,
      description: PropTypes.string,
      isActive: PropTypes.bool,
      enabled: PropTypes.bool,
    }),
  ),
  loadingPermissions: PropTypes.bool,
  permissionsError: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  togglingPermissionId: PropTypes.string,
  onRetryDetail: PropTypes.func,
  onRetryPermissions: PropTypes.func,
  onRequestStatusChange: PropTypes.func,
  onTogglePermission: PropTypes.func,
}

export default StaffDetailView
