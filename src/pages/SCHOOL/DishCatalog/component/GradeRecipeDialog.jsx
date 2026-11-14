import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import http from "src/services/01_axios";
import { loadRecipeOptions, saveDishRecipe } from "src/services/DishService";

const cleanLines = (lines) =>
  lines.map(
    ({ ingredientEntryId, ingredientRole, requiredQuantity, unit }) => ({
      ingredientEntryId,
      ingredientRole,
      requiredQuantity: String(requiredQuantity),
      unit,
    }),
  );

export default function GradeRecipeDialog({ dish, onClose, onSaved }) {
  const [grades, setGrades] = useState([]);
  const [options, setOptions] = useState([]);
  const [gradeId, setGradeId] = useState("");
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      http.get("/v1/menus/context", { notifyOnError: false }),
      loadRecipeOptions(),
    ])
      .then(([context, ingredients]) => {
        if (!active) return;
        if (!Array.isArray(context?.data?.grades))
          throw new Error("Chưa tải được danh sách khối của trường.");
        setGrades(context.data.grades);
        setOptions(ingredients);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const chooseGrade = (id) => {
    setGradeId(id);
    setLines(
      cleanLines(
        dish.gradeRecipes?.find((profile) => profile.gradeId === id)?.lines ||
          [],
      ),
    );
    setError("");
  };
  const update = (index, patch) =>
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (
        !lines.some((line) => line.ingredientRole === "MAIN") ||
        lines.some(
          (line) =>
            !line.ingredientEntryId ||
            !Number.isFinite(Number(line.requiredQuantity)) ||
            Number(line.requiredQuantity) <= 0 ||
            !line.unit.trim(),
        )
      )
        throw new Error(
          "Cần có nguyên liệu chính và định lượng dương cho từng dòng.",
        );
      if (
        new Set(lines.map((line) => line.ingredientEntryId)).size !==
        lines.length
      )
        throw new Error("Không chọn trùng nguyên liệu trong cùng khối.");
      const gradeRecipes = (dish.gradeRecipes || [])
        .filter((profile) => profile.gradeId !== gradeId)
        .map((profile) => ({
          gradeId: profile.gradeId,
          lines: cleanLines(profile.lines),
        }));
      await saveDishRecipe(dish.id, {
        name: dish.name,
        category: dish.category,
        description: dish.description,
        lines: cleanLines(dish.lines),
        gradeRecipes: [...gradeRecipes, { gradeId, lines: cleanLines(lines) }],
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Không lưu được định lượng theo khối.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      onClose={saving ? undefined : onClose}
      aria-labelledby="grade-recipe-title"
    >
      <DialogTitle id="grade-recipe-title">
        Định lượng theo khối · {dish.name}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <p>
            Mỗi dòng là lượng dùng cho một suất ăn của khối. Thay đổi này áp
            dụng khi lập thực đơn mới; thực đơn đã lưu giữ nguyên định lượng.
          </p>
          {error && <Alert severity="error">{error}</Alert>}
          {loading ? (
            <p role="status">Đang tải khối và nguyên liệu...</p>
          ) : !grades.length ? (
            <Alert severity="info">
              Trường chưa có khối. Ban Giám hiệu cần tạo khối trước.
            </Alert>
          ) : (
            <label>
              Khối áp dụng{" "}
              <select
                value={gradeId}
                onChange={(event) => chooseGrade(event.target.value)}
                disabled={saving}
                style={{ padding: 8, marginLeft: 8 }}
              >
                <option value="">Chọn khối</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                    {dish.gradeRecipes?.some(
                      (profile) => profile.gradeId === grade.id,
                    )
                      ? " · đã có định lượng"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          {gradeId && (
            <>
              {!lines.length && (
                <Alert severity="info">
                  Khối này chưa có định lượng. Thêm nguyên liệu hoặc sao chép từ
                  bộ gốc để chỉnh sửa.
                </Alert>
              )}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  disabled={saving}
                  onClick={() => setLines(cleanLines(dish.lines))}
                >
                  Sao chép định lượng gốc
                </Button>
                <Button
                  disabled={saving}
                  onClick={() =>
                    setLines((current) => [
                      ...current,
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
              </Stack>
              {lines.map((line, index) => (
                <Stack
                  key={index}
                  spacing={1}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems="center"
                >
                  <select
                    aria-label={`Loại dòng ${index + 1}`}
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                    onChange={(event) =>
                      update(index, { requiredQuantity: event.target.value })
                    }
                    style={{ width: 110 }}
                  />
                  <input
                    aria-label={`Đơn vị dòng ${index + 1}`}
                    value={line.unit}
                    disabled={saving}
                    onChange={(event) =>
                      update(index, { unit: event.target.value })
                    }
                    style={{ width: 65 }}
                  />
                  <Button
                    disabled={saving}
                    onClick={() =>
                      setLines((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                    aria-label={`Xóa dòng ${index + 1}`}
                  >
                    Xóa
                  </Button>
                </Stack>
              ))}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose}>
          Đóng
        </Button>
        <Button
          variant="contained"
          disabled={loading || saving || !gradeId || !lines.length}
          onClick={save}
        >
          {saving ? "Đang lưu..." : "Lưu định lượng khối"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
