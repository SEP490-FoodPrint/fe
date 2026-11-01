import React from "react"
import AuthInput from "./AuthInput"
import { PASSWORD_HINT } from "src/lib/authValidation"
import form from "./AuthForm.module.scss"

export default function NewPasswordFields({ values, onChange, errors, disabled }) {
  return (
    <>
      <AuthInput
        id="password"
        label="Mật khẩu mới"
        type="password"
        required
        span="full"
        showStrengthMeter={true}
        autoComplete="new-password"
        placeholder="Nhập mật khẩu mới"
        value={values.password}
        onChange={onChange("password")}
        error={errors.password}
        disabled={disabled}
      />
      <AuthInput
        id="confirmPassword"
        label="Nhập lại mật khẩu mới"
        type="password"
        required
        span="full"
        autoComplete="new-password"
        placeholder="Nhập lại mật khẩu mới"
        value={values.confirmPassword}
        onChange={onChange("confirmPassword")}
        error={errors.confirmPassword}
        disabled={disabled}
      />
      <p className={form.hint}>{PASSWORD_HINT}</p>
    </>
  )
}
