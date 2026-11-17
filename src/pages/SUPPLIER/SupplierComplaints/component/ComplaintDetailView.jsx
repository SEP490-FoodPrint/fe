import React, { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  InfoOutlined,
  KeyboardArrowLeft,
  ReplayOutlined,
  SendOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  COMPLAINT_STATUS,
  countResponseCodePoints,
  formatComplaintCode,
  formatDateTimeVi,
  formatSchoolCode,
  MAX_RESPONSE_LENGTH,
} from "src/services/SupplierComplaintService"
import ComplaintStatusBadge from "./ComplaintStatusBadge"
import styles from "./ComplaintDetailView.module.scss"

function ComplaintDetailView({
  complaint,
  loading = false,
  error = null,
  canRespond = false,
  responseText = "",
  fieldError = "",
  submitError = "",
  submitting = false,
  conflictReloaded = false,
  onRetryDetail,
  onResponseChange,
  onSubmitResponse,
}) {
  const responseInputRef = useRef(null)

  useEffect(() => {
    if (fieldError && responseInputRef.current) {
      responseInputRef.current.focus()
    }
  }, [fieldError])

  if (loading && !complaint) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_COMPLAINTS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách khiếu nại"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết khiếu nại</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>Đang tải thông tin khiếu nại...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    const isNotFound =
      error?.status === 404 || error?.status === 400 || !error
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_COMPLAINTS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách khiếu nại"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết khiếu nại</h1>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {error?.status === 403
                ? "Bạn không có quyền xem khiếu nại này"
                : isNotFound
                  ? "Không tìm thấy khiếu nại trong phạm vi được phép"
                  : "Không thể tải chi tiết khiếu nại"}
            </p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Khiếu nại không tồn tại hoặc không thuộc chuyến giao hàng của nhà cung cấp hiện tại."}
            </p>
            {error && !isNotFound && error?.status !== 403 && onRetryDetail ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.stateActionBtn}
                onClick={onRetryDetail}
              >
                Thử lại
              </Button>
            ) : (
              <Button
                component={Link}
                to={ROUTER.SUPPLIER_COMPLAINTS}
                variant="outlined"
                color="primary"
                className={styles.stateActionBtn}
              >
                Quay lại danh sách
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const isResponded = complaint.status === COMPLAINT_STATUS.RESPONDED
  const hasComplaintCode = Boolean(
    typeof complaint.complaintCode === "string" &&
      complaint.complaintCode.trim(),
  )
  const complaintCodeText = formatComplaintCode(complaint.complaintCode)
  const codePointCount = countResponseCodePoints(responseText)
  const isOverLimit = codePointCount > MAX_RESPONSE_LENGTH
  const hasInputError = Boolean(fieldError) || isOverLimit

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderBar}>
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SUPPLIER_COMPLAINTS}
            className={styles.backBtn}
            aria-label="Quay lại danh sách khiếu nại"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
          </Link>
          <h1 className={styles.pageTitle}>Chi tiết khiếu nại</h1>
        </div>
      </div>

      <section
        className={styles.detailCard}
        aria-labelledby="complaint-overview-heading"
      >
        <div className={styles.overviewHeader}>
          <div className={styles.overviewTopRow}>
            <div className={styles.overviewCodeRow}>
              <span className={styles.metaLabelInline}>Mã khiếu nại</span>
              <span
                className={
                  hasComplaintCode
                    ? styles.complaintCodeChip
                    : styles.complaintCodeMuted
                }
              >
                {complaintCodeText}
              </span>
            </div>
            <ComplaintStatusBadge status={complaint.status} />
          </div>
          <h2 id="complaint-overview-heading" className={styles.complaintTitle}>
            {complaint.title}
          </h2>
        </div>

        <dl className={styles.infoRowsGrid}>
          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Trường gửi</dt>
            <dd className={styles.metaValue}>
              {complaint.school?.name || "Chưa cập nhật"}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Mã trường</dt>
            <dd className={styles.metaValue}>
              {formatSchoolCode(complaint.school?.code)}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Chuyến giao hàng</dt>
            <dd className={styles.metaValue}>
              {complaint.delivery?.deliveryNo || "Chưa cập nhật"}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Lô nguyên liệu</dt>
            <dd className={styles.metaValue}>
              {complaint.ingredientLot?.lotCode || (
                <span className={styles.mutedText}>Không chỉ định lô</span>
              )}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Người gửi</dt>
            <dd className={styles.metaValue}>
              {complaint.submittedBy?.fullName || "Chưa cập nhật"}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Thời điểm gửi</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(complaint.createdAt)}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Cập nhật lúc</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(complaint.updatedAt)}
            </dd>
          </div>

          {complaint.respondedAt ? (
            <div className={styles.inlineRow}>
              <dt className={styles.metaLabel}>Phản hồi lúc</dt>
              <dd className={styles.metaValue}>
                {formatDateTimeVi(complaint.respondedAt)}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className={styles.descriptionSection}>
          <h3 className={styles.blockLabel}>Nội dung khiếu nại</h3>
          <p className={styles.bodyText}>
            {complaint.description || "Không có mô tả chi tiết."}
          </p>
        </div>
      </section>

      <section
        className={styles.detailCard}
        aria-labelledby="supplier-response-section-title"
      >
        <div className={styles.cardHeader}>
          <h2
            id="supplier-response-section-title"
            className={styles.sectionTitle}
          >
            Phản hồi của nhà cung cấp
          </h2>
          <span className={styles.cardHeaderAside}>
            {isResponded
              ? `Đã phản hồi · ${formatDateTimeVi(complaint.respondedAt)}`
              : "Chờ phản hồi"}
          </span>
        </div>

        {isResponded ? (
          <>
            {conflictReloaded ? (
              <div className={styles.conflictNotice} role="status">
                <InfoOutlined
                  className={styles.noticeIcon}
                  aria-hidden="true"
                />
                <span>
                  Khiếu nại này đã được phản hồi trước đó. Hệ thống đã cập nhật
                  nội dung phản hồi chính thức bên dưới.
                </span>
              </div>
            ) : null}

            <dl className={styles.infoRowsGrid}>
              <div className={styles.inlineRow}>
                <dt className={styles.metaLabel}>Người phản hồi</dt>
                <dd className={styles.metaValue}>
                  {complaint.respondedBy?.fullName || "Chưa cập nhật"}
                </dd>
              </div>
              <div className={styles.inlineRow}>
                <dt className={styles.metaLabel}>Thời điểm phản hồi</dt>
                <dd className={styles.metaValue}>
                  {formatDateTimeVi(complaint.respondedAt)}
                </dd>
              </div>
            </dl>

            <div className={styles.responseReadonlySection}>
              <h3 className={styles.blockLabel}>Nội dung phản hồi chính thức</h3>
              <div className={styles.responseReadonlyBox}>
                <p className={styles.bodyText}>{complaint.supplierResponse}</p>
              </div>
              <p className={styles.readonlyHint}>
                Phản hồi đã được ghi nhận chính thức và chia sẻ với nhà trường.
              </p>
            </div>
          </>
        ) : !canRespond ? (
          <div className={styles.permissionNoticeWrap}>
            <div className={styles.infoNotice} role="status">
              <InfoOutlined className={styles.noticeIcon} aria-hidden="true" />
              <span>
                Tài khoản hiện tại chỉ có quyền xem chi tiết khiếu nại và chưa
                được cấp quyền gửi phản hồi chính thức cho nhà trường.
              </span>
            </div>
          </div>
        ) : (
          <form
            className={styles.responseForm}
            onSubmit={onSubmitResponse}
            noValidate
          >
            {submitError ? (
              <div className={styles.submitErrorBanner} role="alert">
                <span>{submitError}</span>
                {onRetryDetail ? (
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className={styles.checkStatusBtn}
                    onClick={onRetryDetail}
                  >
                    Kiểm tra lại trạng thái
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div className={styles.fieldGroup}>
              <label
                htmlFor="supplier-complaint-response-input"
                className={styles.formLabel}
              >
                Nội dung phản hồi chính thức
              </label>
              <p
                id="supplier-complaint-response-help"
                className={styles.formHelper}
              >
                Nhập từ 1 đến 5.000 ký tự. Sau khi gửi thành công, phản hồi không
                thể chỉnh sửa hoặc xóa.
              </p>
              <textarea
                id="supplier-complaint-response-input"
                ref={responseInputRef}
                className={`${styles.responseTextarea} ${
                  hasInputError ? styles.textareaError : ""
                }`}
                rows={5}
                value={responseText}
                disabled={submitting}
                aria-invalid={hasInputError ? "true" : "false"}
                aria-describedby="supplier-complaint-response-help supplier-complaint-response-feedback"
                placeholder="Nhập kết quả kiểm tra và phương án xử lý của nhà cung cấp gửi tới nhà trường..."
                onChange={event => onResponseChange(event.target.value)}
              />
              <div
                id="supplier-complaint-response-feedback"
                className={styles.textareaFooter}
              >
                <span className={styles.fieldErrorText} role="alert">
                  {fieldError ||
                    (isOverLimit
                      ? "Nội dung đã vượt quá giới hạn 5.000 ký tự."
                      : "")}
                </span>
                <span
                  className={`${styles.charCounter} ${
                    isOverLimit ? styles.charCounterOver : ""
                  }`}
                >
                  {codePointCount.toLocaleString("vi-VN")} / 5.000 ký tự
                </span>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={styles.submitBtn}
                disabled={submitting}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SendOutlined className={styles.btnIcon} />
                  )
                }
              >
                {submitting ? "Đang gửi phản hồi..." : "Gửi phản hồi"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

ComplaintDetailView.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.string.isRequired,
    complaintCode: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    respondedAt: PropTypes.string,
    supplierResponse: PropTypes.string,
    school: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      code: PropTypes.string,
    }),
    delivery: PropTypes.shape({
      id: PropTypes.string,
      deliveryNo: PropTypes.string,
    }),
    ingredientLot: PropTypes.shape({
      id: PropTypes.string,
      lotCode: PropTypes.string,
    }),
    submittedBy: PropTypes.shape({
      id: PropTypes.string,
      fullName: PropTypes.string,
    }),
    respondedBy: PropTypes.shape({
      id: PropTypes.string,
      fullName: PropTypes.string,
    }),
  }),
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  canRespond: PropTypes.bool,
  responseText: PropTypes.string,
  fieldError: PropTypes.string,
  submitError: PropTypes.string,
  submitting: PropTypes.bool,
  conflictReloaded: PropTypes.bool,
  onRetryDetail: PropTypes.func,
  onResponseChange: PropTypes.func,
  onSubmitResponse: PropTypes.func,
}

export default ComplaintDetailView
