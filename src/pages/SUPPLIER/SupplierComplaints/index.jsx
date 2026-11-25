import React, { useContext, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { ErrorOutlineOutlined, ReplayOutlined } from "@mui/icons-material"
import { TicketDetailView } from "src/components/ComplaintThread"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import SupplierComplaintService, {
  canViewSupplierComplaints,
  extractApiError,
} from "src/services/SupplierComplaintService"
import ComplaintFilterBar from "./component/ComplaintFilterBar"
import ComplaintListView from "./component/ComplaintListView"
import styles from "./SupplierComplaints.module.scss"

const DEFAULT_PAGE_SIZE = 20

function SupplierComplaints() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isDetailView = Boolean(id)
  const { userStore } = useContext(StoreContext) || {}
  const currentUser = userStore?.user

  const canView = canViewSupplierComplaints(currentUser)

  const [complaints, setComplaints] = useState([])
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

  const [detailTicket, setDetailTicket] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  useEffect(() => {
    if (isDetailView || !canView) return undefined

    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SupplierComplaintService.list({
      page: pagination.page,
      limit: pagination.limit,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setComplaints(result.items)
        setPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setListError(
          extractApiError(
            error,
            "Không thể tải danh sách khiếu nại chất lượng nguyên liệu.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingList(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, canView, pagination.page, pagination.limit, listReloadTick])

  useEffect(() => {
    if (!isDetailView || !id || !canView) {
      setDetailTicket(null)
      setDetailError(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierComplaintService.detail(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setDetailTicket(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setDetailTicket(null)
        setDetailError(
          extractApiError(error, "Không thể tải chi tiết khiếu nại."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, id, canView, detailReloadTick])

  const filteredComplaints = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return complaints.filter(item => {
      const statusVal = item.displayStatus || item.status
      if (statusFilter !== "ALL" && statusVal !== statusFilter) {
        return false
      }
      if (!keyword) return true
      const haystack = [
        item.code,
        item.title,
        item.school?.name,
        item.school?.code,
        item.delivery?.deliveryNo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [complaints, searchQuery, statusFilter])

  const hasActiveFilters = Boolean(
    searchQuery.trim() || statusFilter !== "ALL",
  )

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
  }

  const syncUpdatedTicket = updated => {
    setDetailTicket(updated)
    setComplaints(prev =>
      prev.map(item =>
        item.id === updated.id
          ? {
              ...item,
              status: updated.status,
              displayStatus: updated.displayStatus,
              hasNewMessage: updated.hasNewMessage,
              closedAt: updated.closedAt,
            }
          : item,
      ),
    )
  }

  if (!canView) {
    return (
      <div className={styles.complaintsPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headingGroup}>
            <h1 className={styles.pageTitle}>Danh sách khiếu nại</h1>
          </div>
        </div>
        <section className={styles.surface}>
          <div className={styles.errorState} role="alert">
            <div className={styles.errorIconWrap} aria-hidden="true">
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.errorTitle}>
              Bạn không có quyền xem danh sách khiếu nại
            </p>
            <p className={styles.errorDesc}>
              Tài khoản hiện tại chưa được cấp quyền xem chi tiết khiếu nại chất
              lượng nguyên liệu từ nhà trường.
            </p>
          </div>
        </section>
      </div>
    )
  }

  if (isDetailView) {
    const schoolLabel = detailTicket?.school
      ? `${detailTicket.school.name}${detailTicket.school.code ? ` (${detailTicket.school.code})` : ""}`
      : "—"

    const metaItems = detailTicket
      ? [
          {
            label: "Trường gửi",
            value: schoolLabel,
          },
          {
            label: "Chuyến giao",
            value: detailTicket.delivery?.deliveryNo || "—",
          },
          {
            label: "Lô nguyên liệu",
            value:
              detailTicket.ingredientLot?.lotCode || "Toàn bộ chuyến giao",
            chip: true,
          },
        ]
      : []

    const detailExtra = detailTicket?.submittedBy ? (
      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
        <strong style={{ color: "var(--text-primary)" }}>Người gửi:</strong>{" "}
        {detailTicket.submittedBy.fullName}
      </div>
    ) : null

    return (
      <TicketDetailView
        ticket={detailTicket}
        loading={loadingDetail}
        error={detailError}
        backLabel="Quay lại danh sách khiếu nại"
        onBack={() => navigate(ROUTER.SUPPLIER_COMPLAINTS)}
        onReload={() => setDetailReloadTick(prev => prev + 1)}
        metaItems={metaItems}
        detailExtra={detailExtra}
        onAccept={async () => {
          const updated = await SupplierComplaintService.accept(id)
          syncUpdatedTicket(updated)
        }}
        onComment={async content => {
          const updated = await SupplierComplaintService.comment(id, content)
          syncUpdatedTicket(updated)
        }}
        onResolve={async content => {
          const updated = await SupplierComplaintService.resolve(id, content)
          syncUpdatedTicket(updated)
        }}
      />
    )
  }

  return (
    <div className={styles.complaintsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>
            Phản ánh chất lượng nguyên liệu
          </h1>
        </div>
      </div>

      <section
        className={styles.surface}
        aria-label="Danh sách khiếu nại chất lượng nguyên liệu"
      >
        <ComplaintFilterBar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          visibleCount={filteredComplaints.length}
          totalCount={complaints.length}
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
                ? "Bạn không có quyền xem danh sách khiếu nại"
                : "Không thể tải danh sách khiếu nại"}
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
          <ComplaintListView
            complaints={filteredComplaints}
            pageTotalCount={complaints.length}
            loading={loadingList}
            hasActiveFilters={hasActiveFilters}
            pagination={pagination}
            onResetFilters={handleResetFilters}
            onPageChange={nextPage =>
              setPagination(prev => ({ ...prev, page: nextPage }))
            }
          />
        )}
      </section>
    </div>
  )
}

export default SupplierComplaints
