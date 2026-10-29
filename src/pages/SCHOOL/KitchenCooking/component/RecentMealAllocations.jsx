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
import styles from "./RecentMealAllocations.module.scss";

const ALLOCATIONS = [
  {
    code: "PB-20261026-01",
    target: "Khối 6 (Phòng 201-207)",
    portion: "360 suất",
    status: "Đang phân phối",
    statusType: "info",
  },
  {
    code: "PB-20261025-02",
    target: "Khối 7 (Phòng 301-308)",
    portion: "380 suất",
    status: "Đã hoàn tất",
    statusType: "success",
  },
  {
    code: "PB-20261025-01",
    target: "Khối 8 (Phòng 401-408)",
    portion: "375 suất",
    status: "Đã hoàn tất",
    statusType: "success",
  },
];

function RecentMealAllocations() {
  return (
    <Card className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <Typography className={styles.tableTitle}>
          Phân bổ suất ăn gần đây
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
              <TableCell className={styles.th}>Mã phân bổ</TableCell>
              <TableCell className={styles.th}>Lớp nhận</TableCell>
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
                  <Tooltip title="Xem chi tiết phân bổ" arrow>
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

export default RecentMealAllocations;
