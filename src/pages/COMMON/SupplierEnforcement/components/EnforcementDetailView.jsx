import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import {
  ArrowBackOutlined,
  CancelOutlined,
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  InfoOutlined,
  ReplayOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import notice from "src/components/Notice"
import ROUTER from "src/router/ROUTER"
import {
  formatCode,
  formatDateTimeVi,
  getIncidentStatusMeta,
  OVERALL_CONCLUSION_LABELS,
} from "src/services/FoodSafetyIncidentService"
import SupplierEnforcementService, {
  DECISION_STATUS,
  ENFORCEMENT_ACTION_TYPE,
  EXECUTION_STATUS,
  extractApiError,
  getActionTypeMeta,
  getDecisionStatusMeta,
  getExecutionStatusMeta,
  getIntakeStateMeta,
} from "src/services/SupplierEnforcementService"
import styles from "../SupplierEnforcement.module.scss"

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  info: styles.toneInfo,
  muted: styles.toneMuted,
}

function StatusPill({ label, tone = "muted" }) {
  return (
    <span className={`${styles.badge} ${TONE_CLASS[tone] || styles.toneMuted}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

StatusPill.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.string,
}

function EnforcementDetailView({
  basePath,
  isSystemAdmin,
  isAuthority,
  action,
  loading,
  error,
  onReload,
}) {
  const [approveOpen, setApproveOpen] = useState(false)
  const [approveNote, setApproveNote] = useState("")
  const [approveError, setApproveError] = useState("")
  const [approving, setApproving] = useState(false)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [rejectFieldError, setRejectFieldError] = useState("")
  const [rejectError, setRejectError] = useState("")
  const [rejecting, setRejecting] = useState(false)

  const [retrying, setRetrying] = useState(false)
  const [executionSummary, setExecutionSummary] = useState(null)

  useEffect(() => {
    setExecutionSummary(null)
  }, [action?.id])

  const handleConflict = msg => {
    notice({
      msg: msg || "Hồ sơ vừa được cập nhật. Đang tải lại.",
      isSuccess: false,
    })
    onReload()
  }

  const handleApproveSubmit = async event => {
    event.preventDefault()
    if (!action?.id || approving) return
    setApproving(true)
    setApproveError("")
    try {
      const result = await SupplierEnforcementService.approveAction(action.id, {
        note: approveNote,
      })
      setApproveOpen(false)
      setApproveNote("")
      setExecutionSummary({
        lockedAccountCount: result?.lockedAccountCount ?? 0,
        unlockedAccountCount: result?.unlockedAccountCount ?? 0,
        supplierIntakeState: result?.supplierIntakeState || null,
      })
      notice({
        msg: "Đã áp dụng chế tài",
        isSuccess: true,
      })
      onReload()
    } catch (err) {
      const parsed = extractApiError(
        err,
        "Không thể phê duyệt yêu cầu chế tài lúc này.",
      )
      if (parsed.status === 409) {
        setApproveOpen(false)
        handleConflict(parsed.message)
      } else {
        setApproveError(parsed.message)
      }
    } finally {
      setApproving(false)
    }
  }

  const handleRejectSubmit = async event => {
    event.preventDefault()
    if (!action?.id || rejecting) return
    const trimmed = rejectNote.trim()
    if (!trimmed) {
      setRejectFieldError("Vui lòng nhập lý do từ chối yêu cầu chế tài.")
      return
    }
    if (trimmed.length > 2000) {
      setRejectFieldError("Lý do từ chối không được vượt quá 2000 ký tự.")
      return
    }

    setRejecting(true)
    setRejectError("")
    setRejectFieldError("")
    try {
      await SupplierEnforcementService.rejectAction(action.id, {
        note: trimmed,
      })
      setRejectOpen(false)
      setRejectNote("")
      notice({ msg: "Đã từ chối yêu cầu chế tài", isSuccess: true })
      onReload()
    } catch (err) {
      const parsed = extractApiError(
        err,
        "Không thể từ chối yêu cầu chế tài lúc này.",
      )
      if (parsed.status === 400 && parsed.fields?.note) {
        setRejectFieldError(parsed.fields.note)
      }
      if (parsed.status === 409) {
        setRejectOpen(false)
        handleConflict(parsed.message)
      } else {
        setRejectError(parsed.message)
      }
    } finally {
      setRejecting(false)
    }
  }

  const handleRetryExecution = async () => {
    if (!action?.id || retrying) return
    setRetrying(true)
    try {
      await SupplierEnforcementService.retryAction(action.id)
      notice({
        msg: "Đã đăng xuất tài khoản bị khóa",
        isSuccess: true,
      })
      onReload()
    } catch (err) {
      const parsed = extractApiError(
        err,
        "Không thể thực thi lại thu hồi phiên lúc này.",
      )
      if (parsed.status === 409) {
        handleConflict(parsed.message)
      } else {
        notice({ msg: parsed.message, isSuccess: false })
      }
    } finally {
      setRetrying(false)
    }
  }

  if (loading && !action) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <Link to={basePath} className={styles.backBtn} aria-label="Quay lại danh sách">
              <ArrowBackOutlined />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết yêu cầu chế tài NCC</h1>
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
                <div className={styles.skeletonBar} />
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (error || !action) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <Link to={basePath} className={styles.backBtn} aria-label="Quay lại danh sách">
              <ArrowBackOutlined />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết yêu cầu chế tài NCC</h1>
          </div>
        </div>
        <section className={styles.surface}>
          <div className={styles.stateBox} role="alert">
            <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.stateTitle}>
              {error?.status === 404
                ? "Không tìm thấy yêu cầu chế tài"
                : error?.status === 403
                  ? "Bạn không có quyền xem yêu cầu chế tài này"
                  : "Không thể tải chi tiết yêu cầu chế tài"}
            </p>
            <p className={styles.stateDesc}>
              {error?.message || "Vui lòng kiểm tra lại đường dẫn hoặc thử lại."}
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

  const typeMeta = getActionTypeMeta(action.actionType)
  const decMeta = getDecisionStatusMeta(action.decisionStatus)
  const execMeta = getExecutionStatusMeta(action.executionStatus)
  const incidentStatusMeta = action.incident?.status
    ? getIncidentStatusMeta(action.incident.status)
    : null

  const canApproveOrReject =
    isSystemAdmin && action.decisionStatus === DECISION_STATUS.PENDING
  const canRetry =
    isSystemAdmin &&
    action.actionType === ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT &&
    action.executionStatus === EXECUTION_STATUS.FAILED

  const incidentUrl =
    isAuthority && action.incident?.id
      ? `${ROUTER.AUTHORITY_INCIDENTS}/${action.incident.id}`
      : null

  const activeRestrictions = Array.isArray(action.activeRestrictions)
    ? action.activeRestrictions
    : []

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link to={basePath} className={styles.backBtn} aria-label="Quay lại danh sách">
            <ArrowBackOutlined />
          </Link>
          <div className={styles.headingGroup}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className={styles.codeChip}>
                Hồ sơ {formatCode(action.incident?.code)}
              </span>
              <StatusPill label={typeMeta.shortLabel} tone={typeMeta.tone} />
              <StatusPill label={decMeta.label} tone={decMeta.tone} />
              <StatusPill label={execMeta.label} tone={execMeta.tone} />
            </div>
            <h1 className={styles.pageTitle}>
              {action.supplier?.name || "Yêu cầu chế tài nhà cung cấp"}
            </h1>
          </div>
        </div>

        <div className={styles.headerActions}>
          {canApproveOrReject ? (
            <>
              <Button
                type="button"
                variant="contained"
                color="primary"
                startIcon={<CheckCircleOutlineOutlined />}
                onClick={() => {
                  setApproveNote("")
                  setApproveError("")
                  setApproveOpen(true)
                }}
              >
                Phê duyệt &amp; Thực thi
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="error"
                startIcon={<CancelOutlined />}
                onClick={() => {
                  setRejectNote("")
                  setRejectFieldError("")
                  setRejectError("")
                  setRejectOpen(true)
                }}
              >
                Từ chối yêu cầu
              </Button>
            </>
          ) : null}

          {canRetry ? (
            <Button
              type="button"
              variant="contained"
              color="warning"
              startIcon={<ReplayOutlined />}
              disabled={retrying}
              onClick={handleRetryExecution}
            >
              {retrying ? "Đang thử lại..." : "Thử lại thu hồi phiên"}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Execution Summary right after approve */}
      {executionSummary ? (
        <div className={`${styles.banner} ${styles.bannerSuccess}`} role="status">
          <CheckCircleOutlineOutlined
            fontSize="small"
            sx={{ mt: "1px", flexShrink: 0 }}
          />
          <div>
            <strong>Kết quả thực thi chế tài:</strong>{" "}
            {executionSummary.supplierIntakeState ? (
              <span>
                Trạng thái tiếp nhận NCC:{" "}
                <strong>
                  {getIntakeStateMeta(executionSummary.supplierIntakeState).label}
                </strong>
                .{" "}
              </span>
            ) : null}
            Tài khoản bị khóa:{" "}
            <strong className={styles.tabularNum}>
              {executionSummary.lockedAccountCount}
            </strong>
            {" · "}
            Tài khoản được mở khóa:{" "}
            <strong className={styles.tabularNum}>
              {executionSummary.unlockedAccountCount}
            </strong>
            .
          </div>
        </div>
      ) : null}

      {/* Failed execution warning */}
      {action.executionStatus === EXECUTION_STATUS.FAILED ? (
        <div className={`${styles.banner} ${styles.bannerDanger}`} role="alert">
          <WarningAmberOutlined
            fontSize="small"
            sx={{ mt: "1px", flexShrink: 0 }}
          />
          <div>
            <strong>Thực thi thu hồi phiên gặp lỗi:</strong>{" "}
            {action.executionNote ||
              "Một số phiên đăng nhập của tài khoản nhà cung cấp chưa được thu hồi thành công. Hãy nhấn 'Thử lại thu hồi phiên'."}
          </div>
        </div>
      ) : null}

      {/* Core Request Info */}
      <section className={styles.surface}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Thông tin đề nghị chế tài</h2>
        </div>
        <div className={styles.sectionBody}>
          <dl className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Báo cáo ngộ độc</dt>
              <dd className={styles.metaValue}>
                {incidentUrl ? (
                  <Link to={incidentUrl} className={styles.detailLink}>
                    {formatCode(action.incident?.code)} —{" "}
                    {action.incident?.title || "Xem hồ sơ"}
                  </Link>
                ) : (
                  <span>
                    {formatCode(action.incident?.code)}
                    {action.incident?.title ? ` — ${action.incident.title}` : ""}
                  </span>
                )}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Trạng thái hồ sơ</dt>
              <dd className={styles.metaValue}>
                {incidentStatusMeta ? (
                  <StatusPill
                    label={incidentStatusMeta.label}
                    tone={incidentStatusMeta.tone}
                  />
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Nhà cung cấp</dt>
              <dd className={styles.metaValue}>
                {action.supplier?.name || "—"}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Loại chế tài</dt>
              <dd className={styles.metaValue}>{typeMeta.label}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Người đề nghị</dt>
              <dd className={styles.metaValue}>
                {action.requestedBy?.fullName || "—"}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Thời điểm gửi</dt>
              <dd className={styles.metaValue}>
                {formatDateTimeVi(action.createdAt)}
              </dd>
            </div>
          </dl>

          <div className={styles.dividerBlock}>
            <h3 className={styles.blockHeading}>Lý do &amp; căn cứ đề nghị</h3>
            <p className={styles.proseText}>
              {action.requestReason || "Không có ghi chú lý do."}
            </p>
          </div>

          {action.evidenceInspection ? (
            <div className={styles.dividerBlock}>
              <h3 className={styles.blockHeading}>
                Đợt kiểm tra làm căn cứ vi phạm
              </h3>
              <dl className={styles.metaGrid}>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Hoàn tất lúc</dt>
                  <dd className={styles.metaValue}>
                    {formatDateTimeVi(action.evidenceInspection.completedAt)}
                  </dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaLabel}>Kết luận chung</dt>
                  <dd className={styles.metaValue}>
                    {OVERALL_CONCLUSION_LABELS[
                      action.evidenceInspection.overallConclusion
                    ] ||
                      action.evidenceInspection.overallConclusion ||
                      "—"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </section>

      {/* Decision & Execution Audit */}
      <section className={styles.surface}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Phê duyệt &amp; Thực thi</h2>
        </div>
        <div className={styles.sectionBody}>
          <dl className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Quyết định</dt>
              <dd className={styles.metaValue}>
                <StatusPill label={decMeta.label} tone={decMeta.tone} />
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Người phê duyệt</dt>
              <dd className={styles.metaValue}>
                {action.decidedBy?.fullName || "—"}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Thời điểm duyệt</dt>
              <dd className={styles.metaValue}>
                {formatDateTimeVi(action.decidedAt)}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Trạng thái thực thi</dt>
              <dd className={styles.metaValue}>
                <StatusPill label={execMeta.label} tone={execMeta.tone} />
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Thời điểm thực thi</dt>
              <dd className={styles.metaValue}>
                {formatDateTimeVi(action.executedAt)}
              </dd>
            </div>
          </dl>

          {action.decisionNote ? (
            <div className={styles.dividerBlock}>
              <h3 className={styles.blockHeading}>Ghi chú phê duyệt / từ chối</h3>
              <p className={styles.proseText}>{action.decisionNote}</p>
            </div>
          ) : null}

          {action.executionNote ? (
            <div className={styles.dividerBlock}>
              <h3 className={styles.blockHeading}>Ghi chú thực thi hệ thống</h3>
              <p className={styles.proseText}>{action.executionNote}</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* System Admin: Active Restrictions on this supplier */}
      {isSystemAdmin ? (
        <section className={styles.surface}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Các hạn chế đang có hiệu lực trên nhà cung cấp ({activeRestrictions.length})
            </h2>
          </div>
          {activeRestrictions.length === 0 ? (
            <div className={styles.sectionBody}>
              <span className={styles.mutedText}>
                Nhà cung cấp này hiện không có hạn chế chế tài ATTP nào đang
                hiệu lực.
              </span>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Loại hạn chế</th>
                    <th scope="col">Báo cáo ngộ độc</th>
                    <th scope="col">Số tài khoản đã khóa</th>
                    <th scope="col">Hiệu lực từ</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRestrictions.map((r, idx) => {
                    const rMeta = getActionTypeMeta(r.restrictionType)
                    return (
                      <tr key={r.id || idx}>
                        <td>
                          <StatusPill
                            label={rMeta.shortLabel}
                            tone={rMeta.tone}
                          />
                        </td>
                        <td>
                          <span className={styles.codeChip}>
                            {formatCode(r.incidentCode || r.incidentId)}
                          </span>
                        </td>
                        <td className={styles.tabularNum}>
                          {r.lockedAccountCount ?? 0}
                        </td>
                        <td className={styles.tabularNum}>
                          {formatDateTimeVi(r.activatedAt)}
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

      {/* Approve & Execute Dialog */}
      <Dialog
        open={approveOpen}
        onClose={approving ? undefined : () => setApproveOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleApproveSubmit} noValidate>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
            Phê duyệt &amp; Thực thi chế tài
          </DialogTitle>
          <DialogContent dividers>
            <div className={styles.formStack}>
              <div className={`${styles.banner} ${styles.bannerWarning}`}>
                <InfoOutlined fontSize="small" sx={{ mt: "1px", flexShrink: 0 }} />
                <span>
                  Hệ thống sẽ thực thi ngay <strong>{typeMeta.label}</strong> đối
                  với nhà cung cấp{" "}
                  <strong>{action.supplier?.name || "này"}</strong>.{" "}
                  {typeMeta.description}
                </span>
              </div>

              {approveError ? (
                <div className={`${styles.banner} ${styles.bannerDanger}`} role="alert">
                  <WarningAmberOutlined
                    fontSize="small"
                    sx={{ mt: "1px", flexShrink: 0 }}
                  />
                  <span>{approveError}</span>
                </div>
              ) : null}

              <div className={styles.fieldGroup}>
                <label htmlFor="approve-note" className={styles.fieldLabel}>
                  Ghi chú phê duyệt (không bắt buộc)
                </label>
                <textarea
                  id="approve-note"
                  maxLength={2000}
                  className={styles.textareaInput}
                  placeholder="Nhập ghi chú lưu lịch sử phê duyệt (nếu có)..."
                  value={approveNote}
                  onChange={e => setApproveNote(e.target.value)}
                  disabled={approving}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={() => setApproveOpen(false)}
              disabled={approving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color={
                action.actionType === ENFORCEMENT_ACTION_TYPE.LOCK_ACCOUNT
                  ? "error"
                  : "primary"
              }
              disabled={approving}
            >
              {approving ? "Đang phê duyệt..." : "Xác nhận phê duyệt & thực thi"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectOpen}
        onClose={rejecting ? undefined : () => setRejectOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleRejectSubmit} noValidate>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
            Từ chối yêu cầu chế tài
          </DialogTitle>
          <DialogContent dividers>
            <div className={styles.formStack}>
              {rejectError ? (
                <div className={`${styles.banner} ${styles.bannerDanger}`} role="alert">
                  <WarningAmberOutlined
                    fontSize="small"
                    sx={{ mt: "1px", flexShrink: 0 }}
                  />
                  <span>{rejectError}</span>
                </div>
              ) : null}

              <div className={styles.fieldGroup}>
                <label htmlFor="reject-note" className={styles.fieldLabel}>
                  Lý do từ chối
                  <span className={styles.requiredMark}>*</span>
                </label>
                <textarea
                  id="reject-note"
                  maxLength={2000}
                  className={`${styles.textareaInput} ${
                    rejectFieldError ? styles.inputError : ""
                  }`}
                  placeholder="Nêu rõ lý do từ chối để cơ quan ATTP nắm thông tin..."
                  value={rejectNote}
                  onChange={e => {
                    setRejectNote(e.target.value)
                    if (rejectFieldError) setRejectFieldError("")
                  }}
                  disabled={rejecting}
                />
                {rejectFieldError ? (
                  <span className={styles.fieldError}>{rejectFieldError}</span>
                ) : null}
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={() => setRejectOpen(false)}
              disabled={rejecting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={rejecting}
            >
              {rejecting ? "Đang từ chối..." : "Xác nhận từ chối"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

EnforcementDetailView.propTypes = {
  basePath: PropTypes.string.isRequired,
  isSystemAdmin: PropTypes.bool,
  isAuthority: PropTypes.bool,
  action: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object,
  onReload: PropTypes.func.isRequired,
}

export default EnforcementDetailView
