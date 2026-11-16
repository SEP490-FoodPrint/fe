import React, { useRef, useState } from "react"
import PropTypes from "prop-types"
import { Alert, CircularProgress } from "@mui/material"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  QrCode,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import BrandLogo from "src/components/Common/BrandLogo"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import showcaseImg from "src/assets/images/login-showcase.png"
import styles from "./LoginForm.module.scss"

export default function LoginForm({
  onLoginSuccess,
  initialIdentifier = "",
  passwordUpdated = false,
}) {
  const [identifier, setIdentifier] = useState(initialIdentifier)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const submitting = useRef(false)

  const submit = async (event) => {
    event.preventDefault()
    if (submitting.current) return
    const next = {}
    if (!identifier.trim()) next.identifier = "Vui lòng nhập email hoặc số điện thoại."
    if (!password) next.password = "Vui lòng nhập mật khẩu."
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    submitting.current = true
    setLoading(true)
    try {
      const { user } = await AuthService.login({ identifier, password })
      onLoginSuccess(user)
    } catch (error) {
      setMessage(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Decorative leaf motif on top right */}
      <div className={styles.decorLeafTop} aria-hidden="true">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M200 0C150 25 110 80 120 150C130 100 160 55 200 0Z" fill="var(--color-primary-soft, #e6f4ea)" opacity="0.6" />
          <path d="M180 0C130 45 95 110 105 185C120 130 150 75 180 0Z" fill="var(--color-primary, #0A8066)" opacity="0.1" />
        </svg>
      </div>

      {/* LEFT COLUMN: Hero & Visual Showcase (Full Height Top-to-Bottom) */}
      <div className={styles.leftCol}>
        {/* Top: Brand Logo */}
        <div className={styles.logoWrapper}>
          <Link to={ROUTER.DEFAULT} className={styles.brandLink} title="FoodPrint - Trang chủ">
            <BrandLogo theme="light" />
          </Link>
        </div>

        {/* Center: Headline & Compact Value Tags */}
        <div className={styles.heroCenter}>
          <h1 className={styles.heroTitle}>
            Bữa ăn học đường<br />
            <span className={styles.highlightText}>
              an toàn
              <svg className={styles.brushCurve} viewBox="0 0 160 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9C45 3 115 2 157 7" stroke="var(--color-primary, #0A8066)" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            và minh bạch
          </h1>

          <p className={styles.heroDescription}>
            Nền tảng quản lý, giám sát và truy xuất nguồn gốc bữa ăn học đường.
          </p>

          <div className={styles.tagList}>
            <div className={styles.tagItem}>
              <ShieldCheck size={18} className={styles.tagIcon} />
              <span>An toàn thực phẩm</span>
            </div>
            <div className={styles.tagItem}>
              <QrCode size={18} className={styles.tagIcon} />
              <span>Truy xuất minh bạch</span>
            </div>
            <div className={styles.tagItem}>
              <Users size={18} className={styles.tagIcon} />
              <span>Kết nối hệ sinh thái</span>
            </div>
          </div>
        </div>

        {/* Bottom: Large Showcase Visual Card */}
        <div className={styles.showcaseCard}>
          <img
            src={showcaseImg}
            alt="Bữa ăn học đường an toàn - Học sinh nhận suất ăn dinh dưỡng"
            className={styles.showcaseImage}
            loading="eager"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Floating Login Card */}
      <div className={styles.rightCol}>
        <div className={styles.loginCard}>
          {/* Card Header Icon (Seedling in bowl) */}
          <div className={styles.cardHeaderIcon}>
            <div className={styles.sproutBadge}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="22" fill="#E8F5E9" />
                {/* Bowl */}
                <path d="M13 24C13 29.5 17 34 22 34C27 34 31 29.5 31 24H13Z" fill="#1b5e20" />
                <rect x="18" y="34" width="8" height="2" rx="1" fill="#1b5e20" />
                {/* Sprout Stem */}
                <path d="M22 24V18" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round" />
                {/* Leaves */}
                <path d="M22 19C19 14.5 14.5 16 14.5 18C14.5 21 19 20 22 19Z" fill="#388e3c" />
                <path d="M22 19C25 14.5 29.5 16 29.5 18C29.5 21 25 20 22 19Z" fill="#388e3c" />
                {/* Radiating sparkles */}
                <circle cx="22" cy="11.5" r="1.5" fill="#66bb6a" />
                <circle cx="15.5" cy="13.5" r="1.2" fill="#66bb6a" />
                <circle cx="28.5" cy="13.5" r="1.2" fill="#66bb6a" />
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Đăng nhập</h2>
            <p className={styles.cardSubtitle}>Chào mừng bạn quay trở lại FoodPrint!</p>
          </div>

          {/* Password Updated Alert */}
          {passwordUpdated && (
            <Alert severity="success" className={styles.alertNotice}>
              Mật khẩu đã được cập nhật. Vui lòng đăng nhập bằng mật khẩu mới.
            </Alert>
          )}

          {/* Error Alert */}
          {message && (
            <div className={styles.errorAlert} role="alert">
              <AlertCircle size={18} className={styles.errorIcon} />
              <span>{message}</span>
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={submit} noValidate aria-label="Đăng nhập FoodPrint" className={styles.form}>
            {/* Field 1: Email / Số điện thoại */}
            <div className={styles.fieldGroup}>
              <label htmlFor="userIdentifier" className={styles.fieldLabel}>
                <User size={15} className={styles.labelIcon} />
                <span>Email / Số điện thoại</span>
              </label>
              <div className={`${styles.inputContainer} ${errors.identifier ? styles.hasError : ""}`}>
                <Mail size={18} className={styles.inputLeadingIcon} />
                <input
                  id="userIdentifier"
                  type="text"
                  className={styles.textInput}
                  placeholder="Nhập email hoặc số điện thoại"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }))
                  }}
                  autoComplete="username"
                  disabled={loading}
                  maxLength={320}
                  autoCapitalize="none"
                  spellCheck="false"
                />
              </div>
              {errors.identifier && (
                <span className={styles.fieldErrorText}>{errors.identifier}</span>
              )}
            </div>

            {/* Field 2: Mật khẩu */}
            <div className={styles.fieldGroup}>
              <label htmlFor="passwordInput" className={styles.fieldLabel}>
                <Lock size={15} className={styles.labelIcon} />
                <span>Mật khẩu</span>
              </label>
              <div className={`${styles.inputContainer} ${errors.password ? styles.hasError : ""}`}>
                <Lock size={18} className={styles.inputLeadingIcon} />
                <input
                  id="passwordInput"
                  type={showPassword ? "text" : "password"}
                  className={styles.textInput}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeToggleBtn}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.fieldErrorText}>{errors.password}</span>
              )}
            </div>

            {/* Utility Row: Remember Me & Forgot Password */}
            <div className={styles.utilityRow}>
              <label className={styles.rememberCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.hiddenCheckbox}
                />
                <span className={`${styles.customCheckbox} ${rememberMe ? styles.isChecked : ""}`}>
                  {rememberMe && <Check size={12} strokeWidth={3} />}
                </span>
                <span className={styles.rememberText}>Ghi nhớ đăng nhập</span>
              </label>

              <Link to={ROUTER.FORGOT_PASSWORD} className={styles.forgotPasswordLink}>
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={18} color="inherit" />
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} className={styles.btnIcon} />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Divider: hoặc */}
          <div className={styles.dividerRow}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>hoặc</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Register Button */}
          <Link to={ROUTER.REGISTER} className={styles.createAccountBtn}>
            <UserPlus size={18} className={styles.btnIcon} />
            <span>Tạo tài khoản</span>
          </Link>

          {/* Info / Notice Callout Box */}
          <div className={styles.roleNoticeCard}>
            <div className={styles.roleIconCircle}>
              <Users size={18} className={styles.roleNoticeIcon} />
            </div>
            <div className={styles.roleNoticeText}>
              <h4 className={styles.roleNoticeTitle}>Dành cho Admin, Trường học và Nhà cung cấp</h4>
              <p className={styles.roleNoticeDesc}>
                Đăng nhập để quản lý, giám sát và kết nối hoạt động bữa ăn học đường trên FoodPrint.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

LoginForm.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
  initialIdentifier: PropTypes.string,
  passwordUpdated: PropTypes.bool,
}
