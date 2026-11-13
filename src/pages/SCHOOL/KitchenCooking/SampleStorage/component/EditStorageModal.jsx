import React, { useState, useEffect } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import SampleStorageService from "src/services/SampleStorageService";
import styles from "./StorageModal.module.scss";

export default function EditStorageModal({ unit, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    temperatureRange: "2°C - 8°C",
    currentTemperature: "",
    capacity: 40,
    compartmentCount: 3,
    status: "ACTIVE",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name || "",
        location: unit.location || "",
        temperatureRange: unit.temperatureRange || "2°C - 8°C",
        currentTemperature:
          unit.currentTemperature !== null && unit.currentTemperature !== undefined
            ? String(unit.currentTemperature)
            : "",
        capacity: unit.capacity || 40,
        compartmentCount: unit.compartmentCount || 3,
        status: unit.status || "ACTIVE",
        description: unit.description || "",
      });
      setError("");
    }
  }, [unit]);

  if (!isOpen || !unit) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên tủ lưu mẫu.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Vui lòng nhập vị trí đặt tủ tại khu vực bếp.");
      return;
    }
    if (!formData.capacity || Number(formData.capacity) < 1) {
      setError("Sức chứa tối đa của tủ phải từ 1 mẫu trở lên.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        temperatureRange: formData.temperatureRange.trim() || "2°C - 8°C",
        currentTemperature: formData.currentTemperature
          ? Number(formData.currentTemperature)
          : null,
        capacity: Number(formData.capacity),
        compartmentCount: Number(formData.compartmentCount) || 3,
        status: formData.status,
        description: formData.description.trim() || undefined,
      };

      const res = await SampleStorageService.updateSampleStorageUnit(unit.id, payload);
      onSuccess(res.data?.data || res.data);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật tủ lưu mẫu. Vui lòng kiểm tra lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h3 className={styles.headerTitle}>
              <EditOutlinedIcon className={styles.headerIcon} />
              Chỉnh sửa tủ lưu mẫu
            </h3>
            <p className={styles.headerSubtitle}>
              Cập nhật thông số kỹ thuật, vị trí và trạng thái tủ {unit.name}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div className={styles.alertBox} role="alert">
                <WarningAmberOutlinedIcon fontSize="small" />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Tên tủ lưu mẫu <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  placeholder="Ví dụ: Tủ lưu mẫu Bếp chính - Tủ A1"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={255}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Vị trí đặt tủ trong khu bếp <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  className={styles.input}
                  placeholder="Ví dụ: Phòng kiểm thực 3 bước - Bếp 1"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength={255}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Dải nhiệt độ quy chuẩn</label>
                <input
                  type="text"
                  name="temperatureRange"
                  className={styles.input}
                  placeholder="Mặc định: 2°C - 8°C"
                  value={formData.temperatureRange}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nhiệt độ hiện tại ghi nhận (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  name="currentTemperature"
                  className={styles.input}
                  placeholder="Ví dụ: 4.2"
                  value={formData.currentTemperature}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Sức chứa tối đa (số mẫu) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  name="capacity"
                  className={styles.input}
                  placeholder="Ví dụ: 48"
                  value={formData.capacity}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Số ngăn tủ</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  name="compartmentCount"
                  className={styles.input}
                  placeholder="Ví dụ: 3"
                  value={formData.compartmentCount}
                  onChange={handleChange}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Trạng thái hoạt động <span className={styles.required}>*</span>
                </label>
                <select
                  name="status"
                  className={styles.select}
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="MAINTENANCE">Đang bảo trì / Kiểm định</option>
                  <option value="INACTIVE">Ngừng sử dụng</option>
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Ghi chú mô tả</label>
                <textarea
                  name="description"
                  className={styles.textarea}
                  placeholder="Ghi chú phân công phụ trách, quy định niêm phong hoặc lịch bảo dưỡng..."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={2}
                />
              </div>
            </div>
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
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Cập nhật thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
