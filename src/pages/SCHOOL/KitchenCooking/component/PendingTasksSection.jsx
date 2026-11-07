import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, Typography, IconButton, Tooltip, Skeleton } from "@mui/material"
import {
  UtensilsCrossed,
  CookingPot,
  FlaskConical,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import KitchenService from "src/services/KitchenService"
import styles from "./PendingTasksSection.module.scss"

function PendingTasksSection() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    KitchenService.getBatches({ limit: 20 }, { signal: controller.signal })
      .then((res) => {
        if (!active) return
        const items = res.items || []
        const derived = []

        // 1. Unconfirmed batches (Chờ xác nhận phương án)
        items
          .filter((b) => b.status === "UNCONFIRMED")
          .forEach((b) => {
            derived.push({
              id: `unconf-${b.id}`,
              title: b.Dish?.name || b.batchCode || "Lô chế biến",
              timeTag: b.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế",
              portion: Number.isSafeInteger(b.plannedPortions)
                ? `${b.plannedPortions.toLocaleString("vi-VN")} suất`
                : "—",
              statusText: "Chờ xác nhận",
              statusType: "warning",
              icon: <UtensilsCrossed size={16} />,
              actionIcon: <ChevronRight size={18} />,
              actionLabel: "Xem và xác nhận lô",
              route: ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", b.id),
              isPrimary: true,
            })
          })

        // 2. Confirmed batches (Đang nấu - chờ hoàn thành)
        items
          .filter((b) => b.status === "CONFIRMED")
          .forEach((b) => {
            derived.push({
              id: `conf-${b.id}`,
              title: b.Dish?.name || b.batchCode || "Lô chế biến",
              timeTag: b.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế",
              portion: Number.isSafeInteger(b.plannedPortions)
                ? `${b.plannedPortions.toLocaleString("vi-VN")} suất`
                : "—",
              statusText: "Đang nấu",
              statusType: "primary",
              icon: <CookingPot size={16} />,
              actionIcon: <ChevronRight size={18} />,
              actionLabel: "Ghi nhận hoàn thành",
              route: ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", b.id),
              isPrimary: false,
            })
          })

        // 3. Completed batches without retained samples
        items
          .filter((b) => b.status === "COMPLETED" && !b.retainedFoodSample)
          .forEach((b) => {
            derived.push({
              id: `sample-${b.id}`,
              title: b.Dish?.name || b.batchCode || "Lô chế biến",
              timeTag: "Chờ niêm phong mẫu",
              portion: Number.isSafeInteger(b.plannedPortions)
                ? `${b.plannedPortions.toLocaleString("vi-VN")} suất`
                : "—",
              statusText: "Chưa lưu mẫu",
              statusType: "info",
              icon: <FlaskConical size={16} />,
              actionIcon: <ChevronRight size={18} />,
              actionLabel: "Niêm phong lưu mẫu",
              route: ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", b.id),
              isPrimary: true,
            })
          })

        setTasks(derived)
      })
      .catch(() => {
        if (active) setTasks([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  return (
    <Card className={styles.sectionCard}>
      {/* Header tối giản */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <Typography className={styles.mainTitle}>
            Việc cần xử lý hôm nay
          </Typography>
          <span className={styles.badgeCount}>{loading ? "…" : tasks.length}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton variant="rounded" height={44} />
          <Skeleton variant="rounded" height={44} />
        </div>
      ) : tasks.length === 0 ? (
        <div
          style={{
            margin: "12px 16px 16px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#065f46",
            backgroundColor: "#ecfdf5",
            borderRadius: 8,
            border: "1px solid #a7f3d0",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>Không có công việc tồn đọng hôm nay.</span>
        </div>
      ) : (
        <div className={styles.taskList} role="list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={styles.taskCard}
              role="listitem"
              onClick={() => navigate(task.route)}
            >
              {/* Hàng 1: Tên việc + Trạng thái */}
              <div className={styles.topRow}>
                <div className={styles.titleWithIcon}>
                  <span className={styles.itemIcon} aria-hidden="true">
                    {task.icon}
                  </span>
                  <Typography className={styles.taskTitle}>
                    {task.title}
                  </Typography>
                </div>

                <span
                  className={`${styles.statusBadge} ${
                    styles[`status_${task.statusType}`] || ""
                  }`}
                >
                  <span className={styles.dot} />
                  <span>{task.statusText}</span>
                </span>
              </div>

              {/* Hàng 2: Số suất • Thời gian + Nút thao tác */}
              <div className={styles.bottomRow}>
                <div className={styles.metaInfo}>
                  <span className={styles.portionText}>
                    {task.portion}
                  </span>
                  <span className={styles.metaDivider}>•</span>
                  <span className={styles.timeText}>{task.timeTag}</span>
                </div>

                <div className={styles.actionWrap}>
                  <Tooltip title={task.actionLabel} arrow>
                    <IconButton
                      className={`${styles.actionBtn} ${
                        task.isPrimary ? styles.actionPrimary : styles.actionSecondary
                      }`}
                      aria-label={task.actionLabel}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(task.route)
                      }}
                    >
                      {task.actionIcon}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default PendingTasksSection
