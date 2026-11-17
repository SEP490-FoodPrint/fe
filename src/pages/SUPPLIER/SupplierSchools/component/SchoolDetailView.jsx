import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  CheckCircleOutlineOutlined,
  DescriptionOutlined,
  HighlightOffOutlined,
  KeyboardArrowLeft,
  OpenInNewOutlined,
  PauseCircleOutlineOutlined,
  ReplayOutlined,
  SchoolOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatDateTimeVi,
  formatSchoolCode,
  getRelationshipStatusMeta,
  RELATIONSHIP_STATUS,
  sanitizeExternalUrl,
  sanitizeImageUrl,
} from "src/services/SupplierSchoolService"
import ContractInfoBlock from "./ContractInfoBlock"
import SchoolStatusBadge from "./SchoolStatusBadge"
import styles from "./SchoolDetailView.module.scss"

const SKELETON_CONTRACTS = [0, 1]

function renderRelationshipStatusIcon(status) {
  if (status === RELATIONSHIP_STATUS.ACTIVE) {
    return <CheckCircleOutlineOutlined className={styles.relIcon} />
  }
  if (status === RELATIONSHIP_STATUS.SUSPENDED) {
    return <PauseCircleOutlineOutlined className={styles.relIcon} />
  }
  return <HighlightOffOutlined className={styles.relIcon} />
}

function SchoolDetailView({
  school,
  loading = false,
  error = null,
  contracts = [],
  contractPagination,
  loadingContracts = false,
  contractsError = null,
  downloadingDocId = null,
  docErrors = {},
  onRetryDetail,
  onRetryContracts,
  onContractPageChange,
  onPreviewDocument,
  onDownloadDocument,
}) {
  const [logoFailed, setLogoFailed] = useState(false)
  const [coverFailed, setCoverFailed] = useState(false)

  useEffect(() => {
    setLogoFailed(false)
    setCoverFailed(false)
  }, [school?.id, school?.logoUrl, school?.coverImageUrl])

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_SCHOOLS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách trường đã liên kết"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết trường học</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>Đang tải thông tin trường học...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !school) {
    const isNotFound = error?.status === 404 || error?.status === 400 || !error
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_SCHOOLS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách trường đã liên kết"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết trường học</h1>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {error?.status === 403
                ? "Bạn không có quyền xem thông tin trường học này"
                : isNotFound
                  ? "Không tìm thấy trường học trong phạm vi được phép"
                  : "Không thể tải chi tiết trường học"}
            </p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Trường học không tồn tại hoặc chưa có quan hệ liên kết."}
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
                to={ROUTER.SUPPLIER_SCHOOLS}
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

  const relationship = school.relationship || {}
  const relationshipMeta = getRelationshipStatusMeta(relationship.status)
  const relToneClass =
    relationship.status === RELATIONSHIP_STATUS.ACTIVE
      ? styles.relStatusSuccess
      : relationship.status === RELATIONSHIP_STATUS.SUSPENDED
        ? styles.relStatusWarning
        : styles.relStatusMuted

  const showSuspensionInfo =
    relationship.status === RELATIONSHIP_STATUS.SUSPENDED ||
    Boolean(relationship.suspendedAt) ||
    Boolean(relationship.suspensionReason)
  const showUnlinkInfo =
    relationship.status === RELATIONSHIP_STATUS.UNLINKED ||
    Boolean(relationship.unlinkedAt) ||
    Boolean(relationship.unlinkReason)

  const safeWebsiteUrl = sanitizeExternalUrl(school.websiteUrl)
  const safeLogoUrl = sanitizeImageUrl(school.logoUrl)
  const safeCoverUrl = sanitizeImageUrl(school.coverImageUrl)
  const currentContractPage = contractPagination?.page || 1
  const contractCountLabel =
    currentContractPage === 1 && !contractPagination?.hasNext
      ? `${contracts.length} hợp đồng`
      : `Trang ${currentContractPage} · ${contracts.length} hợp đồng`

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderBar}>
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SUPPLIER_SCHOOLS}
            className={styles.backBtn}
            aria-label="Quay lại danh sách trường đã liên kết"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
          </Link>
          <h1 className={styles.pageTitle}>Chi tiết trường học</h1>
        </div>
      </div>

      <section
        className={styles.detailCard}
        aria-labelledby="school-overview-heading"
      >
        {safeCoverUrl && !coverFailed ? (
          <div className={styles.coverBannerWrap}>
            <img
              src={safeCoverUrl}
              alt={`Ảnh trường ${school.name}`}
              className={styles.coverBannerImg}
              onError={() => setCoverFailed(true)}
            />
          </div>
        ) : null}

        <div className={styles.schoolOverviewRow}>
          <div className={styles.schoolIconTile} aria-hidden="true">
            {safeLogoUrl && !logoFailed ? (
              <img
                src={safeLogoUrl}
                alt=""
                className={styles.schoolLogoImg}
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <SchoolOutlined className={styles.schoolIconSvg} />
            )}
          </div>

          <div className={styles.schoolOverviewContent}>
            <h2 id="school-overview-heading" className={styles.schoolNameHeading}>
              {school.name}
            </h2>
            <div className={styles.overviewInlineCode}>
              <span>Mã trường:</span>
              <span className={styles.overviewCodeValue}>
                {formatSchoolCode(school.code, "Chưa có mã trường")}
              </span>
            </div>
            <div className={`${styles.relStatusLine} ${relToneClass}`}>
              {renderRelationshipStatusIcon(relationship.status)}
              <span>{relationshipMeta.label}</span>
            </div>
          </div>
        </div>

        <dl className={styles.infoRowsGrid}>
          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Số điện thoại</dt>
            <dd className={styles.metaValue}>
              {school.phone || "Chưa cập nhật"}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Email</dt>
            <dd className={styles.metaValue}>
              {school.email || "Chưa cập nhật"}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Quy mô bán trú</dt>
            <dd className={styles.metaValue}>
              {school.boardingScale || "Chưa cập nhật"}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Liên kết từ</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(relationship.linkedAt)}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Trang web</dt>
            <dd className={styles.metaValue}>
              {safeWebsiteUrl ? (
                <a
                  href={safeWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  <span>{safeWebsiteUrl}</span>
                  <OpenInNewOutlined
                    className={styles.externalIcon}
                    aria-hidden="true"
                  />
                </a>
              ) : (
                "Chưa cập nhật"
              )}
            </dd>
          </div>

          <div className={styles.inlineRow}>
            <dt className={styles.metaLabel}>Địa chỉ</dt>
            <dd className={styles.metaValue}>
              {school.address || "Chưa cập nhật"}
            </dd>
          </div>

          {school.description ? (
            <div className={`${styles.inlineRow} ${styles.fullSpanRow}`}>
              <dt className={styles.metaLabel}>Giới thiệu</dt>
              <dd className={styles.metaValue}>{school.description}</dd>
            </div>
          ) : null}

          {showSuspensionInfo ? (
            <>
              <div className={styles.inlineRow}>
                <dt className={styles.metaLabel}>Tạm ngưng lúc</dt>
                <dd className={styles.metaValue}>
                  {formatDateTimeVi(relationship.suspendedAt)}
                </dd>
              </div>
              <div className={styles.inlineRow}>
                <dt className={styles.metaLabel}>Lý do tạm ngưng</dt>
                <dd className={styles.metaValue}>
                  {relationship.suspensionReason || "Không ghi nhận lý do"}
                </dd>
              </div>
            </>
          ) : null}

          {showUnlinkInfo ? (
            <>
              <div className={styles.inlineRow}>
                <dt className={styles.metaLabel}>Hủy liên kết lúc</dt>
                <dd className={styles.metaValue}>
                  {formatDateTimeVi(relationship.unlinkedAt)}
                </dd>
              </div>
              <div className={styles.inlineRow}>
                <dt className={styles.metaLabel}>Lý do hủy liên kết</dt>
                <dd className={styles.metaValue}>
                  {relationship.unlinkReason || "Không ghi nhận lý do"}
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>

      <section
        className={styles.detailCard}
        aria-labelledby="school-contracts-section-title"
      >
        <div className={styles.cardHeader}>
          <h2
            id="school-contracts-section-title"
            className={styles.sectionTitle}
          >
            Hợp đồng cung cấp
          </h2>
          {!loadingContracts && !contractsError ? (
            <span className={styles.contractCountText}>
              {contractCountLabel}
            </span>
          ) : null}
        </div>

        {loadingContracts && contracts.length === 0 ? (
          <div
            className={styles.contractSkeletonList}
            role="status"
            aria-live="polite"
            aria-label="Đang tải danh sách hợp đồng"
          >
            {SKELETON_CONTRACTS.map(key => (
              <div key={key} className={styles.contractSkeletonRow}>
                <div className={styles.skeletonBarLg} />
                <div className={styles.skeletonBarMd} />
                <div className={styles.skeletonBarSm} />
              </div>
            ))}
          </div>
        ) : contractsError ? (
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              Không thể tải danh sách hợp đồng
            </p>
            <p className={styles.stateDesc}>{contractsError.message}</p>
            {contractsError.status !== 404 &&
            contractsError.status !== 403 ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.stateActionBtn}
                onClick={onRetryContracts}
              >
                Thử lại
              </Button>
            ) : null}
          </div>
        ) : contracts.length === 0 ? (
          <div className={styles.stateBox}>
            <div className={styles.emptyContractIcon} aria-hidden="true">
              <DescriptionOutlined />
            </div>
            <p className={styles.stateTitle}>Chưa có hợp đồng được chia sẻ</p>
          </div>
        ) : (
          <>
            <div className={styles.contractList}>
              {contracts.map(contract => (
                <article key={contract.id} className={styles.contractItem}>
                  <div className={styles.contractHeader}>
                    <h3 className={styles.contractTitle}>
                      {contract.number || "Chưa có số hợp đồng"}
                    </h3>
                    <SchoolStatusBadge
                      kind="contract"
                      status={contract.status}
                    />
                  </div>

                  <ContractInfoBlock
                    contract={contract}
                    downloadingDocId={downloadingDocId}
                    docErrors={docErrors}
                    onPreviewDocument={onPreviewDocument}
                    onDownloadDocument={onDownloadDocument}
                  />
                </article>
              ))}
            </div>

            {currentContractPage > 1 || contractPagination?.hasNext ? (
              <div className={styles.paginationFooter}>
                <span className={styles.paginationInfo}>
                  Trang {currentContractPage} · {contracts.length} hợp đồng
                </span>
                <div className={styles.paginationActions}>
                  <Button
                    type="button"
                    variant="outlined"
                    className={styles.pageBtn}
                    disabled={currentContractPage <= 1 || loadingContracts}
                    onClick={() =>
                      onContractPageChange?.(currentContractPage - 1)
                    }
                  >
                    Trước
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    className={styles.pageBtn}
                    disabled={!contractPagination?.hasNext || loadingContracts}
                    onClick={() =>
                      onContractPageChange?.(currentContractPage + 1)
                    }
                  >
                    Sau
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}

SchoolDetailView.propTypes = {
  school: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    code: PropTypes.string,
    address: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    description: PropTypes.string,
    websiteUrl: PropTypes.string,
    logoUrl: PropTypes.string,
    coverImageUrl: PropTypes.string,
    boardingScale: PropTypes.string,
    relationship: PropTypes.shape({
      status: PropTypes.string,
      linkedAt: PropTypes.string,
      suspendedAt: PropTypes.string,
      unlinkedAt: PropTypes.string,
      suspensionReason: PropTypes.string,
      unlinkReason: PropTypes.string,
    }),
  }),
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  contracts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      number: PropTypes.string,
      status: PropTypes.string,
    }),
  ),
  contractPagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }),
  loadingContracts: PropTypes.bool,
  contractsError: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  downloadingDocId: PropTypes.string,
  docErrors: PropTypes.objectOf(PropTypes.string),
  onRetryDetail: PropTypes.func,
  onRetryContracts: PropTypes.func,
  onContractPageChange: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onDownloadDocument: PropTypes.func,
}

export default SchoolDetailView
