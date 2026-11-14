import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
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

export default function GradeRecipeFields({
  grades,
  options,
  profiles,
  onChange,
  baseLines,
  savedGradeIds = [],
  disabled,
}) {
  const [gradeId, setGradeId] = useState("");
  const [open, setOpen] = useState(false);
  const dropdown = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (!dropdown.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const activeId = profiles.some((item) => item.gradeId === gradeId)
    ? gradeId
    : profiles[0]?.gradeId;
  const profile = profiles.find((item) => item.gradeId === activeId);
  const lines = profile?.lines || [];
  const setLines = (next) =>
    onChange([
      ...profiles.filter((item) => item.gradeId !== activeId),
      { gradeId: activeId, lines: next },
    ]);
  const update = (index, changes) =>
    setLines(
      lines.map((line, i) => (i === index ? { ...line, ...changes } : line)),
    );
  return (
    <section
      className={dishStyles.ingredientsSection}
      aria-label="Định lượng theo khối"
    >
      <h3 className={dishStyles.sectionTitle}>Định lượng theo khối</h3>
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
                              lines: baseLines.map((line) => ({ ...line })),
                            })),
                        ]
                      : profiles.filter((item) =>
                          savedGradeIds.includes(item.gradeId),
                        );
                    onChange(next);
                    if (next.length) setGradeId(next[0].gradeId);
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
                    disabled={disabled || savedGradeIds.includes(grade.id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onChange([
                          ...profiles,
                          {
                            gradeId: grade.id,
                            lines: baseLines.map((line) => ({ ...line })),
                          },
                        ]);
                        setGradeId(grade.id);
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
      {activeId && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <label className={dishStyles.formLabel}>
            Khối đang chỉnh sửa{" "}
            <select
              className={dishStyles.formSelect}
              value={activeId}
              onChange={(event) => setGradeId(event.target.value)}
              disabled={disabled}
            >
              {profiles.map((item) => (
                <option key={item.gradeId} value={item.gradeId}>
                  {grades.find((grade) => grade.id === item.gradeId)?.name ||
                    "Khối đã lưu"}
                </option>
              ))}
            </select>
          </label>
          {!profile && (
            <Alert severity="info">Khối này chưa có định lượng.</Alert>
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              sx={{ color: "#0a8066", textTransform: "none" }}
              disabled={disabled || !baseLines.length}
              onClick={() => setLines(baseLines.map((line) => ({ ...line })))}
            >
              Sao chép định lượng gốc
            </Button>
            <Button
              sx={{ color: "#0a8066", textTransform: "none" }}
              disabled={disabled}
              onClick={() =>
                setLines([
                  ...lines,
                  {
                    ingredientEntryId: "",
                    ingredientRole: "MAIN",
                    requiredQuantity: "",
                    unit: "g",
                  },
                ])
              }
            >
              Thêm nguyên liệu
            </Button>
            {profile && !savedGradeIds.includes(activeId) && (
              <Button
                sx={{ color: "#64748b", textTransform: "none" }}
                disabled={disabled}
                onClick={() =>
                  onChange(profiles.filter((item) => item.gradeId !== activeId))
                }
              >
                Bỏ bộ định lượng này
              </Button>
            )}
          </Stack>
          {lines.map((line, index) => (
            <Stack
              key={index}
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems="center"
            >
              <select
                className={dishStyles.formSelect}
                aria-label={`Loại dòng ${index + 1}`}
                disabled={disabled}
                value={line.ingredientRole}
                onChange={(event) =>
                  update(index, {
                    ingredientRole: event.target.value,
                    ingredientEntryId: "",
                  })
                }
              >
                <option value="MAIN">Nguyên liệu chính</option>
                <option value="SEASONING">Gia vị</option>
              </select>
              <select
                className={dishStyles.formSelect}
                aria-label={`Nguyên liệu dòng ${index + 1}`}
                disabled={disabled}
                value={line.ingredientEntryId}
                onChange={(event) => {
                  const option = options.find(
                    (item) => item.id === event.target.value,
                  );
                  update(index, {
                    ingredientEntryId: event.target.value,
                    unit: option?.defaultUnit || "g",
                  });
                }}
                style={{ flex: 1, minWidth: 150 }}
              >
                <option value="">Chọn nguyên liệu</option>
                {options
                  .filter((option) =>
                    line.ingredientRole === "MAIN"
                      ? option.mainAllowed
                      : option.seasoningAllowed,
                  )
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} · {option.supplierName}
                    </option>
                  ))}
              </select>
              <input
                className={dishStyles.formSelect}
                aria-label={`Định lượng mỗi suất dòng ${index + 1}`}
                type="number"
                min="0.001"
                step="0.001"
                value={line.requiredQuantity}
                disabled={disabled}
                onChange={(event) =>
                  update(index, { requiredQuantity: event.target.value })
                }
                style={{ width: 100 }}
              />
              <input
                className={dishStyles.formSelect}
                aria-label={`Đơn vị dòng ${index + 1}`}
                value={line.unit}
                disabled={disabled}
                onChange={(event) =>
                  update(index, { unit: event.target.value })
                }
                style={{ width: 60 }}
              />
              <Button
                sx={{ color: "#64748b", textTransform: "none" }}
                disabled={disabled}
                onClick={() => setLines(lines.filter((_, i) => i !== index))}
                aria-label={`Xóa dòng ${index + 1}`}
              >
                Xóa
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </section>
  );
}
