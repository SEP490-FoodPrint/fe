import React, { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  useMediaQuery,
} from "@mui/material"
import {
  Close,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  PlaylistAddOutlined,
  ReplayOutlined,
  Search,
} from "@mui/icons-material"
import PermissionToggleRow from "./PermissionToggleRow"
import styles from "./AddRolePermissionModal.module.scss"

export const ADD_MODAL_PAGE_SIZE = 5

function AddRolePermissionModal({
  open,
  roleName = "",
  permissions = [],
  assignedIdsSet,
  loadingCatalog = false,
  catalogError = null,
  savingPermissionId = null,
  onRetryCatalog,
  onClose,
  onRequestTogglePermission,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const isMobile = useMediaQuery("(max-width: 600px)")

  useEffect(() => {
    if (open) {
      setSearchQuery("")
      setPage(1)
    }
  }, [open])

  const filteredPermissions = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return permissions
    return permissions.filter(item => {
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
  }, [permissions, searchQuery])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPermissions.length / ADD_MODAL_PAGE_SIZE),
  )
  const safePage = Math.min(page, totalPages)

  const paginatedPermissions = useMemo(() => {
    const start = (safePage - 1) * ADD_MODAL_PAGE_SIZE
    return filteredPermissions.slice(start, start + ADD_MODAL_PAGE_SIZE)
  }, [filteredPermissions, safePage])

  const rangeStart =
    filteredPermissions.length === 0
      ? 0
      : (safePage - 1) * ADD_MODAL_PAGE_SIZE + 1
  const rangeEnd =
    filteredPermissions.length === 0
      ? 0
      : rangeStart + paginatedPermissions.length - 1

  const handleSearchChange = value => {
    setSearchQuery(value)
    setPage(1)
  }

  return (
    <Dialog
      open={open}
      onClose={savingPermissionId ? undefined : onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      slotProps={{ paper: { className: styles.dialogPaper } }}
      aria-labelledby="add-role-permission-modal-title"
    >
      <DialogTitle
        id="add-role-permission-modal-title"
        className={styles.dialogHeader}
      >
        <div className={styles.headerTitleGroup}>
          <div className={styles.titleRow}>
            <PlaylistAddOutlined
              className={styles.headerIcon}
              aria-hidden="true"
            />
            <span>Thêm quyền hạn</span>
          </div>
          {roleName ? (
            <span className={styles.roleSubtitle}>
              Vai trò: <strong>{roleName}</strong>
            </span>
          ) : null}
        </div>
        <IconButton
          type="button"
          className={styles.closeIconBtn}
          onClick={onClose}
          disabled={Boolean(savingPermissionId)}
          aria-label="Đóng cửa sổ thêm quyền hạn"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <div
        className={styles.searchBar}
        role="search"
        aria-label="Tìm kiếm quyền hạn để thêm"
      >
        <div className={styles.searchControl}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            id="add-role-permission-search"
            type="search"
            className={styles.searchInput}
            placeholder="Tìm theo tên quyền, mô tả hoặc nhóm chức năng"
            value={searchQuery}
            onChange={event => handleSearchChange(event.target.value)}
            aria-label="Tìm kiếm quyền chưa được cấp"
          />
          {searchQuery ? (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => handleSearchChange("")}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <Close className={styles.clearIcon} />
            </button>
          ) : null}
        </div>
        <span className={styles.countSummary} aria-live="polite">
          {filteredPermissions.length} quyền khả dụng
        </span>
      </div>

      <DialogContent className={styles.dialogContent}>
        {loadingCatalog ? (
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={26} />
            <p className={styles.stateDesc}>Đang tải danh mục quyền hệ thống...</p>
          </div>
        ) : catalogError ? (
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              Không thể tải danh mục quyền hệ thống
            </p>
            <p className={styles.stateDesc}>{catalogError.message}</p>
            {onRetryCatalog ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.actionBtn}
                onClick={onRetryCatalog}
              >
                Thử lại
              </Button>
            ) : null}
          </div>
        ) : permissions.length === 0 ? (
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>
              Vai trò đã được cấp toàn bộ quyền hiện có
            </p>
            <p className={styles.stateDesc}>
              Không còn quyền hạn nào khác trong danh mục để thêm cho vai trò
              này.
            </p>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>Không tìm thấy quyền phù hợp</p>
            <p className={styles.stateDesc}>
              Thử đổi từ khóa tìm kiếm theo tên quyền hoặc nhóm chức năng.
            </p>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              className={styles.actionBtn}
              onClick={() => handleSearchChange("")}
            >
              Xóa từ khóa
            </Button>
          </div>
        ) : (
          <div className={styles.listContainer}>
            {paginatedPermissions.map(permission => {
              const checked = assignedIdsSet.has(permission.id)
              const canToggle = permission.isActive || checked
              const disabled = Boolean(savingPermissionId) || !canToggle

              return (
                <PermissionToggleRow
                  key={permission.id}
                  permission={permission}
                  checked={checked}
                  disabled={disabled}
                  saving={savingPermissionId === permission.id}
                  tooltip={
                    !canToggle
                      ? "Quyền đang tạm ngừng trên toàn hệ thống"
                      : checked
                        ? "Nhấn để tắt quyền này khỏi vai trò"
                        : "Nhấn để bật quyền này cho vai trò"
                  }
                  onToggle={onRequestTogglePermission}
                />
              )
            })}
          </div>
        )}
      </DialogContent>

      {!loadingCatalog && !catalogError && filteredPermissions.length > 0 ? (
        <div className={styles.paginationFooter}>
          <span className={styles.paginationInfo} aria-live="polite">
            Hiển thị {rangeStart}–{rangeEnd} trong {filteredPermissions.length}{" "}
            quyền
          </span>
          {isMobile ? (
            <div className={styles.mobilePagination}>
              <Button
                type="button"
                variant="outlined"
                className={styles.mobilePageBtn}
                disabled={safePage <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                startIcon={<KeyboardArrowLeft />}
              >
                Trước
              </Button>
              <span className={styles.mobilePageText}>
                Trang {safePage}/{totalPages}
              </span>
              <Button
                type="button"
                variant="outlined"
                className={styles.mobilePageBtn}
                disabled={safePage >= totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                endIcon={<KeyboardArrowRight />}
              >
                Sau
              </Button>
            </div>
          ) : (
            <Pagination
              page={safePage}
              count={totalPages}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
              size="small"
              siblingCount={1}
              boundaryCount={1}
              getItemAriaLabel={(type, number) =>
                type === "page"
                  ? `Trang ${number}`
                  : type === "next"
                    ? "Trang sau"
                    : "Trang trước"
              }
            />
          )}
        </div>
      ) : null}

      <DialogActions className={styles.dialogActions}>
        <Button
          type="button"
          variant="outlined"
          className={styles.closeFooterBtn}
          onClick={onClose}
          disabled={Boolean(savingPermissionId)}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

AddRolePermissionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  roleName: PropTypes.string,
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
  assignedIdsSet: PropTypes.instanceOf(Set).isRequired,
  loadingCatalog: PropTypes.bool,
  catalogError: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  savingPermissionId: PropTypes.string,
  onRetryCatalog: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onRequestTogglePermission: PropTypes.func.isRequired,
}

export default AddRolePermissionModal
