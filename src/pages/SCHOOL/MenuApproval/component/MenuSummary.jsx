import React from "react"
import PropTypes from "prop-types"
import { Card, Typography } from "@mui/material"
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  ShieldAlert,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react"
import styles from "./MenuSummary.module.scss"

const SUMMARY_ICONS = {
  audience: Users,
  servingPeriod: CalendarDays,
  proposer: UtensilsCrossed,
  supplier: Truck,
}

const SUMMARY_LABELS = {
  audience: "Khối lớp áp dụng",
  servingPeriod: "Thời gian phục vụ",
  proposer: "Đơn vị đề xuất",
  supplier: "Nhà cung cấp chính",
}

function MenuSummary({ menu }) {
  const summaryItems = ["audience", "servingPeriod", "proposer", "supplier"]

  return (
    <section className={styles.grid} aria-label="Tổng quan hồ sơ thực đơn">
      <Card className={styles.primaryCard} elevation={0}>
        <div className={styles.cardHeading}>
          <span className={styles.headingIcon}><ClipboardList size={21} /></span>
          <div>
            <Typography component="p" className={styles.eyebrow}>Hồ sơ thẩm định</Typography>
            <Typography component="h2" className={styles.title}>{menu.title}</Typography>
          </div>
          <span className={styles.supplyBadge}>
            <CheckCircle2 size={15} /> Chuỗi cung ứng khép kín
          </span>
        </div>

        <div className={styles.summaryList}>
          {summaryItems.map(key => {
            const Icon = SUMMARY_ICONS[key]
            return (
              <div className={styles.summaryItem} key={key}>
                <span className={styles.summaryIcon}><Icon size={19} /></span>
                <div>
                  <Typography component="p" className={styles.itemLabel}>
                    {SUMMARY_LABELS[key]}
                  </Typography>
                  <Typography component="p" className={styles.itemValue}>
                    {menu.summary[key]}
                  </Typography>
                  <Typography component="p" className={styles.itemDetail}>
                    {menu.summary[`${key}Detail`]}
                  </Typography>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className={styles.complianceCard} elevation={0}>
        <div className={styles.complianceHeading}>
          <span className={styles.headingIcon}><GraduationCap size={20} /></span>
          <div>
            <Typography component="h2" className={styles.sideTitle}>
              Tình trạng hồ sơ & Giám sát
            </Typography>
            <Typography className={styles.sideSubtitle}>Bộ tiêu chí quản trị BGH</Typography>
          </div>
        </div>

        <div className={styles.complianceList}>
          {menu.compliance.map(item => (
            <div className={styles.complianceItem} key={item.id}>
              <span className={`${styles.stateIcon} ${styles[item.tone]}`}>
                {item.tone === "warning" ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
              </span>
              <div>
                <Typography component="p" className={styles.complianceTitle}>
                  {item.title}
                </Typography>
                <Typography component="p" className={styles.complianceDetail}>
                  {item.detail}
                </Typography>
              </div>
            </div>
          ))}
        </div>
        <Typography className={styles.submittedAt}>
          Gửi đề xuất: <strong>{menu.submittedAt}</strong>
        </Typography>
      </Card>
    </section>
  )
}

MenuSummary.propTypes = { menu: PropTypes.object.isRequired }

export default MenuSummary
