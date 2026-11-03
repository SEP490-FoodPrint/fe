import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./CreateBatchFooter.module.scss";

export default function CreateBatchFooter({ selectedDish }) {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleCreateBatch = () => {
    if (!selectedDish) {
      setToastMessage(
        "Vui lòng chọn món ăn ở Bước 1 trước khi tạo lô chế biến.",
      );
      setIsError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }
    setIsError(false);
    setToastMessage(`Khởi tạo lô chế biến ${selectedDish.name} thành công!`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate(ROUTER.SCHOOL_KITCHEN_BATCHES);
    }, 1200);
  };

  return (
    <>
      {/* 1. Desktop Footer Bar (Hiện trên Desktop >= 768px) */}
      <div className={styles.desktopFooterBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          aria-label="Quay lại danh sách lô"
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách</span>
        </button>

        <div className={styles.actionGroup}>
          <span className={styles.footerNote}>
            Lô mới ở trạng thái Chưa xác nhận. Xác nhận nấu sau khi kiểm tra.
          </span>

          <div className={styles.buttonsWrap}>
            <button
              type="button"
              className={styles.createBtn}
              onClick={handleCreateBatch}
              style={{ opacity: selectedDish ? 1 : 0.6 }}
            >
              <PlusCircle size={17} />
              <span>Tạo lô chế biến</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mobile Sticky Bottom Bar */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileBarInner}>
          <button
            type="button"
            className={styles.mobCreateBtn}
            onClick={handleCreateBatch}
            aria-label="Khởi tạo lô chế biến mới"
            style={{ opacity: selectedDish ? 1 : 0.6 }}
          >
            <PlusCircle size={18} />
            <span>Tạo lô chế biến</span>
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
