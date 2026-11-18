import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import { KeyboardArrowDown } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatQuantityVi,
  formatSourceFacilityLabel,
} from "src/services/SupplierDeliveryService"
import styles from "./RequestSourcesAssigner.module.scss"

function RequestSourcesAssigner({
  items = [],
  sourceByItemId = {},
  sourceFacilityOptions = [],
  loadingFacilities = false,
  facilitiesError = "",
  fieldError = "",
  sourceErrors = {},
  disabled = false,
  onChangeSource,
  onApplyAll,
  lotDatesByItemId = {},
  lotDateErrors = {},
  onChangeLotDate,
}) {
  const assignedCount = items.reduce((count, item) => {
    const val = String(sourceByItemId?.[item.id] || "").trim()
    return val ? count + 1 : count
  }, 0)

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>
            <span>{"Cơ sở nguồn cung theo nguyên liệu "}</span>
            <span className={styles.requiredMark}>*</span>
          </span>
        </div>

        <span
          className={`${styles.counterChip} ${
            items.length > 0 && assignedCount === items.length
              ? styles.counterReady
              : ""
          }`}
        >
          {`${assignedCount}/${items.length} đã gắn`}
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
                Áp dụng nhanh cho tất cả dòng
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="bulk-source-facility-select"
                  defaultValue=""
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

          <ul className={styles.itemsList} aria-label="Phân bổ cơ sở nguồn cung">
            {items.map((item, idx) => {
              const selectedFacilityId = String(sourceByItemId?.[item.id] || "")
              const itemError = sourceErrors?.[item.id] || ""
              const selectId = `request-source-${item.id || idx}`

              return (
                <li key={item.id || idx} className={styles.itemRow}>
                  <div className={styles.itemMeta}>
                    <div className={styles.itemTopLine}>
                      <span className={styles.itemName}>
                        {`${idx + 1}. ${item.ingredientName}`}
                      </span>
                      <span className={styles.qtyChip}>
                        {`${formatQuantityVi(item.requestedQuantity)} ${
                          item.unit || ""
                        }`.trim()}
                      </span>
                    </div>
                    {item.note && (
                      <p className={styles.itemNote}>{`Ghi chú: ${item.note}`}</p>
                    )}
                    {item.handlingType === "DRY_STOCK" && (
                      <div className={styles.lotDates}>
                        <span className={styles.dryChip}>Đồ khô</span>
                        <label className={styles.lotDateField}>
                          <span>
                            Ngày sản xuất <span className={styles.requiredMark}>*</span>
                          </span>
                          <input
                            type="date"
                            value={lotDatesByItemId[item.id]?.manufactureDate || ""}
                            disabled={disabled}
                            onChange={event => onChangeLotDate?.(item.id, "manufactureDate", event.target.value)}
                            className={`${styles.dateControl} ${lotDateErrors[item.id] ? styles.hasError : ""}`}
                          />
                        </label>
                        <label className={styles.lotDateField}>
                          <span>
                            Hạn sử dụng <span className={styles.requiredMark}>*</span>
                          </span>
                          <input
                            type="date"
                            value={lotDatesByItemId[item.id]?.expiryDate || ""}
                            disabled={disabled}
                            onChange={event => onChangeLotDate?.(item.id, "expiryDate", event.target.value)}
                            className={`${styles.dateControl} ${lotDateErrors[item.id] ? styles.hasError : ""}`}
                          />
                        </label>
                        {lotDateErrors[item.id] && (
                          <p className={styles.errorText} role="alert">
                            {lotDateErrors[item.id]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.selectCol}>
                    <div className={styles.selectWrap}>
                      <select
                        id={selectId}
                        value={selectedFacilityId}
                        disabled={disabled}
                        aria-label={`Cơ sở nguồn cung cho ${item.ingredientName}`}
                        aria-invalid={Boolean(itemError)}
                        onChange={event =>
                          onChangeSource?.(item.id, event.target.value)
                        }
                        className={`${styles.selectControl} ${
                          itemError ? styles.hasError : ""
                        }`}
                      >
                        <option value="">-- Chọn cơ sở nguồn cung --</option>
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
                    {itemError && (
                      <p className={styles.errorText} role="alert">
                        {itemError}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
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
  sourceByItemId: PropTypes.object,
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
  disabled: PropTypes.bool,
  onChangeSource: PropTypes.func,
  onApplyAll: PropTypes.func,
  lotDatesByItemId: PropTypes.object,
  lotDateErrors: PropTypes.object,
  onChangeLotDate: PropTypes.func,
}

export default RequestSourcesAssigner
