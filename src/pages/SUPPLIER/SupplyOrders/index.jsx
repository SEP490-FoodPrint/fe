import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { RefreshOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import SupplierDeliveryService, {
  DELIVERY_SOURCE_TYPE,
  extractApiError as extractDeliveryApiError,
  generateIdempotencyKey,
  ORDER_CREATION_STAGE,
  buildArrivalIso,
} from "src/services/SupplierDeliveryService"
import SupplierOrderService, {
  extractApiError,
  SUPPLY_ORDER_STATUS,
} from "src/services/SupplierOrderService"
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

  const [fulfillmentStage, setFulfillmentStage] = useState(
    ORDER_CREATION_STAGE.INGREDIENTS,
  )
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState("")
  const [createdDelivery, setCreatedDelivery] = useState(null)
  const [pendingDispatchDelivery, setPendingDispatchDelivery] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)
  const deliveryIdempotencyKeyRef = useRef(generateIdempotencyKey())

  const rotateDeliveryKey = useCallback(() => {
    deliveryIdempotencyKeyRef.current = generateIdempotencyKey()
  }, [])

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
    setCreatedDelivery(null)
    setPendingDispatchDelivery(null)
    setFulfillmentStage(ORDER_CREATION_STAGE.INGREDIENTS)
    setAcceptError("")
    rotateDeliveryKey()
  }, [id, rotateDeliveryKey])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailOrder(null)
      setDetailError(null)
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

  const handleAcceptOrder = async () => {
    if (!detailOrder?.id || accepting) return
    if (detailOrder.status !== SUPPLY_ORDER_STATUS.SENT) return
    setAccepting(true)
    setAcceptError("")

    const orderId = detailOrder.id
    try {
      const accepted = await SupplierOrderService.accept(orderId)
      setDetailOrder(prev =>
        prev
          ? {
              ...prev,
              status: accepted.status || SUPPLY_ORDER_STATUS.ACCEPTED,
              acceptedByUserId: accepted.acceptedByUserId,
              acceptedAt: accepted.acceptedAt,
            }
          : prev,
      )
      setFulfillmentStage(ORDER_CREATION_STAGE.INGREDIENTS)
      rotateDeliveryKey()
      notice({
        msg: `Đã tiếp nhận ${detailOrder.requestNo || "đơn hàng"} — Trạng thái: Đã xác nhận.`,
        isSuccess: true,
      })
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

  const handleChangeFulfillmentStage = nextStage => {
    setAcceptError("")
    setFulfillmentStage(nextStage)
  }

  const handleSubmitDelivery = async ({
    sources = [],
    expectedArrivalLocal = "",
    allowFutureDate = false,
    vehiclePlate = "",
    note = "",
  } = {}) => {
    if (!detailOrder?.id || accepting) return
    setAccepting(true)
    setAcceptError("")

    const orderId = detailOrder.id
    try {
      let activeDraft =
        pendingDispatchDelivery &&
        pendingDispatchDelivery.supplyRequestId === orderId
          ? pendingDispatchDelivery
          : null

      if (!activeDraft) {
        activeDraft = await SupplierDeliveryService.create(
          {
            sourceType: DELIVERY_SOURCE_TYPE.REQUEST,
            supplyRequestId: orderId,
            sources,
            note,
          },
          deliveryIdempotencyKeyRef.current,
        )
        setPendingDispatchDelivery(activeDraft)
      }

      const expectedArrivalAt = buildArrivalIso(expectedArrivalLocal, { allowFutureDate })
      const delivery = await SupplierDeliveryService.dispatch(activeDraft.id, {
        expectedArrivalAt,
        vehiclePlate,
      })

      setPendingDispatchDelivery(null)
      setCreatedDelivery({
        id: delivery.id,
        deliveryNo: delivery.deliveryNo,
        supplyRequestId: orderId,
      })
      setDetailOrder(prev =>
        prev
          ? {
              ...prev,
              status: SUPPLY_ORDER_STATUS.IN_PROGRESS,
            }
          : prev,
      )
      notice({
        msg: `Đã tạo đơn giao ${delivery.deliveryNo || ""} — Trạng thái: Đang giao hàng kèm nhãn QR bao bì.`,
        isSuccess: true,
      })
      setReloadTick(prev => prev + 1)
    } catch (error) {
      const deliveryErr = extractDeliveryApiError(
        error,
        "Không thể tạo đơn giao hàng từ yêu cầu này. Vui lòng thử lại.",
      )
      if (
        !pendingDispatchDelivery &&
        deliveryErr.status === 409 &&
        String(deliveryErr.message || "").includes("Idempotency-Key")
      ) {
        rotateDeliveryKey()
      }
      setAcceptError(deliveryErr.message)
    } finally {
      setAccepting(false)
    }
  }

  if (isDetailView) {
    return (
      <OrderDetailView
        order={detailOrder}
        createdDelivery={createdDelivery}
        pendingDispatchDelivery={pendingDispatchDelivery}
        fulfillmentStage={fulfillmentStage}
        loading={loadingDetail}
        error={detailError}
        accepting={accepting}
        acceptError={acceptError}
        onRetry={refreshCurrent}
        onAcceptOrder={handleAcceptOrder}
        onChangeFulfillmentStage={handleChangeFulfillmentStage}
        onSubmitDelivery={handleSubmitDelivery}
        onDraftChange={rotateDeliveryKey}
      />
    )
  }

  return (
    <div className={styles.supplyOrdersPage}>
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Đơn hàng từ nhà trường</h1>
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
