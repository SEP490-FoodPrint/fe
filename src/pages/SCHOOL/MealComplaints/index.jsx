import React, { useContext, useEffect, useState } from "react"
import { generatePath, Link, useNavigate, useParams } from "react-router-dom"
import {
  Alert,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import SearchIcon from "@mui/icons-material/Search"
import DateField from "src/components/DateField"
import {
  EscalationAuthoritySection,
  formatTicketCode,
  normalizeTicketFields,
  parseApiError,
  REQUESTER_STATUS_OPTIONS,
  TicketDetailView,
  TicketStatusBadge,
} from "src/components/ComplaintThread"
import notice from "src/components/Notice"
import { ROLES } from "src/constants/roles"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import AuthorityComplaintService from "src/services/AuthorityComplaintService"
import ComplaintService from "src/services/ComplaintService"
import ComplaintDrawer from "./component/ComplaintDrawer"
import {
  complaintTypes,
  formatMealDate,
  formatTimestamp,
  mealLabels,
} from "./labels"
import styles from "./MealComplaints.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]
const PAGE_LIMIT = 15

export default function MealComplaints() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isDetailView = Boolean(id)

  const { userStore } = useContext(StoreContext) || {}
  const isTeacher = userStore?.user?.role === ROLES.HOMEROOM_TEACHER

  // List state
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    complaintType: "",
    from: "",
    to: "",
  })
  const [appliedSearch, setAppliedSearch] = useState("")
  const [result, setResult] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState("")
  const [listReloadTick, setListReloadTick] = useState(0)
  const [showForm, setShowForm] = useState(false)

  // Detail state
  const [detailTicket, setDetailTicket] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  // Load list
  useEffect(() => {
    if (isDetailView) return undefined
    const controller = new AbortController()
    setLoadingList(true)
    setListError("")

    const params = {
      page,
      limit: PAGE_LIMIT,
      status: filters.status || undefined,
      complaintType: filters.complaintType || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      search: appliedSearch.trim() || undefined,
    }

    ComplaintService.list(params, controller.signal)
      .then(({ data }) => {
        if (controller.signal.aborted) return
        const items = Array.isArray(data?.items)
          ? data.items.map(normalizeTicketFields)
          : []
        setResult({
          items,
          pagination: {
            page: Number(data?.pagination?.page) || page,
            limit: Number(data?.pagination?.limit) || PAGE_LIMIT,
            hasNext: Boolean(data?.pagination?.hasNext),
          },
        })
      })
      .catch(failure => {
        if (failure?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setListError(
          parseApiError(failure, "Không tải được danh sách khiếu nại.").message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingList(false)
      })

    return () => controller.abort()
  }, [
    isDetailView,
    page,
    filters.status,
    filters.complaintType,
    filters.from,
    filters.to,
    appliedSearch,
    listReloadTick,
  ])

  // Load detail
  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailTicket(null)
      setDetailError(null)
      return undefined
    }
    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    ComplaintService.detail(id, controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setDetailTicket(normalizeTicketFields(data))
        }
      })
      .catch(failure => {
        if (failure?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setDetailTicket(null)
        setDetailError(
          parseApiError(failure, "Không thể tải chi tiết khiếu nại bữa ăn."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false)
      })

    return () => controller.abort()
  }, [isDetailView, id, detailReloadTick])

  const handleCreated = () => {
    setShowForm(false)
    setPage(1)
    setFilters({ search: "", status: "", complaintType: "", from: "", to: "" })
    setAppliedSearch("")
    setListReloadTick(prev => prev + 1)
    notice({ msg: "Đã gửi khiếu nại bữa ăn", isSuccess: true })
  }

  const handleResetFilters = () => {
    setFilters({ search: "", status: "", complaintType: "", from: "", to: "" })
    setAppliedSearch("")
    setPage(1)
  }

  const hasActiveFilters = Boolean(
    appliedSearch.trim() ||
    filters.status ||
    filters.complaintType ||
    filters.from ||
    filters.to,
  )

  if (isDetailView) {
    const mealText = detailTicket?.meal
      ? `${mealLabels[detailTicket.meal.mealType] || detailTicket.meal.mealType || ""} · ${formatMealDate(detailTicket.meal.mealDate)}`
      : "—"

    const metaItems = detailTicket
      ? [
          {
            label: "Lớp",
            value: detailTicket.meal?.className || "—",
          },
          {
            label: "Bữa ăn",
            value: mealText,
          },
          {
            label: "Loại khiếu nại",
            value:
              complaintTypes[detailTicket.complaintType] ||
              detailTicket.complaintType ||
              "—",
            chip: true,
          },
        ]
      : []

    const escalated = detailTicket?.escalatedAuthorityComplaint
    const isEscalated = Boolean(
      detailTicket?.closeReason === "ESCALATED" || escalated,
    )

    return (
      <TicketDetailView
        ticket={detailTicket}
        loading={loadingDetail}
        error={detailError}
        backLabel="Quay lại danh sách khiếu nại bữa ăn"
        onBack={() => navigate(ROUTER.SCHOOL_MEAL_COMPLAINTS)}
        onReload={() => setDetailReloadTick(prev => prev + 1)}
        metaItems={metaItems}
        escalated={isEscalated}
        threadTitle={
          isEscalated ? "Trao đổi với Ban Giám hiệu" : "Đoạn trò chuyện"
        }
        afterThread={
          escalated?.id ? (
            <EscalationAuthoritySection
              authorityComplaintId={escalated.id}
              fallbackCode={escalated.code}
            />
          ) : null
        }
        onComment={async (content, files) => {
          const { data } = await ComplaintService.comment(id, content, files)
          setDetailTicket(normalizeTicketFields(data))
        }}
        onSatisfy={async () => {
          const { data } = await ComplaintService.satisfy(id)
          setDetailTicket(normalizeTicketFields(data))
        }}
        onReopen={async reason => {
          const { data } = await ComplaintService.reopen(id, reason)
          setDetailTicket(normalizeTicketFields(data))
        }}
        onEscalate={async (reason, files) => {
          const created = await AuthorityComplaintService.escalate({
            mealComplaintId: id,
            reason,
            files,
          })
          notice({
            msg: "Đã chuyển khiếu nại đến Cơ quan ATTP",
            isSuccess: true,
          })
          setDetailReloadTick(prev => prev + 1)
        }}
      />
    )
  }

  const items = result?.items || []
  const pagination = result?.pagination || {
    page,
    limit: PAGE_LIMIT,
    hasNext: false,
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Khiếu nại bữa ăn</h1>
        <Button
          variant="contained"
          className={styles.createBtn}
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
        >
          Gửi khiếu nại
        </Button>
      </header>

      <section
        className={styles.surface}
        aria-label="Danh sách khiếu nại bữa ăn của tôi"
      >
        <div className={styles.filterBar} role="search">
          <TextField
            size="small"
            className={styles.searchField}
            placeholder="Tìm mã FP-MC, tiêu đề, nội dung..."
            value={filters.search}
            slotProps={{
              htmlInput: { maxLength: 120 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            onChange={event =>
              setFilters(prev => ({ ...prev, search: event.target.value }))
            }
            onKeyDown={event => {
              if (event.key === "Enter") {
                setPage(1)
                setAppliedSearch(filters.search)
              }
            }}
          />

          <TextField
            select
            size="small"
            label="Trạng thái"
            className={styles.selectField}
            value={filters.status}
            onChange={event => {
              setFilters(prev => ({ ...prev, status: event.target.value }))
              setPage(1)
            }}
          >
            {REQUESTER_STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Loại khiếu nại"
            className={styles.selectField}
            value={filters.complaintType}
            onChange={event => {
              setFilters(prev => ({
                ...prev,
                complaintType: event.target.value,
              }))
              setPage(1)
            }}
          >
            <MenuItem value="">Tất cả loại</MenuItem>
            {Object.entries(complaintTypes).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <DateField
            label="Từ ngày"
            className={styles.dateField}
            value={filters.from}
            maxDate={filters.to || undefined}
            onChange={value => {
              setFilters(prev => ({ ...prev, from: value }))
              setPage(1)
            }}
          />

          <DateField
            label="Đến ngày"
            className={styles.dateField}
            value={filters.to}
            minDate={filters.from || undefined}
            onChange={value => {
              setFilters(prev => ({ ...prev, to: value }))
              setPage(1)
            }}
          />

          <Button
            variant="outlined"
            size="medium"
            sx={{ textTransform: "none", fontWeight: 600, height: 40 }}
            onClick={() => {
              setPage(1)
              setAppliedSearch(filters.search)
            }}
          >
            Tìm
          </Button>
          {hasActiveFilters ? (
            <Button
              variant="text"
              size="medium"
              sx={{ textTransform: "none", fontWeight: 600, height: 40 }}
              onClick={handleResetFilters}
            >
              Xóa lọc
            </Button>
          ) : null}
        </div>

        {loadingList && !result ? (
          <div
            className={styles.skeletonStack}
            role="status"
            aria-label="Đang tải danh sách khiếu nại"
          >
            {SKELETON_ROWS.map(key => (
              <div key={key} className={styles.skeletonRow}>
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
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              {hasActiveFilters
                ? "Không có khiếu nại phù hợp"
                : "Bạn chưa gửi khiếu nại nào"}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table
                className={styles.table}
                aria-label="Danh sách khiếu nại bữa ăn"
              >
                <thead>
                  <tr>
                    <th scope="col">Mã phiếu</th>
                    <th scope="col">Tiêu đề &amp; Nội dung</th>
                    <th scope="col">Bữa ăn</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thời gian gửi</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const detailUrl = generatePath(
                      ROUTER.SCHOOL_MEAL_COMPLAINT_DETAIL,
                      { id: item.id },
                    )
                    const esc = item.escalatedAuthorityComplaint
                    const isRowEscalated = Boolean(
                      item.closeReason === "ESCALATED" || esc,
                    )
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
                            {item.title || complaintTypes[item.complaintType]}
                          </Link>
                          <span className={styles.preview}>
                            {item.description}
                          </span>
                        </td>
                        <td>
                          <div>
                            {!isTeacher && item.meal?.className
                              ? `${item.meal.className} · `
                              : ""}
                            {mealLabels[item.meal?.mealType] || "—"}
                          </div>
                          <span className={styles.subLine}>
                            {formatMealDate(item.meal?.mealDate)} ·{" "}
                            {complaintTypes[item.complaintType] ||
                              item.complaintType}
                          </span>
                        </td>
                        <td>
                          <div className={styles.statusCell}>
                            <TicketStatusBadge
                              status={item.displayStatus}
                              hasNewMessage={item.hasNewMessage}
                              escalated={isRowEscalated}
                              size="sm"
                            />
                            {esc?.code ? (
                              <span className={styles.subLine}>
                                Hồ sơ ATTP: {formatTicketCode(esc.code)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className={styles.timeCell}>
                          {formatTimestamp(item.submittedAt)}
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
              {items.map(item => {
                const detailUrl = generatePath(
                  ROUTER.SCHOOL_MEAL_COMPLAINT_DETAIL,
                  { id: item.id },
                )
                const isRowEscalated = Boolean(
                  item.closeReason === "ESCALATED" ||
                  item.escalatedAuthorityComplaint,
                )
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
                        escalated={isRowEscalated}
                        size="sm"
                      />
                    </div>
                    <div className={styles.mobileTitle}>
                      {item.title || complaintTypes[item.complaintType]}
                    </div>
                    <div className={styles.mobileMeta}>
                      {!isTeacher && item.meal?.className
                        ? `${item.meal.className} · `
                        : ""}
                      {mealLabels[item.meal?.mealType]} ·{" "}
                      {formatMealDate(item.meal?.mealDate)}
                    </div>
                    <div className={styles.mobileMeta}>
                      Gửi lúc {formatTimestamp(item.submittedAt)}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className={styles.paginationFooter}>
              <span className={styles.paginationInfo}>
                Trang {pagination.page} · Hiển thị {items.length} khiếu nại
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

      {showForm ? (
        <ComplaintDrawer
          isTeacher={isTeacher}
          onCreated={handleCreated}
          onClose={() => setShowForm(false)}
        />
      ) : null}
    </main>
  )
}
