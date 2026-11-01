import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import FilterListIcon from "@mui/icons-material/FilterList"
import { Tooltip } from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./HealthPendingTasksTable.module.scss"

const INITIAL_TASKS = [
  {
    id: "TASK-01",
    title: "Thực đơn Tuần 45 — Khối 6 & 7",
    subtitle: "BGH yêu cầu điều chỉnh giảm hàm lượng muối món canh",
    group: "Thực đơn",
    groupType: "menu",
    date: "24/10/2026",
    status: "BGH yêu cầu sửa",
    statusType: "danger",
    route: ROUTER.SCHOOL_MENU_PLANNING,
  },
  {
    id: "TASK-02",
    title: "Đợt giao hàng CP Việt Nam (DELIV-20261024-01)",
    subtitle: "3 mặt hàng thực phẩm tươi sống (Thịt heo, trứng cút)",
    group: "Kiểm thực giao hàng",
    groupType: "delivery",
    date: "24/10/2026 (05:30)",
    status: "Chờ đánh giá y tế",
    statusType: "warning",
    route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
  },
  {
    id: "TASK-03",
    title: "Đợt giao hàng HTX Nông nghiệp Ba Vì (DELIV-20261024-03)",
    subtitle: "Rau củ hữu cơ và sữa tươi hạt",
    group: "Kiểm thực giao hàng",
    groupType: "delivery",
    date: "24/10/2026 (06:10)",
    status: "Chờ đánh giá y tế",
    statusType: "warning",
    route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
  },
  {
    id: "TASK-04",
    title: "Thực đơn Tuần 46 — Toàn trường",
    subtitle: "Bản thảo mới tạo lập, cần rà soát thành phần gây dị ứng",
    group: "Thực đơn",
    groupType: "menu",
    date: "25/10/2026",
    status: "Bản nháp cần duyệt",
    statusType: "info",
    route: ROUTER.SCHOOL_MENU_PLANNING,
  },
]

export default function HealthPendingTasksTable() {
  const navigate = useNavigate()
  const [filterGroup, setFilterGroup] = useState("ALL")

  const filteredTasks = INITIAL_TASKS.filter((task) => {
    if (filterGroup === "MENU") return task.groupType === "menu"
    if (filterGroup === "DELIVERY") return task.groupType === "delivery"
    return true
  })

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
          <p className={styles.subheading}>
            Những hạng mục đang chờ ý kiến chuyên môn và thao tác từ Nhân viên y tế.
          </p>
        </div>

        <div className={styles.headerRight}>
          {/* Quick Filter Tabs */}
          <div className={styles.filterPills}>
            <button
              type="button"
              className={`${styles.filterPill} ${filterGroup === "ALL" ? styles.activePill : ""}`}
              onClick={() => setFilterGroup("ALL")}
            >
              Tất cả ({INITIAL_TASKS.length})
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${filterGroup === "MENU" ? styles.activePill : ""}`}
              onClick={() => setFilterGroup("MENU")}
            >
              Thực đơn (2)
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${filterGroup === "DELIVERY" ? styles.activePill : ""}`}
              onClick={() => setFilterGroup("DELIVERY")}
            >
              Kiểm thực (2)
            </button>
          </div>

          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          >
            <span>Xem tất cả</span>
            <ArrowForwardIcon className={styles.arrowIcon} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className={styles.tableResponsive}>
        <table className={styles.taskTable}>
          <thead>
            <tr>
              <th scope="col" className={styles.thMain}>
                Nội dung công việc
              </th>
              <th scope="col" className={styles.thGroup}>
                Nhóm công việc
              </th>
              <th scope="col" className={styles.thDate}>
                Ngày liên quan
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
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                className={styles.tableRow}
                onClick={() => handleActionClick(task)}
              >
                {/* 1. Nội dung */}
                <td className={styles.tdMain}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  <div className={styles.taskSub}>{task.subtitle}</div>
                </td>

                {/* 2. Nhóm */}
                <td className={styles.tdGroup}>
                  <span
                    className={`${styles.groupTag} ${
                      task.groupType === "menu" ? styles.groupMenu : styles.groupDelivery
                    }`}
                  >
                    {task.group}
                  </span>
                </td>

                {/* 3. Ngày */}
                <td className={styles.tdDate}>
                  <span className={styles.dateText}>{task.date}</span>
                </td>

                {/* 4. Trạng thái */}
                <td className={styles.tdStatus}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(task.statusType)}`}>
                    <span className={styles.statusDot} />
                    {task.status}
                  </span>
                </td>

                {/* 5. Thao tác */}
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
    </section>
  )
}

