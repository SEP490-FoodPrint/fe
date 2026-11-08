import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./CreateBatchSeparateFooter.module.scss";

export default function CreateBatchSeparateFooter({ selectedDish }) {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleCreateBatch = () => {
    if (!selectedDish) {
      setToastMessage("Vui lòng chọn món ăn trước khi tạo lô chế biến.");
      setIsError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }
    setIsError(false);
    setToastMessage(`Khởi tạo 02 lô nấu riêng ${selectedDish.name} thành công!`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate(ROUTER.SCHOOL_KITCHEN_BATCHES);
    }, 1200);
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
          <span>Quay lại</span>
        </button>

        <button
          type="button"
          className={styles.createBtn}
          onClick={handleCreateBatch}
          disabled={!selectedDish}
        >
          <PlusCircle size={17} />
          <span>Tạo lô chế biến (02 lô)</span>
        </button>
      </div>

      {/* 2. Mobile Sticky Bottom Bar */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileBarInner}>
          <button
            type="button"
            className={styles.mobCreateBtn}
            onClick={handleCreateBatch}
            aria-label="Khởi tạo lô chế biến mới"
            disabled={!selectedDish}
          >
            <PlusCircle size={18} />
            <span>Tạo 02 lô chế biến</span>
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
