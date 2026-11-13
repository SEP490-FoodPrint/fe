import React, { useEffect, useRef, useState } from "react"
import { CheckCircle2, AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react"
import { getDeliveryInspections, getDeliveryInspection, decideDeliveryInspection } from "src/services/DeliveryInspectionService"
import DeliveryHeader from "./component/DeliveryHeader"
import DeliveryKPICards from "./component/DeliveryKPICards"
import DeliveryFilterStrip from "./component/DeliveryFilterStrip"
import DeliveryTableView from "./component/DeliveryTableView"
import DeliveryMobileCards from "./component/DeliveryMobileCards"
import DeliveryEmptyState from "./component/DeliveryEmptyState"
import DeliveryDetailView from "./component/DeliveryDetailView"
import DeliveryApprovalModal from "./component/DeliveryApprovalModal"
import styles from "./index.module.scss"

const getTodayDateString = () => {
  const now = new Date()
  const offset = 7 * 60 * 60 * 1000
  return new Date(now.getTime() + offset).toISOString().slice(0, 10)
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages]
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
}

export default function IngredientInspect() {
  const [deliveries, setDeliveries] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [deliveryForApproval, setDeliveryForApproval] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState("")
  const [successToast, setSuccessToast] = useState("")
  const [cancelToast, setCancelToast] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState(getTodayDateString)
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const selectionRevision = useRef(0)
  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "ALL" || (dateFilter && dateFilter !== getTodayDateString()))

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    const timer = setTimeout(() => {
      const query = { page, limit: 20 }
      if (searchTerm.trim()) query.search = searchTerm.trim()
      if (statusFilter !== "ALL") query.status = statusFilter
      if (dateFilter) query.date = dateFilter
      getDeliveryInspections(query, controller.signal)
        .then(data => {
          if (!controller.signal.aborted) { setDeliveries(data.items); setStats(data.stats); setPagination(data.pagination) }
        })
        .catch(failure => { if (!controller.signal.aborted) setError(failure.message || "Không tải được đợt giao.") })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [searchTerm, statusFilter, dateFilter, page, revision])

  useEffect(() => {
    if (!successToast) return
    const timer = setTimeout(() => setSuccessToast(""), 6000)
    return () => clearTimeout(timer)
  }, [successToast])
  useEffect(() => () => { selectionRevision.current++ }, [])
  const changeFilter = setter => value => { setPage(1); setter(value) }
  const resetFilters = () => { setSearchTerm(""); setStatusFilter("ALL"); setDateFilter(getTodayDateString()); setPage(1) }

  const openDelivery = async delivery => {
    const version = ++selectionRevision.current
    setDetailLoading(true)
    setError("")
    try {
      const data = await getDeliveryInspection(delivery.id)
      if (version === selectionRevision.current) setSelectedDelivery(data)
    } catch (failure) { if (version === selectionRevision.current) setError(failure.message) }
    finally { if (version === selectionRevision.current) setDetailLoading(false) }
  }

  const submitApproval = async (decision, reason) => {
    if (!deliveryForApproval) return
    const version = selectionRevision.current
    const result = await decideDeliveryInspection(deliveryForApproval.id, decision, reason)
    setDeliveryForApproval(null)
    setCancelToast(Boolean(result.cancellationNotice))
    setRevision(value => value + 1)
    setSelectedDelivery(previous => previous ? { ...previous, ...result } : previous)
    setSuccessToast(result.cancellationNotice || (result.status === "RECEIVED" ? "Đủ 4 bên đồng ý. Đợt giao đã được tiếp nhận." : decision === "REJECT" ? "Đã từ chối đợt giao. Cần giao lại và kiểm tra mới." : "Đã lưu quyết định của bộ phận bạn. Đang chờ các bên còn lại."))
    // The decision is committed; a failed detail refresh must not look like a failed write.
    try {
      const refreshed = await getDeliveryInspection(deliveryForApproval.id)
      if (version === selectionRevision.current) setSelectedDelivery(refreshed)
    }
    catch (failure) { setError(`Đã lưu quyết định; chưa tải lại được chi tiết: ${failure.message}`) }
  }

  const totalItems = pagination?.totalItems ?? deliveries.length
  const limit = pagination?.limit || 20
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil(totalItems / limit))
  const fromItem = totalItems === 0 ? 0 : (page - 1) * limit + 1
  const toItem = Math.min(page * limit, totalItems)
  const pageNumbers = getPageNumbers(page, totalPages)

  return <div className={styles.pageContainer}>
    {successToast && <div className={`${styles.toastSuccess} ${cancelToast ? styles.toastCancellation : ""}`} role={cancelToast ? "alert" : "status"}><div className={styles.toastContent}>{cancelToast ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}<span>{successToast}</span></div><button type="button" onClick={() => setSuccessToast("")} aria-label="Đóng thông báo"><X size={15} /></button></div>}
    {error && <p role="alert">{error} <button type="button" onClick={() => { setRevision(value => value + 1); if (selectedDelivery) openDelivery(selectedDelivery) }}>Thử lại</button></p>}
    {detailLoading && <p role="status">Đang tải chi tiết đợt giao…</p>}
    {selectedDelivery ? <DeliveryDetailView delivery={selectedDelivery} onBack={() => { selectionRevision.current++; setSelectedDelivery(null) }} onOpenApprovalModal={setDeliveryForApproval} /> : <div className={styles.viewContent}>
      <DeliveryHeader />
      {!loading && !error && <DeliveryKPICards stats={stats} />}
      <DeliveryFilterStrip searchTerm={searchTerm} onSearchChange={changeFilter(setSearchTerm)} statusFilter={statusFilter} onStatusChange={changeFilter(setStatusFilter)} dateFilter={dateFilter} onDateChange={changeFilter(setDateFilter)} onResetFilters={resetFilters} hasActiveFilters={hasActiveFilters} />
      {loading ? <p role="status">Đang tải các đợt giao từ hệ thống…</p> : !error && (deliveries.length ? <>
        <div className={styles.desktopViewWrap}><DeliveryTableView deliveries={deliveries} onSelectDelivery={openDelivery} /></div>
        <div className={styles.mobileViewWrap}><DeliveryMobileCards deliveries={deliveries} onSelectDelivery={openDelivery} /></div>
        <div className={styles.paginationLeftWrap}>
          <div className={styles.paginationInfo}>
            Hiển thị <strong>{fromItem}–{toItem}</strong> trên <strong>{totalItems}</strong> đợt giao
          </div>
          {totalPages > 1 && (
            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage(value => Math.max(1, value - 1))}
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
                <span>Trước</span>
              </button>

              <div className={styles.pagePills}>
                {pageNumbers.map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>
                      …
                    </span>
                  ) : (
                    <button
                      key={`page-${item}`}
                      type="button"
                      className={`${styles.pageNumberBtn} ${item === page ? styles.activePageNumber : ""}`}
                      onClick={() => setPage(item)}
                      aria-current={item === page ? "page" : undefined}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(value => Math.min(totalPages, value + 1))}
                aria-label="Trang sau"
              >
                <span>Sau</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </> : <DeliveryEmptyState onResetFilters={hasActiveFilters ? resetFilters : null} />)}
    </div>}
    {deliveryForApproval && <DeliveryApprovalModal delivery={deliveryForApproval} onClose={() => setDeliveryForApproval(null)} onSubmitApproval={submitApproval} />}
  </div>
}
