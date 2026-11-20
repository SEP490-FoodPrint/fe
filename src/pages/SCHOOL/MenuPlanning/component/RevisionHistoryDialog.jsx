import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import MenuService from "src/services/MenuService"
import styles from "./RevisionHistoryDialog.module.scss"

const formatDateTime = (iso) => {
  if (!iso) return "--"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso))
}

/** Popup: toàn bộ các lần BGH yêu cầu chỉnh sửa của một thực đơn tuần, kèm thời gian nhận xét. */
export default function RevisionHistoryDialog({ open, menuId, title, dayLabels = {}, onClose }) {
  const [state, setState] = useState({ loading: false, error: "", items: [] })
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!open || !menuId) return undefined
    let active = true
    setState({ loading: true, error: "", items: [] })
    MenuService.getRevisionReviewHistory(menuId)
      .then((items) => { if (active) setState({ loading: false, error: "", items }) })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message || "Không tải được nhận xét của Ban Giám hiệu.", items: [] })
      })
    return () => { active = false }
  }, [open, menuId, retry])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Yêu cầu chỉnh sửa của BGH
        {title && <span className={styles.subtitle}>{title}</span>}
      </DialogTitle>
      <DialogContent dividers>
        {state.loading ? (
          <div className={styles.loading} role="status"><FoodPrintLoading /></div>
        ) : state.error ? (
          <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => setRetry((value) => value + 1)}>Thử lại</Button>}>
            {state.error}
          </Alert>
        ) : !state.items.length ? (
          <p className={styles.empty}>Thực đơn này chưa có yêu cầu chỉnh sửa nào từ Ban Giám hiệu.</p>
        ) : (
          <ol className={styles.list}>
            {state.items.map((item, index) => (
              <li key={item.id} className={`${styles.item} ${index === 0 ? styles.latest : ""}`}>
                <div className={styles.meta}>
                  <span className={styles.time}>{formatDateTime(item.reviewedAt)}</span>
                  {item.reviewer?.fullName && <span className={styles.reviewer}>{item.reviewer.fullName}</span>}
                  {item.menuDayId && dayLabels[item.menuDayId] && (
                    <span className={styles.dayTag}>{dayLabels[item.menuDayId]}</span>
                  )}
                  {index === 0 && <span className={styles.latestTag}>Mới nhất</span>}
                </div>
                <p className={styles.feedback}>{item.feedback || "Ban Giám hiệu không ghi lý do."}</p>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

RevisionHistoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  menuId: PropTypes.string,
  title: PropTypes.string,
  dayLabels: PropTypes.object,
  onClose: PropTypes.func.isRequired,
}
