import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Split,
} from "lucide-react"
import {
  Alert,
  Button,
  Tooltip,
  IconButton,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./CookingBatchesTable.module.scss"

export default function CookingBatchesTable({
  rows = [],
  pagination,
  loading,
  error,
  onRetry,
  onPageChange,
  onPageSizeChange,
}) {
  const navigate = useNavigate()
  const [selectedBatch, setSelectedBatch] = useState(null)
  const { page, limit, totalItems, totalPages } = pagination
  const methodClass = (row) =>
    row.methodType === "separate"
      ? styles.methodSeparate
      : row.methodType === "common"
        ? styles.methodCommon
        : styles.methodUnknown
  const methodIcon = (row, size = 14) =>
    row.methodType === "separate" ? (
      <Split size={size} aria-hidden="true" />
    ) : (
      <Utensils size={size} aria-hidden="true" />
    )
  const statusBadge = (row, mobile = false) => (
    <span
      className={`${mobile ? styles.mobileStatusBadge : styles.statusBadge} ${styles[`status_${row.statusType}`]}`}
    >
      <span>{row.statusLabel}</span>
    </span>
  )

  const handleViewDetail = (row) => {
    navigate(
      ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", row.id || row.code),
    )
  }

  const handleEditBatch = (row) => {
    navigate(
      ROUTER.SCHOOL_KITCHEN_BATCH_EDIT.replace(":id", row.id || row.code),
    )
  }

  const renderActions = (row, mobile = false) => {
    const canEdit = row.status === "UNCONFIRMED"
    const editDisabledTooltip =
      row.status === "CONFIRMED"
        ? "Lô đã xác nhận chế biến, không thể chỉnh sửa"
        : row.status === "COMPLETED"
          ? "Lô đã hoàn thành chế biến, không thể chỉnh sửa"
          : "Chỉnh sửa lô chế biến"

    if (mobile) {
      return (
        <div className={styles.mobileActionBox} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem chi tiết" arrow>
            <IconButton
              size="small"
              className={styles.mobileActionIconBtn}
              onClick={() => handleViewDetail(row)}
              aria-label={`Xem chi tiết ${row.dishName}`}
            >
              <Eye size={16} />
            </IconButton>
          </Tooltip>
          {canEdit && (
            <Tooltip title="Chỉnh sửa lô" arrow>
              <IconButton
                size="small"
                className={styles.mobileEditIconBtn}
                onClick={() => handleEditBatch(row)}
                aria-label={`Chỉnh sửa ${row.dishName}`}
              >
                <Edit3 size={15} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      )
    }

    return (
      <div className={styles.actionButtonsGroup}>
        <Tooltip title="Xem chi tiết lô chế biến" arrow>
          <button
            type="button"
            className={styles.btnActionView}
            onClick={() => handleViewDetail(row)}
            aria-label={`Xem chi tiết lô ${row.code}`}
          >
            <Eye size={14} />
            <span>Chi tiết</span>
          </button>
        </Tooltip>

        <Tooltip title={editDisabledTooltip} arrow>
          <span>
            <button
              type="button"
              className={styles.btnActionEdit}
              disabled={!canEdit}
              onClick={() => handleEditBatch(row)}
              aria-label={`Chỉnh sửa lô ${row.code}`}
            >
              <Edit3 size={14} />
              <span>Sửa</span>
            </button>
          </span>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className={styles.tableCard} aria-busy={loading}>
      {loading ? (
        <div className={styles.listState} role="status">
          <span>Đang tải lô chế biến…</span>
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} variant="rounded" height={60} />
          ))}
        </div>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={onRetry}>
              Tải lại
            </Button>
          }
        >
          {error}
        </Alert>
      ) : rows.length === 0 ? (
        <div className={styles.listState} role="status">
          Không có lô chế biến phù hợp với bộ lọc.
        </div>
      ) : (
        <>
          <div className={styles.desktopTableWrap}>
            <table className={styles.table} aria-label="Danh sách lô chế biến">
              <thead>
                <tr>
                  <th scope="col">Mã lô</th>
                  <th scope="col">Món ăn &amp; Ca ăn</th>
                  <th scope="col">Phương thức</th>
                  <th scope="col">Số suất</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col" className={styles.thActions}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.tdCode}>{row.code}</td>
                    <td>
                      <div className={styles.dishWrap}>
                        <span className={styles.dishName}>{row.dishName}</span>
                        <span className={styles.dishCategory}>
                          {row.timeTag}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.methodBadge} ${methodClass(row)}`}
                      >
                        {methodIcon(row)}
                        <span>{row.methodLabel}</span>
                      </span>
                    </td>
                    <td className={styles.portionBold}>{row.portion}</td>
                    <td>{statusBadge(row)}</td>
                    <td className={styles.tdActions}>{renderActions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className={styles.mobileCardsList}
            role="list"
            aria-label="Danh sách lô chế biến"
          >
            {rows.map((row) => (
              <article
                key={row.id}
                className={styles.mobileBatchCard}
                role="listitem"
                onClick={() => handleViewDetail(row)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.mobileTopRow}>
                  <div className={styles.dishTitleWrap}>
                    <span
                      className={styles.methodIconBox}
                      title={row.methodLabel}
                    >
                      {methodIcon(row)}
                    </span>
                    <span className={styles.mobileDishName}>
                      {row.dishName}
                    </span>
                  </div>
                  {statusBadge(row, true)}
                </div>
                <div className={styles.mobileBottomRow}>
                  <div className={styles.mobileMetaWrap}>
                    <span className={styles.portionHighlight}>
                      {row.portion}
                    </span>
                    <span className={styles.metaDot}>•</span>
                    <span>
                      {row.dateLabel} ·{" "}
                      {row.mealType === "LUNCH"
                        ? "Trưa"
                        : row.mealType === "AFTERNOON"
                          ? "Xế"
                          : "—"}
                    </span>
                    <span
                      className={`${styles.mobileMethod} ${methodClass(row)}`}
                    >
                      {row.methodType === "separate"
                        ? "Nấu riêng"
                        : row.methodLabel}
                    </span>
                  </div>
                  {renderActions(row, true)}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className={styles.paginationBar}>
        <div className={styles.pageInfo}>
          <span>
            {loading
              ? "Đang tải…"
              : error
                ? "Chưa tải được danh sách"
                : `${totalItems.toLocaleString("vi-VN")} lô · ${totalItems ? (page - 1) * limit + 1 : 0}–${Math.min(page * limit, totalItems)}`}
          </span>
          <div className={styles.pageSizeSelect}>
            <span>Xem:</span>
            <select
              value={limit}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Số dòng mỗi trang"
              disabled={loading}
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        </div>
        <div className={styles.pageNav}>
          <IconButton
            className={styles.pageBtn}
            disabled={loading || Boolean(error) || page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </IconButton>
          <span className={styles.pageText}>
            Trang {page}/{totalPages}
          </span>
          <IconButton
            className={styles.pageBtn}
            disabled={loading || Boolean(error) || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Trang tiếp"
          >
            <ChevronRight size={18} />
          </IconButton>
        </div>
      </div>
      <Dialog
        open={Boolean(selectedBatch)}
        onClose={() => setSelectedBatch(null)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="batch-list-detail-title"
      >
        <DialogTitle id="batch-list-detail-title">
          {selectedBatch?.dishName}
        </DialogTitle>
        <DialogContent>
          <dl className={styles.batchFacts}>
            <div>
              <dt>Ngày thực đơn</dt>
              <dd>{selectedBatch?.dateLabel}</dd>
            </div>
            <div>
              <dt>Bữa ăn</dt>
              <dd>{selectedBatch?.mealLabel}</dd>
            </div>
            <div>
              <dt>Phương thức</dt>
              <dd>{selectedBatch?.methodLabel}</dd>
            </div>
            <div>
              <dt>Số suất</dt>
              <dd>{selectedBatch?.portion}</dd>
            </div>
            <div>
              <dt>Trạng thái</dt>
              <dd>{selectedBatch?.statusLabel}</dd>
            </div>
            {selectedBatch?.note && (
              <div className={styles.batchNote}>
                <dt>Ghi chú</dt>
                <dd>{selectedBatch.note}</dd>
              </div>
            )}
          </dl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBatch(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
