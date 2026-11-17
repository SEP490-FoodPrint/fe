import { formatLargeQuantity, formatLargeQuantityText } from "src/utils/quantity"
import { formatSmallQuantity, formatSmallQuantityText } from "src/utils/quantity"
import { batchSampleProgress } from "src/services/KitchenService/adapter";
import React, { useMemo } from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import {
  X,
  CookingPot,
  CheckCircle2,
  Flame,
  ShieldCheck,
  ArrowRight,
  FlaskConical,
} from "lucide-react";
import { batchDisplayName } from "../batchLabel";
import styles from "./CreateBatchDetailModal.module.scss";

const pad = (n) => String(n).padStart(2, "0");
const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : `${pad(d.getHours())}:${pad(d.getMinutes())} · ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const toLines = (rows = []) =>
  rows.map((row, idx) => ({
    id: row.id || idx,
    name: row.name || row.ingredientName || row.dishName || "Nguyên liệu",
    lotCode: row.lotCode || row.code || "",
    supplierName: row.supplierName || "",
    amount: row.quantity != null && row.quantity !== "" && Number.isFinite(Number(row.quantity))
      ? formatLargeQuantity(row.quantity, row.unit)
      : row.amount
        ? formatLargeQuantityText(row.amount)
        : "Theo định mức",
  }));

/**
 * Popup chi tiết lô chế biến cho 3 giai đoạn: Đang nấu, Đã nấu xong, Đã lưu mẫu.
 * Tên lô hiển thị dạng "Tên món (Lô n)", không hiển thị mã lô kỹ thuật.
 */
export default function CreateBatchDetailModal({
  open,
  onClose,
  dish,
  batch,
  item,
  onConfirmCreate,
  onCompleteCooking,
  onOpenSampleModal,
  submitting = false,
  onViewBatchDetail,
}) {
  const current = item || batch || dish;
  const isAfternoon = String(current?.mealType || "").toUpperCase() === "AFTERNOON";
  const portions = Number(current?.portionStandard ?? current?.plannedPortions ?? current?.portions ?? 0);
  const isCreated = Boolean(current?.isBatchCreated || current?.batchCode || current?.code || current?.status);
  const status = current?.status || (isCreated ? "UNCONFIRMED" : "PENDING");
  const hasSample = batchSampleProgress(current).complete;

  const stage = hasSample
    ? { key: "sampled", label: "Đã lưu mẫu", Icon: ShieldCheck }
    : status === "COMPLETED"
      ? { key: "cooked", label: "Đã nấu xong", Icon: CheckCircle2 }
      : status === "CONFIRMED"
        ? { key: "cooking", label: "Đang nấu", Icon: Flame }
        : { key: "pending", label: "Chưa nấu", Icon: CookingPot };

  const sample = useMemo(() => {
    if (!current) return null;
    return current.retainedFoodSamples?.at?.(-1) || current.retainedFoodSamples?.[0] || current.retainedFoodSample || null;
  }, [current]);

  const mainIngredients = useMemo(() => toLines(current?.ingredients || current?.cookingBatchLots || []), [current]);
  const seasonings = useMemo(() => toLines(current?.seasonings || current?.mealSeasonings || []), [current]);

  if (!current) return null;

  const timeline = [
    { label: "Bắt đầu nấu", value: formatTime(current.confirmedAt), done: Boolean(current.confirmedAt) || status === "CONFIRMED" || status === "COMPLETED" },
    { label: "Nấu xong", value: formatTime(current.completedAt), done: status === "COMPLETED" },
    { label: "Lưu mẫu", value: formatTime(sample?.sampledAt), done: hasSample },
  ];

  const renderLines = (title, rows, emptyText) => (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <span className={styles.sectionCount}>{rows.length} loại</span>
      </div>
      {rows.length === 0 ? (
        <p className={styles.emptyText}>{emptyText}</p>
      ) : (
        <table className={styles.lineTable}>
          <thead>
            <tr>
              <th scope="col">Nguyên liệu</th>
              <th scope="col">Nhà cung cấp</th>
              <th scope="col" className={styles.alignRight}>Lượng dùng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className={styles.lineName}>{row.name}</span>
                  <span className={styles.lineLot}>{row.lotCode || "Chờ xuất kho"}</span>
                </td>
                <td className={styles.lineSupplier}>{row.supplierName || "—"}</td>
                <td className={`${styles.lineAmount} ${styles.alignRight}`}>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  const StageIcon = stage.Icon;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="batch-detail-title"
      classes={{ paper: styles.dialogPaper }}
    >
      <header className={styles.header}>
        <span className={`${styles.headerIcon} ${styles[`icon_${stage.key}`]}`} aria-hidden="true">
          <StageIcon size={20} />
        </span>
        <div className={styles.headerText}>
          <h2 id="batch-detail-title" className={styles.title}>{batchDisplayName(current)}</h2>
          <div className={styles.chips}>
            <span className={`${styles.chip} ${isAfternoon ? styles.chipAfternoon : styles.chipLunch}`}>
              {isAfternoon ? "Bữa xế" : "Bữa trưa"}
            </span>
            <span className={styles.chip}>
              {Number.isFinite(portions) ? portions.toLocaleString("vi-VN") : 0} suất
            </span>
            <span className={`${styles.chip} ${styles[`stage_${stage.key}`]}`}>{stage.label}</span>
          </div>
        </div>
        <IconButton onClick={onClose} size="small" className={styles.closeBtn} aria-label="Đóng" disabled={submitting}>
          <X size={18} />
        </IconButton>
      </header>

      <DialogContent className={styles.content}>
        {isCreated && (
          <ol className={styles.timeline} aria-label="Tiến độ lô">
            {timeline.map((step) => (
              <li key={step.label} className={`${styles.step} ${step.done ? styles.stepDone : ""}`}>
                <span className={styles.stepDot} aria-hidden="true" />
                <span className={styles.stepLabel}>{step.label}</span>
                <span className={styles.stepValue}>{step.done ? step.value : "—"}</span>
              </li>
            ))}
          </ol>
        )}

        {hasSample && (
          <section className={styles.sampleCard}>
            <FlaskConical size={18} className={styles.sampleIcon} aria-hidden="true" />
            <dl className={styles.sampleGrid}>
              <div>
                <dt>Thời điểm lưu</dt>
                <dd>{formatDateTime(sample?.sampledAt)}</dd>
              </div>
              <div>
                <dt>Vị trí lưu</dt>
                <dd>{sample?.storageLocation || "Chưa cập nhật"}</dd>
              </div>
              <div>
                <dt>Lượng mẫu</dt>
                <dd>{sample?.quantity ? formatSmallQuantity(sample.quantity, sample.unit || "g") : "—"}</dd>
              </div>
            </dl>
          </section>
        )}

        {renderLines("Nguyên liệu chính", mainIngredients, "Chưa có thông tin nguyên liệu phân bổ.")}
        {seasonings.length > 0 && renderLines(`Gia vị (${portions.toLocaleString("vi-VN")} suất)`, seasonings, "")}
      </DialogContent>

      <footer className={styles.footer}>
        <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={submitting}>
          Đóng
        </button>
        {!isCreated && onConfirmCreate ? (
          <button type="button" className={styles.primaryBtn} onClick={() => onConfirmCreate(current)} disabled={submitting}>
            <CookingPot size={16} />
            <span>{submitting ? "Đang xử lý..." : "Nấu"}</span>
          </button>
        ) : status === "CONFIRMED" && onCompleteCooking ? (
          <button type="button" className={styles.primaryBtn} onClick={() => onCompleteCooking(current)} disabled={submitting}>
            <CheckCircle2 size={16} />
            <span>{submitting ? "Đang xử lý..." : "Nấu xong"}</span>
          </button>
        ) : status === "COMPLETED" && !hasSample && onOpenSampleModal ? (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              onClose?.();
              onOpenSampleModal(current);
            }}
          >
            <FlaskConical size={16} />
            <span>Lưu mẫu</span>
          </button>
        ) : (
          onViewBatchDetail && (
            <button type="button" className={styles.linkBtn} onClick={() => onViewBatchDetail(current)}>
              <span>Xem trang đầy đủ</span>
              <ArrowRight size={15} />
            </button>
          )
        )}
      </footer>
    </Dialog>
  );
}
