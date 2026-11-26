import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button } from "@mui/material"
import {
  AddOutlined,
  ArrowBackOutlined,
  CancelOutlined,
  CheckOutlined,
  ChevronRight,
  ErrorOutlineOutlined,
  EventNoteOutlined,
  GavelOutlined,
  LockOutlined,
  ReplayOutlined,
  SendOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import notice from "src/components/Notice"
import ROUTER from "src/router/ROUTER"
import {
  CANCELLATION_REASON_LABELS,
  formatCode,
  formatDateTimeVi,
  formatDateVi,
  getForwardingStatusMeta,
  getIncidentStatusMeta,
  INCIDENT_SOURCE_LABELS,
  INCIDENT_STATUS,
  MEAL_TYPE_LABELS,
  PRELIMINARY_ASSESSMENT_LABELS,
} from "src/services/FoodSafetyIncidentService"
import SupplierEnforcementService, {
  getActionTypeMeta,
  getDecisionStatusMeta,
  getExecutionStatusMeta,
} from "src/services/SupplierEnforcementService"
import IncidentStatusBadge from "./IncidentStatusBadge"
import {
  AddAllocationsDialog,
  CancelIncidentDialog,
  ForwardIncidentDialog,
} from "./BghActionDialogs"
import TraceSnapshotSection from "./TraceSnapshotSection"
import InspectionsSection, {
  CloseIncidentDialog,
  PlanInspectionDialog,
  RecordInspectionResultDialog,
} from "./InspectionsSection"
import RequestEnforcementDialog from "./RequestEnforcementDialog"
import styles from "../FoodSafetyIncidents.module.scss"

const LIFECYCLE_STEPS = [
  { key: INCIDENT_STATUS.PENDING_SCHOOL_REVIEW, label: "Chờ trường xác minh" },
  { key: INCIDENT_STATUS.SUBMITTED_TO_AUTHORITY, label: "Đã chuyển ATTP" },
  { key: INCIDENT_STATUS.AUTHORITY_ACKNOWLEDGED, label: "ATTP tiếp nhận" },
  { key: INCIDENT_STATUS.UNDER_INSPECTION, label: "Đang kiểm tra" },
  { key: INCIDENT_STATUS.INSPECTION_COMPLETED, label: "Hoàn tất kiểm tra" },
  { key: INCIDENT_STATUS.CLOSED, label: "Đã đóng" },
]

const ENFORCEMENT_BUTTON_STATUSES = new Set([
  INCIDENT_STATUS.AUTHORITY_ACKNOWLEDGED,
  INCIDENT_STATUS.UNDER_INSPECTION,
  INCIDENT_STATUS.INSPECTION_COMPLETED,
  INCIDENT_STATUS.CLOSED,
])

function IncidentDetailView({
  basePath,
  incident,
  loading,
  error,
  isAuthority,
  onReload,
}) {
  const [forwardOpen, setForwardOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [allocOpen, setAllocOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [recordingInspection, setRecordingInspection] = useState(null)
  const [closeOpen, setCloseOpen] = useState(false)
  const [enforceOpen, setEnforceOpen] = useState(false)

  const [enforcementActions, setEnforcementActions] = useState([])
  const [loadingEnforcements, setLoadingEnforcements] = useState(false)
  const [enforcementTick, setEnforcementTick] = useState(0)

  const incidentId = incident?.id || ""

  useEffect(() => {
    if (!isAuthority || !incidentId) {
      setEnforcementActions([])
      return undefined
    }

    const controller = new AbortController()
    setLoadingEnforcements(true)
    SupplierEnforcementService.listActions(
      { incidentId, page: 1, limit: 50 },
      controller.signal,
    )
      .then(res => {
        if (!controller.signal.aborted) {
          setEnforcementActions(res.items || [])
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setEnforcementActions([])
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingEnforcements(false)
      })

    return () => controller.abort()
  }, [isAuthority, incidentId, enforcementTick])

  const handleConflict = message => {
    notice({
      msg: message || "Hồ sơ vừa được cập nhật. Đang tải lại.",
      isSuccess: false,
    })
    onReload()
  }

  if (loading && !incident) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <Link to={basePath} className={styles.backBtn} aria-label="Quay lại danh sách">
              <ArrowBackOutlined />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết báo cáo ngộ độc</h1>
          </div>
        </div>
        <section className={styles.surface}>
          <div className={styles.skeletonStack}>
            {[0, 1, 2, 3].map(k => (
              <div key={k} className={styles.skeletonRow}>
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <Link to={basePath} className={styles.backBtn} aria-label="Quay lại danh sách">
              <ArrowBackOutlined />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết báo cáo ngộ độc</h1>
          </div>
        </div>
        <section className={styles.surface}>
          <div className={styles.stateBox} role="alert">
            <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.stateTitle}>
              {error?.status === 404
                ? "Không tìm thấy báo cáo ngộ độc"
                : error?.status === 403
                  ? "Bạn không có quyền xem hồ sơ này"
                  : "Không thể tải chi tiết báo cáo ngộ độc"}
            </p>
            <p className={styles.stateDesc}>
              {error?.message || "Vui lòng kiểm tra lại đường dẫn hoặc thử tải lại."}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <Button component={Link} to={basePath} variant="outlined" color="inherit">
                Về danh sách
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                startIcon={<ReplayOutlined />}
                onClick={onReload}
              >
                Thử lại
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const isFullView = incident.view !== "REPORTER"
  const allowedActions = Array.isArray(incident.allowedActions)
    ? incident.allowedActions
    : []
  const canForward = allowedActions.includes("FORWARD")
  const canCancel = allowedActions.includes("CANCEL")
  const canAddAllocations = allowedActions.includes("ADD_ALLOCATIONS")
  const canPlanInspection = allowedActions.includes("PLAN_INSPECTION")
  const canClose = allowedActions.includes("CLOSE")
  const canRequestEnforcement =
    isAuthority && ENFORCEMENT_BUTTON_STATUSES.has(incident.status)

  const statusMeta = getIncidentStatusMeta(incident.status)
  const isCancelled = incident.status === INCIDENT_STATUS.CANCELLED_BY_SCHOOL
  const currentStepIndex = LIFECYCLE_STEPS.findIndex(
    step => step.key === incident.status,
  )

  const allocations = Array.isArray(incident.allocations)
    ? incident.allocations
    : []
  const forwardings = Array.isArray(incident.forwardings)
    ? incident.forwardings
    : []
  const histories = Array.isArray(incident.histories) ? incident.histories : []
  const inspections = Array.isArray(incident.inspections)
    ? incident.inspections
    : []

  const reportedClassName =
    incident.reportedClass?.name || incident.reportedClass?.className || "—"

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link to={basePath} className={styles.backBtn} aria-label="Quay lại danh sách">
            <ArrowBackOutlined />
          </Link>
          <div className={styles.headingGroup}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className={styles.codeChip}>{formatCode(incident.code)}</span>
              <IncidentStatusBadge
                label={statusMeta.label}
                tone={statusMeta.tone}
              />
            </div>
            <h1 className={styles.pageTitle}>
              {incident.title || "Báo cáo ngộ độc"}
            </h1>
          </div>
        </div>

        <div className={styles.headerActions}>
          {canForward ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<SendOutlined />}
              onClick={() => setForwardOpen(true)}
            >
              Xác minh &amp; chuyển ATTP
            </Button>
          ) : null}
          {canAddAllocations ? (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              startIcon={<AddOutlined />}
              onClick={() => setAllocOpen(true)}
            >
              Gắn suất ăn
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              variant="outlined"
              color="error"
              startIcon={<CancelOutlined />}
              onClick={() => setCancelOpen(true)}
            >
              Hủy hồ sơ
            </Button>
          ) : null}
          {canPlanInspection ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<EventNoteOutlined />}
              onClick={() => setPlanOpen(true)}
            >
              Lập đợt kiểm tra
            </Button>
          ) : null}
          {canClose ? (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              startIcon={<LockOutlined />}
              onClick={() => setCloseOpen(true)}
            >
              Đóng hồ sơ
            </Button>
          ) : null}
          {canRequestEnforcement ? (
            <Button
              type="button"
              variant="outlined"
              color="warning"
              startIcon={<GavelOutlined />}
              onClick={() => setEnforceOpen(true)}
            >
              Đề nghị chế tài NCC
            </Button>
          ) : null}
        </div>
      </div>

      {/* Overview Card + Lifecycle Stepper */}
      <section className={styles.surface}>
        {isCancelled ? (
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8eeeb" }}>
            <div className={`${styles.banner} ${styles.bannerDanger}`}>
              <WarningAmberOutlined
                fontSize="small"
                sx={{ mt: "1px", flexShrink: 0 }}
              />
              <div>
                <strong>
                  Hồ sơ đã bị hủy tại trường —{" "}
                  {CANCELLATION_REASON_LABELS[incident.cancellationReason] ||
                    incident.cancellationReason ||
                    "Không rõ lý do"}
                </strong>
                {incident.cancellationNote ? (
                  <div style={{ marginTop: 4 }}>{incident.cancellationNote}</div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.stepperWrap} aria-label="Tiến độ xử lý hồ sơ">
            <ol className={styles.stepperList}>
              {LIFECYCLE_STEPS.map((step, index) => {
                const isCompleted =
                  currentStepIndex > index ||
                  (incident.status === INCIDENT_STATUS.CLOSED &&
                    index === LIFECYCLE_STEPS.length - 1)
                const isCurrent =
                  currentStepIndex === index &&
                  incident.status !== INCIDENT_STATUS.CLOSED

                return (
                  <li
                    key={step.key}
                    className={`${styles.stepItem} ${
                      isCompleted ? styles.stepCompleted : ""
                    } ${isCurrent ? styles.stepCurrent : ""}`}
                  >
                    <span className={styles.stepDot} aria-hidden="true">
                      {isCompleted ? (
                        <CheckOutlined sx={{ fontSize: 14 }} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className={styles.stepLabel}>{step.label}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        <div className={styles.sectionBody}>
          <dl className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Nguồn báo cáo</dt>
              <dd className={styles.metaValue}>
                {INCIDENT_SOURCE_LABELS[incident.source] || incident.source || "—"}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>HS có triệu chứng</dt>
              <dd className={styles.metaValue}>
                {incident.reportedSymptomaticCount != null
                  ? `${Number(incident.reportedSymptomaticCount).toLocaleString("vi-VN")} học sinh`
                  : "—"}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Thời điểm phát sinh</dt>
              <dd className={styles.metaValue}>
                {formatDateTimeVi(incident.occurredAt)}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Lớp liên quan</dt>
              <dd className={styles.metaValue}>{reportedClassName}</dd>
            </div>

            {isFullView ? (
              <>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Trường học</dt>
                  <dd className={styles.metaValue}>
                    {incident.school?.name || "—"}
                  </dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Người báo cáo</dt>
                  <dd className={styles.metaValue}>
                    {incident.reportedBy?.fullName || "—"}
                  </dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Nhận định sơ bộ</dt>
                  <dd className={styles.metaValue}>
                    {incident.preliminaryAssessment
                      ? PRELIMINARY_ASSESSMENT_LABELS[
                          incident.preliminaryAssessment
                        ] || incident.preliminaryAssessment
                      : "Chưa có"}
                  </dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Đơn vị ATTP tiếp nhận</dt>
                  <dd className={styles.metaValue}>
                    {incident.recipientUnit?.name || "Chưa chuyển"}
                  </dd>
                </div>
                {incident.reviewedBy ? (
                  <div className={styles.metaRow}>
                    <dt className={styles.metaLabel}>Người xác minh</dt>
                    <dd className={styles.metaValue}>
                      {incident.reviewedBy.fullName}
                      {incident.reviewedAt
                        ? ` · ${formatDateTimeVi(incident.reviewedAt)}`
                        : ""}
                    </dd>
                  </div>
                ) : null}
                {incident.resolvedAt ? (
                  <div className={styles.metaRow}>
                    <dt className={styles.metaLabel}>Thời điểm đóng hồ sơ</dt>
                    <dd className={styles.metaValue}>
                      {formatDateTimeVi(incident.resolvedAt)}
                    </dd>
                  </div>
                ) : null}
              </>
            ) : null}
          </dl>

          <div className={styles.dividerBlock}>
            <h2 className={styles.blockHeading}>Mô tả chi tiết báo cáo ngộ độc</h2>
            <p className={styles.proseText}>
              {incident.description || "Không có mô tả chi tiết."}
            </p>
          </div>

          {incident.symptomDescription ? (
            <div className={styles.dividerBlock}>
              <h2 className={styles.blockHeading}>Biểu hiện / triệu chứng</h2>
              <p className={styles.proseText}>{incident.symptomDescription}</p>
            </div>
          ) : null}

          {isFullView && incident.preliminaryNote ? (
            <div className={styles.dividerBlock}>
              <h2 className={styles.blockHeading}>
                Ghi chú nhận định sơ bộ của nhà trường
              </h2>
              <p className={styles.proseText}>{incident.preliminaryNote}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* FULL-only: Attached Allocations & Forwardings */}
      {isFullView ? (
        <section className={styles.surface}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Suất ăn gắn với hồ sơ ({allocations.length})
            </h2>
            {canAddAllocations ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<AddOutlined />}
                onClick={() => setAllocOpen(true)}
              >
                Gắn suất ăn
              </Button>
            ) : null}
          </div>
          {allocations.length === 0 ? (
            <div className={styles.sectionBody}>
              <span className={styles.mutedText}>
                Chưa có suất ăn nào được gắn vào hồ sơ báo cáo ngộ độc này.
              </span>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table} aria-label="Danh sách suất ăn liên quan">
                <thead>
                  <tr>
                    <th scope="col">Lớp</th>
                    <th scope="col">Ngày ăn</th>
                    <th scope="col">Bữa ăn</th>
                    <th scope="col">Trạng thái phát</th>
                    <th scope="col">Mã suất ăn</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(alloc => (
                    <tr key={alloc.mealAllocationId}>
                      <td style={{ fontWeight: 600 }}>
                        {alloc.className || "—"}
                      </td>
                      <td className={styles.tabularNum}>
                        {formatDateVi(alloc.mealDate)}
                      </td>
                      <td>
                        {MEAL_TYPE_LABELS[alloc.mealType] || alloc.mealType || "—"}
                      </td>
                      <td>{alloc.status || "—"}</td>
                      <td className={styles.monoText}>
                        {alloc.mealAllocationId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {forwardings.length > 0 ? (
            <div
              className={styles.sectionBody}
              style={{ borderTop: "1px solid #e8eeeb" }}
            >
              <h3 className={styles.blockHeading}>
                Lịch sử gửi báo cáo tới đơn vị ATTP ({forwardings.length})
              </h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Đơn vị nhận</th>
                      <th scope="col">Trạng thái gửi</th>
                      <th scope="col">Phiên bản snapshot</th>
                      <th scope="col">Thời điểm gửi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forwardings.map((fw, idx) => {
                      const fwMeta = getForwardingStatusMeta(fw.status)
                      return (
                        <tr key={fw.id || idx}>
                          <td>
                            {fw.recipientOrganization || "—"}
                          </td>
                          <td>
                            <IncidentStatusBadge
                              label={fwMeta.label}
                              tone={fwMeta.tone}
                            />
                          </td>
                          <td className={styles.tabularNum}>
                            {fw.traceSnapshotVersion != null
                              ? `v${fw.traceSnapshotVersion}`
                              : "—"}
                          </td>
                          <td className={styles.tabularNum}>
                            {formatDateTimeVi(fw.forwardedAt || fw.createdAt)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* FULL-only: Traceability Snapshots */}
      {isFullView ? (
        <TraceSnapshotSection
          incidentId={incident.id}
          traceSnapshots={incident.traceSnapshots}
          traceCompleteness={incident.traceCompleteness}
        />
      ) : null}

      {/* Inspections Section */}
      {inspections.length > 0 || (isAuthority && canPlanInspection) ? (
        <InspectionsSection
          inspections={inspections}
          isAuthority={isAuthority}
          canPlanInspection={canPlanInspection}
          onOpenPlanDialog={() => setPlanOpen(true)}
          onOpenRecordResult={insp => setRecordingInspection(insp)}
        />
      ) : null}

      {/* ATTP: Existing Enforcement Actions for this incident */}
      {isAuthority && (enforcementActions.length > 0 || canRequestEnforcement) ? (
        <section className={styles.surface}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Đề nghị chế tài nhà cung cấp ({enforcementActions.length})
            </h2>
            {canRequestEnforcement ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<GavelOutlined />}
                onClick={() => setEnforceOpen(true)}
              >
                Tạo đề nghị chế tài
              </Button>
            ) : null}
          </div>

          {loadingEnforcements && enforcementActions.length === 0 ? (
            <div className={styles.sectionBody}>
              <span className={styles.mutedText}>
                Đang tải danh sách đề nghị chế tài...
              </span>
            </div>
          ) : enforcementActions.length === 0 ? (
            <div className={styles.sectionBody}>
              <span className={styles.mutedText}>
                Chưa có đề nghị chế tài nào gắn với hồ sơ báo cáo ngộ độc này.
              </span>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Nhà cung cấp</th>
                    <th scope="col">Loại chế tài</th>
                    <th scope="col">Quyết định</th>
                    <th scope="col">Thực thi</th>
                    <th scope="col">Ngày gửi</th>
                    <th scope="col" className={styles.actionCell}>
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enforcementActions.map(act => {
                    const typeMeta = getActionTypeMeta(act.actionType)
                    const decMeta = getDecisionStatusMeta(act.decisionStatus)
                    const execMeta = getExecutionStatusMeta(act.executionStatus)
                    const actUrl = `${ROUTER.AUTHORITY_ENFORCEMENT_ACTIONS}/${act.id}`

                    return (
                      <tr key={act.id}>
                        <td style={{ fontWeight: 600 }}>
                          {act.supplier?.name || "—"}
                        </td>
                        <td>
                          <IncidentStatusBadge
                            label={typeMeta.shortLabel}
                            tone={typeMeta.tone}
                          />
                        </td>
                        <td>
                          <IncidentStatusBadge
                            label={decMeta.label}
                            tone={decMeta.tone}
                          />
                        </td>
                        <td>
                          <IncidentStatusBadge
                            label={execMeta.label}
                            tone={execMeta.tone}
                          />
                        </td>
                        <td className={styles.tabularNum}>
                          {formatDateTimeVi(act.createdAt)}
                        </td>
                        <td className={styles.actionCell}>
                          <Link to={actUrl} className={styles.detailLink}>
                            <span>Xem</span>
                            <ChevronRight fontSize="small" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {/* History Timeline */}
      <section className={styles.surface}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Lịch sử chuyển trạng thái</h2>
        </div>
        <div className={styles.sectionBody}>
          {histories.length === 0 ? (
            <span className={styles.mutedText}>
              Chưa có lịch sử cập nhật trạng thái.
            </span>
          ) : (
            <ol className={styles.timeline}>
              {histories.map((entry, idx) => {
                const fromLabel = entry.fromStatus
                  ? getIncidentStatusMeta(entry.fromStatus).label
                  : "Tạo mới"
                const toLabel = getIncidentStatusMeta(entry.toStatus).label
                return (
                  <li key={entry.id || idx} className={styles.timelineItem}>
                    <div className={styles.timelineRail} aria-hidden="true">
                      <span className={styles.timelineDot} />
                      <span className={styles.timelineLine} />
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineTop}>
                        <span className={styles.timelineStatusFlow}>
                          {fromLabel} → {toLabel}
                        </span>
                        <span className={styles.timelineTime}>
                          {formatDateTimeVi(entry.createdAt)}
                        </span>
                      </div>
                      {entry.actor?.fullName ? (
                        <span className={styles.mutedText}>
                          Thực hiện bởi: {entry.actor.fullName}
                        </span>
                      ) : null}
                      {entry.note ? (
                        <p className={styles.proseText}>{entry.note}</p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </section>

      {/* Dialogs */}
      <ForwardIncidentDialog
        open={forwardOpen}
        incidentId={incident.id}
        onClose={() => setForwardOpen(false)}
        onConflict={handleConflict}
        onSuccess={() => {
          setForwardOpen(false)
          notice({
            msg: "Đã chuyển hồ sơ đến đơn vị ATTP",
            isSuccess: true,
          })
          onReload()
        }}
      />

      <CancelIncidentDialog
        open={cancelOpen}
        incidentId={incident.id}
        onClose={() => setCancelOpen(false)}
        onConflict={handleConflict}
        onSuccess={() => {
          setCancelOpen(false)
          notice({ msg: "Đã hủy báo cáo ngộ độc", isSuccess: true })
          onReload()
        }}
      />

      <AddAllocationsDialog
        open={allocOpen}
        incidentId={incident.id}
        existingAllocations={allocations}
        onClose={() => setAllocOpen(false)}
        onConflict={handleConflict}
        onSuccess={res => {
          setAllocOpen(false)
          const addedCount = Number.isFinite(res?.added) ? res.added : 0
          notice({
            msg:
              addedCount > 0
                ? `Đã gắn thêm ${addedCount} suất ăn vào hồ sơ`
                : "Đã cập nhật danh sách suất ăn",
            isSuccess: true,
          })
          onReload()
        }}
      />

      <PlanInspectionDialog
        open={planOpen}
        incidentId={incident.id}
        onClose={() => setPlanOpen(false)}
        onConflict={handleConflict}
        onSuccess={() => {
          setPlanOpen(false)
          notice({ msg: "Đã lập đợt kiểm tra mới", isSuccess: true })
          onReload()
        }}
      />

      <RecordInspectionResultDialog
        open={Boolean(recordingInspection)}
        incidentId={incident.id}
        inspection={recordingInspection}
        onClose={() => setRecordingInspection(null)}
        onConflict={handleConflict}
        onSuccess={() => {
          setRecordingInspection(null)
          notice({ msg: "Đã lưu kết quả đợt kiểm tra", isSuccess: true })
          onReload()
        }}
      />

      <CloseIncidentDialog
        open={closeOpen}
        incidentId={incident.id}
        onClose={() => setCloseOpen(false)}
        onConflict={handleConflict}
        onSuccess={() => {
          setCloseOpen(false)
          notice({ msg: "Đã đóng hồ sơ báo cáo ngộ độc", isSuccess: true })
          onReload()
        }}
      />

      <RequestEnforcementDialog
        open={enforceOpen}
        incident={incident}
        onClose={() => setEnforceOpen(false)}
        onConflict={handleConflict}
        onSuccess={() => {
          setEnforceOpen(false)
          notice({
            msg: "Đã gửi đề nghị chế tài đến Quản trị hệ thống",
            isSuccess: true,
          })
          setEnforcementTick(prev => prev + 1)
          onReload()
        }}
      />
    </div>
  )
}

IncidentDetailView.propTypes = {
  basePath: PropTypes.string.isRequired,
  incident: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object,
  isAuthority: PropTypes.bool,
  onReload: PropTypes.func.isRequired,
}

export default IncidentDetailView
