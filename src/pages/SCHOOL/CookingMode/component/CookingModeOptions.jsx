import React from "react"
import PropTypes from "prop-types"
import { Combine, GitFork } from "lucide-react"
import styles from "./CookingModeOptions.module.scss"

const OPTIONS = [
  {
    value: "SEPARATE_BY_LOT",
    label: "Nấu riêng theo lô",
    description: "Mỗi mẻ chỉ dùng một lô cho từng nguyên liệu.",
    Icon: GitFork,
  },
  {
    value: "COMBINE_LOTS",
    label: "Nấu chung nhiều lô",
    description: "Một mẻ có thể gộp nhiều lô của cùng nguyên liệu.",
    Icon: Combine,
  },
]

function CookingModeOptions({ value, disabled, onChange }) {
  return (
    <div className={styles.options} role="radiogroup" aria-label="Chế độ nấu">
      {OPTIONS.map(({ value: option, label, description, Icon }) => (
        <label
          key={option}
          className={`${styles.option} ${value === option ? styles.selected : ""}`}
        >
          <input
            type="radio"
            name="cookingMode"
            value={option}
            checked={value === option}
            disabled={disabled}
            onChange={() => onChange(option)}
          />
          <span className={styles.icon}><Icon size={20} /></span>
          <span>
            <strong className={styles.label}>{label}</strong>
            <span className={styles.description}>{description}</span>
          </span>
        </label>
      ))}
    </div>
  )
}

CookingModeOptions.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
}

export default CookingModeOptions
