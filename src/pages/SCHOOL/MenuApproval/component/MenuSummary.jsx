import React from "react"
import PropTypes from "prop-types"
import { Card, Typography } from "@mui/material"
import {
  CalendarDays,
  ClipboardList,
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
  supplier: "Nhà cung cấp nguyên liệu",
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
                  {key !== "supplier" && menu.summary[`${key}Detail`] && (
                    <Typography component="p" className={styles.itemDetail}>
                      {menu.summary[`${key}Detail`]}
                    </Typography>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

    </section>
  )
}

MenuSummary.propTypes = { menu: PropTypes.object.isRequired }

export default MenuSummary
