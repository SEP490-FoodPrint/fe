import React from "react"
import PropTypes from "prop-types"
import { Minus, Plus } from "lucide-react"
import styles from "./PortionStepper.module.scss"

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** Number field with large −/+ buttons, easy to tap on a phone. Empty text is kept while typing. */
export default function PortionStepper({ value, onChange, min = 0, max, label, size = "md", disabled = false }) {
  const number = value === "" ? null : Number(value)
  const step = delta => onChange(clamp((number ?? (delta > 0 ? min : max)) + delta, min, max))

  return (
    <div className={`${styles.stepper} ${styles[size]}`}>
      <button
        type="button"
        className={styles.button}
        onClick={() => step(-1)}
        disabled={disabled || (number !== null && number <= min)}
        aria-label={`Giảm ${label}`}
      >
        <Minus size={size === "lg" ? 22 : 16} aria-hidden />
      </button>
      <input
        className={styles.input}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={event => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 4)
          onChange(digits === "" ? "" : clamp(Number(digits), min, max))
        }}
        onFocus={event => event.target.select()}
      />
      <button
        type="button"
        className={styles.button}
        onClick={() => step(1)}
        disabled={disabled || (number !== null && number >= max)}
        aria-label={`Tăng ${label}`}
      >
        <Plus size={size === "lg" ? 22 : 16} aria-hidden />
      </button>
    </div>
  )
}

PortionStepper.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["md", "lg"]),
  disabled: PropTypes.bool,
}
