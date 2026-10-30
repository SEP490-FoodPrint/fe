import React from "react"
import { BarChart3 } from "lucide-react"
import styles from "./OverviewEmptyState.module.scss"

function OverviewEmptyState() {
  return (
    <section className={styles.emptyState} aria-labelledby="overview-empty-title">
      <span className={styles.icon}><BarChart3 size={28} /></span>
      <h2 id="overview-empty-title">Chưa có dữ liệu tổng quan</h2>
      <p>
        Các chỉ số và biểu đồ sẽ hiển thị khi hệ thống có API tổng hợp dữ liệu
        thực đơn, phản ánh, sự cố an toàn thực phẩm và nhà cung cấp.
      </p>
    </section>
  )
}

export default OverviewEmptyState
