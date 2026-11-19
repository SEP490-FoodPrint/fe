import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Scan, X, School, Check } from "lucide-react";
import styles from "./SelectClassTraceModal.module.scss";
import ROUTER from "src/router/ROUTER";
import SchoolGradeService from "src/services/SchoolGradeService";
import ClassService from "src/services/ClassService";
import TraceabilityService from "src/services/TraceabilityService";

const formatDate = (iso) => {
  const [y, m, d] = String(iso || "").slice(0, 10).split("-");
  return d ? `${d}/${m}/${y}` : iso || "—";
};

/**
 * Chọn lớp để truy xuất suất ăn. Trang công khai (có schoolCode) lấy lớp thật
 * qua API công khai của trường; trang nội bộ dùng API quản trị khối/lớp.
 */
export default function SelectClassTraceModal({
  isOpen,
  onClose,
  menuDate,
  mealType = "LUNCH",
  schoolCode,
  gradeId,
  gradeName,
}) {
  const navigate = useNavigate();

  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState(gradeId || "");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        if (schoolCode) {
          const rows = await TraceabilityService.getPublicSchoolClasses(
            schoolCode,
            controller.signal,
          );
          if (!mounted) return;
          setClasses(rows);
          const map = new Map();
          rows.forEach((c) => {
            if (c.gradeId && !map.has(c.gradeId))
              map.set(c.gradeId, { id: c.gradeId, name: c.gradeName || "Khối" });
          });
          setGrades([...map.values()]);
        } else {
          const [gradesRes, classesRes] = await Promise.allSettled([
            SchoolGradeService.list(undefined, {
              skipAuthRedirect: true,
              notifyOnError: false,
            }),
            ClassService.getClasses(undefined, {
              skipAuthRedirect: true,
              notifyOnError: false,
            }),
          ]);
          if (!mounted) return;
          setGrades(
            gradesRes.status === "fulfilled" &&
              Array.isArray(gradesRes.value?.data)
              ? gradesRes.value.data
              : [],
          );
          setClasses(
            classesRes.status === "fulfilled" &&
              Array.isArray(classesRes.value?.data)
              ? classesRes.value.data
              : [],
          );
          if (classesRes.status !== "fulfilled")
            setLoadError("Không tải được danh sách lớp học.");
        }
      } catch (err) {
        if (mounted && err?.name !== "CanceledError")
          setLoadError("Không tải được danh sách lớp học của trường.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isOpen, schoolCode]);

  useEffect(() => {
    if (gradeId) setSelectedGradeId(gradeId);
  }, [gradeId]);

  // Khối theo thực đơn (gradeId thật của SchoolGrade). Nếu thực đơn dùng nhóm
  // "Toàn trường" hoặc khối không có lớp nào thì hiện mọi lớp của trường.
  const hasPreselectedGrade = Boolean(
    gradeId && classes.some((c) => c.gradeId === gradeId),
  );
  const activeGradeId = hasPreselectedGrade ? gradeId : selectedGradeId;

  const filteredClasses = useMemo(() => {
    if (!activeGradeId) return classes;
    const list = classes.filter((c) => c.gradeId === activeGradeId);
    return list.length > 0 ? list : classes;
  }, [classes, activeGradeId]);

  useEffect(() => {
    if (!isOpen) return;
    if (!filteredClasses.some((c) => c.id === selectedClassId))
      setSelectedClassId(filteredClasses[0]?.id || "");
  }, [isOpen, filteredClasses, selectedClassId]);

  const canApply = Boolean(selectedClassId && menuDate && mealType);

  const handleApply = () => {
    if (!canApply) return;
    onClose();
    const basePath = schoolCode
      ? ROUTER.SCHOOL_PUBLIC_MEAL_TRACEABILITY.replace(
          ":schoolCode",
          encodeURIComponent(schoolCode),
        )
      : ROUTER.SCHOOL_MEAL_TRACEABILITY;
    const query = new URLSearchParams({
      classId: selectedClassId,
      date: String(menuDate).slice(0, 10),
      mealType,
    });
    navigate(`${basePath}?${query.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleBox}>
            <div className={styles.headerIcon}>
              <Scan size={18} />
            </div>
            <h3 className={styles.modalTitle}>Chọn Đối Tượng Truy Xuất Suất Ăn</h3>
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
            <span>Ngày phục vụ: <strong>{formatDate(menuDate)}</strong></span>
            <span>Bữa ăn: <strong>{mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa"}</strong></span>
          </div>

          {hasPreselectedGrade ? (
            <div className={styles.gradeNoticeBox}>
              <div className={styles.gradeNoticeLeft}>
                <School size={16} className={styles.gradeNoticeIcon} />
                <span>
                  Khối áp dụng:{" "}
                  <strong>
                    {gradeName ||
                      grades.find((g) => g.id === gradeId)?.name ||
                      "Khối lớp"}
                  </strong>
                </span>
              </div>
              <span className={styles.gradeNoticeBadge}>Đã chọn theo thực đơn</span>
            </div>
          ) : grades.length > 0 ? (
            <div className={styles.formGroup}>
              <label className={styles.label}>1. Chọn Khối học</label>
              <select
                className={styles.selectInput}
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                disabled={loading}
              >
                <option value="">Tất cả khối</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {hasPreselectedGrade || grades.length === 0 ? "Chọn Lớp học nhận suất ăn" : "2. Chọn Lớp học nhận suất ăn"}
            </label>
            <select
              className={styles.selectInput}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={loading || filteredClasses.length === 0}
            >
              {filteredClasses.length === 0 ? (
                <option value="">
                  {loading ? "Đang tải danh sách lớp..." : "Không có lớp học"}
                </option>
              ) : (
                filteredClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <span className={styles.hintText}>
              Hệ thống sẽ tổng hợp toàn bộ các lô chế biến và nguyên liệu đã cấp cho lớp này.
            </span>
            {loadError && (
              <span className={styles.hintText} style={{ color: "var(--color-error)" }}>
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
            <span>Áp dụng truy xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
