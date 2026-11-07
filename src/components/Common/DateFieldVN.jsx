import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { IconButton, InputAdornment, TextField } from "@mui/material"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"

function isoToVn(iso) {
  if (!iso || typeof iso !== "string") return ""
  const parts = iso.split("-")
  if (parts.length === 3) {
    const [y, m, d] = parts
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
  }
  return ""
}

function vnToIso(vn) {
  if (!vn || typeof vn !== "string") return ""
  const parts = vn.split("/")
  if (parts.length === 3) {
    const [dStr, mStr, yStr] = parts
    const d = parseInt(dStr, 10)
    const m = parseInt(mStr, 10)
    const y = parseInt(yStr, 10)
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const maxDays = new Date(y, m, 0).getDate()
      if (d <= maxDays) {
        return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      }
    }
  }
  return ""
}

function formatVnInput(raw, prev = "") {
  if (!raw) return ""
  if (prev && raw.length < prev.length) {
    return raw
  }
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (!digits) return ""
  if (digits.length <= 2) {
    return digits.length === 2 && !raw.endsWith("/") ? `${digits}/` : digits
  }
  if (digits.length <= 4) {
    const d = digits.slice(0, 2)
    const m = digits.slice(2)
    return m.length === 2 && !raw.endsWith("/") ? `${d}/${m}/` : `${d}/${m}`
  }
  const d = digits.slice(0, 2)
  const m = digits.slice(2, 4)
  const y = digits.slice(4)
  return `${d}/${m}/${y}`
}

function DateFieldVN({
  label,
  value = "",
  onChange,
  disabled = false,
  error = false,
  helperText,
  placeholder = "dd/mm/yyyy",
  min,
  max,
  fullWidth = true,
  slotProps,
  inputProps,
  className,
  size = "small",
}) {
  const [displayValue, setDisplayValue] = useState(() => isoToVn(value))
  const hiddenInputRef = useRef(null)

  useEffect(() => {
    setDisplayValue(isoToVn(value))
  }, [value])

  const handleTextChange = (event) => {
    const inputVal = event.target.value
    if (!inputVal) {
      setDisplayValue("")
      onChange?.("")
      return
    }
    const formatted = formatVnInput(inputVal, displayValue)
    setDisplayValue(formatted)
    if (formatted.length === 10) {
      const iso = vnToIso(formatted)
      if (iso) {
        onChange?.(iso)
      }
    }
  }

  const handleBlur = () => {
    if (!displayValue) {
      onChange?.("")
      return
    }
    if (displayValue.length === 10) {
      const iso = vnToIso(displayValue)
      if (iso) {
        setDisplayValue(isoToVn(iso))
        onChange?.(iso)
        return
      }
    }
    setDisplayValue(isoToVn(value))
  }

  const handleOpenPicker = () => {
    if (hiddenInputRef.current) {
      try {
        if (typeof hiddenInputRef.current.showPicker === "function") {
          hiddenInputRef.current.showPicker()
        } else {
          hiddenInputRef.current.focus()
        }
      } catch {
        hiddenInputRef.current.focus()
      }
    }
  }

  const handleHiddenDateChange = (event) => {
    const nextIso = event.target.value
    setDisplayValue(isoToVn(nextIso))
    onChange?.(nextIso)
  }

  const adornment = (
    <InputAdornment position="end">
      <IconButton
        size="small"
        disabled={disabled}
        onClick={handleOpenPicker}
        edge="end"
        aria-label={`Chọn ${label ? label.toLowerCase() : "ngày"}`}
        tabIndex={-1}
      >
        <CalendarTodayOutlinedIcon fontSize="small" />
      </IconButton>
    </InputAdornment>
  )

  return (
    <div
      style={{
        position: "relative",
        width: fullWidth ? "100%" : "auto",
        minWidth: 0,
      }}
      className={className}
    >
      <TextField
        fullWidth={fullWidth}
        size={size}
        label={label}
        placeholder={placeholder}
        value={displayValue}
        disabled={disabled}
        error={error}
        helperText={helperText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        inputProps={{ maxLength: 10, ...inputProps }}
        InputProps={{
          endAdornment: adornment,
          ...(slotProps?.input || {}),
        }}
        InputLabelProps={{
          shrink: true,
          ...(slotProps?.inputLabel || {}),
        }}
        slotProps={{
          ...slotProps,
          inputLabel: { shrink: true, ...(slotProps?.inputLabel || {}) },
          input: {
            endAdornment: adornment,
            ...(slotProps?.input || {}),
          },
        }}
      />
      <input
        ref={hiddenInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        value={value || ""}
        min={min}
        max={max}
        onChange={handleHiddenDateChange}
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          border: 0,
          padding: 0,
        }}
      />
    </div>
  )
}

DateFieldVN.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.node,
  placeholder: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  fullWidth: PropTypes.bool,
  slotProps: PropTypes.object,
  inputProps: PropTypes.object,
  className: PropTypes.string,
  size: PropTypes.string,
}

export default DateFieldVN
