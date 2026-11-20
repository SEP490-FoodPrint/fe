import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material"
import MealPortionService from "src/services/MealPortionService"

const errorMessage = (failure, fallback) =>
  failure?.response?.data?.message || failure?.message || fallback

/**
 * GVCN khai dị ứng của lớp theo MỘT danh sách chung: chọn các nguyên liệu dị ứng (kho trường,
 * NCC đã liên kết) và nhập MỘT số học sinh dị ứng chung. Một em dị ứng nhiều nguyên liệu vẫn chỉ tính 1.
 */
export default function ClassAllergyDialog({ open, onClose, onSaved, allergies, maxStudents }) {
  const [options, setOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [selected, setSelected] = useState([])
  const [studentCount, setStudentCount] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    let active = true
    setError("")
    const current = allergies || []
    setSelected(current.map(item => ({
      ingredientEntryId: item.ingredientEntryId,
      name: item.IngredientEntry?.Ingredient?.name || "Nguyên liệu",
    })))
    // Hồ sơ cũ có thể lệch số giữa các nguyên liệu: lấy số lớn nhất để không thiếu suất
    setStudentCount(current.length ? String(Math.max(...current.map(item => Number(item.affectedCount) || 0))) : "")
    setLoadingOptions(true)
    MealPortionService.getClassAllergyOptions()
      .then(response => { if (active) setOptions(Array.isArray(response?.data) ? response.data : []) })
      .catch(failure => { if (active) setError(errorMessage(failure, "Không tải được danh sách nguyên liệu.")) })
      .finally(() => { if (active) setLoadingOptions(false) })
    return () => { active = false }
  }, [open, allergies])

  // Gộp nguyên liệu đã khai trước đó (có thể không còn trong danh sách NCC liên kết) vào lựa chọn
  const allOptions = useMemo(() => {
    const known = new Set(options.map(option => option.ingredientEntryId))
    return [...selected.filter(item => !known.has(item.ingredientEntryId)), ...options]
  }, [options, selected])
  const selectedOptions = useMemo(() => {
    const byId = new Map(allOptions.map(option => [option.ingredientEntryId, option]))
    return selected.map(item => byId.get(item.ingredientEntryId) || item)
  }, [allOptions, selected])

  const countError = (() => {
    if (!selected.length) return ""
    const value = Number(studentCount)
    if (studentCount === "" || !Number.isInteger(value) || value < 1) return "Nhập số học sinh từ 1"
    if (maxStudents && value > maxStudents) return `Tối đa ${maxStudents} (số suất đăng ký của lớp)`
    return ""
  })()
  const valid = !countError

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    setError("")
    try {
      await MealPortionService.saveClassAllergies(
        selected.map(item => item.ingredientEntryId),
        selected.length ? Number(studentCount) : 0,
      )
      onSaved?.()
    } catch (failure) {
      setError(errorMessage(failure, "Không lưu được hồ sơ dị ứng."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật dị ứng của lớp</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <Autocomplete
          multiple
          disableCloseOnSelect
          options={allOptions}
          loading={loadingOptions}
          value={selectedOptions}
          onChange={(_, value) => setSelected(value.map(option => ({
            ingredientEntryId: option.ingredientEntryId,
            name: option.name,
          })))}
          getOptionLabel={option => option.name}
          isOptionEqualToValue={(option, value) => option.ingredientEntryId === value.ingredientEntryId}
          noOptionsText={loadingOptions ? "Đang tải..." : "Không có nguyên liệu phù hợp"}
          renderTags={(value, getTagProps) => value.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option.ingredientEntryId} size="small" label={option.name} />
          ))}
          renderOption={(props, option, { selected: isSelected }) => (
            <li {...props} key={option.ingredientEntryId}>
              <Checkbox size="small" checked={isSelected} sx={{ mr: 1, p: 0.5 }} />
              <div>
                <div>{option.name}</div>
                <small style={{ color: "var(--text-muted)" }}>
                  {[option.category, option.supplierName && `NCC: ${option.supplierName}`].filter(Boolean).join(" · ")}
                </small>
              </div>
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              size="small"
              label="Nguyên liệu dị ứng"
              placeholder={selectedOptions.length ? "" : "Tìm và tick chọn nguyên liệu..."}
            />
          )}
        />

        <TextField
          sx={{ mt: 2, width: 220 }}
          size="small"
          type="number"
          label="Số học sinh dị ứng"
          required={selected.length > 0}
          disabled={!selected.length}
          value={selected.length ? studentCount : ""}
          error={Boolean(countError)}
          helperText={countError || (selected.length ? " " : "Chọn nguyên liệu trước")}
          inputProps={{ min: 1, max: maxStudents || undefined, step: 1, inputMode: "numeric" }}
          onChange={event => setStudentCount(event.target.value)}
        />

        {!selected.length && (
          <Alert severity="info" sx={{ mt: 2 }}>Lớp chưa có nguyên liệu dị ứng nào. Lưu lúc này sẽ xoá hồ sơ dị ứng của lớp.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Huỷ</Button>
        <Button variant="contained" onClick={save} disabled={!valid || saving}>
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
