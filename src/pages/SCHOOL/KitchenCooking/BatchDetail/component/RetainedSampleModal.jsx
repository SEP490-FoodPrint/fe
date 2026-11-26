import React, { useState, useEffect, useMemo } from "react";
import PhotoPicker from "src/components/PhotoPicker";
import PropTypes from "prop-types";
import { minimumSampleQuantity, sampleQuantityError } from "src/utils/sampleRules";
import StorageUnitField, { storageUnitBlockReason, storageCompartmentBlockReason } from "../../KitchenSamples/component/StorageUnitField";
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
  const [storageUnitId, setStorageUnitId] = useState("");
  const [storagePosition, setStoragePosition] = useState("");
  const [storageUnits, setStorageUnits] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [photo, setPhoto] = useState(null);

  const sampledDishIds = useMemo(() => {
    return new Set(
      (batchData.retainedFoodSamples || [])
        .map((s) => s.dishId)
        .filter(Boolean),
    );
  }, [batchData.retainedFoodSamples]);

  const selectedDish = useMemo(() => {
    const dishes = batchData.dishes || [];
    return dishes.find((d) => d.dishId === selectedDishId) || dishes[0] || null;
  }, [batchData.dishes, selectedDishId]);

  const hasPlannedSample =
    selectedDish?.sampleQuantity != null && selectedDish?.sampleUnit != null;
  const plannedQuantity = hasPlannedSample ? String(selectedDish.sampleQuantity) : quantity;
  const plannedUnit = hasPlannedSample ? selectedDish.sampleUnit : unit;

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
      setPhoto(null);
      setStoragePosition("");
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
    if (!photo) { setErrorMsg("Cần chụp hoặc tải ảnh mẫu lưu trước khi xác nhận."); return; }
    if (batchData.dishes && batchData.dishes.length > 1 && !selectedDishId) {
      setErrorMsg("Vui lòng chọn món ăn cần lưu mẫu.");
      return;
    }
    if (!hasPlannedSample) {
      const quantityError = sampleQuantityError(quantity, unit);
      if (quantityError) {
        setErrorMsg(quantityError);
        return;
      }
    }
    const selectedStorageUnit = storageUnits.find((item) => item.id === storageUnitId);
    const storageError = storageUnitBlockReason(selectedStorageUnit) || storageCompartmentBlockReason(selectedStorageUnit, storagePosition);
    if (storageError) {
      setErrorMsg(storageError);
      return;
    }

    setErrorMsg("");
    const selectedTime = new Date(sampledAt);
    const completedTime = new Date(batchData.completedAt);
    if (!isNaN(completedTime.getTime()) && selectedTime < completedTime && Math.floor(selectedTime.getTime() / 60000) === Math.floor(completedTime.getTime() / 60000)) {
      selectedTime.setTime(Date.now());
    }
    onConfirm({
      ...(selectedDishId ? { dishId: selectedDishId } : {}),
      ...(hasPlannedSample ? {} : { quantity: String(Number(quantity)), unit }),
      storageUnitId,
      storageLocation: storagePosition,
      sampledAt: selectedTime.toISOString(),
      photo,
    });
  };

  // adaptBatchDetail trả `mealType` là chữ ("Bữa xế"); mã bữa gốc nằm ở `mealTypeCode`.
  const mealName =
    batchData.mealName ||
    batchData.mealLabel ||
    { LUNCH: "Bữa trưa", AFTERNOON: "Bữa xế" }[
      String(batchData.mealTypeCode || batchData.mealType || "").toUpperCase()
    ] ||
    batchData.mealType ||
    "Bữa trưa";

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
                <span className={styles.summaryLabel}>Mã lô:</span>
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

            {/* Chọn món ăn cụ thể nếu lô có nhiều món */}
            {batchData.dishes && batchData.dishes.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <label className={styles.fieldLabel} htmlFor="sample-dish-select">
                  Chọn món ăn cần lưu mẫu trong lô này{" "}
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
                    min={hasPlannedSample ? undefined : minimumSampleQuantity(plannedUnit)}
                    step="any"
                    placeholder="150"
                    className={styles.textInput}
                    value={plannedQuantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={loading || hasPlannedSample}
                    readOnly={hasPlannedSample}
                    required={!hasPlannedSample}
                  />
                  <select
                    className={styles.unitSelect}
                    value={plannedUnit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={loading || hasPlannedSample}
                  >
                    <option value="g">gam (g)</option>
                    <option value="ml">mililit (ml)</option>
                  </select>
                </div>
                {hasPlannedSample && (
                  <span className={styles.fieldHint} style={{ marginTop: 4, display: "block" }}>
                    {selectedDish.sampleRatio && Number(selectedDish.sampleRatio) !== 1
                      ? `Đã làm tròn theo đơn vị đếm, lượng mẫu ${selectedDish.sampleQuantity} ${selectedDish.sampleUnit}`
                      : `Lượng mẫu ấn định theo kế hoạch: ${selectedDish.sampleQuantity} ${selectedDish.sampleUnit}`}
                  </span>
                )}
              </div>
              {/* 3. Tủ lưu mẫu (bắt buộc) và ngăn trong tủ */}
              <StorageUnitField
                styles={styles}
                unitId={storageUnitId}
                onUnitChange={setStorageUnitId}
                position={storagePosition}
                onPositionChange={setStoragePosition}
                disabled={loading}
                onUnitsLoaded={setStorageUnits}
              />
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

          <PhotoPicker value={photo} onChange={setPhoto} disabled={loading} />
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
