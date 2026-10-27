import React from "react"
import PropTypes from "prop-types"
import { Card, Chip, Typography } from "@mui/material"
import { Bell, ChartSpline, QrCode, ShieldCheck, Truck } from "lucide-react"
import styles from "./FeatureOverview.module.scss"

const ICONS = {
  supplier: Truck,
  safety: ShieldCheck,
  traceability: QrCode,
  report: ChartSpline,
  notification: Bell,
}

function FeatureOverview({ title, description, type }) {
  const Icon = ICONS[type] || ChartSpline
  return (
    <Card className={styles.card} elevation={0}>
      <div className={styles.icon}><Icon size={28} /></div>
      <Chip label="Ban Giám hiệu" size="small" className={styles.roleChip} />
      <Typography component="h1" className={styles.title}>{title}</Typography>
      <Typography className={styles.description}>{description}</Typography>
      <div className={styles.placeholder}>Nội dung nghiệp vụ sẽ được triển khai ở giai đoạn tiếp theo.</div>
    </Card>
  )
}

FeatureOverview.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export default FeatureOverview
