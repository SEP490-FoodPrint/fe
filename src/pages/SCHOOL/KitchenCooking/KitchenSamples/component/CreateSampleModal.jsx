import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  X,
  FlaskConical,
  Clock,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Check,
  ChevronDown,
} from "lucide-react";
import styles from "./CreateSampleModal.module.scss";

export default function CreateSampleModal({
  open = false,
  availableBatches = [],
  onClose,
  onSubmit,
  submitting = false,
}) {
  // 1. State form
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [sampledAt, setSampledAt] = useState(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [quantity, setQuantity] = useState("150");
  const [unit, setUnit] = useState("g");
  const [storageLocation, setStorageLocation] = useState("Tủ A1 - Ngăn 02");
  const [errorMsg, setErrorMsg] = useState("");

  // Tự động chọn mẻ đầu tiên khi mở modal
  useEffect(() => {
    if (open && availableBatches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(availableBatches[0].id);
      if (availableBatches[0].defaultQuantity) {
        setQuantity(availableBatches[0].defaultQuantity);
      }
      if (availableBatches[0].defaultUnit) {
        setUnit(availableBatches[0].defaultUnit);
      }
      if (availableBatches[0].defaultStorage) {
        setStorageLocation(availableBatches[0].defaultStorage);
      }
    }
  }, [open, availableBatches, selectedBatchId]);

  // Lấy thông tin mẻ đang chọn
  const activeBatch = useMemo(() => {
    return (
      availableBatches.find((b) => b.id === selectedBatchId) ||
      availableBatches[0] ||
      null
    );
  }, [availableBatches, selectedBatchId]);

  const sampledDishIds = useMemo(() => {
    return new Set(
      (activeBatch?.retainedFoodSamples || [])
        .map((s) => s.dishId)
        .filter(Boolean),
    );
  }, [activeBatch]);

  // Khi activeBatch thay đổi, tự động chọn món ăn hợp lệ
  useEffect(() => {
    if (activeBatch?.dishes && activeBatch.dishes.length > 0) {
      const pending = activeBatch.dishes.find(
        (d) => !sampledDishIds.has(d.dishId),
      );
      setSelectedDishId(
        pending ? pending.dishId : activeBatch.dishes[0].dishId,
      );
    } else {
      setSelectedDishId("");
    }
  }, [activeBatch, sampledDishIds]);

  // Khi người dùng đổi mẻ
  const handleBatchSelectChange = (batchId) => {
    setSelectedBatchId(batchId);
    const found = availableBatches.find((b) => b.id === batchId);
    if (found) {
      if (found.defaultQuantity) setQuantity(found.defaultQuantity);
      if (found.defaultUnit) setUnit(found.defaultUnit);
      if (found.defaultStorage) setStorageLocation(found.defaultStorage);
    }
  };

  // 2. Tính toán preview 24 giờ
  const previewInfo = useMemo(() => {
    try {
      const start = new Date(sampledAt);
      if (isNaN(start.getTime())) return null;
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      const pad = (n) => String(n).padStart(2, "0");
      const startStr = `${pad(start.getHours())}:${pad(start.getMinutes())} ngày ${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`;
      const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())} ngày ${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;

      return {
        startStr,
        endStr,
      };
    } catch {
      return null;
    }
  }, [sampledAt]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setErrorMsg("Vui lòng chọn lô chế biến cần lưu mẫu.");
      return;
    }
    if (activeBatch?.dishes?.length > 1 && !selectedDishId) {
      setErrorMsg("Vui lòng chọn món ăn cần lưu mẫu trong mẻ này.");
      return;
    }

    const qtyNum = Number(quantity);
    if (quantity && (isNaN(qtyNum) || qtyNum <= 0)) {
      setErrorMsg("Khối lượng mẫu phải là số dương hợp lệ.");
      return;
    }

    setErrorMsg("");
    onSubmit({
      cookingBatchId: selectedBatchId,
      batchData: activeBatch,
      dishId: selectedDishId || undefined,
      sampledAt: new Date(sampledAt).toISOString(),
      quantity: quantity ? String(qtyNum) : "150",
      unit: unit || "g",
      storageLocation: storageLocation.trim() || "Tủ lưu mẫu 01",
    });
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconCircle}>
              <FlaskConical size={20} />
            </div>
            <div>
              <h2 className={styles.title}>Ghi nhận mẫu thức ăn lưu 24h</h2>
              <p className={styles.subTitle}>
                Kiểm thực 3 bước — Niêm phong và bảo quản mẫu lưu an toàn thực
                phẩm
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMsg && (
            <div className={styles.alertError}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Phần A: Chọn CookingBatch */}
          <div className={styles.section}>
            <label className={styles.fieldLabel} htmlFor="batch-select">
              Chọn lô chế biến cần lưu mẫu{" "}
              <span className={styles.required}>*</span>
            </label>

            {availableBatches.length > 0 ? (
              <div className={styles.selectWrap}>
                <select
                  id="batch-select"
                  className={styles.selectInput}
                  value={selectedBatchId}
                  onChange={(e) => handleBatchSelectChange(e.target.value)}
                  disabled={submitting}
                >
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode || b.id} — {b.dishName} (
                      {b.mealLabel ||
                        (b.mealType === "AFTERNOON"
                          ? "Bữa xế"
                          : "Bữa trưa")}{" "}
                      • {b.portions || 400} suất)
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectChevron} />
              </div>
            ) : (
              <div className={styles.noBatchWarning}>
                <AlertCircle size={16} />
                <span>
                  Tất cả các lô chế biến trong ca đã được ghi nhận mẫu lưu.
                </span>
              </div>
            )}

            {/* Chi tiết lô được chọn */}
            {activeBatch && (
              <div className={styles.batchSummaryBox}>
                {activeBatch.batchGroupCode && (
                  <div className={styles.batchSummaryRow}>
                    <span className={styles.summaryLabel}>Lô cha:</span>
                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontWeight: 700,
                        color: "#6d28d9",
                      }}
                    >
                      {activeBatch.batchGroupCode}
                    </span>
                  </div>
                )}
                <div className={styles.batchSummaryRow}>
                  <span className={styles.summaryLabel}>Món ăn:</span>
                  <span className={styles.summaryValueBold}>
                    {activeBatch.dishName}
                  </span>
                </div>
                <div className={styles.batchSummaryRow}>
                  <span className={styles.summaryLabel}>Mã mẻ:</span>
                  <span className={styles.summaryValueMono}>
                    {activeBatch.batchCode || activeBatch.id}
                  </span>
                </div>
                <div className={styles.batchSummaryRow}>
                  <span className={styles.summaryLabel}>Bữa ăn & Số suất:</span>
                  <span className={styles.summaryValue}>
                    {activeBatch.mealLabel ||
                      (activeBatch.mealType === "AFTERNOON"
                        ? "Bữa xế"
                        : "Bữa trưa")}{" "}
                    • {activeBatch.portions || 420} suất ăn
                  </span>
                </div>
              </div>
            )}

            {/* Chọn món ăn cụ thể nếu mẻ có nhiều món */}
            {activeBatch &&
              activeBatch.dishes &&
              activeBatch.dishes.length > 1 && (
                <div style={{ marginTop: 14 }}>
                  <label className={styles.fieldLabel} htmlFor="dish-select">
                    Chọn món ăn cần lưu mẫu trong mẻ này{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrap}>
                    <select
                      id="dish-select"
                      className={styles.selectInput}
                      value={selectedDishId}
                      onChange={(e) => setSelectedDishId(e.target.value)}
                      disabled={submitting}
                    >
                      {activeBatch.dishes.map((dish) => {
                        const isSampled = sampledDishIds.has(dish.dishId);
                        return (
                          <option key={dish.dishId} value={dish.dishId}>
                            {dish.name}{" "}
                            {isSampled ? "✓ (Đã lưu mẫu)" : "• (Chưa lưu)"}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={16} className={styles.selectChevron} />
                  </div>
                  <span
                    className={styles.fieldHint}
                    style={{ marginTop: 4, display: "block" }}
                  >
                    Mẻ chế biến gồm nhiều món, vui lòng chọn từng món để niêm
                    phong lưu mẫu.
                  </span>
                </div>
              )}
          </div>

          {/* Phần B: Thông tin mẫu lưu */}
          <div className={styles.section}>
            <div className={styles.formGrid}>
              {/* 1. Thời điểm lấy mẫu */}
              <div className={styles.formGroupFull}>
                <label className={styles.fieldLabel} htmlFor="sample-datetime">
                  Thời điểm lấy mẫu <span className={styles.required}>*</span>
                </label>
                <input
                  id="sample-datetime"
                  type="datetime-local"
                  className={styles.textInput}
                  value={sampledAt}
                  onChange={(e) => setSampledAt(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* 2. Khối lượng mẫu */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="sample-qty">
                  Lượng mẫu lưu
                </label>
                <div className={styles.inputWithUnit}>
                  <input
                    id="sample-qty"
                    type="number"
                    min="50"
                    step="10"
                    placeholder="150"
                    className={styles.textInput}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={submitting}
                  />
                  <select
                    className={styles.unitSelect}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="g">gam (g)</option>
                    <option value="ml">mililit (ml)</option>
                  </select>
                </div>
                <span className={styles.fieldHint}>
                  Quy chuẩn tối thiểu 100g hoặc 100ml
                </span>
              </div>

              {/* 3. Vị trí lưu mẫu */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="sample-location">
                  Vị trí tủ lưu mẫu
                </label>
                <input
                  id="sample-location"
                  type="text"
                  placeholder="Ví dụ: Tủ A1 - Ngăn 02"
                  className={styles.textInput}
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  disabled={submitting}
                />
                <span className={styles.fieldHint}>
                  Tủ lưu chuyên dụng 2°C - 8°C
                </span>
              </div>
            </div>
          </div>

          {/* Phần C: Preview mốc thời gian lưu 24h */}
          {previewInfo && (
            <div className={styles.previewBox}>
              <div className={styles.previewHeader}>
                <Clock size={16} className={styles.previewIcon} />
                <span className={styles.previewTitle}>
                  Quy chuẩn chu kỳ lưu 24 giờ Bộ Y Tế
                </span>
              </div>
              <div className={styles.previewTimeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineDotStart} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>
                      Thời điểm lấy mẫu:
                    </span>
                    <span className={styles.timelineTime}>
                      {previewInfo.startStr}
                    </span>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineDotEnd} />
                  <div className={styles.timelineContent}>
                    <span className={styles.timelineLabel}>
                      Mốc đủ 24 giờ dự kiến:
                    </span>
                    <span className={styles.timelineTimeEnd}>
                      {previewInfo.endStr}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !selectedBatchId}
            >
              <Check size={16} />
              <span>
                {submitting ? "Đang ghi nhận..." : "Lưu mẫu niêm phong"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateSampleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  availableBatches: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};
