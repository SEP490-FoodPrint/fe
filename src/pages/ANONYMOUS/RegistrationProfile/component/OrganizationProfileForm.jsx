import React, { useEffect, useRef, useState } from "react"
import { Alert, Button, CircularProgress, IconButton } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined"
import { Link } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import AuthCard, { AuthHeading } from "src/components/Auth/AuthCard"
import AuthField from "src/components/Auth/AuthField"
import FormErrors from "src/components/Auth/FormErrors"
import { validEmail } from "src/lib/authValidation"
import AuthService from "src/services/AuthService"
import { usedCertification } from "src/services/AuthService/onboarding"
import DocumentUpload from "./DocumentUpload"
import styles from "./OrganizationProfileForm.module.scss"
import form from "src/components/Auth/AuthForm.module.scss"

const certificate = id => ({ id, certificationType: "", certificateNo: "", issuedDate: "", expiryDate: "", files: [], existingDocuments: [] })

export default function OrganizationProfileForm({ requestType, editing = false, onSubmitted }) {
  const supplier = requestType === "SUPPLIER"
  const [values, setValues] = useState({ name: "", code: "", taxCode: "", email: "", phone: "", address: "" })
  const [certifications, setCertifications] = useState(() => [certificate("cert-1"), certificate("cert-2")])
  const [documents, setDocuments] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(null)
  const [requestStatus, setRequestStatus] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState("")
  const nextId = useRef(3)
  const submitting = useRef(false)
  const [loading, setLoading] = useState(false)
  const [prefilling, setPrefilling] = useState(editing)
  const [loadError, setLoadError] = useState("")
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (!editing) return
    const controller = new AbortController()
    setPrefilling(true)
    setLoadError("")
    AuthService.getOnboarding({ signal: controller.signal }).then(request => {
      if (controller.signal.aborted) return
      if (!request) throw new Error("Không tìm thấy hồ sơ đăng ký. Vui lòng tải lại trang.")
      if (!["PENDING", "REJECTED"].includes(request.status)) throw new Error("Hồ sơ đã được xét duyệt và không còn được chỉnh sửa.")
      const profile = request?.profileData || {}
      setRequestStatus(request.status)
      setExpectedUpdatedAt(request.updatedAt)
      setExistingDocuments((request.documents || []).filter(document => document.field === "legalDocument"))
      setValues(previous => Object.fromEntries(Object.keys(previous).map(key => [key, profile[key] || ""])))
      setCertifications((profile.certifications || []).map((row, index) => ({ ...certificate(`cert-${index + 1}`), ...row, issuedDate: row.issuedDate || "", expiryDate: row.expiryDate || "", existingDocuments: (request.documents || []).filter(document => document.field === `certificate_${index}`) })))
      nextId.current = (profile.certifications?.length || 0) + 1
    }).catch(error => { if (!controller.signal.aborted) setLoadError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setPrefilling(false) })
    return () => controller.abort()
  }, [editing, retry])
  const change = key => event => setValues(previous => ({ ...previous, [key]: event.target.value }))
  const updateCertificate = (id, key, value) => setCertifications(previous => previous.map(row => row.id === id ? { ...row, [key]: value } : row))
  const addCertificate = () => {
    if (certifications.length >= 20) return
    const id = `cert-${nextId.current++}`
    setCertifications(previous => [...previous, certificate(id)])
    requestAnimationFrame(() => document.getElementById(`${id}-certificationType`)?.focus())
  }
  const removeCertificate = id => {
    setCertifications(previous => previous.filter(row => row.id !== id))
    requestAnimationFrame(() => document.getElementById("add-certification")?.focus())
  }
  const submit = async event => {
    event.preventDefault()
    if (submitting.current) return
    const next = {}
    if (!values.name.trim() || values.name.trim().length > 255) next.name = supplier ? "Nhập tên nhà cung cấp, tối đa 255 ký tự." : "Nhập tên trường, tối đa 255 ký tự."
    if (values.email && (!validEmail(values.email.trim()) || values.email.trim().length > 254)) next.email = "Email liên hệ không hợp lệ."
    if (values.phone.trim().length > 30) next.phone = "Số điện thoại tối đa 30 ký tự."
    if (supplier) {
      const numbers = new Set()
      certifications.forEach(row => {
        if (!usedCertification(row)) return
        if (!row.certificationType.trim()) next[`${row.id}-certificationType`] = "Nhập loại giấy phép / chứng nhận."
        if (!row.certificateNo.trim()) next[`${row.id}-certificateNo`] = "Nhập số giấy phép / chứng nhận."
        else if (numbers.has(row.certificateNo.trim())) next[`${row.id}-certificateNo`] = "Số chứng nhận không được trùng."
        numbers.add(row.certificateNo.trim())
        if (row.issuedDate && row.expiryDate && row.expiryDate < row.issuedDate) next[`${row.id}-expiryDate`] = "Ngày hết hạn phải bằng hoặc sau ngày cấp."
      })
    }
    const invalidFile = files => files.some(file => !["application/pdf", "image/png", "image/jpeg"].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024)
    const fileError = "Chọn PDF, PNG hoặc JPEG, có dữ liệu và không quá 5 MiB/tệp."
    if (invalidFile(documents)) next["school-documents"] = fileError
    certifications.forEach(row => { if (invalidFile(row.files)) next[`${row.id}-file`] = fileError })
    setErrors(next)
    setMessage("")
    if (Object.keys(next).length) return
    submitting.current = true
    setLoading(true)
    try { onSubmitted(await AuthService.submitOnboarding({ requestType, values, certifications, documents, existingDocuments, editing, expectedUpdatedAt })) }
    catch (error) { setMessage(error.message || "Không thể gửi hồ sơ. Vui lòng thử lại.") }
    finally { submitting.current = false; setLoading(false) }
  }

  if (prefilling) return <AuthCard><CircularProgress size={28} aria-label="Đang tải hồ sơ" /></AuthCard>
  if (loadError) return <AuthCard><Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{loadError}</Alert></AuthCard>

  return <AuthCard size="profile" component="form" noValidate onSubmit={submit} aria-busy={loading} aria-label={supplier ? "Hồ sơ nhà cung cấp" : "Hồ sơ nhà trường"}>
    <AuthHeading eyebrow="Hồ sơ đăng ký" title={editing ? (supplier ? "Chỉnh sửa hồ sơ nhà cung cấp" : "Chỉnh sửa hồ sơ nhà trường") : (supplier ? "Hoàn thiện hồ sơ nhà cung cấp" : "Hoàn thiện hồ sơ nhà trường")} description="Kiểm tra thông tin trước khi gửi hồ sơ xét duyệt." />
    <FormErrors errors={errors} message={message} />
    {editing && <p className={form.hint}>Các tệp đã tải lên được giữ lại. Chọn tệp mới để thay thế hoặc bấm dấu × cạnh tệp để bỏ khỏi hồ sơ.</p>}
    <fieldset className={styles.fields} disabled={loading}>
    <div className={form.grid}>
      <div className={form.full}><AuthField id="name" label={supplier ? "Tên nhà cung cấp" : "Tên trường"} required placeholder={supplier ? "Nhập tên nhà cung cấp" : "Nhập tên trường"} value={values.name} onChange={change("name")} error={errors.name} autoComplete="organization" inputProps={{ maxLength: 255 }} /></div>
      <AuthField id={supplier ? "taxCode" : "code"} label={supplier ? "Mã số thuế" : "Mã trường (nếu có)"} placeholder={supplier ? "Nhập mã số thuế" : "Nhập mã trường"} value={supplier ? values.taxCode : values.code} onChange={change(supplier ? "taxCode" : "code")} inputProps={{ maxLength: 80 }} />
      <AuthField id="email" label={supplier ? "Email doanh nghiệp" : "Email liên hệ"} placeholder={supplier ? "Nhập email doanh nghiệp" : "Nhập email liên hệ"} type="email" value={values.email} onChange={change("email")} error={errors.email} inputProps={{ maxLength: 254 }} />
      <div className={!supplier ? form.full : undefined}><AuthField id="phone" label={supplier ? "Số điện thoại liên hệ" : "Số điện thoại"} placeholder="Nhập số điện thoại" type="tel" value={values.phone} onChange={change("phone")} error={errors.phone} inputProps={{ maxLength: 30 }} /></div>
      <div className={!supplier ? form.full : undefined}><AuthField id="address" label={supplier ? "Địa chỉ kinh doanh" : "Địa chỉ trường"} placeholder={supplier ? "Nhập địa chỉ kinh doanh" : "Nhập địa chỉ trường"} value={values.address} onChange={change("address")} autoComplete="street-address" inputProps={{ maxLength: 4000 }} /></div>
    </div>
    {supplier ? <section className={styles.certifications} aria-labelledby="certifications-title">
      <div className={styles.sectionHeading}><h2 id="certifications-title">Giấy phép & chứng nhận</h2><p className={form.hint}>Bạn có thể thêm nhiều giấy chứng nhận. Mỗi giấy có thông tin và tệp đính kèm riêng.</p></div>
      {certifications.map((row, index) => <section key={row.id} className={styles.certificate} aria-labelledby={`${row.id}-title`}>
        <div className={styles.certificateHeading}><h3 id={`${row.id}-title`}>Giấy chứng nhận {index + 1}</h3><IconButton type="button" onClick={() => removeCertificate(row.id)} aria-label={`Xóa giấy chứng nhận ${index + 1}`}><DeleteOutlineIcon /></IconButton></div>
        <div className={form.grid}>
          <AuthField id={`${row.id}-certificationType`} label="Loại giấy phép / chứng nhận" placeholder="Nhập loại chứng nhận" value={row.certificationType} onChange={event => updateCertificate(row.id, "certificationType", event.target.value)} error={errors[`${row.id}-certificationType`]} inputProps={{ maxLength: 120 }} />
          <AuthField id={`${row.id}-certificateNo`} label="Số giấy phép / chứng nhận" placeholder="Nhập số chứng nhận" value={row.certificateNo} onChange={event => updateCertificate(row.id, "certificateNo", event.target.value)} error={errors[`${row.id}-certificateNo`]} inputProps={{ maxLength: 120 }} />
          <AuthField id={`${row.id}-issuedDate`} label="Ngày cấp" type="date" value={row.issuedDate} onChange={event => updateCertificate(row.id, "issuedDate", event.target.value)} inputProps={{ max: row.expiryDate || undefined }} />
          <AuthField id={`${row.id}-expiryDate`} label="Ngày hết hạn" type="date" value={row.expiryDate} onChange={event => updateCertificate(row.id, "expiryDate", event.target.value)} error={errors[`${row.id}-expiryDate`]} inputProps={{ min: row.issuedDate || undefined }} />
        </div>
        <p className={form.hint}>Nếu nhập cả hai ngày, ngày hết hạn phải bằng hoặc sau ngày cấp.</p>
        <DocumentUpload id={`${row.id}-file`} title="Tệp chứng nhận" label="Chọn tệp chứng nhận" files={row.files} existingDocuments={row.existingDocuments} disabled={loading} error={errors[`${row.id}-file`]}
          onChange={files => updateCertificate(row.id, "files", files)}
          onRemoveExisting={id => updateCertificate(row.id, "existingDocuments", row.existingDocuments.filter(document => document.id !== id))} />
      </section>)}
      <Button id="add-certification" type="button" variant="outlined" startIcon={<AddIcon />} className={form.secondary} onClick={addCertificate} disabled={loading || certifications.length >= 20}>Thêm giấy chứng nhận</Button>
      <p className={form.hint}>Khi bổ sung một giấy chứng nhận, cần nhập loại và số chứng nhận.</p>
    </section> : <DocumentUpload id="school-documents" title="Tài liệu pháp lý nhà trường" label="Chọn tệp tài liệu" files={documents} existingDocuments={existingDocuments} disabled={loading} error={errors["school-documents"]} onChange={setDocuments} onRemoveExisting={id => setExistingDocuments(previous => previous.filter(document => document.id !== id))} />}
    <p className={form.hint}>{supplier ? "* Chỉ tên nhà cung cấp là bắt buộc. Chứng nhận được bổ sung theo hồ sơ hiện có." : "* Chỉ tên trường là bắt buộc. Các trường khác được bổ sung theo hồ sơ hiện có."}</p>
    </fieldset>
    <div className={styles.actions}>
      {editing && <Button component={Link} to={ROUTER.REGISTRATION_STATUS} variant="outlined" className={form.secondary} disabled={loading}>Hủy thay đổi</Button>}
      <Button type="submit" variant="contained" className={form.primary} disabled={loading}>{loading ? <CircularProgress size={22} color="inherit" aria-label="Đang gửi hồ sơ" /> : editing ? (requestStatus === "REJECTED" ? "Gửi lại hồ sơ" : "Lưu thay đổi") : "Gửi hồ sơ xét duyệt"}</Button>
    </div>
  </AuthCard>
}
