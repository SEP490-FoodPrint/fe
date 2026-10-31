import React, { useContext, useEffect, useRef, useState } from "react"
import { Alert, Button, CircularProgress } from "@mui/material"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import AuthCard, { AuthHeading, AuthStatusIcon } from "src/components/Auth/AuthCard"
import AuthField from "src/components/Auth/AuthField"
import EmailCodeForm from "src/components/Auth/EmailCodeForm"
import NewPasswordFields from "src/components/Auth/NewPasswordFields"
import FormErrors from "src/components/Auth/FormErrors"
import { newPasswordErrors, validEmail } from "src/lib/authValidation"
import { clearSignupSession } from "src/lib/signupSession"
import useCountdown from "src/lib/useCountdown"
import AuthService from "src/services/AuthService"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import styles from "./PasswordRecovery.module.scss"
import form from "src/components/Auth/AuthForm.module.scss"

const retryAfter = error => Math.max(0, Number(error.response?.headers?.["retry-after"]) || (error.response?.status === 429 ? 60 : 0))
const genericDelivery = "Nếu email thuộc tài khoản có thể khôi phục, mã đã được gửi. Vui lòng kiểm tra hộp thư và thư rác."

export default function PasswordRecovery({ step }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { passwordRecoveryStore, loginStore, userStore, signupStore, routerBeforeStore } = useContext(StoreContext)
  const { passwordRecovery: recovery, setPasswordRecovery } = passwordRecoveryStore
  const [email, setEmail] = useState(recovery?.email || "")
  const [code, setCode] = useState("")
  const [values, setValues] = useState({ password: "", confirmPassword: "" })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [failedGrant, setFailedGrant] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [retryAt, setRetryAt] = useState(0)
  const remaining = useCountdown(step === "verify" ? recovery?.resendAt : retryAt)
  const grantRemaining = useCountdown(recovery?.expiresAt)
  const verifyRemaining = useCountdown(retryAt)
  const lock = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    if (step === "email") setPasswordRecovery(current => current ? { email: current.email, resendAt: current.resendAt } : null)
  }, [step, setPasswordRecovery])
  const change = key => event => setValues(previous => ({ ...previous, [key]: event.target.value }))
  const requested = result => ({ email: email.trim().toLowerCase(), resendAt: Date.now() + (result?.resendAfter || 60) * 1000 })
  const request = async event => {
    event.preventDefault()
    if (lock.current || remaining) return
    const next = !validEmail(email.trim()) || email.trim().length > 254 ? { email: "Nhập email đã đăng ký hợp lệ." } : {}
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    lock.current = true
    setLoading(true)
    try {
      const result = await AuthService.requestPasswordReset(email)
      if (!mounted.current) return
      setPasswordRecovery(requested(result))
      navigate(ROUTER.PASSWORD_RECOVERY_CODE)
    } catch (error) { if (mounted.current) { setMessage(error.message); setRetryAt(Date.now() + retryAfter(error) * 1000) } }
    finally { lock.current = false; if (mounted.current) setLoading(false) }
  }
  const resend = async () => {
    if (lock.current || remaining || !recovery?.email) return
    lock.current = true
    setSending(true)
    setErrors({})
    setMessage("")
    setNotice("")
    try {
      const result = await AuthService.requestPasswordReset(recovery.email)
      if (!mounted.current) return
      setPasswordRecovery({ email: recovery.email, resendAt: Date.now() + (result?.resendAfter || 60) * 1000 })
      setCode("")
      setNotice(genericDelivery)
    } catch (error) { if (mounted.current) {
      setMessage(error.message)
      if (retryAfter(error)) setPasswordRecovery(current => ({ ...current, resendAt: Date.now() + retryAfter(error) * 1000 }))
    } }
    finally { lock.current = false; if (mounted.current) setSending(false) }
  }
  const verify = async event => {
    event.preventDefault()
    if (lock.current || verifyRemaining) return
    const next = /^[0-9]{6}$/.test(code) ? {} : { "recovery-code": "Mã xác nhận phải gồm 6 chữ số." }
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    lock.current = true
    setLoading(true)
    try {
      const grant = await AuthService.verifyPasswordResetCode({ email: recovery.email, code })
      if (!mounted.current) return
      setCode("")
      setPasswordRecovery(current => ({ ...current, resetToken: grant.resetToken, expiresAt: Date.now() + grant.expiresIn * 1000 }))
      navigate(ROUTER.RESET_PASSWORD, { replace: true })
    } catch (error) { if (mounted.current) { setMessage(error.message); if (retryAfter(error)) setRetryAt(Date.now() + retryAfter(error) * 1000) } }
    finally { lock.current = false; if (mounted.current) setLoading(false) }
  }
  const reset = async event => {
    event.preventDefault()
    if (lock.current || remaining || !recovery?.resetToken || !grantRemaining) return
    const next = newPasswordErrors(values.password, values.confirmPassword)
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    lock.current = true
    setLoading(true)
    try {
      await AuthService.resetPassword({ resetToken: recovery.resetToken, newPassword: values.password })
      setCompleted(true)
      // Backend revoked every old session. Discard any session currently shown by the app.
      setPasswordRecovery(null)
      signupStore.setSignupCredentials(null)
      clearSignupSession()
      loginStore.setLoginFeedback({ identifier: recovery.email, passwordUpdated: true })
      loginStore.setIsLoginContext(false)
      userStore.setUser(null)
      routerBeforeStore.setRouterBeforeLogin("")
    } catch (error) { if (mounted.current) {
      setMessage(error.message)
      if (error.response?.status === 429) setRetryAt(Date.now() + (retryAfter(error) || 60) * 1000)
      else {
        // Reset grants are single-use; a failed or ambiguous request must start with a new code.
        setFailedGrant(true)
        setValues({ password: "", confirmPassword: "" })
        setPasswordRecovery(current => current ? { email: current.email, resendAt: current.resendAt } : null)
      }
    } }
    finally { lock.current = false; if (mounted.current) setLoading(false) }
  }

  if (completed) return <Navigate to={ROUTER.LOGIN} replace state={{ identifier: email, passwordUpdated: true }} />
  if (failedGrant) return <AuthCard>
    <AuthStatusIcon tone="error"><ErrorOutlineOutlinedIcon /></AuthStatusIcon>
    <AuthHeading eyebrow="Khôi phục tài khoản" title="Chưa thể đặt lại mật khẩu" description="Vui lòng lấy mã mới để tiếp tục khôi phục tài khoản." />
    <FormErrors message={message} />
    <Button component={Link} to={ROUTER.FORGOT_PASSWORD} variant="contained" className={form.primary}>Yêu cầu mã mới</Button>
    <Button component={Link} to={ROUTER.LOGIN} className={form.link}>Quay lại đăng nhập</Button>
  </AuthCard>
  if ((step === "verify" && !recovery?.email) || (step === "reset" && (!recovery?.resetToken || (!grantRemaining && !loading)))) return <Navigate to={ROUTER.FORGOT_PASSWORD} replace state={{ recoveryExpired: true }} />

  if (step === "verify") return <EmailCodeForm eyebrow="Bước 2 / 3 · Xác minh email" description={genericDelivery} email={recovery.email} code={code} onCodeChange={setCode} codeId="recovery-code" errors={errors} message={message} notice={notice} sending={sending} verifying={loading} remaining={remaining} submitRemaining={verifyRemaining} onSubmit={verify} onResend={resend}
    footer={<Button component={Link} to={ROUTER.FORGOT_PASSWORD} className={form.link} disabled={loading || sending}>Đổi địa chỉ email</Button>} />

  return <AuthCard component="form" noValidate onSubmit={step === "reset" ? reset : request} aria-busy={loading} aria-label={step === "reset" ? "Đặt lại mật khẩu" : "Quên mật khẩu"}>
    <AuthHeading eyebrow={step === "reset" ? "Bước 3 / 3 · Mật khẩu mới" : "Bước 1 / 3 · Khôi phục tài khoản"} title={step === "reset" ? "Đặt lại mật khẩu" : "Quên mật khẩu?"} description={step === "reset" ? "Tạo mật khẩu mới để tiếp tục sử dụng tài khoản FoodPrint." : "Nhập email đã đăng ký để nhận mã xác minh đặt lại mật khẩu."} />
    {step === "email" && location.state?.recoveryExpired && <Alert severity="info">Phiên khôi phục không còn hiệu lực. Vui lòng nhập email để nhận mã mới.</Alert>}
    <FormErrors errors={errors} message={message} />
    {step === "reset" ? <NewPasswordFields values={values} onChange={change} errors={errors} disabled={loading} />
      : <AuthField id="email" label="Email đã đăng ký" type="email" required autoComplete="email" placeholder="Nhập địa chỉ email" value={email} onChange={event => setEmail(event.target.value)} error={errors.email} inputProps={{ maxLength: 254 }} disabled={loading} />}
    <Button type="submit" variant="contained" className={form.primary} disabled={loading || remaining > 0}>{loading ? <CircularProgress size={22} color="inherit" aria-label={step === "reset" ? "Đang đặt lại mật khẩu" : "Đang gửi mã"} /> : remaining ? `Thử lại sau ${remaining}s` : step === "reset" ? "Cập nhật mật khẩu" : "Gửi mã xác nhận"}</Button>
    <Button component={Link} to={ROUTER.LOGIN} className={`${form.link} ${styles.back}`} disabled={loading}>Quay lại đăng nhập</Button>
  </AuthCard>
}
