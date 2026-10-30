import React from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { CalendarDays, Download, School } from "lucide-react"
import styles from "./OverviewHeader.module.scss"

const periods = [
  { value: "7", label: "7 ngày" },
  { value: "30", label: "30 ngày" },
  { value: "90", label: "90 ngày" },
]

function OverviewHeader({ period, onPeriodChange }) {
  return (
    <section className={styles.header}>
      <div className={styles.headingGroup}>
        <div className={styles.eyebrow}><School size={15} /> Ban Giám hiệu · Trường Tiểu học Cầu Giấy</div>
        <h1>Tổng quan vận hành bán trú</h1>
        <p>Theo dõi thực đơn, phản ánh, nhà cung cấp và an toàn thực phẩm trên một màn hình.</p>
        <div className={styles.updatedAt}><CalendarDays size={14} /> Cập nhật lúc 08:30, 27/10/2026</div>
      </div>
      <div className={styles.actions}>
        <div className={styles.periodPicker} aria-label="Chọn khoảng thời gian">
          {periods.map(item => (
            <button type="button" key={item.value} className={period === item.value ? styles.activePeriod : ""} onClick={() => onPeriodChange(item.value)}>
              {item.label}
            </button>
          ))}
        </div>
        <Button className={styles.exportButton} startIcon={<Download size={17} />}>Xuất báo cáo</Button>
      </div>
    </section>
  )
}

OverviewHeader.propTypes = { period: PropTypes.string.isRequired, onPeriodChange: PropTypes.func.isRequired }
export default OverviewHeader
