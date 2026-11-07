import React from "react"
import { useNavigate } from "react-router-dom"
import { Button, Tooltip, IconButton } from "@mui/material"
import { Trash2, Check, Clock, Eye, FlaskConical } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenSamplesTable.module.scss"

export default function KitchenSamplesTable({
  samples = [],
  onOpenDisposeModal,
}) {
  const navigate = useNavigate()

  const formatDateTime = (val) => {
    if (!val) return "—"
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  if (samples.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <FlaskConical size={36} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Chưa có mẫu lưu thực phẩm nào</h3>
        <p className={styles.emptyDesc}>
          Mẫu lưu sẽ được ghi nhận tại trang chi tiết lô chế biến sau khi hoàn
          thành nấu.
        </p>
        <Button
          variant="contained"
          className={styles.emptyBtn}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
        >
          Xem danh sách lô chế biến
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.tableCard}>
      {/* 1. Desktop Table (>= 640px) */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Mã mẫu lưu</th>
              <th className={styles.th}>Lô chế biến</th>
              <th className={styles.th}>Lượng mẫu</th>
              <th className={styles.th}>Vị trí bảo quản</th>
              <th className={styles.th}>Thời điểm lấy mẫu</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={styles.th} style={{ textAlign: "right" }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {samples.map((row) => (
              <tr key={row.id}>
                <td className={styles.tdCode}>
                  SMP-{row.id.slice(0, 8).toUpperCase()}
                </td>
                <td className={styles.td}>
                  <Button
                    variant="text"
                    size="small"
                    className={styles.viewBatchLink}
                    onClick={() =>
                      navigate(
                        ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(
                          ":id",
                          row.cookingBatchId,
                        ),
                      )
                    }
                  >
                    Xem mẻ nấu
                  </Button>
                </td>
                <td className={styles.td}>
                  <strong>{row.quantity}</strong> {row.unit}
                </td>
                <td className={styles.td}>{row.storageLocation}</td>
                <td className={styles.td}>{formatDateTime(row.sampledAt)}</td>
                <td className={styles.td}>
                  {row.status === "STORED" ? (
                    <span className={styles.statusStored}>
                      <Clock size={12} />
                      Đang lưu (24h)
                    </span>
                  ) : (
                    <span className={styles.statusDisposed}>
                      <Check size={12} />
                      Đã tiêu hủy
                    </span>
                  )}
                </td>
                <td className={styles.td} style={{ textAlign: "right" }}>
                  {row.status === "STORED" && (
                    <button
                      type="button"
                      className={styles.disposeBtn}
                      onClick={() => onOpenDisposeModal(row)}
                    >
                      <Trash2 size={13} />
                      <span>Hủy mẫu</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Cards List (< 640px, chuẩn Mobile-First Rule 6) */}
      <div className={styles.mobileCardsList} role="list">
        {samples.map((row) => (
          <article
            key={row.id}
            className={styles.mobileSampleCard}
            role="listitem"
          >
            {/* Hàng 1: Lượng mẫu + Vị trí & Trạng thái */}
            <div className={styles.mobileTopRow}>
              <div className={styles.sampleMainInfo}>
                <span className={styles.sampleQtyBold}>
                  {row.quantity} {row.unit}
                </span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.storageLoc}>{row.storageLocation}</span>
              </div>
              {row.status === "STORED" ? (
                <span className={styles.statusStored}>
                  <Clock size={11} />
                  Đang lưu
                </span>
              ) : (
                <span className={styles.statusDisposed}>
                  <Check size={11} />
                  Đã hủy
                </span>
              )}
            </div>

            {/* Hàng 2: Thời gian + Nút thao tác Icon-First */}
            <div className={styles.mobileBottomRow}>
              <div className={styles.timeScheduleText}>
                {formatDateTime(row.sampledAt)}
              </div>

              <div className={styles.mobileActionGroup}>
                <Tooltip title="Xem chi tiết mẻ nấu" arrow>
                  <IconButton
                    size="small"
                    className={styles.mobileActionBtn}
                    onClick={() =>
                      navigate(
                        ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(
                          ":id",
                          row.cookingBatchId,
                        ),
                      )
                    }
                    aria-label="Xem chi tiết mẻ nấu"
                  >
                    <Eye size={16} />
                  </IconButton>
                </Tooltip>

                {row.status === "STORED" && (
                  <Tooltip title="Tiêu hủy mẫu" arrow>
                    <IconButton
                      size="small"
                      className={styles.mobileDisposeBtn}
                      onClick={() => onOpenDisposeModal(row)}
                      aria-label="Tiêu hủy mẫu lưu"
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

