import { formatAllocationDecimal as fmt } from "src/utils/allocationDecimal";
import React from "react";
import { Button, ButtonBase, Chip, Collapse, IconButton } from "@mui/material";
import { ChevronDown, Package, Plus, X } from "lucide-react";
import styles from "./BatchAllocationPanel.module.scss";

export default function BatchAllocationPanel({
  batch,
  expanded,
  readOnly = false,
  canAddClasses,
  onToggle,
  onAddClasses,
  onRemoveClass,
}) {
  const contentId = `batch-classes-${batch.scopeKey || batch.id}`;
  const entries = batch.entries || [];
  const hasEntries = entries.length > 0;
  const isAuto = Boolean(batch.autoAssigned);
  const isMaterial = batch.allocationVersion === 2;

  // Chỉ một bộ nhãn mức suất của lô; trạng thái bản (nháp / đã áp dụng) hiển thị ở đầu trang.
  const filled = isAuto || (batch.gradeScoped ? Number(batch.gradeRemainingPortions) === 0 : batch.remaining === 0);
  const status = !hasEntries
    ? { label: "Chưa phân lô", color: "default" }
    : filled
    ? { label: "Đủ suất", color: "success" }
    : { label: "Đang phân bổ", color: "warning" };

  const availability = isMaterial
    ? batch.materialPreview && batch.materialAvailablePortions != null
      ? `Sau phương án còn ${fmt(batch.materialAvailablePortions)} suất quy đổi cho khối này`
      : `${batch.materialPreview ? "Dự kiến cấp" : "Đã cấp"} ${fmt(batch.allocated)} suất quy đổi cho khối này`
    : batch.gradeScoped
    ? `Đã cấp ${fmt(batch.allocatedForGrade)} suất cho khối · Lô còn ${fmt(batch.sharedRemaining)} suất dùng chung`
    : isAuto || batch.remaining === 0
    ? `Lô đã phân bổ hết (0/${batch.total} suất còn lại)`
    : hasEntries
    ? `Lô còn ${batch.remaining}/${batch.total} suất`
    : `Lô còn nguyên ${batch.total} suất`;

  return (
    <section className={styles.panel} data-expanded={expanded} data-preview={batch.materialPreview || undefined}>
      <ButtonBase
        className={styles.batch}
        aria-label={batch.gradeScoped ? `${batch.name}, ${batch.materialPreview ? "dự kiến cấp" : "đã cấp"} ${fmt(batch.allocatedForGrade)} trên ${fmt(batch.gradeRequiredPortions)} suất khối cần` : `${batch.name}, ${batch.remaining} trên ${batch.total} suất khả dụng`}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span className={styles.batchIcon} data-status={status.color}>
          <Package size={16} />
        </span>
        <span className={styles.batchInfo}>
          <span className={styles.batchTitle}>
            <strong>{batch.name}</strong>
            <Chip component="span" size="small" label={status.label} color={status.color} variant="outlined" />
          </span>
        </span>
        <span className={styles.counter}>
          <span>{isMaterial ? (batch.materialPreview ? "Suất dự kiến cấp" : "Suất cấp cho khối") : batch.gradeScoped ? "Đã cấp / Cần" : hasEntries ? "Suất khả dụng / Tổng" : "Khả dụng"}</span>
          <strong>
            {isMaterial ? fmt(batch.allocatedForGrade ?? batch.allocated) : batch.gradeScoped ? <><b>{fmt(batch.allocatedForGrade)}</b> / {fmt(batch.gradeRequiredPortions)}</> : hasEntries ? (
              <>
                <b>{fmt(batch.remaining)}</b> / {fmt(batch.total)}
              </>
            ) : (
              <>
                {batch.total} <small>suất</small>
              </>
            )}
          </strong>
        </span>
        <span className={styles.chevron}>
          <ChevronDown size={16} />
        </span>
      </ButtonBase>

      <Collapse in={expanded} id={contentId}>
        <div className={styles.content}>
          <div className={styles.caption}>
            <strong>{hasEntries ? `Danh sách lớp ${batch.materialPreview ? "dự kiến nhận" : "đã nhận"} suất từ ${batch.name}:` : "Danh sách lớp:"}</strong>
            <span>{availability}</span>
          </div>
          <div className={styles.seats}>
            {hasEntries ? (
              <ul className={styles.classes} aria-label={`Các lớp trong ${batch.name}`}>
                {entries.map((entry) => (
                  <li key={entry.id || entry.dailyMealPortionId} className={styles.seat} data-partial={entry.remaining > 0}>
                    <strong>{entry.name || entry.className}</strong>
                    <span>·</span>
                    <b>{fmt(entry.portions ?? entry.allocatedPortions)}</b>
                    {entry.total > 0 && Number(entry.portions ?? entry.allocatedPortions) < Number(entry.total) && (
                      <span> / {entry.total}</span>
                    )}
                    {entry.locked || isAuto || readOnly ? null : (
                      <IconButton
                        className={styles.removeButton}
                        size="small"
                        aria-label={`Bỏ lớp ${entry.name || entry.className} khỏi ${batch.name}`}
                        onClick={() => onRemoveClass(entry.id || entry.dailyMealPortionId)}
                      >
                        <X size={16} />
                      </IconButton>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>Chưa có lớp nào được phân từ lô này.</p>
            )}

            {!isAuto && !readOnly && (
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
            )}
          </div>
        </div>
      </Collapse>
    </section>
  );
}
