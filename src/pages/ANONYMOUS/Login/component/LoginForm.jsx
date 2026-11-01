import React, { useRef, useState } from "react"
import PropTypes from "prop-types"
import { Alert, CircularProgress } from "@mui/material"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import AuthInput from "src/components/Auth/AuthInput"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import styles from "./LoginForm.module.scss"

export default function LoginForm({
  onLoginSuccess,
  initialIdentifier = "",
  passwordUpdated = false,
}) {
  const [identifier, setIdentifier] = useState(initialIdentifier)
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const submitting = useRef(false)

  const submit = async event => {
    event.preventDefault()
    if (submitting.current) return
    const next = {}
    if (!identifier.trim()) next.identifier = "Vui lòng nhập tên đăng nhập hoặc email."
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
      setMessage(error.message || "Đăng nhập thất bại. Vui lòng thử lại.")
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginWrapper}>
      {/* 1. Main Card */}
      <div className={styles.card}>
        {/* Top Eyebrow Pill & Security Icon */}
        <div className={styles.topBar}>
          <div className={styles.pillBadge}>
            <span className={styles.pulseDot} />
            <span>CỔNG ĐĂNG NHẬP CƠ SỞ &amp; ĐỐI TÁC</span>
          </div>
          <div className={styles.securityIconBox} title="Bảo mật cấp trường học">
            <ShieldCheck size={18} />
          </div>
        </div>

        {/* Heading */}
        <div className={styles.headingGroup}>
          <h1 className={styles.title}>Đăng nhập tài khoản</h1>
          <p className={styles.subtitle}>
            Chào mừng bạn quay trở lại! Đăng nhập FoodPrint. Một tài khoản, kết nối cùng bữa ăn học đường an toàn.
          </p>
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
          {/* Field 1: Identifier */}
          <AuthInput
            id="userIdentifier"
            label="Tên đăng nhập hoặc Email"
            required
            span="full"
            placeholder="Nhập tên đăng nhập hoặc email.."
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value)
              if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }))
            }}
            error={errors.identifier}
            autoComplete="username"
            disabled={loading}
            inputProps={{
              maxLength: 320,
              autoCapitalize: "none",
              spellCheck: false,
            }}
          />

          {/* Field 2: Password */}
          <AuthInput
            id="passwordInput"
            label="Mật khẩu"
            type="password"
            required
            span="full"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            error={errors.password}
            autoComplete="current-password"
            disabled={loading}
          />

          {/* Utility Row: Remember Me & Forgot Password */}
          <div className={styles.utilityRow}>
            <Link to={ROUTER.FORGOT_PASSWORD} className={styles.forgotLink}>
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
                <span>Đăng nhập vào hệ thống</span>
                <ArrowRight size={18} className={styles.arrowIcon} />
              </>
            )}
          </button>
        </form>

        {/* Card Footer Link */}
        <div className={styles.cardFooter}>
          <p className={styles.cardFooterText}>
            Chưa có tài khoản cơ sở hoặc nhà cung cấp?
            <Link to={ROUTER.REGISTER} className={styles.registerLink}>
              Đăng ký tham gia ngay
            </Link>
          </p>
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
