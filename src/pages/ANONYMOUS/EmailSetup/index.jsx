import React, { useContext, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Alert, Button, CircularProgress } from "@mui/material"
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"
import AuthCard, {
  AuthHeading,
  AuthStatusIcon,
} from "src/components/Auth/AuthCard"
import AuthInput from "src/components/Auth/AuthInput"
import FormErrors from "src/components/Auth/FormErrors"
import notice from "src/components/Notice"
import { StoreContext } from "src/contexts"
import AuthService from "src/services/AuthService"
import { validEmail } from "src/lib/authValidation"
import useCountdown from "src/lib/useCountdown"
import { getAuthRedirect } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import form from "src/components/Auth/AuthForm.module.scss"
import styles from "./EmailSetup.module.scss"

function parseRetryAfterSeconds(error, fallback = 0) {
  const header =
    error?.response?.headers?.["retry-after"] ??
    error?.response?.headers?.["Retry-After"]
  if (header !== undefined && header !== null && header !== "") {
    const numeric = Number(header)
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.ceil(numeric)
    }
    const parsedDate = Date.parse(String(header))
    if (!Number.isNaN(parsedDate)) {
      const diff = Math.ceil((parsedDate - Date.now()) / 1000)
      if (diff > 0) return diff
    }
  }
  const bodyResend = Number(error?.response?.data?.data?.resendAfter)
  if (Number.isFinite(bodyResend) && bodyResend > 0) {
    return Math.ceil(bodyResend)
  }
  return fallback
}

function formatTimer(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export default function EmailSetupPage() {
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  const currentUser = userStore?.user
  const isLoggedIn = Boolean(loginStore?.isLoginContext && currentUser)

  const [step, setStep] = useState("email") // "email" | "verify"
  const [email, setEmail] = useState("")
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [code, setCode] = useState("")

  const [errors, setErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState("")
  const [infoNotice, setInfoNotice] = useState("")

  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [resendAt, setResendAt] = useState(0)
  const [expiresAt, setExpiresAt] = useState(0)

  const submitLock = useRef(false)

  const resendRemaining = useCountdown(resendAt)
  const expiryRemaining = useCountdown(expiresAt)

  if (!isLoggedIn) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  if (!currentUser?.emailSetupRequired) {
    return <Navigate to={getAuthRedirect(currentUser)} replace />
  }

  const refreshAndRedirect = async () => {
    try {
      const refreshed = await AuthService.restoreSession()
      if (refreshed) {
        userStore.setUser(refreshed)
        loginStore.setIsLoginContext(true)
        navigate(getAuthRedirect(refreshed), { replace: true })
        return
      }
    } catch {
      // Fall through to current redirect
    }
    navigate(getAuthRedirect({ ...currentUser, emailSetupRequired: false }), {
      replace: true,
    })
  }

  const handleRequestError = async (error, targetStep) => {
    const status = error?.response?.status
    const errorCode = error?.response?.data?.error?.code
    const fields = error?.response?.data?.error?.fields

    if (status === 409 && errorCode === "EMAIL_SETUP_NOT_REQUIRED") {
      await refreshAndRedirect()
      return
    }

    if (status === 409 && errorCode === "EMAIL_TAKEN") {
      const cooldown = parseRetryAfterSeconds(error, 60)
      if (cooldown > 0) {
        setResendAt(Date.now() + cooldown * 1000)
      }
      const msg = "Email này đã được sử dụng bởi tài khoản khác."
      if (targetStep === "email") {
        setErrors({ "setup-email": msg })
        setErrorMessage("")
      } else {
        setErrorMessage(msg)
      }
      return
    }

    if (status === 429) {
      const retryAfter = parseRetryAfterSeconds(error, 60)
      if (retryAfter > 0) {
        setResendAt(Date.now() + retryAfter * 1000)
      }
      setErrorMessage(
        error?.response?.data?.message ||
          `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`,
      )
      return
    }

    if (status === 503) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Dịch vụ gửi email tạm thời gián đoạn. Vui lòng thử lại sau ít phút.",
      )
      return
    }

    if (status === 400 && Array.isArray(fields) && fields.length > 0) {
      const nextFields = {}
      fields.forEach(item => {
        if (item?.field === "email" && item?.message) {
          nextFields["setup-email"] = item.message
        }
      })
      if (Object.keys(nextFields).length > 0) {
        setErrors(nextFields)
        setErrorMessage("")
        return
      }
    }

    setErrorMessage(
      error?.response?.data?.message ||
        error?.message ||
        "Chưa gửi được mã xác nhận. Vui lòng thử lại.",
    )
  }

  const handleSendCode = async event => {
    event?.preventDefault()
    if (submitLock.current || sending || resendRemaining > 0) return

    const normalized = email.trim().toLowerCase()
    const nextErrors = {}
    if (!normalized) {
      nextErrors["setup-email"] = "Vui lòng nhập địa chỉ email."
    } else if (normalized.length > 254 || !validEmail(normalized)) {
      nextErrors["setup-email"] = "Địa chỉ email không hợp lệ."
    }

    setErrors(nextErrors)
    setErrorMessage("")
    setInfoNotice("")
    if (Object.keys(nextErrors).length > 0) return

    submitLock.current = true
    setSending(true)
    try {
      const data = await AuthService.requestEmailSetup(normalized)
      const expiresInSec = Number(data?.expiresIn) > 0 ? Number(data.expiresIn) : 600
      const resendAfterSec =
        Number(data?.resendAfter) > 0 ? Number(data.resendAfter) : 60

      setSubmittedEmail(normalized)
      setCode("")
      setExpiresAt(Date.now() + expiresInSec * 1000)
      setResendAt(Date.now() + resendAfterSec * 1000)
      setStep("verify")
      setInfoNotice(
        "Đã gửi mã 6 số. Kiểm tra cả thư rác.",
      )
    } catch (error) {
      await handleRequestError(error, "email")
    } finally {
      submitLock.current = false
      setSending(false)
    }
  }

  const handleResendCode = async () => {
    if (submitLock.current || sending || verifying || resendRemaining > 0) return

    submitLock.current = true
    setSending(true)
    setErrors({})
    setErrorMessage("")
    setInfoNotice("")
    try {
      const data = await AuthService.requestEmailSetup(submittedEmail)
      const expiresInSec = Number(data?.expiresIn) > 0 ? Number(data.expiresIn) : 600
      const resendAfterSec =
        Number(data?.resendAfter) > 0 ? Number(data.resendAfter) : 60

      setCode("")
      setExpiresAt(Date.now() + expiresInSec * 1000)
      setResendAt(Date.now() + resendAfterSec * 1000)
      setInfoNotice("Đã gửi lại mã xác nhận mới tới email của bạn.")
    } catch (error) {
      await handleRequestError(error, "verify")
    } finally {
      submitLock.current = false
      setSending(false)
    }
  }

  const handleVerifyCode = async event => {
    event.preventDefault()
    if (submitLock.current || verifying || sending) return

    const trimmedCode = code.trim()
    const nextErrors = {}
    if (!/^[0-9]{6}$/.test(trimmedCode)) {
      nextErrors["setup-code"] = "Vui lòng nhập đủ mã xác nhận gồm 6 chữ số."
    }

    setErrors(nextErrors)
    setErrorMessage("")
    setInfoNotice("")
    if (Object.keys(nextErrors).length > 0) return

    submitLock.current = true
    setVerifying(true)
    try {
      const { user } = await AuthService.verifyEmailSetup({
        email: submittedEmail,
        code: trimmedCode,
      })
      userStore.setUser(user)
      loginStore.setIsLoginContext(true)
      notice({
        msg: "Đã xác minh email",
        desc: "Lần sau hãy đăng nhập bằng email này.",
        isSuccess: true,
      })
      navigate(getAuthRedirect(user), { replace: true })
    } catch (error) {
      const status = error?.response?.status
      const errorCode = error?.response?.data?.error?.code

      if (status === 409 && errorCode === "EMAIL_SETUP_NOT_REQUIRED") {
        await refreshAndRedirect()
        return
      }

      if (status === 409 && errorCode === "EMAIL_TAKEN") {
        setErrorMessage(
          "Email này đã được sử dụng bởi tài khoản khác. Vui lòng đổi sang địa chỉ email khác.",
        )
      } else if (status === 400) {
        setErrorMessage(
          error?.response?.data?.message ||
            "Mã xác nhận không đúng, đã hết hạn hoặc đã bị hủy do nhập sai quá số lần quy định.",
        )
      } else {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể xác minh mã. Vui lòng thử lại.",
        )
      }
    } finally {
      submitLock.current = false
      setVerifying(false)
    }
  }

  const handleChangeEmail = () => {
    setStep("email")
    setCode("")
    setErrors({})
    setErrorMessage("")
    setInfoNotice("")
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await AuthService.logout()
    } finally {
      userStore.setUser(null)
      loginStore.setIsLoginContext(false)
      setLoggingOut(false)
      navigate(ROUTER.LOGIN, { replace: true })
    }
  }

  return (
    <div className={styles.container}>
      {step === "email" ? (
        <AuthCard
          component="form"
          noValidate
          onSubmit={handleSendCode}
          aria-busy={sending}
        >
          <AuthStatusIcon>
            <MailOutlineIcon />
          </AuthStatusIcon>

          <AuthHeading
            title="Thiết lập email tài khoản"
            description="Tài khoản cán bộ ATTP cần cập nhật và xác minh địa chỉ email qua mã OTP trước khi sử dụng hệ thống. Sau khi hoàn tất, các lần đăng nhập tiếp theo sẽ sử dụng email này."
          />

          <div className={styles.accountRow}>
            <div className={styles.accountInfo}>
              <span className={styles.accountName}>
                {currentUser.fullName || "Cán bộ ATTP"}
              </span>
              {currentUser.username ? (
                <span className={styles.accountUsername}>
                  @{currentUser.username}
                </span>
              ) : null}
            </div>
          </div>

          <FormErrors errors={errors} message={errorMessage} />

          <AuthInput
            id="setup-email"
            label="Địa chỉ email"
            type="email"
            required
            span="full"
            autoComplete="email"
            placeholder="Nhập email công việc của bạn"
            value={email}
            onChange={event => {
              setEmail(event.target.value)
              if (errors["setup-email"]) {
                setErrors(prev => ({ ...prev, "setup-email": undefined }))
              }
            }}
            error={errors["setup-email"]}
            disabled={sending || loggingOut}
            inputProps={{ maxLength: 254 }}
          />

          <Button
            type="submit"
            variant="contained"
            className={form.primary}
            disabled={sending || loggingOut || resendRemaining > 0}
          >
            {sending ? (
              <CircularProgress
                size={22}
                color="inherit"
                aria-label="Đang gửi mã xác nhận"
              />
            ) : resendRemaining > 0 ? (
              `Thử lại sau ${resendRemaining}s`
            ) : (
              "Gửi mã xác nhận"
            )}
          </Button>

          <div className={`${styles.footerActions} ${styles.footerCenter}`}>
            <Button
              type="button"
              className={styles.logoutBtn}
              startIcon={<LogoutOutlinedIcon fontSize="small" />}
              onClick={handleLogout}
              disabled={sending || loggingOut}
            >
              {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </Button>
          </div>
        </AuthCard>
      ) : (
        <AuthCard
          component="form"
          noValidate
          onSubmit={handleVerifyCode}
          aria-busy={verifying || sending}
        >
          <AuthStatusIcon>
            <MailOutlineIcon />
          </AuthStatusIcon>

          <AuthHeading
            title="Xác minh mã OTP"
            description="Nhập mã xác nhận gồm 6 chữ số đã được gửi tới email bên dưới để hoàn tất kích hoạt tài khoản."
          />

          <div className={styles.emailChip}>
            <span className={styles.emailValue}>{submittedEmail}</span>
            <Button
              type="button"
              size="small"
              className={styles.changeEmailBtn}
              startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
              onClick={handleChangeEmail}
              disabled={verifying || sending || loggingOut}
            >
              Đổi email
            </Button>
          </div>

          <FormErrors errors={errors} message={errorMessage} />

          {infoNotice ? (
            <Alert severity="success" role="status">
              {infoNotice}
            </Alert>
          ) : null}

          <AuthInput
            id="setup-code"
            label="Mã xác nhận (6 chữ số)"
            required
            span="full"
            placeholder="Nhập 6 chữ số từ email"
            autoComplete="one-time-code"
            value={code}
            onChange={event => {
              const cleaned = event.target.value.replace(/\D/g, "").slice(0, 6)
              setCode(cleaned)
              if (errors["setup-code"]) {
                setErrors(prev => ({ ...prev, "setup-code": undefined }))
              }
            }}
            error={errors["setup-code"]}
            disabled={verifying || sending || loggingOut}
            inputProps={{
              maxLength: 6,
              inputMode: "numeric",
              autoCapitalize: "none",
              spellCheck: false,
            }}
          />

          <div className={styles.expiryBar} aria-live="polite">
            {expiryRemaining > 0 ? (
              <span>
                Mã có hiệu lực trong{" "}
                <strong>{formatTimer(expiryRemaining)}</strong>
              </span>
            ) : (
              <span className={styles.expiryExpired}>
                Mã xác nhận đã hết hạn. Vui lòng gửi lại mã mới.
              </span>
            )}
            <span>Tối đa 5 lần nhập sai</span>
          </div>

          <Button
            type="submit"
            variant="contained"
            className={form.primary}
            disabled={verifying || sending || loggingOut}
          >
            {verifying ? (
              <CircularProgress
                size={22}
                color="inherit"
                aria-label="Đang xác minh mã"
              />
            ) : (
              "Xác nhận và hoàn tất"
            )}
          </Button>

          <Button
            type="button"
            className={form.link}
            onClick={handleResendCode}
            disabled={sending || verifying || loggingOut || resendRemaining > 0}
          >
            {sending
              ? "Đang gửi lại mã..."
              : resendRemaining > 0
                ? `Gửi lại mã sau ${resendRemaining}s`
                : "Chưa nhận được email? Gửi lại mã"}
          </Button>

          <p className={styles.note}>
            Sau khi xác minh thành công, bạn sẽ đăng nhập bằng email{" "}
            <strong>{submittedEmail}</strong>.
          </p>

          <div className={`${styles.footerActions} ${styles.footerCenter}`}>
            <Button
              type="button"
              className={styles.logoutBtn}
              startIcon={<LogoutOutlinedIcon fontSize="small" />}
              onClick={handleLogout}
              disabled={verifying || sending || loggingOut}
            >
              {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </Button>
          </div>
        </AuthCard>
      )}
    </div>
  )
}
