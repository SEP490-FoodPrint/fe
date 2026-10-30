import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
} from "@mui/material";
import { ArrowRight, Eye, ConciergeBell } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./RecentMealAllocations.module.scss";

const ALLOCATIONS = [
  {
    id: "alloc-1",
    target: "Khối 6 (Phòng 201–207)",
    timeTag: "Giờ ăn 11:15 (Giao trước 11:00)",
    portion: "360 suất",
    status: "Đang giao",
    statusType: "info",
  },
  {
    id: "alloc-2",
    target: "Khối 7 (Phòng 301–308)",
    timeTag: "Ca trưa 11:15 (Đã bàn giao)",
    portion: "380 suất",
    status: "Đã giao",
    statusType: "success",
  },
  {
    id: "alloc-3",
    target: "Khối 8 (Phòng 401–408)",
    timeTag: "Ca trưa 11:15 (Đã bàn giao)",
    portion: "375 suất",
    status: "Đã giao",
    statusType: "success",
  },
];

function RecentMealAllocations() {
  const navigate = useNavigate();

  return (
    <Card className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <Typography className={styles.tableTitle}>
          Phân bổ suất ăn gần đây
        </Typography>
        <button
          type="button"
          className={styles.viewAllBtn}
          aria-label="Xem tất cả phân bổ suất ăn"
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION)}
        >
          <span>Tất cả</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Desktop Table View (>= 640px) */}
      <div className={styles.desktopTableView}>
        <Table className={styles.dataTable} size="small">
          <TableHead>
            <TableRow>
              <TableCell className={styles.th}>Lớp nhận / Phòng</TableCell>
              <TableCell className={styles.th}>Bữa ăn / Giờ giao</TableCell>
              <TableCell align="right" className={styles.th}>
                Số suất
              </TableCell>
              <TableCell align="center" className={styles.th}>
                Trạng thái
              </TableCell>
              <TableCell align="center" className={styles.th}>
                Xem
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ALLOCATIONS.map((row) => (
              <TableRow key={row.id} className={styles.tableRow}>
                <TableCell className={styles.targetCell}>
                  {row.target}
                </TableCell>
                <TableCell className={styles.timeCell}>{row.timeTag}</TableCell>
                <TableCell align="right" className={styles.portionCell}>
                  {row.portion}
                </TableCell>
                <TableCell align="center">
                  <span
                    className={`${styles.statusText} ${
                      row.statusType === "success"
                        ? styles.status_success
                        : styles.status_info
                    }`}
                  >
                    {row.status}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Xem chi tiết" arrow>
                    <IconButton
                      size="small"
                      className={styles.actionIconBtn}
                      aria-label={"Xem chi tiết phân bổ " + row.target}
                      onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION)}
                    >
                      <Eye size={17} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Icon-Action List (< 640px) 2 hàng nhỏ gọn */}
      <div className={styles.mobileCardList}>
        {ALLOCATIONS.map((row) => (
          <div
            key={row.id}
            className={styles.mobileCardItem}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION)}
          >
            {/* Hàng 1: Khối lớp + Trạng thái */}
            <div className={styles.topRow}>
              <div className={styles.titleWithIcon}>
                <span className={styles.itemIcon} aria-hidden="true">
                  <ConciergeBell size={14} />
                </span>
                <Typography className={styles.targetTitle}>
                  {row.target}
                </Typography>
              </div>

              <span
                className={`${styles.mobileStatusBadge} ${
                  row.statusType === "success"
                    ? styles.status_success
                    : styles.status_info
                }`}
              >
                {row.status}
              </span>
            </div>

            {/* Hàng 2: Số suất • Thời gian + Nút xem chi tiết */}
            <div className={styles.bottomRow}>
              <div className={styles.metaInfo}>
                <span className={styles.portionText}>{row.portion}</span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.timeText}>{row.timeTag}</span>
              </div>

              <IconButton
                className={styles.mobileActionBtn}
                aria-label={"Xem chi tiết " + row.target}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION);
                }}
              >
                <Eye size={16} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default RecentMealAllocations;
