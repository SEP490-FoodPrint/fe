import React, { useState } from "react"
import { Alert, Button } from "@mui/material"
import { Link } from "react-router-dom"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import AuthCard, { AuthHeading, AuthStatusIcon } from "src/components/Auth/AuthCard"
import AuthField from "src/components/Auth/AuthField"
import FormErrors from "src/components/Auth/FormErrors"
import { validEmail, validPassword } from "src/lib/authValidation"
import ROUTER from "src/router/ROUTER"
import styles from "./PasswordRecovery.module.scss"
import form from "src/components/Auth/AuthForm.module.scss"

export default function PasswordRecovery({ reset, hasToken }) {
  const [values, setValues] = useState({ email: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const change = key => event => setValues(previous => ({ ...previous, [key]: event.target.value }))
  const submit = event => {
    event.preventDefault()
    const next = {}
    if (reset) {
      if (!validPassword(values.password)) next.password = "Mật khẩu cần ít nhất 15 ký tự, tối đa 72 byte UTF-8."
      if (!values.confirmPassword || values.confirmPassword !== values.password) next.confirmPassword = "Mật khẩu xác nhận chưa khớp."
    } else if (!validEmail(values.email.trim())) next.email = "Nhập email đã đăng ký hợp lệ."
    setErrors(next)
    setMessage(Object.keys(next).length ? "" : reset ? "Chức năng đặt lại mật khẩu hiện chưa khả dụng. Mật khẩu của bạn chưa được thay đổi." : "Chức năng khôi phục mật khẩu hiện chưa khả dụng. Chưa có email nào được gửi.")
  }
  if (reset && !hasToken) return <AuthCard>
    <AuthStatusIcon tone="error"><ErrorOutlineOutlinedIcon /></AuthStatusIcon>
    <AuthHeading eyebrow="Khôi phục tài khoản" title="Liên kết không hợp lệ" description="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới." />
    <Button component={Link} to={ROUTER.FORGOT_PASSWORD} variant="contained" className={form.primary}>Yêu cầu liên kết mới</Button>
  </AuthCard>
  return <AuthCard component="form" noValidate onSubmit={submit}>
    <AuthHeading eyebrow="Khôi phục tài khoản" title={reset ? "Đặt lại mật khẩu" : "Quên mật khẩu?"} description={reset ? "Tạo mật khẩu mới để tiếp tục sử dụng tài khoản FoodPrint." : "Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu."} />
    <FormErrors errors={errors} />
    {reset ? <>
      <AuthField id="password" label="Mật khẩu mới" required type="password" autoComplete="new-password" placeholder="Nhập mật khẩu mới" value={values.password} onChange={change("password")} error={errors.password} />
      <AuthField id="confirmPassword" label="Xác nhận mật khẩu mới" required type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={values.confirmPassword} onChange={change("confirmPassword")} error={errors.confirmPassword} />
      <p className={form.hint}>Mật khẩu: ít nhất 15 ký tự, tối đa 72 byte UTF-8.</p>
    </> : <AuthField id="email" label="Email đã đăng ký" type="email" required autoComplete="email" placeholder="Nhập địa chỉ email" value={values.email} onChange={change("email")} error={errors.email} inputProps={{ maxLength: 254 }} />}
    {message && <Alert severity="info" role="status">{message}</Alert>}
    <Button type="submit" variant="contained" className={form.primary}>{reset ? "Cập nhật mật khẩu" : "Gửi hướng dẫn đặt lại mật khẩu"}</Button>
    <Button component={Link} to={ROUTER.LOGIN} className={`${form.link} ${styles.back}`}>Quay lại đăng nhập</Button>
  </AuthCard>
}
