import React, { useState } from "react"
import {
  User,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react"
import {
  DEPARTMENT_CONFIGS,
  ACCOUNT_STATUSES,
} from "../../Accounts/mockAccountsData"
import styles from "./EditAccountForm.module.scss"

function EditAccountForm({
  formData,
  errors,
  onChangeField,
  onSubmit,
  onCancel,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className={styles.formCard} onSubmit={onSubmit} noValidate>
      {/* 1. Phòng ban & Mã nhân viên (Hàng ngang 2 cột) */}
      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>1. Phòng ban & Mã nhân viên</h2>
        <div className={styles.fieldGrid}>
          {/* Phòng ban */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="departmentId">
              Phòng ban <span className={styles.required}>*</span>
            </label>
            <select
              id="departmentId"
              name="departmentId"
              className={styles.selectInput}
              value={formData.departmentId}
              onChange={(e) => onChangeField("departmentId", e.target.value)}
            >
              {DEPARTMENT_CONFIGS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.label} ({dept.codePrefix})
                </option>
              ))}
            </select>
          </div>

          {/* Mã nhân viên (Cố định, không cho sửa để bảo toàn dữ liệu) */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="code">
                Mã nhân viên
              </label>
              <span className={styles.lockBadge}>Mã cố định</span>
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
                title="Mã nhân viên không thể thay đổi sau khi tạo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thông tin nhân sự & Tài khoản */}
      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>2. Thông tin nhân sự & Tài khoản</h2>
        <div className={styles.fieldGrid}>
          {/* Họ và tên */}
          <div className={styles.formGroup}>
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
              />
            </div>
            {errors.fullName && (
              <span className={styles.errorText}>
                <AlertCircle size={13} />
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Trạng thái hoạt động */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="status">
              Trạng thái hoạt động
            </label>
            <select
              id="status"
              name="status"
              className={`${styles.selectInput} ${styles.statusSelect} ${styles[`status_${formData.status}`]}`}
              value={formData.status}
              onChange={(e) => onChangeField("status", e.target.value)}
            >
              <option value="ACTIVE">{ACCOUNT_STATUSES.ACTIVE.label}</option>
              <option value="LOCKED">{ACCOUNT_STATUSES.LOCKED.label}</option>
            </select>
          </div>

          {/* Email */}
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

          {/* Số điện thoại */}
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

          {/* Mật khẩu (Sửa trực tiếp như bình thường) */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="password">
              Mật khẩu <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <KeyRound size={16} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Nhập mật khẩu..."
                className={`${styles.input} ${errors.password ? styles.hasError : ""}`}
                value={formData.password}
                onChange={(e) => onChangeField("password", e.target.value)}
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
              </div>
            </div>
            {errors.password && (
              <span className={styles.errorText}>
                <AlertCircle size={13} />
                {errors.password}
              </span>
            )}
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
          Lưu thay đổi
        </button>
      </div>
    </form>
  )
}

export default EditAccountForm
