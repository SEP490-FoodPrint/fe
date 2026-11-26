import React, { useRef } from "react";
import { Alert } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import dishStyles from "../index.module.scss";

/** Đơn vị được phép cho mốc chuẩn của món. */
export const DISH_STANDARD_UNITS = ["g", "ml"];

const QUANTITY_PATTERN = /^(?:0|[1-9]\d{0,10})(?:\.\d{1,3})?$/;

/** Số dương, tối đa 3 chữ số thập phân (khớp validation BE). */
export function validQuantity(value) {
  const text = String(value ?? "").trim();
  return QUANTITY_PATTERN.test(text) && Number(text) > 0;
}

/** Lỗi đầu tiên của công thức, hoặc chuỗi rỗng khi hợp lệ. */
export function recipeLinesIssue(lines) {
  if (!lines.some((line) => line.ingredientRole === "MAIN"))
    return "Chọn nguyên liệu chính.";
  if (lines.some((line) => !line.ingredientEntryId))
    return "Còn dòng chưa chọn nguyên liệu.";
  if (new Set(lines.map((line) => line.ingredientEntryId)).size !== lines.length)
    return "Nguyên liệu bị trùng.";
  if (!lines.every((line) => validQuantity(line.requiredQuantity)))
    return "Định lượng phải lớn hơn 0, tối đa 3 số lẻ.";
  if (!lines.every((line) => line.unit?.trim())) return "Đơn vị chưa hợp lệ.";
  return "";
}

export function validRecipeLines(lines) {
  return !recipeLinesIssue(lines);
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

const EMPTY_ROW = { gradeId: "", portionQuantity: "" };

export default function GradeRecipeFields({
  grades,
  profiles,
  onChange,
  standardQuantity,
  standardUnit,
  standardLocked = false,
  onStandardChange,
  lines = [],
  savedProfiles = [],
  disabled,
}) {
  const rowSeq = useRef(0);
  const nextRowKey = () => `grade-row-${++rowSeq.current}`;
  const threshold = standardThreshold(lines, standardUnit);
  const standardIssue =
    String(standardQuantity ?? "").trim() === ""
      ? ""
      : standardQuantityIssue(lines, standardQuantity, standardUnit);
  const gradeName = (gradeId) =>
    grades.find((grade) => grade.id === gradeId)?.name || "Khối";
  const savedPortion = (gradeId) =>
    savedProfiles.find((profile) => profile.gradeId === gradeId)
      ?.portionQuantity ?? "";
  // Luôn hiển thị ít nhất 1 dòng để người dùng bắt đầu chọn khối.
  const rows = profiles.length ? profiles : [EMPTY_ROW];
  const canAdd = !disabled && rows.length < grades.length;
  const updateRow = (index, patch) =>
    onChange(
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  const selectGrade = (index, gradeId) => {
    const row = rows[index];
    const keepTyped =
      String(row.portionQuantity ?? "").trim() !== "" &&
      row.portionQuantity !== savedPortion(row.gradeId);
    updateRow(index, {
      gradeId,
      // Khối đã lưu: điền sẵn khẩu phần cũ nếu người dùng chưa tự nhập.
      portionQuantity: keepTyped ? row.portionQuantity : savedPortion(gradeId),
    });
  };
  const addRow = (index) => {
    if (!canAdd) return;
    const next = [...rows];
    next.splice(index + 1, 0, { ...EMPTY_ROW, rowKey: nextRowKey() });
    onChange(next);
  };
  const removeRow = (index) => onChange(rows.filter((_, i) => i !== index));
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
            readOnly={standardLocked}
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
            disabled={disabled || standardLocked}
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
        {standardLocked
          ? `Mọi nguyên liệu và gia vị cùng dùng ${standardUnit} nên mốc chuẩn tự lấy bằng tổng định lượng (${standardQuantity || 0} ${standardUnit}).`
          : threshold
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
            Mỗi dòng chọn 1 khối và nhập khối lượng 1 suất ({standardUnit});
            định lượng nguyên liệu g/ml được tính theo tỉ lệ với mốc chuẩn, đơn
            vị đếm (quả, hộp…) giữ nguyên
          </span>
        </div>
      </div>
      {!grades.length ? (
        <Alert severity="info">
          Chưa có khối để nhập khẩu phần. Ban Giám hiệu cần cấu hình khối trước.
        </Alert>
      ) : (
        <div className={dishStyles.gradePortionList}>
          <div className={dishStyles.gradePortionHead} aria-hidden="true">
            <span>Khối</span>
            <span>Khẩu phần ({standardUnit}/suất)</span>
            <span />
          </div>
          {rows.map((row, index) => {
            const takenByOthers = new Set(
              rows
                .filter((other, i) => i !== index && other.gradeId)
                .map((other) => other.gradeId),
            );
            const rowId = row.rowKey ?? row.gradeId ?? `row-${index}`;
            return (
              <div key={rowId} className={dishStyles.gradePortionRow}>
                <select
                  className={dishStyles.formSelect}
                  aria-label={`Khối dòng ${index + 1}`}
                  value={row.gradeId || ""}
                  disabled={disabled}
                  onChange={(event) => selectGrade(index, event.target.value)}
                >
                  <option value="" disabled>
                    Chọn khối...
                  </option>
                  {grades
                    .filter(
                      (grade) =>
                        grade.id === row.gradeId || !takenByOthers.has(grade.id),
                    )
                    .map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                        {savedProfiles.some(
                          (profile) => profile.gradeId === grade.id,
                        )
                          ? " · đã lưu"
                          : ""}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  aria-label={`Khẩu phần ${row.gradeId ? gradeName(row.gradeId) : `dòng ${index + 1}`}`}
                  className={dishStyles.formInput}
                  placeholder={`Ví dụ: ${standardQuantity || 100}`}
                  value={row.portionQuantity ?? ""}
                  disabled={disabled}
                  onWheel={(event) => event.currentTarget.blur()}
                  onChange={(event) =>
                    updateRow(index, { portionQuantity: event.target.value })
                  }
                />
                <div className={dishStyles.gradePortionActions}>
                  <button
                    type="button"
                    className={dishStyles.gradeRowAddBtn}
                    onClick={() => addRow(index)}
                    disabled={!canAdd}
                    title={
                      canAdd ? "Thêm dòng khối" : "Đã đủ số khối có thể chọn"
                    }
                    aria-label="Thêm dòng khối"
                  >
                    <Plus size={15} />
                  </button>
                  <button
                    type="button"
                    className={dishStyles.gradeRowRemoveBtn}
                    onClick={() => removeRow(index)}
                    disabled={disabled || (rows.length === 1 && !row.gradeId && !row.portionQuantity)}
                    title="Xóa dòng này"
                    aria-label="Xóa dòng khối"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {removedSaved.length > 0 && (
        <Alert severity="info">
          Xóa dòng khối chỉ không cập nhật khối đó; khẩu phần đã lưu của{" "}
          {removedSaved.map((profile) => gradeName(profile.gradeId)).join(", ")} vẫn được giữ nguyên.
        </Alert>
      )}
    </section>
  );
}
