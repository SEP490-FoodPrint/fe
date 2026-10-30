import React, { useContext, useEffect, useState } from "react"
import { Alert, Button, Skeleton } from "@mui/material"
import { Link } from "react-router-dom"
import { StoreContext } from "src/contexts"
import SchoolOverviewService from "src/services/SchoolOverviewService"
import ROUTER from "src/router/ROUTER"
import OverviewHeader from "./component/OverviewHeader"
import "./style.scss"

const labels = {
  DRAFT: "Bản nháp", PENDING_APPROVAL: "Chờ duyệt", APPROVED: "Đã duyệt",
  REVISION_REQUIRED: "Cần chỉnh sửa", ACTIVE: "Đang liên kết", SUSPENDED: "Tạm dừng",
  UNLINKED: "Đã hủy liên kết", OPEN: "Mới ghi nhận", INVESTIGATING: "Đang xử lý",
  RESOLVED: "Đã giải quyết", CLOSED: "Đã đóng", SUBMITTED: "Mới nhận", IN_REVIEW: "Đang xem xét",
}
const countByStatus = items => Object.entries((items || []).reduce((groups, item) => {
  groups[item.status] = (groups[item.status] || 0) + (item.count ?? 1)
  return groups
}, {})).map(([status, count]) => ({ status, count }))
const total = rows => rows?.reduce((sum, row) => sum + (row.count ?? 1), 0) ?? null

function StatusPanel({ title, rows, to }) {
  const groups = countByStatus(rows)
  const sum = total(rows)
  return <article className="overview-panel">
    <div className="overview-panel-heading"><h2>{title}</h2><strong>{sum ?? "—"}</strong></div>
    {rows === null ? <p>Bạn chưa có quyền xem dữ liệu này.</p>
      : groups.length === 0 ? <p>Chưa có bản ghi.</p>
      : <div className="overview-status-list">{groups.map(row => <div key={row.status}>
        <div><span>{labels[row.status] || row.status}</span><strong>{row.count}</strong></div>
        <progress value={row.count} max={sum || 1} aria-label={labels[row.status] || row.status} />
      </div>)}</div>}
    <Link to={to}>Xem chi tiết →</Link>
  </article>
}

function SchoolOverview() {
  const { userStore } = useContext(StoreContext)
  const username = userStore?.user?.username
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    setData(null)
    SchoolOverviewService.getOverview()
      .then(response => { if (active) setData(response.data) })
      .catch(failure => {
        if (active) setError(failure?.response?.data?.message || failure.message || "Không thể tải dữ liệu tổng quan.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [username, attempt])

  return (
    <div className="schoolOverviewPage">
      <OverviewHeader />
      {loading && <Skeleton variant="rounded" height={300} />}
      {error && <Alert severity="error" action={<Button color="inherit" onClick={() => setAttempt(value => value + 1)}>Thử lại</Button>}>{error}</Alert>}
      {data && <>
        <div className="overview-data-heading"><span>{data.school.name}</span><small>Cập nhật {new Date(data.updatedAt).toLocaleString("vi-VN")}</small></div>
        <section className="overview-kpis" aria-label="Chỉ số vận hành">
          {[
            ["Thực đơn cần duyệt", data.menus?.filter(item => item.status === "PENDING_APPROVAL").length, "thực đơn"],
            ["Phản ánh chưa xử lý", data.complaints === null ? null : total(data.complaints.filter(item => ["SUBMITTED", "IN_REVIEW"].includes(item.status))), "phản ánh"],
            ["Nhà cung cấp đang liên kết", data.suppliers?.find(item => item.status === "ACTIVE")?.count ?? (data.suppliers === null ? null : 0), "nhà cung cấp"],
            ["Sự cố đang xử lý", data.incidents?.filter(item => ["OPEN", "INVESTIGATING"].includes(item.status)).length, "sự cố"],
          ].map(([label, value, unit]) => <article key={label}><p>{label}</p><strong>{value ?? "—"}</strong><span>{unit}</span></article>)}
        </section>
        <section className="overview-panels" aria-label="Phân bổ dữ liệu">
          <StatusPanel title="Trạng thái thực đơn" rows={data.menus} to={ROUTER.SCHOOL_MENU_APPROVAL} />
          <StatusPanel title="Phản ánh bữa ăn" rows={data.complaints} to={ROUTER.SCHOOL_MEAL_FEEDBACK} />
          <StatusPanel title="Liên kết nhà cung cấp" rows={data.suppliers} to={ROUTER.SCHOOL_SUPPLIERS} />
          <StatusPanel title="An toàn thực phẩm" rows={data.incidents} to={ROUTER.SCHOOL_FOOD_SAFETY} />
        </section>
        <section className="overview-panel">
          <h2>Thực đơn gần đây</h2>
          {data.menus?.length ? <div className="overview-menu-list">{data.menus.slice(0, 5).map(menu =>
            <Link key={menu.id} to={`${ROUTER.SCHOOL_MENU_APPROVAL}?menuId=${menu.id}`}><span><strong>{menu.title}</strong><small>Tuần từ {new Date(menu.weekStartDate).toLocaleDateString("vi-VN")}</small></span><span className={`overview-badge ${menu.status.toLowerCase()}`}>{labels[menu.status] || menu.status}</span></Link>
          )}</div> : <p>{data.menus === null ? "Bạn chưa có quyền xem thực đơn." : "Chưa có thực đơn."}</p>}
        </section>
      </>}
    </div>
  )
}

export default SchoolOverview
