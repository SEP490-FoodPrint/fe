import React from "react"
import { Button, Chip } from "@mui/material"
import { ArrowRight, BellRing, CalendarClock, CircleAlert, ShieldCheck } from "lucide-react"
import styles from "./AttentionPanel.module.scss"

const menus = [
  { week: "Tuần 44", date: "02/11 – 06/11", status: "Chờ duyệt", tone: "warning" },
  { week: "Tuần 45", date: "09/11 – 13/11", status: "Bản nháp", tone: "neutral" },
  { week: "Tuần 43", date: "26/10 – 30/10", status: "Cần chỉnh sửa", tone: "error" },
]
const alerts = [
  { type: "Khẩn", title: "Phản ánh dị ứng hải sản lớp 3A1", time: "10 phút trước", tone: "error" },
  { type: "Kiểm định", title: "Hồ sơ VSATTP của CP Foods sắp hết hạn", time: "Hết hạn sau 5 ngày", tone: "warning" },
  { type: "Hoàn tất", title: "Đối soát suất ăn ngày 26/10 đã hoàn thành", time: "08:15 hôm nay", tone: "success" },
]

function AttentionPanel() {
  return (
    <section className={styles.grid}>
      <article className={styles.panel}>
        <div className={styles.heading}><div><CalendarClock size={19} /><span><h2>Thực đơn cần thẩm định</h2><p>Các tuần đang chờ Ban Giám hiệu xử lý</p></span></div><Chip label="3 hồ sơ" size="small" /></div>
        <div className={styles.menuList}>{menus.map(menu => <div key={menu.week}><span><b>{menu.week}</b><small>{menu.date}</small></span><Chip className={styles[menu.tone]} label={menu.status} size="small" /><Button endIcon={<ArrowRight size={14} />}>Xem</Button></div>)}</div>
      </article>
      <article className={styles.panel}>
        <div className={styles.heading}><div><BellRing size={19} /><span><h2>Cần Ban Giám hiệu chú ý</h2><p>Cảnh báo mới và công việc có thời hạn</p></span></div><span className={styles.liveDot}>Đang cập nhật</span></div>
        <div className={styles.alertList}>{alerts.map(alert => <div key={alert.title} className={styles[alert.tone]}>{alert.tone === "success" ? <ShieldCheck size={18} /> : <CircleAlert size={18} />}<span><b>{alert.title}</b><small>{alert.type} · {alert.time}</small></span><ArrowRight size={16} /></div>)}</div>
      </article>
    </section>
  )
}

export default AttentionPanel
