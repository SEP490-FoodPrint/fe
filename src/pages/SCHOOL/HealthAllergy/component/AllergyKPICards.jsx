import React from "react"
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined"
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined"
import SetMealOutlinedIcon from "@mui/icons-material/SetMealOutlined"
import styles from "./AllergyKPICards.module.scss"

export default function AllergyKPICards({ stats }) {
  const cards = [
    {
      id: "total-students",
      label: "Học sinh có thông tin dị ứng",
      value: `${stats.totalStudents || 0}`,
      unit: "học sinh",
      meta: "Do các GVCN thu thập từ phụ huynh",
      icon: <PeopleAltOutlinedIcon className={styles.icon} />,
      variant: "primary",
    },
    {
      id: "total-classes",
      label: "Số Lớp ghi nhận dị ứng",
      value: `${stats.totalClasses || 0}`,
      unit: "lớp học",
      meta: "Có học sinh cần lưu ý bữa ăn",
      icon: <ClassOutlinedIcon className={styles.icon} />,
      variant: "info",
    },
    {
      id: "high-severity",
      label: "Dị ứng nặng / Cần theo dõi sát",
      value: `${stats.highSeverityCount || 0}`,
      unit: "trường hợp",
      meta: "Tiền sử mề đay cấp, phù môi hoặc khó thở",
      icon: <WarningAmberOutlinedIcon className={styles.icon} />,
      variant: "danger",
    },
    {
      id: "top-allergen",
      label: "Nhóm dị nguyên nhiều nhất",
      value: stats.topAllergens?.[0]?.category || "Thủy hải sản",
      unit: `(${stats.topAllergens?.[0]?.count || 0} học sinh)`,
      meta: "Chủ yếu là tôm biển, cua đồng, ghẹ",
      icon: <SetMealOutlinedIcon className={styles.icon} />,
      variant: "warning",
    },
  ]

  return (
    <section aria-label="Thống kê dị ứng học sinh" className={styles.kpiGrid}>
      {cards.map((card) => (
        <div key={card.id} className={`${styles.kpiCard} ${styles[card.variant]}`}>
          <div className={styles.topContent}>
            <span className={styles.cardLabel}>{card.label}</span>
            <div className={styles.iconWrapper}>{card.icon}</div>
          </div>

          <div className={styles.valueRow}>
            <span className={styles.mainValue}>{card.value}</span>
            {card.unit && <span className={styles.unitText}>{card.unit}</span>}
          </div>

          <div className={styles.footerRow}>
            <span className={styles.metaText}>{card.meta}</span>
          </div>
        </div>
      ))}
    </section>
  )
}
