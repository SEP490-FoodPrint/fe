import React from "react"
import { Link } from "react-router-dom"
import { Card, Typography } from "@mui/material"
import {
  UtensilsCrossed,
  ConciergeBell,
  FlaskConical,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./QuickAccessCards.module.scss"

// Xếp theo trình tự làm việc trong ngày của bếp.
const LINKS = [
  {
    title: "Kiểm tra nguyên liệu",
    desc: "Nhận hàng và ký duyệt",
    icon: ClipboardCheck,
    route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
  },
  {
    title: "Chế biến",
    desc: "Lập lô và theo dõi nấu",
    icon: UtensilsCrossed,
    route: ROUTER.SCHOOL_KITCHEN_BATCHES,
  },
  {
    title: "Lưu mẫu thức ăn",
    desc: "Ghi nhận và tiêu hủy mẫu",
    icon: FlaskConical,
    route: ROUTER.SCHOOL_KITCHEN_SAMPLES,
  },
  {
    title: "Phân bổ suất ăn",
    desc: "Chia suất cho từng lớp",
    icon: ConciergeBell,
    route: ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION,
  },
]

function QuickAccessCards() {
  return (
    <Card
      component="nav"
      className={styles.card}
      aria-label="Truy cập nhanh nghiệp vụ Bếp"
    >
      <Typography component="h2" className={styles.heading}>
        Truy cập nhanh
      </Typography>
      <div className={styles.links}>
        {LINKS.map(({ title, desc, icon: Icon, route }) => (
          <Link key={route} to={route} className={styles.link}>
            <span className={styles.iconBox} aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className={styles.text}>
              <span className={styles.title}>{title}</span>
              <span className={styles.desc}>{desc}</span>
            </span>
            <ChevronRight className={styles.arrow} size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Card>
  )
}

export default QuickAccessCards
