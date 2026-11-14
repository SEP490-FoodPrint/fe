import React, { useState } from "react";
import { Alert, Button, Stack } from "@mui/material";

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
  const profile = profiles.find((item) => item.gradeId === gradeId);
  const lines = profile?.lines || [];
  const setLines = (next) =>
    onChange([
      ...profiles.filter((item) => item.gradeId !== gradeId),
      { gradeId, lines: next },
    ]);
  const update = (index, changes) =>
    setLines(
      lines.map((line, i) => (i === index ? { ...line, ...changes } : line)),
    );
  return (
    <section aria-label="Định lượng theo khối">
      <h3>Định lượng theo khối</h3>
      <p>
        Mỗi bộ định lượng được tính cho một suất. Có thể sao chép bộ gốc rồi
        chỉnh sửa cho từng khối.
      </p>
      {!grades.length ? (
        <Alert severity="info">
          Chưa có khối để nhập định lượng. Ban Giám hiệu cần cấu hình khối
          trước.
        </Alert>
      ) : (
        <label>
          Chọn khối{" "}
          <select
            value={gradeId}
            disabled={disabled}
            onChange={(event) => setGradeId(event.target.value)}
          >
            <option value="">Chọn khối</option>
            {grades.map((grade) => (
              <option value={grade.id} key={grade.id}>
                {grade.name}
                {profiles.some((item) => item.gradeId === grade.id)
                  ? " · đã nhập"
                  : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      {gradeId && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {!profile && (
            <Alert severity="info">Khối này chưa có định lượng.</Alert>
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              disabled={disabled || !baseLines.length}
              onClick={() => setLines(baseLines.map((line) => ({ ...line })))}
            >
              Sao chép định lượng gốc
            </Button>
            <Button
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
            {profile && !savedGradeIds.includes(gradeId) && (
              <Button
                disabled={disabled}
                onClick={() =>
                  onChange(profiles.filter((item) => item.gradeId !== gradeId))
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
                aria-label={`Đơn vị dòng ${index + 1}`}
                value={line.unit}
                disabled={disabled}
                onChange={(event) =>
                  update(index, { unit: event.target.value })
                }
                style={{ width: 60 }}
              />
              <Button
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
