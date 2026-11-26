import React, { useContext, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material"
import {
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  InfoOutlined,
  KeyboardArrowUp,
  NorthEast,
  ReplayOutlined,
  SendOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import UserAvatar from "src/components/Common/UserAvatar"
import {
  EvidenceAttachmentList,
  EvidenceFilePicker,
} from "src/components/EvidenceFiles"
import notice from "src/components/Notice"
import { StoreContext } from "src/contexts"
import AuthorityComplaintService from "src/services/AuthorityComplaintService"
import TicketStatusBadge from "./TicketStatusBadge"
import {
  CLOSE_REASON_LABELS,
  COMMENT_TYPE_META,
  countCodePoints,
  formatCountdown,
  formatDateDividerLabel,
  formatDateTimeVi,
  formatTicketCode,
  formatTimeVi,
  groupCommentsByDate,
  MAX_COMMENT_LENGTH,
  parseApiError,
  TICKET_STATUS,
} from "./ticketHelpers"
import styles from "./EscalationAuthoritySection.module.scss"

const COMMENT_TAG_CLASS = {
  success: styles.tagSuccess,
  warning: styles.tagWarning,
  error: styles.tagError,
}

const COMMENT_BODY_CLASS = {
  RESOLUTION: styles.commentBodyResolution,
  REOPEN_NOTE: styles.commentBodyReopen,
  ESCALATION_NOTE: styles.commentBodyEscalation,
}

export default function EscalationAuthoritySection({
  authorityComplaintId,
  fallbackCode = null,
  readOnly = false,
}) {
  const { userStore } = useContext(StoreContext) || {}
  const currentUser = userStore?.user

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)
  const [expanded, setExpanded] = useState(true)

  const [commentText, setCommentText] = useState("")
  const [commentError, setCommentError] = useState("")
  const [commentFiles, setCommentFiles] = useState([])
  const [busyAction, setBusyAction] = useState("")

  const [reopenOpen, setReopenOpen] = useState(false)
  const [reopenReason, setReopenReason] = useState("")
  const [reopenError, setReopenError] = useState("")

  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (!authorityComplaintId) return undefined
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    AuthorityComplaintService.detail(authorityComplaintId, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) {
          setTicket(data)
        }
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setTicket(null)
        setError(
          parseApiError(
            err,
            "Không tải được phản hồi của Cơ quan ATTP.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [authorityComplaintId, reloadTick])

  useEffect(() => {
    if (!ticket?.feedbackDeadlineAt) return undefined
    setNowMs(Date.now())
    const timer = setInterval(() => setNowMs(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [ticket?.feedbackDeadlineAt])

  useEffect(() => {
    setCommentText("")
    setCommentError("")
    setReopenOpen(false)
    setReopenReason("")
    setReopenError("")
  }, [authorityComplaintId])

  const comments = useMemo(
    () => (Array.isArray(ticket?.comments) ? ticket.comments : []),
    [ticket?.comments],
  )
  const commentGroups = useMemo(() => groupCommentsByDate(comments), [comments])
  const lastCommentId = comments.length
    ? comments[comments.length - 1].id
    : null

  const allowedActions = useMemo(
    () =>
      !readOnly && Array.isArray(ticket?.allowedActions)
        ? ticket.allowedActions
        : [],
    [readOnly, ticket?.allowedActions],
  )

  const canComment = allowedActions.includes("COMMENT")
  const canSatisfy = allowedActions.includes("SATISFY")
  const canReopen = allowedActions.includes("REOPEN")
  const showFeedbackBox = canSatisfy || canReopen

  const displayStatus = ticket?.displayStatus || ticket?.status || ""
  const codeDisplay = formatTicketCode(ticket?.code || fallbackCode)
  const countdown = useMemo(
    () =>
      displayStatus === TICKET_STATUS.RESOLVED
        ? formatCountdown(ticket?.feedbackDeadlineAt, nowMs)
        : null,
    [displayStatus, ticket?.feedbackDeadlineAt, nowMs],
  )

  const runAction = async (
    actionKey,
    fn,
    { onInlineError, onCloseDialog } = {},
  ) => {
    if (busyAction) return
    setBusyAction(actionKey)
    try {
      await fn()
    } catch (err) {
      const parsed = parseApiError(
        err,
        "Không thể thực hiện thao tác. Vui lòng thử lại.",
      )
      if (parsed.status === 409) {
        onCloseDialog?.()
        notice({ msg: parsed.message, isSuccess: false })
        setReloadTick(prev => prev + 1)
        return
      }
      if (onInlineError) {
        onInlineError(parsed)
      } else {
        notice({ msg: parsed.message, isSuccess: false })
      }
    } finally {
      setBusyAction("")
    }
  }

  const handleSendComment = event => {
    event.preventDefault()
    const trimmed = commentText.trim()
    const len = countCodePoints(trimmed)
    if (len < 1) {
      setCommentError("Vui lòng nhập nội dung trao đổi với Cơ quan ATTP.")
      return
    }
    if (len > MAX_COMMENT_LENGTH) {
      setCommentError(
        `Nội dung không được vượt quá ${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự.`,
      )
      return
    }
    setCommentError("")
    runAction(
      "COMMENT",
      async () => {
        const updated = await AuthorityComplaintService.comment(
          authorityComplaintId,
          trimmed,
          commentFiles,
        )
        setTicket(updated)
        setCommentText("")
        setCommentFiles([])
        notice({ msg: "Đã gửi phản hồi tới Cơ quan ATTP", isSuccess: true })
      },
      {
        onInlineError: parsed =>
          setCommentError(
            parsed.fields?.content || parsed.fields?.files || parsed.message,
          ),
      },
    )
  }

  const handleSatisfy = () => {
    runAction("SATISFY", async () => {
      const updated =
        await AuthorityComplaintService.satisfy(authorityComplaintId)
      setTicket(updated)
      notice({
        msg: "Đã đóng khiếu nại gửi Cơ quan ATTP",
        isSuccess: true,
      })
    })
  }

  const handleConfirmReopen = event => {
    event.preventDefault()
    const trimmed = reopenReason.trim()
    const len = countCodePoints(trimmed)
    if (len > MAX_COMMENT_LENGTH) {
      setReopenError(
        `Lý do không được vượt quá ${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự.`,
      )
      return
    }
    setReopenError("")
    runAction(
      "REOPEN",
      async () => {
        const updated = await AuthorityComplaintService.reopen(
          authorityComplaintId,
          trimmed || undefined,
        )
        setTicket(updated)
        setReopenOpen(false)
        setReopenReason("")
        notice({
          msg: "Đã gửi yêu cầu Cơ quan ATTP xử lý lại",
          isSuccess: true,
        })
      },
      {
        onCloseDialog: () => setReopenOpen(false),
        onInlineError: parsed =>
          setReopenError(parsed.fields?.reason || parsed.message),
      },
    )
  }

  const commentLength = countCodePoints(commentText)
  const reopenLength = countCodePoints(reopenReason)
  const milestoneDate =
    displayStatus === TICKET_STATUS.CLOSED
      ? formatDateDividerLabel(ticket?.closedAt || ticket?.updatedAt)
      : displayStatus === TICKET_STATUS.RESOLVED
        ? formatDateDividerLabel(ticket?.lastResolvedAt || ticket?.updatedAt)
        : ""
  const closeReasonText = ticket?.closeReason
    ? CLOSE_REASON_LABELS[ticket.closeReason] || ticket.closeReason
    : ""

  return (
    <section
      className={styles.section}
      aria-label="Xử lý leo thang — Cơ quan An toàn thực phẩm"
    >
      <button
        type="button"
        className={styles.headerToggle}
        aria-expanded={expanded}
        onClick={() => setExpanded(prev => !prev)}
      >
        <div className={styles.headerLeft}>
          <span className={styles.escalatedPill}>
            <NorthEast sx={{ fontSize: 14 }} aria-hidden="true" />
            Leo thang
          </span>
          <h2 className={styles.sectionTitle}>
            Xử lý của Cơ quan An toàn thực phẩm
          </h2>
          <span className={styles.codeChip}>{codeDisplay}</span>
          {ticket ? (
            <TicketStatusBadge
              status={displayStatus}
              hasNewMessage={ticket.hasNewMessage}
              size="sm"
            />
          ) : null}
        </div>
        <KeyboardArrowUp
          className={`${styles.chevron} ${!expanded ? styles.chevronCollapsed : ""}`.trim()}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div className={styles.body}>
          {loading && !ticket ? (
            <div
              className={styles.skeletonWrap}
              role="status"
              aria-label="Đang tải thông tin leo thang ATTP"
            >
              <div className={styles.skeletonGrid}>
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
              </div>
              <div className={styles.skeletonBarWide} />
              <div className={styles.skeletonBarWide} />
            </div>
          ) : error && !ticket ? (
            <div className={styles.errorBox} role="alert">
              <ErrorOutlineOutlined
                className={styles.errorIcon}
                fontSize="small"
                aria-hidden="true"
              />
              <div className={styles.errorContent}>
                <p className={styles.errorTitle}>
                  Không thể tải hồ sơ leo thang ATTP
                </p>
                <p className={styles.errorDesc}>{error.message}</p>
              </div>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<ReplayOutlined fontSize="small" />}
                onClick={() => setReloadTick(prev => prev + 1)}
              >
                Thử lại
              </Button>
            </div>
          ) : ticket ? (
            <>
              <div className={styles.metaStrip}>
                <div className={styles.metaCell}>
                  <span className={styles.metaLabel}>
                    Đơn vị ATTP tiếp nhận
                  </span>
                  <span className={styles.metaValue}>
                    {ticket.recipientUnit?.name || "—"}
                  </span>
                </div>
                <div className={styles.metaCell}>
                  <span className={styles.metaLabel}>
                    Thời gian chuyển ATTP
                  </span>
                  <span className={styles.metaValue}>
                    {formatDateTimeVi(ticket.submittedAt, "—")}
                  </span>
                </div>
                <div className={styles.metaCell}>
                  <span className={styles.metaLabel}>Thời gian đóng</span>
                  <span
                    className={`${styles.metaValue} ${!ticket.closedAt ? styles.metaMuted : ""}`.trim()}
                  >
                    {ticket.closedAt
                      ? formatDateTimeVi(ticket.closedAt, "-")
                      : "-"}
                  </span>
                </div>
              </div>

              <EvidenceAttachmentList
                attachments={ticket.attachments}
                title="Tệp gửi kèm khi chuyển ATTP"
                className={styles.escalationAttachments}
              />

              {readOnly ? (
                <div className={styles.readOnlyNote} role="note">
                  <VisibilityOutlined
                    sx={{ fontSize: 16 }}
                    aria-hidden="true"
                  />
                  <span>
                    Ban Giám hiệu đang theo dõi ở chế độ chỉ xem tiến độ xử lý
                    của Cơ quan ATTP.
                  </span>
                </div>
              ) : null}

              <div className={styles.threadContainer}>
                {comments.length === 0 ? (
                  <p className={styles.emptyThread}>
                    Cơ quan ATTP chưa có trao đổi mới. Mọi phản hồi và kết quả
                    xử lý từ cán bộ ATTP sẽ hiển thị tại đây.
                  </p>
                ) : (
                  commentGroups.map(group => (
                    <div key={group.label} className={styles.dateGroup}>
                      <div className={styles.dividerRow}>{group.label}</div>
                      {group.items.map(comment => {
                        const isSelf =
                          Boolean(currentUser?.id) &&
                          comment.author?.id === currentUser.id
                        const authorName = isSelf
                          ? "Bạn"
                          : comment.author?.fullName || "Cán bộ ATTP"
                        const typeMeta = COMMENT_TYPE_META[comment.commentType]
                        const isLastWithUnread =
                          Boolean(ticket.hasNewMessage) &&
                          comment.id === lastCommentId
                        const bodyHighlightClass =
                          COMMENT_BODY_CLASS[comment.commentType] || ""

                        return (
                          <article
                            key={comment.id}
                            className={styles.commentRow}
                          >
                            <UserAvatar
                              user={comment.author}
                              className={styles.avatar}
                            />
                            <div className={styles.commentMain}>
                              <div className={styles.commentHeader}>
                                <span className={styles.authorName}>
                                  {authorName}
                                </span>
                                {typeMeta ? (
                                  <span
                                    className={`${styles.commentTypeTag} ${COMMENT_TAG_CLASS[typeMeta.tone] || ""}`.trim()}
                                  >
                                    {typeMeta.label}
                                  </span>
                                ) : null}
                                <span className={styles.commentTime}>
                                  {formatTimeVi(comment.createdAt)}
                                </span>
                                {isLastWithUnread ? (
                                  <span
                                    className={styles.unreadDot}
                                    title="Tin nhắn mới"
                                    aria-label="Tin nhắn mới"
                                  />
                                ) : null}
                              </div>
                              <p
                                className={`${styles.commentBody} ${
                                  bodyHighlightClass
                                    ? `${styles.commentBodyHighlighted} ${bodyHighlightClass}`
                                    : ""
                                }`.trim()}
                              >
                                {comment.content}
                              </p>
                              <EvidenceAttachmentList
                                attachments={comment.attachments}
                                className={styles.commentAttachments}
                              />
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  ))
                )}

                {displayStatus === TICKET_STATUS.RESOLVED ? (
                  <div className={styles.dividerRow}>
                    <span className={styles.milestoneText}>
                      {milestoneDate ? `${milestoneDate} • ` : ""}
                      Hồ sơ leo thang <strong>{codeDisplay}</strong> đã được xử
                      lý
                    </span>
                  </div>
                ) : null}

                {displayStatus === TICKET_STATUS.CLOSED ? (
                  <div className={styles.dividerRow}>
                    <span className={styles.milestoneText}>
                      {milestoneDate ? `${milestoneDate} • ` : ""}
                      Hồ sơ leo thang <strong>{codeDisplay}</strong> đã đóng
                      {closeReasonText ? ` (${closeReasonText})` : ""}
                    </span>
                  </div>
                ) : null}

                {canComment ? (
                  <form
                    className={styles.composerBox}
                    onSubmit={handleSendComment}
                    noValidate
                  >
                    <textarea
                      className={styles.composerTextarea}
                      placeholder="Nhập nội dung trao đổi với Cơ quan ATTP..."
                      value={commentText}
                      disabled={Boolean(busyAction)}
                      maxLength={MAX_COMMENT_LENGTH}
                      rows={3}
                      aria-label="Nội dung trao đổi với Cơ quan ATTP"
                      onChange={event => {
                        setCommentText(event.target.value)
                        if (commentError) setCommentError("")
                      }}
                    />
                    {commentError ? (
                      <p className={styles.composerError} role="alert">
                        {commentError}
                      </p>
                    ) : null}
                    <div className={styles.composerToolbar}>
                      <div className={styles.composerMeta}>
                        <EvidenceFilePicker
                          compact
                          value={commentFiles}
                          onChange={files => {
                            setCommentFiles(files)
                            if (commentError) setCommentError("")
                          }}
                          disabled={Boolean(busyAction)}
                        />
                        <span className={styles.charCount}>
                          {commentLength.toLocaleString("vi-VN")}/
                          {MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự
                        </span>
                      </div>
                      <Button
                        type="submit"
                        variant="contained"
                        className={styles.primaryBtn}
                        disabled={Boolean(busyAction) || commentLength === 0}
                        endIcon={<SendOutlined fontSize="small" />}
                      >
                        {busyAction === "COMMENT" ? "Đang gửi..." : "Gửi"}
                      </Button>
                    </div>
                  </form>
                ) : null}

                {showFeedbackBox ? (
                  <>
                    <div className={styles.satisfactionCard}>
                      <p className={styles.satisfactionQuestion}>
                        Bạn có hài lòng với kết quả xử lý từ Cơ quan ATTP không?
                      </p>
                      <div className={styles.satisfactionActions}>
                        {canSatisfy ? (
                          <Button
                            type="button"
                            variant="contained"
                            className={styles.primaryBtn}
                            startIcon={<CheckCircleOutlined fontSize="small" />}
                            disabled={Boolean(busyAction)}
                            onClick={handleSatisfy}
                          >
                            {busyAction === "SATISFY"
                              ? "Đang xác nhận..."
                              : "Hài lòng & Đóng yêu cầu"}
                          </Button>
                        ) : null}
                        {canReopen ? (
                          <Button
                            type="button"
                            variant="outlined"
                            className={styles.secondaryBtn}
                            startIcon={<ReplayOutlined fontSize="small" />}
                            disabled={Boolean(busyAction)}
                            onClick={() => {
                              setReopenError("")
                              setReopenOpen(true)
                            }}
                          >
                            Yêu cầu xử lý lại
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <div className={styles.infoBanner} role="note">
                      <InfoOutlined
                        fontSize="small"
                        className={styles.infoBannerIcon}
                        aria-hidden="true"
                      />
                      <div className={styles.infoBannerBody}>
                        <span>
                          Hồ sơ tự đóng sau 48 giờ nếu không phản hồi.
                        </span>
                        {countdown ? (
                          <span className={styles.countdownInline}>
                            {countdown.text}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : displayStatus === TICKET_STATUS.RESOLVED ? (
                  <div className={styles.infoBanner} role="note">
                    <InfoOutlined
                      fontSize="small"
                      className={styles.infoBannerIcon}
                      aria-hidden="true"
                    />
                    <div className={styles.infoBannerBody}>
                      <span>Chờ phụ huynh xác nhận kết quả.</span>
                      {countdown ? (
                        <span className={styles.countdownInline}>
                          {countdown.text}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <Dialog
        open={reopenOpen}
        onClose={busyAction ? undefined : () => setReopenOpen(false)}
        fullWidth
        slotProps={{ paper: { className: styles.dialogPaper } }}
      >
        <form onSubmit={handleConfirmReopen} noValidate>
          <DialogTitle className={styles.dialogTitle}>
            Yêu cầu Cơ quan ATTP xử lý lại
          </DialogTitle>
          <DialogContent dividers className={styles.dialogContent}>
            {reopenError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {reopenError}
              </Alert>
            ) : null}
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={4}
              label="Lý do yêu cầu xử lý lại (không bắt buộc)"
              placeholder="Nhập lý do cụ thể..."
              value={reopenReason}
              disabled={Boolean(busyAction)}
              slotProps={{ htmlInput: { maxLength: MAX_COMMENT_LENGTH } }}
              helperText={`${reopenLength.toLocaleString("vi-VN")}/${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự`}
              onChange={event => {
                setReopenReason(event.target.value)
                if (reopenError) setReopenError("")
              }}
            />
          </DialogContent>
          <DialogActions className={styles.dialogActions}>
            <Button
              type="button"
              onClick={() => setReopenOpen(false)}
              disabled={Boolean(busyAction)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              className={styles.primaryBtn}
              disabled={Boolean(busyAction)}
            >
              {busyAction === "REOPEN" ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </section>
  )
}
