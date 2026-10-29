import React from "react";
import { Card, Typography, Button } from "@mui/material";
import { UtensilsCrossed, ConciergeBell, ClipboardCheck } from "lucide-react";
import styles from "./PendingTasksSection.module.scss";

const TASKS = [
  {
    id: "task-1",
    type: "Mẻ chế biến",
    code: "CB-20261026-001",
    title: "Thịt heo kho nước dừa",
    portion: "1.250 suất",
    statusText: "Chờ xác nhận nấu",
    statusType: "warning",
    icon: <UtensilsCrossed size={18} />,
    actionText: "Xem chi tiết",
    actionVariant: "outlined",
  },
  {
    id: "task-2",
    type: "Phân bổ suất ăn",
    code: "ALLOC-20261026-01",
    title: "Phân bổ suất ăn Khối 6 & Khối 7",
    portion: "620 suất",
    statusText: "Chưa phân phối",
    statusType: "info",
    icon: <ConciergeBell size={18} />,
    actionText: "Xem chi tiết",
    actionVariant: "outlined",
  },
  {
    id: "task-3",
    type: "Đánh giá nhận hàng",
    code: "DELIV-20261026-089",
    title: "Thịt ba chỉ tươi & Trứng cút từ HTX Nam Hà",
    portion: "",
    statusText: "Chờ kiểm thực bước 1",
    statusType: "primary",
    icon: <ClipboardCheck size={18} />,
    actionText: "Đánh giá",
    actionVariant: "contained",
  },
];

function PendingTasksSection() {
  return (
    <Card className={styles.sectionCard}>
      {/* Header của Section */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <Typography className={styles.mainTitle}>
            Công việc cần xử lý hôm nay
          </Typography>
          <span className={styles.badgeCount}>3 việc cần làm</span>
        </div>
        <span className={styles.subHint}>
          Ưu tiên phục vụ bữa trưa học sinh đúng giờ
        </span>
      </div>

      {/* Danh sách Task */}
      <div className={styles.taskList}>
        {TASKS.map((task) => (
          <div key={task.id} className={styles.taskItem}>
            <div className={styles.itemLeft}>
              <div className={styles.iconCircle}>{task.icon}</div>
              <div className={styles.taskInfo}>
                <div className={styles.metaRow}>
                  <span className={styles.taskType}>{task.type}</span>
                  <span className={styles.taskCode}>[{task.code}]</span>
                </div>
                <Typography className={styles.taskName}>
                  {task.title}{" "}
                  {task.portion && (
                    <span className={styles.portionText}>({task.portion})</span>
                  )}
                </Typography>
              </div>
            </div>

            <div className={styles.itemRight}>
              <div
                className={`${styles.statusBadge} ${
                  styles[`status_${task.statusType}`] || ""
                }`}
              >
                <span className={styles.dot} />
                <span>{task.statusText}</span>
              </div>

              {task.actionVariant === "contained" ? (
                <Button
                  variant="contained"
                  color="primary"
                  className={styles.primaryActionBtn}
                >
                  {task.actionText}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  className={styles.secondaryActionBtn}
                >
                  {task.actionText}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default PendingTasksSection;
