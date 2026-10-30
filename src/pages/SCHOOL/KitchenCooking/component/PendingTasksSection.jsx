import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, IconButton, Tooltip } from "@mui/material";
import {
  UtensilsCrossed,
  ConciergeBell,
  ClipboardCheck,
  ChevronRight,
  Check,
} from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./PendingTasksSection.module.scss";

const TASKS = [
  {
    id: "task-1",
    title: "Thịt heo kho nước dừa",
    timeTag: "Xong trước 10:30",
    portion: "1.250 suất",
    statusText: "Chờ nấu",
    statusType: "warning",
    icon: <UtensilsCrossed size={15} />,
    actionIcon: <ChevronRight size={18} />,
    actionLabel: "Xem chi tiết mẻ nấu",
    route: ROUTER.SCHOOL_KITCHEN_BATCHES,
    isPrimary: false,
  },
  {
    id: "task-2",
    title: "Phân bổ Khối 6 & Khối 7",
    timeTag: "Giao lúc 10:45",
    portion: "620 suất",
    statusText: "Chưa giao",
    statusType: "info",
    icon: <ConciergeBell size={15} />,
    actionIcon: <ChevronRight size={18} />,
    actionLabel: "Xem phân bổ suất ăn",
    route: ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION,
    isPrimary: false,
  },
  {
    id: "task-3",
    title: "Thịt ba chỉ & Trứng cút",
    timeTag: "Nhập sáng nay",
    portion: "HTX Nam Hà",
    statusText: "Cần kiểm thực",
    statusType: "primary",
    icon: <ClipboardCheck size={15} />,
    actionIcon: <Check size={18} />,
    actionLabel: "Kiểm thực & Đánh giá ngay",
    route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    isPrimary: true,
  },
];

function PendingTasksSection() {
  const navigate = useNavigate();

  return (
    <Card className={styles.sectionCard}>
      {/* Header tối giản */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <Typography className={styles.mainTitle}>
            Việc cần xử lý hôm nay
          </Typography>
          <span className={styles.badgeCount}>3</span>
        </div>
      </div>

      {/* Danh sách Task 2 hàng nhỏ gọn, bao quát chuẩn UI/UX Pro Max */}
      <div className={styles.taskList} role="list">
        {TASKS.map((task) => (
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
                      e.stopPropagation();
                      navigate(task.route);
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
    </Card>
  );
}

export default PendingTasksSection;
