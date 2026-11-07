import React, { useContext, useEffect, useState } from "react"
import { Alert, Button, Skeleton } from "@mui/material"
import { Navigate, Link } from "react-router-dom"
import { StoreContext } from "src/contexts"
import SchoolOverviewService from "src/services/SchoolOverviewService"
import { ROLES } from "src/constants/roles"
import ROUTER from "src/router/ROUTER"
import { displayName } from "src/lib/displayName"
import AnalyticsGrid from "./component/AnalyticsGrid"
import OverviewHeader from "./component/OverviewHeader"
import "./style.scss"

const labels = {
  DRAFT: "Bản nháp", PENDING_APPROVAL: "Chờ duyệt", APPROVED: "Đã duyệt",
  REVISION_REQUIRED: "Cần chỉnh sửa", ACTIVE: "Đang liên kết", SUSPENDED: "Tạm dừng",
  UNLINKED: "Đã hủy liên kết", OPEN: "Mới ghi nhận", INVESTIGATING: "Đang xử lý",
  RESOLVED: "Đã giải quyết", CLOSED: "Đã đóng", SUBMITTED: "Mới nhận", IN_REVIEW: "Đang xem xét",
}
const total = rows => rows?.reduce((sum, row) => sum + (row.count ?? 1), 0) ?? null

function SchoolOverview() {
  const { userStore } = useContext(StoreContext)
  const username = userStore?.user?.username
  const role = userStore?.user?.role
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if ([ROLES.SCHOOL_KITCHEN_STAFF, ROLES.SCHOOL_NUTRITION_OFFICER, ROLES.HOMEROOM_TEACHER].includes(role)) return
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
  }, [username, attempt, role])

  if (role === ROLES.SCHOOL_KITCHEN_STAFF) return <Navigate to={ROUTER.SCHOOL_KITCHEN_COOKING} replace />
  if (role === ROLES.SCHOOL_NUTRITION_OFFICER) return <Navigate to={ROUTER.SCHOOL_HEALTH_OVERVIEW} replace />
  if (role === ROLES.HOMEROOM_TEACHER) return <Navigate to={ROUTER.SCHOOL_HOMEROOM_OVERVIEW} replace />

  return (
    <div className="schoolOverviewPage">
      <OverviewHeader />
      {loading && <Skeleton variant="rounded" height={300} />}
      {error && <Alert severity="error" action={<Button color="inherit" onClick={() => setAttempt(value => value + 1)}>Thử lại</Button>}>{error}</Alert>}
      {data && <>
        <section className="overview-kpis" aria-label="Chỉ số vận hành">
          {[
            ["Thực đơn cần duyệt", data.menus?.filter(item => item.status === "PENDING_APPROVAL").length, "thực đơn"],
            ["Phản ánh chưa xử lý", data.complaints === null ? null : total(data.complaints.filter(item => ["SUBMITTED", "IN_REVIEW"].includes(item.status))), "phản ánh"],
            ["Nhà cung cấp đang liên kết", data.suppliers?.find(item => item.status === "ACTIVE")?.count ?? (data.suppliers === null ? null : 0), "nhà cung cấp"],
            ["Sự cố đang xử lý", data.incidents?.filter(item => ["OPEN", "INVESTIGATING"].includes(item.status)).length, "sự cố"],
          ].map(([label, value, unit]) => <article key={label}><p>{label}</p><strong>{value ?? "—"}</strong><span>{unit}</span></article>)}
        </section>
        <AnalyticsGrid data={data} />
        <section className="overview-panel">
          <h2>Thực đơn gần đây</h2>
          {data.menus?.length ? <div className="overview-menu-list">{data.menus.slice(0, 5).map(menu =>
            <Link key={menu.id} to={`${ROUTER.SCHOOL_MENU_APPROVAL}?menuId=${menu.id}`}><span><strong>{displayName(menu.title)}</strong><small>Tuần từ {new Date(menu.weekStartDate).toLocaleDateString("vi-VN")}</small></span><span className={`overview-badge ${menu.status.toLowerCase()}`}>{labels[menu.status] || menu.status}</span></Link>
          )}</div> : <p>{data.menus === null ? "Bạn chưa có quyền xem thực đơn." : "Chưa có thực đơn."}</p>}
        </section>
      </>}
    </div>
  )
}

export default SchoolOverview
