import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Alert, Button } from "@mui/material"
import { Add, ErrorOutlineOutlined, ReplayOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import SupplierStaffService, {
  extractApiError,
  STAFF_STATUS,
} from "src/services/SupplierStaffService"
import ConfirmStaffStatusDialog from "./component/ConfirmStaffStatusDialog"
import StaffCreateModal from "./component/StaffCreateModal"
import StaffDetailView from "./component/StaffDetailView"
import StaffFilterBar from "./component/StaffFilterBar"
import StaffListView from "./component/StaffListView"
import styles from "./SupplierStaff.module.scss"

const DEFAULT_PAGE_SIZE = 20

function SupplierStaff() {
  const { id } = useParams()
  const isDetailView = Boolean(id)
  // Backend trả trạng thái tiếp nhận của NCC kèm danh sách nhân viên (GET /supplier-staff)
  const [supplierIntakeState, setSupplierIntakeState] = useState(null)
  const isInspectionPaused =
    supplierIntakeState === "PAUSED_FOR_FOOD_SAFETY_INSPECTION"

  const [staffList, setStaffList] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState(null)
  const [listReloadTick, setListReloadTick] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createFieldErrors, setCreateFieldErrors] = useState({})

  const [detailStaff, setDetailStaff] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  const [permissions, setPermissions] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [permissionsError, setPermissionsError] = useState(null)
  const [permissionsReloadTick, setPermissionsReloadTick] = useState(0)
  const [togglingPermissionId, setTogglingPermissionId] = useState(null)

  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null)
  const [changingStatus, setChangingStatus] = useState(false)
  const [conflictAlert, setConflictAlert] = useState("")

  useEffect(() => {
    setConflictAlert("")
  }, [id, isDetailView])

  useEffect(() => {
    if (isDetailView) return undefined

    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SupplierStaffService.list({
      page: pagination.page,
      limit: pagination.limit,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setStaffList(result.items)
        setSupplierIntakeState(result.supplierIntakeState)
        setPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setListError(
          extractApiError(error, "Không thể tải danh sách nhân viên."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingList(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, pagination.page, pagination.limit, listReloadTick])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailStaff(null)
      setDetailError(null)
      setPermissions([])
      setPermissionsError(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierStaffService.getById(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setDetailStaff(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setDetailStaff(null)
        setDetailError(
          extractApiError(error, "Không thể tải chi tiết tài khoản nhân viên."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, id, detailReloadTick])

  useEffect(() => {
    if (
      !isDetailView ||
      !detailStaff?.id ||
      detailStaff.status !== STAFF_STATUS.ACTIVE
    ) {
      setPermissions([])
      setPermissionsError(null)
      setLoadingPermissions(false)
      return undefined
    }

    const controller = new AbortController()
    setLoadingPermissions(true)
    setPermissionsError(null)

    SupplierStaffService.getPermissions(detailStaff.id, {
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setPermissions(result.permissions)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setPermissions([])
        setPermissionsError(
          extractApiError(error, "Không thể tải danh sách quyền thao tác."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingPermissions(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, detailStaff?.id, detailStaff?.status, permissionsReloadTick])

  const filteredStaffList = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return staffList.filter(staff => {
      if (statusFilter !== "ALL" && staff.status !== statusFilter) {
        return false
      }
      if (!keyword) return true
      const targetText = [
        staff.fullName,
        staff.username,
        staff.email,
        staff.phone || "",
      ]
        .join(" ")
        .toLowerCase()
      return targetText.includes(keyword)
    })
  }, [staffList, searchQuery, statusFilter])

  const hasActiveFilters = Boolean(searchQuery.trim()) || statusFilter !== "ALL"

  const handleResetFilters = useCallback(() => {
    setSearchQuery("")
    setStatusFilter("ALL")
  }, [])

  const handleOpenCreateModal = useCallback(() => {
    setCreateError("")
    setCreateFieldErrors({})
    setCreateOpen(true)
  }, [])

  const handleCloseCreateModal = useCallback(() => {
    if (creating) return
    setCreateOpen(false)
    setCreateError("")
    setCreateFieldErrors({})
  }, [creating])

  const handleCreateSubmit = useCallback(async values => {
    setCreating(true)
    setCreateError("")
    setCreateFieldErrors({})
    setConflictAlert("")

    try {
      const created = await SupplierStaffService.create(values)
      setCreateOpen(false)
      notice({
        msg: "Đã tạo tài khoản nhân viên",
        desc: `${created.fullName} đã có thể đăng nhập`,
        isSuccess: true,
      })
      setPagination(prev => ({ ...prev, page: 1 }))
      setListReloadTick(prev => prev + 1)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể tạo tài khoản nhân viên.",
      )
      setCreateFieldErrors(parsed.fields || {})
      setCreateError(parsed.message)
      if (parsed.status === 409) {
        setConflictAlert(parsed.message)
        notice({
          msg: "Không thể tạo tài khoản nhân viên",
          desc: parsed.message,
          isSuccess: false,
        })
        setListReloadTick(prev => prev + 1)
      }
    } finally {
      setCreating(false)
    }
  }, [])

  const handleConfirmStatusChange = useCallback(async () => {
    if (!detailStaff?.id || !statusConfirmTarget) return

    setChangingStatus(true)
    setConflictAlert("")
    try {
      const updated = await SupplierStaffService.changeStatus(
        detailStaff.id,
        statusConfirmTarget,
      )
      setDetailStaff(updated)
      setStatusConfirmTarget(null)
      notice({
        msg:
          statusConfirmTarget === STAFF_STATUS.LOCKED
            ? "Đã khóa tài khoản nhân viên"
            : "Đã mở khóa tài khoản nhân viên",
        isSuccess: true,
      })
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể cập nhật trạng thái tài khoản.",
      )
      if (parsed.status === 409) {
        setStatusConfirmTarget(null)
        setConflictAlert(parsed.message)
        setDetailReloadTick(prev => prev + 1)
      }
      notice({
        msg: "Cập nhật trạng thái thất bại",
        desc: parsed.message,
        isSuccess: false,
      })
    } finally {
      setChangingStatus(false)
    }
  }, [detailStaff?.id, statusConfirmTarget])

  const handleTogglePermission = useCallback(
    async permission => {
      if (!detailStaff?.id || !permission?.id) return
      setTogglingPermissionId(permission.id)

      try {
        const result = permission.enabled
          ? await SupplierStaffService.disablePermission(
              detailStaff.id,
              permission.id,
            )
          : await SupplierStaffService.enablePermission(
              detailStaff.id,
              permission.id,
            )
        setPermissions(result.permissions)
        notice({
          msg: permission.enabled
            ? `Đã tắt quyền "${permission.name}"`
            : `Đã bật quyền "${permission.name}"`,
          isSuccess: true,
        })
      } catch (error) {
        const parsed = extractApiError(
          error,
          "Không thể cập nhật phân quyền nhân viên.",
        )
        notice({
          msg: "Cập nhật quyền thất bại",
          desc: parsed.message,
          isSuccess: false,
        })
      } finally {
        setTogglingPermissionId(null)
      }
    },
    [detailStaff?.id],
  )

  if (isDetailView) {
    return (
      <div className={styles.staffPage}>
        {isInspectionPaused ? (
          <Alert severity="warning" role="status">
            Đơn vị đang tạm dừng tiếp nhận để kiểm tra ATTP — không thể tạo mới
            hoặc mở khóa tài khoản nhân viên cho đến khi cơ quan chức năng khôi
            phục.
          </Alert>
        ) : null}

        {conflictAlert ? (
          <Alert
            severity="error"
            role="alert"
            onClose={() => setConflictAlert("")}
          >
            {conflictAlert}
          </Alert>
        ) : null}

        <StaffDetailView
          staff={detailStaff}
          loading={loadingDetail}
          error={detailError}
          permissions={permissions}
          loadingPermissions={loadingPermissions}
          permissionsError={permissionsError}
          togglingPermissionId={togglingPermissionId}
          onRetryDetail={() => setDetailReloadTick(prev => prev + 1)}
          onRetryPermissions={() =>
            setPermissionsReloadTick(prev => prev + 1)
          }
          onRequestStatusChange={targetStatus =>
            setStatusConfirmTarget(targetStatus)
          }
          onTogglePermission={handleTogglePermission}
        />

        <ConfirmStaffStatusDialog
          open={Boolean(statusConfirmTarget)}
          staff={detailStaff}
          targetStatus={statusConfirmTarget || STAFF_STATUS.LOCKED}
          submitting={changingStatus}
          onClose={() => {
            if (!changingStatus) setStatusConfirmTarget(null)
          }}
          onConfirm={handleConfirmStatusChange}
        />
      </div>
    )
  }

  return (
    <div className={styles.staffPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Quản lý nhân viên</h1>
        </div>
        <Button
          type="button"
          variant="contained"
          color="primary"
          startIcon={<Add />}
          className={styles.primaryActionBtn}
          onClick={handleOpenCreateModal}
        >
          Tạo nhân viên
        </Button>
      </div>

      {isInspectionPaused ? (
        <Alert severity="warning" role="status">
          Đơn vị đang tạm dừng tiếp nhận để kiểm tra ATTP — không thể tạo mới
          hoặc mở khóa tài khoản nhân viên cho đến khi cơ quan chức năng khôi
          phục.
        </Alert>
      ) : null}

      {conflictAlert ? (
        <Alert
          severity="error"
          role="alert"
          onClose={() => setConflictAlert("")}
        >
          {conflictAlert}
        </Alert>
      ) : null}

      <section className={styles.surface} aria-label="Danh sách nhân viên">
        <StaffFilterBar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          visibleCount={filteredStaffList.length}
          totalCount={staffList.length}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />

        {listError ? (
          <div className={styles.errorState} role="alert">
            <div className={styles.errorIconWrap} aria-hidden="true">
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.errorTitle}>
              {listError.status === 403
                ? "Bạn không có quyền quản lý nhân viên"
                : "Không thể tải danh sách nhân viên"}
            </p>
            <p className={styles.errorDesc}>{listError.message}</p>
            {listError.status !== 403 ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.retryBtn}
                onClick={() => setListReloadTick(prev => prev + 1)}
              >
                Thử lại
              </Button>
            ) : null}
          </div>
        ) : (
          <StaffListView
            staffList={filteredStaffList}
            pageTotalCount={staffList.length}
            loading={loadingList}
            hasActiveFilters={hasActiveFilters}
            pagination={pagination}
            onResetFilters={handleResetFilters}
            onOpenCreate={handleOpenCreateModal}
            onPageChange={nextPage =>
              setPagination(prev => ({ ...prev, page: nextPage }))
            }
          />
        )}
      </section>

      <StaffCreateModal
        open={createOpen}
        submitting={creating}
        serverError={createError}
        serverFieldErrors={createFieldErrors}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
      />
    </div>
  )
}

export default SupplierStaff
