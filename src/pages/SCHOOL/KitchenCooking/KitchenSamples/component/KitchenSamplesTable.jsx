import React from "react"
import PropTypes from "prop-types"
import { Eye, Trash2, Edit3, ArrowUpRight } from "lucide-react"
import { get24hRetainedStatus, formatSampleDateTime } from "../mockSamplesData"
import styles from "./KitchenSamplesTable.module.scss"

export default function KitchenSamplesTable({
  samples = [],
  onViewDetail,
  onOpenDisposeModal,
  onOpenUpdateModal,
  onNavigateBatch,
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsiveWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Tên món ăn</th>
              <th className={styles.th}>Bữa ăn</th>
              <th className={styles.th}>Thời điểm lấy mẫu</th>
              <th className={styles.th}>Thời gian lưu 24h</th>
              <th className={styles.th}>Khối lượng</th>
              <th className={styles.th}>Vị trí lưu</th>
              <th className={styles.th}>Trạng thái</th>
              <th className={`${styles.th} ${styles.thActions}`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((row) => {
              const info24h = get24hRetainedStatus(row.sampledAt, row.status)
              const timeDisplay = formatSampleDateTime(row.sampledAt)

              return (
                <tr
                  key={row.id}
                  className={`${styles.tr} ${
                    info24h.isReadyToDispose ? styles.trWarning : ""
                  }`}
                  onClick={() => onViewDetail(row)}
                >
                  {/* 1. Tên món ăn & Mã lô nấu phía dưới */}
                  <td className={styles.td}>
                    <div className={styles.dishCol}>
                      <span className={styles.dishName}>{row.dishName}</span>
                      <button
                        type="button"
                        className={styles.batchSubCode}
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigateBatch(row.cookingBatchId)
                        }}
                        title="Xem chi tiết lô chế biến"
                      >
                        <span>{row.batchCode || row.cookingBatchId}</span>
                        <ArrowUpRight size={11} />
                      </button>
                    </div>
                  </td>

                  {/* 2. Bữa ăn */}
                  <td className={styles.td}>
                    <span
                      className={`${styles.mealBadge} ${
                        row.mealType === "AFTERNOON"
                          ? styles.mealAfternoon
                          : styles.mealLunch
                      }`}
                    >
                      {row.mealLabel || (row.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa")}
                    </span>
                  </td>

                  {/* 3. Thời điểm lấy mẫu */}
                  <td className={styles.td}>
                    <div className={styles.timeCol}>
                      <span className={styles.timeBold}>{timeDisplay.time}</span>
                      <span className={styles.dateMuted}>{timeDisplay.date}</span>
                    </div>
                  </td>

                  {/* 4. Thời gian lưu 24h */}
                  <td className={styles.td}>
                    <div className={styles.countdownCol}>
                      <div className={styles.countdownHeader}>
                        <span
                          className={`${styles.countdownText} ${
                            info24h.isReadyToDispose
                              ? styles.countdownReady
                              : info24h.isDisposed
                              ? styles.countdownDisposed
                              : styles.countdownActive
                          }`}
                        >
                          {info24h.timeText}
                        </span>
                        {!info24h.isDisposed && (
                          <span className={styles.countdownPercent}>
                            {info24h.percent}%
                          </span>
                        )}
                      </div>
                      <div className={styles.progressBarBg}>
                        <div
                          className={`${styles.progressBarFill} ${
                            info24h.isReadyToDispose
                              ? styles.fillWarning
                              : info24h.isDisposed
                              ? styles.fillMuted
                              : styles.fillPrimary
                          }`}
                          style={{ width: `${info24h.percent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 5. Khối lượng */}
                  <td className={styles.td}>
                    <div className={styles.qtyCol}>
                      <span className={styles.qtyText}>
                        <strong>{row.quantity}</strong> {row.unit}
                      </span>
                    </div>
                  </td>

                  {/* 6. Vị trí lưu */}
                  <td className={styles.td}>
                    <div className={styles.storageLoc}>
                      <span className={styles.storageText}>
                        {row.storageLocation || "Tủ lưu mẫu"}
                      </span>
                    </div>
                  </td>

                  {/* 7. Trạng thái */}
                  <td className={styles.td}>
                    {info24h.isDisposed ? (
                      <span className={styles.badgeDisposed}>
                        <span className={styles.statusDotMuted} />
                        <span>Đã tiêu hủy</span>
                      </span>
                    ) : info24h.isReadyToDispose ? (
                      <span className={styles.badgeReady}>
                        <span className={styles.statusDotWarning} />
                        <span>Đã đủ 24 giờ</span>
                      </span>
                    ) : (
                      <span className={styles.badgeStored}>
                        <span className={styles.statusDotPrimary} />
                        <span>Đang lưu mẫu</span>
                      </span>
                    )}
                  </td>

                  {/* 9. Thao tác */}
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <div
                      className={styles.actionGroup}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Nút Xem chi tiết */}
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        onClick={() => onViewDetail(row)}
                        title="Xem chi tiết mẫu lưu"
                        aria-label="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Nút Cập nhật nếu mẫu đang lưu */}
                      {row.status === "STORED" && (
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => onOpenUpdateModal(row)}
                          title="Cập nhật thông tin mẫu lưu"
                          aria-label="Cập nhật"
                        >
                          <Edit3 size={15} />
                        </button>
                      )}

                      {/* Nút Tiêu hủy nếu mẫu đang lưu */}
                      {row.status === "STORED" && (
                        <button
                          type="button"
                          className={`${styles.disposeIconBtn} ${
                            info24h.isReadyToDispose ? styles.disposeIconBtnHighlight : ""
                          }`}
                          onClick={() => onOpenDisposeModal(row)}
                          title={
                            info24h.isReadyToDispose
                              ? "Đã đủ 24h - Tiêu hủy mẫu lưu ngay"
                              : "Ghi nhận tiêu hủy mẫu lưu"
                          }
                          aria-label="Tiêu hủy mẫu lưu"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

KitchenSamplesTable.propTypes = {
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDetail: PropTypes.func.isRequired,
  onOpenDisposeModal: PropTypes.func.isRequired,
  onOpenUpdateModal: PropTypes.func.isRequired,
  onNavigateBatch: PropTypes.func.isRequired,
}
