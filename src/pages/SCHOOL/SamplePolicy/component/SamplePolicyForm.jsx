import React from "react"
import { Button, InputAdornment, Paper, TextField } from "@mui/material"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { SAMPLE_FIELDS, belowMinimum, isValidAmount } from "./samplePolicyConfig"
import styles from "./SamplePolicyForm.module.scss"

function SamplePolicyForm({ form, saved, saving, onChange, onReset, onSubmit }) {
  const changed = SAMPLE_FIELDS.some(({ name }) => form[name] !== saved[name])
  const valid = SAMPLE_FIELDS.every(({ name }) => isValidAmount(form[name]))
  // Trường chưa lưu lần nào vẫn được lưu nguyên giá trị mặc định.
  const canSave = !saving && valid && (changed || saved.isDefault)

  const submit = event => {
    event.preventDefault()
    if (canSave) onSubmit()
  }

  return (
    <Paper component="form" variant="outlined" className={styles.card} onSubmit={submit} noValidate>
      <div className={styles.fields}>
        {SAMPLE_FIELDS.map(({ name, label, unit, minimum }) => {
          const invalid = !isValidAmount(form[name])
          return (
            <div key={name} className={styles.field}>
              <TextField
                fullWidth
                label={label}
                value={form[name]}
                disabled={saving}
                error={invalid}
                helperText={invalid ? "Nhập số lớn hơn 0, tối đa 3 chữ số thập phân" : undefined}
                onChange={event => onChange(name, event.target.value)}
                slotProps={{
                  htmlInput: { inputMode: "decimal", autoComplete: "off" },
                  input: { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> },
                }}
              />
              {belowMinimum(form[name], minimum) && (
                <p className={styles.warning} role="status">
                  <AlertTriangle size={16} aria-hidden="true" />
                  <span>{`Thấp hơn mức tối thiểu ${minimum} ${unit} theo QĐ 1246/QĐ-BYT. Bạn vẫn có thể lưu.`}</span>
                </p>
              )}
            </div>
          )
        })}
      </div>

      <p className={styles.regulation}>
        Theo Quyết định 1246/QĐ-BYT, mẫu thức ăn đặc lưu tối thiểu 100 g, mẫu thức ăn lỏng lưu tối thiểu 150 ml,
        và lưu ít nhất 24 giờ.
      </p>

      <div className={styles.actions}>
        {changed && (
          <Button
            variant="outlined"
            color="inherit"
            disabled={saving}
            startIcon={<RotateCcw size={16} />}
            onClick={onReset}
          >
            Hủy thay đổi
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={!canSave}>
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>
    </Paper>
  )
}

export default SamplePolicyForm
