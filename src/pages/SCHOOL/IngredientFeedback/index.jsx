import React, { useEffect, useMemo, useState } from "react"
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
import {
  formatDateTimeVi,
  formatTicketCode,
  parseApiError,
  REQUESTER_STATUS_OPTIONS,
  TicketDetailView,
  TicketStatusBadge,
} from "src/components/ComplaintThread"
import notice from "src/components/Notice"
import ROUTER from "src/router/ROUTER"
import SupplierComplaintService from "src/services/SupplierComplaintService"
import CreateIngredientFeedbackDialog from "./component/CreateIngredientFeedbackDialog"
import styles from "./IngredientFeedback.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]
const PAGE_LIMIT = 20

export default function IngredientFeedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isDetailView = Boolean(id)

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    hasNext: false,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState("")
  const [listReloadTick, setListReloadTick] = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  const [detailTicket, setDetailTicket] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  useEffect(() => {
    if (isDetailView) return undefined
    const controller = new AbortController()
    setLoadingList(true)
    setListError("")

    SupplierComplaintService.list({
      page: pagination.page,
      limit: pagination.limit,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setItems(result.items)
        setPagination(result.pagination)
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setListError(
          parseApiError(
            err,
            "Không thể tải danh sách phản ánh chất lượng nguyên liệu.",
          ).message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingList(false)
      })

    return () => controller.abort()
  }, [isDetailView, pagination.page, pagination.limit, listReloadTick])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailTicket(null)
      setDetailError(null)
      return undefined
    }
    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierComplaintService.detail(id, { signal: controller.signal })
      .then(ticket => {
        if (!controller.signal.aborted) setDetailTicket(ticket)
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setDetailTicket(null)
        setDetailError(
          parseApiError(err, "Không thể tải chi tiết phản ánh nguyên liệu."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false)
      })

    return () => controller.abort()
  }, [isDetailView, id, detailReloadTick])

  const filteredItems = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return items.filter(item => {
      const statusVal = item.displayStatus || item.status
      if (statusFilter && statusVal !== statusFilter) return false
      if (!keyword) return true
      const haystack = [item.code, item.title, item.delivery?.deliveryNo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [items, searchQuery, statusFilter])

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter)

  const handleCreated = created => {
    setShowCreate(false)
    setSearchQuery("")
    setStatusFilter("")
    setPagination(prev => ({ ...prev, page: 1 }))
    setListReloadTick(prev => prev + 1)
    notice({
      msg: "Đã gửi phản ánh nguyên liệu",
      isSuccess: true,
    })
  }

  if (isDetailView) {
    const metaItems = detailTicket
      ? [
          {
            label: "Chuyến giao",
            value: detailTicket.delivery?.deliveryNo || "—",
          },
          {
            label: "Người gửi",
            value: detailTicket.submittedBy?.fullName || "—",
          },
          {
            label: "Lô nguyên liệu",
            value: detailTicket.ingredientLot?.lotCode || "Toàn bộ chuyến giao",
            chip: true,
          },
        ]
      : []

    return (
      <TicketDetailView
        ticket={detailTicket}
        loading={loadingDetail}
        error={detailError}
        backLabel="Quay lại danh sách phản ánh nguyên liệu"
        onBack={() => navigate(ROUTER.SCHOOL_INGREDIENT_FEEDBACK)}
        onReload={() => setDetailReloadTick(prev => prev + 1)}
        metaItems={metaItems}
        onComment={async content => {
          const updated = await SupplierComplaintService.comment(id, content)
          setDetailTicket(updated)
        }}
        onSatisfy={async () => {
          const updated = await SupplierComplaintService.satisfy(id)
          setDetailTicket(updated)
        }}
        onReopen={async reason => {
          const updated = await SupplierComplaintService.reopen(id, reason)
          setDetailTicket(updated)
        }}
      />
    )
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Phản ánh chất lượng nguyên liệu</h1>
        <Button
          variant="contained"
          className={styles.createBtn}
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(true)}
        >
          Gửi phản ánh nguyên liệu
        </Button>
      </header>

      <section
        className={styles.surface}
        aria-label="Danh sách phản ánh chất lượng nguyên liệu"
      >
        <div className={styles.filterBar} role="search">
          <TextField
            size="small"
            className={styles.searchField}
            placeholder="Tìm trong trang này: mã FP-CP, tiêu đề, chuyến giao…"
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
              onChange={event => setStatusFilter(event.target.value)}
            >
              {REQUESTER_STATUS_OPTIONS.map(opt => (
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
                }}
              >
                Xóa lọc
              </Button>
            ) : null}
          </div>
        </div>

        {loadingList && items.length === 0 ? (
          <div
            className={styles.skeletonStack}
            role="status"
            aria-label="Đang tải danh sách phản ánh nguyên liệu"
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
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              {hasActiveFilters
                ? "Không tìm thấy phản ánh phù hợp"
                : "Chưa có phản ánh chất lượng nguyên liệu nào"}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table
                className={styles.table}
                aria-label="Danh sách phản ánh chất lượng nguyên liệu"
              >
                <thead>
                  <tr>
                    <th scope="col">Mã phiếu</th>
                    <th scope="col">Tiêu đề</th>
                    <th scope="col">Chuyến giao</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Thời gian gửi</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const detailUrl = generatePath(
                      ROUTER.SCHOOL_INGREDIENT_FEEDBACK_DETAIL,
                      { id: item.id },
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
                            {item.title}
                          </Link>
                        </td>
                        <td>
                          <span className={styles.deliveryNoText}>
                            {item.delivery?.deliveryNo || "—"}
                          </span>
                        </td>
                        <td>
                          <TicketStatusBadge
                            status={item.displayStatus}
                            hasNewMessage={item.hasNewMessage}
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
                const detailUrl = generatePath(
                  ROUTER.SCHOOL_INGREDIENT_FEEDBACK_DETAIL,
                  { id: item.id },
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
                        size="sm"
                      />
                    </div>
                    <div className={styles.mobileTitle}>{item.title}</div>
                    <div className={styles.mobileMeta}>
                      Chuyến giao: {item.delivery?.deliveryNo || "—"}
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
                Trang {pagination.page} · Hiển thị {filteredItems.length} phản
                ánh
              </span>
              <div className={styles.paginationActions}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  disabled={pagination.page <= 1 || loadingList}
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                >
                  Trước
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  disabled={!pagination.hasNext || loadingList}
                  onClick={() =>
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Tiếp theo
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {showCreate ? (
        <CreateIngredientFeedbackDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      ) : null}
    </main>
  )
}
