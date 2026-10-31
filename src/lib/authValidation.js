export const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
export const validPassword = value => [...value].length >= 15 && new TextEncoder().encode(value).length <= 72

export function signupErrors(values) {
  const errors = {}
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,119}$/.test(values.username.trim())) errors.username = "Tên đăng nhập cần 3–120 ký tự; dùng chữ, số và dấu . _ -, bắt đầu bằng chữ hoặc số."
  if (!values.fullName.trim() || values.fullName.trim().length > 255) errors.fullName = "Nhập tên người đại diện, tối đa 255 ký tự."
  if (!validEmail(values.email.trim()) || values.email.trim().length > 254) errors.email = "Nhập email người đại diện hợp lệ."
  if (values.phone.trim().length > 30) errors.phone = "Số điện thoại tối đa 30 ký tự."
  if (!validPassword(values.password)) errors.password = "Mật khẩu cần ít nhất 15 ký tự, tối đa 72 byte UTF-8."
  if (!values.confirmPassword || values.confirmPassword !== values.password) errors.confirmPassword = "Mật khẩu xác nhận chưa khớp."
  return errors
}
