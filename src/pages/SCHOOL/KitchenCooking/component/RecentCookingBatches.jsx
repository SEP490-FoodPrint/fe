import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
} from "@mui/material"
import { ArrowRight, Eye, UtensilsCrossed } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import KitchenService from "src/services/KitchenService"
import { adaptCookingBatch } from "src/services/KitchenService/adapter"
import styles from "./RecentCookingBatches.module.scss"

function RecentCookingBatches() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [batches, setBatches] = useState([])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    KitchenService.getBatches({ limit: 5 }, { signal: controller.signal })
      .then((res) => {
        if (active) {
          const adapted = (res.items || []).map(adaptCookingBatch)
          setBatches(adapted)
        }
      })
      .catch(() => {
        // Fallback gracefully on network error
        if (active) setBatches([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  return (
    <Card className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <Typography className={styles.tableTitle}>
          Lô chế biến gần đây
        </Typography>
        <button
          type="button"
          className={styles.viewAllBtn}
          aria-label="Xem tất cả lô chế biến"
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
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
      ) : batches.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
          Chưa có lô chế biến nào được lập cho hôm nay.
        </div>
      ) : (
        <>
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
                {batches.map((row) => (
                  <TableRow key={row.id} className={styles.tableRow}>
                    <TableCell className={styles.dishCell}>{row.dishName}</TableCell>
                    <TableCell className={styles.timeCell}>{row.timeTag}</TableCell>
                    <TableCell align="right" className={styles.portionCell}>
                      {row.portion}
                    </TableCell>
                    <TableCell align="center">
                      <span
                        className={`${styles.statusText} ${
                          row.status === "COMPLETED"
                            ? styles.status_success
                            : styles.status_warning
                        }`}
                      >
                        {row.statusLabel}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết" arrow>
                        <IconButton
                          size="small"
                          className={styles.actionIconBtn}
                          aria-label={"Xem chi tiết " + row.dishName}
                          onClick={() =>
                            navigate(
                              ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(
                                ":id",
                                row.id,
                              ),
                            )
                          }
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
            {batches.map((row) => (
              <div
                key={row.id}
                className={styles.mobileCardItem}
                onClick={() =>
                  navigate(
                    ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", row.id),
                  )
                }
              >
                {/* Hàng 1: Tên món ăn + Trạng thái */}
                <div className={styles.topRow}>
                  <div className={styles.titleWithIcon}>
                    <span className={styles.itemIcon} aria-hidden="true">
                      <UtensilsCrossed size={14} />
                    </span>
                    <Typography className={styles.dishTitle}>
                      {row.dishName}
                    </Typography>
                  </div>

                  <span
                    className={`${styles.mobileStatusBadge} ${
                      row.status === "COMPLETED"
                        ? styles.status_success
                        : styles.status_warning
                    }`}
                  >
                    {row.statusLabel}
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
                    aria-label={"Xem chi tiết " + row.dishName}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(
                        ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(
                          ":id",
                          row.id,
                        ),
                      )
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
  )
}

export default RecentCookingBatches
