import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  EditOutlined,
  KeyboardArrowLeft,
  PauseCircleOutlined,
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
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
              className={styles.backBtn}
              aria-label="Quay lại danh sách cơ sở nguồn cung"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết cơ sở nguồn cung</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
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
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
              className={styles.backBtn}
              aria-label="Quay lại danh sách cơ sở nguồn cung"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết cơ sở nguồn cung</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
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
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
            className={styles.backBtn}
            aria-label="Quay lại danh sách cơ sở nguồn cung"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
          </Link>
          <h1 className={styles.pageTitle}>Chi tiết cơ sở nguồn cung</h1>
        </div>

        <div className={styles.headerActions}>
          {isActive && (
            <Button
              type="button"
              variant="outlined"
              color="warning"
              startIcon={<PauseCircleOutlined className={styles.btnIcon} />}
              onClick={() => onDeactivate?.(facility)}
              className={styles.deactivateBtn}
            >
              Dừng hoạt động
            </Button>
          )}
          <Button
            type="button"
            variant="contained"
            color="primary"
            startIcon={<EditOutlined className={styles.btnIcon} />}
            onClick={() => onEdit?.(facility)}
            className={styles.editBtn}
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <article className={styles.detailCard}>
        <div className={styles.detailCardHeader}>
          <h2 className={styles.detailSectionTitle}>
            Thông tin cơ sở nguồn cung
          </h2>
          <div className={styles.detailStatusMeta}>
            <span className={styles.detailStatusLabel}>Trạng thái:</span>
            <span
              className={`${styles.statusBadge} ${
                isActive ? styles.statusActive : styles.statusInactive
              }`}
            >
              {getFacilityStatusLabel(facility.status)}
            </span>
          </div>
        </div>

        <div className={styles.detailBody}>
          <h2 className={styles.detailMobileHeading}>
            Thông tin cơ sở nguồn cung
          </h2>

          <div className={styles.detailMobileStatusRow}>
            <span className={styles.detailStatusLabel}>Trạng thái:</span>
            <span
              className={`${styles.statusBadge} ${
                isActive ? styles.statusActive : styles.statusInactive
              }`}
            >
              {getFacilityStatusLabel(facility.status)}
            </span>
          </div>

          <div className={styles.detailFieldsCol}>
            <div className={styles.detailFieldBlock}>
              <p className={styles.detailFieldLabel}>Tên cơ sở nguồn cung</p>
              <p className={styles.detailFieldValueLarge}>{facility.name}</p>
            </div>

            <div className={styles.detailFieldPair}>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Mã cơ sở</p>
                <p className={styles.detailFieldValue}>
                  {facility.facilityCode || "Chưa cấp mã"}
                </p>
              </div>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Địa chỉ</p>
                <p className={styles.detailFieldValue}>
                  {facility.address || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <div className={styles.detailFieldPair}>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Ngày tạo</p>
                <p className={styles.detailFieldValue}>
                  {formatDateTimeVi(facility.createdAt)}
                </p>
              </div>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Cập nhật lần cuối</p>
                <p className={styles.detailFieldValue}>
                  {formatDateTimeVi(facility.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section
          className={styles.detailContactSection}
          aria-labelledby="facility-contact-heading"
        >
          <h3
            id="facility-contact-heading"
            className={styles.detailContactTitle}
          >
            Thông tin liên hệ
          </h3>

          <div className={styles.detailContactGrid}>
            <div className={styles.detailFieldBlock}>
              <p className={styles.detailFieldLabel}>Người liên hệ</p>
              <p className={styles.detailFieldValue}>
                {facility.contactName || "Chưa cập nhật"}
              </p>
            </div>
            <div className={styles.detailFieldBlock}>
              <p className={styles.detailFieldLabel}>Số điện thoại</p>
              <p className={styles.detailFieldValue}>
                {facility.contactPhone || "Chưa cập nhật"}
              </p>
            </div>
            <div className={styles.detailFieldBlock}>
              <p className={styles.detailFieldLabel}>Email liên hệ</p>
              <p className={styles.detailFieldValue}>
                {facility.contactEmail || "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </section>
      </article>
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
