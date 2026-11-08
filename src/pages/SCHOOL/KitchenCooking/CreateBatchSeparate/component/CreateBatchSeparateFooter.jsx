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
import styles from "./CreateBatchSeparateFooter.module.scss";

export default function CreateBatchSeparateFooter({
  selectedDish,
  dishes = [],
  onBatchCreated,
  onSelectNextDish,
}) {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const isCreated = selectedDish?.isBatchCreated;
  const nextPendingDish = dishes.find(
    (d) => !d.isBatchCreated && d.id !== selectedDish?.id
  );

  const handleCreateBatch = () => {
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

    setIsError(false);
    const dishCode = selectedDish.batchCode || "02 LÔ TÁCH";
    
    if (onBatchCreated) {
      onBatchCreated(selectedDish.id);
    }

    if (nextPendingDish) {
      setToastMessage(`✓ Đã tạo 02 lô (${dishCode}) cho "${selectedDish.name}". Đang chuyển sang món tiếp theo...`);
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
              disabled={!selectedDish}
            >
              <PlusCircle size={17} />
              <span>
                {nextPendingDish
                  ? `Tạo 02 lô tách & Tiếp tục`
                  : `Tạo 02 lô tách`}
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
            disabled={!selectedDish}
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
                <span>Tạo 02 lô tách</span>
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
