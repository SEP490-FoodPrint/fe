import React from "react"
import { DRY_MIN_SHELF_DAYS, vietnamDateAfterDays, vietnamToday } from "src/utils/lotDates"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { CircularProgress, Tooltip } from "@mui/material"
import { Add, DeleteOutlined, KeyboardArrowDown } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatQuantityVi,
  formatSourceFacilityLabel,
  getAllocationTotalStatus,
  normalizeOptionId,
  thousandthsToQuantity,
} from "src/services/SupplierDeliveryService"
import styles from "./RequestSourcesAssigner.module.scss"

const TOTAL_STATUS_META = {
  MATCH: { className: "totalMatch", hint: "Đủ" },
  UNDER: { className: "totalUnder", hint: "Thiếu" },
  OVER: { className: "totalOver", hint: "Thừa" },
  INVALID: { className: "totalInvalid", hint: "Chưa nhập" },
}

/**
 * Gắn cơ sở nguồn cung cho từng nguyên liệu của đơn theo yêu cầu.
 * Bảng nhóm: mỗi nguyên liệu là 1 dòng tiêu đề (tên, khối lượng đã gắn / cần, tình trạng),
 * bên dưới là các dòng nguồn cung thẳng cột (mỗi cơ sở + khối lượng giao là 1 lô riêng).
 * Cột NSX / HSD chỉ hiện khi đơn có đồ lưu kho.
 */
function RequestSourcesAssigner({
  items = [],
  allocationsByItemId = {},
  sourceFacilityOptions = [],
  loadingFacilities = false,
  facilitiesError = "",
  fieldError = "",
  sourceErrors = {},
  allocationErrors = {},
  lotDateErrors = {},
  disabled = false,
  onChangeAllocation,
  onAddAllocation,
  onRemoveAllocation,
  onApplyAll,
}) {
  const matchedCount = items.reduce((count, item) => {
    const summary = getAllocationTotalStatus(
      item.requestedQuantity,
      allocationsByItemId?.[item.id],
    )
    const allAssigned = (allocationsByItemId?.[item.id] || []).every(row =>
      String(row?.sourceFacilityId || "").trim(),
    )
    return summary.status === "MATCH" && allAssigned ? count + 1 : count
  }, 0)
  const hasDryStock = items.some(item => item.handlingType === "DRY_STOCK")
  const gridClass = hasDryStock ? styles.gridWithDates : styles.gridNoDates
  const allReady = items.length > 0 && matchedCount === items.length

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>
            {"Cơ sở nguồn cung theo nguyên liệu "}
            <span className={styles.requiredMark}>*</span>
          </span>
          <span className={styles.helperText}>
            Một nguyên liệu có thể lấy từ nhiều cơ sở; tổng khối lượng giao phải bằng khối
            lượng trường yêu cầu.
          </span>
        </div>
        <span
          className={`${styles.counter} ${allReady ? styles.counterReady : ""}`}
          aria-live="polite"
        >
          {`${matchedCount}/${items.length} nguyên liệu đã đủ`}
        </span>
      </div>

      {facilitiesError && (
        <p className={styles.errorText} role="alert">
          {facilitiesError}
        </p>
      )}

      {loadingFacilities ? (
        <div className={styles.loadingState} role="status">
          <CircularProgress size={16} />
          <span>Đang tải danh sách cơ sở nguồn cung...</span>
        </div>
      ) : sourceFacilityOptions.length === 0 ? (
        <div className={styles.emptyNotice} role="alert">
          <span>
            Chưa có cơ sở nguồn cung đang hoạt động. Vui lòng thiết lập tại{" "}
            <Link to={ROUTER.SUPPLIER_SOURCE_FACILITIES} className={styles.inlineLink}>
              Cơ sở nguồn cung
            </Link>{" "}
            trước khi tạo đơn giao.
          </span>
        </div>
      ) : (
        <div className={styles.table} role="table" aria-label="Phân bổ cơ sở nguồn cung">
          {items.length > 1 && onApplyAll && (
            <div className={styles.bulkBar}>
              <label htmlFor="bulk-source-facility-select" className={styles.bulkLabel}>
                Gắn nhanh một cơ sở cho các nguyên liệu chưa tách nguồn
              </label>
              <div className={`${styles.selectWrap} ${styles.bulkSelect}`}>
                <select
                  id="bulk-source-facility-select"
                  value=""
                  disabled={disabled}
                  onChange={event => {
                    if (event.target.value) onApplyAll(event.target.value)
                  }}
                  className={`${styles.selectControl} ${styles.isPlaceholder}`}
                >
                  <option value="">Chọn cơ sở nguồn cung</option>
                  {sourceFacilityOptions.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {formatSourceFacilityLabel(fac)}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDown className={styles.selectChevron} aria-hidden="true" />
              </div>
            </div>
          )}

          <div className={`${styles.tableHead} ${gridClass}`} role="row">
            <span role="columnheader">Cơ sở nguồn cung</span>
            {hasDryStock && <span role="columnheader">Ngày sản xuất</span>}
            {hasDryStock && <span role="columnheader">Hạn sử dụng</span>}
            <span role="columnheader" className={styles.alignRight}>
              Khối lượng giao
            </span>
            <span aria-hidden="true" />
          </div>

          {items.map((item, idx) => {
            const allocations = allocationsByItemId?.[item.id] || []
            const itemError = sourceErrors?.[item.id] || ""
            const isDryStock = item.handlingType === "DRY_STOCK"
            const unit = item.unit || ""
            const summary = getAllocationTotalStatus(item.requestedQuantity, allocations)
            const statusMeta = TOTAL_STATUS_META[summary.status]
            const canAddMore = allocations.length < sourceFacilityOptions.length
            const statusText =
              summary.status === "UNDER" || summary.status === "OVER"
                ? `${statusMeta.hint} ${formatQuantityVi(thousandthsToQuantity(summary.difference))} ${unit}`.trim()
                : statusMeta.hint

            return (
              <div key={item.id || idx} className={styles.itemGroup} role="rowgroup">
                <div className={styles.itemHead} role="row">
                  <div className={styles.itemTitle} role="cell">
                    <span className={styles.itemIndex}>{idx + 1}</span>
                    <span className={styles.itemName}>{item.ingredientName}</span>
                    {isDryStock && <span className={styles.dryTag}>Đồ lưu kho</span>}
                  </div>
                  <div
                    className={`${styles.itemTotal} ${styles[statusMeta.className]}`}
                    role="cell"
                    aria-live="polite"
                  >
                    <span className={styles.totalValue}>
                      {`${formatQuantityVi(thousandthsToQuantity(summary.allocated))} / ${formatQuantityVi(item.requestedQuantity)} ${unit}`.trim()}
                    </span>
                    <span className={styles.totalStatus}>
                      <span className={styles.statusDot} aria-hidden="true" />
                      {statusText}
                    </span>
                  </div>
                  {item.note && <p className={styles.itemNote}>{`Ghi chú: ${item.note}`}</p>}
                </div>

                {allocations.map((row, rowIdx) => {
                  const rowErrors = allocationErrors?.[row.key] || {}
                  const lotDateError = lotDateErrors?.[row.key] || ""
                  const usedByOthers = new Set(
                    allocations
                      .filter(other => other.key !== row.key)
                      .map(other => normalizeOptionId(other.sourceFacilityId))
                      .filter(Boolean),
                  )
                  const rowLabel = `nguồn ${rowIdx + 1} của ${item.ingredientName}`
                  const rowMessages = [
                    rowErrors.sourceFacilityId,
                    rowErrors.actualQuantity,
                    lotDateError,
                  ].filter(Boolean)

                  return (
                    <div key={row.key} className={styles.allocationRow} role="row">
                      <div className={`${styles.allocationGrid} ${gridClass}`}>
                        <div
                          className={`${styles.selectWrap} ${styles.cellFacility}`}
                          role="cell"
                        >
                          <select
                            value={String(row.sourceFacilityId || "")}
                            disabled={disabled}
                            aria-label={`Cơ sở nguồn cung ${rowLabel}`}
                            aria-invalid={Boolean(rowErrors.sourceFacilityId)}
                            onChange={event =>
                              onChangeAllocation?.(
                                item.id,
                                row.key,
                                "sourceFacilityId",
                                event.target.value,
                              )
                            }
                            className={`${styles.selectControl} ${
                              rowErrors.sourceFacilityId ? styles.hasError : ""
                            } ${row.sourceFacilityId ? "" : styles.isPlaceholder}`}
                          >
                            <option value="">Chọn cơ sở nguồn cung</option>
                            {sourceFacilityOptions.map(fac => (
                              <option
                                key={fac.id}
                                value={fac.id}
                                disabled={usedByOthers.has(normalizeOptionId(fac.id))}
                              >
                                {formatSourceFacilityLabel(fac)}
                              </option>
                            ))}
                          </select>
                          <KeyboardArrowDown
                            className={styles.selectChevron}
                            aria-hidden="true"
                          />
                        </div>

                        {hasDryStock &&
                          (isDryStock ? (
                            <>
                              <label
                                className={`${styles.dateCell} ${styles.cellMfg}`}
                                role="cell"
                              >
                                <span className={styles.mobileLabel}>Ngày sản xuất</span>
                                <input
                                  type="date"
                                  value={row.manufactureDate || ""}
                                  max={vietnamToday()}
                                  disabled={disabled}
                                  aria-label={`Ngày sản xuất ${rowLabel}`}
                                  onChange={event =>
                                    onChangeAllocation?.(
                                      item.id,
                                      row.key,
                                      "manufactureDate",
                                      event.target.value,
                                    )
                                  }
                                  className={`${styles.inputControl} ${
                                    lotDateError ? styles.hasError : ""
                                  }`}
                                />
                              </label>
                              <label
                                className={`${styles.dateCell} ${styles.cellExp}`}
                                role="cell"
                              >
                                <span className={styles.mobileLabel}>Hạn sử dụng</span>
                                <input
                                  type="date"
                                  value={row.expiryDate || ""}
                                  min={vietnamDateAfterDays(DRY_MIN_SHELF_DAYS)}
                                  disabled={disabled}
                                  aria-label={`Hạn sử dụng ${rowLabel}`}
                                  onChange={event =>
                                    onChangeAllocation?.(
                                      item.id,
                                      row.key,
                                      "expiryDate",
                                      event.target.value,
                                    )
                                  }
                                  className={`${styles.inputControl} ${
                                    lotDateError ? styles.hasError : ""
                                  }`}
                                />
                              </label>
                            </>
                          ) : (
                            <span
                              className={`${styles.notApplicable} ${styles.cellDates}`}
                              role="cell"
                            >
                              Không cần NSX/HSD
                            </span>
                          ))}

                        <div className={`${styles.qtyWrap} ${styles.cellQty}`} role="cell">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={row.actualQuantity ?? ""}
                            disabled={disabled}
                            placeholder="0"
                            aria-label={`Khối lượng giao ${rowLabel}`}
                            aria-invalid={Boolean(rowErrors.actualQuantity)}
                            onChange={event =>
                              onChangeAllocation?.(
                                item.id,
                                row.key,
                                "actualQuantity",
                                event.target.value,
                              )
                            }
                            className={`${styles.inputControl} ${styles.qtyControl} ${
                              rowErrors.actualQuantity ? styles.hasError : ""
                            }`}
                          />
                          {unit && <span className={styles.qtyUnit}>{unit}</span>}
                        </div>

                        <div className={styles.cellRemove} role="cell">
                          {allocations.length > 1 && (
                            <Tooltip title="Xoá nguồn này">
                              <span>
                                <button
                                  type="button"
                                  className={styles.removeBtn}
                                  disabled={disabled}
                                  aria-label={`Xoá ${rowLabel}`}
                                  onClick={() => onRemoveAllocation?.(item.id, row.key)}
                                >
                                  <DeleteOutlined fontSize="small" />
                                </button>
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      {rowMessages.map(message => (
                        <p key={message} className={styles.errorText} role="alert">
                          {message}
                        </p>
                      ))}
                    </div>
                  )
                })}

                <div className={styles.itemFoot}>
                  <button
                    type="button"
                    className={styles.addBtn}
                    disabled={disabled || !canAddMore}
                    onClick={() => onAddAllocation?.(item.id)}
                  >
                    <Add fontSize="small" />
                    <span>Thêm cơ sở nguồn cung</span>
                  </button>
                  {itemError && (
                    <p className={styles.errorText} role="alert">
                      {itemError}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {fieldError && (
        <p className={styles.errorText} role="alert">
          {fieldError}
        </p>
      )}
    </div>
  )
}

const allocationShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  sourceFacilityId: PropTypes.string,
  actualQuantity: PropTypes.string,
  manufactureDate: PropTypes.string,
  expiryDate: PropTypes.string,
})

RequestSourcesAssigner.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      ingredientName: PropTypes.string,
      requestedQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      unit: PropTypes.string,
      note: PropTypes.string,
      handlingType: PropTypes.string,
    }),
  ),
  allocationsByItemId: PropTypes.objectOf(PropTypes.arrayOf(allocationShape)),
  sourceFacilityOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      facilityCode: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  loadingFacilities: PropTypes.bool,
  facilitiesError: PropTypes.string,
  fieldError: PropTypes.string,
  sourceErrors: PropTypes.object,
  allocationErrors: PropTypes.object,
  lotDateErrors: PropTypes.object,
  disabled: PropTypes.bool,
  onChangeAllocation: PropTypes.func,
  onAddAllocation: PropTypes.func,
  onRemoveAllocation: PropTypes.func,
  onApplyAll: PropTypes.func,
}

export default RequestSourcesAssigner
