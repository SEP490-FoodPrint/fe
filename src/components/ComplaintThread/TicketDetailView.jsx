import React, { useContext, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
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
  ArrowBack,
  CheckCircleOutlined,
  ErrorOutlineOutlined,
  GppMaybeOutlined,
  InfoOutlined,
  KeyboardArrowUp,
  MarkChatReadOutlined,
  ReplayOutlined,
  SendOutlined,
  TaskAltOutlined,
} from "@mui/icons-material"
import UserAvatar from "src/components/Common/UserAvatar"
import {
  EvidenceAttachmentList,
  EvidenceFilePicker,
} from "src/components/EvidenceFiles"
import notice from "src/components/Notice"
import { StoreContext } from "src/contexts"
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
import styles from "./TicketDetailView.module.scss"

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

export default function TicketDetailView({
  ticket,
  loading = false,
  error = null,
  backLabel = "Quay lại danh sách",
  onBack,
  onReload,
  metaItems = [],
  includeTimestamps = true,
  escalated = false,
  threadTitle = "Đoạn trò chuyện",
  detailExtra = null,
  afterThread = null,
  onAccept,
  onComment,
  onResolve,
  onSatisfy,
  onReopen,
  onEscalate,
  defaultDetailExpanded = true,
  defaultThreadExpanded = true,
}) {
  const { userStore } = useContext(StoreContext) || {}
  const currentUser = userStore?.user

  const [detailOpen, setDetailOpen] = useState(defaultDetailExpanded)
  const [threadOpen, setThreadOpen] = useState(defaultThreadExpanded)

  const [commentText, setCommentText] = useState("")
  const [commentFiles, setCommentFiles] = useState([])
  const [commentError, setCommentError] = useState("")
  const [busyAction, setBusyAction] = useState("")

  // Dialogs state
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolveText, setResolveText] = useState("")
  const [resolveError, setResolveError] = useState("")
  const [resolveFiles, setResolveFiles] = useState([])

  const [reopenOpen, setReopenOpen] = useState(false)
  const [reopenReason, setReopenReason] = useState("")
  const [reopenError, setReopenError] = useState("")

  const [escalateOpen, setEscalateOpen] = useState(false)
  const [escalateReason, setEscalateReason] = useState("")
  const [escalateError, setEscalateError] = useState("")
  const [escalateFiles, setEscalateFiles] = useState([])

  // Live countdown ticker for 48h auto-close
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    if (!ticket?.feedbackDeadlineAt) return undefined
    setNowMs(Date.now())
    const timer = setInterval(() => setNowMs(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [ticket?.feedbackDeadlineAt])

  // Reset composer when switching ticket
  useEffect(() => {
    setCommentText("")
    setCommentError("")
    setCommentFiles([])
    setResolveOpen(false)
    setResolveText("")
    setResolveError("")
    setResolveFiles([])
    setReopenOpen(false)
    setReopenReason("")
    setReopenError("")
    setEscalateOpen(false)
    setEscalateReason("")
    setEscalateError("")
    setEscalateFiles([])
  }, [ticket?.id])

  const allowedActions = useMemo(
    () => (Array.isArray(ticket?.allowedActions) ? ticket.allowedActions : []),
    [ticket?.allowedActions],
  )
  const canAccept = allowedActions.includes("ACCEPT") && Boolean(onAccept)
  const canComment = allowedActions.includes("COMMENT") && Boolean(onComment)
  const canResolve = allowedActions.includes("RESOLVE") && Boolean(onResolve)
  const canSatisfy = allowedActions.includes("SATISFY") && Boolean(onSatisfy)
  const canReopen = allowedActions.includes("REOPEN") && Boolean(onReopen)
  const canEscalate = allowedActions.includes("ESCALATE") && Boolean(onEscalate)
  const hasRequesterDecision = canSatisfy || canReopen || canEscalate

  const comments = useMemo(
    () => (Array.isArray(ticket?.comments) ? ticket.comments : []),
    [ticket?.comments],
  )
  const commentGroups = useMemo(() => groupCommentsByDate(comments), [comments])
  const lastCommentId =
    comments.length > 0 ? comments[comments.length - 1]?.id : null

  const countdown = useMemo(
    () => formatCountdown(ticket?.feedbackDeadlineAt, nowMs),
    [ticket?.feedbackDeadlineAt, nowMs],
  )

  const computedMetaItems = useMemo(() => {
    const items = Array.isArray(metaItems) ? [...metaItems] : []
    if (includeTimestamps && items.length <= 3) {
      items.push(
        {
          label: "Thời gian tạo",
          value: formatDateTimeVi(ticket?.submittedAt, "-"),
        },
        {
          label: "Thời gian đóng",
          value: ticket?.closedAt
            ? formatDateTimeVi(ticket.closedAt, "-")
            : "-",
          muted: !ticket?.closedAt,
        },
      )
    }
    return items
  }, [metaItems, includeTimestamps, ticket?.submittedAt, ticket?.closedAt])

  const codeDisplay = formatTicketCode(ticket?.code, "—")
  const displayStatus = ticket?.displayStatus || ticket?.status

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
        "Không thể thực hiện thao tác lúc này. Vui lòng thử lại.",
      )
      if (parsed.status === 409) {
        if (onCloseDialog) onCloseDialog()
        notice({ msg: parsed.message, isSuccess: false })
        if (onReload) onReload()
      } else if (onInlineError) {
        onInlineError(parsed)
      } else {
        notice({ msg: parsed.message, isSuccess: false })
      }
    } finally {
      setBusyAction("")
    }
  }

  const handleAccept = () => {
    runAction("ACCEPT", async () => {
      await onAccept()
      notice({ msg: "Đã tiếp nhận yêu cầu", isSuccess: true })
    })
  }

  const handleSendComment = event => {
    event.preventDefault()
    const trimmed = commentText.trim()
    const length = countCodePoints(trimmed)
    if (length === 0) {
      setCommentError("Vui lòng nhập nội dung trao đổi.")
      return
    }
    if (length > MAX_COMMENT_LENGTH) {
      setCommentError(
        `Nội dung không được vượt quá ${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự.`,
      )
      return
    }
    setCommentError("")
    runAction(
      "COMMENT",
      async () => {
        await onComment(trimmed, commentFiles)
        setCommentText("")
        setCommentFiles([])
        notice({ msg: "Đã gửi tin nhắn", isSuccess: true })
      },
      {
        onInlineError: parsed =>
          setCommentError(
            parsed.fields?.content || parsed.fields?.files || parsed.message,
          ),
      },
    )
  }

  const handleConfirmResolve = event => {
    event.preventDefault()
    const trimmed = resolveText.trim()
    const length = countCodePoints(trimmed)
    if (length === 0) {
      setResolveError("Vui lòng nhập nội dung kết quả xử lý.")
      return
    }
    if (length > MAX_COMMENT_LENGTH) {
      setResolveError(
        `Nội dung không được vượt quá ${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự.`,
      )
      return
    }
    setResolveError("")
    runAction(
      "RESOLVE",
      async () => {
        await onResolve(trimmed, resolveFiles)
        setResolveOpen(false)
        setResolveText("")
        setResolveFiles([])
        notice({ msg: "Đã cập nhật trạng thái Đã xử lý", isSuccess: true })
      },
      {
        onCloseDialog: () => setResolveOpen(false),
        onInlineError: parsed =>
          setResolveError(
            parsed.fields?.content || parsed.fields?.files || parsed.message,
          ),
      },
    )
  }

  const handleSatisfy = () => {
    runAction("SATISFY", async () => {
      await onSatisfy()
      notice({ msg: "Đã đóng yêu cầu", isSuccess: true })
    })
  }

  const handleConfirmReopen = event => {
    event.preventDefault()
    const trimmed = reopenReason.trim()
    const length = countCodePoints(trimmed)
    if (length > MAX_COMMENT_LENGTH) {
      setReopenError(
        `Lý do không được vượt quá ${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự.`,
      )
      return
    }
    setReopenError("")
    runAction(
      "REOPEN",
      async () => {
        await onReopen(trimmed || undefined)
        setReopenOpen(false)
        setReopenReason("")
        notice({ msg: "Đã gửi yêu cầu xử lý lại", isSuccess: true })
      },
      {
        onCloseDialog: () => setReopenOpen(false),
        onInlineError: parsed =>
          setReopenError(parsed.fields?.reason || parsed.message),
      },
    )
  }

  const handleConfirmEscalate = event => {
    event.preventDefault()
    const trimmed = escalateReason.trim()
    const length = countCodePoints(trimmed)
    if (length > MAX_COMMENT_LENGTH) {
      setEscalateError(
        `Lý do không được vượt quá ${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự.`,
      )
      return
    }
    setEscalateError("")
    runAction(
      "ESCALATE",
      async () => {
        await onEscalate(trimmed || undefined, escalateFiles)
        setEscalateOpen(false)
        setEscalateReason("")
        setEscalateFiles([])
      },
      {
        onCloseDialog: () => setEscalateOpen(false),
        onInlineError: parsed =>
          setEscalateError(
            parsed.fields?.reason || parsed.fields?.files || parsed.message,
          ),
      },
    )
  }

  if (loading && !ticket) {
    return (
      <div
        className={styles.page}
        role="status"
        aria-live="polite"
        aria-label="Đang tải chi tiết yêu cầu"
      >
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label={backLabel}
          >
            <ArrowBack />
          </button>
          <div
            className={styles.skeletonBlock}
            style={{ width: "48%", height: 24 }}
          />
        </div>
        <div className={styles.card}>
          <div className={styles.metaGrid}>
            {[0, 1, 2, 3, 4, 5].map(idx => (
              <div key={idx} className={styles.metaCell}>
                <div
                  className={styles.skeletonBlock}
                  style={{ width: "42%", height: 12 }}
                />
                <div
                  className={styles.skeletonBlock}
                  style={{ width: "74%", height: 18 }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <div
            className={styles.skeletonBlock}
            style={{ width: "26%", height: 18, marginBottom: 14 }}
          />
          <div
            className={styles.skeletonBlock}
            style={{ width: "100%", height: 14, marginBottom: 8 }}
          />
          <div
            className={styles.skeletonBlock}
            style={{ width: "86%", height: 14 }}
          />
        </div>
        <div className={styles.card}>
          <div
            className={styles.skeletonBlock}
            style={{ width: "30%", height: 18, marginBottom: 14 }}
          />
          <div
            className={styles.skeletonBlock}
            style={{ width: "92%", height: 48 }}
          />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.message ||
          "Không tìm thấy yêu cầu hoặc bạn không có quyền xem."
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label={backLabel}
          >
            <ArrowBack />
          </button>
          <h1 className={styles.pageHeading}>Chi tiết yêu cầu</h1>
        </div>
        <div className={styles.errorCard} role="alert">
          <div className={styles.errorIconWrap} aria-hidden="true">
            <ErrorOutlineOutlined />
          </div>
          <p className={styles.errorTitle}>Không thể tải chi tiết yêu cầu</p>
          <p className={styles.errorDesc}>{errorMessage}</p>
          <div className={styles.satisfactionActions}>
            {onReload ? (
              <Button
                type="button"
                variant="outlined"
                className={styles.secondaryBtn}
                startIcon={<ReplayOutlined />}
                onClick={onReload}
              >
                Thử lại
              </Button>
            ) : null}
            <Button
              type="button"
              variant="contained"
              className={styles.primaryBtn}
              onClick={onBack}
            >
              {backLabel}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const commentLength = countCodePoints(commentText)
  const resolveLength = countCodePoints(resolveText)
  const reopenLength = countCodePoints(reopenReason)
  const escalateLength = countCodePoints(escalateReason)

  const milestoneDate =
    displayStatus === TICKET_STATUS.CLOSED
      ? formatDateDividerLabel(ticket.closedAt || ticket.updatedAt)
      : displayStatus === TICKET_STATUS.RESOLVED
        ? formatDateDividerLabel(ticket.lastResolvedAt || ticket.updatedAt)
        : ""

  const closeReasonText = ticket.closeReason
    ? CLOSE_REASON_LABELS[ticket.closeReason] || ticket.closeReason
    : ""

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          aria-label={backLabel}
          title={backLabel}
        >
          <ArrowBack />
        </button>
        <h1 className={styles.pageHeading}>
          <span className={styles.codePrefix}>{codeDisplay}</span>
          {ticket.title ? `: ${ticket.title}` : ""}
        </h1>
      </header>

      {/* Card 1: Summary Metadata 3x2 Grid */}
      <section className={styles.card} aria-label="Thông tin chung yêu cầu">
        <div className={styles.metaGrid}>
          <div className={styles.metaCell}>
            <span className={styles.metaLabel}>Trạng thái</span>
            <TicketStatusBadge
              status={displayStatus}
              hasNewMessage={ticket.hasNewMessage}
              escalated={escalated}
              showNewMessageText
            />
          </div>

          {computedMetaItems.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className={styles.metaCell}>
              <span className={styles.metaLabel}>{item.label}</span>
              {item.render ? (
                item.render
              ) : item.linkTo ? (
                <Link to={item.linkTo} className={styles.metaLink}>
                  {item.value || "—"}
                </Link>
              ) : item.chip ? (
                <span className={styles.metaChip}>{item.value || "—"}</span>
              ) : (
                <span
                  className={`${styles.metaValue} ${item.muted ? styles.metaValueMuted : ""}`.trim()}
                >
                  {item.value || "—"}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Card 2: Collapsible Chi tiết yêu cầu */}
      <section className={styles.collapsibleCard} aria-label="Chi tiết yêu cầu">
        <button
          type="button"
          className={styles.cardToggleHeader}
          aria-expanded={detailOpen}
          onClick={() => setDetailOpen(open => !open)}
        >
          <span className={styles.cardTitleGroup}>
            <h2 className={styles.cardTitle}>Chi tiết yêu cầu</h2>
          </span>
          <KeyboardArrowUp
            className={`${styles.chevron} ${!detailOpen ? styles.chevronCollapsed : ""}`.trim()}
            aria-hidden="true"
          />
        </button>

        {detailOpen ? (
          <div className={styles.cardBody}>
            <p className={styles.detailLabel}>Nội dung</p>
            <p className={styles.descriptionText}>
              {ticket.description || "Không có nội dung mô tả."}
            </p>
            <EvidenceAttachmentList
              attachments={ticket.attachments}
              title="Tệp đính kèm"
              className={styles.detailAttachments}
            />
            {detailExtra ? (
              <div className={styles.detailExtraWrap}>{detailExtra}</div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Card 3: Collapsible Đoạn trò chuyện */}
      <section className={styles.collapsibleCard} aria-label="Đoạn trò chuyện">
        <button
          type="button"
          className={styles.cardToggleHeader}
          aria-expanded={threadOpen}
          onClick={() => setThreadOpen(open => !open)}
        >
          <span className={styles.cardTitleGroup}>
            <h2 className={styles.cardTitle}>{threadTitle}</h2>
            {comments.length > 0 ? (
              <span className={styles.countPill}>{comments.length}</span>
            ) : null}
          </span>
          <KeyboardArrowUp
            className={`${styles.chevron} ${!threadOpen ? styles.chevronCollapsed : ""}`.trim()}
            aria-hidden="true"
          />
        </button>

        {threadOpen ? (
          <div className={styles.cardBody}>
            <div className={styles.threadContainer}>
              {comments.length === 0 ? (
                <p className={styles.emptyThread}>
                  Chưa có trao đổi nào. Các phản hồi và kết quả xử lý sẽ hiển
                  thị tại đây.
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
                        : comment.author?.fullName || "Người dùng"
                      const typeMeta = COMMENT_TYPE_META[comment.commentType]
                      const isLastWithUnread =
                        Boolean(ticket.hasNewMessage) &&
                        comment.id === lastCommentId
                      const bodyHighlightClass =
                        COMMENT_BODY_CLASS[comment.commentType] || ""

                      return (
                        <article key={comment.id} className={styles.commentRow}>
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
                                  title="Tin nhắn mới chưa xử lý"
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

              {/* Status milestone divider for RESOLVED or CLOSED */}
              {displayStatus === TICKET_STATUS.RESOLVED ? (
                <div className={styles.dividerRow}>
                  <span className={styles.milestoneText}>
                    {milestoneDate ? `${milestoneDate} • ` : ""}
                    Yêu cầu <strong>{codeDisplay}</strong> đã được xử lý
                  </span>
                </div>
              ) : null}

              {displayStatus === TICKET_STATUS.CLOSED ? (
                <div className={styles.dividerRow}>
                  <span className={styles.milestoneText}>
                    {milestoneDate ? `${milestoneDate} • ` : ""}
                    Yêu cầu <strong>{codeDisplay}</strong> đã đóng
                    {closeReasonText ? ` (${closeReasonText})` : ""}
                  </span>
                </div>
              ) : null}

              {/* ACTION: ACCEPT */}
              {canAccept ? (
                <div className={styles.acceptBar}>
                  <div className={styles.acceptInfo}>
                    <span className={styles.acceptIcon} aria-hidden="true">
                      <MarkChatReadOutlined fontSize="small" />
                    </span>
                    <div>
                      <p className={styles.acceptTitle}>
                        {ticket.status === TICKET_STATUS.REOPENED
                          ? "Yêu cầu đang chờ tiếp nhận xử lý lại"
                          : "Yêu cầu mới đang chờ tiếp nhận"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="contained"
                    className={styles.primaryBtn}
                    disabled={Boolean(busyAction)}
                    onClick={handleAccept}
                  >
                    {busyAction === "ACCEPT"
                      ? "Đang tiếp nhận…"
                      : "Tiếp nhận yêu cầu"}
                  </Button>
                </div>
              ) : null}

              {/* ACTION: COMMENT (+ optional RESOLVE button in composer) */}
              {canComment ? (
                <form
                  className={styles.composerCard}
                  onSubmit={handleSendComment}
                  noValidate
                >
                  <textarea
                    className={styles.composerTextarea}
                    placeholder="Nhập nội dung..."
                    value={commentText}
                    disabled={Boolean(busyAction)}
                    maxLength={MAX_COMMENT_LENGTH}
                    onChange={event => {
                      setCommentText(event.target.value)
                      if (commentError) setCommentError("")
                    }}
                    aria-label="Nội dung trao đổi"
                  />
                  {commentError ? (
                    <p className={styles.composerError} role="alert">
                      {commentError}
                    </p>
                  ) : null}
                  <div className={styles.composerFooter}>
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
                      <span
                        className={`${styles.charCounter} ${commentLength > MAX_COMMENT_LENGTH ? styles.charCounterError : ""}`.trim()}
                      >
                        {commentLength.toLocaleString("vi-VN")}/
                        {MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự
                      </span>
                    </div>
                    <div className={styles.composerActions}>
                      {canResolve ? (
                        <Button
                          type="button"
                          variant="outlined"
                          className={styles.secondaryBtn}
                          startIcon={<TaskAltOutlined fontSize="small" />}
                          disabled={Boolean(busyAction)}
                          onClick={() => {
                            setResolveError("")
                            setResolveOpen(true)
                          }}
                        >
                          Đánh dấu đã xử lý
                        </Button>
                      ) : null}
                      <Button
                        type="submit"
                        variant="contained"
                        className={styles.primaryBtn}
                        endIcon={<SendOutlined fontSize="small" />}
                        disabled={
                          Boolean(busyAction) ||
                          commentLength === 0 ||
                          commentLength > MAX_COMMENT_LENGTH
                        }
                      >
                        {busyAction === "COMMENT" ? "Đang gửi…" : "Gửi"}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : canResolve ? (
                <div className={styles.acceptBar}>
                  <div className={styles.acceptInfo}>
                    <span className={styles.acceptIcon} aria-hidden="true">
                      <TaskAltOutlined fontSize="small" />
                    </span>
                    <div>
                      <p className={styles.acceptTitle}>Hoàn tất xử lý</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="contained"
                    className={styles.primaryBtn}
                    disabled={Boolean(busyAction)}
                    onClick={() => {
                      setResolveError("")
                      setResolveOpen(true)
                    }}
                  >
                    Đánh dấu đã xử lý
                  </Button>
                </div>
              ) : null}

              {/* ACTION: SATISFY / REOPEN / ESCALATE (Figma Resolved State!) */}
              {hasRequesterDecision ? (
                <>
                  <div className={styles.satisfactionCard}>
                    <p className={styles.satisfactionTitle}>
                      Bạn có hài lòng với kết quả xử lý này không?
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
                            ? "Đang xác nhận…"
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
                      {canEscalate ? (
                        <Button
                          type="button"
                          variant="outlined"
                          className={styles.escalateBtn}
                          startIcon={<GppMaybeOutlined fontSize="small" />}
                          disabled={Boolean(busyAction)}
                          onClick={() => {
                            setEscalateError("")
                            setEscalateOpen(true)
                          }}
                        >
                          Chuyển cơ quan ATTP
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
                        Yêu cầu tự đóng sau 48 giờ nếu không phản hồi.
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
                    <span>Chờ người gửi xác nhận kết quả.</span>
                    {countdown ? (
                      <span className={styles.countdownInline}>
                        {countdown.text}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {afterThread ? (
        <div className={styles.afterThreadWrap}>{afterThread}</div>
      ) : null}

      {/* Resolve Dialog */}
      <Dialog
        open={resolveOpen}
        onClose={busyAction ? undefined : () => setResolveOpen(false)}
        fullWidth
        slotProps={{ paper: { className: styles.dialogPaper } }}
      >
        <form onSubmit={handleConfirmResolve} noValidate>
          <DialogTitle className={styles.dialogTitle}>
            Đánh dấu đã xử lý
          </DialogTitle>
          <DialogContent dividers className={styles.dialogContent}>
            <p className={styles.dialogHelper}>
              Người gửi có 48 giờ để xác nhận hài lòng hoặc yêu cầu xử lý lại.
            </p>
            {resolveError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {resolveError}
              </Alert>
            ) : null}
            <TextField
              autoFocus
              fullWidth
              required
              multiline
              minRows={4}
              label="Kết quả xử lý"
              placeholder="Mô tả biện pháp đã thực hiện và kết quả xử lý..."
              value={resolveText}
              disabled={busyAction === "RESOLVE"}
              onChange={event => {
                setResolveText(event.target.value)
                if (resolveError) setResolveError("")
              }}
              slotProps={{ htmlInput: { maxLength: MAX_COMMENT_LENGTH } }}
              helperText={`${resolveLength.toLocaleString("vi-VN")}/${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự · Bắt buộc`}
            />
            <div className={styles.dialogFiles}>
              <EvidenceFilePicker
                value={resolveFiles}
                onChange={setResolveFiles}
                disabled={busyAction === "RESOLVE"}
              />
            </div>
          </DialogContent>
          <DialogActions className={styles.dialogActions}>
            <Button
              type="button"
              onClick={() => setResolveOpen(false)}
              disabled={busyAction === "RESOLVE"}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              className={styles.primaryBtn}
              disabled={
                busyAction === "RESOLVE" ||
                resolveLength === 0 ||
                resolveLength > MAX_COMMENT_LENGTH
              }
            >
              {busyAction === "RESOLVE"
                ? "Đang cập nhật…"
                : "Xác nhận đã xử lý"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reopen Dialog */}
      <Dialog
        open={reopenOpen}
        onClose={busyAction ? undefined : () => setReopenOpen(false)}
        fullWidth
        slotProps={{ paper: { className: styles.dialogPaper } }}
      >
        <form onSubmit={handleConfirmReopen} noValidate>
          <DialogTitle className={styles.dialogTitle}>
            Yêu cầu xử lý lại
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
              placeholder="Nêu rõ nội dung cần kiểm tra hoặc bổ sung..."
              value={reopenReason}
              disabled={busyAction === "REOPEN"}
              onChange={event => {
                setReopenReason(event.target.value)
                if (reopenError) setReopenError("")
              }}
              slotProps={{ htmlInput: { maxLength: MAX_COMMENT_LENGTH } }}
              helperText={`${reopenLength.toLocaleString("vi-VN")}/${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự`}
            />
          </DialogContent>
          <DialogActions className={styles.dialogActions}>
            <Button
              type="button"
              onClick={() => setReopenOpen(false)}
              disabled={busyAction === "REOPEN"}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              className={styles.primaryBtn}
              disabled={
                busyAction === "REOPEN" || reopenLength > MAX_COMMENT_LENGTH
              }
            >
              {busyAction === "REOPEN" ? "Đang gửi…" : "Gửi yêu cầu xử lý lại"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Escalate to ATTP Dialog (C03 -> C05) */}
      <Dialog
        open={escalateOpen}
        onClose={busyAction ? undefined : () => setEscalateOpen(false)}
        fullWidth
        slotProps={{ paper: { className: styles.dialogPaper } }}
      >
        <form onSubmit={handleConfirmEscalate} noValidate>
          <DialogTitle className={styles.dialogTitle}>
            Chuyển khiếu nại lên Cơ quan ATTP
          </DialogTitle>
          <DialogContent dividers className={styles.dialogContent}>
            <p className={styles.dialogHelper}>
              Đơn <strong>{codeDisplay}</strong> sẽ được đóng và chuyển tới đơn
              vị ATTP phường/xã kèm lịch sử trao đổi.
            </p>
            {escalateError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {escalateError}
              </Alert>
            ) : null}
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={4}
              label="Lý do chuyển cơ quan ATTP (không bắt buộc)"
              placeholder="Mô tả lý do bạn muốn chuyển khiếu nại lên cơ quan chức năng..."
              value={escalateReason}
              disabled={busyAction === "ESCALATE"}
              onChange={event => {
                setEscalateReason(event.target.value)
                if (escalateError) setEscalateError("")
              }}
              slotProps={{ htmlInput: { maxLength: MAX_COMMENT_LENGTH } }}
              helperText={`${escalateLength.toLocaleString("vi-VN")}/${MAX_COMMENT_LENGTH.toLocaleString("vi-VN")} ký tự`}
            />
            <div className={styles.dialogFiles}>
              <EvidenceFilePicker
                value={escalateFiles}
                onChange={setEscalateFiles}
                disabled={busyAction === "ESCALATE"}
              />
            </div>
          </DialogContent>
          <DialogActions className={styles.dialogActions}>
            <Button
              type="button"
              onClick={() => setEscalateOpen(false)}
              disabled={busyAction === "ESCALATE"}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={
                busyAction === "ESCALATE" || escalateLength > MAX_COMMENT_LENGTH
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none",
              }}
            >
              {busyAction === "ESCALATE"
                ? "Đang chuyển…"
                : "Xác nhận chuyển ATTP"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}
