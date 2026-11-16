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
  User,
  UserPlus,
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

      {/* LEFT COLUMN: Showcase Image with Overlay Text (Narrowed for Perfect Proportions) */}
      <div className={styles.leftCol}>
        {/* Full-bleed vertical showcase image */}
        <img
          src={showcaseImg}
          alt="Suất ăn học đường an toàn - Hệ thống quản lý và truy xuất nguồn gốc FoodPrint"
          className={styles.bgShowcaseImg}
          loading="eager"
        />

        {/* Soft readable gradient scrim */}
        <div className={styles.leftColOverlay} aria-hidden="true" />

        {/* Text Content overlaid on top of image */}
        <div className={styles.leftColContent}>
          {/* Top: Brand Logo */}
          <div className={styles.logoWrapper}>
            <Link to={ROUTER.DEFAULT} className={styles.brandLink} title="FoodPrint - Trang chủ">
              <BrandLogo theme="light" />
            </Link>
          </div>

          {/* Center: Headline & Subtitle */}
          <div className={styles.heroCenter}>
            <h1 className={styles.heroTitle}>
              Suất ăn học đường<br />
              <span className={styles.highlightText}>
                an toàn
                <svg className={styles.brushCurve} viewBox="0 0 160 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9C45 3 115 2 157 7" stroke="var(--color-primary, #0A8066)" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>{" "}
              và minh bạch
            </h1>

            <p className={styles.heroDescription}>
              Hệ thống quản lí và Truy xuất nguồn gốc suất ăn học đường.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Balanced Centered Login Area */}
      <div className={styles.rightCol}>
        <div className={styles.loginCard}>
          {/* Card Title */}
          <h2 className={styles.cardTitle}>Đăng nhập</h2>

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

          <form onSubmit={submit} className={styles.loginForm} noValidate>
            {/* Identifier Input */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <User size={15} className={styles.labelIcon} />
                <label htmlFor="login-identifier" className={styles.fieldLabel}>
                  Email / Số điện thoại
                </label>
              </div>
              <div
                className={[
                  styles.inputWrapper,
                  errors.identifier ? styles.hasError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Mail size={18} className={styles.inputLeadIcon} />
                <input
                  id="login-identifier"
                  type="text"
                  name="identifier"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: "" }))
                  }}
                  placeholder="Nhập email hoặc số điện thoại"
                  className={styles.textInput}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              {errors.identifier && (
                <span className={styles.fieldError}>{errors.identifier}</span>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <Lock size={15} className={styles.labelIcon} />
                <label htmlFor="login-password" className={styles.fieldLabel}>
                  Mật khẩu
                </label>
              </div>
              <div
                className={[
                  styles.inputWrapper,
                  errors.password ? styles.hasError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Lock size={18} className={styles.inputLeadIcon} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                  }}
                  placeholder="Nhập mật khẩu"
                  className={styles.textInput}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeToggleBtn}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.fieldError}>{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className={styles.formOptionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.hiddenCheckbox}
                />
                <span className={`${styles.customCheckbox} ${rememberMe ? styles.isChecked : ""}`}>
                  {rememberMe && <Check size={12} strokeWidth={3} />}
                </span>
                <span className={styles.checkboxText}>Ghi nhớ đăng nhập</span>
              </label>

              <Link to={ROUTER.FORGOT_PASSWORD} className={styles.forgotLink}>
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <LogIn size={18} className={styles.btnIcon} />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>hoặc</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Register Action Button */}
          <Link to={ROUTER.REGISTER} className={styles.registerBtn}>
            <UserPlus size={18} className={styles.btnIcon} />
            <span>Tạo tài khoản</span>
          </Link>
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
