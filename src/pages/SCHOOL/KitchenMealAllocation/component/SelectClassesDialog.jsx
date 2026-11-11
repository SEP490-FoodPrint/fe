import React, { useState } from "react"
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress } from "@mui/material"
import { ArrowDown, ArrowUp, Check, LockKeyhole, X } from "lucide-react"
import { formatRemainingPortions, previewBatchAllocation } from "src/utils/mealAllocation"
import styles from "./SelectClassesDialog.module.scss"

export default function SelectClassesDialog({ batch, classes, onClose, onApply }) {
  const [orderedIds, setOrderedIds] = useState(() => batch.entries.map(entry => entry.id))
  const preview = previewBatchAllocation(batch.total, classes, orderedIds)
  const used = batch.total - preview.remaining
  const full = preview.remaining === 0

  const toggleClass = id => {
    setOrderedIds(current => {
      if (current.includes(id)) return current.filter(item => item !== id)
      if (previewBatchAllocation(batch.total, classes, current).remaining === 0) return current
      return [...current, id]
    })
  }

  const moveClass = (index, offset) => {
    const reordered = [...orderedIds]
    const [id] = reordered.splice(index, 1)
    reordered.splice(index + offset, 0, id)
    const { entries } = previewBatchAllocation(batch.total, classes, reordered)
    setOrderedIds(entries.map(entry => entry.id))
  }

  return (
    <Dialog
      open
      fullWidth
      maxWidth={false}
      onClose={onClose}
      aria-labelledby="select-classes-title"
      slotProps={{ paper: { className: styles.paper } }}
    >
      <DialogTitle component="div" className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h2 id="select-classes-title">Phân bổ lớp vào {batch.name}</h2>
          </div>
          <div className={styles.subheading}>
            <span>Số suất khả dụng của lô: <strong>{batch.total}</strong></span>
            <span>Dung lượng đã dùng: <strong>{used}/{batch.total}</strong></span>
          </div>
        </div>
        <IconButton className={styles.action} aria-label="Đóng modal" onClick={onClose}><X size={18} /></IconButton>
      </DialogTitle>

      <DialogContent dividers className={styles.content}>
        <section aria-labelledby="available-classes-heading">
          <div className={styles.sectionHeading}>
            <div>
              <h3 id="available-classes-heading">1. Chọn lớp</h3>
              <p>Chọn các lớp cần nhận suất từ lô này.</p>
            </div>
            {full && <Chip size="small" color="success" variant="outlined" label={`Đã đạt giới hạn ${used}/${batch.total} suất`} />}
          </div>
          <div className={styles.seats}>
            {classes.map(item => {
              const selected = orderedIds.includes(item.id)
              const quantity = formatRemainingPortions(item)
              return (
                <Button
                  key={item.id}
                  className={styles.seat}
                  variant="outlined"
                  aria-label={`Lớp ${item.name}, ${quantity} suất`}
                  aria-pressed={selected}
                  disabled={!selected && full}
                  onClick={() => toggleClass(item.id)}
                >
                  {selected && <Check size={14} />}
                  {!selected && full && <LockKeyhole size={13} />}
                  <strong>{item.name}</strong><span>·</span><span>{quantity} suất</span>
                </Button>
              )
            })}
          </div>
          <div className={styles.legend}>
            <span>Khả dụng</span><span>Đang chọn</span><span>Khóa (hết dung lượng lô)</span>
          </div>
        </section>

        <section aria-labelledby="class-order-heading">
          <div className={styles.sectionHeading}>
            <div>
              <h3 id="class-order-heading">2. Thứ tự phân bổ</h3>
              <p>Phân từ trên xuống. Lớp cuối nhận phần suất còn lại.</p>
            </div>
            <strong>Dùng nút ↑ ↓ để đổi ưu tiên</strong>
          </div>
          {preview.entries.length > 0 ? (
            <ol className={styles.queue} aria-label="Thứ tự lớp đã chọn">
              {preview.entries.map((entry, index) => (
                <li key={entry.id} className={styles.orderCard}>
                  <span className={styles.position}>{index + 1}</span>
                  <strong>{entry.name}</strong>
                  <span className={styles.quantity} data-partial={entry.remaining > 0}>
                    <b>{entry.portions}</b> suất
                    {entry.remaining > 0 && <small>Còn thiếu {entry.remaining}</small>}
                  </span>
                  <div className={styles.orderActions}>
                    <IconButton className={styles.action} aria-label={`Đưa lớp ${entry.name} lên`} disabled={index === 0} onClick={() => moveClass(index, -1)}>
                      <ArrowUp size={16} />
                    </IconButton>
                    <IconButton className={styles.action} aria-label={`Đưa lớp ${entry.name} xuống`} disabled={index === preview.entries.length - 1} onClick={() => moveClass(index, 1)}>
                      <ArrowDown size={16} />
                    </IconButton>
                    <IconButton className={styles.action} aria-label={`Bỏ lớp ${entry.name}`} onClick={() => toggleClass(entry.id)}>
                      <X size={16} />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>Chưa chọn lớp.</p>
          )}
        </section>

        <div className={styles.capacity}>
          <div>
            <span><strong>Tổng dung lượng lô:</strong> {batch.total} suất</span>
            <strong aria-live="polite">Đã phân: {used} / {batch.total} (Còn lại {preview.remaining} suất)</strong>
          </div>
          <LinearProgress variant="determinate" value={batch.total ? used / batch.total * 100 : 0} aria-label="Dung lượng phân bổ" />
          <div>
            <span>{full ? "Đã sử dụng hết số suất khả dụng của lô này" : `Còn ${preview.remaining} suất có thể phân bổ`}</span>
            <span>Khẩu phần chuẩn: 01 suất / học sinh</span>
          </div>
        </div>
      </DialogContent>

      <DialogActions className={styles.footer}>
        <span>Thao tác xem trước được cập nhật ngay lập tức.</span>
        <div>
          <Button variant="outlined" onClick={onClose}>Hủy</Button>
          <Button variant="contained" startIcon={<Check size={16} />} disabled={!preview.entries.length && !batch.entries.length} onClick={() => onApply(orderedIds)}>
            Xong
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}
