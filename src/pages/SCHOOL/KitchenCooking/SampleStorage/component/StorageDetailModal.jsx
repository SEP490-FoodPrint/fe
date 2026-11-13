import React, { useState, useEffect } from "react";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SampleStorageService from "src/services/SampleStorageService";
import styles from "./StorageModal.module.scss";

export default function StorageDetailModal({ unitId, isOpen, onClose, onEdit }) {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && unitId) {
      let isSubscribed = true;
      setLoading(true);
      setError("");

      SampleStorageService.getSampleStorageUnitDetail(unitId)
        .then((res) => {
          if (isSubscribed) {
            setUnit(res.data?.data || res.data);
          }
        })
        .catch((err) => {
          if (isSubscribed) {
            setError(
              err?.response?.data?.message ||
                err?.message ||
                "Không thể tải chi tiết tủ lưu mẫu.",
            );
          }
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });

      return () => {
        isSubscribed = false;
      };
    }
  }, [isOpen, unitId]);

  if (!isOpen) return null;

  const renderStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className={`${styles.badge} ${styles.badgeActive}`}>Đang hoạt động</span>;
      case "MAINTENANCE":
        return (
          <span className={`${styles.badge} ${styles.badgeMaintenance}`}>
            Đang bảo trì / Kiểm định
          </span>
        );
      case "INACTIVE":
        return <span className={`${styles.badge} ${styles.badgeInactive}`}>Ngừng sử dụng</span>;
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h3 className={styles.headerTitle}>
              <KitchenOutlinedIcon className={styles.headerIcon} />
              Chi tiết tủ lưu mẫu: {unit?.name || "..."}
            </h3>
            <p className={styles.headerSubtitle}>
              {unit?.location || "Thông số kỹ thuật và mẫu đang bảo quản"}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </div>

        <div className={styles.modalBodyDetail}>
          {loading && <p style={{ textAlign: "center", color: "#64748b" }}>Đang tải dữ liệu...</p>}
          {error && <div className={styles.alertBox}>{error}</div>}

          {unit && !loading && (
            <>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
                  <span className={styles.detailLabel}>Tên tủ lưu mẫu</span>
                  <span className={styles.detailValue}>{unit.name}</span>
                </div>

                <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
                  <span className={styles.detailLabel}>Vị trí đặt trong bếp</span>
                  <span className={styles.detailValue}>{unit.location}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Trạng thái hiện tại</span>
                  <div>{renderStatusBadge(unit.status)}</div>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Dải nhiệt độ quy chuẩn</span>
                  <span className={styles.detailValue} style={{ color: "#0284c7" }}>
                    <ThermostatOutlinedIcon
                      fontSize="small"
                      style={{ verticalAlign: "middle", marginRight: 4 }}
                    />
                    {unit.temperatureRange}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Nhiệt độ hiện tại ghi nhận</span>
                  <span
                    className={styles.detailValue}
                    style={{
                      color:
                        unit.currentTemperature && unit.currentTemperature > 8
                          ? "#dc2626"
                          : "#16a34a",
                    }}
                  >
                    {unit.currentTemperature !== null ? `${unit.currentTemperature}°C` : "Chưa đo"}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Sức chứa</span>
                  <span className={styles.detailValue}>
                    {unit.currentUsage} / {unit.capacity} mẫu ({unit.occupancyRate}%)
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Số lượng ngăn tủ</span>
                  <span className={styles.detailValue}>{unit.compartmentCount} ngăn</span>
                </div>

                {unit.description && (
                  <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
                    <span className={styles.detailLabel}>Ghi chú quy cách & phân công</span>
                    <span
                      className={styles.detailValue}
                      style={{ fontWeight: 400, fontSize: 13, color: "#475569" }}
                    >
                      {unit.description}
                    </span>
                  </div>
                )}
              </div>

              {/* Danh sách mẫu lưu trong tủ */}
              <div className={styles.sampleListHeader}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ScienceOutlinedIcon fontSize="small" style={{ color: "#059669" }} />
                  Mẫu thức ăn đang lưu trong tủ ({unit.retainedSamples?.length || 0})
                </span>
              </div>

              {(!unit.retainedSamples || unit.retainedSamples.length === 0) ? (
                <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", margin: "4px 0" }}>
                  Hiện chưa có mẫu lưu trữ nào trong tủ này.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className={styles.sampleMiniTable}>
                    <thead>
                      <tr>
                        <th>Lô nấu</th>
                        <th>Thời gian lưu</th>
                        <th>Định lượng</th>
                        <th>Vị trí ngăn</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unit.retainedSamples.map((sample) => (
                        <tr key={sample.id}>
                          <td style={{ fontWeight: 600 }}>{sample.batchCode || "—"}</td>
                          <td>
                            {sample.sampledAt
                              ? new Date(sample.sampledAt).toLocaleString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td>
                            {sample.quantity ? `${sample.quantity} ${sample.unit || "g"}` : "—"}
                          </td>
                          <td>{sample.storageLocation || "—"}</td>
                          <td>
                            <span className={`${styles.badge} ${styles.badgeActive}`}>
                              ĐANG LƯU
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Đóng
          </button>
          {unit && onEdit && (
            <button
              type="button"
              className={styles.btnEdit}
              onClick={() => {
                onClose();
                onEdit(unit);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
