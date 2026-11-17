import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  Add,
  Close,
  InfoOutlined,
  KeyboardArrowLeft,
  ReplayOutlined,
  Search,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import PermissionToggleRow from "./PermissionToggleRow"
import styles from "./RoleDetailView.module.scss"

const SKELETON_PERMISSIONS = [0, 1, 2, 3, 4]

function RoleDetailView({
  role,
  permissions = [],
  loading = false,
  error = null,
  savingPermissionId = null,
  onRetry,
  onOpenAddModal,
  onRequestTogglePermission,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("ALL")

  const moduleOptions = useMemo(() => {
    const map = new Map()
    permissions.forEach(item => {
      if (item.module && !map.has(item.module)) {
        map.set(item.module, item.moduleLabel || item.module)
      }
    })
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"))
  }, [permissions])

  const filteredPermissions = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return permissions.filter(item => {
      if (moduleFilter !== "ALL" && item.module !== moduleFilter) return false
      if (!keyword) return true
      const haystack = [
        item.name,
        item.moduleLabel,
        item.module,
        item.code,
        item.description || "",
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [permissions, searchQuery, moduleFilter])

  const hasPermissionFilters =
    Boolean(searchQuery.trim()) || moduleFilter !== "ALL"

  const resetPermissionFilters = () => {
    setSearchQuery("")
    setModuleFilter("ALL")
  }

  const renderHeaderBar = (showAddAction = false) => (
    <div className={styles.detailHeaderBar}>
      <div className={styles.detailNavLeft}>
        <Link
          to={ROUTER.SYSTEM_CONFIG}
          className={styles.backBtn}
          aria-label="Quay lại danh sách vai trò"
        >
          <KeyboardArrowLeft className={styles.backIcon} />
        </Link>
        <h1 className={styles.pageTitle}>Chi tiết phân quyền vai trò</h1>
      </div>

      {showAddAction && role?.editable ? (
        <Button
          type="button"
          variant="contained"
          color="primary"
          startIcon={<Add />}
          className={styles.addPermissionBtn}
          onClick={onOpenAddModal}
        >
          Thêm quyền hạn
        </Button>
      ) : null}
    </div>
  )

  if (loading) {
    return (
      <div className={styles.detailPage}>
        {renderHeaderBar(false)}
        <div className={styles.surfaceCard}>
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>Đang tải danh sách quyền...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !role) {
    const isNotFound = error?.status === 404 || !error
    const isForbidden = error?.status === 403
    return (
      <div className={styles.detailPage}>
        {renderHeaderBar(false)}
        <div className={styles.surfaceCard}>
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {isForbidden
                ? "Bạn không có quyền quản lý phân quyền vai trò"
                : isNotFound
                  ? "Không tìm thấy vai trò"
                  : "Không thể tải chi tiết phân quyền vai trò"}
            </p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Vai trò không tồn tại hoặc đã thay đổi trên hệ thống."}
            </p>
            {error && !isNotFound && !isForbidden && onRetry ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.stateActionBtn}
                onClick={onRetry}
              >
                Thử lại
              </Button>
            ) : (
              <Button
                component={Link}
                to={ROUTER.SYSTEM_CONFIG}
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

  return (
    <div className={styles.detailPage}>
      {renderHeaderBar(true)}

      <section
        className={styles.surfaceCard}
        aria-labelledby="role-overview-title"
      >
        <div className={styles.overviewHeader}>
          <h2 id="role-overview-title" className={styles.roleHeading}>
            {role.displayName}
          </h2>
          <span className={styles.permissionCounter}>
            {permissions.length} quyền đang bật
          </span>
        </div>

        <dl className={styles.infoRowsGrid}>
          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Nhóm đơn vị</dt>
            <dd className={styles.metaValue}>{role.typeLabel}</dd>
          </div>
          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Chế độ cấu hình</dt>
            <dd className={styles.metaValue}>
              {role.editable ? (
                <span className={styles.editableBadge}>
                  Cho phép bật / tắt quyền
                </span>
              ) : (
                <span className={styles.readOnlyBadge}>
                  Chỉ đọc (Mặc định hệ thống)
                </span>
              )}
            </dd>
          </div>
        </dl>

        {!role.editable ? (
          <div className={styles.noticeWrap}>
            <div className={styles.noticeBanner} role="status">
              <InfoOutlined className={styles.noticeIcon} aria-hidden="true" />
              <span>
                Vai trò Quản trị viên Hệ thống (System Admin) được giữ ở trạng
                thái chỉ đọc để bảo vệ toàn vẹn quyền quản trị nền tảng.
              </span>
            </div>
          </div>
        ) : null}
      </section>

      <section
        className={styles.surfaceCard}
        aria-labelledby="role-permissions-section-title"
      >
        <div className={styles.sectionHeader}>
          <h2
            id="role-permissions-section-title"
            className={styles.sectionTitle}
          >
            Danh sách quyền đang bật
          </h2>
          <span className={styles.filteredCount} aria-live="polite">
            {filteredPermissions.length === permissions.length
              ? `${permissions.length} quyền`
              : `Hiển thị ${filteredPermissions.length}/${permissions.length} quyền`}
          </span>
        </div>

        {permissions.length > 0 ? (
          <div
            className={styles.permissionFilterBar}
            role="search"
            aria-label="Lọc danh sách quyền đang bật của vai trò"
          >
            <div className={styles.searchControl}>
              <Search className={styles.searchIcon} aria-hidden="true" />
              <input
                id="role-permission-search"
                type="search"
                className={styles.searchInput}
                placeholder="Tìm tên quyền hoặc nhóm chức năng"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                aria-label="Tìm kiếm quyền đang bật theo tên hoặc nhóm chức năng"
              />
              {searchQuery ? (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Xóa từ khóa tìm kiếm quyền"
                >
                  <Close className={styles.clearIcon} />
                </button>
              ) : null}
            </div>

            <div className={styles.filterControls}>
              <label
                className={styles.selectGroup}
                htmlFor="role-permission-module-filter"
              >
                <span className={styles.selectLabel}>Chức năng</span>
                <select
                  id="role-permission-module-filter"
                  className={styles.filterSelect}
                  value={moduleFilter}
                  onChange={event => setModuleFilter(event.target.value)}
                >
                  <option value="ALL">Tất cả nhóm chức năng</option>
                  {moduleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {loading && permissions.length === 0 ? (
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
        ) : filteredPermissions.length === 0 ? (
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>
              {hasPermissionFilters
                ? "Không tìm thấy quyền phù hợp"
                : "Vai trò này chưa có quyền nào đang bật"}
            </p>
            <p className={styles.stateDesc}>
              {hasPermissionFilters
                ? "Thử xóa từ khóa hoặc thay đổi bộ lọc chức năng để xem lại toàn bộ quyền đang bật."
                : role.editable
                  ? "Nhấn Thêm quyền hạn để lựa chọn và cấp quyền thao tác cho vai trò này."
                  : "Vai trò hiện chưa được gán quyền nào trong danh mục."}
            </p>
            {hasPermissionFilters ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                className={styles.stateActionBtn}
                onClick={resetPermissionFilters}
              >
                Xóa bộ lọc
              </Button>
            ) : role.editable ? (
              <Button
                type="button"
                variant="contained"
                color="primary"
                startIcon={<Add />}
                className={styles.addPermissionBtn}
                onClick={onOpenAddModal}
              >
                Thêm quyền hạn
              </Button>
            ) : null}
          </div>
        ) : (
          <div className={styles.permissionList}>
            {filteredPermissions.map(permission => {
              const switchDisabled =
                !role.editable || Boolean(savingPermissionId)

              return (
                <PermissionToggleRow
                  key={permission.id}
                  permission={permission}
                  checked
                  disabled={switchDisabled}
                  saving={savingPermissionId === permission.id}
                  tooltip={
                    !role.editable
                      ? "Vai trò System Admin chỉ đọc"
                      : "Nhấn để tắt quyền này khỏi vai trò"
                  }
                  onToggle={onRequestTogglePermission}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

RoleDetailView.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.string,
    code: PropTypes.string,
    displayName: PropTypes.string,
    typeLabel: PropTypes.string,
    editable: PropTypes.bool,
  }),
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string,
      name: PropTypes.string,
      module: PropTypes.string,
      moduleLabel: PropTypes.string,
      description: PropTypes.string,
      isActive: PropTypes.bool,
    }),
  ),
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  savingPermissionId: PropTypes.string,
  onRetry: PropTypes.func,
  onOpenAddModal: PropTypes.func.isRequired,
  onRequestTogglePermission: PropTypes.func.isRequired,
}

export default RoleDetailView
