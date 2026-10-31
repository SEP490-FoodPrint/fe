import React, { useContext, useEffect, useRef, useState } from "react"
import { Button } from "@mui/material"
import { Link, useLocation, useNavigate } from "react-router-dom"
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined"
import AuthCard, { AuthHeading, AuthStatusIcon } from "src/components/Auth/AuthCard"
import AuthField from "src/components/Auth/AuthField"
import EmailCodeForm from "src/components/Auth/EmailCodeForm"
import useCountdown from "src/lib/useCountdown"
import AuthService from "src/services/AuthService"
import { StoreContext } from "src/contexts"
import { clearSignupSession, readSignupSession, saveSignupSession } from "src/lib/signupSession"
import { validEmail } from "src/lib/authValidation"
import ROUTER from "src/router/ROUTER"
import form from "src/components/Auth/AuthForm.module.scss"

const failureMessage = (error, action) => [404, 405].includes(error.response?.status)
  ? `Máy chủ chưa hỗ trợ ${action}. Vui lòng thử lại sau.`
  : error.message || "Không thể xác nhận email. Vui lòng thử lại."

export default function ActivationForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loginStore, userStore, signupStore } = useContext(StoreContext)
  const [pending, setPending] = useState(() => location.state?.pendingSignup || readSignupSession())
  const [email, setEmail] = useState(pending?.email || "")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [verifiedEmail, setVerifiedEmail] = useState(pending?.emailVerified ? pending.email : "")
  const remaining = useCountdown(pending?.resendAt)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [notice, setNotice] = useState("")
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [success, setSuccess] = useState(false)
  const initialDelivery = useRef(null)
  const submitLock = useRef(false)
  const resendLock = useRef(false)
  const memoryPassword = signupStore.signupCredentials?.email === email.trim().toLowerCase() ? signupStore.signupCredentials.password : ""
  const verified = verifiedEmail === email.trim().toLowerCase()
  const home = () => navigate(ROUTER.DEFAULT, { replace: true, state: { promptRegistration: true } })

  useEffect(() => {
    if (!pending?.email || pending.codeSent || pending.emailVerified) return
    let active = true
    setSending(true)
    if (!initialDelivery.current) initialDelivery.current = AuthService.sendActivationCode(pending.email)
    initialDelivery.current.then(result => {
      if (!active) return
      setSending(false)
      setPending(saveSignupSession({ ...pending, codeSent: true, resendAt: Date.now() + (result?.resendAfter || 60) * 1000 }))
      setNotice("Mã xác nhận đã được gửi. Kiểm tra hộp thư đến và thư rác.")
    }).catch(error => { if (active) {
      setMessage(failureMessage(error, "gửi mã xác nhận email"))
      const retryAfter = Number(error.response?.headers?.["retry-after"])
      if (retryAfter > 0) setPending(saveSignupSession({ ...pending, resendAt: Date.now() + retryAfter * 1000 }))
    } })
      .finally(() => { if (active) setSending(false) })
    return () => { active = false }
    // One automatic delivery attempt per signup email, including React StrictMode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending?.email])

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => navigate(ROUTER.DEFAULT, { replace: true, state: { promptRegistration: true } }), 1200)
    return () => clearTimeout(timer)
  }, [success, navigate])

  const resend = async () => {
    if (resendLock.current || sending || verifying || remaining > 0) return
    if (!validEmail(email.trim())) { setErrors({ "activation-email": "Nhập địa chỉ email đã đăng ký hợp lệ." }); return }
    resendLock.current = true
    setSending(true)
    setMessage("")
    setNotice("")
    try {
      const result = await AuthService.sendActivationCode(email)
      setPending(saveSignupSession({ ...pending, email: email.trim().toLowerCase(), codeSent: true, resendAt: Date.now() + (result?.resendAfter || 60) * 1000 }))
      setNotice("Mã xác nhận đã được gửi lại. Kiểm tra hộp thư đến và thư rác.")
    } catch (error) {
      setMessage(failureMessage(error, "gửi mã xác nhận email"))
      const retryAfter = Number(error.response?.headers?.["retry-after"])
      if (retryAfter > 0) setPending(saveSignupSession({ ...pending, email, resendAt: Date.now() + retryAfter * 1000 }))
    }
    finally { resendLock.current = false; setSending(false) }
  }
  const verify = async event => {
    event.preventDefault()
    if (submitLock.current) return
    const next = {}
    if (!validEmail(email.trim())) next["activation-email"] = "Nhập địa chỉ email đã đăng ký hợp lệ."
    if (!verified && !/^[0-9]{6}$/.test(code.trim())) next["activation-code"] = "Mã xác nhận phải gồm 6 chữ số."
    if (!memoryPassword && !password) next["activation-password"] = "Nhập mật khẩu tài khoản để tiếp tục."
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    submitLock.current = true
    setVerifying(true)
    try {
      if (!verified) {
        await AuthService.verifyActivationCode({ email, code })
        setVerifiedEmail(email.trim().toLowerCase())
        setPending(saveSignupSession({ ...pending, email: email.trim().toLowerCase(), emailVerified: true }))
      }
      const { user } = await AuthService.login({ identifier: email, password: memoryPassword || password })
      userStore.setUser(user)
      loginStore.setIsLoginContext(true)
      signupStore.setSignupCredentials(null)
      clearSignupSession()
      setSuccess(true)
    } catch (error) {
      setMessage(failureMessage(error, "xác nhận mã email"))
      if (error.response?.status === 401) signupStore.setSignupCredentials(null)
    }
    finally { submitLock.current = false; setVerifying(false) }
  }

  if (success) return <AuthCard aria-live="polite">
    <AuthStatusIcon><CheckOutlinedIcon /></AuthStatusIcon>
    <AuthHeading eyebrow="Bước 2 / 4 · Kích hoạt email" title="Xác nhận tài khoản thành công" description="Email của bạn đã được xác minh. Bạn đang được chuyển về trang chủ." />
    <Button variant="contained" className={form.primary} onClick={home}>Về trang chủ</Button>
  </AuthCard>

  return <EmailCodeForm
    eyebrow="Bước 2 / 4 · Kích hoạt email"
    description={pending?.codeSent ? "Nhập mã được gửi đến email đăng ký để xác nhận tài khoản." : "Nhập mã xác nhận từ email để tiếp tục."}
    email={pending?.email}
    emailField={<AuthField id="activation-email" label="Email đã đăng ký" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} error={errors["activation-email"]} placeholder="Nhập địa chỉ email đã đăng ký" disabled={sending || verifying} />}
    code={code} onCodeChange={setCode} errors={errors} message={message} notice={notice}
    sending={sending} verifying={verifying} remaining={remaining} verified={verified}
    onSubmit={verify} onResend={resend} submitLabel="Xác nhận tài khoản"
    footer={<Button component={Link} to={ROUTER.REGISTER} className={form.link} disabled={sending || verifying}>Quay lại đăng ký</Button>}
  >
    {!memoryPassword && <AuthField id="activation-password" label="Mật khẩu tài khoản" type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} error={errors["activation-password"]} placeholder="Nhập mật khẩu bạn đã đăng ký" hint="Nhập mật khẩu để đăng nhập sau khi xác nhận email." disabled={sending || verifying} />}
  </EmailCodeForm>
}
