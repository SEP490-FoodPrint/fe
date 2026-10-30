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
    type: "Mẻ nấu",
    code: "CB-20261026-001",
    title: "Thịt heo kho nước dừa",
    portion: "1.250 suất",
    statusText: "Chờ nấu",
    statusType: "warning",
    icon: <UtensilsCrossed size={18} />,
    actionIcon: <ChevronRight size={20} />,
    actionLabel: "Xem chi tiết mẻ nấu",
    route: ROUTER.SCHOOL_KITCHEN_BATCHES,
    isPrimary: false,
  },
  {
    id: "task-2",
    type: "Phân bổ",
    code: "ALLOC-20261026-01",
    title: "Phân bổ Khối 6 & Khối 7",
    portion: "620 suất",
    statusText: "Chưa giao",
    statusType: "info",
    icon: <ConciergeBell size={18} />,
    actionIcon: <ChevronRight size={20} />,
    actionLabel: "Xem phân bổ suất ăn",
    route: ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION,
    isPrimary: false,
  },
  {
    id: "task-3",
    type: "Kiểm thực",
    code: "DELIV-20261026-089",
    title: "Thịt ba chỉ & Trứng cút",
    portion: "HTX Nam Hà",
    statusText: "Cần kiểm thực",
    statusType: "primary",
    icon: <ClipboardCheck size={18} />,
    actionIcon: <Check size={20} />,
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

      {/* Danh sách Task dạng Icon Action */}
      <div className={styles.taskList} role="list">
        {TASKS.map((task) => (
          <div
            key={task.id}
            className={styles.taskItem}
            role="listitem"
            onClick={() => navigate(task.route)}
          >
            {/* Cột trái: Icon loại việc */}
            <div className={styles.iconCircle} aria-hidden="true">
              {task.icon}
            </div>

            {/* Cột giữa: Thông tin cốt lõi ngắn gọn */}
            <div className={styles.taskInfo}>
              <div className={styles.nameRow}>
                <Typography className={styles.taskName}>
                  {task.title}
                </Typography>
                {task.portion && (
                  <span className={styles.portionText}>• {task.portion}</span>
                )}
              </div>
              <div className={styles.metaRow}>
                <span className={styles.taskCode}>{task.code}</span>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`status_${task.statusType}`] || ""
                  }`}
                >
                  <span className={styles.dot} />
                  <span>{task.statusText}</span>
                </span>
              </div>
            </div>

            {/* Cột phải: Icon Action Button (Touch target 44px x 44px) */}
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
        ))}
      </div>
    </Card>
  );
}

export default PendingTasksSection;
