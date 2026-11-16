import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Scan, X, School, Check } from "lucide-react";
import styles from "./SelectClassTraceModal.module.scss";
import ROUTER from "src/router/ROUTER";
import SchoolGradeService from "src/services/SchoolGradeService";
import ClassService from "src/services/ClassService";
import STORAGE, { getStorage } from "src/lib/storage";

const FALLBACK_GRADES = [
  { id: "f9b38c93-ea1c-4937-87eb-01efc1095327", name: "Khối lớp 1-3" },
  { id: "2a57fba0-b314-4e53-898e-d3cf0ecc294b", name: "Khối lớp 4-5" },
  { id: "93563efa-d808-4bcd-a640-a84a33d02244", name: "Khối Mầm non" },
  { id: "grade-1", name: "Khối 1" },
  { id: "grade-2", name: "Khối 2" },
  { id: "grade-3", name: "Khối 3" },
  { id: "grade-4", name: "Khối 4" },
  { id: "grade-5", name: "Khối 5" },
];

const FALLBACK_CLASSES = [
  // Danh sách lớp Khối lớp 1-3 (Trường Tiểu học FoodPrint & liên kết khối)
  { id: "3b39cbbc-6a5d-5b0a-9999-29ac586cbee0", gradeId: "f9b38c93-ea1c-4937-87eb-01efc1095327", name: "Lớp 3A" },
  { id: "dae1016d-0c1f-5406-ac76-ddce1b51e53f", gradeId: "f9b38c93-ea1c-4937-87eb-01efc1095327", name: "Lớp 3B" },
  { id: "1a1a1a1a-1111-2222-3333-444444444401", gradeId: "f9b38c93-ea1c-4937-87eb-01efc1095327", name: "Lớp 1A" },
  { id: "1b1b1b1b-1111-2222-3333-444444444402", gradeId: "f9b38c93-ea1c-4937-87eb-01efc1095327", name: "Lớp 1B" },
  { id: "2a2a2a2a-1111-2222-3333-444444444401", gradeId: "f9b38c93-ea1c-4937-87eb-01efc1095327", name: "Lớp 2A" },
  { id: "2b2b2b2b-1111-2222-3333-444444444402", gradeId: "f9b38c93-ea1c-4937-87eb-01efc1095327", name: "Lớp 2B" },

  // Danh sách lớp Khối lớp 4-5
  { id: "3d0d3bdc-7593-56ab-a737-d0b1e42ea20c", gradeId: "2a57fba0-b314-4e53-898e-d3cf0ecc294b", name: "Lớp 4A" },
  { id: "aae623a9-b551-4a2c-81d5-9e025682c240", gradeId: "2a57fba0-b314-4e53-898e-d3cf0ecc294b", name: "Lớp 5A" },
  { id: "b546c0e2-8279-4d77-8c1c-6546c5c29f18", gradeId: "2a57fba0-b314-4e53-898e-d3cf0ecc294b", name: "Lớp 5B" },
  { id: "59663c03-1518-47f8-8d2d-6d8f5b009c1d", gradeId: "2a57fba0-b314-4e53-898e-d3cf0ecc294b", name: "Lớp 5C" },

  // Danh sách lớp Khối Mầm non
  { id: "93563efa-0001-4bcd-a640-a84a33d02201", gradeId: "93563efa-d808-4bcd-a640-a84a33d02244", name: "Lớp Mầm 1" },
  { id: "93563efa-0002-4bcd-a640-a84a33d02202", gradeId: "93563efa-d808-4bcd-a640-a84a33d02244", name: "Lớp Chồi 1" },
  { id: "93563efa-0003-4bcd-a640-a84a33d02203", gradeId: "93563efa-d808-4bcd-a640-a84a33d02244", name: "Lớp Lá 1" },
];

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

  const [grades, setGrades] = useState(FALLBACK_GRADES);
  const [classes, setClasses] = useState(FALLBACK_CLASSES);
  const [selectedGradeId, setSelectedGradeId] = useState(gradeId || "f9b38c93-ea1c-4937-87eb-01efc1095327");
  const [selectedClassId, setSelectedClassId] = useState("3b39cbbc-6a5d-5b0a-9999-29ac586cbee0");
  const [loading, setLoading] = useState(false);

  const hasPreselectedGrade = Boolean(gradeId || gradeName);

  // Helper ánh xạ khối học (Grade Block) sang các mã khối lớp cụ thể
  const resolveTargetGradeIds = (targetId, name = "") => {
    if (!targetId || targetId === "all" || targetId === "DEFAULT_BLOCK")
      return null;
    const t = String(targetId).toLowerCase();
    const n = String(name).toLowerCase();

    if (
      t === "block_1_3" ||
      t === "grade_1_3" ||
      t === "f9b38c93-ea1c-4937-87eb-01efc1095327" ||
      t.includes("1-3") ||
      n.includes("1-3") ||
      n.includes("1 - 3") ||
      ["grade-1", "grade-2", "grade-3"].includes(t)
    ) {
      return [
        "f9b38c93-ea1c-4937-87eb-01efc1095327",
        "BLOCK_1_3",
        "GRADE_1_3",
        "grade-1",
        "grade-2",
        "grade-3",
      ];
    }

    if (
      t === "block_4_5" ||
      t === "grade_4_5" ||
      t === "2a57fba0-b314-4e53-898e-d3cf0ecc294b" ||
      t.includes("4-5") ||
      n.includes("4-5") ||
      n.includes("4 - 5") ||
      ["grade-4", "grade-5"].includes(t)
    ) {
      return [
        "2a57fba0-b314-4e53-898e-d3cf0ecc294b",
        "BLOCK_4_5",
        "GRADE_4_5",
        "grade-4",
        "grade-5",
      ];
    }

    if (
      t === "93563efa-d808-4bcd-a640-a84a33d02244" ||
      t === "mam_non" ||
      t.includes("mam") ||
      n.includes("mầm") ||
      n.includes("mam")
    ) {
      return [
        "93563efa-d808-4bcd-a640-a84a33d02244",
        "MAM_NON",
        "grade-mn",
      ];
    }

    return [targetId];
  };

  // Load real grades and classes only if user is logged in (has token) and not public guest
  useEffect(() => {
    if (!isOpen) return;

    const token = getStorage(STORAGE.TOKEN);
    // Guest or public portal: use fallback grades & classes without calling protected APIs
    if (!token || schoolCode) {
      setGrades(FALLBACK_GRADES);
      setClasses(FALLBACK_CLASSES);
      return;
    }

    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
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

        if (mounted) {
          if (
            gradesRes.status === "fulfilled" &&
            Array.isArray(gradesRes.value?.data) &&
            gradesRes.value.data.length > 0
          ) {
            setGrades(gradesRes.value.data);
            if (!gradeId) {
              setSelectedGradeId(gradesRes.value.data[0].id);
            }
          }

          if (
            classesRes.status === "fulfilled" &&
            Array.isArray(classesRes.value?.data) &&
            classesRes.value.data.length > 0
          ) {
            setClasses(classesRes.value.data);
          }
        }
      } catch (err) {
        console.warn("Using fallback grades/classes for traceability", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isOpen, schoolCode, gradeId]);

  // Đồng bộ khối khi prop gradeId thay đổi
  useEffect(() => {
    if (gradeId) {
      setSelectedGradeId(gradeId);
    }
  }, [gradeId]);

  // Lọc danh sách lớp theo khối:
  // Nếu có gradeId truyền từ Menu Detail (ví dụ UUID khối hoặc mã khối): lọc đúng các lớp thuộc khối đó
  const targetGradeIds = useMemo(
    () => resolveTargetGradeIds(gradeId || selectedGradeId, gradeName),
    [gradeId, selectedGradeId, gradeName]
  );

  const filteredClasses = useMemo(() => {
    let list = classes.filter((c) => {
      if (!targetGradeIds) return true;
      return targetGradeIds.includes(c.gradeId) || c.gradeId === gradeId;
    });
    // Đảm bảo không bao giờ bị rỗng (fallback tất cả các lớp nếu không khớp khối)
    return list.length > 0 ? list : classes;
  }, [classes, targetGradeIds, gradeId]);

  // Tự động chọn lớp đầu tiên của khối đó
  useEffect(() => {
    if (!isOpen) return;
    if (filteredClasses.length > 0) {
      const exists = filteredClasses.some((c) => c.id === selectedClassId);
      if (!exists) {
        setSelectedClassId(filteredClasses[0].id);
      }
    }
  }, [isOpen, filteredClasses, selectedClassId]);

  const handleApply = () => {
    const chosenClass =
      classes.find((c) => c.id === selectedClassId) || filteredClasses[0];
    const className = chosenClass?.name || "Lớp học";
    const classIdToUse = chosenClass?.id || selectedClassId;

    onClose();
    const basePath = schoolCode
      ? `/school/${schoolCode}/meal-traceability`
      : ROUTER.SCHOOL_MEAL_TRACEABILITY;
    navigate(
      `${basePath}?classId=${classIdToUse}&className=${encodeURIComponent(
        className,
      )}&date=${menuDate || "2026-11-16"}&mealType=${mealType || "LUNCH"}`,
    );
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
            <span>Ngày phục vụ: <strong>{menuDate || "16/11/2026"}</strong></span>
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
                      (selectedGradeId === "BLOCK_1_3"
                        ? "Khối 1 - 3"
                        : selectedGradeId === "BLOCK_4_5"
                        ? "Khối 4 - 5"
                        : "Khối lớp")}
                  </strong>
                </span>
              </div>
              <span className={styles.gradeNoticeBadge}>Đã chọn theo thực đơn</span>
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.label}>1. Chọn Khối học</label>
              <select
                className={styles.selectInput}
                value={selectedGradeId}
                onChange={(e) => {
                  const newGradeId = e.target.value;
                  setSelectedGradeId(newGradeId);
                  const firstCls = classes.find((c) => c.gradeId === newGradeId);
                  if (firstCls) setSelectedClassId(firstCls.id);
                }}
                disabled={loading}
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              {hasPreselectedGrade ? "Chọn Lớp học nhận suất ăn" : "2. Chọn Lớp học nhận suất ăn"}
            </label>
            <select
              className={styles.selectInput}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={loading || filteredClasses.length === 0}
            >
              {filteredClasses.length === 0 ? (
                <option value="">Không có lớp nào trong khối này</option>
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
            disabled={!selectedClassId}
          >
            <Check size={16} />
            <span>Áp dụng truy xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
