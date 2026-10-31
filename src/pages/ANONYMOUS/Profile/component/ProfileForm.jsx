import React, { useEffect, useRef, useState } from "react"
import { Alert, Avatar, Button, Card, CircularProgress } from "@mui/material"
import { Link } from "react-router-dom"
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"
import AuthField from "src/components/Auth/AuthField"
import FormErrors from "src/components/Auth/FormErrors"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import styles from "./ProfileForm.module.scss"

export default function ProfileForm({ user, onUpdated }) {
  const [values, setValues] = useState({ fullName: user.fullName || "", phone: user.phone || "" })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [retry, setRetry] = useState(0)
  const locked = useRef(false)
  useEffect(() => {
    const controller = new AbortController()
    setFetching(true)
    setLoadError("")
    AuthService.getPersonalProfile({ signal: controller.signal }).then(profile => {
      if (controller.signal.aborted) return
      setValues({ fullName: profile.fullName || "", phone: profile.phone || "" })
      onUpdated(profile)
    }).catch(error => { if (!controller.signal.aborted) setLoadError(error.message || "Không thể tải profile.") })
      .finally(() => { if (!controller.signal.aborted) setFetching(false) })
    return () => controller.abort()
    // Loading is tied to the account ID; save operations update the same account in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, retry])
  const name = user.fullName || user.username || "Tài khoản"
  const dirty = values.fullName !== (user.fullName || "") || values.phone !== (user.phone || "")
  const reset = () => { setValues({ fullName: user.fullName || "", phone: user.phone || "" }); setErrors({}); setMessage(""); setSaved(false) }
  const submit = async event => {
    event.preventDefault()
    if (locked.current) return
    const next = {}
    if (!values.fullName.trim() || values.fullName.trim().length > 255) next["profile-full-name"] = "Nhập họ và tên, tối đa 255 ký tự."
    if (values.phone.trim().length > 30) next["profile-phone"] = "Số điện thoại tối đa 30 ký tự."
    setErrors(next)
    setMessage("")
    setSaved(false)
    if (Object.keys(next).length) return
    locked.current = true
    setLoading(true)
    try {
      const updated = await AuthService.updatePersonalProfile(values)
      onUpdated(updated)
      setValues({ fullName: updated.fullName, phone: updated.phone || "" })
      setSaved(true)
    } catch (error) { setMessage([404, 405].includes(error.response?.status) ? "Máy chủ chưa hỗ trợ cập nhật profile. Thay đổi của bạn chưa được lưu." : error.message || "Không thể lưu profile. Vui lòng thử lại.") }
    finally { locked.current = false; setLoading(false) }
  }
  return <section className={styles.page} aria-labelledby="personal-profile-title">
    <div className={styles.heading}><div><p>Tài khoản của bạn</p><h1 id="personal-profile-title">Profile</h1><span>Quản lý thông tin cá nhân và liên hệ của bạn.</span></div><Button component={Link} to={ROUTER.DEFAULT} startIcon={<ArrowBackOutlinedIcon />}>Trang chủ</Button></div>
    <Card component="form" onSubmit={submit} noValidate variant="outlined" className={styles.card} aria-busy={loading}>
      <div className={styles.identity}><Avatar src={user.avatarUrl || user.avatar || undefined} alt="" className={styles.avatar}>{name.trim().split(/\s+/).slice(-2).map(word => word[0]).join("").toUpperCase()}</Avatar><div><h2>{name}</h2><p>{user.email || user.username}</p></div></div>
      <FormErrors errors={errors} message={message} />
      {fetching && <CircularProgress size={24} aria-label="Đang tải profile" />}
      {loadError && <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{loadError}</Alert>}
      {saved && <Alert severity="success" role="status">Đã lưu thông tin profile.</Alert>}
      <div className={styles.fields}>
        <AuthField id="profile-full-name" label="Họ và tên" disabled={fetching || loading} required autoComplete="name" value={values.fullName} onChange={event => { setValues(previous => ({ ...previous, fullName: event.target.value })); setSaved(false) }} error={errors["profile-full-name"]} inputProps={{ maxLength: 255 }} />
        <AuthField id="profile-phone" label="Số điện thoại" disabled={fetching || loading} type="tel" autoComplete="tel" value={values.phone} onChange={event => { setValues(previous => ({ ...previous, phone: event.target.value })); setSaved(false) }} error={errors["profile-phone"]} inputProps={{ maxLength: 30 }} placeholder="Nhập số điện thoại" />
        <AuthField id="profile-username" label="Tên đăng nhập" value={user.username || ""} inputProps={{ readOnly: true }} />
        <AuthField id="profile-email" label="Email tài khoản" type="email" value={user.email || ""} placeholder="Chưa có thông tin" inputProps={{ readOnly: true }} />
      </div>
      <div className={styles.actions}><Button type="button" variant="outlined" onClick={reset} disabled={loading || fetching || !dirty}>Hủy thay đổi</Button><Button type="submit" variant="contained" disabled={loading || fetching || Boolean(loadError) || !dirty}>{loading ? <CircularProgress color="inherit" size={22} aria-label="Đang lưu profile" /> : "Lưu thay đổi"}</Button></div>
    </Card>
  </section>
}
