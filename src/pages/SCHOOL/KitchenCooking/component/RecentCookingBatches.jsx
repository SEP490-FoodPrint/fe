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
import { ArrowRight, Eye, UtensilsCrossed } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./RecentCookingBatches.module.scss";

const COOKING_BATCHES = [
  {
    id: "batch-1",
    dish: "Thịt heo kho nước dừa",
    timeTag: "Trưa nay • 10:30",
    portion: "1.250 suất",
    status: "Chờ nấu",
    statusType: "warning",
  },
  {
    id: "batch-2",
    dish: "Canh sườn hầm củ quả",
    timeTag: "Trưa qua • 10:15",
    portion: "1.250 suất",
    status: "Đã nấu",
    statusType: "success",
  },
  {
    id: "batch-3",
    dish: "Trứng chiên thịt băm",
    timeTag: "Trưa qua • 09:45",
    portion: "1.220 suất",
    status: "Đã nấu",
    statusType: "success",
  },
];

function RecentCookingBatches() {
  const navigate = useNavigate();

  return (
    <Card className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <Typography className={styles.tableTitle}>
          Mẻ chế biến gần đây
        </Typography>
        <button
          type="button"
          className={styles.viewAllBtn}
          aria-label="Xem tất cả mẻ chế biến"
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
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
              <TableCell className={styles.th}>Món ăn</TableCell>
              <TableCell className={styles.th}>Bữa ăn / Giờ nấu</TableCell>
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
            {COOKING_BATCHES.map((row) => (
              <TableRow key={row.id} className={styles.tableRow}>
                <TableCell className={styles.dishCell}>{row.dish}</TableCell>
                <TableCell className={styles.timeCell}>{row.timeTag}</TableCell>
                <TableCell align="right" className={styles.portionCell}>
                  {row.portion}
                </TableCell>
                <TableCell align="center">
                  <span
                    className={`${styles.statusText} ${
                      row.statusType === "success"
                        ? styles.status_success
                        : styles.status_warning
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
                      aria-label={"Xem chi tiết " + row.dish}
                      onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
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
        {COOKING_BATCHES.map((row) => (
          <div
            key={row.id}
            className={styles.mobileCardItem}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          >
            {/* Hàng 1: Tên món ăn + Trạng thái */}
            <div className={styles.topRow}>
              <div className={styles.titleWithIcon}>
                <span className={styles.itemIcon} aria-hidden="true">
                  <UtensilsCrossed size={14} />
                </span>
                <Typography className={styles.dishTitle}>
                  {row.dish}
                </Typography>
              </div>

              <span
                className={`${styles.mobileStatusBadge} ${
                  row.statusType === "success"
                    ? styles.status_success
                    : styles.status_warning
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
                aria-label={"Xem chi tiết " + row.dish}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ROUTER.SCHOOL_KITCHEN_BATCHES);
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

export default RecentCookingBatches;
