import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Alert, Button } from "@mui/material"
import {
  EditOutlined,
  EmailOutlined,
  KeyboardArrowLeft,
  LocationOnOutlined,
  PersonOutlined,
  PhoneOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatDateVi,
  getCertificationHealth,
  getCooperationStatusLabel,
  getFacilityAttention,
  getFacilityTypeLabel,
} from "src/services/SourceFacilityService"
import styles from "./FacilityDetailView.module.scss"

function getCertStatusClass(status) {
  if (status === "EXPIRED") return styles.certExpired
  if (status === "EXPIRING_SOON") return styles.certExpiringSoon
  if (status === "MISSING_DATE") return styles.certExpiringSoon
  return styles.certValid
}

function FacilityDetailView({
  facility,
  loading = false,
  error = null,
  demoNotice = "",
  onRetry,
  onEdit,
}) {
  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.headerLeft}>
            <Link
              to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
              className={styles.backButton}
              aria-label="Quay lại danh sách cơ sở nguồn cung"
            >
              <KeyboardArrowLeft />
            </Link>
            <h1 className={styles.detailTitle}>Chi tiết cơ sở nguồn cung</h1>
          </div>
        </div>
        <div className={styles.surfaceCard}>
          <p className={styles.stateMessage} role="status" aria-live="polite">
            Đang tải thông tin cơ sở nguồn cung...
          </p>
        </div>
      </div>
    )
  }

  if (error || !facility) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.headerLeft}>
            <Link
              to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
              className={styles.backButton}
              aria-label="Quay lại danh sách cơ sở nguồn cung"
            >
              <KeyboardArrowLeft />
            </Link>
            <h1 className={styles.detailTitle}>Chi tiết cơ sở nguồn cung</h1>
          </div>
        </div>
        <div className={styles.surfaceCard}>
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>
              Không tìm thấy cơ sở nguồn cung
            </p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Cơ sở bạn đang tìm không tồn tại hoặc đã bị xóa khỏi phiên làm việc."}
            </p>
            <div className={styles.stateActions}>
              {onRetry && error && error?.response?.status !== 404 && (
                <Button variant="outlined" color="primary" onClick={onRetry}>
                  Thử lại
                </Button>
              )}
              <Button
                component={Link}
                to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
                variant="contained"
                color="primary"
              >
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const attention = getFacilityAttention(facility)
  const isActive = facility.cooperationStatus !== "PAUSED"
  const ingredients = Array.isArray(facility.suppliedIngredients)
    ? facility.suppliedIngredients
    : []
  const certifications = Array.isArray(facility.certifications)
    ? facility.certifications
    : []

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderBar}>
        <div className={styles.headerLeft}>
          <Link
            to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
            className={styles.backButton}
            aria-label="Quay lại danh sách cơ sở nguồn cung"
          >
            <KeyboardArrowLeft />
          </Link>
          <div className={styles.titleBlock}>
            <div className={styles.titleMetaRow}>
              <span className={styles.codeBadge}>{facility.code}</span>
              <span className={styles.typeChip}>
                {getFacilityTypeLabel(facility.facilityType)}
              </span>
              <span
                className={`${styles.statusBadge} ${
                  isActive ? styles.statusActive : styles.statusPaused
                }`}
              >
                {getCooperationStatusLabel(facility.cooperationStatus)}
              </span>
            </div>
            <h1 className={styles.detailTitle}>{facility.name}</h1>
          </div>
        </div>

        <Button
          type="button"
          variant="contained"
          color="primary"
          startIcon={<EditOutlined />}
          onClick={() => onEdit?.(facility)}
          className={styles.editButton}
        >
          Chỉnh sửa
        </Button>
      </div>

      {demoNotice && (
        <div className={styles.demoNoticeBar} data-demo-source="mock">
          <span className={styles.demoBadge}>Dữ liệu minh họa</span>
          <span className={styles.demoText}>{demoNotice}</span>
        </div>
      )}

      {attention.needsAttention && (
        <Alert
          severity={attention.severity === "error" ? "error" : "warning"}
          className={styles.attentionAlert}
        >
          <strong className={styles.alertHeading}>
            Cảnh báo hồ sơ cơ sở: {attention.primaryWarning}
          </strong>
          <ul className={styles.alertReasons}>
            {attention.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Section 1: Thông tin cơ sở & Liên hệ */}
      <section
        className={styles.surfaceCard}
        aria-labelledby="facility-info-heading"
      >
        <div className={styles.sectionHeader}>
          <h2 id="facility-info-heading" className={styles.sectionTitle}>
            Thông tin cơ sở và liên hệ
          </h2>
          <span className={styles.updatedAt}>
            Cập nhật: {formatDateVi(facility.updatedAt)}
          </span>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>Mã cơ sở</span>
            <strong className={`${styles.fieldValue} ${styles.tabularText}`}>
              {facility.code}
            </strong>
          </div>

          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>Loại cơ sở</span>
            <strong className={styles.fieldValue}>
              {getFacilityTypeLabel(facility.facilityType)}
            </strong>
          </div>

          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>Trạng thái hợp tác</span>
            <strong className={styles.fieldValue}>
              {getCooperationStatusLabel(facility.cooperationStatus)}
            </strong>
          </div>

          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>Người liên hệ</span>
            <strong className={styles.fieldValueIcon}>
              <PersonOutlined className={styles.fieldIcon} aria-hidden="true" />
              <span>{facility.contactName}</span>
            </strong>
          </div>

          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>Số điện thoại</span>
            <strong
              className={`${styles.fieldValueIcon} ${styles.tabularText}`}
            >
              <PhoneOutlined className={styles.fieldIcon} aria-hidden="true" />
              <span>{facility.contactPhone}</span>
            </strong>
          </div>

          <div className={styles.infoField}>
            <span className={styles.fieldLabel}>Email liên hệ</span>
            <strong className={styles.fieldValueIcon}>
              <EmailOutlined className={styles.fieldIcon} aria-hidden="true" />
              <span>{facility.contactEmail || "Chưa cập nhật"}</span>
            </strong>
          </div>

          <div className={`${styles.infoField} ${styles.fullSpan}`}>
            <span className={styles.fieldLabel}>Địa chỉ cơ sở</span>
            <strong className={styles.fieldValueIcon}>
              <LocationOnOutlined
                className={styles.fieldIcon}
                aria-hidden="true"
              />
              <span>{facility.address}</span>
            </strong>
          </div>

          {facility.operationalNotes && (
            <div className={`${styles.infoField} ${styles.fullSpan}`}>
              <span className={styles.fieldLabel}>Ghi chú vận hành</span>
              <p className={styles.noteParagraph}>
                {facility.operationalNotes}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Nguyên liệu cung ứng */}
      <section
        className={styles.surfaceCard}
        aria-labelledby="facility-ingredients-heading"
      >
        <div className={styles.sectionHeader}>
          <h2 id="facility-ingredients-heading" className={styles.sectionTitle}>
            Nguyên liệu cung ứng
          </h2>
          <span className={styles.countMeta}>
            {ingredients.length} nguyên liệu
          </span>
        </div>

        {ingredients.length === 0 ? (
          <p className={styles.emptySectionText}>
            Chưa khai báo danh mục nguyên liệu cung ứng từ cơ sở này.
          </p>
        ) : (
          <>
            <div className={styles.subTableWrap}>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th scope="col">Tên nguyên liệu</th>
                    <th scope="col">Nhóm</th>
                    <th scope="col">Đơn vị tính</th>
                    <th scope="col">Quy chuẩn / Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(item => (
                    <tr key={item.id || item.name}>
                      <td className={styles.strongCell}>{item.name}</td>
                      <td>{item.group || "—"}</td>
                      <td>{item.unit || "—"}</td>
                      <td>{item.standard || "Theo tiêu chuẩn hợp đồng"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.subCardList}>
              {ingredients.map(item => (
                <div key={item.id || item.name} className={styles.subCardItem}>
                  <div className={styles.subCardTop}>
                    <strong>{item.name}</strong>
                    <span className={styles.unitTag}>{item.unit || "—"}</span>
                  </div>
                  <p className={styles.subCardMeta}>
                    {item.group || "Nguyên liệu thực phẩm"}
                    {item.standard ? ` · ${item.standard}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Section 3: Chứng nhận & Ngày hết hạn */}
      <section
        className={styles.surfaceCard}
        aria-labelledby="facility-certs-heading"
      >
        <div className={styles.sectionHeader}>
          <h2 id="facility-certs-heading" className={styles.sectionTitle}>
            Hồ sơ chứng nhận và ngày hết hạn
          </h2>
          <span className={styles.countMeta}>
            {certifications.length} chứng nhận
          </span>
        </div>

        {certifications.length === 0 ? (
          <div className={styles.emptyCertBox}>
            <VerifiedUserOutlined
              className={styles.emptyCertIcon}
              aria-hidden="true"
            />
            <p className={styles.emptySectionText}>
              Cơ sở chưa có chứng nhận được khai báo. Nhấn &ldquo;Chỉnh sửa&rdquo; để bổ
              sung hồ sơ chứng nhận và ngày hết hạn.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.subTableWrap}>
              <table className={styles.subTable}>
                <thead>
                  <tr>
                    <th scope="col">Loại chứng nhận</th>
                    <th scope="col">Số giấy chứng nhận</th>
                    <th scope="col">Tổ chức cấp</th>
                    <th scope="col">Ngày cấp</th>
                    <th scope="col">Ngày hết hạn</th>
                    <th scope="col">Hiệu lực</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map(cert => {
                    const health = getCertificationHealth(cert)
                    return (
                      <tr key={cert.id || cert.certificateNumber}>
                        <td>
                          <div className={styles.certNameCell}>
                            <strong>{cert.name}</strong>
                            {cert.note && (
                              <span className={styles.certNote}>{cert.note}</span>
                            )}
                          </div>
                        </td>
                        <td className={styles.tabularText}>
                          {cert.certificateNumber || "—"}
                        </td>
                        <td>{cert.issuer || "Chưa cập nhật"}</td>
                        <td className={styles.tabularText}>
                          {formatDateVi(cert.issuedDate)}
                        </td>
                        <td className={styles.tabularText}>
                          {formatDateVi(cert.expiryDate)}
                        </td>
                        <td>
                          <div className={styles.certStatusStack}>
                            <span
                              className={`${styles.certStatusBadge} ${getCertStatusClass(
                                health.status,
                              )}`}
                            >
                              {health.label}
                            </span>
                            <span className={styles.certDaysHint}>
                              {health.detailText}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.subCardList}>
              {certifications.map(cert => {
                const health = getCertificationHealth(cert)
                return (
                  <div
                    key={cert.id || cert.certificateNumber}
                    className={styles.subCardItem}
                  >
                    <div className={styles.subCardTop}>
                      <strong>{cert.name}</strong>
                      <span
                        className={`${styles.certStatusBadge} ${getCertStatusClass(
                          health.status,
                        )}`}
                      >
                        {health.label}
                      </span>
                    </div>
                    <p className={`${styles.subCardMeta} ${styles.tabularText}`}>
                      Số CN: {cert.certificateNumber || "—"} · Hết hạn:{" "}
                      {formatDateVi(cert.expiryDate)} ({health.detailText})
                    </p>
                    {cert.issuer && (
                      <p className={styles.subCardMeta}>
                        Tổ chức cấp: {cert.issuer}
                      </p>
                    )}
                    {cert.note && (
                      <p className={styles.subCardMeta}>{cert.note}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

FacilityDetailView.propTypes = {
  facility: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object,
  demoNotice: PropTypes.string,
  onRetry: PropTypes.func,
  onEdit: PropTypes.func,
}

export default FacilityDetailView
