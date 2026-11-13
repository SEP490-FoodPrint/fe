import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  X,
  FlaskConical,
  Clock,
  AlertCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import styles from "./RetainedSampleModal.module.scss";

/**
 * RetainedSampleModal - Popup Ghi nhận mẫu thức ăn lưu 24h
 * - Đồng bộ giao diện chuẩn mực với module Lưu mẫu thức ăn
 * - Đã loại bỏ: Lô cha, Quy chuẩn tối thiểu 100g, trường Vị trí tủ lưu mẫu, và subtitle rườm rà
 * - Tự động tính toán mốc thời gian lưu 24 giờ của Bộ Y Tế
 */
export default function RetainedSampleModal({
  isOpen,
  onClose,
  onConfirm,
  batchData = {},
  loading = false,
}) {
  const [selectedDishId, setSelectedDishId] = useState("");
  const [sampledAt, setSampledAt] = useState(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [quantity, setQuantity] = useState("150");
  const [unit, setUnit] = useState("g");
  const [errorMsg, setErrorMsg] = useState("");

  const sampledDishIds = useMemo(() => {
    return new Set(
      (batchData.retainedFoodSamples || [])
        .map((s) => s.dishId)
        .filter(Boolean),
    );
  }, [batchData.retainedFoodSamples]);

  useEffect(() => {
    if (isOpen && batchData.dishes && batchData.dishes.length > 0) {
      const pendingDish = batchData.dishes.find(
        (d) => !sampledDishIds.has(d.dishId),
      );
      setSelectedDishId(
        pendingDish ? pendingDish.dishId : batchData.dishes[0].dishId,
      );
    }
  }, [isOpen, batchData.dishes, sampledDishIds]);

  // Cập nhật lại thời điểm lấy mẫu hiện tại mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setSampledAt(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
      setErrorMsg("");
    }
  }, [isOpen]);

  // Tính toán preview mốc thời gian 24 giờ
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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (batchData.dishes && batchData.dishes.length > 1 && !selectedDishId) {
      setErrorMsg("Vui lòng chọn món ăn cần lưu mẫu.");
      return;
    }
    const num = Number(quantity);
    if (isNaN(num) || num <= 0) {
      setErrorMsg("Lượng mẫu lưu phải là số dương hợp lệ.");
      return;
    }

    setErrorMsg("");
    onConfirm({
      ...(selectedDishId ? { dishId: selectedDishId } : {}),
      quantity: String(num),
      unit,
      storageLocation: "Tủ lưu mẫu Bếp 01 - Ngăn A",
      sampledAt: new Date(sampledAt).toISOString(),
    });
  };

  const mealName =
    batchData.mealName ||
    batchData.mealLabel ||
    (String(batchData.mealType || "").toUpperCase() === "AFTERNOON"
      ? "Bữa xế"
      : "Bữa trưa");

  const portionsCount =
    batchData.portions ||
    batchData.portionStandard ||
    batchData.plannedPortions ||
    420;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header Tinh Gọn */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconCircle}>
              <FlaskConical size={20} />
            </div>
            <div>
              <h2 className={styles.title}>Ghi nhận mẫu thức ăn lưu 24h</h2>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
            disabled={loading}
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

          {/* Phần A: Tóm tắt thông tin lô chế biến (Không có Lô cha) */}
          <div className={styles.section}>
            <div className={styles.batchSummaryBox}>
              <div className={styles.batchSummaryRow}>
                <span className={styles.summaryLabel}>Món chế biến:</span>
                <span className={styles.summaryValueBold}>
                  {(() => {
                    const rawName = (batchData.dishName || batchData.name || "")
                      .trim()
                      .replace(/^thức\s*ăn[:,\s-]*/i, "")
                      .replace(/^món\s*ăn[:,\s-]*/i, "")
                      .replace(/ngày\s*\d{1,2}\/\d{1,2}\/\d{4}/gi, "")
                      .replace(/[•,\-:\s]+$/, "")
                      .trim();
                    const d = new Date(sampledAt || new Date());
                    const pad = (n) => String(n).padStart(2, "0");
                    const dateStr = !isNaN(d.getTime())
                      ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
                      : "";
                    return rawName ? `${rawName} • Ngày ${dateStr}` : `Ngày ${dateStr}`;
                  })()}
                </span>
              </div>
              <div className={styles.batchSummaryRow}>
                <span className={styles.summaryLabel}>Mã mẻ:</span>
                <span className={styles.summaryValueMono}>
                  {batchData.code || batchData.batchCode || batchData.id || "—"}
                </span>
              </div>
              <div className={styles.batchSummaryRow}>
                <span className={styles.summaryLabel}>Bữa ăn & Số suất:</span>
                <span className={styles.summaryValue}>
                  {mealName} • {portionsCount} suất ăn
                </span>
              </div>
            </div>

            {/* Chọn món ăn cụ thể nếu mẻ có nhiều món */}
            {batchData.dishes && batchData.dishes.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <label className={styles.fieldLabel} htmlFor="sample-dish-select">
                  Chọn món ăn cần lưu mẫu trong mẻ này{" "}
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id="sample-dish-select"
                    className={styles.selectInput}
                    value={selectedDishId}
                    onChange={(e) => setSelectedDishId(e.target.value)}
                    disabled={loading}
                  >
                    {batchData.dishes.map((dish) => {
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
                  disabled={loading}
                  required
                />
              </div>

              {/* 2. Khối lượng mẫu */}
              <div className={styles.formGroupFull}>
                <label className={styles.fieldLabel} htmlFor="sample-qty">
                  Lượng mẫu lưu <span className={styles.required}>*</span>
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
                    disabled={loading}
                    required
                  />
                  <select
                    className={styles.unitSelect}
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={loading}
                  >
                    <option value="g">gam (g)</option>
                    <option value="ml">mililit (ml)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Phần C: Preview mốc thời gian lưu 24h Bộ Y Tế */}
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

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              <Check size={16} />
              <span>{loading ? "Đang lưu mẫu…" : "Lưu mẫu niêm phong"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

RetainedSampleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  batchData: PropTypes.object,
  loading: PropTypes.bool,
};
