import React from "react";
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
import styles from "./RecentCookingBatches.module.scss";

const COOKING_BATCHES = [
  {
    code: "CB-20261026-001",
    dish: "Thịt heo kho nước dừa",
    portion: "1.250 suất",
    status: "Chờ xác nhận",
    statusType: "warning",
  },
  {
    code: "CB-20261025-002",
    dish: "Canh sườn hầm củ quả",
    portion: "1.250 suất",
    status: "Đã hoàn thành",
    statusType: "success",
  },
  {
    code: "CB-20261025-001",
    dish: "Trứng chiên thịt băm",
    portion: "1.220 suất",
    status: "Đã hoàn thành",
    statusType: "success",
  },
];

function RecentCookingBatches() {
  return (
    <Card className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <Typography className={styles.tableTitle}>
          Mẻ chế biến gần đây
        </Typography>
        <button type="button" className={styles.viewAllBtn}>
          <span>Xem tất cả</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className={styles.tableResponsive}>
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
                Thao tác
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
                  <Tooltip title="Xem chi tiết mẻ nấu" arrow>
                    <IconButton size="small" className={styles.actionIconBtn}>
                      <Eye size={17} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export default RecentCookingBatches;
