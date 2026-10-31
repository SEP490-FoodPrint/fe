import React, { useRef, useState } from "react"
import { Alert, Button, CircularProgress } from "@mui/material"
import { Link } from "react-router-dom"
import AuthService from "src/services/AuthService"
import AuthCard, { AuthHeading } from "src/components/Auth/AuthCard"
import AuthField from "src/components/Auth/AuthField"
import FormErrors from "src/components/Auth/FormErrors"
import ROUTER from "src/router/ROUTER"
import styles from "src/components/Auth/AuthForm.module.scss"
import layout from "./LoginForm.module.scss"

export default function LoginForm({ onLoginSuccess, initialIdentifier = "", passwordUpdated = false }) {
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
    } catch (error) { setMessage(error.message || "Đăng nhập thất bại. Vui lòng thử lại.") }
    finally { submitting.current = false; setLoading(false) }
  }

  return <AuthCard component="form" onSubmit={submit} noValidate aria-label="Đăng nhập FoodPrint" aria-busy={loading}>
    <AuthHeading eyebrow="Chào mừng trở lại" title="Đăng nhập FoodPrint" description="Một tài khoản, kết nối cùng bữa ăn học đường an toàn." />
    {passwordUpdated && <Alert severity="success" role="status">Mật khẩu đã được cập nhật. Vui lòng đăng nhập bằng mật khẩu mới.</Alert>}
    <FormErrors errors={errors} message={message} />
    <div className={layout.credentials}>
      <AuthField id="identifier" label="Tên đăng nhập hoặc email" required autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder="Nhập tên đăng nhập hoặc email" error={errors.identifier} inputProps={{ maxLength: 320, autoCapitalize: "none", spellCheck: false }} />
      <AuthField id="password" label="Mật khẩu" required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Nhập mật khẩu" error={errors.password} />
    </div>
    <div className={styles.forgot}><Button component={Link} to={ROUTER.FORGOT_PASSWORD} className={styles.link}>Quên mật khẩu?</Button></div>
    <Button type="submit" variant="contained" disabled={loading} className={styles.primary}>{loading ? <CircularProgress size={22} color="inherit" aria-label="Đang đăng nhập" /> : "Đăng nhập"}</Button>
    <Button component={Link} to={ROUTER.REGISTER} className={styles.link}>Chưa có tài khoản? Đăng ký đơn vị</Button>
  </AuthCard>
}
