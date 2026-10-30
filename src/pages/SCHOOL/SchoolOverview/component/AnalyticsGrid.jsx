import React from "react"
import PropTypes from "prop-types"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowDownRight, ArrowRight, CircleCheck, Info } from "lucide-react"
import styles from "./AnalyticsGrid.module.scss"

const menuData = [
  { name: "Đã phê duyệt", value: 14, color: "var(--color-primary)" },
  { name: "Chờ phê duyệt", value: 3, color: "var(--color-secondary)" },
  { name: "Yêu cầu chỉnh sửa", value: 4, color: "var(--color-error)" },
]
const complaintData = [
  { name: "Chất lượng bữa ăn", value: 12 }, { name: "Khẩu phần & dinh dưỡng", value: 8 },
  { name: "Vệ sinh dụng cụ", value: 5 }, { name: "Khác", value: 3 },
]
const incidentData = [
  { month: "T.5", incidents: 1 }, { month: "T.6", incidents: 2 }, { month: "T.7", incidents: 1 },
  { month: "T.8", incidents: 3 }, { month: "T.9", incidents: 2 }, { month: "T.10", incidents: 1 },
]
const supplierData = [
  { name: "Đang liên kết", value: 12, color: "var(--color-primary)" },
  { name: "Đã hủy liên kết", value: 4, color: "var(--color-secondary)" },
]

function ChartHeader({ title, subtitle, badge }) {
  return <div className={styles.chartHeader}><div><h2>{title}</h2><p>{subtitle}</p></div><span>{badge}</span></div>
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className={styles.tooltip}><strong>{label || payload[0].name}</strong><span>{payload[0].value} lượt</span></div>
}

function DonutCenter({ total, label }) {
  return <div className={styles.donutCenter}><strong>{total}</strong><span>{label}</span></div>
}

function AnalyticsGrid({ period }) {
  return (
    <section className={styles.grid} aria-label="Phân tích dữ liệu">
      <article className={styles.chartCard}>
        <ChartHeader title="Trạng thái thẩm định thực đơn" subtitle="Phân bổ hồ sơ trong kỳ báo cáo" badge={`${period} ngày`} />
        <div className={styles.donutLayout}>
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={menuData} dataKey="value" innerRadius={58} outerRadius={78} paddingAngle={3} stroke="none">{menuData.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart>
            </ResponsiveContainer>
            <DonutCenter total="21" label="thực đơn" />
          </div>
          <div className={styles.legend}>{menuData.map(item => <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{item.value}</strong><small>{Math.round(item.value / 21 * 100)}%</small></div>)}</div>
        </div>
        <div className={styles.cardFooter}><span><CircleCheck size={15} /> Quy trình đúng hạn 92%</span><button type="button">Xem thực đơn <ArrowRight size={15} /></button></div>
      </article>

      <article className={styles.chartCard}>
        <ChartHeader title="Phân loại khiếu nại" subtitle="Nhóm vấn đề được phản ánh nhiều nhất" badge="28 lượt nhận" />
        <div className={styles.barChart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complaintData} layout="vertical" margin={{ top: 6, right: 22, bottom: 0, left: 12 }}>
              <CartesianGrid horizontal={false} stroke="var(--border-default)" strokeDasharray="3 3" />
              <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={138} axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
              <Tooltip cursor={{ fill: "var(--bg-muted)" }} content={<ChartTooltip />} /><Bar dataKey="value" fill="var(--color-primary)" radius={[0, 7, 7, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.cardFooter}><span><Info size={15} /> Hài lòng chung đạt 94,2%</span><button type="button">Xem phản ánh <ArrowRight size={15} /></button></div>
      </article>

      <article className={styles.chartCard}>
        <ChartHeader title="Xu hướng sự cố an toàn thực phẩm" subtitle="Số sự cố ghi nhận trong 6 tháng gần nhất" badge="Mục tiêu: 0" />
        <div className={styles.areaChart}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incidentData} margin={{ top: 16, right: 8, left: -24, bottom: 0 }}>
              <defs><linearGradient id="incidentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="var(--border-default)" strokeDasharray="4 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="incidents" stroke="var(--color-primary)" strokeWidth={3} fill="url(#incidentFill)" activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "var(--bg-surface)", strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.cardFooter}><span className={styles.goodTrend}><ArrowDownRight size={15} /> Giảm 4 điểm so với đỉnh tháng 8</span><button type="button">Xem báo cáo <ArrowRight size={15} /></button></div>
      </article>

      <article className={styles.chartCard}>
        <ChartHeader title="Tình trạng nhà cung cấp" subtitle="Quan hệ liên kết đã qua kiểm định" badge="16 đối tác" />
        <div className={styles.donutLayout}>
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={supplierData} dataKey="value" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} paddingAngle={2} stroke="none">{supplierData.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer>
            <DonutCenter total="75%" label="đạt chuẩn" />
          </div>
          <div className={styles.supplierSummary}>
            {supplierData.map(item => <div key={item.name}><i style={{ background: item.color }} /><span><b>{item.name}</b><small>{item.name === "Đang liên kết" ? "Đủ hồ sơ VSATTP" : "Không còn hiệu lực"}</small></span><strong>{String(item.value).padStart(2, "0")}</strong></div>)}
            <p><Info size={14} /> Đánh giá dựa trên hồ sơ và kỳ kiểm định gần nhất.</p>
          </div>
        </div>
        <div className={styles.cardFooter}><span>Kiểm định gần nhất: 24/10/2026</span><button type="button">Quản lý đối tác <ArrowRight size={15} /></button></div>
      </article>
    </section>
  )
}

ChartHeader.propTypes = { title: PropTypes.string.isRequired, subtitle: PropTypes.string.isRequired, badge: PropTypes.string.isRequired }
ChartTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, label: PropTypes.string }
DonutCenter.propTypes = { total: PropTypes.string.isRequired, label: PropTypes.string.isRequired }
AnalyticsGrid.propTypes = { period: PropTypes.string.isRequired }
export default AnalyticsGrid
