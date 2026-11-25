import React from "react"
import PropTypes from "prop-types"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { viVN } from "@mui/x-date-pickers/locales"

const VALUE_FORMAT = "YYYY-MM-DD"
const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
// Giữ chỗ trống của ô nhập là "dd/mm/yyyy" thay vì chữ viết tắt tiếng Việt
const LOCALE_TEXT = {
  ...viVN.components.MuiLocalizationProvider.defaultProps.localeText,
  fieldDayPlaceholder: () => "dd",
  fieldMonthPlaceholder: () => "mm",
  fieldYearPlaceholder: () => "yyyy",
}

/**
 * Ô chọn ngày hiển thị dd/mm/yyyy, không phụ thuộc ngôn ngữ trình duyệt.
 * Nhận và trả giá trị dạng "YYYY-MM-DD" (chuỗi rỗng khi chưa chọn) như input type="date".
 */
export default function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  className,
  size = "small",
  disabled = false,
}) {
  const parsed = value ? dayjs(value, VALUE_FORMAT) : null

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="vi"
      localeText={LOCALE_TEXT}
    >
      <DatePicker
        label={label}
        className={className}
        value={parsed?.isValid() ? parsed : null}
        format="DD/MM/YYYY"
        dayOfWeekFormatter={day => WEEKDAYS[day.day()]}
        minDate={minDate ? dayjs(minDate, VALUE_FORMAT) : undefined}
        maxDate={maxDate ? dayjs(maxDate, VALUE_FORMAT) : undefined}
        disabled={disabled}
        onChange={next => {
          if (!next) return onChange("")
          if (next.isValid()) onChange(next.format(VALUE_FORMAT))
        }}
        slotProps={{
          textField: { size },
          field: { clearable: true },
        }}
      />
    </LocalizationProvider>
  )
}

DateField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium"]),
  disabled: PropTypes.bool,
}
