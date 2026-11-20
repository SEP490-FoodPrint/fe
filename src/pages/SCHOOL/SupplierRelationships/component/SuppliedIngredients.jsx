import React, { useState } from "react"
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import { Pencil } from "lucide-react"
import { displayName } from "src/lib/displayName"
import { HANDLING_TYPE_OPTIONS } from "src/constants/ui"
import { handlingChanges, handlingText } from "src/lib/ingredientHandling"
import styles from "./SuppliedIngredients.module.scss"

const dateText = (value) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN") : "—"
const categoryText = (value) => (value === "Thịt" ? "Thịt tươi" : value || "—")

// Bảng nguyên liệu thuộc hợp đồng đang hiệu lực của trường với NCC.
// Chỉ đổi loại Lưu kho / Dùng ngay; muốn đổi phạm vi phải tạo hồ sơ hợp đồng mới.
function SuppliedIngredients({ items, canManage, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const changes = handlingChanges(items, draft)

  const startEdit = () => {
    setDraft(
      Object.fromEntries(items.map((item) => [item.ingredientId, item.handlingType || ""])),
    )
    setError("")
    setEditing(true)
  }
  const cancel = () => {
    setEditing(false)
    setConfirming(false)
    setError("")
  }
  const save = async () => {
    setSaving(true)
    setError("")
    try {
      await onSave(
        changes.map(({ ingredientId, to }) => ({ ingredientId, handlingType: to })),
      )
      setConfirming(false)
      setEditing(false)
    } catch (failure) {
      setError(
        failure?.response?.data?.message ||
          failure?.message ||
          "Không thể lưu loại nguyên liệu.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="supplier-section-block">
      <div className={styles.header}>
        <div>
          <h3>Nguyên liệu cung cấp cho trường</h3>
          <p className="supplier-help">
            Theo hợp đồng đang hiệu lực. Xe chỉ toàn hàng &ldquo;Lưu kho&rdquo; do Ban quản lý
            nguyên liệu kiểm tra; có hàng &ldquo;Dùng ngay&rdquo; thì theo phân nhóm duyệt của trường.
          </p>
        </div>
        {canManage && items.length > 0 && !editing && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Pencil size={14} />}
            onClick={startEdit}
          >
            Chỉnh sửa
          </Button>
        )}
        {editing && (
          <div className={styles.actions}>
            <Button size="small" color="inherit" onClick={cancel} disabled={saving}>
              Huỷ
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={!changes.length || saving}
              onClick={() => {
                setError("")
                setConfirming(true)
              }}
            >
              Lưu
            </Button>
          </div>
        )}
      </div>
      {error && !confirming && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}
      {items.length ? (
        <TableContainer className={styles.table}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên nguyên liệu</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Hợp đồng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.ingredientId}>
                  <TableCell>{displayName(item.name)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{categoryText(item.category)}</TableCell>
                  <TableCell className={styles.handlingCell}>
                    {editing ? (
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={draft[item.ingredientId] || ""}
                        onChange={(event) =>
                          setDraft((previous) => ({
                            ...previous,
                            [item.ingredientId]: event.target.value,
                          }))
                        }
                        SelectProps={{
                          displayEmpty: true,
                          renderValue: (value) => (value ? handlingText(value) : "Chọn loại"),
                        }}
                        inputProps={{ "aria-label": `Loại của ${item.name}` }}
                      >
                        {HANDLING_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <Chip
                        size="small"
                        variant="outlined"
                        color={
                          item.handlingType === "DRY_STOCK"
                            ? "warning"
                            : item.handlingType === "DIRECT_USE"
                              ? "success"
                              : "default"
                        }
                        label={handlingText(item.handlingType)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.contracts.map((contract) => (
                      <div key={contract.id} className={styles.contract}>
                        <strong>{displayName(contract.number) || "—"}</strong>
                        <span>
                          {dateText(contract.startsOn)} – {dateText(contract.endsOn)}
                        </span>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p className="supplier-help">Chưa có hợp đồng đang hiệu lực với nhà cung cấp này.</p>
      )}

      <Dialog open={confirming} onClose={() => !saving && setConfirming(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận đổi loại nguyên liệu</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}
          <ul className={styles.changes}>
            {changes.map((change) => (
              <li key={change.ingredientId}>
                <strong>{displayName(change.name)}</strong>: {handlingText(change.from)} →{" "}
                {handlingText(change.to)}
              </li>
            ))}
          </ul>
          <p className="supplier-help">
            Áp dụng cho các xe giao từ nay. Không đổi được khi còn xe đã đến hoặc đang chờ duyệt
            có nguyên liệu này.
          </p>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" disabled={saving} onClick={() => setConfirming(false)}>
            Quay lại
          </Button>
          <Button variant="contained" disabled={saving} onClick={save}>
            {saving ? "Đang lưu…" : "Xác nhận lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}

export default SuppliedIngredients
