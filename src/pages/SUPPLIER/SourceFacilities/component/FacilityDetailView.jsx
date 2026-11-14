import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  EditOutlined,
  EmailOutlined,
  KeyboardArrowLeft,
  LocationOnOutlined,
  PauseCircleOutlined,
  PersonOutlined,
  PhoneOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatDateTimeVi,
  getFacilityStatusLabel,
} from "src/services/SourceFacilityService"
import styles from "./FacilityDetailView.module.scss"

function FacilityDetailView({
  facility,
  loading = false,
  error = null,
  onRetry,
  onEdit,
  onDeactivate,
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
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>
              Đang tải thông tin cơ sở nguồn cung...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !facility) {
    const status = error?.status
    const errorTitle =
      status === 403
        ? "Không có quyền truy cập"
        : status === 404 || status === 400
          ? "Không tìm thấy cơ sở nguồn cung"
          : "Không thể tải thông tin cơ sở nguồn cung"

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
            <p className={styles.stateTitle}>{errorTitle}</p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Cơ sở bạn đang tìm không tồn tại hoặc đã bị xóa."}
            </p>
            <div className={styles.stateActions}>
              {onRetry && status !== 404 && status !== 403 && status !== 400 && (
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

  const isActive = facility.status === "ACTIVE"

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
              <span className={styles.codeBadge}>
                {facility.facilityCode || "Chưa cấp mã"}
              </span>
              <span
                className={`${styles.statusBadge} ${
                  isActive ? styles.statusActive : styles.statusInactive
                }`}
              >
                {getFacilityStatusLabel(facility.status)}
              </span>
            </div>
            <h1 className={styles.detailTitle}>{facility.name}</h1>
          </div>
        </div>

        <div className={styles.headerActions}>
          {isActive && (
            <Button
              type="button"
              variant="outlined"
              color="warning"
              startIcon={<PauseCircleOutlined />}
              onClick={() => onDeactivate?.(facility)}
            >
              Dừng hoạt động
            </Button>
          )}
          <Button
            type="button"
            variant="contained"
            color="primary"
            startIcon={<EditOutlined />}
            onClick={() => onEdit?.(facility)}
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.surfaceCard} aria-labelledby="facility-info-heading">
          <h2 id="facility-info-heading" className={styles.sectionTitle}>
            Thông tin cơ sở
          </h2>

          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt>Mã cơ sở</dt>
              <dd>{facility.facilityCode || "Chưa cấp mã"}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Tên cơ sở</dt>
              <dd>{facility.name}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Trạng thái</dt>
              <dd>{getFacilityStatusLabel(facility.status)}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Địa chỉ</dt>
              <dd className={styles.addressValue}>
                <LocationOnOutlined className={styles.inlineIcon} />
                <span>{facility.address || "Chưa cập nhật"}</span>
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Ngày tạo</dt>
              <dd className={styles.numericValue}>
                {formatDateTimeVi(facility.createdAt)}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Cập nhật lần cuối</dt>
              <dd className={styles.numericValue}>
                {formatDateTimeVi(facility.updatedAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.surfaceCard} aria-labelledby="facility-contact-heading">
          <h2 id="facility-contact-heading" className={styles.sectionTitle}>
            Thông tin liên hệ
          </h2>

          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt>Người liên hệ</dt>
              <dd className={styles.iconValue}>
                <PersonOutlined className={styles.inlineIcon} />
                <span>{facility.contactName || "Chưa cập nhật"}</span>
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Số điện thoại</dt>
              <dd className={styles.iconValue}>
                <PhoneOutlined className={styles.inlineIcon} />
                <span>{facility.contactPhone || "Chưa cập nhật"}</span>
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Email liên hệ</dt>
              <dd className={styles.iconValue}>
                <EmailOutlined className={styles.inlineIcon} />
                <span>{facility.contactEmail || "Chưa cập nhật"}</span>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}

FacilityDetailView.propTypes = {
  facility: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  onRetry: PropTypes.func,
  onEdit: PropTypes.func,
  onDeactivate: PropTypes.func,
}

export default FacilityDetailView
