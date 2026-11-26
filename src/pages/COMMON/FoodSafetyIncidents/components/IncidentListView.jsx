import React from "react"
import PropTypes from "prop-types"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@mui/material"
import {
  AddOutlined,
  CheckCircleOutlineOutlined,
  ChevronRight,
  ErrorOutlineOutlined,
  InboxOutlined,
  ReplayOutlined,
  ReportProblemOutlined,
} from "@mui/icons-material"
import {
  formatCode,
  formatDateTimeVi,
  formatDateVi,
  getForwardingStatusMeta,
  getIncidentStatusMeta,
  INCIDENT_SOURCE_LABELS,
  INCIDENT_STATUS_OPTIONS,
} from "src/services/FoodSafetyIncidentService"
import IncidentStatusBadge from "./IncidentStatusBadge"
import TruncatedText from "src/components/TruncatedText"
import styles from "../FoodSafetyIncidents.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]

function IncidentListView({
  basePath,
  isAuthority,
  isBgh,
  canReport,
  activeTab,
  onTabChange,
  incidents,
  incidentsPagination,
  incidentsLoading,
  incidentsError,
  statusFilter,
  onStatusFilterChange,
  onIncidentsPageChange,
  onRetryIncidents,
  reports,
  reportsPagination,
  reportsLoading,
  reportsError,
  receivingReportId,
  receivedReportIds = [],
  onReceiveReport,
  onReportsPageChange,
  onRetryReports,
  onOpenReportDialog,
}) {
  const navigate = useNavigate()

  const handleRowClick = (event, url) => {
    if (event.target.closest("a, button")) return
    if (window.getSelection?.()?.toString()) return
    navigate(url)
  }

  const pageTitle = isAuthority
    ? "Báo cáo ngộ độc"
    : isBgh
      ? "Quản lý báo cáo ngộ độc"
      : "Báo cáo ngộ độc"

  const pageSubtitle = isAuthority
    ? "Tiếp nhận báo cáo ngộ độc từ các trường trên địa bàn, truy xuất chuỗi cung ứng và quản lý đợt kiểm tra ATTP."
    : isBgh
      ? "Xác minh báo cáo ngộ độc từ phụ huynh và giáo viên, gắn suất ăn liên quan và chuyển hồ sơ tới đơn vị ATTP cấp xã."
      : "Gửi báo cáo ngộ độc khi phát hiện dấu hiệu nghi ngờ mất an toàn thực phẩm và theo dõi tiến độ xử lý."

  const renderSkeleton = () => (
    <div
      className={styles.skeletonStack}
      role="status"
      aria-live="polite"
      aria-label="Đang tải dữ liệu"
    >
      {SKELETON_ROWS.map(key => (
        <div key={key} className={styles.skeletonRow}>
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

  const renderIncidentsTab = () => (
    <>
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="incident-status-filter" className={styles.filterLabel}>
            Trạng thái
          </label>
          <select
            id="incident-status-filter"
            className={styles.selectInput}
            value={statusFilter}
            onChange={e => onStatusFilterChange(e.target.value)}
          >
            {INCIDENT_STATUS_OPTIONS.map(opt => (
              <option key={opt.value || "ALL"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {statusFilter ? (
            <Button
              type="button"
              size="small"
              variant="text"
              onClick={() => onStatusFilterChange("")}
            >
              Xóa bộ lọc
            </Button>
          ) : null}
        </div>
        <span className={styles.countSummary}>
          Trang {incidentsPagination.page} · {incidents.length} hồ sơ
        </span>
      </div>

      {incidentsError ? (
        <div className={styles.stateBox} role="alert">
          <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
            <ErrorOutlineOutlined />
          </div>
          <p className={styles.stateTitle}>Không thể tải danh sách báo cáo ngộ độc</p>
          <p className={styles.stateDesc}>{incidentsError.message}</p>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            startIcon={<ReplayOutlined />}
            onClick={onRetryIncidents}
          >
            Thử lại
          </Button>
        </div>
      ) : incidentsLoading && incidents.length === 0 ? (
        renderSkeleton()
      ) : incidents.length === 0 ? (
        <div className={styles.stateBox}>
          <div className={styles.stateIcon}>
            <ReportProblemOutlined />
          </div>
          <p className={styles.stateTitle}>
            {statusFilter
              ? "Không có báo cáo ngộ độc ở trạng thái đã chọn"
              : "Chưa có báo cáo ngộ độc nào"}
          </p>
          <p className={styles.stateDesc}>
            {statusFilter
              ? "Thử chuyển về tất cả trạng thái để xem toàn bộ báo cáo ngộ độc hiện có."
              : isAuthority
                ? "Các báo cáo ngộ độc do nhà trường chuyển lên sẽ xuất hiện tại đây và trong hộp tiếp nhận báo cáo."
                : "Khi cần ghi nhận dấu hiệu mất an toàn thực phẩm, hãy tạo báo cáo mới để nhà trường và cơ quan ATTP xử lý kịp thời."}
          </p>
          {statusFilter ? (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={() => onStatusFilterChange("")}
            >
              Xem tất cả trạng thái
            </Button>
          ) : canReport || isBgh ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<AddOutlined />}
              onClick={onOpenReportDialog}
            >
              {isBgh ? "Tạo báo cáo ngộ độc gửi ATTP" : "Gửi báo cáo ngộ độc"}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table} aria-label="Danh sách báo cáo ngộ độc">
              <thead>
                <tr>
                  <th scope="col">Mã hồ sơ</th>
                  <th scope="col">Tiêu đề báo cáo</th>
                  <th scope="col">Số HS</th>
                  <th scope="col">Nguồn báo cáo</th>
                  <th scope="col">Thời điểm xảy ra</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Ngày tạo</th>
                  <th scope="col" className={styles.actionCell}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(item => {
                  const detailUrl = `${basePath}/${item.id}`
                  const statusMeta = getIncidentStatusMeta(item.status)
                  const codeText = formatCode(item.code)
                  const sourceText =
                    INCIDENT_SOURCE_LABELS[item.source] || item.source || "—"

                  return (
                    <tr
                      key={item.id}
                      className={styles.clickableRow}
                      onClick={e => handleRowClick(e, detailUrl)}
                    >
                      <td>
                        {item.code ? (
                          <span className={styles.codeChip}>{codeText}</span>
                        ) : (
                          <span className={styles.mutedText}>—</span>
                        )}
                      </td>
                      <td style={{ width: "100%", maxWidth: 0, minWidth: 160 }}>
                        <TruncatedText
                          component={Link}
                          to={detailUrl}
                          className={styles.primaryLink}
                        >
                          {item.title || "Báo cáo ngộ độc"}
                        </TruncatedText>
                      </td>
                      <td className={styles.tabularNum}>
                        {item.reportedSymptomaticCount ?? "—"}
                      </td>
                      <td>
                        <TruncatedText style={{ maxWidth: 130 }}>
                          {sourceText}
                        </TruncatedText>
                      </td>
                      <td className={styles.tabularNum}>
                        {formatDateTimeVi(item.occurredAt)}
                      </td>
                      <td>
                        <IncidentStatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </td>
                      <td
                        className={styles.tabularNum}
                        title={formatDateTimeVi(item.createdAt)}
                      >
                        {formatDateVi(item.createdAt)}
                      </td>
                      <td className={styles.actionCell}>
                        <Link to={detailUrl} className={styles.detailLink}>
                          <span>Chi tiết</span>
                          <ChevronRight fontSize="small" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileList}>
            {incidents.map(item => {
              const detailUrl = `${basePath}/${item.id}`
              const statusMeta = getIncidentStatusMeta(item.status)
              const codeText = formatCode(item.code)
              const sourceText =
                INCIDENT_SOURCE_LABELS[item.source] || item.source || "—"

              return (
                <Link key={item.id} to={detailUrl} className={styles.mobileCard}>
                  <div className={styles.mobileCardTop}>
                    {item.code ? (
                      <span className={styles.codeChip}>{codeText}</span>
                    ) : (
                      <span className={styles.mutedText}>—</span>
                    )}
                    <IncidentStatusBadge
                      label={statusMeta.label}
                      tone={statusMeta.tone}
                    />
                  </div>
                  <div className={styles.mobileTitle}>
                    {item.title || "Báo cáo ngộ độc"}
                  </div>
                  <div className={styles.mobileMetaList}>
                    <div className={styles.mobileMetaRow}>
                      <span>HS có triệu chứng</span>
                      <span>{item.reportedSymptomaticCount ?? "—"}</span>
                    </div>
                    <div className={styles.mobileMetaRow}>
                      <span>Nguồn báo cáo</span>
                      <span>{sourceText}</span>
                    </div>
                    <div className={styles.mobileMetaRow}>
                      <span>Thời điểm xảy ra</span>
                      <span>{formatDateTimeVi(item.occurredAt)}</span>
                    </div>
                    <div className={styles.mobileMetaRow}>
                      <span>Ngày tạo</span>
                      <span>{formatDateTimeVi(item.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className={styles.paginationFooter}>
            <span className={styles.paginationInfo}>
              Trang {incidentsPagination.page} · Hiển thị {incidents.length} hồ sơ
            </span>
            <div className={styles.paginationActions}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={incidentsPagination.page <= 1 || incidentsLoading}
                onClick={() =>
                  onIncidentsPageChange(incidentsPagination.page - 1)
                }
              >
                Trang trước
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={!incidentsPagination.hasNext || incidentsLoading}
                onClick={() =>
                  onIncidentsPageChange(incidentsPagination.page + 1)
                }
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )

  const renderReportsTab = () => (
    <>
      <div className={styles.filterBar}>
        <span className={styles.mutedText}>
          Danh sách báo cáo ngộ độc do các trường học chuyển đến đơn vị ATTP. Nhấn
          &ldquo;Tiếp nhận hồ sơ&rdquo; để chuyển hồ sơ sang trạng thái đã tiếp
          nhận và bắt đầu lập đợt kiểm tra.
        </span>
        <span className={styles.countSummary}>
          Trang {reportsPagination.page} · {reports.length} báo cáo
        </span>
      </div>

      {reportsError ? (
        <div className={styles.stateBox} role="alert">
          <div className={`${styles.stateIcon} ${styles.stateIconError}`}>
            <ErrorOutlineOutlined />
          </div>
          <p className={styles.stateTitle}>Không thể tải hộp tiếp nhận báo cáo</p>
          <p className={styles.stateDesc}>{reportsError.message}</p>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            startIcon={<ReplayOutlined />}
            onClick={onRetryReports}
          >
            Thử lại
          </Button>
        </div>
      ) : reportsLoading && reports.length === 0 ? (
        renderSkeleton()
      ) : reports.length === 0 ? (
        <div className={styles.stateBox}>
          <div className={styles.stateIcon}>
            <InboxOutlined />
          </div>
          <p className={styles.stateTitle}>Chưa có báo cáo chuyển đến</p>
          <p className={styles.stateDesc}>
            Khi trường học trên địa bàn chuyển hồ sơ báo cáo ngộ độc, phiếu báo cáo
            sẽ hiển thị tại đây để cán bộ tiếp nhận.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table} aria-label="Hộp tiếp nhận báo cáo ATTP">
              <thead>
                <tr>
                  <th scope="col">Số tham chiếu</th>
                  <th scope="col">Đơn vị nhận</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Thời điểm chuyển</th>
                  <th scope="col">Lần thử gần nhất</th>
                  <th scope="col" className={styles.actionCell}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => {
                  const statusMeta = getForwardingStatusMeta(report.status)
                  const detailUrl = report.incidentId
                    ? `${basePath}/${report.incidentId}`
                    : null
                  const canReceive =
                    !report.receivedAt && !receivedReportIds.includes(report.id)
                  const isReceiving = receivingReportId === report.id

                  return (
                    <tr key={report.id}>
                      <td>
                        <span className={styles.codeChip}>
                          {formatCode(report.referenceNumber)}
                        </span>
                      </td>
                      <td>
                        <TruncatedText style={{ maxWidth: 280 }}>
                          {report.recipientOrganization || "Đơn vị ATTP"}
                        </TruncatedText>
                        {detailUrl ? (
                          <div className={styles.subline}>
                            <Link to={detailUrl} className={styles.detailLink}>
                              Xem báo cáo ngộ độc
                            </Link>
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <IncidentStatusBadge
                          label={statusMeta.label}
                          tone={statusMeta.tone}
                        />
                      </td>
                      <td className={styles.tabularNum}>
                        {formatDateTimeVi(report.forwardedAt || report.createdAt)}
                      </td>
                      <td className={styles.tabularNum}>
                        {formatDateTimeVi(report.attemptedAt)}
                      </td>
                      <td className={styles.actionCell}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {canReceive ? (
                            <Button
                              type="button"
                              variant="contained"
                              color="primary"
                              size="small"
                              disabled={isReceiving}
                              startIcon={<CheckCircleOutlineOutlined />}
                              onClick={() => onReceiveReport(report)}
                            >
                              {isReceiving ? "Đang tiếp nhận..." : "Tiếp nhận hồ sơ"}
                            </Button>
                          ) : null}
                          {detailUrl ? (
                            <Link to={detailUrl} className={styles.detailLink}>
                              <span>Chi tiết</span>
                              <ChevronRight fontSize="small" aria-hidden="true" />
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileList}>
            {reports.map(report => {
              const statusMeta = getForwardingStatusMeta(report.status)
              const detailUrl = report.incidentId
                ? `${basePath}/${report.incidentId}`
                : null
              const canReceive =
                !report.receivedAt && !receivedReportIds.includes(report.id)
              const isReceiving = receivingReportId === report.id

              return (
                <div key={report.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardTop}>
                    <span className={styles.codeChip}>
                      {formatCode(report.referenceNumber)}
                    </span>
                    <IncidentStatusBadge
                      label={statusMeta.label}
                      tone={statusMeta.tone}
                    />
                  </div>
                  <div className={styles.mobileTitle}>
                    {report.recipientOrganization || "Đơn vị ATTP"}
                  </div>
                  <div className={styles.mobileMetaList}>
                    <div className={styles.mobileMetaRow}>
                      <span>Thời điểm chuyển</span>
                      <span>
                        {formatDateTimeVi(report.forwardedAt || report.createdAt)}
                      </span>
                    </div>
                    <div className={styles.mobileMetaRow}>
                      <span>Lần thử gần nhất</span>
                      <span>{formatDateTimeVi(report.attemptedAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {canReceive ? (
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        size="small"
                        fullWidth
                        disabled={isReceiving}
                        onClick={() => onReceiveReport(report)}
                      >
                        {isReceiving ? "Đang tiếp nhận..." : "Tiếp nhận hồ sơ"}
                      </Button>
                    ) : null}
                    {detailUrl ? (
                      <Button
                        component={Link}
                        to={detailUrl}
                        variant="outlined"
                        color="primary"
                        size="small"
                        fullWidth
                      >
                        Xem hồ sơ
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.paginationFooter}>
            <span className={styles.paginationInfo}>
              Trang {reportsPagination.page} · Hiển thị {reports.length} báo cáo
            </span>
            <div className={styles.paginationActions}>
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={reportsPagination.page <= 1 || reportsLoading}
                onClick={() => onReportsPageChange(reportsPagination.page - 1)}
              >
                Trang trước
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={!reportsPagination.hasNext || reportsLoading}
                onClick={() => onReportsPageChange(reportsPagination.page + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageSubtitle}>{pageSubtitle}</p>
        </div>
        <div className={styles.headerActions}>
          {isBgh ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<AddOutlined />}
              onClick={onOpenReportDialog}
            >
              Tạo báo cáo ngộ độc gửi ATTP
            </Button>
          ) : canReport ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<AddOutlined />}
              onClick={onOpenReportDialog}
            >
              Gửi báo cáo ngộ độc
            </Button>
          ) : null}
        </div>
      </div>

      <section className={styles.surface}>
        {isAuthority ? (
          <div className={styles.tabBar} role="tablist" aria-label="Phân mục báo cáo ngộ độc">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "incidents"}
              className={`${styles.tabBtn} ${
                activeTab === "incidents" ? styles.tabBtnActive : ""
              }`}
              onClick={() => onTabChange("incidents")}
            >
              Hồ sơ báo cáo ngộ độc
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "reports"}
              className={`${styles.tabBtn} ${
                activeTab === "reports" ? styles.tabBtnActive : ""
              }`}
              onClick={() => onTabChange("reports")}
            >
              Hộp tiếp nhận báo cáo
            </button>
          </div>
        ) : null}

        {isAuthority && activeTab === "reports"
          ? renderReportsTab()
          : renderIncidentsTab()}
      </section>
    </div>
  )
}

IncidentListView.propTypes = {
  basePath: PropTypes.string.isRequired,
  isAuthority: PropTypes.bool,
  isBgh: PropTypes.bool,
  canReport: PropTypes.bool,
  activeTab: PropTypes.oneOf(["incidents", "reports"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
  incidents: PropTypes.array.isRequired,
  incidentsPagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }).isRequired,
  incidentsLoading: PropTypes.bool,
  incidentsError: PropTypes.object,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func.isRequired,
  onIncidentsPageChange: PropTypes.func.isRequired,
  onRetryIncidents: PropTypes.func.isRequired,
  reports: PropTypes.array.isRequired,
  reportsPagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }).isRequired,
  reportsLoading: PropTypes.bool,
  reportsError: PropTypes.object,
  receivingReportId: PropTypes.string,
  receivedReportIds: PropTypes.arrayOf(PropTypes.string),
  onReceiveReport: PropTypes.func.isRequired,
  onReportsPageChange: PropTypes.func.isRequired,
  onRetryReports: PropTypes.func.isRequired,
  onOpenReportDialog: PropTypes.func.isRequired,
}

export default IncidentListView
