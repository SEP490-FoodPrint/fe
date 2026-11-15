import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { RefreshOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import SupplierOrderService, {
  extractApiError,
  SUPPLY_ORDER_STATUS,
} from "src/services/SupplierOrderService"
import ConfirmAcceptDialog from "./component/ConfirmAcceptDialog"
import OrderDetailView from "./component/OrderDetailView"
import OrderFilterBar from "./component/OrderFilterBar"
import OrderListView from "./component/OrderListView"
import styles from "./SupplyOrders.module.scss"

const DEFAULT_PAGE_SIZE = 20

function SupplyOrders() {
  const { id } = useParams()
  const isDetailView = Boolean(id)

  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState(null)

  const [detailOrder, setDetailOrder] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState("")
  const [reloadTick, setReloadTick] = useState(0)

  const refreshCurrent = useCallback(() => {
    setReloadTick(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (isDetailView) return undefined
    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SupplierOrderService.list({
      page: pagination.page,
      limit: pagination.limit,
      status: statusFilter,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setOrders(result.items)
        setPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setListError(
          extractApiError(
            error,
            "Không thể tải danh sách đơn hàng từ nhà trường.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingList(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, pagination.page, pagination.limit, statusFilter, reloadTick])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailOrder(null)
      setDetailError(null)
      setAcceptDialogOpen(false)
      setAcceptError("")
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierOrderService.getById(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setDetailOrder(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setDetailOrder(null)
        setDetailError(
          extractApiError(error, "Không thể tải thông tin chi tiết đơn hàng."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, id, reloadTick])

  const filteredOrders = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return orders
    return orders.filter(order => {
      const code = String(order.requestNo || "").toLowerCase()
      const school = String(order.schoolName || "").toLowerCase()
      return code.includes(keyword) || school.includes(keyword)
    })
  }, [orders, searchQuery])

  const pendingOnPageCount = useMemo(
    () => orders.filter(order => order.status === SUPPLY_ORDER_STATUS.SENT).length,
    [orders],
  )

  const handleStatusChange = nextStatus => {
    setStatusFilter(nextStatus)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = nextPage => {
    if (nextPage < 1 || nextPage === pagination.page) return
    setPagination(prev => ({ ...prev, page: nextPage }))
  }

  const handleOpenAcceptDialog = () => {
    setAcceptError("")
    setAcceptDialogOpen(true)
  }

  const handleConfirmAccept = async () => {
    if (!detailOrder?.id || accepting) return
    setAccepting(true)
    setAcceptError("")
    try {
      const accepted = await SupplierOrderService.accept(detailOrder.id)
      setDetailOrder(prev =>
        prev
          ? {
              ...prev,
              status: accepted.status,
              acceptedByUserId: accepted.acceptedByUserId,
              acceptedAt: accepted.acceptedAt,
            }
          : prev,
      )
      setAcceptDialogOpen(false)
      notice({
        msg: `Đã tiếp nhận đơn hàng ${detailOrder.requestNo || ""} thành công.`,
        isSuccess: true,
      })
      setReloadTick(prev => prev + 1)
    } catch (error) {
      const apiErr = extractApiError(
        error,
        "Không thể tiếp nhận đơn hàng. Vui lòng thử lại.",
      )
      setAcceptError(apiErr.message)
    } finally {
      setAccepting(false)
    }
  }

  if (isDetailView) {
    return (
      <>
        <OrderDetailView
          order={detailOrder}
          loading={loadingDetail}
          error={detailError}
          accepting={accepting}
          onRetry={refreshCurrent}
          onRequestAccept={handleOpenAcceptDialog}
        />

        <ConfirmAcceptDialog
          open={acceptDialogOpen}
          order={detailOrder}
          submitting={accepting}
          error={acceptError}
          onCancel={() => {
            if (!accepting) setAcceptDialogOpen(false)
          }}
          onConfirm={handleConfirmAccept}
        />
      </>
    )
  }

  return (
    <div className={styles.supplyOrdersPage}>
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Đơn hàng từ nhà trường</h1>
          <p className={styles.pageSubtitle}>
            Theo dõi yêu cầu nhập nguyên liệu trường học gửi đến và xác nhận tiếp
            nhận đơn hàng.
          </p>
        </div>

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
      </header>

      <section className={styles.surface} aria-label="Danh sách đơn hàng cung ứng">
        <OrderFilterBar
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pendingCount={pendingOnPageCount}
          visibleCount={filteredOrders.length}
          totalLoadedCount={orders.length}
        />

        {listError ? (
          <div className={styles.errorState}>
            <p className={styles.errorTitle}>
              {listError.status === 403
                ? "Bạn không có quyền xem đơn hàng cung ứng"
                : "Không thể tải danh sách đơn hàng"}
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
          <OrderListView
            orders={filteredOrders}
            pageTotalCount={orders.length}
            loading={loadingList}
            hasActiveFilters={
              statusFilter !== "ALL" || searchQuery.trim().length > 0
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

export default SupplyOrders
