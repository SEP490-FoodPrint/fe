import React, { useState, useEffect } from "react";
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
  Skeleton,
} from "@mui/material";
import { ArrowRight, Eye, ConciergeBell } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import MealAllocationService from "src/services/MealAllocationService";
import { adaptRecentAllocations } from "src/services/MealAllocationService/adapter";
import styles from "./RecentMealAllocations.module.scss";

function RecentMealAllocations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    MealAllocationService.getToday(controller.signal)
      .then((res) => {
        if (active) {
          const adapted = adaptRecentAllocations(res);
          setAllocations(adapted);
        }
      })
      .catch(() => {
        if (active) setAllocations([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

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

      {loading ? (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton variant="rounded" height={42} />
          <Skeleton variant="rounded" height={42} />
          <Skeleton variant="rounded" height={42} />
        </div>
      ) : allocations.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
          Chưa có phân bổ suất ăn nào cho hôm nay.
        </div>
      ) : (
        <>
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
                {allocations.map((row) => (
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
                            : row.statusType === "warning"
                            ? styles.status_warning
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
            {allocations.map((row) => (
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
                        : row.statusType === "warning"
                        ? styles.status_warning
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
        </>
      )}
    </Card>
  );
}

export default RecentMealAllocations;
