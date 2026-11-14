import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, IconButton, Tooltip } from "@mui/material"
import {
  Add,
  EditOutlined,
  LocationOnOutlined,
  PersonOutlined,
  VerifiedUserOutlined,
  VisibilityOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  getCooperationStatusLabel,
  getFacilityAttention,
  getFacilityTypeLabel,
} from "src/services/SourceFacilityService"
import styles from "./FacilityListView.module.scss"

function FacilityListView({
  facilities,
  totalCount,
  hasActiveFilters,
  onResetFilters,
  onCreate,
  onEdit,
}) {
  if (facilities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không tìm thấy cơ sở nguồn cung phù hợp"
            : "Chưa có cơ sở nguồn cung nào"}
        </p>
        <p className={styles.emptyDesc}>
          {hasActiveFilters
            ? "Hãy thử thay đổi từ khóa tìm kiếm, loại cơ sở hoặc trạng thái hợp tác."
            : "Nhấn \"Thêm cơ sở\" để khai báo vùng trồng, trang trại, xưởng sơ chế hoặc kho bảo quản."}
        </p>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onResetFilters}
          >
            Xóa bộ lọc
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onCreate}
          >
            Thêm cơ sở
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.facilityTable}>
          <thead>
            <tr>
              <th scope="col" className={styles.colCode}>
                Mã cơ sở
              </th>
              <th scope="col" className={styles.colName}>
                Tên cơ sở
              </th>
              <th scope="col" className={styles.colType}>
                Loại cơ sở
              </th>
              <th scope="col" className={styles.colAddress}>
                Địa chỉ
              </th>
              <th scope="col" className={styles.colContact}>
                Người liên hệ
              </th>
              <th scope="col" className={styles.colCert}>
                Chứng nhận
              </th>
              <th scope="col" className={styles.colStatus}>
                Trạng thái hợp tác
              </th>
              <th scope="col" className={styles.colActions}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {facilities.map(facility => {
              const detailUrl = `${ROUTER.SUPPLIER_SOURCE_FACILITIES}/${encodeURIComponent(
                facility.id,
              )}`
              const attention = getFacilityAttention(facility)
              const isActive = facility.cooperationStatus !== "PAUSED"
              const certs = Array.isArray(facility.certifications)
                ? facility.certifications
                : []

              return (
                <tr key={facility.id} className={styles.tableRow}>
                  <td className={styles.colCode}>
                    <span className={styles.codeBadge}>{facility.code}</span>
                  </td>

                  <td className={styles.colName}>
                    <div className={styles.nameStack}>
                      <Link to={detailUrl} className={styles.nameLink}>
                        {facility.name}
                      </Link>
                      {attention.needsAttention && (
                        <span
                          className={`${styles.attentionInline} ${
                            attention.severity === "error"
                              ? styles.attentionError
                              : styles.attentionWarning
                          }`}
                        >
                          <WarningAmberOutlined className={styles.inlineIcon} />
                          <span>{attention.primaryWarning}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className={styles.colType}>
                    <span className={styles.typeChip}>
                      {getFacilityTypeLabel(facility.facilityType)}
                    </span>
                  </td>

                  <td className={styles.colAddress}>
                    <span className={styles.addressText}>{facility.address}</span>
                  </td>

                  <td className={styles.colContact}>
                    <div className={styles.contactStack}>
                      <span className={styles.contactName}>
                        {facility.contactName}
                      </span>
                      <span className={styles.contactPhone}>
                        {facility.contactPhone}
                      </span>
                    </div>
                  </td>

                  <td className={styles.colCert}>
                    {certs.length > 0 ? (
                      <div className={styles.certBadges}>
                        {certs.slice(0, 2).map(cert => (
                          <span key={cert.id} className={styles.certPill}>
                            {cert.name}
                          </span>
                        ))}
                        {certs.length > 2 && (
                          <span className={styles.certMore}>
                            +{certs.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={styles.certEmpty}>Chưa có chứng nhận</span>
                    )}
                  </td>

                  <td className={styles.colStatus}>
                    <span
                      className={`${styles.statusBadge} ${
                        isActive ? styles.statusActive : styles.statusPaused
                      }`}
                    >
                      {getCooperationStatusLabel(facility.cooperationStatus)}
                    </span>
                  </td>

                  <td className={styles.colActions}>
                    <div className={styles.actionGroup}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          component={Link}
                          to={detailUrl}
                          size="small"
                          aria-label={`Xem chi tiết ${facility.name}`}
                          className={styles.actionIconBtn}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa cơ sở">
                        <IconButton
                          type="button"
                          size="small"
                          aria-label={`Chỉnh sửa ${facility.name}`}
                          onClick={() => onEdit?.(facility)}
                          className={styles.actionIconBtn}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Compact Card List for Tablet & Mobile */}
      <div className={styles.compactList}>
        {facilities.map(facility => {
          const detailUrl = `${ROUTER.SUPPLIER_SOURCE_FACILITIES}/${encodeURIComponent(
            facility.id,
          )}`
          const attention = getFacilityAttention(facility)
          const isActive = facility.cooperationStatus !== "PAUSED"
          const certs = Array.isArray(facility.certifications)
            ? facility.certifications
            : []

          return (
            <article key={facility.id} className={styles.compactCard}>
              <div className={styles.compactHeader}>
                <div className={styles.compactTitleBlock}>
                  <div className={styles.compactCodeRow}>
                    <span className={styles.codeBadge}>{facility.code}</span>
                    <span className={styles.typeChip}>
                      {getFacilityTypeLabel(facility.facilityType)}
                    </span>
                  </div>
                  <Link to={detailUrl} className={styles.compactTitleLink}>
                    {facility.name}
                  </Link>
                </div>

                <span
                  className={`${styles.statusBadge} ${
                    isActive ? styles.statusActive : styles.statusPaused
                  }`}
                >
                  {getCooperationStatusLabel(facility.cooperationStatus)}
                </span>
              </div>

              <div className={styles.compactMetaList}>
                <p className={styles.compactMetaRow}>
                  <LocationOnOutlined
                    className={styles.compactMetaIcon}
                    aria-hidden="true"
                  />
                  <span>{facility.address}</span>
                </p>
                <p className={styles.compactMetaRow}>
                  <PersonOutlined
                    className={styles.compactMetaIcon}
                    aria-hidden="true"
                  />
                  <span>
                    {facility.contactName} ·{" "}
                    <span className={styles.tabularText}>
                      {facility.contactPhone}
                    </span>
                  </span>
                </p>
                <div className={styles.compactMetaRow}>
                  <VerifiedUserOutlined
                    className={styles.compactMetaIcon}
                    aria-hidden="true"
                  />
                  {certs.length > 0 ? (
                    <div className={styles.certBadges}>
                      {certs.map(cert => (
                        <span key={cert.id} className={styles.certPill}>
                          {cert.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.certEmpty}>Chưa có chứng nhận</span>
                  )}
                </div>
              </div>

              {attention.needsAttention && (
                <p
                  className={`${styles.compactAttention} ${
                    attention.severity === "error"
                      ? styles.attentionError
                      : styles.attentionWarning
                  }`}
                >
                  <WarningAmberOutlined
                    className={styles.inlineIcon}
                    aria-hidden="true"
                  />
                  <span>Hồ sơ cần chú ý: {attention.primaryWarning}</span>
                </p>
              )}

              <div className={styles.compactActions}>
                <Button
                  component={Link}
                  to={detailUrl}
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<VisibilityOutlined />}
                  className={styles.compactActionBtn}
                >
                  Xem chi tiết
                </Button>
                <Button
                  type="button"
                  variant="text"
                  color="primary"
                  size="small"
                  startIcon={<EditOutlined />}
                  onClick={() => onEdit?.(facility)}
                  className={styles.compactActionBtn}
                >
                  Chỉnh sửa
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <footer className={styles.listFooter}>
        <p className={styles.footerCount}>
          Hiển thị {facilities.length} / {totalCount} cơ sở nguồn cung
        </p>
      </footer>
    </>
  )
}

FacilityListView.propTypes = {
  facilities: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCount: PropTypes.number.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}

export default FacilityListView
