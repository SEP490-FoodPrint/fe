import React, { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ORG_TYPES, ROLES } from "src/constants/roles"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import SupplierEnforcementService, {
  extractApiError,
} from "src/services/SupplierEnforcementService"
import EnforcementDetailView from "./components/EnforcementDetailView"
import EnforcementListView from "./components/EnforcementListView"

const DEFAULT_PAGE_SIZE = 20

function SupplierEnforcement() {
  const { actionId } = useParams()
  const isDetailView = Boolean(actionId)
  const { userStore } = useContext(StoreContext)
  const currentUser = userStore?.user

  const role = currentUser?.role || currentUser?.roleCode || ""
  const orgType = currentUser?.orgType || ""
  const isSystemAdmin =
    role === ROLES.SYSTEM_ADMIN || orgType === ORG_TYPES.SYSTEM
  const isAuthority =
    role === ROLES.COMMUNE_FOOD_SAFETY_OFFICER ||
    orgType === ORG_TYPES.AUTHORITY

  const basePath = isSystemAdmin
    ? ROUTER.SYSTEM_ENFORCEMENT_ACTIONS
    : ROUTER.AUTHORITY_ENFORCEMENT_ACTIONS

  // List state
  const [actions, setActions] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [filters, setFilters] = useState({
    actionType: "",
    decisionStatus: "",
    executionStatus: "",
  })
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState(null)
  const [listReloadTick, setListReloadTick] = useState(0)

  // Detail state
  const [detailAction, setDetailAction] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  useEffect(() => {
    if (isDetailView) return undefined

    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SupplierEnforcementService.listActions(
      {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      },
      controller.signal,
    )
      .then(result => {
        if (controller.signal.aborted) return
        setActions(result.items)
        setPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setListError(
          extractApiError(
            error,
            "Không thể tải danh sách yêu cầu chế tài nhà cung cấp.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingList(false)
      })

    return () => controller.abort()
  }, [
    isDetailView,
    pagination.page,
    pagination.limit,
    filters,
    listReloadTick,
  ])

  useEffect(() => {
    if (!isDetailView || !actionId) {
      setDetailAction(null)
      setDetailError(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierEnforcementService.getActionDetail(actionId, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return
        setDetailAction(data)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setDetailAction(null)
        setDetailError(
          extractApiError(
            error,
            "Không thể tải chi tiết yêu cầu chế tài nhà cung cấp.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false)
      })

    return () => controller.abort()
  }, [isDetailView, actionId, detailReloadTick])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleResetFilters = () => {
    setFilters({
      actionType: "",
      decisionStatus: "",
      executionStatus: "",
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (isDetailView) {
    return (
      <EnforcementDetailView
        basePath={basePath}
        isSystemAdmin={isSystemAdmin}
        isAuthority={isAuthority}
        action={detailAction}
        loading={loadingDetail}
        error={detailError}
        onReload={() => setDetailReloadTick(prev => prev + 1)}
      />
    )
  }

  return (
    <EnforcementListView
      basePath={basePath}
      isSystemAdmin={isSystemAdmin}
      isAuthority={isAuthority}
      actions={actions}
      pagination={pagination}
      loading={loadingList}
      error={listError}
      filters={filters}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
      onPageChange={page => setPagination(prev => ({ ...prev, page }))}
      onRetry={() => setListReloadTick(prev => prev + 1)}
    />
  )
}

export default SupplierEnforcement
