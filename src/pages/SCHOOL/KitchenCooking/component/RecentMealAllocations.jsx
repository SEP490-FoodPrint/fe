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
import { ArrowRight, Eye } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./RecentMealAllocations.module.scss";

const ALLOCATIONS = [
  {
    code: "PB-20261026-01",
    target: "Khối 6 (Phòng 201-207)",
    portion: "360 suất",
    status: "Đang giao",
    statusType: "info",
  },
  {
    code: "PB-20261025-02",
    target: "Khối 7 (Phòng 301-308)",
    portion: "380 suất",
    status: "Đã giao",
    statusType: "success",
  },
  {
    code: "PB-20261025-01",
    target: "Khối 8 (Phòng 401-408)",
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
              <TableCell className={styles.th}>Mã phân bổ</TableCell>
              <TableCell className={styles.th}>Lớp nhận</TableCell>
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
              <TableRow key={row.code} className={styles.tableRow}>
                <TableCell className={styles.codeCell}>{row.code}</TableCell>
                <TableCell className={styles.targetCell}>
                  {row.target}
                </TableCell>
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
                      aria-label={"Xem chi tiết phân bổ " + row.code}
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

      {/* Mobile Icon-Action List (< 640px) */}
      <div className={styles.mobileCardList}>
        {ALLOCATIONS.map((row) => (
          <div
            key={row.code}
            className={styles.mobileCardItem}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION)}
          >
            <div className={styles.mobileItemLeft}>
              <div className={styles.mobileHeaderRow}>
                <span className={styles.mobileCode}>{row.code}</span>
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
              <div className={styles.mobileTargetName}>{row.target}</div>
              <div className={styles.mobilePortionText}>
                Số lượng: <strong>{row.portion}</strong>
              </div>
            </div>

            <IconButton
              className={styles.mobileActionBtn}
              aria-label={"Xem chi tiết " + row.code}
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION);
              }}
            >
              <Eye size={18} />
            </IconButton>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default RecentMealAllocations;
