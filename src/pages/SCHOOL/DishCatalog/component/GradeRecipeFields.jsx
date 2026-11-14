import React, { useEffect, useRef, useState } from "react";
import { Alert } from "@mui/material";
import { ChevronDown } from "lucide-react";
import selectStyles from "src/pages/SCHOOL/MenuPlanning/CreateMenu/CreateMenu.module.scss";
import dishStyles from "../index.module.scss";

export function validRecipeLines(lines) {
  return (
    lines.some((line) => line.ingredientRole === "MAIN") &&
    new Set(lines.map((line) => line.ingredientEntryId)).size ===
      lines.length &&
    lines.every(
      (line) =>
        line.ingredientEntryId &&
        /^(?:0|[1-9]\d{0,10})(?:\.\d{1,3})?$/.test(
          String(line.requiredQuantity),
        ) &&
        Number(line.requiredQuantity) > 0 &&
        line.unit?.trim(),
    )
  );
}

export function sharedGradeRecipes(profiles, lines) {
  return profiles.map(({ gradeId }) => ({
    gradeId,
    lines: lines.map((line) => ({ ...line })),
  }));
}

export default function GradeRecipeFields({
  grades,
  profiles,
  onChange,
  savedGradeIds = [],
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const dropdown = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (!dropdown.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <section
      className={dishStyles.ingredientsSection}
      aria-label="Định lượng theo khối"
    >
      <div className={dishStyles.sectionHeaderRow}>
        <div className={dishStyles.sectionTitleBlock}>
          <label className={dishStyles.sectionTitle}>
            Định lượng theo khối
          </label>
          <span className={dishStyles.sectionHint}>
            Các khối được chọn dùng chung định lượng nhập bên dưới
          </span>
        </div>
      </div>
      {!grades.length ? (
        <Alert severity="info">
          Chưa có khối để nhập định lượng. Ban Giám hiệu cần cấu hình khối
          trước.
        </Alert>
      ) : (
        <div ref={dropdown} className={selectStyles.multiSelectContainer}>
          <button
            type="button"
            className={`${selectStyles.selectTrigger} ${open ? selectStyles.selectTriggerOpen : ""}`}
            aria-expanded={open}
            aria-controls="dish-grade-options"
            disabled={disabled}
            onClick={() => setOpen((value) => !value)}
          >
            <span
              className={`${selectStyles.selectValueText} ${profiles.length ? "" : selectStyles.selectPlaceholder}`}
            >
              {grades
                .filter((grade) =>
                  profiles.some((item) => item.gradeId === grade.id),
                )
                .map((grade) => grade.name)
                .join(", ") || "Chọn khối lớp áp dụng..."}
            </span>
            <ChevronDown size={16} className={selectStyles.selectChevron} />
          </button>
          {open && (
            <div
              id="dish-grade-options"
              className={selectStyles.selectDropdownMenu}
            >
              <label className={selectStyles.dropdownOptionAll}>
                <input
                  type="checkbox"
                  className={selectStyles.dropdownCheckbox}
                  disabled={disabled}
                  checked={grades.every((grade) =>
                    profiles.some((item) => item.gradeId === grade.id),
                  )}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [
                          ...profiles,
                          ...grades
                            .filter(
                              (grade) =>
                                !profiles.some(
                                  (item) => item.gradeId === grade.id,
                                ),
                            )
                            .map((grade) => ({
                              gradeId: grade.id,
                              lines: [],
                            })),
                        ]
                      : [];
                    onChange(next);
                  }}
                />
                <span className={selectStyles.dropdownOptionTextBold}>
                  Chọn tất cả khối
                </span>
              </label>
              {grades.map((grade) => (
                <label
                  key={grade.id}
                  className={selectStyles.dropdownOptionItem}
                >
                  <input
                    type="checkbox"
                    className={selectStyles.dropdownCheckbox}
                    checked={profiles.some((item) => item.gradeId === grade.id)}
                    disabled={disabled}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onChange([
                          ...profiles,
                          {
                            gradeId: grade.id,
                            lines: [],
                          },
                        ]);
                      } else
                        onChange(
                          profiles.filter((item) => item.gradeId !== grade.id),
                        );
                    }}
                  />
                  <span className={selectStyles.dropdownOptionText}>
                    {grade.name}
                    {savedGradeIds.includes(grade.id) ? " · đã lưu" : ""}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
