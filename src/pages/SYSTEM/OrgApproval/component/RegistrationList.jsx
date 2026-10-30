import React, { useEffect, useState } from "react"
import { Alert, Button, Card, CircularProgress, Pagination, useMediaQuery } from "@mui/material"
import { useSearchParams } from "react-router-dom"
import RegistrationService from "src/services/RegistrationService"
import RegistrationFilters from "./RegistrationFilters"
import RegistrationTable from "./RegistrationTable"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import styles from "./RegistrationList.module.scss"

export default function RegistrationList() {
  const [params, setParams] = useSearchParams()
  const isMobile = useMediaQuery("(max-width:600px)")
  const pageSize = isMobile ? 2 : 5
  const filters = Object.fromEntries(["search", "type", "status", "from", "to"].map(key => [key, params.get(key) || ""]))
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1)
  const [result, setResult] = useState({ data: [], total: 0, summary: {}, isMock: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const invalidDates = Boolean(filters.from && filters.to && filters.from > filters.to)
  const queryKey = params.toString()

  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setLoading(true)
      setError("")
      try {
        const response = await RegistrationService.getRequests({ ...filters, page, pageSize })
        if (active) setResult(response)
      } catch (err) {
        if (active) setError(err.message || "Không thể tải danh sách hồ sơ.")
      } finally {
        if (active) setLoading(false)
      }
    }, filters.search ? 250 : 0)
    return () => { active = false; clearTimeout(timer) }
    // The URL contains all filters. Ignore a response if its query is no longer current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, pageSize, retry])

  const updateFilter = (key, value) => {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete("page")
      return next
    }, { replace: true })
  }
  const changePage = nextPage => setParams(previous => {
    const next = new URLSearchParams(previous)
    next.set("page", String(nextPage))
    return next
  })
  const currentPage = result.page || page
  const pages = Math.max(1, Math.ceil(result.total / pageSize))
  const start = (currentPage - 1) * pageSize
  const range = `Hiển thị ${result.total ? start + 1 : 0}–${start + result.data.length} trong ${result.total} hồ sơ`

  return (
    <section className={styles.page} aria-labelledby="registration-title">
      <div className={styles.heading}>
        <h1 id="registration-title">Danh sách hồ sơ đăng ký</h1>
        <p>Tiếp nhận và theo dõi hồ sơ đăng ký của trường học và nhà cung cấp.</p>
      </div>
      <div className={styles.stats}>
        <Card variant="outlined" className={styles.stat}><div><span>Tổng số hồ sơ</span><ReceiptLongOutlinedIcon className={styles.statIcon} /></div><strong>{result.summary?.total ?? "—"}</strong></Card>
        <Card variant="outlined" className={`${styles.stat} ${styles.pending}`}><div><span>Hồ sơ chờ xét duyệt</span><AccessTimeOutlinedIcon className={styles.statIcon} /></div><strong>{result.summary?.pending ?? "—"}</strong></Card>
      </div>
      <div className={styles.list}>
        <div className={styles.listTitle}><h2>Hồ sơ đăng ký</h2></div>
        <RegistrationFilters filters={filters} onChange={updateFilter} onReset={() => setParams({})} hasFilters={Object.values(filters).some(Boolean)} />
        {error ? <Alert severity="error" className={styles.feedback} action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{error}</Alert>
          : loading ? <div className={styles.loading} role="status"><CircularProgress size={28} /><span>Đang tải hồ sơ…</span></div>
            : !result.data.length || invalidDates ? <div className={styles.empty}><h2>Không tìm thấy hồ sơ</h2><p>Thử thay đổi từ khóa hoặc điều kiện lọc.</p><Button onClick={() => setParams({})}>Xóa bộ lọc</Button></div>
              : <RegistrationTable requests={result.data} start={start} isMobile={isMobile} busy={loading} />}
        {!error && !loading && result.total > 0 && !invalidDates && (
          <div className={styles.pagination}>
            <p aria-live="polite">{range}</p>
            {isMobile ? <div className={styles.mobilePagination}>
              <Button variant="outlined" disabled={currentPage <= 1} onClick={() => changePage(currentPage - 1)} startIcon={<KeyboardArrowLeftIcon />}>Trước</Button>
              <span>Trang {currentPage} / {pages}</span>
              <Button variant="outlined" disabled={currentPage >= pages} onClick={() => changePage(currentPage + 1)} endIcon={<KeyboardArrowRightIcon />}>Tiếp</Button>
            </div> : <Pagination page={Math.min(currentPage, pages)} count={pages} onChange={(_, value) => changePage(value)} color="primary" shape="rounded" siblingCount={1} boundaryCount={1} getItemAriaLabel={(type, number) => type === "page" ? `Trang ${number}` : type === "next" ? "Trang sau" : "Trang trước"} />}
          </div>
        )}
      </div>
      {result.isMock && <p className={styles.note}>Dữ liệu minh họa · Chọn hồ sơ để xem chi tiết</p>}
    </section>
  )
}
