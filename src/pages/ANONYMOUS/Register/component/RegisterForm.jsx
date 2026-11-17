import React, { useContext, useRef, useState } from "react"
import { CircularProgress } from "@mui/material"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  Check,
  LogIn,
  School,
  Truck,
} from "lucide-react"
import BrandLogo from "src/components/Common/BrandLogo"
import AuthInput from "src/components/Auth/AuthInput"
import AuthService from "src/services/AuthService"
import { signupErrors } from "src/lib/authValidation"
import { saveSignupSession } from "src/lib/signupSession"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import showcaseImg from "src/assets/images/login-showcase.png"
import styles from "./RegisterForm.module.scss"

const empty = {
  username: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
}

export default function RegisterForm() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { signupStore } = useContext(StoreContext)
  const requestType = params.get("type") === "SUPPLIER" ? "SUPPLIER" : "SCHOOL"
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const submitting = useRef(false)

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (submitting.current) return
    const next = signupErrors(values)
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    submitting.current = true
    setLoading(true)
    try {
      const response = await AuthService.signup({
        username: values.username.trim(),
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        requestType,
      })
      const codeSent = response.verificationEmailSent === true
      const pending = saveSignupSession({
        email: values.email.trim().toLowerCase(),
        username: response.user.username,
        requestType,
        codeSent,
        resendAt: codeSent ? Date.now() + 60_000 : 0,
      })
      signupStore.setSignupCredentials({
        email: pending.email,
        password: values.password,
      })
      setValues(empty)
      navigate(ROUTER.ACTIVATE_ACCOUNT, {
        replace: true,
        state: { pendingSignup: pending, requestCode: !pending.codeSent },
      })
      document.getElementById("root")?.scrollTo(0, 0)
    } catch (error) {
      setMessage(error.message || "Không thể tạo tài khoản. Vui lòng thử lại.")
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

      {/* LEFT COLUMN: Full-Screen Showcase Image with Overlay Text */}
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

      {/* RIGHT COLUMN: Fixed-Width Floating Register Area */}
      <div className={styles.rightCol}>
        <div className={styles.registerCard}>
          {/* Card Title */}
          <h2 className={styles.cardTitle}>Đăng ký tài khoản</h2>
          <p className={styles.cardSubtitle}>
            Tạo tài khoản đại diện quản lý cho trường học hoặc đối tác nhà cung cấp trên FoodPrint.
          </p>

          {/* Checkbox chọn vai trò đăng ký (Nhà trường / Nhà cung cấp) */}
          <div className={styles.roleSelectionBox}>
            <span className={styles.roleSelectionLabel}>Đơn vị đăng ký:</span>
            <div className={styles.roleCheckboxes}>
              <label className={`${styles.roleCheckboxItem} ${requestType === "SCHOOL" ? styles.checkedRole : ""}`}>
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={requestType === "SCHOOL"}
                  onChange={() => setParams({ type: "SCHOOL" }, { replace: true })}
                  disabled={loading}
                  aria-label="Đăng ký nhà trường"
                />
                <span className={styles.customCheckmark}>
                  {requestType === "SCHOOL" && <Check size={13} strokeWidth={3} />}
                </span>
                <School size={17} className={styles.roleIcon} />
                <span className={styles.roleText}>Đăng ký nhà trường</span>
              </label>

              <label className={`${styles.roleCheckboxItem} ${requestType === "SUPPLIER" ? styles.checkedRole : ""}`}>
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={requestType === "SUPPLIER"}
                  onChange={() => setParams({ type: "SUPPLIER" }, { replace: true })}
                  disabled={loading}
                  aria-label="Đăng ký nhà cung cấp"
                />
                <span className={styles.customCheckmark}>
                  {requestType === "SUPPLIER" && <Check size={13} strokeWidth={3} />}
                </span>
                <Truck size={17} className={styles.roleIcon} />
                <span className={styles.roleText}>Đăng ký nhà cung cấp</span>
              </label>
            </div>
          </div>

          {/* Error Alert */}
          {message && (
            <div className={styles.errorAlert} role="alert">
              <AlertCircle size={18} className={styles.errorIcon} />
              <span>{message}</span>
            </div>
          )}

          {/* Registration Form */}
          <form
            onSubmit={submit}
            noValidate
            aria-label="Đăng ký đơn vị FoodPrint"
            className={styles.registerForm}
          >
            <div className={styles.fieldsGrid}>
              {/* Field 1: Full Name */}
              <AuthInput
                id="fullName"
                label="Họ và tên người đại diện"
                required
                span="half"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={values.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                autoComplete="name"
                disabled={loading}
                error={errors.fullName}
                inputProps={{ maxLength: 255 }}
              />

              {/* Field 2: Username */}
              <AuthInput
                id="username"
                label="Tên đăng nhập"
                required
                span="half"
                placeholder="Nhập tên đăng nhập viết liền"
                value={values.username}
                onChange={(e) => handleChange("username", e.target.value)}
                autoComplete="username"
                disabled={loading}
                error={errors.username}
                inputProps={{
                  maxLength: 120,
                  autoCapitalize: "none",
                  spellCheck: false,
                }}
              />

              {/* Field 3: Official Email */}
              <AuthInput
                id="email"
                label="Email công tác"
                type="email"
                required
                span="half"
                placeholder="nguyenvanan@school.edu.vn"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
                disabled={loading}
                error={errors.email}
                inputProps={{
                  maxLength: 254,
                  autoCapitalize: "none",
                  spellCheck: false,
                }}
              />

              {/* Field 4: Phone Number */}
              <AuthInput
                id="phone"
                label="Số điện thoại"
                type="tel"
                span="half"
                placeholder="0912 345 678"
                value={values.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                autoComplete="tel"
                disabled={loading}
                error={errors.phone}
                inputProps={{ maxLength: 30 }}
              />

              {/* Field 5: Password */}
              <AuthInput
                id="password"
                label="Mật khẩu"
                type="password"
                required
                span="half"
                hint="Tối thiểu 8 ký tự"
                placeholder="••••••••••••"
                value={values.password}
                onChange={(e) => handleChange("password", e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                error={errors.password}
                showStrengthMeter={true}
              />

              {/* Field 6: Confirm Password */}
              <AuthInput
                id="confirmPassword"
                label="Xác nhận mật khẩu"
                type="password"
                required
                span="half"
                placeholder="••••••••••••"
                value={values.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                error={errors.confirmPassword}
              />
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
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Tiếp tục đăng ký</span>
                  <ArrowRight size={18} className={styles.btnIcon} />
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

          {/* Login Link Button */}
          <Link to={ROUTER.LOGIN} className={styles.loginBtn}>
            <LogIn size={18} className={styles.btnIcon} />
            <span>Đã có tài khoản? Đăng nhập ngay</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
