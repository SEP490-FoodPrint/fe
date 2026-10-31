export const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
export const PASSWORD_HINT = "Ít nhất 8 ký tự, gồm chữ thường, chữ hoa, chữ số và ký tự đặc biệt; tối đa 72 byte UTF-8."
export const validPassword = value => [...value].length >= 8 && new TextEncoder().encode(value).length <= 72 && /\p{Ll}/u.test(value) && /\p{Lu}/u.test(value) && /[0-9]/.test(value) && /[\p{P}\p{S}]/u.test(value)
export const validCurrentPassword = value => Boolean(value) && new TextEncoder().encode(value).length <= 72
export const newPasswordErrors = (password, confirmPassword) => ({
  ...(!validPassword(password) ? { password: PASSWORD_HINT } : {}),
  ...(!confirmPassword || confirmPassword !== password ? { confirmPassword: "Mật khẩu xác nhận chưa khớp." } : {}),
})

export function signupErrors(values) {
  const errors = {}
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,119}$/.test(values.username.trim())) errors.username = "Tên đăng nhập cần 3–120 ký tự; dùng chữ, số và dấu . _ -, bắt đầu bằng chữ hoặc số."
  if (!values.fullName.trim() || values.fullName.trim().length > 255) errors.fullName = "Nhập tên người đại diện, tối đa 255 ký tự."
  if (!validEmail(values.email.trim()) || values.email.trim().length > 254) errors.email = "Nhập email người đại diện hợp lệ."
  if (values.phone.trim().length > 30) errors.phone = "Số điện thoại tối đa 30 ký tự."
  if (!validPassword(values.password)) errors.password = PASSWORD_HINT
  if (!values.confirmPassword || values.confirmPassword !== values.password) errors.confirmPassword = "Mật khẩu xác nhận chưa khớp."
  return errors
}
