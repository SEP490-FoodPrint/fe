import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
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
} from "@mui/material";
import ROUTER from "src/router/ROUTER";
import styles from "./CookingBatchesTable.module.scss";

export default function CookingBatchesTable({
  rows = [],
  pagination,
  loading,
  error,
  onRetry,
  onPageChange,
  onPageSizeChange,
}) {
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const { page, limit, totalItems, totalPages } = pagination;

  const statusBadge = (row, mobile = false) => (
    <span
      className={`${mobile ? styles.mobileStatusBadge : styles.statusBadge} ${styles[`status_${row.statusType}`]}`}
    >
      <span>{row.statusLabel}</span>
    </span>
  );

  const handleViewDetail = (row) => {
    navigate(
      ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", row.id || row.code),
    );
  };

  const renderActions = (row, mobile = false) => {
    if (mobile) {
      return (
        <div
          className={styles.mobileActionBox}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Xem chi tiết" arrow>
            <IconButton
              size="small"
              className={styles.framelessActionBtn}
              onClick={() => handleViewDetail(row)}
              aria-label={`Xem chi tiết ${row.dishName}`}
            >
              <Eye size={18} />
            </IconButton>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className={styles.actionButtonsGroup}>
        <Tooltip title="Xem chi tiết lô chế biến" arrow>
          <IconButton
            size="small"
            className={styles.framelessActionBtn}
            onClick={() => handleViewDetail(row)}
            aria-label={`Xem chi tiết lô ${row.code}`}
          >
            <Eye size={18} />
          </IconButton>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className={styles.tableCard} aria-busy={loading}>
      {loading ? (
        <div style={{ padding: "64px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <FoodPrintLoading size="large" />
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
                  <th scope="col" style={{ width: 130 }}>
                    Mã lô
                  </th>
                  <th scope="col">Món ăn &amp; Ca ăn</th>
                  <th scope="col" style={{ width: 100 }}>
                    Số suất
                  </th>
                  <th scope="col" style={{ width: 130 }}>
                    Trạng thái
                  </th>
                  <th scope="col" style={{ width: 160 }}>
                    Lưu mẫu
                  </th>
                  <th scope="col" className={styles.thActions}>
                    Thao tác
                  </th>
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
                    <td className={styles.portionBold}>{row.portion}</td>
                    <td>{statusBadge(row)}</td>
                    <td>
                      {row.status === "COMPLETED" ? (
                        row.hasSample ? (
                          <span
                            className={`${styles.samplePill} ${styles.sampleDone}`}
                          >
                            <Check size={13} aria-hidden="true" />
                            <span>Đã lưu mẫu (24h)</span>
                          </span>
                        ) : (
                          <span
                            className={`${styles.samplePill} ${styles.samplePending}`}
                          >
                            <AlertCircle size={13} aria-hidden="true" />
                            <span>Chưa lưu mẫu</span>
                          </span>
                        )
                      ) : (
                        <span className={styles.sampleMuted}>—</span>
                      )}
                    </td>
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
                    <span className={styles.mobileDishName}>
                      {row.dishName}
                    </span>
                    <span className={styles.mobileBatchCode}>{row.code}</span>
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
                    {row.status === "COMPLETED" && (
                      <>
                        <span className={styles.metaDot}>•</span>
                        <span
                          className={`${styles.mobileSampleBadge} ${row.hasSample ? styles.sampleDone : styles.samplePending}`}
                        >
                          {row.hasSample ? "Đã lưu 24h" : "Chưa lưu mẫu"}
                        </span>
                      </>
                    )}
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
              <dt>Số suất</dt>
              <dd>{selectedBatch?.portion}</dd>
            </div>
            <div>
              <dt>Trạng thái</dt>
              <dd>{selectedBatch?.statusLabel}</dd>
            </div>
            <div>
              <dt>Lưu mẫu</dt>
              <dd>{selectedBatch?.sampleLabel || "Chưa lưu mẫu"}</dd>
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
  );
}
