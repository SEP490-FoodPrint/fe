import React, { useCallback, useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Button } from "@mui/material"
import { Add, RefreshOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import ROUTER from "src/router/ROUTER"
import SupplierDeliveryService, {
  extractApiError,
} from "src/services/SupplierDeliveryService"
import DeliveryCreateView from "./component/DeliveryCreateView"
import DeliveryDetailView from "./component/DeliveryDetailView"
import DeliveryFilterBar from "./component/DeliveryFilterBar"
import DeliveryListView from "./component/DeliveryListView"
import styles from "./SupplierDeliveries.module.scss"

const DEFAULT_PAGE_SIZE = 20

function SupplierDeliveries({ mode = "auto" }) {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isCreateView = mode === "create" || id === "create"
  const isDetailView = !isCreateView && Boolean(id)
  const initialSupplyRequestId = searchParams.get("supplyRequestId") || ""

  const [deliveries, setDeliveries] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [sourceFilter, setSourceFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState(null)

  const [detailDelivery, setDetailDelivery] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)

  const refreshCurrent = useCallback(() => {
    setReloadTick(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (isCreateView || isDetailView) return undefined
    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SupplierDeliveryService.list({
      page: pagination.page,
      limit: pagination.limit,
      sourceType: sourceFilter,
      status: statusFilter,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setDeliveries(result.items)
        setPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setListError(
          extractApiError(error, "Không thể tải danh sách đơn giao hàng."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingList(false)
        }
      })

    return () => controller.abort()
  }, [
    isCreateView,
    isDetailView,
    pagination.page,
    pagination.limit,
    sourceFilter,
    statusFilter,
    reloadTick,
  ])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailDelivery(null)
      setDetailError(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierDeliveryService.getById(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setDetailDelivery(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setDetailDelivery(null)
        setDetailError(
          extractApiError(error, "Không thể tải chi tiết đơn giao hàng."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, id, reloadTick])

  const filteredDeliveries = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return deliveries
    return deliveries.filter(item => {
      const deliveryNo = String(item.deliveryNo || "").toLowerCase()
      const requestNo = String(item.requestNo || "").toLowerCase()
      const schoolName = String(item.schoolName || "").toLowerCase()
      const plate = String(item.vehiclePlate || "").toLowerCase()
      return (
        deliveryNo.includes(keyword) ||
        requestNo.includes(keyword) ||
        schoolName.includes(keyword) ||
        plate.includes(keyword)
      )
    })
  }, [deliveries, searchQuery])

  const handleSourceChange = nextSource => {
    setSourceFilter(nextSource)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = nextStatus => {
    setStatusFilter(nextStatus)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setSourceFilter("ALL")
    setStatusFilter("ALL")
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = nextPage => {
    if (nextPage < 1 || nextPage === pagination.page) return
    setPagination(prev => ({ ...prev, page: nextPage }))
  }

  const handleCreated = createdDelivery => {
    notice({
      msg: `Đã tạo đơn giao hàng ${createdDelivery.deliveryNo || ""} thành công.`,
      isSuccess: true,
    })
    if (createdDelivery?.id) {
      navigate(`${ROUTER.SUPPLIER_DELIVERIES}/${createdDelivery.id}`)
    } else {
      navigate(ROUTER.SUPPLIER_DELIVERIES)
    }
  }

  if (isCreateView) {
    return (
      <DeliveryCreateView
        initialSupplyRequestId={initialSupplyRequestId}
        onCreated={handleCreated}
      />
    )
  }

  if (isDetailView) {
    return (
      <DeliveryDetailView
        delivery={detailDelivery}
        loading={loadingDetail}
        error={detailError}
        onRetry={refreshCurrent}
      />
    )
  }

  return (
    <div className={styles.deliveriesPage}>
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Tạo & Quản lý Đơn giao hàng</h1>
          <p className={styles.pageSubtitle}>
            Lập phiếu giao nguyên liệu từ yêu cầu đã tiếp nhận hoặc tạo đơn giao
            độc lập gửi tới trường học.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            className={styles.refreshBtn}
            disabled={loadingList}
            startIcon={<RefreshOutlined className={styles.btnIcon} />}
            onClick={refreshCurrent}
          >
            Làm mới
          </Button>
          <Button
            component={Link}
            to={ROUTER.SUPPLIER_DELIVERY_CREATE}
            variant="contained"
            color="primary"
            className={styles.createBtn}
            startIcon={<Add className={styles.btnIcon} />}
          >
            Tạo đơn giao
          </Button>
        </div>
      </header>

      <section className={styles.surface} aria-label="Danh sách đơn giao hàng">
        <DeliveryFilterBar
          sourceFilter={sourceFilter}
          onSourceChange={handleSourceChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          visibleCount={filteredDeliveries.length}
          totalLoadedCount={deliveries.length}
        />

        {listError ? (
          <div className={styles.errorState}>
            <p className={styles.errorTitle}>
              {listError.status === 403
                ? "Bạn không có quyền truy cập đơn giao hàng"
                : "Không thể tải danh sách đơn giao hàng"}
            </p>
            <p className={styles.errorDesc}>{listError.message}</p>
            {listError.status !== 403 && (
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={refreshCurrent}
              >
                Thử lại
              </Button>
            )}
          </div>
        ) : (
          <DeliveryListView
            deliveries={filteredDeliveries}
            pageTotalCount={deliveries.length}
            loading={loadingList}
            hasActiveFilters={
              sourceFilter !== "ALL" ||
              statusFilter !== "ALL" ||
              searchQuery.trim().length > 0
            }
            pagination={pagination}
            onResetFilters={handleResetFilters}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  )
}

SupplierDeliveries.propTypes = {
  mode: PropTypes.oneOf(["auto", "create"]),
}

export default SupplierDeliveries
