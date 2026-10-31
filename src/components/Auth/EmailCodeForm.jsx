import React from "react"
import { Alert, Button, CircularProgress } from "@mui/material"
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined"
import AuthCard, { AuthHeading, AuthStatusIcon } from "./AuthCard"
import AuthField from "./AuthField"
import FormErrors from "./FormErrors"
import styles from "./EmailCodeForm.module.scss"
import form from "./AuthForm.module.scss"

export default function EmailCodeForm({ eyebrow, description, email, emailField, code, onCodeChange, codeId = "activation-code", errors, message, notice, sending, verifying, remaining, submitRemaining = 0, onSubmit, onResend, submitLabel = "Xác nhận mã", verified = false, children, footer }) {
  return <AuthCard component="form" noValidate onSubmit={onSubmit} aria-busy={verifying || sending}>
    <AuthStatusIcon><MailOutlineIcon /></AuthStatusIcon>
    <AuthHeading eyebrow={eyebrow} title="Kiểm tra email của bạn" description={description} />
    {email ? <p className={styles.email}>{email}</p> : emailField}
    <FormErrors errors={errors} message={message} />
    {verified ? <Alert severity="success" role="status">Email đã được xác nhận. Tiếp tục để vào trang chủ.</Alert>
      : <AuthField id={codeId} label="Mã xác nhận" required placeholder="Nhập mã 6 chữ số trong email" autoComplete="one-time-code" value={code} onChange={event => onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))} error={errors[codeId]} disabled={verifying || sending} inputProps={{ maxLength: 12, inputMode: "numeric", autoCapitalize: "none", spellCheck: false }} />}
    {children}
    {notice && <Alert severity="success" role="status">{notice}</Alert>}
    <Button type="submit" variant="contained" className={form.primary} disabled={verifying || sending || submitRemaining > 0}>{verifying ? <CircularProgress size={22} color="inherit" aria-label="Đang xác nhận" /> : submitRemaining ? `Thử lại sau ${submitRemaining}s` : submitLabel}</Button>
    {!verified && <Button type="button" className={form.link} onClick={onResend} disabled={sending || verifying || remaining > 0}>{sending ? "Đang gửi mã…" : remaining > 0 ? `Gửi lại mã sau ${remaining}s` : "Chưa nhận được email? Gửi lại mã"}</Button>}
    <p className={styles.note}>Kiểm tra cả hộp thư đến và thư rác.</p>
    {footer}
  </AuthCard>
}
