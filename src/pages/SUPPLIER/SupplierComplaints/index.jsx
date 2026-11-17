import React, { useContext, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { ErrorOutlineOutlined, ReplayOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import { StoreContext } from "src/contexts"
import SupplierComplaintService, {
  canRespondSupplierComplaints,
  canViewSupplierComplaints,
  COMPLAINT_STATUS,
  extractApiError,
  validateSupplierResponse,
} from "src/services/SupplierComplaintService"
import ComplaintDetailView from "./component/ComplaintDetailView"
import ComplaintFilterBar from "./component/ComplaintFilterBar"
import ComplaintListView from "./component/ComplaintListView"
import styles from "./SupplierComplaints.module.scss"

const DEFAULT_PAGE_SIZE = 20

function SupplierComplaints() {
  const { id } = useParams()
  const isDetailView = Boolean(id)
  const { userStore } = useContext(StoreContext)
  const currentUser = userStore?.user

  const canView = canViewSupplierComplaints(currentUser)
  const canRespond = canRespondSupplierComplaints(currentUser)

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

  const [detailComplaint, setDetailComplaint] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  const [responseText, setResponseText] = useState("")
  const [fieldError, setFieldError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [conflictReloaded, setConflictReloaded] = useState(false)

  useEffect(() => {
    if (isDetailView || !canView) return undefined

    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SupplierComplaintService.listComplaints({
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
    setResponseText("")
    setFieldError("")
    setSubmitError("")
    setAttemptedSubmit(false)
    setConflictReloaded(false)
  }, [id])

  useEffect(() => {
    if (!isDetailView || !id || !canView) {
      setDetailComplaint(null)
      setDetailError(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierComplaintService.getComplaintById(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setDetailComplaint(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setDetailComplaint(null)
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
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false
      }
      if (!keyword) return true
      const haystack = [
        item.complaintCode,
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

  const handleResponseChange = nextValue => {
    setResponseText(nextValue)
    if (submitError) {
      setSubmitError("")
    }
    if (attemptedSubmit) {
      const check = validateSupplierResponse(nextValue)
      setFieldError(check.valid ? "" : check.error)
    } else if (fieldError) {
      setFieldError("")
    }
  }

  const handleSubmitResponse = async event => {
    event.preventDefault()
    if (!detailComplaint?.id || submitting) return
    if (detailComplaint.status !== COMPLAINT_STATUS.SUBMITTED) return

    setAttemptedSubmit(true)
    setSubmitError("")

    const check = validateSupplierResponse(responseText)
    if (!check.valid) {
      setFieldError(check.error)
      return
    }
    setFieldError("")
    setSubmitting(true)

    try {
      const updated = await SupplierComplaintService.respondToComplaint(
        detailComplaint.id,
        responseText,
      )
      setDetailComplaint(updated)
      setResponseText("")
      setFieldError("")
      setSubmitError("")
      setAttemptedSubmit(false)
      setConflictReloaded(false)
      setComplaints(prev =>
        prev.map(item =>
          item.id === updated.id
            ? {
                ...item,
                status: updated.status,
                respondedAt: updated.respondedAt,
              }
            : item,
        ),
      )
      notice({
        msg: "Đã gửi phản hồi khiếu nại thành công",
        isSuccess: true,
      })
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể gửi phản hồi lúc này. Vui lòng kiểm tra lại trạng thái trước khi thử lại.",
      )

      if (parsed.status === 409) {
        setConflictReloaded(true)
        setSubmitError("")
        setFieldError("")
        notice({
          msg: parsed.message || "Khiếu nại đã được phản hồi",
          isSuccess: false,
        })
        setDetailReloadTick(prev => prev + 1)
        return
      }

      if (parsed.status === 400 && parsed.fields?.supplierResponse) {
        setFieldError(parsed.fields.supplierResponse)
        return
      }

      setSubmitError(parsed.message)
    } finally {
      setSubmitting(false)
    }
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
    return (
      <ComplaintDetailView
        complaint={detailComplaint}
        loading={loadingDetail}
        error={detailError}
        canRespond={canRespond}
        responseText={responseText}
        fieldError={fieldError}
        submitError={submitError}
        submitting={submitting}
        conflictReloaded={conflictReloaded}
        onRetryDetail={() => setDetailReloadTick(prev => prev + 1)}
        onResponseChange={handleResponseChange}
        onSubmitResponse={handleSubmitResponse}
      />
    )
  }

  return (
    <div className={styles.complaintsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Danh sách khiếu nại</h1>
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
