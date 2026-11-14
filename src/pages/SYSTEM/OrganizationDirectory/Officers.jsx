import React, { useEffect, useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Alert, Button, CircularProgress, IconButton, InputAdornment, Pagination, TextField } from "@mui/material"
import { KeyboardArrowLeft, Search, VisibilityOutlined } from "@mui/icons-material"
import { getOfficerDirectory } from "src/services/SystemDirectoryService/lifecycle"
import ROUTER from "src/router/ROUTER"
import LifecycleActions from "./LifecycleActions"
import styles from "./styles.module.scss"

const formatDate = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString("vi-VN") : "—"
const statusLabel = value => ({ ACTIVE: "Hoạt động", INACTIVE: "Ngừng hoạt động", LOCKED: "Đã khóa", DEACTIVATED: "Đã khóa", UNVERIFIED: "Chưa xác minh" })[value] || value || "Chưa có thông tin"
function Status({ value }) { return <span className={`${styles.badge} ${value === "ACTIVE" ? styles.active : styles.inactive}`}>{statusLabel(value)}</span> }
function useOfficers() {
  const [state, setState] = useState({ loading: true })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setState({ loading: true })
    getOfficerDirectory(controller.signal).then(data => { if (!controller.signal.aborted) setState({ data }) }).catch(error => { if (!controller.signal.aborted) setState({ error }) })
    return () => controller.abort()
  }, [attempt])
  return { ...state, retry: () => setAttempt(n => n + 1) }
}
function LoadError({ error, retry }) { return <Alert severity="error" action={<Button onClick={retry}>Thử lại</Button>}>{error?.message || "Không thể tải danh sách cán bộ."}</Alert> }

export function OfficerList() {
  const request = useOfficers()
  const [search, setSearch] = useState("")
  const [params, setParams] = useSearchParams()
  const requestedPage = Math.max(1, Number.parseInt(params.get("page"), 10) || 1)
  const filtered = useMemo(() => (request.data || []).filter(item => `${item.fullName || ""} ${item.username || ""}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi"))), [request.data, search])
  const page = Math.min(requestedPage, Math.max(1, Math.ceil(filtered.length / 5)))
  const rows = filtered.slice((page - 1) * 5, page * 5)
  const detailLink = item => `${ROUTER.SYSTEM_OFFICER_LIST}/${encodeURIComponent(item.id)}?page=${page}`
  return <main className={`${styles.page} ${styles.schoolPage}`}>
    <header className={styles.heading}><h1>Danh sách cán bộ ATTP</h1><p>Tra cứu và quản lý tài khoản cán bộ an toàn thực phẩm.</p></header>
    <section className={`${styles.panel} ${styles.schoolList}`} aria-label="Danh sách cán bộ ATTP">
      <div className={styles.listTitle}><h2>Cán bộ ATTP</h2></div>
      <div className={styles.schoolFilters}><div className={`${styles.schoolFilterField} ${styles.schoolSearch}`}><label htmlFor="officer-search">Tìm kiếm</label><TextField id="officer-search" value={search} onChange={event => { setSearch(event.target.value); setParams({}) }} placeholder="Họ tên hoặc tên đăng nhập" size="small" fullWidth slotProps={{ htmlInput: { maxLength: 255 }, input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} /></div></div>
      {request.loading ? <div className={styles.message}><CircularProgress size={26} aria-label="Đang tải danh sách" /></div> : request.error ? <LoadError error={request.error} retry={request.retry} /> : !rows.length ? <p className={styles.message}>Không có cán bộ ATTP phù hợp.</p> : <>
        <div className={styles.tableWrap}><table><thead><tr><th>STT</th><th>Họ và tên</th><th>Tên đăng nhập</th><th>Trạng thái tài khoản</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>{rows.map((item, index) => <tr key={item.id}><td>{(page - 1) * 5 + index + 1}</td><td><Link to={detailLink(item)}>{item.fullName || "—"}</Link></td><td>{item.username || "—"}</td><td><Status value={item.status} /></td><td>{formatDate(item.createdAt)}</td><td><Link className={styles.iconLink} to={detailLink(item)} aria-label={`Xem chi tiết ${item.fullName || "cán bộ"}`}><VisibilityOutlined fontSize="small" /></Link></td></tr>)}</tbody></table></div>
        <div className={styles.cards}>{rows.map(item => <article key={item.id} className={styles.mobileCard}><div className={styles.cardTop}><div><Link to={detailLink(item)}>{item.fullName || "—"}</Link><p>{item.username || "—"}</p></div><Status value={item.status} /></div><div className={styles.cardBottom}><span>Ngày tạo: {formatDate(item.createdAt)}</span><Button component={Link} to={detailLink(item)}>Xem chi tiết</Button></div></article>)}</div>
      </>}
      {!request.loading && !request.error && filtered.length > 0 && <div className={styles.schoolPagination}><p>Hiển thị {(page - 1) * 5 + 1}–{Math.min(page * 5, filtered.length)} trong {filtered.length} cán bộ</p><Pagination page={page} count={Math.ceil(filtered.length / 5)} onChange={(_, value) => setParams(value > 1 ? { page: String(value) } : {})} shape="rounded" getItemAriaLabel={(type, number) => type === "page" ? `Trang ${number}` : type === "next" ? "Trang sau" : "Trang trước"} /></div>}
    </section>
  </main>
}

export function OfficerDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const request = useOfficers()
  const [lockedId, setLockedId] = useState(null)
  const found = request.data?.find(item => item.id === id)
  const officer = found && lockedId === id ? { ...found, status: "DEACTIVATED" } : found
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1)
  const back = <div className={styles.detailHeading}><IconButton component={Link} to={`${ROUTER.SYSTEM_OFFICER_LIST}${page > 1 ? `?page=${page}` : ""}`} className={styles.back} aria-label="Quay lại danh sách"><KeyboardArrowLeft /></IconButton><span>Xem chi tiết</span></div>
  return <main className={`${styles.page} ${styles.schoolPage}`}>{back}{request.loading ? <CircularProgress aria-label="Đang tải chi tiết" /> : request.error ? <LoadError error={request.error} retry={request.retry} /> : !officer ? <Alert severity="warning">Không tìm thấy cán bộ ATTP.</Alert> : <>
    <LifecycleActions key={id} kind="officer" id={id} onAccountDeactivated={() => setLockedId(id)} heading={<div><h1>{officer.fullName || "—"}</h1><p>Tên đăng nhập: {officer.username || "—"}</p></div>}>
    <section className={`${styles.panel} ${styles.detailSection}`}><h2>Thông tin cán bộ ATTP</h2><div className={styles.fields}><div className={styles.field}><span>Họ và tên</span><strong>{officer.fullName || "—"}</strong></div><div className={styles.field}><span>Tên đăng nhập</span><strong>{officer.username || "—"}</strong></div><div className={styles.field}><span>Trạng thái tài khoản</span><Status value={officer.status} /></div><div className={styles.field}><span>Ngày tạo</span><strong>{formatDate(officer.createdAt)}</strong></div></div></section>
    </LifecycleActions>
  </>}</main>
}
