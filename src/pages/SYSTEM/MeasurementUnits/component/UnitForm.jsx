import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import service from "src/services/MeasurementUnitService";
import styles from "./UnitForm.module.scss";
const groups = {
  MASS: "Khối lượng",
  VOLUME: "Thể tích",
  COUNT: "Đếm",
  OTHER: "Khác",
};
export default function UnitForm({ unit, onClose, onSaved }) {
  const [form, setForm] = useState({
      code: unit.code ?? "",
      name: unit.name ?? "",
      symbol: unit.symbol ?? "",
      group: unit.group ?? "COUNT",
      status: unit.status ?? "ACTIVE",
      aliases: "",
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const edit = Boolean(unit.id);
  const change = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (edit)
        await service.update(unit.id, {
          name: form.name,
          status: form.status,
        });
      else
        await service.create({
          code: form.code,
          name: form.name,
          symbol: form.symbol,
          group: form.group,
          aliases: form.aliases
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        });
      onSaved();
    } catch (e) {
      setError(e.message || "Không lưu được đơn vị");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={save} noValidate>
        <DialogTitle>
          {edit ? "Chỉnh sửa đơn vị" : "Thêm đơn vị tính"}
        </DialogTitle>
        <DialogContent className={styles.fields}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required
            label="Mã đơn vị"
            value={form.code}
            onChange={change("code")}
            disabled={edit || busy}
          />
          <TextField
            required
            label="Tên hiển thị"
            value={form.name}
            onChange={change("name")}
            disabled={busy}
          />
          <TextField
            required
            label="Ký hiệu"
            value={form.symbol}
            onChange={change("symbol")}
            disabled={edit || busy}
          />
          <TextField
            select
            label="Nhóm"
            value={form.group}
            onChange={change("group")}
            disabled={edit || busy}
          >
            {Object.entries(groups).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {!edit && (
            <TextField
              label="Tên gọi khác (alias)"
              value={form.aliases}
              onChange={change("aliases")}
              helperText="Phân cách bằng dấu phẩy. Không đổi sau khi tạo."
              disabled={busy}
            />
          )}
          {edit && (
            <TextField
              select
              label="Trạng thái"
              value={form.status}
              onChange={change("status")}
              disabled={busy}
            >
              <MenuItem value="ACTIVE">Đang dùng</MenuItem>
              <MenuItem value="INACTIVE">Ngừng dùng</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions className={styles.actions}>
          <Button onClick={onClose} disabled={busy}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
