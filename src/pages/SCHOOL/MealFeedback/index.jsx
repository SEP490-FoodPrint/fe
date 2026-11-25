import React, { useEffect, useState } from "react"
import { generatePath, Link, useNavigate, useParams } from "react-router-dom"
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
import DateField from "src/components/DateField"
import {
  formatDateTimeVi,
  formatTicketCode,
  HANDLER_STATUS_OPTIONS,
  normalizeTicketFields,
  parseApiError,
  TicketDetailView,
  TicketStatusBadge,
} from "src/components/ComplaintThread"
import ROUTER from "src/router/ROUTER"
import ComplaintService from "src/services/ComplaintService"
import {
  complaintTypes,
  formatMealDate,
  mealLabels,
} from "src/pages/SCHOOL/MealComplaints/labels"
import styles from "./MealFeedback.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]
const PAGE_LIMIT = 15

function MealFeedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isDetailView = Boolean(id)

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
          parseApiError(failure, "Không thể tải danh sách khiếu nại bữa ăn.")
            .message,
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
          parseApiError(failure, "Không thể tải chi tiết khiếu nại."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false)
      })

    return () => controller.abort()
  }, [isDetailView, id, detailReloadTick])

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
    const mealSummary = detailTicket?.meal
      ? `${detailTicket.meal.className || ""} · ${mealLabels[detailTicket.meal.mealType] || ""} · ${formatMealDate(detailTicket.meal.mealDate)}`
      : "—"

    const metaItems = detailTicket
      ? [
          {
            label: "Người gửi",
            value: detailTicket.submitter?.fullName || "—",
          },
          {
            label: "Suất ăn",
            value: mealSummary,
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

    return (
      <TicketDetailView
        ticket={detailTicket}
        loading={loadingDetail}
        error={detailError}
        backLabel="Quay lại danh sách khiếu nại bữa ăn"
        onBack={() => navigate(ROUTER.SCHOOL_MEAL_FEEDBACK)}
        onReload={() => setDetailReloadTick(prev => prev + 1)}
        metaItems={metaItems}
        onAccept={async () => {
          const { data } = await ComplaintService.accept(id)
          setDetailTicket(normalizeTicketFields(data))
        }}
        onComment={async content => {
          const { data } = await ComplaintService.comment(id, content)
          setDetailTicket(normalizeTicketFields(data))
        }}
        onResolve={async content => {
          const { data } = await ComplaintService.resolve(id, content)
          setDetailTicket(normalizeTicketFields(data))
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
        <h1>Quản lý khiếu nại bữa ăn</h1>
      </header>

      <section
        className={styles.surface}
        aria-label="Danh sách khiếu nại bữa ăn cần xử lý"
      >
        <div className={styles.filterBar} role="search">
          <TextField
            size="small"
            className={styles.searchField}
            placeholder="Tìm mã FP-MC, người gửi, lớp hoặc nội dung..."
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
            {HANDLER_STATUS_OPTIONS.map(opt => (
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
                : "Chưa có khiếu nại bữa ăn nào"}
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
                    <th scope="col">Tiêu đề &amp; Suất ăn</th>
                    <th scope="col">Người gửi</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thời gian gửi</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {items.map(row => {
                    const detailUrl = generatePath(
                      ROUTER.SCHOOL_MEAL_FEEDBACK_DETAIL,
                      { id: row.id },
                    )
                    return (
                      <tr
                        key={row.id}
                        className={styles.tableRow}
                        onClick={event => {
                          if (event.target.closest("a, button")) return
                          navigate(detailUrl)
                        }}
                      >
                        <td>
                          <span className={styles.codeChip}>
                            {formatTicketCode(row.code)}
                          </span>
                        </td>
                        <td>
                          <Link to={detailUrl} className={styles.primaryLink}>
                            {row.title || complaintTypes[row.complaintType]}
                          </Link>
                          <span className={styles.subLine}>
                            {row.meal?.className || "—"} ·{" "}
                            {formatMealDate(row.meal?.mealDate)} ·{" "}
                            {mealLabels[row.meal?.mealType] || "—"} ·{" "}
                            {complaintTypes[row.complaintType] ||
                              row.complaintType}
                          </span>
                        </td>
                        <td>{row.submitter?.fullName || "—"}</td>
                        <td>
                          <div className={styles.statusCell}>
                            <TicketStatusBadge
                              status={row.displayStatus}
                              hasNewMessage={row.hasNewMessage}
                              showNewMessageText
                              size="sm"
                            />
                          </div>
                        </td>
                        <td className={styles.timeCell}>
                          {formatDateTimeVi(row.submittedAt, "—")}
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
              {items.map(row => {
                const detailUrl = generatePath(
                  ROUTER.SCHOOL_MEAL_FEEDBACK_DETAIL,
                  { id: row.id },
                )
                return (
                  <Link
                    key={row.id}
                    to={detailUrl}
                    className={styles.mobileCard}
                  >
                    <div className={styles.mobileTop}>
                      <span className={styles.codeChip}>
                        {formatTicketCode(row.code)}
                      </span>
                      <TicketStatusBadge
                        status={row.displayStatus}
                        hasNewMessage={row.hasNewMessage}
                        showNewMessageText
                        size="sm"
                      />
                    </div>
                    <div className={styles.mobileTitle}>
                      {row.title || complaintTypes[row.complaintType]}
                    </div>
                    <div className={styles.mobileMeta}>
                      {row.meal?.className} ·{" "}
                      {formatMealDate(row.meal?.mealDate)} ·{" "}
                      {mealLabels[row.meal?.mealType]}
                    </div>
                    <div className={styles.mobileMeta}>
                      Người gửi: {row.submitter?.fullName || "—"} ·{" "}
                      {formatDateTimeVi(row.submittedAt, "—")}
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
    </main>
  )
}

export default MealFeedback
