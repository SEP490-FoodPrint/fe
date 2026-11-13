import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import ROUTER from "src/router/ROUTER";
import KitchenService from "src/services/KitchenService";
import styles from "./CreateBatchFooter.module.scss";

export default function CreateBatchFooter({
  selectedDish,
  dishes = [],
  selectedMeal = "lunch",
  onBatchCreated,
  onSelectNextDish,
}) {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCreated = selectedDish?.isBatchCreated;

  // Ưu tiên món chưa tạo trong cùng ca ăn
  const nextPendingDish =
    dishes.find(
      (d) =>
        !d.isBatchCreated &&
        d.id !== selectedDish?.id &&
        (selectedMeal === "all" || d.mealType === selectedMeal)
    ) ||
    dishes.find((d) => !d.isBatchCreated && d.id !== selectedDish?.id);

  const handleCreateBatch = async () => {
    if (!selectedDish) {
      setToastMessage("Vui lòng chọn món ăn trước khi tạo lô chế biến.");
      setIsError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    if (isCreated) {
      if (nextPendingDish && onSelectNextDish) {
        onSelectNextDish(nextPendingDish);
        return;
      }
      navigate(ROUTER.SCHOOL_KITCHEN_BATCHES);
      return;
    }

    setSubmitting(true);
    try {
      // Gọi API lập phương án chế biến thực tế từ Backend
      const mealType = String(selectedDish.mealType || selectedMeal || "LUNCH").toUpperCase();
      const res = await KitchenService.planBatch({
        dishId: selectedDish.dishId || selectedDish.id,
        menuDayId: selectedDish.menuDayId,
        mealType: mealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH",
      });

      setIsError(false);
      if (!Array.isArray(res?.batches) || !res.batches.length) throw new Error("Phản hồi thiếu phương án lô; vui lòng tải lại danh sách.");
      const dishCode = res.batches.map(batch => batch.batchCode).join(", ");

      if (onBatchCreated) {
        onBatchCreated(selectedDish.id, { ...res, batchCode: dishCode });
      }

      if (nextPendingDish) {
        setToastMessage(`✓ Đã tạo ${dishCode} cho "${selectedDish.name}". Đang chuyển sang món tiếp theo...`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      } else {
        setToastMessage(`✓ Đã hoàn tất tạo lô cho tất cả ${dishes.length} món ăn hôm nay!`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate(ROUTER.SCHOOL_KITCHEN_BATCHES);
        }, 1500);
      }
    } catch (err) {
      setToastMessage(err.message || "Không thể tạo lô chế biến. Vui lòng kiểm tra lại nguyên liệu.");
      setIsError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Desktop Footer Bar */}
      <div className={styles.desktopFooterBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          aria-label="Quay lại danh sách lô"
        >
          <ArrowLeft size={16} />
          <span>Danh sách lô</span>
        </button>

        <div className={styles.rightActions}>
          {isCreated ? (
            nextPendingDish ? (
              <button
                type="button"
                className={styles.createBtn}
                onClick={handleCreateBatch}
              >
                <span>Chuyển sang: {nextPendingDish.name}</span>
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.finishBtn}
                onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
              >
                <CheckCircle2 size={17} />
                <span>Hoàn tất & Về danh sách</span>
              </button>
            )
          ) : (
            <button
              type="button"
              className={styles.createBtn}
              onClick={handleCreateBatch}
              disabled={!selectedDish || submitting}
            >
              <PlusCircle size={17} />
              <span>
                {submitting
                  ? "Đang lập phương án..."
                  : nextPendingDish
                    ? `Tạo lô ${selectedDish?.batchCode || ""} & Tiếp tục`
                    : `Tạo lô ${selectedDish?.batchCode || ""}`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Mobile Sticky Bottom Bar */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileBarInner}>
          <button
            type="button"
            className={styles.mobCreateBtn}
            onClick={handleCreateBatch}
            disabled={!selectedDish || submitting}
          >
            {isCreated ? (
              nextPendingDish ? (
                <>
                  <span>Tiếp tục: {nextPendingDish.name}</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Hoàn tất & Về danh sách</span>
                </>
              )
            ) : (
              <>
                <PlusCircle size={18} />
                <span>
                  {submitting
                    ? "Đang lập phương án..."
                    : `Tạo lô ${selectedDish?.batchCode || ""}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={styles.toast}
          role="status"
          aria-live="polite"
          style={{ backgroundColor: isError ? "#ef4444" : "#0a8066" }}
        >
          {isError ? (
            <AlertCircle size={18} className={styles.toastIcon} />
          ) : (
            <CheckCircle2 size={18} className={styles.toastIcon} />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
