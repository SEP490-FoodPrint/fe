import React, { useContext, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  Alert,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import SearchIcon from "@mui/icons-material/Search"
import UserAvatar from "src/components/Common/UserAvatar"
import {
  COMMENT_TYPE_META,
  formatDateTimeVi,
  formatTicketCode,
  HANDLER_STATUS_OPTIONS,
  parseApiError,
  REQUESTER_STATUS_OPTIONS,
  TicketDetailView,
  TicketStatusBadge,
} from "src/components/ComplaintThread"
import { ORG_TYPES, ROLES } from "src/constants/roles"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import AuthorityComplaintService from "src/services/AuthorityComplaintService"
import {
  complaintTypes,
  formatMealDate,
  mealLabels,
} from "src/pages/SCHOOL/MealComplaints/labels"
import { EvidenceAttachmentList } from "src/components/EvidenceFiles"
import styles from "./AuthorityComplaints.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]
const PAGE_LIMIT = 20

function resolveBasePath(explicitBasePath, user) {
  if (explicitBasePath) return explicitBasePath.replace(/\/+$/, "")
  if (
    user?.orgType === ORG_TYPES.AUTHORITY ||
    user?.role === ROLES.COMMUNE_FOOD_SAFETY_OFFICER
  ) {
    return ROUTER.AUTHORITY_COMPLAINTS
  }
  return ROUTER.SCHOOL_AUTHORITY_COMPLAINTS
}

function OriginalMealComplaintCard({ origin }) {
  if (!origin) return null
  const mealText = origin.meal
    ? [
        origin.meal.className,
        mealLabels[origin.meal.mealType] || origin.meal.mealType,
        formatMealDate(origin.meal.mealDate),
      ]
        .filter(Boolean)
        .join(" · ")
    : "—"

  const originComments = Array.isArray(origin.comments) ? origin.comments : []

  return (
    <div
      className={styles.originBox}
      aria-label="Hồ sơ khiếu nại bữa ăn gốc (C03)"
    >
      <div className={styles.originHeader}>
        <h3 className={styles.originHeading}>
          Hồ sơ khiếu nại bữa ăn gốc (C03) — {formatTicketCode(origin.code)}
        </h3>
        <span className={styles.readOnlyTag}>Chỉ đọc</span>
      </div>

      <div className={styles.originMetaGrid}>
        <div className={styles.originMetaCell}>
          <span>Tiêu đề gốc</span>
          <strong>{origin.title || "—"}</strong>
        </div>
        <div className={styles.originMetaCell}>
          <span>Loại khiếu nại</span>
          <strong>
            {complaintTypes[origin.complaintType] ||
              origin.complaintType ||
              "—"}
          </strong>
        </div>
        <div className={styles.originMetaCell}>
          <span>Suất ăn &amp; Thời gian gửi</span>
          <strong>
            {mealText} ({formatDateTimeVi(origin.submittedAt, "—")})
          </strong>
        </div>
      </div>

      <div>
        <p className={styles.originDescLabel}>Nội dung khiếu nại bữa ăn gốc</p>
        <p className={styles.originDescText}>
          {origin.description || "Không có nội dung mô tả."}
        </p>
        <EvidenceAttachmentList
          attachments={origin.attachments}
          title="Tệp đính kèm"
          className={styles.originAttachments}
        />
      </div>

      {originComments.length > 0 ? (
        <div className={styles.originCommentsWrap}>
          <p className={styles.originDescLabel}>
            Lịch sử trao đổi tại nhà trường ({originComments.length})
          </p>
          {originComments.map(comment => {
            const typeMeta = COMMENT_TYPE_META[comment.commentType]
            return (
              <div key={comment.id} className={styles.originCommentItem}>
                <UserAvatar
                  user={comment.author}
                  className={styles.originCommentAvatar}
                />
                <div className={styles.originCommentBody}>
                  <div className={styles.originCommentHead}>
                    <strong>{comment.author?.fullName || "Người dùng"}</strong>
                    {typeMeta ? (
                      <span className={styles.originCommentTag}>
                        {typeMeta.label}
                      </span>
                    ) : null}
                    <time>{formatDateTimeVi(comment.createdAt, "")}</time>
                  </div>
                  <p className={styles.originCommentText}>{comment.content}</p>
                  <EvidenceAttachmentList
                    attachments={comment.attachments}
                    className={styles.originAttachments}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default function AuthorityComplaints({ basePath: basePathProp }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isDetailView = Boolean(id)

  const { userStore } = useContext(StoreContext) || {}
  const user = userStore?.user
  const isAuthority =
    user?.orgType === ORG_TYPES.AUTHORITY ||
    user?.role === ROLES.COMMUNE_FOOD_SAFETY_OFFICER
  const basePath = resolveBasePath(basePathProp, user)

  // List state
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [result, setResult] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState("")
  const [listReloadTick, setListReloadTick] = useState(0)

  // Detail state
  const [detailTicket, setDetailTicket] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  useEffect(() => {
    if (isDetailView) return undefined
    const controller = new AbortController()
    setLoadingList(true)
    setListError("")

    AuthorityComplaintService.list(
      {
        page,
        limit: PAGE_LIMIT,
        status: statusFilter || undefined,
      },
      controller.signal,
    )
      .then(data => {
        if (!controller.signal.aborted) setResult(data)
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setListError(
          parseApiError(
            err,
            "Không thể tải danh sách khiếu nại chuyển cơ quan ATTP.",
          ).message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingList(false)
      })

    return () => controller.abort()
  }, [isDetailView, page, statusFilter, listReloadTick])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailTicket(null)
      setDetailError(null)
      return undefined
    }
    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    AuthorityComplaintService.detail(id, controller.signal)
      .then(ticket => {
        if (!controller.signal.aborted) setDetailTicket(ticket)
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setDetailTicket(null)
        setDetailError(
          parseApiError(
            err,
            "Không thể tải chi tiết khiếu nại chuyển cơ quan ATTP.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false)
      })

    return () => controller.abort()
  }, [isDetailView, id, detailReloadTick])

  const filteredItems = useMemo(() => {
    const raw = result?.items || []
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return raw
    return raw.filter(item => {
      const haystack = [
        item.code,
        item.title,
        item.school?.name,
        item.recipientUnit?.name,
        item.escalatedFrom?.code,
        item.sender?.fullName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [result?.items, searchQuery])

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter)

  if (isDetailView) {
    const metaItems = detailTicket
      ? [
          {
            label: "Trường học",
            value: detailTicket.school?.name || "—",
          },
          {
            label: "Đơn vị ATTP tiếp nhận",
            value: detailTicket.recipientUnit?.name || "—",
          },
          {
            label: "Khiếu nại gốc (C03)",
            value: formatTicketCode(detailTicket.escalatedFrom?.code),
            chip: true,
          },
        ]
      : []

    return (
      <TicketDetailView
        ticket={detailTicket}
        loading={loadingDetail}
        error={detailError}
        backLabel="Quay lại danh sách khiếu nại ATTP"
        onBack={() => navigate(basePath)}
        onReload={() => setDetailReloadTick(prev => prev + 1)}
        metaItems={metaItems}
        detailExtra={
          <OriginalMealComplaintCard origin={detailTicket?.escalatedFrom} />
        }
        onAccept={async () => {
          const updated = await AuthorityComplaintService.accept(id)
          setDetailTicket(updated)
        }}
        onComment={async (content, files) => {
          const updated = await AuthorityComplaintService.comment(
            id,
            content,
            files,
          )
          setDetailTicket(updated)
        }}
        onResolve={async (content, files) => {
          const updated = await AuthorityComplaintService.resolve(
            id,
            content,
            files,
          )
          setDetailTicket(updated)
        }}
        onSatisfy={async () => {
          const updated = await AuthorityComplaintService.satisfy(id)
          setDetailTicket(updated)
        }}
        onReopen={async reason => {
          const updated = await AuthorityComplaintService.reopen(id, reason)
          setDetailTicket(updated)
        }}
      />
    )
  }

  const pagination = result?.pagination || {
    page,
    limit: PAGE_LIMIT,
    hasNext: false,
  }
  const statusOptions = isAuthority
    ? HANDLER_STATUS_OPTIONS
    : REQUESTER_STATUS_OPTIONS

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Khiếu nại chuyển Cơ quan ATTP</h1>
      </header>

      <section
        className={styles.surface}
        aria-label="Danh sách khiếu nại chuyển Cơ quan ATTP"
      >
        <div className={styles.filterBar} role="search">
          <TextField
            size="small"
            className={styles.searchField}
            placeholder="Tìm trong trang này: mã FP-AC, mã C03, tiêu đề, trường…"
            value={searchQuery}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            onChange={event => setSearchQuery(event.target.value)}
          />

          <div className={styles.filterRight}>
            <TextField
              select
              size="small"
              label="Trạng thái"
              className={styles.selectField}
              value={statusFilter}
              onChange={event => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            {hasActiveFilters ? (
              <Button
                variant="text"
                size="small"
                sx={{ textTransform: "none", fontWeight: 600 }}
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("")
                  setPage(1)
                }}
              >
                Xóa lọc
              </Button>
            ) : null}
          </div>
        </div>

        {loadingList && !result ? (
          <div
            className={styles.skeletonStack}
            role="status"
            aria-label="Đang tải danh sách khiếu nại chuyển ATTP"
          >
            {SKELETON_ROWS.map(key => (
              <div key={key} className={styles.skeletonRow}>
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
              </div>
            ))}
          </div>
        ) : listError ? (
          <div className={styles.listError}>
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  onClick={() => setListReloadTick(prev => prev + 1)}
                >
                  Thử lại
                </Button>
              }
            >
              {listError}
            </Alert>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              {hasActiveFilters
                ? "Không có khiếu nại phù hợp"
                : "Chưa có khiếu nại chuyển Cơ quan ATTP"}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table
                className={styles.table}
                aria-label="Danh sách khiếu nại chuyển Cơ quan ATTP"
              >
                <thead>
                  <tr>
                    <th scope="col">Mã phiếu</th>
                    <th scope="col">Tiêu đề &amp; Trường</th>
                    <th scope="col">Đơn vị ATTP nhận</th>
                    <th scope="col">Mã C03 gốc</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thời gian gửi</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const detailUrl = `${basePath}/${item.id}`
                    return (
                      <tr
                        key={item.id}
                        className={styles.tableRow}
                        onClick={event => {
                          if (event.target.closest("a, button")) return
                          navigate(detailUrl)
                        }}
                      >
                        <td>
                          <span className={styles.codeChip}>
                            {formatTicketCode(item.code)}
                          </span>
                        </td>
                        <td>
                          <Link to={detailUrl} className={styles.primaryLink}>
                            {item.title}
                          </Link>
                          <span className={styles.subLine}>
                            {item.school?.name || "—"}
                          </span>
                        </td>
                        <td>{item.recipientUnit?.name || "—"}</td>
                        <td>
                          <span className={styles.originChip}>
                            {formatTicketCode(item.escalatedFrom?.code)}
                          </span>
                        </td>
                        <td>
                          <TicketStatusBadge
                            status={item.displayStatus}
                            hasNewMessage={item.hasNewMessage}
                            showNewMessageText={isAuthority}
                            size="sm"
                          />
                        </td>
                        <td className={styles.timeCell}>
                          {formatDateTimeVi(item.submittedAt, "—")}
                        </td>
                        <td className={styles.actionCell}>
                          <Tooltip title="Xem chi tiết">
                            <Link
                              to={detailUrl}
                              className={styles.detailLink}
                              aria-label="Xem chi tiết"
                            >
                              <ChevronRightIcon fontSize="small" />
                            </Link>
                          </Tooltip>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileList}>
              {filteredItems.map(item => {
                const detailUrl = `${basePath}/${item.id}`
                return (
                  <Link
                    key={item.id}
                    to={detailUrl}
                    className={styles.mobileCard}
                  >
                    <div className={styles.mobileTop}>
                      <span className={styles.codeChip}>
                        {formatTicketCode(item.code)}
                      </span>
                      <TicketStatusBadge
                        status={item.displayStatus}
                        hasNewMessage={item.hasNewMessage}
                        showNewMessageText={isAuthority}
                        size="sm"
                      />
                    </div>
                    <div className={styles.mobileTitle}>{item.title}</div>
                    <div className={styles.mobileMeta}>
                      Trường: {item.school?.name || "—"}
                    </div>
                    <div className={styles.mobileMeta}>
                      Đơn vị nhận: {item.recipientUnit?.name || "—"} · Gốc:{" "}
                      {formatTicketCode(item.escalatedFrom?.code)}
                    </div>
                    <div className={styles.mobileMeta}>
                      Gửi lúc {formatDateTimeVi(item.submittedAt, "—")}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className={styles.paginationFooter}>
              <span className={styles.paginationInfo}>
                Trang {pagination.page} · Hiển thị {filteredItems.length} hồ sơ
              </span>
              <div className={styles.paginationActions}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  disabled={pagination.page <= 1 || loadingList}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  disabled={!pagination.hasNext || loadingList}
                  onClick={() => setPage(prev => prev + 1)}
                >
                  Tiếp theo
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
