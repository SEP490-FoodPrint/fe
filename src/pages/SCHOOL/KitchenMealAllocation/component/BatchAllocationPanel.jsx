import React from "react"
import { Button, ButtonBase, Chip, Collapse, IconButton } from "@mui/material"
import { ChevronDown, Package, Plus, X } from "lucide-react"
import styles from "./BatchAllocationPanel.module.scss"

export default function BatchAllocationPanel({ batch, expanded, canAddClasses, onToggle, onAddClasses, onRemoveClass }) {
  const contentId = `batch-classes-${batch.id}`
  const hasEntries = batch.entries.length > 0
  const status = !hasEntries
    ? { label: "Chưa phân lô", color: "default" }
    : batch.remaining === 0
      ? { label: "Đã phân lô", color: "success" }
      : { label: "Đang phân bổ", color: "warning" }
  const availability = batch.remaining === 0
    ? `Lô đã phân bổ hết (0/${batch.total} suất còn lại)`
    : hasEntries
      ? `Lô còn ${batch.remaining}/${batch.total} suất`
      : `Lô còn nguyên ${batch.total} suất`

  return (
    <section className={styles.panel} data-expanded={expanded}>
      <ButtonBase
        className={styles.batch}
        aria-label={`${batch.name}, ${batch.remaining} trên ${batch.total} suất khả dụng`}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span className={styles.batchIcon} data-status={status.color}><Package size={16} /></span>
        <span className={styles.batchInfo}>
          <span className={styles.batchTitle}>
            <strong>{batch.name}</strong>
            <Chip component="span" size="small" label={status.label} color={status.color} variant="outlined" />
          </span>
        </span>
        <span className={styles.counter}>
          <span>{hasEntries ? "Suất khả dụng / Tổng" : "Khả dụng"}</span>
          <strong>
            {hasEntries ? <><b>{batch.remaining}</b> / {batch.total}</> : <>{batch.total} <small>suất</small></>}
          </strong>
        </span>
        <span className={styles.chevron}><ChevronDown size={16} /></span>
      </ButtonBase>

      <Collapse in={expanded} id={contentId}>
        <div className={styles.content}>
          <div className={styles.caption}>
            <strong>{hasEntries ? `Danh sách lớp đã nhận suất từ ${batch.name}:` : "Danh sách lớp:"}</strong>
            <span>{availability}</span>
          </div>
          <div className={styles.seats}>
            {hasEntries ? (
              <ul className={styles.classes} aria-label={`Các lớp trong ${batch.name}`}>
                {batch.entries.map(entry => (
                  <li key={entry.id} className={styles.seat} data-partial={entry.remaining > 0}>
                    <strong>{entry.name}</strong>
                    <span>·</span>
                    <b>{entry.portions}</b>
                    {entry.portions < entry.total && <span> / {entry.total}</span>}
                    {entry.locked ? <span>Đã khóa</span> : <IconButton
                      className={styles.removeButton}
                      size="small"
                      aria-label={`Bỏ lớp ${entry.name} khỏi ${batch.name}`}
                      onClick={() => onRemoveClass(entry.id)}
                    >
                      <X size={16} />
                    </IconButton>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>Chưa có lớp nào được phân từ lô này.</p>
            )}
            <Button
              className={styles.addButton}
              variant="outlined"
              aria-label={hasEntries ? `Chỉnh sửa phân bổ ${batch.name}` : `Thêm lớp vào ${batch.name}`}
              disabled={!canAddClasses}
              onClick={onAddClasses}
            >
              <Plus size={16} />
              <span>{hasEntries ? "Chỉnh sửa / Thêm lớp" : "Phân bổ lớp"}</span>
            </Button>
          </div>
        </div>
      </Collapse>
    </section>
  )
}
