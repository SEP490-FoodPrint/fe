import React from "react"
import { School } from "lucide-react"
import styles from "./OverviewHeader.module.scss"

function OverviewHeader() {
  return (
    <section className={styles.header}>
      <div className={styles.headingGroup}>
        <div className={styles.eyebrow}><School size={15} /> Ban Giám hiệu</div>
        <h1>Tổng quan vận hành bán trú</h1>
        <p>Theo dõi thực đơn, phản ánh, nhà cung cấp và an toàn thực phẩm từ dữ liệu vận hành của trường.</p>
      </div>
    </section>
  )
}

export default OverviewHeader
