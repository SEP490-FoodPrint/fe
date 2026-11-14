import React, { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Alert, Button, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, InputAdornment, MenuItem, Pagination, TextField, useMediaQuery } from "@mui/material"
import { Search, SchoolOutlined, LocalShippingOutlined, VisibilityOutlined, EmailOutlined, PhoneOutlined, LocationOnOutlined, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowDown, CheckCircleOutlined, Close } from "@mui/icons-material"
import SystemDirectoryService from "src/services/SystemDirectoryService"
import ROUTER from "src/router/ROUTER"
import styles from "./styles.module.scss"
import LifecycleActions from "./LifecycleActions"

const display = value => value === null || value === undefined || value === "" ? "—" : value
const date = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có thông tin"
const active = status => ["ACTIVE", "APPROVED", "HOAT_DONG"].includes(String(status || "").toUpperCase())
const statusLabel = status => !status ? "Chưa có thông tin" : active(status) ? "Hoạt động" : ["INACTIVE", "SUSPENDED", "DISABLED"].includes(String(status).toUpperCase()) ? "Ngừng hoạt động" : status
const Status = ({ value }) => <span className={`${styles.badge} ${active(value) ? styles.active : styles.inactive}`}>{statusLabel(value)}</span>
const Field = ({ label, value, status }) => <div className={styles.field}><span>{label}</span>{status ? <Status value={value} /> : <strong>{display(value)}</strong>}</div>

function useRequest(loader, deps, delay = 0) {
  const [state, setState] = useState({ loading: true })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setState({ loading: true })
    const timer = setTimeout(() => loader(controller.signal).then(response => {
      if (!controller.signal.aborted) setState({ data: response.data, loading: false })
    }).catch(error => { if (!controller.signal.aborted) setState({ error, loading: false }) }), delay)
    return () => { clearTimeout(timer); controller.abort() }
  }, [...deps, attempt])
  return { ...state, retry: () => setAttempt(n => n + 1) }
}
function RequestError({ error, retry }) {
  const code = error?.response?.status
  const message = code === 403 ? "Bạn không có quyền xem thông tin này." : code === 404 ? "Không tìm thấy dữ liệu yêu cầu." : code === 503 ? "Dịch vụ tạm thời không khả dụng." : error?.message || "Không thể tải dữ liệu."
  return <Alert severity={code === 403 || code === 404 ? "warning" : "error"} action={code !== 403 && code !== 404 ? <Button onClick={retry}>Thử lại</Button> : undefined}>{message}</Alert>
}

export function DirectoryList({ kind }) {
  const school = kind === "school"
  const title = school ? "Danh sách trường học" : "Danh sách nhà cung cấp"
  const entity = school ? "trường học" : "nhà cung cấp"
  const base = school ? ROUTER.SYSTEM_SCHOOL_LIST : ROUTER.SYSTEM_SUPPLIER_LIST
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1)
  const isMobile = useMediaQuery("(max-width:600px)")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const list = useRequest(signal => SystemDirectoryService.list(kind, { page, limit: 5, ...(search.trim() ? { search: search.trim() } : {}), ...(status !== "all" ? { status } : {}) }, signal), [kind, page, search, status], search.trim() ? 300 : 0)
  const summary = useRequest(signal => SystemDirectoryService.summary(kind, signal), [kind])
  const { loading, error, retry } = list
  const items = list.data?.items || []
  const pagination = list.data?.pagination || {}
  const filtered = items
  const changePage = next => setParams(next > 1 ? { page: String(next) } : {})
  const detailLink = item => `${base}/${encodeURIComponent(item.id)}?page=${page}`
  const Icon = school ? SchoolOutlined : LocalShippingOutlined
  return <main className={`${styles.page} ${styles.schoolPage}`}>
    <header className={styles.heading}><h1>{title}</h1><p>Tra cứu và xem thông tin các {entity} tham gia FoodPrint.</p></header>
    <div className={styles.schoolStats} aria-label="Thống kê toàn hệ thống">
      <div className={styles.schoolStat}><div><span>Tổng số {entity}</span><Icon /></div><strong>{summary.data?.total ?? "—"}</strong></div>
      <div className={`${styles.schoolStat} ${styles.schoolStatActive}`}><div><span>{school ? "Trường học" : "Nhà cung cấp"} đang hoạt động</span><CheckCircleOutlined /></div><strong>{summary.data?.activeCount ?? "—"}</strong></div>
    </div>
    {summary.error && <RequestError error={summary.error} retry={summary.retry} />}
    <section className={`${styles.panel} ${styles.schoolList}`} aria-label={title}>
      <div className={styles.listTitle}><h2>{school ? "Trường học" : "Nhà cung cấp"}</h2></div>
      <div className={styles.schoolFilters}>
        <div className={`${styles.schoolFilterField} ${styles.schoolSearch}`}>
          <label htmlFor={`${kind}-search`}>Tìm kiếm</label>
          <TextField id={`${kind}-search`} value={search} onChange={e => { setSearch(e.target.value); setParams({}) }} placeholder={school ? "Tên hoặc mã trường" : "Tên nhà cung cấp hoặc mã số thuế"} size="small" fullWidth slotProps={{ htmlInput: { maxLength: 255 }, input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
        </div>
        <div className={styles.schoolFilterField}>
          <label htmlFor={`${kind}-status`}>Trạng thái</label>
          <TextField select id={`${kind}-status`} value={status} onChange={e => { setStatus(e.target.value); setParams({}) }} size="small" fullWidth slotProps={{ select: { IconComponent: KeyboardArrowDown, SelectDisplayProps: { "aria-label": "Trạng thái" } } }}><MenuItem value="all">Tất cả</MenuItem><MenuItem value="ACTIVE">Hoạt động</MenuItem><MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem></TextField>
        </div>
      </div>
      {loading ? <div className={styles.message}><CircularProgress size={26} aria-label="Đang tải danh sách" /></div> : error ? <RequestError error={error} retry={retry} /> : !filtered.length ? <p className={styles.message}>Không có {entity} phù hợp.</p> : <>
        <div className={styles.tableWrap}><table><thead><tr><th>STT</th><th>{school ? "Tên trường" : "Tên nhà cung cấp"}</th><th>{school ? "Mã trường" : "Mã số thuế"}</th><th>Email</th><th>Điện thoại</th><th>Địa chỉ</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td>{String((page - 1) * 5 + items.indexOf(item) + 1).padStart(2, "0")}</td><td><Link to={detailLink(item)} state={{ item }}>{display(item.name)}</Link></td><td>{display(school ? item.code : item.taxCode)}</td><td>{display(item.email)}</td><td>{display(item.phone)}</td><td>{display(item.address)}</td><td><Status value={item.status} /></td><td>{date(item.createdAt)}</td><td><Link className={styles.iconLink} to={detailLink(item)} state={{ item }} aria-label={`Xem chi tiết ${item.name}`}><VisibilityOutlined fontSize="small" /></Link></td></tr>)}</tbody></table></div>
        <div className={styles.cards}>{filtered.map(item => <article key={item.id} className={styles.mobileCard}><div className={styles.cardTop}><div><Link to={detailLink(item)} state={{ item }}>{display(item.name)}</Link><p>{display(school ? item.code : item.taxCode)}</p></div><Status value={item.status} /></div><p><EmailOutlined /> {display(item.email)}</p><p><PhoneOutlined /> {display(item.phone)}</p><p><LocationOnOutlined /> {display(item.address)}</p><div className={styles.cardBottom}><span>Ngày tạo: {date(item.createdAt)}</span><Button component={Link} to={detailLink(item)} state={{ item }} endIcon={<VisibilityOutlined />}>Xem chi tiết</Button></div></article>)}</div>
      </>}
      {!loading && !error && (items.length > 0 || page > 1) && <div className={styles.schoolPagination}>
        <p aria-live="polite">{`Hiển thị ${items.length ? (page - 1) * 5 + 1 : 0}–${items.length ? (page - 1) * 5 + items.length : 0}${Number.isInteger(pagination.total) ? ` trong ${pagination.total} ${entity}` : ""}`}</p>
        {isMobile || !Number.isInteger(pagination.total) ? <div className={styles.schoolPaginationControls}>
          <Button variant="outlined" disabled={page <= 1} onClick={() => changePage(page - 1)} startIcon={<KeyboardArrowLeft />}>Trước</Button>
          <span>Trang {page}{Number.isInteger(pagination.total) ? ` / ${Math.max(1, Math.ceil(pagination.total / 5))}` : ""}</span>
          <Button variant="outlined" disabled={!pagination.hasNext} onClick={() => changePage(page + 1)} endIcon={<KeyboardArrowRight />}>Tiếp</Button>
        </div> : <Pagination page={page} count={Math.max(1, Math.ceil(pagination.total / 5))} onChange={(_, value) => changePage(value)} color="primary" shape="rounded" siblingCount={1} boundaryCount={1} getItemAriaLabel={(type, number) => type === "page" ? `Trang ${number}` : type === "next" ? "Trang sau" : "Trang trước"} />}
      </div>}
    </section>
  </main>
}

function DataGroup({ kind, id, group, title, columns, onDocument }) {
  const [page, setPage] = useState(1)
  const request = useRequest(signal => SystemDirectoryService.group(kind, id, group, page, signal), [kind, id, group, page])
  const rows = request.data?.items || []
  const pagination = request.data?.pagination || {}
  return <section className={`${styles.panel} ${styles.detailSection}`}><h2>{title}</h2>
    {request.loading ? <CircularProgress size={24} aria-label={`Đang tải ${title}`} /> : request.error ? <RequestError error={request.error} retry={request.retry} /> : rows.length === 0 ? <p className={styles.hint}>Chưa có dữ liệu.</p> : <div className={styles.tableWrapGroup}><table><thead><tr>{columns.map(col => <th key={col.label}>{col.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}>{columns.map(col => <td key={col.label}>{col.render ? col.render(row, onDocument) : display(row[col.key])}</td>)}</tr>)}</tbody></table></div>}
    {!request.loading && !request.error && (rows.length > 0 || page > 1) && <div className={styles.schoolPaginationControls}><Button variant="outlined" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</Button><span>Trang {page}{Number.isInteger(pagination.total) ? ` / ${Math.max(1, Math.ceil(pagination.total / 5))}` : ""}</span><Button variant="outlined" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Tiếp</Button></div>}
  </section>
}
const columns = {
  classes: [{ label: "Tên lớp", key: "name" }, { label: "Năm học", key: "academicYear" }, { label: "Số suất đăng ký", key: "registeredMealPortions" }, { label: "Trạng thái", render: row => statusLabel(row.status) }],
  suppliers: [{ label: "Nhà cung cấp", key: "supplierName" }, { label: "Trạng thái đơn vị", render: row => statusLabel(row.supplierStatus) }, { label: "Trạng thái liên kết", key: "status" }, { label: "Ngày liên kết", render: row => date(row.linkedAt) }],
  accounts: [{ label: "Họ và tên", key: "fullName" }, { label: "Email", key: "email" }, { label: "Vai trò", render: row => display(row.roleName || row.roleCode) }, { label: "Trạng thái", render: row => statusLabel(row.status) }],
  certifications: [{ label: "Loại chứng nhận", key: "certificationType" }, { label: "Số chứng nhận", key: "certificateNo" }, { label: "Ngày cấp", render: row => date(row.issuedDate) }, { label: "Ngày hết hạn", render: row => date(row.expiryDate) }, { label: "Trạng thái", render: row => statusLabel(row.status) }, { label: "Tệp minh chứng", render: (row, open) => row.documents?.length ? row.documents.map(doc => <Button key={doc.id} onClick={() => open({ certificationId: row.id, ...doc })}>{doc.fileName || "Xem tệp"}</Button>) : "Chưa có minh chứng" }],
}
function DocumentViewer({ document, onClose }) {
  const request = useRequest(signal => SystemDirectoryService.document(document.certificationId, document.id, signal), [document.certificationId, document.id])
  let url = null
  try { if (!request.data?.url || typeof request.data.url !== "string") throw new Error("missing URL"); const parsed = new URL(request.data.url, window.location.origin); if (["https:", "http:"].includes(parsed.protocol) && !parsed.username && !parsed.password) url = parsed.href } catch { /* invalid URL */ }
  return <Dialog open onClose={onClose} fullWidth maxWidth="lg" aria-labelledby="cert-document-title"><DialogTitle id="cert-document-title">{document.fileName || "Tệp minh chứng"}<IconButton onClick={onClose} aria-label="Đóng" sx={{ float: "right" }}><Close /></IconButton></DialogTitle><DialogContent>{request.loading ? <CircularProgress aria-label="Đang tải tệp" /> : request.error ? <RequestError error={request.error} retry={request.retry} /> : !url ? <Alert severity="error">Đường dẫn tệp không hợp lệ.</Alert> : document.format === "pdf" ? <iframe src={url} title={document.fileName || "Tệp minh chứng"} referrerPolicy="no-referrer" className={styles.documentFrame} /> : <img src={url} alt={document.fileName || "Tệp minh chứng"} referrerPolicy="no-referrer" className={styles.documentImage} />}</DialogContent></Dialog>
}
export function DirectoryDetail({ kind }) {
  const school = kind === "school"
  const { id } = useParams()
  const [params] = useSearchParams()
  const page = Math.max(1, Number.parseInt(params.get("page"), 10) || 1)
  const request = useRequest(signal => SystemDirectoryService.detail(kind, id, signal), [kind, id])
  const [document, setDocument] = useState(null)
  const record = request.data
  const listUrl = `${school ? ROUTER.SYSTEM_SCHOOL_LIST : ROUTER.SYSTEM_SUPPLIER_LIST}${page > 1 ? `?page=${page}` : ""}`
  const back = <div className={styles.detailHeading}><IconButton component={Link} to={listUrl} className={styles.back} aria-label="Quay lại danh sách"><KeyboardArrowLeft /></IconButton><span>Xem chi tiết</span></div>
  if (request.loading) return <main className={`${styles.page} ${styles.schoolPage}`}>{back}<CircularProgress aria-label="Đang tải chi tiết" /></main>
  if (request.error) return <main className={`${styles.page} ${styles.schoolPage}`}>{back}<RequestError error={request.error} retry={request.retry} /></main>
  if (!record) return <main className={`${styles.page} ${styles.schoolPage}`}>{back}<Alert severity="warning">Không tìm thấy thông tin.</Alert></main>
  const name = school ? "trường học" : "nhà cung cấp"
  return <main className={`${styles.page} ${styles.schoolPage}`}>{back}<LifecycleActions key={`${kind}-${id}`} kind={kind} id={id} heading={<div><h1>{display(record.name)}</h1><p>{school ? "Mã trường" : "Mã số thuế"}: {display(school ? record.code : record.taxCode)}</p></div>}>
    <section className={`${styles.panel} ${styles.detailSection}`}><h2>Thông tin {name}</h2><div className={styles.fields}><Field label={school ? "Tên trường" : "Tên nhà cung cấp"} value={record.name} /><Field label={school ? "Mã trường" : "Mã số thuế"} value={school ? record.code : record.taxCode} /><Field label="Email" value={record.email} /><Field label="Điện thoại" value={record.phone} /><Field label="Địa chỉ" value={record.address} /><Field label="Trạng thái" value={record.status} status /><Field label="Ngày tạo" value={date(record.createdAt)} /></div></section>
    </LifecycleActions>
    {school ? <><DataGroup key={`${id}-classes`} kind={kind} id={id} group="classes" title="Lớp học" columns={columns.classes} /><DataGroup key={`${id}-suppliers`} kind={kind} id={id} group="suppliers" title="Nhà cung cấp liên kết" columns={columns.suppliers} /><DataGroup key={`${id}-accounts`} kind={kind} id={id} group="accounts" title="Tài khoản thuộc trường" columns={columns.accounts} /></> : <DataGroup key={`${id}-certifications`} kind={kind} id={id} group="certifications" title="Giấy phép và chứng nhận" columns={columns.certifications} onDocument={setDocument} />}
    {document && <DocumentViewer key={`${document.certificationId}-${document.id}`} document={document} onClose={() => setDocument(null)} />}
  </main>
}
