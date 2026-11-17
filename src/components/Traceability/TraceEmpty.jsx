import React from "react"
import PropTypes from "prop-types"
import { CircularProgress } from "@mui/material"
import { Route, TriangleAlert } from "lucide-react"
import styles from "./TraceEmpty.module.scss"

export default function TraceEmpty({ loading = false, error = "" }) {
  if (loading)
    return (
      <div className={styles.box}>
        <CircularProgress size={28} />
        <p className={styles.text}>Đang dựng hành trình bữa ăn…</p>
      </div>
    )
  if (error)
    return (
      <div className={`${styles.box} ${styles.error}`} role="alert">
        <TriangleAlert size={28} aria-hidden />
        <p className={styles.text}>{error}</p>
      </div>
    )
  return (
    <div className={styles.box}>
      <span className={styles.icon}><Route size={28} aria-hidden /></span>
      <p className={styles.title}>Chọn một bữa ăn để bắt đầu</p>
      <p className={styles.text}>Hành trình sẽ hiện từng chặng: nhà cung cấp xuất hàng, trường kiểm nhận, bếp nấu, lưu mẫu và phát cho khối.</p>
    </div>
  )
}

TraceEmpty.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
}
