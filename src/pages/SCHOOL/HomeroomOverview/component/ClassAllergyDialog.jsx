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
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material"
import { Plus, Trash2 } from "lucide-react"
import MealPortionService from "src/services/MealPortionService"
import { groupAllergyRows } from "src/utils/allergyGroups"

const errorMessage = (failure, fallback) =>
  failure?.response?.data?.message || failure?.message || fallback

let nextKey = 0
const newGroup = (items = [], count = "") => ({ key: `g${nextKey++}`, items, count })

/**
 * GVCN khai dị ứng của lớp theo NHÓM: mỗi nhóm là các nguyên liệu mà một nhóm học sinh cùng phải tránh
 * + số học sinh của nhóm. Ví dụ "Sữa": 1, "Lạc": 1, "Sữa + Lạc": 1 -> tổng 3 học sinh dị ứng.
 */
export default function ClassAllergyDialog({ open, onClose, onSaved, allergies, maxStudents }) {
  const [options, setOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [groups, setGroups] = useState([])
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    let active = true
    setError("")
    const current = groupAllergyRows(allergies || [])
    setGroups(current.length
      ? current.map(group => newGroup(group.items, String(group.count)))
      : [newGroup()])
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
    const extra = new Map()
    for (const group of groups)
      for (const item of group.items)
        if (!known.has(item.ingredientEntryId)) extra.set(item.ingredientEntryId, item)
    return [...extra.values(), ...options]
  }, [options, groups])
  const optionById = useMemo(
    () => new Map(allOptions.map(option => [option.ingredientEntryId, option])),
    [allOptions],
  )

  // Nhóm còn trống hoàn toàn (chưa chọn gì, chưa nhập số) thì bỏ qua khi lưu
  const filled = groups.filter(group => group.items.length || group.count !== "")
  const total = filled.reduce((sum, group) => sum + (Number(group.count) || 0), 0)
  const groupError = group => {
    if (!group.items.length && group.count === "") return ""
    if (!group.items.length) return "Chọn ít nhất một nguyên liệu"
    const value = Number(group.count)
    if (group.count === "" || !Number.isInteger(value) || value < 1) return "Nhập số học sinh từ 1"
    return ""
  }
  const setKey = group => group.items.map(item => item.ingredientEntryId).sort().join("|")
  const duplicate = filled.some((group, index) =>
    group.items.length && filled.findIndex(other => setKey(other) === setKey(group)) !== index)
  const totalError = maxStudents && total > maxStudents
    ? `Tổng ${total} học sinh vượt số suất đăng ký của lớp (${maxStudents})`
    : ""
  const valid = filled.every(group => !groupError(group)) && !duplicate && !totalError

  const update = (key, patch) =>
    setGroups(current => current.map(group => (group.key === key ? { ...group, ...patch } : group)))

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    setError("")
    try {
      await MealPortionService.saveClassAllergies(filled.map(group => ({
        ingredientEntryIds: group.items.map(item => item.ingredientEntryId),
        affectedCount: Number(group.count),
      })))
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
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-muted)" }}>
          Mỗi nhóm là các nguyên liệu mà một nhóm học sinh cùng phải tránh. Em dị ứng cả sữa và lạc thì tạo
          nhóm &quot;Sữa + Lạc&quot;, không khai lại ở nhóm &quot;Sữa&quot; hay &quot;Lạc&quot;.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {groups.map((group, index) => {
            const message = groupError(group)
            return (
              <div
                key={group.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 120px 36px",
                  gap: 8,
                  alignItems: "start",
                  padding: 12,
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={allOptions}
                  loading={loadingOptions}
                  value={group.items.map(item => optionById.get(item.ingredientEntryId) || item)}
                  onChange={(_, value) => update(group.key, {
                    items: value.map(option => ({ ingredientEntryId: option.ingredientEntryId, name: option.name })),
                  })}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) => option.ingredientEntryId === value.ingredientEntryId}
                  noOptionsText={loadingOptions ? "Đang tải..." : "Không có nguyên liệu phù hợp"}
                  renderTags={(value, getTagProps) => value.map((option, tagIndex) => (
                    <Chip {...getTagProps({ index: tagIndex })} key={option.ingredientEntryId} size="small" label={option.name} />
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
                      label={`Nhóm ${index + 1} · nguyên liệu cùng tránh`}
                      placeholder={group.items.length ? "" : "Tìm và tick chọn nguyên liệu..."}
                      error={Boolean(message) && !group.items.length}
                      helperText={message || " "}
                    />
                  )}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Số học sinh"
                  value={group.count}
                  error={Boolean(message) && Boolean(group.items.length)}
                  inputProps={{ min: 1, step: 1, inputMode: "numeric" }}
                  onChange={event => update(group.key, { count: event.target.value })}
                />
                <Tooltip title="Xoá nhóm">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Xoá nhóm ${index + 1}`}
                      disabled={saving}
                      onClick={() => setGroups(current => current.filter(item => item.key !== group.key))}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              </div>
            )
          })}
        </div>

        <Button
          sx={{ mt: 1.5 }}
          size="small"
          startIcon={<Plus size={16} />}
          disabled={saving || groups.length >= 50}
          onClick={() => setGroups(current => [...current, newGroup()])}
        >
          Thêm nhóm dị ứng
        </Button>

        <div style={{ marginTop: 12, fontSize: 14 }}>
          Tổng: <strong>{total}</strong> học sinh dị ứng
          {maxStudents ? <span style={{ color: "var(--text-muted)" }}>{` / ${maxStudents} suất đăng ký`}</span> : null}
        </div>
        {duplicate && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            Có hai nhóm trùng đúng một tập nguyên liệu. Hãy gộp số học sinh vào một nhóm.
          </Alert>
        )}
        {totalError && <Alert severity="warning" sx={{ mt: 1.5 }}>{totalError}</Alert>}
        {!filled.length && (
          <Alert severity="info" sx={{ mt: 1.5 }}>Lớp chưa có nhóm dị ứng nào. Lưu lúc này sẽ xoá hồ sơ dị ứng của lớp.</Alert>
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
