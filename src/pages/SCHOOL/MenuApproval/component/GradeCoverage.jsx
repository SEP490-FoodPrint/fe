import React from "react"
import PropTypes from "prop-types"
import { Alert, Card, Chip, Typography } from "@mui/material"
import { Layers } from "lucide-react"
import styles from "./GradeCoverage.module.scss"

const formatNumber = value => new Intl.NumberFormat("vi-VN").format(value || 0)

const gradeStatus = grade => {
  if (grade.inThisMenu) return { label: "Thực đơn này", color: "success" }
  if (grade.hasMenuThisWeek) return { label: "Thực đơn khác", color: "default" }
  if (grade.activeClasses > 0) return { label: "Chưa có thực đơn", color: "warning" }
  return { label: "Không có lớp", color: "default" }
}

function GradeCoverage({ coverage }) {
  if (!coverage) return null
  const { grades = [], warnings = [], academicYear } = coverage

  return (
    <Card className={styles.card} elevation={0} aria-label="Chi tiết theo khối">
      <div className={styles.heading}>
        <span className={styles.icon}><Layers size={20} /></span>
        <div>
          <Typography component="h2" className={styles.title}>Chi tiết theo khối</Typography>
          <Typography className={styles.subtitle}>
            Lớp đang hoạt động năm học {academicYear} · suất đã chốt trong tuần
          </Typography>
        </div>
      </div>

      {warnings.map(warning => (
        <Alert key={warning} severity="warning" className={styles.alert}>{warning}</Alert>
      ))}

      {grades.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khối</th>
                <th className={styles.number}>Số lớp</th>
                <th className={styles.number}>Suất đã chốt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(grade => {
                const status = gradeStatus(grade)
                return (
                  <tr key={grade.id} className={grade.inThisMenu ? "" : styles.muted}>
                    <td>{grade.name}</td>
                    <td className={styles.number}>{formatNumber(grade.activeClasses)}</td>
                    <td className={styles.number}>{formatNumber(grade.portions)}</td>
                    <td><Chip size="small" label={status.label} color={status.color} variant="outlined" /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Typography className={styles.empty}>Trường chưa khai báo khối học.</Typography>
      )}
    </Card>
  )
}

GradeCoverage.propTypes = {
  coverage: PropTypes.shape({
    academicYear: PropTypes.string,
    grades: PropTypes.arrayOf(PropTypes.object),
    unassignedActiveClasses: PropTypes.number,
    warnings: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default GradeCoverage
