import React from "react"
import PropTypes from "prop-types"
import { generatePath, Link, useNavigate } from "react-router-dom"
import { Button, Tooltip } from "@mui/material"
import { ChevronRight } from "@mui/icons-material"
import {
  formatDateTimeVi,
  formatTicketCode,
  TicketStatusBadge,
} from "src/components/ComplaintThread"
import ROUTER from "src/router/ROUTER"
import { formatSchoolCode } from "src/services/SupplierComplaintService"
import styles from "./ComplaintListView.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]

function getComplaintDetailPath(id) {
  return generatePath(ROUTER.SUPPLIER_COMPLAINT_DETAIL, { id })
}

function formatSchoolSubline(school) {
  const name = school?.name || "Chưa cập nhật trường"
  const rawCode = typeof school?.code === "string" ? school.code.trim() : ""
  return rawCode ? `${name} · Mã trường: ${rawCode}` : name
}

function ComplaintListView({
  complaints,
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
        aria-label="Đang tải danh sách khiếu nại chất lượng nguyên liệu"
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

  if (complaints.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không tìm thấy khiếu nại phù hợp"
            : "Chưa có khiếu nại nào"}
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
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table
          className={styles.table}
          aria-label="Danh sách khiếu nại chất lượng nguyên liệu"
        >
          <thead>
            <tr>
              <th scope="col" className={styles.indexCol}>
                STT
              </th>
              <th scope="col">Mã phiếu</th>
              <th scope="col">Tiêu đề &amp; Trường gửi</th>
              <th scope="col">Chuyến giao</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Thời gian gửi</th>
              <th scope="col" className={styles.actionCell}>
                <span className={styles.srOnly}>Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint, index) => {
              const rowNumber = (currentPage - 1) * pageLimit + index + 1
              const detailUrl = getComplaintDetailPath(complaint.id)
              const rawCode = complaint.code ?? complaint.complaintCode
              const hasCode = Boolean(
                typeof rawCode === "string" && rawCode.trim(),
              )
              const codeLabel = formatTicketCode(rawCode, "—")
              const schoolSubline = formatSchoolSubline(complaint.school)
              const statusVal = complaint.displayStatus || complaint.status

              return (
                <tr
                  key={complaint.id}
                  className={styles.tableRow}
                  onClick={event => handleRowClick(event, detailUrl)}
                >
                  <td className={styles.indexCell}>{rowNumber}</td>
                  <td>
                    <span
                      className={hasCode ? styles.codeChip : styles.mutedValue}
                    >
                      {codeLabel}
                    </span>
                  </td>
                  <td>
                    <Link to={detailUrl} className={styles.primaryLink}>
                      {complaint.title}
                    </Link>
                    <div className={styles.subLine} title={schoolSubline}>
                      {schoolSubline}
                    </div>
                  </td>
                  <td>
                    <span className={styles.deliveryNoText}>
                      {complaint.delivery?.deliveryNo || "Chưa cập nhật"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.statusCell}>
                      <TicketStatusBadge
                        status={statusVal}
                        hasNewMessage={complaint.hasNewMessage}
                        showNewMessageText
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className={styles.timeCell}>
                    {formatDateTimeVi(complaint.submittedAt, "—")}
                  </td>
                  <td className={styles.actionCell}>
                    <Tooltip title="Xem chi tiết">
                      <Link
                        to={detailUrl}
                        className={styles.detailLink}
                        aria-label={`Xem chi tiết phiếu ${codeLabel}`}
                      >
                        <ChevronRight fontSize="small" aria-hidden="true" />
                      </Link>
                    </Tooltip>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {complaints.map(complaint => {
          const detailUrl = getComplaintDetailPath(complaint.id)
          const rawCode = complaint.code ?? complaint.complaintCode
          const hasCode = Boolean(typeof rawCode === "string" && rawCode.trim())
          const codeLabel = formatTicketCode(rawCode, "—")
          const statusVal = complaint.displayStatus || complaint.status

          return (
            <Link
              key={complaint.id}
              to={detailUrl}
              className={styles.mobileCard}
            >
              <div className={styles.mobileTop}>
                <span className={hasCode ? styles.codeChip : styles.mutedValue}>
                  {codeLabel}
                </span>
                <TicketStatusBadge
                  status={statusVal}
                  hasNewMessage={complaint.hasNewMessage}
                  showNewMessageText
                  size="sm"
                />
              </div>

              <div className={styles.mobileTitle}>{complaint.title}</div>

              <div className={styles.mobileMetaList}>
                <div className={styles.mobileMetaRow}>
                  <span>Trường gửi</span>
                  <span className={styles.mobileMetaValue}>
                    {complaint.school?.name || "Chưa cập nhật"}
                  </span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>Mã trường</span>
                  <span className={styles.mobileMetaValue}>
                    {formatSchoolCode(complaint.school?.code)}
                  </span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>Chuyến giao</span>
                  <span className={styles.mobileMetaValue}>
                    {complaint.delivery?.deliveryNo || "Chưa cập nhật"}
                  </span>
                </div>
                <div className={styles.mobileMetaRow}>
                  <span>Thời điểm gửi</span>
                  <span className={styles.mobileMetaValue}>
                    {formatDateTimeVi(complaint.submittedAt, "—")}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className={styles.paginationFooter}>
        <span className={styles.paginationInfo}>
          Trang {currentPage} · Hiển thị {complaints.length} khiếu nại
        </span>
        <div className={styles.paginationActions}>
          <Button
            type="button"
            variant="outlined"

            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <Button
            type="button"
            variant="outlined"

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

ComplaintListView.propTypes = {
  complaints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string,
      complaintCode: PropTypes.string,
      title: PropTypes.string,
      school: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        code: PropTypes.string,
      }),
      delivery: PropTypes.shape({
        id: PropTypes.string,
        deliveryNo: PropTypes.string,
      }),
      status: PropTypes.string,
      displayStatus: PropTypes.string,
      hasNewMessage: PropTypes.bool,
      submittedAt: PropTypes.string,
      closedAt: PropTypes.string,
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

export default ComplaintListView
