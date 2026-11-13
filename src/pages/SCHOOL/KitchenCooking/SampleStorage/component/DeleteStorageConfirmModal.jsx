import React, { useState } from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import SampleStorageService from "src/services/SampleStorageService";
import styles from "./StorageModal.module.scss";

export default function DeleteStorageConfirmModal({ unit, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !unit) return null;

  const hasSamples = unit.currentUsage > 0;

  const handleDelete = async () => {
    if (hasSamples) return;

    try {
      setLoading(true);
      setError("");
      await SampleStorageService.deleteSampleStorageUnit(unit.id);
      onSuccess(unit.id);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa tủ lưu mẫu. Vui lòng kiểm tra lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h3 className={styles.headerTitle} style={{ color: "#dc2626" }}>
              <DeleteOutlineOutlinedIcon className={styles.headerIcon} style={{ color: "#dc2626" }} />
              Xác nhận xóa tủ lưu mẫu
            </h3>
            <p className={styles.headerSubtitle}>
              Tên tủ: <strong style={{ color: "#0f172a" }}>{unit.name}</strong>
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className={styles.alertBox} role="alert">
              <WarningAmberOutlinedIcon fontSize="small" />
              <span>{error}</span>
            </div>
          )}

          {hasSamples ? (
            <div
              className={styles.alertBox}
              style={{ background: "#fffbeb", borderColor: "#fef3c7", color: "#92400e" }}
            >
              <WarningAmberOutlinedIcon fontSize="small" />
              <div>
                <strong>Không thể xóa tủ lưu mẫu này!</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: 13 }}>
                  Tủ <strong>{unit.name}</strong> hiện đang có{" "}
                  <strong>{unit.currentUsage} mẫu thức ăn</strong> lưu trữ bên trong.
                  Vui lòng chuyển các mẫu sang tủ khác hoặc hoàn tất tiêu hủy mẫu theo quy định Bộ Y
                  Tế trước khi xóa.
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 }}>
              Bạn có chắc chắn muốn xóa tủ lưu mẫu <strong>{unit.name}</strong> khỏi hệ thống master data không? Dữ liệu cấu hình của tủ sẽ bị
              xóa vĩnh viễn.
            </p>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          {!hasSamples && (
            <button
              type="button"
              className={`${styles.btnSubmit} ${styles.btnDanger}`}
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Đang xóa..." : "Xác nhận xóa"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

