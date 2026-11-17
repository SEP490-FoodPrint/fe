import React from "react"
import PropTypes from "prop-types"
import { generatePath, Link, useNavigate } from "react-router-dom"
import { Button } from "@mui/material"
import { ChevronRight, SchoolOutlined } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatDateTimeVi,
  formatSchoolCode,
} from "src/services/SupplierSchoolService"
import SchoolStatusBadge from "./SchoolStatusBadge"
import styles from "./SchoolListView.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]

function getSchoolDetailPath(id) {
  return generatePath(ROUTER.SUPPLIER_SCHOOL_DETAIL, { id })
}

function SchoolListView({
  schools,
  pageTotalCount,
  loading,
  hasActiveFilters,
  pagination,
  onResetFilters,
  onPageChange,
}) {
  const navigate = useNavigate()
  const currentPage = pagination?.page || 1
  const pageLimit = pagination?.limit || 20

  const handleRowClick = (event, detailUrl) => {
    if (event.target.closest("a, button")) return
    const selectedText = window.getSelection?.()?.toString()
    if (selectedText) return
    navigate(detailUrl)
  }

  if (loading && pageTotalCount === 0) {
    return (
      <div
        className={styles.skeletonStack}
        role="status"
        aria-live="polite"
        aria-label="Đang tải danh sách trường đã liên kết"
      >
        {SKELETON_ROWS.map(rowKey => (
          <div key={rowKey} className={styles.skeletonRow}>
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
          </div>
        ))}
      </div>
    )
  }

  if (schools.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap} aria-hidden="true">
          <SchoolOutlined />
        </div>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không tìm thấy trường học phù hợp"
            : "Chưa có trường học nào liên kết"}
        </p>
        <p className={styles.emptyDesc}>
          {hasActiveFilters
            ? "Thử xóa từ khóa tìm kiếm hoặc chọn lại trạng thái liên kết để xem toàn bộ danh sách."
            : "Khi nhà trường thiết lập liên kết hợp tác với nhà cung cấp, thông tin trường sẽ hiển thị tại đây."}
        </p>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outlined"
            color="primary"
            className={styles.emptyActionBtn}
            onClick={onResetFilters}
          >
            Xóa bộ lọc
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table
          className={styles.table}
          aria-label="Danh sách trường đã liên kết với nhà cung cấp"
        >
          <thead>
            <tr>
              <th scope="col" className={styles.indexCol}>
                STT
              </th>
              <th scope="col">Trường học</th>
              <th scope="col">Mã trường</th>
              <th scope="col">Liên hệ</th>
              <th scope="col">Liên kết</th>
              <th scope="col" className={styles.actionCol}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school, index) => {
              const rowNumber = (currentPage - 1) * pageLimit + index + 1
              const detailUrl = getSchoolDetailPath(school.id)
              const hasCode = Boolean(
                typeof school.code === "string" && school.code.trim(),
              )

              return (
                <tr
                  key={school.id}
                  className={styles.tableRow}
                  onClick={event => handleRowClick(event, detailUrl)}
                >
                  <td className={styles.indexCell}>{rowNumber}</td>
                  <td>
                    <Link to={detailUrl} className={styles.schoolPrimaryLink}>
                      {school.name}
                    </Link>
                    <div
                      className={styles.addressSub}
                      title={school.address || undefined}
                    >
                      {school.address || "Chưa cập nhật địa chỉ"}
                    </div>
                  </td>
                  <td>
                    <span
                      className={hasCode ? styles.codeText : styles.mutedValue}
                    >
                      {formatSchoolCode(school.code)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.phoneText}>
                      {school.phone || "Chưa cập nhật SĐT"}
                    </div>
                    <div
                      className={styles.emailSub}
                      title={school.email || undefined}
                    >
                      {school.email || "Chưa cập nhật email"}
                    </div>
                  </td>
                  <td>
                    <div className={styles.relationshipCell}>
                      <SchoolStatusBadge
                        kind="relationship"
                        status={school.relationship?.status}
                      />
                      <div className={styles.linkedAtSub}>
                        Từ {formatDateTimeVi(school.relationship?.linkedAt)}
                      </div>
                    </div>
                  </td>
                  <td className={styles.actionCell}>
                    <Link
                      to={detailUrl}
                      className={styles.detailLink}
                      aria-label={`Xem chi tiết và hợp đồng của ${school.name}`}
                    >
                      <span>Chi tiết</span>
                      <ChevronRight
                        className={styles.chevronIcon}
                        aria-hidden="true"
                      />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {schools.map(school => {
          const detailUrl = getSchoolDetailPath(school.id)
          return (
            <Link key={school.id} to={detailUrl} className={styles.mobileCard}>
              <div className={styles.mobileCardTop}>
                <div className={styles.mobileNameGroup}>
                  <span className={styles.mobileName}>{school.name}</span>
                  <span className={styles.mobileCodeSub}>
                    Mã trường: {formatSchoolCode(school.code)}
                  </span>
                </div>
                <SchoolStatusBadge
                  kind="relationship"
                  status={school.relationship?.status}
                />
              </div>

              <div className={styles.mobileMetaList}>
                <div className={styles.mobileMetaRow}>
                  <span>SĐT</span>
                  <span className={styles.mobileMetaValue}>
                    {school.phone || "Chưa cập nhật"}
                  </span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>Email</span>
                  <span className={styles.mobileMetaValue}>
                    {school.email || "Chưa cập nhật"}
                  </span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>Địa chỉ</span>
                  <span className={styles.mobileMetaValue}>
                    {school.address || "Chưa cập nhật"}
                  </span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>Liên kết từ</span>
                  <span className={styles.mobileMetaValue}>
                    {formatDateTimeVi(school.relationship?.linkedAt)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className={styles.paginationFooter}>
        <span className={styles.paginationInfo}>
          Trang {currentPage} · Hiển thị {schools.length} trường
        </span>
        <div className={styles.paginationActions}>
          <Button
            type="button"
            variant="outlined"
            className={styles.pageBtn}
            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <Button
            type="button"
            variant="outlined"
            className={styles.pageBtn}
            disabled={!pagination?.hasNext || loading}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </>
  )
}

SchoolListView.propTypes = {
  schools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      code: PropTypes.string,
      address: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      status: PropTypes.string,
      relationship: PropTypes.shape({
        status: PropTypes.string,
        linkedAt: PropTypes.string,
      }),
    }),
  ).isRequired,
  pageTotalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  hasActiveFilters: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }),
  onResetFilters: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
}

export default SchoolListView
