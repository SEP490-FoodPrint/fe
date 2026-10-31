import React, { useContext, useEffect, useState } from "react"
import { Alert, Button, Card, CircularProgress, IconButton } from "@mui/material"
import { Link, useLocation, useParams } from "react-router-dom"
import { StoreContext } from "src/contexts"
import RegistrationService from "src/services/RegistrationService"
import RequestFields from "src/components/Registration/RequestFields"
import RequestStatus from "src/components/Registration/RequestStatus"
import { formatRequestDate, organizationName, requestCode, REQUEST_TYPES } from "src/lib/registration"
import ROUTER from "src/router/ROUTER"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import ReviewDialog from "./ReviewDialog"
import SupportingDocuments from "./SupportingDocuments"
import RegisteredIngredients from "./RegisteredIngredients"
import styles from "./RegistrationDetail.module.scss"

export default function RegistrationDetail() {
  const { requestId } = useParams()
  const location = useLocation()
  const { userStore } = useContext(StoreContext)
  const [request, setRequest] = useState(null)
  const [isMock, setIsMock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [dialog, setDialog] = useState(null)
  const listUrl = `${ROUTER.SYSTEM_ORG_APPROVAL}${location.state?.listSearch || ""}`

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setDialog(null)
    window.scrollTo(0, 0)
    RegistrationService.getRequest(requestId, { signal: controller.signal }).then(response => {
      if (active) { setRequest(response.data); setIsMock(Boolean(response.isMock)) }
    }).catch(err => {
      if (active) setError(err.message || "Không thể tải hồ sơ đăng ký.")
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false; controller.abort() }
  }, [requestId, retry])

  if (loading) return <div className={styles.loading} role="status"><CircularProgress size={28} /><p>Đang tải chi tiết hồ sơ…</p></div>
  if (error || !request) return <div className={styles.page}><Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{error || "Không tìm thấy hồ sơ đăng ký."}</Alert></div>

  const profile = request.profile_data || {}
  const applicant = request.applicant || {}
  const type = REQUEST_TYPES[request.request_type] || request.request_type
  const code = requestCode(request.id)
  const isSupplier = request.request_type === "SUPPLIER"
  const field = (label, value) => ({ label, value })
  const requestFields = [
    field("Mã hồ sơ", code), field("Loại đăng ký", type),
    field("Trạng thái", <RequestStatus status={request.status} />), field("Ngày gửi", formatRequestDate(request.submitted_at, true)),
    field("Ngày xét duyệt", request.reviewed_at ? formatRequestDate(request.reviewed_at, true) : "Chưa xét duyệt"),
    field("Người xét duyệt", request.reviewer?.full_name || "Chưa có"), field("Cập nhật lần cuối", formatRequestDate(request.updated_at, true)),
  ]
  const applicantFields = [
    field("Họ và tên", applicant.full_name), field("Tên đăng nhập", applicant.username),
    field("Email", applicant.email), field("Số điện thoại", applicant.phone),
    field("Trạng thái tài khoản", <span className={applicant.status === "ACTIVE" ? styles.active : ""}>{({ ACTIVE: "Hoạt động", INACTIVE: "Ngừng hoạt động", PENDING: "Chờ xác minh", SUSPENDED: "Tạm khóa" })[applicant.status] || applicant.status || "Chưa cung cấp"}</span>),
    field("Xác minh email lúc", applicant.email_verified_at ? formatRequestDate(applicant.email_verified_at, true) : "Chưa có thông tin"),
  ]
  const profileFields = [field(isSupplier ? "Tên nhà cung cấp" : "Tên trường học", organizationName(request)),
    field(isSupplier ? "Mã số thuế" : "Mã trường", isSupplier ? profile.tax_code : profile.code),
    field("Email liên hệ", profile.email), field("Số điện thoại liên hệ", profile.phone),
    field("Địa chỉ", profile.address), field(isSupplier ? "Giới thiệu về nhà cung cấp" : "Giới thiệu về trường học", profile.description)]

  return (
    <section className={styles.page} aria-labelledby="request-detail-title">
      <div className={styles.heading}><IconButton component={Link} to={listUrl} className={styles.back} aria-label="Quay lại danh sách"><KeyboardArrowLeftIcon /></IconButton><h1 id="request-detail-title">Xem chi tiết</h1></div>
      <Card component="section" variant="outlined" className={styles.card} aria-label="Tóm tắt hồ sơ">
        <div className={styles.summaryTop}><span>{code}</span><RequestStatus status={request.status} /></div>
        <div className={styles.summaryFields}>
          <div><span>Loại hồ sơ</span><p>{type}</p></div>
          <div><span>Người đăng ký</span><p>{applicant.full_name || "Chưa cung cấp"}</p></div>
          <div><span>Ngày gửi</span><p>{formatRequestDate(request.submitted_at, true)}</p></div>
        </div>
      </Card>
      <Card component="section" variant="outlined" className={styles.card} aria-labelledby="review-title">
        <h2 id="review-title">Xét duyệt hồ sơ</h2>
        {request.status === "PENDING" ? <>
          <p className={styles.description}>Hồ sơ hiện đang chờ xét duyệt.</p>
          <div className={styles.actions}><Button variant="contained" disabled={!isMock} onClick={() => setDialog("APPROVED")}>Phê duyệt hồ sơ</Button><Button variant="outlined" className={styles.reject} disabled={!isMock} onClick={() => setDialog("REJECTED")}>Từ chối hồ sơ</Button></div>
          {!isMock && <p className={styles.description}>Chức năng xét duyệt hiện chưa khả dụng.</p>}
        </> : <>
          <RequestStatus status={request.status} />
          <RequestFields fields={[field("Người xét duyệt", request.reviewer?.full_name || "Chưa có"), field("Ngày xét duyệt", formatRequestDate(request.reviewed_at, true))]} />
          {request.rejection_reason && <RequestFields columns={1} fields={[field("Lý do từ chối", request.rejection_reason)]} />}
          <p className={styles.description}>Quyết định đã được ghi nhận.</p>
        </>}
      </Card>
      <div className={styles.infoColumns}>
        <Card component="section" variant="outlined" className={styles.card} aria-labelledby="request-info-title"><h2 id="request-info-title">Thông tin hồ sơ</h2><RequestFields fields={requestFields} /></Card>
        <Card component="section" variant="outlined" className={styles.card} aria-labelledby="applicant-info-title"><h2 id="applicant-info-title">Thông tin người đăng ký</h2><RequestFields fields={applicantFields} /></Card>
      </div>
      <Card component="section" variant="outlined" className={styles.card} aria-labelledby="organization-info-title"><h2 id="organization-info-title">Thông tin {isSupplier ? "nhà cung cấp" : "trường học"} đăng ký</h2><p className={styles.caption}>Thông tin do người đăng ký cung cấp.</p><RequestFields fields={profileFields} /></Card>
      <SupportingDocuments documents={request.supporting_documents || []} organization={organizationName(request)} />
      {isSupplier && <RegisteredIngredients ingredients={Array.isArray(profile.ingredients) ? profile.ingredients.filter(item => item && typeof item === "object") : []} />}
      {isMock && <p className={styles.note}>Dữ liệu và minh chứng minh họa cho giao diện.</p>}
      <ReviewDialog mode={dialog} request={request} reviewer={userStore?.user} onClose={() => setDialog(null)} onReviewed={updated => { setRequest(updated); setDialog("RESULT") }} />
    </section>
  )
}
