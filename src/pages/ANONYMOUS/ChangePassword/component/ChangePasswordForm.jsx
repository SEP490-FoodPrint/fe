import React, { useRef, useState } from "react"
import { Alert, Button, CircularProgress } from "@mui/material"
import { Link } from "react-router-dom"
import AuthCard, { AuthHeading } from "src/components/Auth/AuthCard"
import AuthField from "src/components/Auth/AuthField"
import FormErrors from "src/components/Auth/FormErrors"
import NewPasswordFields from "src/components/Auth/NewPasswordFields"
import { newPasswordErrors, validCurrentPassword } from "src/lib/authValidation"
import useCountdown from "src/lib/useCountdown"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import styles from "./ChangePasswordForm.module.scss"
import form from "src/components/Auth/AuthForm.module.scss"

export default function ChangePasswordForm({ onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [verified, setVerified] = useState(false)
  const [values, setValues] = useState({ password: "", confirmPassword: "" })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [retryAt, setRetryAt] = useState(0)
  const remaining = useCountdown(retryAt)
  const lock = useRef(false)
  const change = key => event => setValues(previous => ({ ...previous, [key]: event.target.value }))
  const back = () => { setVerified(false); setCurrentPassword(""); setValues({ password: "", confirmPassword: "" }); setErrors({}); setMessage("") }
  const submit = async event => {
    event.preventDefault()
    if (lock.current || remaining) return
    const next = verified ? newPasswordErrors(values.password, values.confirmPassword) : validCurrentPassword(currentPassword) ? {} : { "current-password": "Nhập mật khẩu hiện tại, tối đa 72 byte UTF-8." }
    if (verified && values.password === currentPassword) next.password = "Mật khẩu mới phải khác mật khẩu hiện tại."
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    lock.current = true
    setLoading(true)
    try {
      if (!verified) {
        await AuthService.verifyCurrentPassword(currentPassword)
        setVerified(true)
        requestAnimationFrame(() => document.getElementById("password")?.focus())
      } else {
        await AuthService.changePassword({ currentPassword, newPassword: values.password })
        setCurrentPassword("")
        setValues({ password: "", confirmPassword: "" })
        onSuccess()
      }
    } catch (error) {
      setMessage(error.message || "Không thể cập nhật mật khẩu. Vui lòng thử lại.")
      const wait = Number(error.response?.headers?.["retry-after"]) || (error.response?.status === 429 ? 60 : 0)
      if (wait > 0) setRetryAt(Date.now() + wait * 1000)
      if (verified && error.response?.status === 400 && /mật khẩu hiện tại/i.test(error.message) && !/phải khác/i.test(error.message)) {
        setVerified(false)
        setCurrentPassword("")
        setValues({ password: "", confirmPassword: "" })
      }
    }
    finally { lock.current = false; setLoading(false) }
  }
  return <section className={styles.page}>
    <AuthCard component="form" noValidate onSubmit={submit} aria-busy={loading}>
      <AuthHeading eyebrow={verified ? "Bước 2 / 2 · Mật khẩu mới" : "Bước 1 / 2 · Xác nhận mật khẩu hiện tại"} title="Đổi mật khẩu" description={verified ? "Nhập mật khẩu mới và xác nhận lại để lưu thay đổi." : "Xác nhận mật khẩu hiện tại trước khi tạo mật khẩu mới."} />
      <FormErrors errors={errors} message={message} />
      {verified ? <>
        <Alert severity="success" role="status">Đã xác nhận mật khẩu hiện tại.</Alert>
        <NewPasswordFields values={values} onChange={change} errors={errors} disabled={loading} />
        <p className={form.hint}>Sau khi đổi mật khẩu, bạn cần đăng nhập lại trên các thiết bị.</p>
      </> : <AuthField id="current-password" label="Mật khẩu hiện tại" type="password" required autoComplete="current-password" placeholder="Nhập mật khẩu hiện tại" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} error={errors["current-password"]} disabled={loading} />}
      <Button type="submit" variant="contained" className={form.primary} disabled={loading || remaining > 0}>{loading ? <CircularProgress size={22} color="inherit" aria-label={verified ? "Đang đổi mật khẩu" : "Đang kiểm tra mật khẩu"} /> : remaining ? `Thử lại sau ${remaining}s` : verified ? "Cập nhật mật khẩu" : "Tiếp tục"}</Button>
      {verified ? <Button type="button" onClick={back} className={form.link} disabled={loading}>Nhập lại mật khẩu hiện tại</Button> : <Button component={Link} to={ROUTER.FORGOT_PASSWORD} className={form.link} disabled={loading}>Quên mật khẩu?</Button>}
    </AuthCard>
  </section>
}
