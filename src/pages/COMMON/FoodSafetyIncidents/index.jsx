import React, { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import notice from "src/components/Notice"
import { ORG_TYPES, ROLES } from "src/constants/roles"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import FoodSafetyIncidentService, {
  extractApiError,
} from "src/services/FoodSafetyIncidentService"
import IncidentDetailView from "./components/IncidentDetailView"
import IncidentListView from "./components/IncidentListView"
import ReportIncidentDialog from "./components/ReportIncidentDialog"

const DEFAULT_PAGE_SIZE = 20

function FoodSafetyIncidents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userStore } = useContext(StoreContext)
  const currentUser = userStore?.user

  const role = currentUser?.role || currentUser?.roleCode || ""
  const orgType = currentUser?.orgType || ""
  const isAuthority =
    role === ROLES.COMMUNE_FOOD_SAFETY_OFFICER ||
    orgType === ORG_TYPES.AUTHORITY
  const isBgh = role === ROLES.SCHOOL_MANAGEMENT_BOARD
  const isHomeroomTeacher = role === ROLES.HOMEROOM_TEACHER
  const canReport =
    role === ROLES.PARENTS_COMMITTEE || role === ROLES.HOMEROOM_TEACHER

  const basePath = isAuthority
    ? ROUTER.AUTHORITY_INCIDENTS
    : ROUTER.SCHOOL_INCIDENTS
  const isDetailView = Boolean(id)

  // List state
  const [activeTab, setActiveTab] = useState("incidents")
  const [statusFilter, setStatusFilter] = useState("")
  const [incidents, setIncidents] = useState([])
  const [incidentsPagination, setIncidentsPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [incidentsLoading, setIncidentsLoading] = useState(false)
  const [incidentsError, setIncidentsError] = useState(null)
  const [incidentsReloadTick, setIncidentsReloadTick] = useState(0)

  // Authority reports inbox state
  const [reports, setReports] = useState([])
  const [reportsPagination, setReportsPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState(null)
  const [reportsReloadTick, setReportsReloadTick] = useState(0)
  const [receivingReportId, setReceivingReportId] = useState(null)
  // Danh sách food-safety-reports chưa trả receivedAt: nhớ các bản đã tiếp nhận trong phiên để ẩn nút
  const [receivedReportIds, setReceivedReportIds] = useState([])

  // Detail state
  const [detailIncident, setDetailIncident] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  // Create/report dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  // Load incidents list
  useEffect(() => {
    if (isDetailView) return undefined
    if (isAuthority && activeTab !== "incidents") return undefined

    const controller = new AbortController()
    setIncidentsLoading(true)
    setIncidentsError(null)

    FoodSafetyIncidentService.listIncidents(
      {
        page: incidentsPagination.page,
        limit: incidentsPagination.limit,
        status: statusFilter,
      },
      controller.signal,
    )
      .then(result => {
        if (controller.signal.aborted) return
        setIncidents(result.items)
        setIncidentsPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setIncidentsError(
          extractApiError(error, "Không thể tải danh sách báo cáo ngộ độc."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setIncidentsLoading(false)
      })

    return () => controller.abort()
  }, [
    isDetailView,
    isAuthority,
    activeTab,
    incidentsPagination.page,
    incidentsPagination.limit,
    statusFilter,
    incidentsReloadTick,
  ])

  // Load ATTP incoming reports inbox
  useEffect(() => {
    if (isDetailView || !isAuthority || activeTab !== "reports") {
      return undefined
    }

    const controller = new AbortController()
    setReportsLoading(true)
    setReportsError(null)

    FoodSafetyIncidentService.listReports(
      {
        page: reportsPagination.page,
        limit: reportsPagination.limit,
      },
      controller.signal,
    )
      .then(result => {
        if (controller.signal.aborted) return
        setReports(result.items)
        setReportsPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setReportsError(
          extractApiError(error, "Không thể tải hộp tiếp nhận báo cáo ATTP."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setReportsLoading(false)
      })

    return () => controller.abort()
  }, [
    isDetailView,
    isAuthority,
    activeTab,
    reportsPagination.page,
    reportsPagination.limit,
    reportsReloadTick,
  ])

  // Load detail view
  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailIncident(null)
      setDetailError(null)
      return undefined
    }

    const controller = new AbortController()
    setDetailLoading(true)
    setDetailError(null)

    FoodSafetyIncidentService.getIncidentDetail(id, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return
        setDetailIncident(data)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setDetailIncident(null)
        setDetailError(
          extractApiError(error, "Không thể tải chi tiết báo cáo ngộ độc."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false)
      })

    return () => controller.abort()
  }, [isDetailView, id, detailReloadTick])

  const handleReceiveReport = async report => {
    if (!report?.id || receivingReportId) return
    setReceivingReportId(report.id)
    try {
      await FoodSafetyIncidentService.receiveReport(report.id)
      setReceivedReportIds(prev => (prev.includes(report.id) ? prev : [...prev, report.id]))
      notice({
        msg: "Đã tiếp nhận báo cáo ngộ độc",
        isSuccess: true,
      })
      setReportsReloadTick(prev => prev + 1)
      setIncidentsReloadTick(prev => prev + 1)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể tiếp nhận báo cáo ngộ độc lúc này.",
      )
      notice({ msg: parsed.message, isSuccess: false })
      if (parsed.status === 409) {
        setReportsReloadTick(prev => prev + 1)
        setIncidentsReloadTick(prev => prev + 1)
      }
    } finally {
      setReceivingReportId(null)
    }
  }

  const handleStatusFilterChange = nextStatus => {
    setStatusFilter(nextStatus)
    setIncidentsPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleReportSuccess = created => {
    setReportDialogOpen(false)
    notice({
      msg: isBgh
        ? "Đã gửi hồ sơ đến đơn vị ATTP"
        : "Đã gửi báo cáo ngộ độc tới nhà trường",
      isSuccess: true,
    })
    setIncidentsReloadTick(prev => prev + 1)
    if (created?.id) {
      navigate(`${basePath}/${created.id}`)
    }
  }

  if (isDetailView) {
    return (
      <IncidentDetailView
        basePath={basePath}
        incident={detailIncident}
        loading={detailLoading}
        error={detailError}
        isAuthority={isAuthority}
        onReload={() => setDetailReloadTick(prev => prev + 1)}
      />
    )
  }

  return (
    <>
      <IncidentListView
        basePath={basePath}
        isAuthority={isAuthority}
        isBgh={isBgh}
        canReport={canReport}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        incidents={incidents}
        incidentsPagination={incidentsPagination}
        incidentsLoading={incidentsLoading}
        incidentsError={incidentsError}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onIncidentsPageChange={page =>
          setIncidentsPagination(prev => ({ ...prev, page }))
        }
        onRetryIncidents={() => setIncidentsReloadTick(prev => prev + 1)}
        reports={reports}
        reportsPagination={reportsPagination}
        reportsLoading={reportsLoading}
        reportsError={reportsError}
        receivingReportId={receivingReportId}
        receivedReportIds={receivedReportIds}
        onReceiveReport={handleReceiveReport}
        onReportsPageChange={page =>
          setReportsPagination(prev => ({ ...prev, page }))
        }
        onRetryReports={() => setReportsReloadTick(prev => prev + 1)}
        onOpenReportDialog={() => setReportDialogOpen(true)}
      />

      <ReportIncidentDialog
        open={reportDialogOpen}
        mode={isBgh ? "direct" : "report"}
        isHomeroomTeacher={isHomeroomTeacher}
        currentUserId={currentUser?.id || currentUser?.userId || ""}
        onClose={() => setReportDialogOpen(false)}
        onSuccess={handleReportSuccess}
      />
    </>
  )
}

export default FoodSafetyIncidents
