import React, { useState, useEffect } from "react";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SampleStorageService from "src/services/SampleStorageService";
import InlineError from "src/components/InlineError";
import { formatSmallQuantity } from "src/utils/quantity";
import styles from "./StorageDetailModal.module.scss";

const STATUS = {
  ACTIVE: { label: "Đang hoạt động", tone: "active" },
  MAINTENANCE: { label: "Đang bảo trì", tone: "maintenance" },
  INACTIVE: { label: "Ngừng sử dụng", tone: "inactive" },
};

// Nhiệt độ vượt ngưỡng trên của dải quy chuẩn (ví dụ "2°C - 8°C") thì cảnh báo.
const upperLimit = (range) => {
  const numbers = String(range || "").match(/-?\d+(?:[.,]\d+)?/g);
  return numbers?.length ? Number(numbers.at(-1).replace(",", ".")) : null;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
};

/** Chi tiết tủ lưu mẫu: chỉ hiển thị các trường có trong bảng sample_storage_units và mẫu đang lưu. */
export default function StorageDetailModal({ unitId, isOpen, onClose, onEdit }) {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !unitId) return undefined;
    let active = true;
    setLoading(true);
    setError("");
    SampleStorageService.getSampleStorageUnitDetail(unitId)
      .then((res) => {
        if (active) setUnit(res.data?.data || res.data);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || err?.message || "Không thể tải chi tiết tủ lưu mẫu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, unitId]);

  if (!isOpen) return null;

  const status = STATUS[unit?.status] || { label: unit?.status || "—", tone: "inactive" };
  const limit = upperLimit(unit?.temperatureRange);
  const hasTemperature = unit?.currentTemperature !== null && unit?.currentTemperature !== undefined;
  const overTemperature = hasTemperature && limit !== null && Number(unit.currentTemperature) > limit;
  const occupancy = Math.min(100, Number(unit?.occupancyRate) || 0);
  const samples = unit?.retainedSamples || [];

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="storage-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <span className={styles.headerIcon} aria-hidden="true">
            <KitchenOutlinedIcon fontSize="small" />
          </span>
          <div className={styles.headerText}>
            <h2 id="storage-detail-title" className={styles.title}>{unit?.name || "Tủ lưu mẫu"}</h2>
            <p className={styles.subtitle}>
              {unit?.location || " "}
            </p>
          </div>
          {unit && <span className={`${styles.status} ${styles[`status_${status.tone}`]}`}>{status.label}</span>}
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </header>

        <div className={styles.body}>
          {loading && <p className={styles.muted}>Đang tải dữ liệu…</p>}
          <InlineError messages={error} />

          {unit && !loading && (
            <>
              <dl className={styles.stats}>
                <div className={styles.stat}>
                  <dt>Nhiệt độ hiện tại</dt>
                  <dd className={overTemperature ? styles.danger : hasTemperature ? styles.ok : styles.mutedValue}>
                    {hasTemperature ? `${unit.currentTemperature}°C` : "Chưa đo"}
                  </dd>
                  <span className={styles.statHint}>Quy chuẩn {unit.temperatureRange}</span>
                </div>
                <div className={styles.stat}>
                  <dt>Sức chứa</dt>
                  <dd>
                    {unit.currentUsage}
                    <span className={styles.statUnit}> / {unit.capacity} mẫu</span>
                  </dd>
                  <div className={styles.bar} aria-hidden="true">
                    <span
                      className={occupancy >= 90 ? styles.barFull : styles.barFill}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
                <div className={styles.stat}>
                  <dt>Số ngăn</dt>
                  <dd>
                    {unit.compartmentCount}
                    <span className={styles.statUnit}> ngăn</span>
                  </dd>
                </div>
              </dl>

              {unit.description && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Ghi chú</h3>
                  <p className={styles.note}>{unit.description}</p>
                </section>
              )}

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Mẫu đang lưu <span className={styles.count}>{samples.length}</span>
                </h3>
                {samples.length === 0 ? (
                  <p className={styles.empty}>Tủ chưa có mẫu đang lưu.</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">Thời gian lưu</th>
                        <th scope="col">Vị trí ngăn</th>
                        <th scope="col" className={styles.right}>Lượng mẫu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samples.map((sample) => (
                        <tr key={sample.id}>
                          <td>
                            <span className={styles.primaryText}>{formatDateTime(sample.sampledAt)}</span>
                            {sample.batchCode && <span className={styles.subText}>{sample.batchCode}</span>}
                          </td>
                          <td>{sample.storageLocation || "—"}</td>
                          <td className={styles.right}>
                            {sample.quantity ? formatSmallQuantity(sample.quantity, sample.unit || "g") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Đóng
          </button>
          {unit && onEdit && (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                onClose();
                onEdit(unit);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
              Chỉnh sửa
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
