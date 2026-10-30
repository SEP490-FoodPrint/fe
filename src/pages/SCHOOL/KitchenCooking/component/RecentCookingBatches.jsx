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
import styles from "./RecentCookingBatches.module.scss";

const COOKING_BATCHES = [
  {
    code: "CB-20261026-001",
    dish: "Thịt heo kho nước dừa",
    portion: "1.250 suất",
    status: "Chờ nấu",
    statusType: "warning",
  },
  {
    code: "CB-20261025-002",
    dish: "Canh sườn hầm củ quả",
    portion: "1.250 suất",
    status: "Đã nấu",
    statusType: "success",
  },
  {
    code: "CB-20261025-001",
    dish: "Trứng chiên thịt băm",
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
              <TableCell className={styles.th}>Mã mẻ</TableCell>
              <TableCell className={styles.th}>Món ăn</TableCell>
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
              <TableRow key={row.code} className={styles.tableRow}>
                <TableCell className={styles.codeCell}>{row.code}</TableCell>
                <TableCell className={styles.dishCell}>{row.dish}</TableCell>
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
                      aria-label={"Xem chi tiết mẻ " + row.code}
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

      {/* Mobile Icon-Action List (< 640px) */}
      <div className={styles.mobileCardList}>
        {COOKING_BATCHES.map((row) => (
          <div
            key={row.code}
            className={styles.mobileCardItem}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          >
            <div className={styles.mobileItemLeft}>
              <div className={styles.mobileHeaderRow}>
                <span className={styles.mobileCode}>{row.code}</span>
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
              <div className={styles.mobileDishName}>{row.dish}</div>
              <div className={styles.mobilePortionText}>
                Số lượng: <strong>{row.portion}</strong>
              </div>
            </div>

            <IconButton
              className={styles.mobileActionBtn}
              aria-label={"Xem chi tiết " + row.code}
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTER.SCHOOL_KITCHEN_BATCHES);
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

export default RecentCookingBatches;
