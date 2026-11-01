import React from "react"
import { Link } from "react-router-dom"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import ROUTER from "src/router/ROUTER"
import styles from "./AnalyticsGrid.module.scss"

const statusLabels = {
  DRAFT: "Bản nháp", PENDING_APPROVAL: "Chờ duyệt", APPROVED: "Đã duyệt",
  REVISION_REQUIRED: "Cần chỉnh sửa", ACTIVE: "Đang liên kết",
  SUSPENDED: "Tạm dừng", UNLINKED: "Ngừng liên kết",
}
const colors = {
  APPROVED: "var(--color-primary)", ACTIVE: "var(--color-primary)",
  PENDING_APPROVAL: "var(--color-warning)", SUSPENDED: "var(--color-warning)",
  REVISION_REQUIRED: "var(--color-error)", UNLINKED: "var(--color-secondary)", DRAFT: "var(--text-muted)",
}
const complaintLabels = {
  MEAL_QUALITY: "Chất lượng bữa ăn", FOOD_HYGIENE: "Vệ sinh thực phẩm",
  HEALTH_ISSUE: "Vấn đề sức khỏe", OTHER: "Khác",
}
const groupRows = (rows, key, labels) => Object.entries(rows.reduce((groups, row) => {
  groups[row[key]] = (groups[row[key]] || 0) + (row.count ?? 1)
  return groups
}, {})).map(([code, value]) => ({ name: labels[code] || code, value, color: colors[code] || "var(--color-info)" }))

function ChartCard({ title, subtitle, rows, to, children }) {
  return <article className={styles.chartCard}>
    <div className={styles.chartHeader}><div><h2>{title}</h2><p>{subtitle}</p></div></div>
    {rows === null ? <p>Bạn chưa có quyền xem dữ liệu này.</p>
      : rows.length === 0 ? <p>Chưa có bản ghi.</p> : children}
    <div className={styles.cardFooter}><span>Dữ liệu từ hệ thống</span><Link to={to}>Xem chi tiết →</Link></div>
  </article>
}

function Donut({ rows, unit }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  return <div className={styles.donutLayout}>
    <div className={styles.donutWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={58} outerRadius={78} paddingAngle={3} stroke="none">
          {rows.map(row => <Cell key={row.name} fill={row.color} />)}
        </Pie><Tooltip /></PieChart>
      </ResponsiveContainer>
      <div className={styles.donutCenter}><strong>{total}</strong><span>{unit}</span></div>
    </div>
    <div className={styles.legend}>{rows.map(row => <div key={row.name}>
      <i style={{ background: row.color }} /><span>{row.name}</span><strong>{row.value}</strong><small>{total ? Math.round(row.value / total * 100) : 0}%</small>
    </div>)}</div>
  </div>
}

function ComplaintTick({ x, y, payload }) {
  const lines = payload.value.split(" ").reduce((result, word) => {
    const last = result.length - 1
    if (last >= 0 && `${result[last]} ${word}`.length <= 14) result[last] += ` ${word}`
    else result.push(word)
    return result
  }, [])
  return <text x={x} y={y} textAnchor="middle" fill="var(--text-secondary)" className={styles.axisLabel}>
    {lines.map((line, index) => <tspan key={index} x={x} dy={index === 0 ? "1.2em" : "1.3em"}>{line}</tspan>)}
  </text>
}

export default function AnalyticsGrid({ data }) {
  const menus = data.menus === null ? null : groupRows(data.menus || [], "status", statusLabels)
  const complaints = data.complaints === null ? null : groupRows(data.complaints || [], "type", complaintLabels)
  const suppliers = data.suppliers === null ? null : groupRows(data.suppliers || [], "status", statusLabels)
  const asOf = new Date(data.updatedAt)
  const months = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(asOf.getFullYear(), asOf.getMonth() - 5 + index, 1)
    return { key: `${month.getFullYear()}-${month.getMonth()}`, name: `T.${month.getMonth() + 1}/${month.getFullYear()}`, value: 0 }
  })
  for (const incident of data.incidents || []) {
    const date = new Date(incident.occurredAt || incident.createdAt)
    const month = months.find(item => item.key === `${date.getFullYear()}-${date.getMonth()}`)
    if (month) month.value++
  }
  return <section className={styles.grid} aria-label="Phân tích dữ liệu">
    <ChartCard title="Trạng thái thẩm định thực đơn" subtitle="Phân bổ thực đơn hiện có" rows={menus} to={ROUTER.SCHOOL_MENU_APPROVAL}>
      <Donut rows={menus || []} unit="thực đơn" />
    </ChartCard>
    <ChartCard title="Phân loại khiếu nại" subtitle="Nhóm vấn đề được phản ánh" rows={complaints} to={ROUTER.SCHOOL_MEAL_FEEDBACK}>
      <div className={styles.barChart}><ResponsiveContainer width="100%" height="100%">
        <BarChart data={complaints || []} margin={{ top: 24, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border-default)" strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} height={64} tick={<ComplaintTick />} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} domain={[0, maximum => Math.max(1, maximum + 1)]} width={32} axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)" }} />
          <Tooltip cursor={{ fill: "var(--bg-muted)" }} />
          <Bar dataKey="value" name="Phản ánh" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={56}>
            <LabelList dataKey="value" position="top" fill="var(--text-primary)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer></div>
    </ChartCard>
    <ChartCard title="Xu hướng sự cố an toàn thực phẩm" subtitle="Số sự cố trong 6 tháng gần nhất; theo ngày xảy ra, dùng ngày ghi nhận nếu chưa có" rows={data.incidents} to={ROUTER.SCHOOL_FOOD_SAFETY}>
      <div className={styles.areaChart}><ResponsiveContainer width="100%" height="100%">
        <AreaChart data={months} margin={{ top: 16, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border-default)" strokeDasharray="4 4" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip /><Area type="linear" dataKey="value" name="Sự cố" stroke="var(--color-primary)" fill="var(--color-primary-soft)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer></div>
    </ChartCard>
    <ChartCard title="Tình trạng nhà cung cấp" subtitle="Trạng thái quan hệ hợp tác của trường" rows={suppliers} to={ROUTER.SCHOOL_SUPPLIERS}>
      <Donut rows={suppliers || []} unit="quan hệ" />
    </ChartCard>
  </section>
}
