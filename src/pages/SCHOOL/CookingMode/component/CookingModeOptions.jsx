import React from "react"
import PropTypes from "prop-types"
import { Combine, GitFork } from "lucide-react"
import { COOKING_MODES } from "./cookingModeConfig"
import styles from "./CookingModeOptions.module.scss"

const ICONS = {
  SEPARATE_BY_LOT: GitFork,
  COMBINE_LOTS: Combine,
}

function CookingModeOptions({ value, disabled, onChange }) {
  return (
    <fieldset className={styles.options} disabled={disabled}>
      <legend>Chọn chế độ áp dụng cho nhà bếp</legend>
      {COOKING_MODES.map(({ value: option, label, description, benefit, tradeoff }) => {
        const Icon = ICONS[option]
        return (
          <label
            key={option}
            className={`${styles.option} ${value === option ? styles.selected : ""} ${disabled ? styles.disabled : ""}`}
          >
            <input
              type="radio"
              name="cookingMode"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className={styles.icon}><Icon size={20} /></span>
            <span className={styles.content}>
              <strong className={styles.label}>{label}</strong>
              <span className={styles.description}>{description}</span>
              <span className={styles.detail}><b>Lợi ích</b>{benefit}</span>
              <span className={styles.detail}><b>Cần lưu ý</b>{tradeoff}</span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

CookingModeOptions.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
}

export default CookingModeOptions
