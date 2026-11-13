import React, { useMemo } from "react"
import PropTypes from "prop-types"
import { Autocomplete, TextField } from "@mui/material"
import styles from "./TeacherAutocomplete.module.scss"

// Bỏ dấu tiếng Việt để gõ "nguyen lan" vẫn khớp "Nguyễn Lan".
const normalize = value =>
  (value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()

const filterTeachers = (options, { inputValue }) => {
  const terms = normalize(inputValue).split(/\s+/).filter(Boolean)
  if (!terms.length) return options
  return options.filter(option => {
    const haystack = `${normalize(option.fullName)} ${normalize(option.username)}`
    return terms.every(term => haystack.includes(term))
  })
}

// Lớp khác mà giáo viên đang chủ nhiệm trong niên khóa (null nếu còn trống hoặc là chính lớp này).
const busyClassOf = (teacher, classId) =>
  teacher.currentClass && teacher.currentClass.id !== classId ? teacher.currentClass : null

// Ô chọn GVCN có gõ để lọc; GVCN đang chủ nhiệm lớp khác vẫn hiển thị nhưng không chọn được.
function TeacherAutocomplete({
  teachers,
  value,
  onChange,
  classId,
  currentTeacherId,
  label,
  helperText,
  error,
  loading,
  disabled,
}) {
  const busyClass = teacher => busyClassOf(teacher, classId)

  // Giáo viên còn trống xếp trước để BGH thấy ngay người có thể chọn.
  const options = useMemo(() => {
    const rank = teacher => (teacher.id === currentTeacherId || busyClassOf(teacher, classId) ? 1 : 0)
    return [...teachers].sort((a, b) => rank(a) - rank(b) || a.fullName.localeCompare(b.fullName, "vi"))
  }, [teachers, currentTeacherId, classId])
  const selected = options.find(teacher => teacher.id === value) || null

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={(_event, teacher) => onChange(teacher?.id || "")}
      filterOptions={filterTeachers}
      getOptionLabel={teacher => teacher.fullName}
      getOptionDisabled={teacher => teacher.id === currentTeacherId || Boolean(busyClass(teacher))}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      loading={loading}
      disabled={disabled}
      noOptionsText="Không tìm thấy GVCN phù hợp"
      loadingText="Đang tải danh sách GVCN..."
      renderOption={(props, teacher) => {
        const { key, ...optionProps } = props
        const busy = busyClass(teacher)
        return (
          <li key={key} {...optionProps}>
            <span className={styles.option}>
              <span className={styles.name}>{teacher.fullName}</span>
              <small className={styles.meta}>
                {teacher.username}
                {teacher.id === currentTeacherId
                  ? " · GVCN hiện tại"
                  : busy
                    ? ` · Đang chủ nhiệm lớp ${busy.name}`
                    : ""}
              </small>
            </span>
          </li>
        )
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder="Gõ tên hoặc tài khoản để tìm"
          error={error}
          helperText={helperText}
        />
      )}
    />
  )
}

TeacherAutocomplete.propTypes = {
  teachers: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  classId: PropTypes.string,
  currentTeacherId: PropTypes.string,
  label: PropTypes.string.isRequired,
  helperText: PropTypes.node,
  error: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
}

export default TeacherAutocomplete
