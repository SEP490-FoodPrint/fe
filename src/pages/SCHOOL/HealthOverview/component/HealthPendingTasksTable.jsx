import React from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { Tooltip } from "@mui/material"
import { CheckCircle2, AlertCircle } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthPendingTasksTable.module.scss"

export default function HealthPendingTasksTable({
  tasks = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const navigate = useNavigate()

  const getStatusBadgeClass = (statusType) => {
    switch (statusType) {
      case "danger":
        return styles.statusDanger
      case "warning":
        return styles.statusWarning
      case "info":
        return styles.statusInfo
      case "success":
        return styles.statusSuccess
      default:
        return styles.statusDefault
    }
  }

  const handleActionClick = (task) => {
    if (task.route) {
      navigate(task.route)
    }
  }

  return (
    <section className={styles.tableCard} aria-label="Bảng công việc cần xử lý">
      {/* Module Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleWrap}>
          <h2 className={styles.heading}>Công việc cần xử lý</h2>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
            title="Xem danh sách thực đơn"
          >
            <span>Xem tất cả</span>
            <ArrowForwardIcon className={styles.arrowIcon} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingWrap} role="status">
          <p>Đang tải danh sách công việc cần xử lý…</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className={styles.errorWrap} role="alert">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button type="button" onClick={onRetry}>
              Thử lại
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <div className={styles.emptyState}>
          <CheckCircle2 size={38} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Không có công việc nào tồn đọng</h3>
          <p className={styles.emptyDesc}>
            Tất cả thực đơn và đợt giao nguyên liệu đều đã được xử lý hoàn tất.
          </p>
        </div>
      )}

      {/* Table Container */}
      {!loading && !error && tasks.length > 0 && (
        <div className={styles.tableResponsive}>
          <table className={styles.taskTable}>
            <thead>
              <tr>
                <th scope="col" className={styles.thMain}>
                  Nội dung công việc
                </th>
                <th scope="col" className={styles.thDate}>
                  Thời gian
                </th>
                <th scope="col" className={styles.thStatus}>
                  Trạng thái
                </th>
                <th scope="col" className={styles.thAction}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={styles.tableRow}
                  onClick={() => handleActionClick(task)}
                >
                  {/* 1. Nội dung */}
                  <td className={styles.tdMain}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    {task.subtitle && (
                      <div className={styles.taskSub}>{task.subtitle}</div>
                    )}
                  </td>

                  {/* 2. Ngày liên quan */}
                  <td className={styles.tdDate}>
                    <span className={styles.dateText}>{task.date}</span>
                  </td>

                  {/* 3. Trạng thái */}
                  <td className={styles.tdStatus}>
                    <span
                      className={`${styles.statusBadge} ${getStatusBadgeClass(
                        task.statusType
                      )}`}
                    >
                      <span className={styles.statusDot} />
                      {task.status}
                    </span>
                  </td>

                  {/* 4. Thao tác */}
                  <td className={styles.tdAction}>
                    <Tooltip title="Xem chi tiết & Thao tác" arrow>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActionClick(task)
                        }}
                        aria-label={`Xem chi tiết ${task.title}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

HealthPendingTasksTable.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      date: PropTypes.string,
      status: PropTypes.string,
      statusType: PropTypes.string,
      route: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
}
