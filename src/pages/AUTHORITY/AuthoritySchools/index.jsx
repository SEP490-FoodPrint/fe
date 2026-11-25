import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Button,
  InputAdornment,
  MenuItem,
  Skeleton,
  TextField,
} from "@mui/material"
import {
  EmailOutlined,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LocationOnOutlined,
  MapOutlined,
  PhoneOutlined,
  ReplayOutlined,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material"
import AuthoritySchoolService, {
  getSchoolStatusMeta,
  SCHOOL_STATUS_OPTIONS,
} from "src/services/AuthoritySchoolService"
import ROUTER from "src/router/ROUTER"
import styles from "./AuthoritySchools.module.scss"

const PAGE_LIMIT = 20
const SKELETON_ROWS = [0, 1, 2, 3, 4]

export default function AuthoritySchoolsPage() {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    hasNext: false,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const delay = search.trim() ? 300 : 0

    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)

      AuthoritySchoolService.listSchools(
        {
          page: pagination.page,
          limit: PAGE_LIMIT,
          search: search.trim(),
          status,
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
          setError({
            status: err?.response?.status,
            message:
              err?.response?.data?.message ||
              err?.message ||
              "Không thể tải danh sách trường học trên địa bàn.",
          })
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
  }, [pagination.page, search, status, reloadTick])

  const hasFilters = Boolean(search.trim() || status !== "ALL")

  const handleResetFilters = () => {
    setSearch("")
    setStatus("ALL")
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const detailUrl = schoolId =>
    `${ROUTER.AUTHORITY_SCHOOLS}/${encodeURIComponent(schoolId)}`

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Trường học trên địa bàn</h1>
        <p className={styles.subtitle}>
          Theo dõi các trường học thuộc phạm vi quản lý của đơn vị An toàn thực
          phẩm và danh sách nhà cung cấp đang liên kết.
        </p>
      </header>

      <section
        className={styles.surface}
        aria-label="Danh sách trường học trên địa bàn"
      >
        <div className={styles.filterBar}>
          <div className={styles.filterField}>
            <label htmlFor="authority-schools-search">Tìm kiếm</label>
            <TextField
              id="authority-schools-search"
              size="small"
              fullWidth
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              placeholder="Nhập tên trường hoặc mã trường"
              slotProps={{
                htmlInput: { maxLength: 100 },
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
            <label htmlFor="authority-schools-status">Trạng thái</label>
            <TextField
              select
              id="authority-schools-status"
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
                  SelectDisplayProps: { "aria-label": "Trạng thái trường học" },
                },
              }}
            >
              {SCHOOL_STATUS_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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

        {loading ? (
          <div
            className={styles.skeletonWrap}
            role="status"
            aria-label="Đang tải danh sách trường học"
          >
            {SKELETON_ROWS.map(row => (
              <div key={row} className={styles.skeletonRow}>
                <Skeleton variant="text" width="80%" height={22} />
                <Skeleton variant="text" width="90%" height={22} />
                <Skeleton variant="text" width="80%" height={22} />
                <Skeleton variant="text" width="90%" height={22} />
                <Skeleton variant="text" width="85%" height={22} />
                <Skeleton variant="rounded" width={92} height={24} />
                <Skeleton variant="text" width={72} height={22} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {error.status === 403
                ? "Bạn không có quyền xem danh sách trường học trên địa bàn"
                : "Không thể tải danh sách trường học"}
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
                ? "Không tìm thấy trường học phù hợp"
                : "Chưa có trường học nào trên địa bàn"}
            </p>
            <p className={styles.stateDesc}>
              {hasFilters
                ? "Thử điều chỉnh từ khóa tìm kiếm hoặc trạng thái hoạt động."
                : "Các trường học cùng phường/xã với đơn vị ATTP của bạn sẽ hiển thị tại đây sau khi được gắn địa giới."}
            </p>
            {hasFilters ? (
              <Button
                type="button"
                variant="outlined"
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Mã trường</th>
                    <th>Tên trường</th>
                    <th>Phường / Xã</th>
                    <th>Địa chỉ</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(school => {
                    const statusMeta = getSchoolStatusMeta(school.status)
                    return (
                      <tr key={school.id}>
                        <td className={styles.codeCell}>
                          {school.code || "—"}
                        </td>
                        <td>
                          <Link
                            to={detailUrl(school.id)}
                            className={styles.schoolLink}
                          >
                            {school.name || "—"}
                          </Link>
                        </td>
                        <td>{school.location?.name || "—"}</td>
                        <td className={styles.addressCell}>
                          {school.address || "—"}
                        </td>
                        <td>
                          <div className={styles.contactCell}>
                            <span>{school.phone || "—"}</span>
                            {school.email ? (
                              <span className={styles.secondaryText}>
                                {school.email}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              statusMeta.tone === "success"
                                ? styles.toneSuccess
                                : styles.toneMuted
                            }`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={detailUrl(school.id)}
                            className={styles.detailLink}
                          >
                            <VisibilityOutlined sx={{ fontSize: 16 }} />
                            <span>Xem chi tiết</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {items.map(school => {
                const statusMeta = getSchoolStatusMeta(school.status)
                return (
                  <article key={school.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardTop}>
                      <div>
                        <Link
                          to={detailUrl(school.id)}
                          className={styles.schoolLink}
                        >
                          {school.name || "—"}
                        </Link>
                        <div className={styles.secondaryText}>
                          Mã trường: {school.code || "—"}
                        </div>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          statusMeta.tone === "success"
                            ? styles.toneSuccess
                            : styles.toneMuted
                        }`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className={styles.mobileCardMeta}>
                      <p>
                        <MapOutlined sx={{ fontSize: 16 }} />
                        <span>{school.location?.name || "—"}</span>
                      </p>
                      <p>
                        <LocationOnOutlined sx={{ fontSize: 16 }} />
                        <span>{school.address || "—"}</span>
                      </p>
                      <p>
                        <PhoneOutlined sx={{ fontSize: 16 }} />
                        <span>{school.phone || "—"}</span>
                      </p>
                      <p>
                        <EmailOutlined sx={{ fontSize: 16 }} />
                        <span>{school.email || "—"}</span>
                      </p>
                    </div>

                    <div className={styles.mobileCardFooter}>
                      <Link
                        to={detailUrl(school.id)}
                        className={styles.detailLink}
                      >
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                        <span>Xem chi tiết</span>
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
              Hiển thị {items.length} trường học trên trang {pagination.page}
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
    </main>
  )
}
