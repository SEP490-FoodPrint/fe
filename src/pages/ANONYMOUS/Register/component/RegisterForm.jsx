import React, { useContext, useRef, useState } from "react"
import { Button, CircularProgress, Tab, Tabs } from "@mui/material"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import AuthCard, { AuthHeading } from "src/components/Auth/AuthCard"
import AuthField from "src/components/Auth/AuthField"
import FormErrors from "src/components/Auth/FormErrors"
import AuthService from "src/services/AuthService"
import { PASSWORD_HINT, signupErrors } from "src/lib/authValidation"
import { saveSignupSession } from "src/lib/signupSession"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import styles from "./RegisterForm.module.scss"
import form from "src/components/Auth/AuthForm.module.scss"

const empty = { username: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "" }
const fields = [
  { id: "username", label: "Tên đăng nhập", placeholder: "Nhập tên đăng nhập", autoComplete: "username", maxLength: 120 },
  { id: "fullName", label: "Tên người đại diện", placeholder: "Nhập tên người đại diện", autoComplete: "name", maxLength: 255 },
  { id: "email", label: "Email người đại diện", placeholder: "Nhập email người đại diện", type: "email", autoComplete: "email", maxLength: 254 },
  { id: "phone", label: "Số điện thoại người đại diện", placeholder: "Nhập số điện thoại người đại diện", type: "tel", autoComplete: "tel", maxLength: 30 },
  { id: "password", label: "Mật khẩu", placeholder: "Tạo mật khẩu", type: "password", autoComplete: "new-password" },
  { id: "confirmPassword", label: "Xác nhận mật khẩu", placeholder: "Nhập lại mật khẩu", type: "password", autoComplete: "new-password" },
]

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

  const submit = async event => {
    event.preventDefault()
    if (submitting.current) return
    const next = signupErrors(values)
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    submitting.current = true
    setLoading(true)
    try {
      const response = await AuthService.signup({ username: values.username.trim(), fullName: values.fullName.trim(), email: values.email.trim().toLowerCase(), password: values.password, ...(values.phone.trim() ? { phone: values.phone.trim() } : {}), requestType })
      const codeSent = response.verificationEmailSent === true
      const pending = saveSignupSession({ email: values.email.trim().toLowerCase(), username: response.user.username, requestType, codeSent, resendAt: codeSent ? Date.now() + 60_000 : 0 })
      signupStore.setSignupCredentials({ email: pending.email, password: values.password })
      setValues(empty)
      navigate(ROUTER.ACTIVATE_ACCOUNT, { replace: true, state: { pendingSignup: pending, requestCode: !pending.codeSent } })
      document.getElementById("root")?.scrollTo(0, 0)
    } catch (error) { setMessage(error.message || "Không thể tạo tài khoản. Vui lòng thử lại.") }
    finally { submitting.current = false; setLoading(false) }
  }

  return <AuthCard size="registration" component="form" onSubmit={submit} noValidate aria-label="Đăng ký đơn vị FoodPrint" aria-busy={loading}>
    <AuthHeading eyebrow="Bước 1 / 4 · Tạo tài khoản" title="Bắt đầu cùng FoodPrint" description="Tạo tài khoản để đăng ký đơn vị của bạn." />
    <Tabs value={requestType} onChange={(_, value) => setParams({ type: value }, { replace: true })} variant="fullWidth" className={form.tabs} aria-label="Loại đơn vị đăng ký">
      <Tab value="SCHOOL" className={form.tab} id="tab-school" aria-controls="registration-account-fields" label={<div><span>Đăng ký </span><span>nhà trường</span></div>} disabled={loading} />
      <Tab value="SUPPLIER" className={form.tab} id="tab-supplier" aria-controls="registration-account-fields" label={<div><span>Đăng ký </span><span>nhà cung cấp</span></div>} disabled={loading} />
    </Tabs>
    <p className={form.hint}>Tạo tài khoản bằng thông tin người đại diện. Xác nhận mã được gửi đến email để tiếp tục sử dụng FoodPrint.</p>
    <FormErrors errors={errors} message={message} />
    <div className={`${form.grid} ${styles.accountFields}`} role="tabpanel" id="registration-account-fields" aria-labelledby={requestType === "SCHOOL" ? "tab-school" : "tab-supplier"}>
      {fields.map(({ id, maxLength, ...field }) => <AuthField key={id} id={id} {...field} required={id !== "phone"} value={values[id]} onChange={event => setValues(previous => ({ ...previous, [id]: event.target.value }))} error={errors[id]} inputProps={{ maxLength, ...(["username", "email"].includes(id) ? { autoCapitalize: "none", spellCheck: false } : {}) }} />)}
    </div>
    <p className={form.hint}>Tên đăng nhập: 3–120 ký tự, bắt đầu bằng chữ hoặc số; dùng chữ, số và dấu . _ -</p>
    <p className={form.hint}>{PASSWORD_HINT}</p>
    <p className={form.hint}>* Trường bắt buộc. Số điện thoại người đại diện không bắt buộc.</p>
    <Button type="submit" variant="contained" className={form.primary} disabled={loading}>{loading ? <CircularProgress size={22} color="inherit" aria-label="Đang tạo tài khoản" /> : "Tạo tài khoản"}</Button>
    <Button component={Link} to={ROUTER.LOGIN} className={form.link}>Đã có tài khoản? Đăng nhập</Button>
  </AuthCard>
}
