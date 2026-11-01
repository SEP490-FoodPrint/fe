import React, { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { checkPasswordStrength } from "src/utils/passwordStrength";
import styles from "./AuthInput.module.scss";

export default function AuthInput({
  id,
  name,
  label,
  type = "text",
  value = "",
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  error,
  hint,
  span = "full",
  showStrengthMeter = false,
  autoComplete,
  inputProps = {},
  className = "",
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  // Tính toán độ mạnh mật khẩu nếu prop showStrengthMeter được bật
  const strength = useMemo(() => {
    if (!showStrengthMeter || !isPassword) return null;
    return checkPasswordStrength(value);
  }, [showStrengthMeter, isPassword, value]);

  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div
      className={`${styles.fieldGroup} ${styles[span] || styles.full} ${
        error ? styles.hasError : ""
      } ${className}`}
    >
      {/* 1. Hàng Label & Hint */}
      {(label || hint) && (
        <div className={styles.labelRow}>
          {label && (
            <label htmlFor={id} className={styles.label}>
              {label} {required && <span className={styles.required}>*</span>}
            </label>
          )}
          {hint && <span className={styles.hint}>{hint}</span>}
        </div>
      )}

      {/* 2. Khung ô nhập liệu thuần HTML */}
      <div className={styles.inputContainer}>
        <input
          id={id}
          name={name || id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={styles.input}
          aria-invalid={Boolean(error)}
          {...inputProps}
          {...rest}
        />

        {/* Nút ẩn/hiện mật khẩu cho type="password" */}
        {isPassword && (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* 3. Dòng thông báo lỗi */}
      {error && <span className={styles.fieldError}>{error}</span>}

      {/* 4. Thanh đo độ mạnh mật khẩu trực quan */}
      {showStrengthMeter && isPassword && strength && (
        <div className={styles.meterContainer}>
          <div className={styles.meterBar}>
            <div
              className={`${styles.meterSegment} ${
                strength.score >= 1 ? styles[strength.level] : ""
              }`}
            />
            <div
              className={`${styles.meterSegment} ${
                strength.score >= 2 ? styles[strength.level] : ""
              }`}
            />
            <div
              className={`${styles.meterSegment} ${
                strength.score >= 3 ? styles[strength.level] : ""
              }`}
            />
            <div
              className={`${styles.meterSegment} ${
                strength.score >= 4 ? styles[strength.level] : ""
              }`}
            />
          </div>
          <div className={styles.meterLabels}>
            <span className={`${styles.strengthText} ${styles[strength.level]}`}>
              {strength.text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
