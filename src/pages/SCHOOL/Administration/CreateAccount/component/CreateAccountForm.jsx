import React, { useState } from "react"
import {
  User,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react"
import {
  DEPARTMENT_CONFIGS,
  DEFAULT_INITIAL_PASSWORD,
} from "../../Accounts/mockAccountsData"
import styles from "./CreateAccountForm.module.scss"

function CreateAccountForm({
  formData,
  errors,
  onChangeField,
  onDepartmentChange,
  onSubmit,
  onCancel,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  // Sao chép nhanh mật khẩu mặc định
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(DEFAULT_INITIAL_PASSWORD)
    setCopiedPass(true)
    setTimeout(() => setCopiedPass(false), 2000)
  }

  return (
    <form className={styles.formCard} onSubmit={onSubmit} noValidate>
      <div className={styles.fieldGrid}>
        {/* 1. Chọn phòng ban */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="departmentId">
            Phòng ban <span className={styles.required}>*</span>
          </label>
          <select
            id="departmentId"
            name="departmentId"
            className={styles.selectInput}
            value={formData.departmentId}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            {DEPARTMENT_CONFIGS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.label} ({dept.codePrefix})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Mã nhân viên (tự sinh) */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="code">
              Mã nhân viên
            </label>
          </div>
          <div className={styles.inputWrapper}>
            <Briefcase size={16} className={styles.inputIcon} />
            <input
              type="text"
              id="code"
              name="code"
              className={`${styles.input} ${styles.readOnlyInput}`}
              value={formData.code}
              readOnly
            />
          </div>
        </div>

        {/* 3. Họ và tên */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label} htmlFor="fullName">
            Họ và tên <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <User size={16} className={styles.inputIcon} />
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Nhập họ và tên nhân sự..."
              className={`${styles.input} ${errors.fullName ? styles.hasError : ""}`}
              value={formData.fullName}
              onChange={(e) => onChangeField("fullName", e.target.value)}
              autoFocus
            />
          </div>
          {errors.fullName && (
            <span className={styles.errorText}>
              <AlertCircle size={13} />
              {errors.fullName}
            </span>
          )}
        </div>

        {/* 4. Email */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Email <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="nhanvien@foodprint.edu.vn"
              className={`${styles.input} ${errors.email ? styles.hasError : ""}`}
              value={formData.email}
              onChange={(e) => onChangeField("email", e.target.value)}
            />
          </div>
          {errors.email && (
            <span className={styles.errorText}>
              <AlertCircle size={13} />
              {errors.email}
            </span>
          )}
        </div>

        {/* 5. Số điện thoại */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="phone">
            Số điện thoại <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <Phone size={16} className={styles.inputIcon} />
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="0912 345 678"
              className={`${styles.input} ${errors.phone ? styles.hasError : ""}`}
              value={formData.phone}
              onChange={(e) => onChangeField("phone", e.target.value)}
            />
          </div>
          {errors.phone && (
            <span className={styles.errorText}>
              <AlertCircle size={13} />
              {errors.phone}
            </span>
          )}
        </div>

        {/* 6. Mật khẩu khởi tạo mặc định */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="initialPassword">
              Mật khẩu khởi tạo
            </label>
            <span className={styles.autoBadge}>Mặc định</span>
          </div>
          <div className={styles.inputWrapper}>
            <KeyRound size={16} className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              id="initialPassword"
              className={`${styles.input} ${styles.readOnlyInput}`}
              value={DEFAULT_INITIAL_PASSWORD}
              readOnly
            />
            <div className={styles.passActions}>
              <button
                type="button"
                className={styles.actionIconBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                type="button"
                className={styles.actionIconBtn}
                onClick={handleCopyPassword}
                title="Sao chép mật khẩu"
              >
                {copiedPass ? (
                  <Check size={16} style={{ color: "#16a34a" }} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className={styles.actionBar}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={onCancel}
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
        >
          Tạo tài khoản
        </button>
      </div>
    </form>
  )
}

export default CreateAccountForm
