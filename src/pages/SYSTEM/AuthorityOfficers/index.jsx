import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  Button,
  InputAdornment,
  MenuItem,
  Skeleton,
  TextField,
} from "@mui/material"
import {
  Add,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ReplayOutlined,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material"
import LocationSelector from "src/components/LocationSelector"
import notice from "src/components/Notice"
import AuthorityOfficerService, {
  extractAuthorityOfficerError,
  formatDateTimeVi,
  getOfficerStatusMeta,
  OFFICER_STATUS_OPTIONS,
} from "src/services/AuthorityOfficerService"
import ROUTER from "src/router/ROUTER"
import CreateOfficerDialog from "./component/CreateOfficerDialog"
import OfficerDetailView from "./component/OfficerDetailView"
import styles from "./AuthorityOfficers.module.scss"

const PAGE_LIMIT = 20
const SKELETON_ROWS = [0, 1, 2, 3, 4]

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  muted: styles.toneMuted,
}

export default function AuthorityOfficersPage() {
  const { userId } = useParams()

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    hasNext: false,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")
  const [locationId, setLocationId] = useState("")
  const [locationFilterKey, setLocationFilterKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (userId) return undefined

    const controller = new AbortController()
    const delay = search.trim() ? 300 : 0

    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)

      AuthorityOfficerService.list(
        {
          page: pagination.page,
          limit: PAGE_LIMIT,
          search: search.trim(),
          status,
          locationId,
        },
        controller.signal,
      )
        .then(result => {
          if (controller.signal.aborted) return
          setItems(result.items)
          setPagination(result.pagination)
        })
        .catch(err => {
          if (controller.signal.aborted || err?.name === "CanceledError") return
          setError(
            extractAuthorityOfficerError(
              err,
              "Không thể tải danh sách tài khoản cán bộ ATTP.",
            ),
          )
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        })
    }, delay)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [userId, pagination.page, search, status, locationId, reloadTick])

  if (userId) {
    return <OfficerDetailView userId={userId} />
  }

  const hasFilters = Boolean(
    search.trim() || status !== "ALL" || locationId,
  )

  const handleResetFilters = () => {
    // Đổi key để LocationSelector dựng lại, xóa cả tỉnh đã chọn khi chưa chọn phường/xã
    setLocationFilterKey(k => k + 1)
    setSearch("")
    setStatus("ALL")
    setLocationId("")
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleCreated = created => {
    setCreateOpen(false)
    notice({
      msg: "Đã tạo tài khoản cán bộ ATTP",
      desc: `${created.fullName} (@${created.username}) đã được cấp quyền phụ trách ${created.location?.name || "địa bàn đã chọn"}.`,
      isSuccess: true,
    })
    setPagination(prev => ({ ...prev, page: 1 }))
    setReloadTick(t => t + 1)
  }

  const detailUrl = id =>
    `${ROUTER.SYSTEM_AUTHORITY_OFFICERS}/${encodeURIComponent(id)}`

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Quản lý tài khoản cán bộ ATTP</h1>
          <p className={styles.pageSubtitle}>
            Cấp và theo dõi tài khoản cán bộ An toàn thực phẩm theo từng phường/xã.
          </p>
        </div>

        <Button
          type="button"
          variant="contained"
          startIcon={<Add />}
          className={styles.primaryBtn}
          onClick={() => setCreateOpen(true)}
        >
          Tạo tài khoản cán bộ ATTP
        </Button>
      </header>

      <section
        className={styles.surface}
        aria-label="Danh sách tài khoản cán bộ ATTP"
      >
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterField}>
              <label htmlFor="officer-search">Tìm kiếm</label>
              <TextField
                id="officer-search"
                size="small"
                fullWidth
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                placeholder="Nhập họ tên hoặc tên đăng nhập"
                slotProps={{
                  htmlInput: { maxLength: 120 },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>

            <div className={styles.filterField}>
              <label htmlFor="officer-status">Trạng thái</label>
              <TextField
                select
                id="officer-status"
                size="small"
                fullWidth
                value={status}
                onChange={e => {
                  setStatus(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                slotProps={{
                  select: {
                    IconComponent: KeyboardArrowDown,
                    SelectDisplayProps: { "aria-label": "Trạng thái tài khoản" },
                  },
                }}
              >
                {OFFICER_STATUS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          <div className={styles.filterLocationRow}>
            <div className={styles.filterLocationWrap}>
              <LocationSelector
                key={locationFilterKey}
                id="officer-filter-location"
                compact
                allowClear
                value={locationId}
                onChange={nextId => {
                  setLocationId(nextId)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              />
            </div>

            {hasFilters ? (
              <Button
                type="button"
                variant="outlined"
                className={styles.resetBtn}
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </Button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div
            className={styles.skeletonWrap}
            role="status"
            aria-label="Đang tải danh sách cán bộ ATTP"
          >
            {SKELETON_ROWS.map(row => (
              <div key={row} className={styles.skeletonRow}>
                <Skeleton variant="text" width="85%" height={22} />
                <Skeleton variant="text" width="80%" height={22} />
                <Skeleton variant="text" width="90%" height={22} />
                <Skeleton variant="text" width="75%" height={22} />
                <Skeleton variant="rounded" width={96} height={24} />
                <Skeleton variant="text" width={64} height={22} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {error.status === 403
                ? "Bạn không có quyền quản lý tài khoản cán bộ ATTP"
                : "Không thể tải danh sách cán bộ ATTP"}
            </p>
            <p className={styles.stateDesc}>{error.message}</p>
            {error.status !== 403 ? (
              <Button
                type="button"
                variant="outlined"
                startIcon={<ReplayOutlined />}
                onClick={() => setReloadTick(t => t + 1)}
              >
                Thử lại
              </Button>
            ) : null}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>
              {hasFilters
                ? "Không tìm thấy tài khoản cán bộ ATTP phù hợp"
                : "Chưa có tài khoản cán bộ ATTP nào"}
            </p>
            <p className={styles.stateDesc}>
              {hasFilters
                ? "Thử điều chỉnh từ khóa tìm kiếm, trạng thái hoặc địa bàn phường/xã."
                : "Tạo tài khoản cán bộ ATTP cho từng phường/xã để bắt đầu quản lý trường học và xử lý sự cố trên địa bàn."}
            </p>
            {hasFilters ? (
              <Button
                type="button"
                variant="outlined"
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                startIcon={<Add />}
                className={styles.primaryBtn}
                onClick={() => setCreateOpen(true)}
              >
                Tạo tài khoản cán bộ ATTP
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Cán bộ</th>
                    <th>Email</th>
                    <th>Đơn vị ATTP</th>
                    <th>Phường / Xã</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(officer => {
                    const statusMeta = getOfficerStatusMeta(officer.status)
                    return (
                      <tr key={officer.id}>
                        <td>
                          <div className={styles.primaryCell}>
                            <Link
                              to={detailUrl(officer.id)}
                              className={styles.primaryLink}
                            >
                              {officer.fullName || "—"}
                            </Link>
                            <span className={styles.secondaryMeta}>
                              @{officer.username}
                            </span>
                          </div>
                        </td>
                        <td>
                          {officer.email && !officer.emailSetupRequired ? (
                            <span>{officer.email}</span>
                          ) : (
                            <span
                              className={`${styles.badge} ${styles.toneWarning}`}
                            >
                              Chưa thiết lập
                            </span>
                          )}
                        </td>
                        <td>
                          <div className={styles.unitCell}>
                            <span className={styles.unitName}>
                              {officer.unit?.name || "—"}
                            </span>
                            {officer.unit?.code ? (
                              <span className={styles.secondaryMeta}>
                                {officer.unit.code}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>{officer.location?.name || "—"}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${TONE_CLASS[statusMeta.tone] || styles.toneMuted}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className={styles.dateCell}>
                          {formatDateTimeVi(officer.createdAt)}
                        </td>
                        <td>
                          <Link
                            to={detailUrl(officer.id)}
                            className={styles.detailActionLink}
                          >
                            <VisibilityOutlined sx={{ fontSize: 16 }} />
                            <span>Chi tiết</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {items.map(officer => {
                const statusMeta = getOfficerStatusMeta(officer.status)
                return (
                  <article key={officer.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardTop}>
                      <div className={styles.primaryCell}>
                        <Link
                          to={detailUrl(officer.id)}
                          className={styles.primaryLink}
                        >
                          {officer.fullName || "—"}
                        </Link>
                        <span className={styles.secondaryMeta}>
                          @{officer.username}
                        </span>
                      </div>
                      <span
                        className={`${styles.badge} ${TONE_CLASS[statusMeta.tone] || styles.toneMuted}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className={styles.mobileMetaGrid}>
                      <div className={styles.mobileMetaItem}>
                        <span>Email</span>
                        <strong>
                          {officer.email && !officer.emailSetupRequired ? (
                            officer.email
                          ) : (
                            <span
                              className={`${styles.badge} ${styles.toneWarning}`}
                            >
                              Chưa thiết lập
                            </span>
                          )}
                        </strong>
                      </div>
                      <div className={styles.mobileMetaItem}>
                        <span>Phường / Xã</span>
                        <strong>{officer.location?.name || "—"}</strong>
                      </div>
                      <div className={styles.mobileMetaItem}>
                        <span>Đơn vị ATTP</span>
                        <strong>
                          {officer.unit?.name || "—"}
                          {officer.unit?.code ? ` (${officer.unit.code})` : ""}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.mobileCardFooter}>
                      <span>Tạo lúc: {formatDateTimeVi(officer.createdAt)}</span>
                      <Link
                        to={detailUrl(officer.id)}
                        className={styles.detailActionLink}
                      >
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                        <span>Chi tiết</span>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}

        {!loading && !error && (items.length > 0 || pagination.page > 1) ? (
          <div className={styles.paginationBar}>
            <span>
              Hiển thị {items.length} tài khoản trên trang {pagination.page}
            </span>
            <div className={styles.paginationControls}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<KeyboardArrowLeft />}
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Trước
              </Button>
              <span>Trang {pagination.page}</span>
              <Button
                type="button"
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowRight />}
                disabled={!pagination.hasNext}
                onClick={() =>
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Tiếp
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <CreateOfficerDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </main>
  )
}
