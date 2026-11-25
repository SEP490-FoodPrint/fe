import React, { useState } from "react"
import PropTypes from "prop-types"
import { Autocomplete, Checkbox, TextField } from "@mui/material"
import { normalizeRequestSearch } from "src/lib/registration"
import styles from "./FilterMultiSelect.module.scss"

/** Ô lọc chọn nhiều, gõ tìm được (không phân biệt dấu). `options`: [{ id, name, count }]. */
export default function FilterMultiSelect({ id, options, value, onChange, allLabel, unit }) {
  const [input, setInput] = useState("")
  const selected = options.filter(option => value.includes(option.id))

  return (
    <Autocomplete
      id={id}
      className={styles.select}
      multiple
      disableCloseOnSelect
      size="small"
      options={options}
      value={selected}
      inputValue={input}
      getOptionLabel={option => option.name || ""}
      getOptionKey={option => option.id}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      onInputChange={(_, next, reason) => {
        // Chọn một dòng thì giữ chữ đang gõ để chọn tiếp
        if (reason === "input") setInput(next)
        else if (reason === "blur" || reason === "clear") setInput("")
      }}
      onChange={(_, next) => onChange(next.map(option => option.id))}
      filterOptions={(items, { inputValue }) => {
        const term = normalizeRequestSearch(inputValue)
        return items.filter(option => normalizeRequestSearch(option.name).includes(term))
      }}
      noOptionsText="Không có kết quả phù hợp"
      clearText="Bỏ chọn tất cả"
      openText="Mở"
      closeText="Đóng"
      renderValue={values => (
        <span className={styles.summary}>
          {values.length === 1 ? values[0].name : `Đã chọn ${values.length} ${unit}`}
        </span>
      )}
      renderOption={(props, option, state) => {
        const { key, ...optionProps } = props
        return (
          <li key={key} {...optionProps} className={`${optionProps.className} ${styles.option}`}>
            <Checkbox size="small" checked={state.selected} tabIndex={-1} disableRipple />
            <span className={styles.optionName}>{option.name}</span>
            <span className={styles.optionCount}>{option.count}</span>
          </li>
        )
      }}
      renderInput={params => (
        <TextField {...params} placeholder={selected.length === 0 ? allLabel : ""} />
      )}
      slotProps={{ popper: { className: styles.popper } }}
    />
  )
}

FilterMultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  allLabel: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
}
