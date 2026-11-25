import React, { useEffect, useRef, useState } from "react";
import { Alert } from "@mui/material";
import { ChevronDown } from "lucide-react";
import selectStyles from "src/pages/SCHOOL/MenuPlanning/CreateMenu/CreateMenu.module.scss";
import dishStyles from "../index.module.scss";

/** Đơn vị được phép cho mốc chuẩn của món. */
export const DISH_STANDARD_UNITS = ["g", "ml"];

const QUANTITY_PATTERN = /^(?:0|[1-9]\d{0,10})(?:\.\d{1,3})?$/;

/** Số dương, tối đa 3 chữ số thập phân (khớp validation BE). */
export function validQuantity(value) {
  const text = String(value ?? "").trim();
  return QUANTITY_PATTERN.test(text) && Number(text) > 0;
}

export function validRecipeLines(lines) {
  return (
    lines.some((line) => line.ingredientRole === "MAIN") &&
    new Set(lines.map((line) => line.ingredientEntryId)).size ===
      lines.length &&
    lines.every(
      (line) =>
        line.ingredientEntryId &&
        validQuantity(line.requiredQuantity) &&
        line.unit?.trim(),
    )
  );
}

const normalizeUnit = (unit) => String(unit || "").trim().toLowerCase();

/** Làm tròn 3 chữ số để tránh sai số dấu phẩy động khi cộng. */
const round3 = (value) => Math.round(value * 1000) / 1000;

/**
 * Ngưỡng mốc chuẩn (khớp FR-004 ở BE). S = tổng mọi dòng (nguyên liệu chính và gia vị)
 * cùng đơn vị mốc chuẩn, không quy đổi đơn vị.
 * Trả về { total, strict } hoặc null khi không có dòng cùng đơn vị (chỉ cần > 0).
 */
export function standardThreshold(lines, standardUnit) {
  const unit = normalizeUnit(standardUnit);
  const same = lines.filter((line) => normalizeUnit(line.unit) === unit);
  if (!same.length) return null;
  const total = round3(
    same.reduce((sum, line) => sum + (Number(line.requiredQuantity) || 0), 0),
  );
  return { total, strict: same.length !== lines.length };
}

/** Thông báo lỗi của mốc chuẩn, hoặc "" nếu hợp lệ. */
export function standardQuantityIssue(lines, standardQuantity, standardUnit) {
  if (!DISH_STANDARD_UNITS.includes(normalizeUnit(standardUnit)))
    return "Mốc chuẩn chỉ dùng g hoặc ml.";
  if (!validQuantity(standardQuantity))
    return "Mốc chuẩn phải dương, tối đa 3 chữ số thập phân.";
  const threshold = standardThreshold(lines, standardUnit);
  if (!threshold) return "";
  const value = Number(standardQuantity);
  if (threshold.strict ? value > threshold.total : value >= threshold.total)
    return "";
  return threshold.strict
    ? `Mốc chuẩn phải lớn hơn ${threshold.total} ${standardUnit} (tổng nguyên liệu và gia vị cùng đơn vị, món còn nguyên liệu dùng đơn vị khác).`
    : `Mốc chuẩn phải lớn hơn hoặc bằng ${threshold.total} ${standardUnit} (tổng nguyên liệu và gia vị cùng đơn vị).`;
}

/** Payload khẩu phần theo khối gửi lên BE. */
export function gradePortionPayload(profiles) {
  return profiles.map(({ gradeId, portionQuantity }) => ({
    gradeId,
    portionQuantity: String(portionQuantity ?? "").trim(),
  }));
}

export default function GradeRecipeFields({
  grades,
  profiles,
  onChange,
  standardQuantity,
  standardUnit,
  onStandardChange,
  lines = [],
  savedProfiles = [],
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
  const threshold = standardThreshold(lines, standardUnit);
  const standardIssue =
    String(standardQuantity ?? "").trim() === ""
      ? ""
      : standardQuantityIssue(lines, standardQuantity, standardUnit);
  const gradeName = (gradeId) =>
    grades.find((grade) => grade.id === gradeId)?.name || "Khối";
  const setPortion = (gradeId, portionQuantity) =>
    onChange(
      profiles.map((item) =>
        item.gradeId === gradeId ? { ...item, portionQuantity } : item,
      ),
    );
  const profileForGrade = (grade) => ({
    gradeId: grade.id,
    portionQuantity:
      savedProfiles.find((profile) => profile.gradeId === grade.id)
        ?.portionQuantity ?? "",
  });
  const removedSaved = savedProfiles.filter(
    (saved) => !profiles.some((item) => item.gradeId === saved.gradeId),
  );

  return (
    <section
      className={dishStyles.ingredientsSection}
      aria-label="Mốc chuẩn và khẩu phần theo khối"
    >
      <div className={dishStyles.sectionHeaderRow}>
        <div className={dishStyles.sectionTitleBlock}>
          <label className={dishStyles.sectionTitle}>
            Mốc chuẩn của món <span className={dishStyles.required}>*</span>
          </label>
          <span className={dishStyles.sectionHint}>
            Định lượng nguyên liệu và gia vị ở trên tính cho đúng mốc chuẩn này
            (ví dụ 100 g gà xào nấm)
          </span>
        </div>
      </div>
      <div className={dishStyles.formDishInfoRow}>
        <div>
          <label className={dishStyles.formLabel} htmlFor="dish-standard-qty">
            Khối lượng mốc chuẩn
          </label>
          <input
            id="dish-standard-qty"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className={dishStyles.formInput}
            placeholder="Ví dụ: 100"
            value={standardQuantity}
            disabled={disabled}
            onWheel={(event) => event.currentTarget.blur()}
            onChange={(event) =>
              onStandardChange({ standardQuantity: event.target.value })
            }
          />
        </div>
        <div>
          <label className={dishStyles.formLabel} htmlFor="dish-standard-unit">
            Đơn vị
          </label>
          <select
            id="dish-standard-unit"
            className={dishStyles.formSelect}
            value={standardUnit}
            disabled={disabled}
            onChange={(event) =>
              onStandardChange({ standardUnit: event.target.value })
            }
          >
            {DISH_STANDARD_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>
      <span className={dishStyles.sectionHint}>
        {threshold
          ? `Tổng nguyên liệu và gia vị dùng ${standardUnit}: ${threshold.total} ${standardUnit}. Mốc chuẩn phải ${threshold.strict ? "lớn hơn" : "lớn hơn hoặc bằng"} ${threshold.total} ${standardUnit}.`
          : `Chưa có nguyên liệu nào dùng ${standardUnit}; mốc chuẩn chỉ cần lớn hơn 0.`}
      </span>
      {standardIssue && <Alert severity="warning">{standardIssue}</Alert>}

      <div className={dishStyles.sectionHeaderRow}>
        <div className={dishStyles.sectionTitleBlock}>
          <label className={dishStyles.sectionTitle}>
            Khẩu phần theo khối <span className={dishStyles.required}>*</span>
          </label>
          <span className={dishStyles.sectionHint}>
            Mỗi khối chỉ nhập khối lượng 1 suất ({standardUnit}); định lượng
            nguyên liệu g/ml được tính theo tỉ lệ với mốc chuẩn, đơn vị đếm (quả, hộp…) giữ nguyên
          </span>
        </div>
      </div>
      {!grades.length ? (
        <Alert severity="info">
          Chưa có khối để nhập khẩu phần. Ban Giám hiệu cần cấu hình khối trước.
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
                            .map(profileForGrade),
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
                        onChange([...profiles, profileForGrade(grade)]);
                      } else
                        onChange(
                          profiles.filter((item) => item.gradeId !== grade.id),
                        );
                    }}
                  />
                  <span className={selectStyles.dropdownOptionText}>
                    {grade.name}
                    {savedProfiles.some((profile) => profile.gradeId === grade.id)
                      ? " · đã lưu"
                      : ""}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      {profiles.length > 0 && (
        <div className={dishStyles.gradePortionGrid}>
          {[...profiles]
            .sort(
              (a, b) =>
                grades.findIndex((grade) => grade.id === a.gradeId) -
                grades.findIndex((grade) => grade.id === b.gradeId),
            )
            .map((profile) => (
            <div key={profile.gradeId}>
              <label
                className={dishStyles.formLabel}
                htmlFor={`grade-portion-${profile.gradeId}`}
              >
                {gradeName(profile.gradeId)} ({standardUnit}/suất)
              </label>
              <input
                id={`grade-portion-${profile.gradeId}`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className={dishStyles.formInput}
                placeholder={`Ví dụ: ${standardQuantity || 100}`}
                value={profile.portionQuantity ?? ""}
                disabled={disabled}
                onWheel={(event) => event.currentTarget.blur()}
                onChange={(event) =>
                  setPortion(profile.gradeId, event.target.value)
                }
              />
            </div>
          ))}
        </div>
      )}
      {removedSaved.length > 0 && (
        <Alert severity="info">
          Bỏ chọn khối chỉ không cập nhật khối đó; khẩu phần đã lưu của{" "}
          {removedSaved.map((profile) => gradeName(profile.gradeId)).join(", ")} vẫn được giữ nguyên.
        </Alert>
      )}
    </section>
  );
}
