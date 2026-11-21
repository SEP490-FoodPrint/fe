import React from "react"
import { DRY_MIN_SHELF_DAYS, vietnamDateAfterDays, vietnamToday } from "src/utils/lotDates"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { CircularProgress } from "@mui/material"
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
  MATCH: { className: "totalMatch", hint: "Đủ khối lượng" },
  UNDER: { className: "totalUnder", hint: "Thiếu" },
  OVER: { className: "totalOver", hint: "Thừa" },
  INVALID: { className: "totalInvalid", hint: "Chưa nhập đủ khối lượng" },
}

/**
 * Gắn cơ sở nguồn cung cho từng nguyên liệu của đơn theo yêu cầu.
 * Mỗi nguyên liệu là 1 dòng; phần nguồn cung có thể tách nhiều dòng con
 * (mỗi cơ sở + khối lượng giao là 1 lô riêng). Cột "Tổng" đối chiếu với khối lượng trường cần.
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>
            <span>{"Cơ sở nguồn cung theo nguyên liệu "}</span>
            <span className={styles.requiredMark}>*</span>
          </span>
          <span className={styles.helperText}>
            Một nguyên liệu có thể lấy từ nhiều cơ sở. Tổng khối lượng giao phải
            bằng khối lượng trường yêu cầu.
          </span>
        </div>

        <span
          className={`${styles.counterChip} ${
            items.length > 0 && matchedCount === items.length
              ? styles.counterReady
              : ""
          }`}
        >
          {`${matchedCount}/${items.length} đủ khối lượng`}
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
            <Link
              to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
              className={styles.inlineLink}
            >
              Cơ sở nguồn cung
            </Link>{" "}
            trước khi tạo đơn giao.
          </span>
        </div>
      ) : (
        <>
          {items.length > 1 && onApplyAll && (
            <div className={styles.bulkBar}>
              <label
                htmlFor="bulk-source-facility-select"
                className={styles.bulkLabel}
              >
                Áp dụng nhanh cho nguyên liệu 1 nguồn
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="bulk-source-facility-select"
                  value=""
                  disabled={disabled}
                  onChange={event => {
                    const value = event.target.value
                    if (value) {
                      onApplyAll(value)
                    }
                  }}
                  className={styles.selectControl}
                >
                  <option value="">-- Chọn cùng một cơ sở nguồn cung --</option>
                  {sourceFacilityOptions.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {formatSourceFacilityLabel(fac)}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDown
                  className={styles.selectChevron}
                  aria-hidden="true"
                />
              </div>
            </div>
          )}

          <div className={styles.table} role="table" aria-label="Phân bổ cơ sở nguồn cung">
            <div className={styles.tableHead} role="row">
              <span role="columnheader">Nguyên liệu</span>
              <span role="columnheader">Cơ sở nguồn cung &amp; khối lượng giao</span>
              <span role="columnheader" className={styles.totalHead}>
                Tổng
              </span>
            </div>

            {items.map((item, idx) => {
              const allocations = allocationsByItemId?.[item.id] || []
              const itemError = sourceErrors?.[item.id] || ""
              const isDryStock = item.handlingType === "DRY_STOCK"
              const unit = item.unit || ""
              const summary = getAllocationTotalStatus(
                item.requestedQuantity,
                allocations,
              )
              const statusMeta = TOTAL_STATUS_META[summary.status]
              const canAddMore =
                allocations.length < sourceFacilityOptions.length

              return (
                <div
                  key={item.id || idx}
                  className={styles.itemRow}
                  role="row"
                >
                  <div className={styles.itemMeta} role="cell">
                    <span className={styles.itemName}>
                      {`${idx + 1}. ${item.ingredientName}`}
                    </span>
                    <span className={styles.qtyChip}>
                      {`Cần: ${formatQuantityVi(item.requestedQuantity)} ${unit}`.trim()}
                    </span>
                    {isDryStock && (
                      <span className={styles.dryChip}>Đồ lưu kho</span>
                    )}
                    {item.note && (
                      <p className={styles.itemNote}>{`Ghi chú: ${item.note}`}</p>
                    )}
                  </div>

                  <div className={styles.allocationCol} role="cell">
                    {allocations.map((row, rowIdx) => {
                      const rowErrors = allocationErrors?.[row.key] || {}
                      const lotDateError = lotDateErrors?.[row.key] || ""
                      const usedByOthers = new Set(
                        allocations
                          .filter(other => other.key !== row.key)
                          .map(other => normalizeOptionId(other.sourceFacilityId))
                          .filter(Boolean),
                      )
                      const selectId = `request-source-${item.id || idx}-${rowIdx}`
                      const qtyId = `request-qty-${item.id || idx}-${rowIdx}`

                      return (
                        <div key={row.key} className={styles.allocationRow}>
                          <div className={styles.allocationMain}>
                            <div className={styles.selectCol}>
                              <div className={styles.selectWrap}>
                                <select
                                  id={selectId}
                                  value={String(row.sourceFacilityId || "")}
                                  disabled={disabled}
                                  aria-label={`Cơ sở nguồn cung ${rowIdx + 1} cho ${item.ingredientName}`}
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
                                  }`}
                                >
                                  <option value="">-- Chọn cơ sở nguồn cung --</option>
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
                              {rowErrors.sourceFacilityId && (
                                <p className={styles.errorText} role="alert">
                                  {rowErrors.sourceFacilityId}
                                </p>
                              )}
                            </div>

                            <div className={styles.qtyCol}>
                              <div className={styles.qtyWrap}>
                                <input
                                  id={qtyId}
                                  type="text"
                                  inputMode="decimal"
                                  value={row.actualQuantity ?? ""}
                                  disabled={disabled}
                                  placeholder="0"
                                  aria-label={`Khối lượng giao từ nguồn ${rowIdx + 1} cho ${item.ingredientName}`}
                                  aria-invalid={Boolean(rowErrors.actualQuantity)}
                                  onChange={event =>
                                    onChangeAllocation?.(
                                      item.id,
                                      row.key,
                                      "actualQuantity",
                                      event.target.value,
                                    )
                                  }
                                  className={`${styles.qtyControl} ${
                                    rowErrors.actualQuantity ? styles.hasError : ""
                                  }`}
                                />
                                {unit && <span className={styles.qtyUnit}>{unit}</span>}
                              </div>
                              {rowErrors.actualQuantity && (
                                <p className={styles.errorText} role="alert">
                                  {rowErrors.actualQuantity}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              className={styles.removeBtn}
                              disabled={disabled || allocations.length <= 1}
                              aria-label={`Xoá nguồn ${rowIdx + 1} của ${item.ingredientName}`}
                              onClick={() => onRemoveAllocation?.(item.id, row.key)}
                            >
                              <DeleteOutlined fontSize="small" />
                            </button>
                          </div>

                          {isDryStock && (
                            <div className={styles.lotDates}>
                              <label className={styles.lotDateField}>
                                <span>
                                  Ngày sản xuất <span className={styles.requiredMark}>*</span>
                                </span>
                                <input
                                  type="date"
                                  value={row.manufactureDate || ""}
                                  max={vietnamToday()}
                                  disabled={disabled}
                                  onChange={event =>
                                    onChangeAllocation?.(
                                      item.id,
                                      row.key,
                                      "manufactureDate",
                                      event.target.value,
                                    )
                                  }
                                  className={`${styles.dateControl} ${lotDateError ? styles.hasError : ""}`}
                                />
                              </label>
                              <label className={styles.lotDateField}>
                                <span>
                                  Hạn sử dụng <span className={styles.requiredMark}>*</span>
                                </span>
                                <input
                                  type="date"
                                  value={row.expiryDate || ""}
                                  min={vietnamDateAfterDays(DRY_MIN_SHELF_DAYS)}
                                  disabled={disabled}
                                  onChange={event =>
                                    onChangeAllocation?.(
                                      item.id,
                                      row.key,
                                      "expiryDate",
                                      event.target.value,
                                    )
                                  }
                                  className={`${styles.dateControl} ${lotDateError ? styles.hasError : ""}`}
                                />
                              </label>
                              {lotDateError && (
                                <p className={styles.errorText} role="alert">
                                  {lotDateError}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <button
                      type="button"
                      className={styles.addBtn}
                      disabled={disabled || !canAddMore}
                      onClick={() => onAddAllocation?.(item.id)}
                    >
                      <Add fontSize="small" />
                      <span>Thêm nguồn cung</span>
                    </button>

                    {itemError && (
                      <p className={styles.errorText} role="alert">
                        {itemError}
                      </p>
                    )}
                  </div>

                  <div
                    className={`${styles.totalCol} ${styles[statusMeta.className]}`}
                    role="cell"
                    aria-live="polite"
                  >
                    <span className={styles.totalValue}>
                      {`${formatQuantityVi(thousandthsToQuantity(summary.allocated))} / ${formatQuantityVi(item.requestedQuantity)} ${unit}`.trim()}
                    </span>
                    <span className={styles.totalHint}>
                      {summary.status === "UNDER" || summary.status === "OVER"
                        ? `${statusMeta.hint} ${formatQuantityVi(thousandthsToQuantity(summary.difference))} ${unit}`.trim()
                        : statusMeta.hint}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
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
