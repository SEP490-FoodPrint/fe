import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { ErrorOutlineOutlined, ReplayOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import SystemConfigService, {
  buildNextRolePermissionIds,
  extractApiError,
  getUnassignedCatalogPermissions,
} from "src/services/SystemConfigService"
import AddRolePermissionModal from "./component/AddRolePermissionModal"
import ConfirmPermissionToggleDialog from "./component/ConfirmPermissionToggleDialog"
import RoleDetailView from "./component/RoleDetailView"
import RoleFilterBar from "./component/RoleFilterBar"
import RoleListView from "./component/RoleListView"
import styles from "./SystemConfig.module.scss"

function SystemConfig() {
  const { id } = useParams()
  const isDetailView = Boolean(id)

  const [roles, setRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [rolesError, setRolesError] = useState(null)
  const [rolesReloadTick, setRolesReloadTick] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")

  const [roleDetail, setRoleDetail] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [modalSnapshotPermissions, setModalSnapshotPermissions] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [catalogError, setCatalogError] = useState(null)
  const catalogAbortRef = useRef(null)

  const [pendingToggle, setPendingToggle] = useState(null)
  const [savingPermissionId, setSavingPermissionId] = useState(null)

  useEffect(() => {
    if (isDetailView) return undefined

    const controller = new AbortController()
    setLoadingRoles(true)
    setRolesError(null)

    SystemConfigService.listAllManageableRoles({ signal: controller.signal })
      .then(items => {
        if (controller.signal.aborted) return
        setRoles(items)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setRolesError(
          extractApiError(error, "Không thể tải danh sách vai trò hệ thống."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingRoles(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, rolesReloadTick])

  useEffect(() => {
    if (!isDetailView || !id) {
      catalogAbortRef.current?.abort()
      setRoleDetail(null)
      setDetailError(null)
      setAddModalOpen(false)
      setModalSnapshotPermissions([])
      setCatalogError(null)
      setPendingToggle(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)
    setPendingToggle(null)

    SystemConfigService.getRolePermissions(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setRoleDetail(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setRoleDetail(null)
        setDetailError(
          extractApiError(error, "Không thể tải danh sách quyền của vai trò."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false)
        }
      })

    return () => {
      controller.abort()
      catalogAbortRef.current?.abort()
    }
  }, [isDetailView, id, detailReloadTick])

  const loadUnassignedPermissionsForModal = useCallback(
    currentRolePermissions => {
      catalogAbortRef.current?.abort()
      const controller = new AbortController()
      catalogAbortRef.current = controller

      setLoadingCatalog(true)
      setCatalogError(null)

      SystemConfigService.listAllPermissions({ signal: controller.signal })
        .then(allCatalog => {
          if (controller.signal.aborted) return
          setModalSnapshotPermissions(
            getUnassignedCatalogPermissions(allCatalog, currentRolePermissions),
          )
        })
        .catch(error => {
          if (error?.name === "CanceledError" || controller.signal.aborted)
            return
          setCatalogError(
            extractApiError(error, "Không thể tải danh mục quyền hệ thống."),
          )
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoadingCatalog(false)
          }
        })
    },
    [],
  )

  const handleOpenAddModal = useCallback(() => {
    if (!roleDetail?.editable) return
    setAddModalOpen(true)
    loadUnassignedPermissionsForModal(roleDetail.permissions || [])
  }, [roleDetail, loadUnassignedPermissionsForModal])

  const handleCloseAddModal = useCallback(() => {
    if (savingPermissionId) return
    catalogAbortRef.current?.abort()
    setAddModalOpen(false)
  }, [savingPermissionId])

  const filteredRoles = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return roles.filter(role => {
      if (typeFilter !== "ALL" && role.type !== typeFilter) {
        return false
      }
      if (!keyword) return true
      const haystack = [role.displayName, role.name, role.code, role.typeLabel]
        .join(" ")
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [roles, searchQuery, typeFilter])

  const hasActiveFilters = Boolean(searchQuery.trim()) || typeFilter !== "ALL"

  const handleResetFilters = useCallback(() => {
    setSearchQuery("")
    setTypeFilter("ALL")
  }, [])

  const assignedPermissions = useMemo(
    () =>
      (roleDetail?.permissions || []).slice().sort((a, b) =>
        String(a.code || "").localeCompare(String(b.code || ""), "en"),
      ),
    [roleDetail?.permissions],
  )

  const assignedIdsSet = useMemo(
    () => new Set(assignedPermissions.map(item => item.id)),
    [assignedPermissions],
  )

  const handleRequestTogglePermission = useCallback(
    (permission, currentAssigned) => {
      if (!roleDetail?.editable || savingPermissionId || !permission?.id) return
      setPendingToggle({
        permission,
        nextAssigned: !currentAssigned,
      })
    },
    [roleDetail?.editable, savingPermissionId],
  )

  const handleCloseConfirmDialog = useCallback(() => {
    if (savingPermissionId) return
    setPendingToggle(null)
  }, [savingPermissionId])

  const handleConfirmTogglePermission = useCallback(async () => {
    if (!roleDetail?.id || !pendingToggle?.permission?.id) return

    const { permission, nextAssigned } = pendingToggle
    const currentAssignedIds = (roleDetail.permissions || []).map(
      item => item.id,
    )
    const nextPermissionIds = buildNextRolePermissionIds(
      currentAssignedIds,
      permission.id,
      nextAssigned,
    )

    setSavingPermissionId(permission.id)
    try {
      await SystemConfigService.replaceRolePermissions(
        roleDetail.id,
        nextPermissionIds,
      )

      const refreshedRole = await SystemConfigService.getRolePermissions(
        roleDetail.id,
      )
      setRoleDetail(refreshedRole)
      setPendingToggle(null)

      notice({
        msg: nextAssigned
          ? `Đã bật quyền "${permission.name}"`
          : `Đã tắt quyền "${permission.name}"`,
        desc: `Áp dụng cho vai trò ${refreshedRole.displayName}.`,
        isSuccess: true,
      })
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể cập nhật quyền của vai trò.",
      )
      setPendingToggle(null)
      notice({
        msg: "Cập nhật phân quyền thất bại",
        desc: parsed.message,
        isSuccess: false,
      })
      if (parsed.status === 400 || parsed.status === 403 || parsed.status === 404) {
        setDetailReloadTick(prev => prev + 1)
      }
    } finally {
      setSavingPermissionId(null)
    }
  }, [roleDetail, pendingToggle])

  if (isDetailView) {
    return (
      <>
        <RoleDetailView
          role={roleDetail}
          permissions={assignedPermissions}
          loading={loadingDetail}
          error={detailError}
          savingPermissionId={savingPermissionId}
          onRetry={() => setDetailReloadTick(prev => prev + 1)}
          onOpenAddModal={handleOpenAddModal}
          onRequestTogglePermission={handleRequestTogglePermission}
        />

        <AddRolePermissionModal
          open={addModalOpen}
          roleName={roleDetail?.displayName || ""}
          permissions={modalSnapshotPermissions}
          assignedIdsSet={assignedIdsSet}
          loadingCatalog={loadingCatalog}
          catalogError={catalogError}
          savingPermissionId={savingPermissionId}
          onRetryCatalog={() =>
            loadUnassignedPermissionsForModal(roleDetail?.permissions || [])
          }
          onClose={handleCloseAddModal}
          onRequestTogglePermission={handleRequestTogglePermission}
        />

        <ConfirmPermissionToggleDialog
          open={Boolean(pendingToggle)}
          roleName={roleDetail?.displayName || ""}
          permission={pendingToggle?.permission || null}
          nextAssigned={Boolean(pendingToggle?.nextAssigned)}
          submitting={Boolean(savingPermissionId)}
          onClose={handleCloseConfirmDialog}
          onConfirm={handleConfirmTogglePermission}
        />
      </>
    )
  }

  return (
    <div className={styles.configPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Cấu hình hệ thống</h1>
        </div>
      </div>

      <section className={styles.surface} aria-label="Danh sách vai trò trên hệ thống">
        {rolesError && !loadingRoles ? (
          <div className={styles.errorState} role="alert">
            <div className={styles.errorIconWrap} aria-hidden="true">
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.errorTitle}>
              {rolesError.status === 403
                ? "Bạn không có quyền truy cập cấu hình hệ thống"
                : "Không thể tải danh sách vai trò"}
            </p>
            <p className={styles.errorDesc}>{rolesError.message}</p>
            {rolesError.status !== 403 ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.retryBtn}
                onClick={() => setRolesReloadTick(prev => prev + 1)}
              >
                Thử lại
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <RoleFilterBar
              searchQuery={searchQuery}
              typeFilter={typeFilter}
              visibleCount={filteredRoles.length}
              totalCount={roles.length}
              onSearchChange={setSearchQuery}
              onTypeChange={setTypeFilter}
            />
            <RoleListView
              roles={filteredRoles}
              totalCount={roles.length}
              loading={loadingRoles}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          </>
        )}
      </section>
    </div>
  )
}

export default SystemConfig
