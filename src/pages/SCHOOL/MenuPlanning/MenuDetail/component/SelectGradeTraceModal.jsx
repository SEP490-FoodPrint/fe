import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Scan, X, Check } from "lucide-react";
import styles from "./SelectGradeTraceModal.module.scss";
import SchoolGradeService from "src/services/SchoolGradeService";
import { gradeTracePath } from "src/services/TraceabilityService";

const formatDate = (iso) => {
  const [y, m, d] = String(iso || "")
    .slice(0, 10)
    .split("-");
  return d ? `${d}/${m}/${y}` : iso || "—";
};

/**
 * Chọn khối để truy xuất chung bữa ăn (mọi lớp của khối). `gradeIds` giới hạn
 * theo các khối áp dụng của thực đơn; `dishId` chọn sẵn món được bấm.
 */
export default function SelectGradeTraceModal({
  isOpen,
  onClose,
  menuDate,
  mealType = "LUNCH",
  gradeIds,
  dishId,
  dishName,
}) {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    let mounted = true;
    setLoading(true);
    setLoadError("");
    SchoolGradeService.list(undefined, {
      skipAuthRedirect: true,
      notifyOnError: false,
    })
      .then((res) => {
        if (mounted) setGrades(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        if (mounted) {
          setGrades([]);
          setLoadError("Không tải được danh sách khối.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Chỉ các khối áp dụng thực đơn; thực đơn toàn trường thì mọi khối.
  const options = useMemo(
    () =>
      Array.isArray(gradeIds) && gradeIds.length > 0
        ? grades.filter((g) => gradeIds.includes(g.id))
        : grades,
    [grades, gradeIds],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!options.some((g) => g.id === selectedGradeId))
      setSelectedGradeId(options[0]?.id || "");
  }, [isOpen, options, selectedGradeId]);

  const canApply = !loading && Boolean(selectedGradeId && menuDate && mealType);

  const handleApply = () => {
    if (!canApply) return;
    onClose();
    navigate(
      gradeTracePath({
        gradeId: selectedGradeId,
        date: menuDate,
        mealType,
        dishId,
      }),
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="grade-trace-title"
      classes={{ paper: styles.modalCard }}
    >
      <div className={styles.modalHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.headerIcon}>
            <Scan size={18} />
          </div>
          <h3 id="grade-trace-title" className={styles.modalTitle}>
            Truy xuất bữa ăn theo khối
          </h3>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.metaInfoBar}>
          <span>
            Ngày phục vụ: <strong>{formatDate(menuDate)}</strong>
          </span>
          <span>
            Bữa ăn:{" "}
            <strong>{mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"}</strong>
          </span>
          {dishName && (
            <span>
              Món: <strong>{dishName}</strong>
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="grade-trace-select">
            Chọn khối học
          </label>
          <select
            id="grade-trace-select"
            className={styles.selectInput}
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            disabled={loading || options.length === 0}
          >
            {options.length === 0 ? (
              <option value="">
                {loading ? "Đang tải danh sách khối..." : "Chưa có khối học"}
              </option>
            ) : (
              options.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))
            )}
          </select>
          <span className={styles.hintText}>
            Thông tin truy xuất là chung cho mọi lớp trong khối: nhà cung cấp,
            đơn giao, mốc phục vụ và xác thực blockchain.
          </span>
          {loadError && (
            <span
              className={styles.hintText}
              style={{ color: "var(--color-error)" }}
            >
              {loadError}
            </span>
          )}
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button type="button" className={styles.btnCancel} onClick={onClose}>
          Hủy bỏ
        </button>
        <button
          type="button"
          className={styles.btnApply}
          onClick={handleApply}
          disabled={!canApply}
        >
          <Check size={16} />
          <span>Xem truy xuất</span>
        </button>
      </div>
    </Dialog>
  );
}
