import React, { useCallback, useEffect, useMemo, useState } from "react"
import { lotDateError } from "src/utils/lotDates"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { ArrowBack, ArrowForward, LocalShippingOutlined, QrCode2Outlined } from "@mui/icons-material"
import RequestSourcesAssigner from "src/pages/SUPPLIER/SupplierDeliveries/component/RequestSourcesAssigner"
import SupplierDeliveryService, {
  DELIVERY_SOURCE_TYPE,
  extractApiError,
  formatQuantityVi,
  formatSourceFacilityLabel,
  generateIdempotencyKey,
  getAllocationTotalStatus,
  getMinArrivalDateTime,
  getMinArrivalTime,
  normalizeDecimalQuantity,
  ORDER_CREATION_STAGE,
  thousandthsToQuantity,
  validateDeliveryIngredientsStep,
  validateDeliveryLogisticsStep,
} from "src/services/SupplierDeliveryService"
import { SUPPLY_ORDER_STATUS } from "src/services/SupplierOrderService"
import OrderStatusBadge from "./OrderStatusBadge"
import styles from "./OrderFulfillmentWorkflow.module.scss"

/** Một phần giao của nguyên liệu: 1 cơ sở nguồn cung + khối lượng (+ NSX/HSD nếu đồ lưu kho) = 1 lô. */
function createAllocation(actualQuantity = "") {
  return {
    key: generateIdempotencyKey(),
    sourceFacilityId: "",
    actualQuantity,
    manufactureDate: "",
    expiryDate: "",
  }
}

function buildInitialAllocations(items = []) {
  const next = {}
  items.forEach(item => {
    if (!item?.id) return
    next[item.id] = [createAllocation(normalizeDecimalQuantity(item.requestedQuantity))]
  })
  return next
}

function OrderFulfillmentWorkflow({
  order,
  fulfillmentStage = ORDER_CREATION_STAGE.INGREDIENTS,
  pendingDispatchDelivery = null,
  submitting = false,
  error = "",
  onChangeStage,
  onSubmitDelivery,
  onDraftChange,
}) {
  const [facilityOptions, setFacilityOptions] = useState([])
  const [loadingFacilities, setLoadingFacilities] = useState(false)
  const [facilitiesError, setFacilitiesError] = useState("")

  // Phân bổ nguồn cung theo từng mặt hàng: nhiều cơ sở, mỗi cơ sở 1 khối lượng (1 lô).
  // NSX/HSD chỉ áp dụng cho đồ lưu kho.
  const [allocationsByItemId, setAllocationsByItemId] = useState({})
  // Dự kiến đến: đồ tươi "HH:mm" trong hôm nay; đồ lưu kho "YYYY-MM-DDTHH:mm" từ hiện tại trở đi.
  const [expectedArrivalLocal, setExpectedArrivalLocal] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [note, setNote] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const items = useMemo(
    () => (Array.isArray(order?.items) ? order.items : []),
    [order],
  )
  // Đơn đồ lưu kho được hẹn giao ngày khác; đơn đồ tươi phải giao trong hôm nay.
  const isDryOrder =
    order?.orderType === "DRY_STOCK" ||
    (items.length > 0 && items.every(item => item.handlingType === "DRY_STOCK"))

  const loadFacilities = useCallback(async () => {
    setLoadingFacilities(true)
    setFacilitiesError("")
    try {
      const res = await SupplierDeliveryService.listSourceFacilityOptions({
        limit: 100,
      })
      setFacilityOptions(Array.isArray(res.items) ? res.items : [])
    } catch (err) {
      setFacilitiesError(
        extractApiError(
          err,
          "Không thể tải danh sách cơ sở nguồn cung. Vui lòng thử lại.",
        ).message,
      )
    } finally {
      setLoadingFacilities(false)
    }
  }, [])

  useEffect(() => {
    if (!order?.id) return
    setAllocationsByItemId(
      buildInitialAllocations(Array.isArray(order.items) ? order.items : []),
    )
    setExpectedArrivalLocal("")
    setVehiclePlate("")
    setNote("")
    setFieldErrors({})
    if (order.status === SUPPLY_ORDER_STATUS.ACCEPTED) {
      loadFacilities()
    }
  }, [order?.id, order?.status, items, loadFacilities])

  // Danh sách phân bổ phẳng (giữ key để gắn lỗi theo từng dòng con).
  const buildAllocationList = () =>
    items
      .filter(item => item.id)
      .flatMap(item =>
        (allocationsByItemId[item.id] || []).map(row => ({
          key: row.key,
          supplyRequestItemId: item.id,
          sourceFacilityId: String(row.sourceFacilityId || "").trim(),
          actualQuantity: normalizeDecimalQuantity(row.actualQuantity),
          ...(item.handlingType === "DRY_STOCK"
            ? { manufactureDate: row.manufactureDate, expiryDate: row.expiryDate }
            : {}),
        })),
      )

  // Payload gửi BE: mỗi phần giao là 1 dòng sources (BE tạo 1 delivery_item + 1 ingredient_lot).
  const buildSourcesPayload = () =>
    buildAllocationList().map(({ key: _key, ...source }) => source)

  const clearAllocationErrors = (itemId, key) => {
    setFieldErrors(prev => {
      const nextSourceErrors = { ...(prev.sourceErrors || {}) }
      const nextAllocationErrors = { ...(prev.allocationErrors || {}) }
      const nextLotDateErrors = { ...(prev.lotDateErrors || {}) }
      delete nextSourceErrors[itemId]
      if (key) {
        delete nextAllocationErrors[key]
        delete nextLotDateErrors[key]
      }
      return {
        ...prev,
        sources: undefined,
        sourceErrors: nextSourceErrors,
        allocationErrors: nextAllocationErrors,
        lotDateErrors: nextLotDateErrors,
      }
    })
    onDraftChange?.()
  }

  const handleAllocationChange = (itemId, key, field, value) => {
    setAllocationsByItemId(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || []).map(row =>
        row.key === key ? { ...row, [field]: value } : row,
      ),
    }))
    clearAllocationErrors(itemId, key)
  }

  const handleAddAllocation = itemId => {
    setAllocationsByItemId(prev => {
      const current = prev[itemId] || []
      const item = items.find(it => it.id === itemId)
      // Gợi ý sẵn phần khối lượng còn thiếu để người dùng chỉ việc chỉnh.
      const summary = getAllocationTotalStatus(item?.requestedQuantity, current)
      const remaining =
        summary.status === "UNDER" && summary.difference > 0
          ? thousandthsToQuantity(summary.difference)
          : ""
      return { ...prev, [itemId]: [...current, createAllocation(remaining)] }
    })
    clearAllocationErrors(itemId)
  }

  const handleRemoveAllocation = (itemId, key) => {
    setAllocationsByItemId(prev => {
      const current = prev[itemId] || []
      if (current.length <= 1) return prev
      return { ...prev, [itemId]: current.filter(row => row.key !== key) }
    })
    clearAllocationErrors(itemId, key)
  }

  // Áp dụng nhanh: chỉ gán cho nguyên liệu đang lấy từ 1 nguồn, không động vào nguyên liệu đã tách nhiều nguồn.
  const handleApplyAllFacilities = facilityId => {
    if (!facilityId) return
    setAllocationsByItemId(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(itemId => {
        const current = next[itemId] || []
        if (current.length === 1) {
          next[itemId] = [{ ...current[0], sourceFacilityId: facilityId }]
        }
      })
      return next
    })
    setFieldErrors(prev => ({
      ...prev,
      sources: undefined,
      sourceErrors: {},
      allocationErrors: {},
    }))
    onDraftChange?.()
  }

  // Đồ lưu kho: mỗi lô bắt buộc ngày sản xuất (không sau hôm nay) và hạn sử dụng (không trước ngày sản xuất).
  // NSX không sau hôm nay; HSD không trước NSX, không trước hôm nay, đồ lưu kho còn hạn ít nhất 7 ngày.
  const validateLotDates = () => {
    const errors = {}
    items.forEach(item => {
      if (item.handlingType !== "DRY_STOCK" || !item.id) return
      ;(allocationsByItemId[item.id] || []).forEach(row => {
        const message = lotDateError({
          manufactureDate: row.manufactureDate || "",
          expiryDate: row.expiryDate || "",
          isDryStock: true,
          required: true,
        })
        if (message) errors[row.key] = message
      })
    })
    return errors
  }

  // Nút "Hoàn tất nguyên liệu" chỉ bật khi tổng khối lượng của mọi nguyên liệu khớp đúng số trường cần.
  const allTotalsMatch = useMemo(
    () =>
      items.length > 0 &&
      items.every(
        item =>
          !item.id ||
          getAllocationTotalStatus(item.requestedQuantity, allocationsByItemId[item.id])
            .status === "MATCH",
      ),
    [items, allocationsByItemId],
  )

  const handleProceedToLogistics = () => {
    const check = validateDeliveryIngredientsStep({
      sourceType: DELIVERY_SOURCE_TYPE.REQUEST,
      supplyRequestId: order?.id,
      sources: buildAllocationList(),
      requestItems: items,
    })

    const lotDateErrors = validateLotDates()
    if (!check.valid || Object.keys(lotDateErrors).length) {
      setFieldErrors({ ...(check.valid ? {} : check.errors), lotDateErrors })
      return
    }

    setFieldErrors({})
    onChangeStage?.(ORDER_CREATION_STAGE.LOGISTICS)
  }

  const handleConfirmDelivery = () => {
    const logisticsCheck = validateDeliveryLogisticsStep({
      expectedArrivalLocal,
      vehiclePlate,
      note,
      allowFutureDate: isDryOrder,
    })

    if (!logisticsCheck.valid) {
      setFieldErrors(prev => ({ ...prev, ...logisticsCheck.errors }))
      return
    }

    setFieldErrors({})
    onSubmitDelivery?.({
      sources: buildSourcesPayload(),
      expectedArrivalLocal,
      allowFutureDate: isDryOrder,
      vehiclePlate: String(vehiclePlate || "").trim(),
      note,
    })
  }

  const facilityMap = useMemo(
    () => new Map(facilityOptions.map(fac => [fac.id, fac])),
    [facilityOptions],
  )

  if (!order || order.status !== SUPPLY_ORDER_STATUS.ACCEPTED) {
    return null
  }

  const isIngredientsStep =
    fulfillmentStage !== ORDER_CREATION_STAGE.LOGISTICS
  const allocationCount = items.reduce(
    (count, item) => count + (allocationsByItemId[item.id]?.length || 0),
    0,
  )

  if (isIngredientsStep) {
    return (
      <section
        className={styles.workflowCard}
        aria-labelledby="step-ingredients-heading"
      >
        <div className={styles.cardHeader}>
          <h2 id="step-ingredients-heading" className={styles.sectionTitle}>
            2. Thêm nguyên liệu &amp; gắn cơ sở nguồn cung
          </h2>
          <OrderStatusBadge status={SUPPLY_ORDER_STATUS.ACCEPTED} showDot />
        </div>

        <div className={styles.cardBody}>
          <RequestSourcesAssigner
            items={items}
            allocationsByItemId={allocationsByItemId}
            sourceFacilityOptions={facilityOptions}
            loadingFacilities={loadingFacilities}
            facilitiesError={facilitiesError}
            fieldError={fieldErrors.sources}
            sourceErrors={fieldErrors.sourceErrors || {}}
            allocationErrors={fieldErrors.allocationErrors || {}}
            lotDateErrors={fieldErrors.lotDateErrors || {}}
            disabled={submitting}
            onChangeAllocation={handleAllocationChange}
            onAddAllocation={handleAddAllocation}
            onRemoveAllocation={handleRemoveAllocation}
            onApplyAll={handleApplyAllFacilities}
          />
        </div>

        <div className={styles.cardFooter}>
          {!allTotalsMatch && (
            <span className={styles.footerHint} role="status">
              Tổng khối lượng giao của mỗi nguyên liệu phải bằng khối lượng trường yêu cầu.
            </span>
          )}
          <Button
            type="button"
            variant="contained"
            color="primary"
            className={styles.footerPrimaryBtn}
            disabled={submitting || loadingFacilities || !allTotalsMatch}
            endIcon={<ArrowForward fontSize="small" />}
            onClick={handleProceedToLogistics}
          >
            Hoàn tất nguyên liệu
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section
      className={styles.workflowCard}
      aria-labelledby="step-logistics-heading"
    >
      <div className={styles.cardHeader}>
        <h2 id="step-logistics-heading" className={styles.sectionTitle}>
          3. Nhập thời gian dự kiến &amp; biển số xe
        </h2>
        <OrderStatusBadge status="PREPARING" showDot />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.confirmedRecap}>
          <div className={styles.recapHeader}>
            <span className={styles.recapTitle}>
              Nguyên liệu &amp; cơ sở nguồn cung đã xác nhận
            </span>
            <span className={styles.recapCount}>
              {`${items.length} mặt hàng · sẵn sàng chuẩn bị hàng`}
            </span>
          </div>
          <ul className={styles.recapList}>
            {items.map((item, idx) => {
              const allocations = allocationsByItemId[item.id] || []
              return (
                <li key={item.id || idx} className={styles.recapItem}>
                  <div className={styles.recapItemTop}>
                    <span className={styles.recapName}>{item.ingredientName}</span>
                    <span className={styles.recapQty}>
                      {`${formatQuantityVi(item.requestedQuantity)} ${item.unit || ""}`.trim()}
                    </span>
                  </div>
                  {allocations.map(row => {
                    const fac = facilityMap.get(row.sourceFacilityId)
                    return (
                      <div key={row.key} className={styles.recapAllocation}>
                        <span className={styles.recapFacility}>
                          {fac ? formatSourceFacilityLabel(fac) : "Đã gắn cơ sở nguồn cung"}
                        </span>
                        {allocations.length > 1 && (
                          <span className={styles.recapAllocationQty}>
                            {`${formatQuantityVi(row.actualQuantity)} ${item.unit || ""}`.trim()}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </li>
              )
            })}
          </ul>
        </div>

        <div className={styles.logisticsGrid}>
          <div className={styles.fieldGroup}>
            <label
              className={styles.fieldLabel}
              htmlFor="order-expected-arrival"
            >
              <span>
                {isDryOrder
                  ? "Ngày giờ dự kiến đến trường "
                  : "Giờ dự kiến đến trường (hôm nay) "}
              </span>
              <span className={styles.requiredMark}>*</span>
            </label>
            <input
              id="order-expected-arrival"
              type={isDryOrder ? "datetime-local" : "time"}
              className={styles.textInput}
              min={isDryOrder ? getMinArrivalDateTime() : getMinArrivalTime()}
              value={expectedArrivalLocal}
              disabled={submitting}
              onChange={e => {
                setExpectedArrivalLocal(e.target.value)
                setFieldErrors(prev => ({
                  ...prev,
                  expectedArrivalAt: undefined,
                }))
                onDraftChange?.()
              }}
            />
            {fieldErrors.expectedArrivalAt && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.expectedArrivalAt}
              </p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label
              className={styles.fieldLabel}
              htmlFor="order-vehicle-plate"
            >
              <span>{"Biển số xe giao hàng "}</span>
              <span className={styles.requiredMark}>*</span>
            </label>
            <input
              id="order-vehicle-plate"
              type="text"
              maxLength={40}
              className={styles.textInput}
              placeholder="VD: 51D-123.45"
              value={vehiclePlate}
              disabled={submitting}
              onChange={e => {
                setVehiclePlate(e.target.value)
                setFieldErrors(prev => ({ ...prev, vehiclePlate: undefined }))
                onDraftChange?.()
              }}
            />
            {fieldErrors.vehiclePlate && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.vehiclePlate}
              </p>
            )}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.fieldLabel} htmlFor="order-delivery-note">
              Ghi chú giao hàng
            </label>
            <span className={styles.charHint}>{`${note.length}/2000`}</span>
          </div>
          <textarea
            id="order-delivery-note"
            maxLength={2000}
            className={styles.textArea}
            placeholder="Hướng dẫn giao nhận tại cổng bếp hoặc bảo quản (không bắt buộc)"
            value={note}
            disabled={submitting || Boolean(pendingDispatchDelivery)}
            onChange={e => {
              setNote(e.target.value)
              setFieldErrors(prev => ({ ...prev, note: undefined }))
              onDraftChange?.()
            }}
          />
          {fieldErrors.note && (
            <p className={styles.fieldError} role="alert">
              {fieldErrors.note}
            </p>
          )}
        </div>

        {pendingDispatchDelivery && (
          <div className={styles.qrNoteBox} role="status">
            <QrCode2Outlined className={styles.qrNoteIcon} aria-hidden="true" />
            <span>
              {`Đã tạo đơn ${pendingDispatchDelivery.deliveryNo || ""} (Đang chuẩn bị hàng). Hoàn tất thông tin vận chuyển để bắt đầu giao.`}
            </span>
          </div>
        )}

        <div className={styles.qrNoteBox}>
          <QrCode2Outlined className={styles.qrNoteIcon} aria-hidden="true" />
          <span>
            Khi hoàn tất, đơn giao sẽ tự động cấp mã{" "}
            <strong>FP-DE-xxxxx</strong>, tạo <strong>{allocationCount}</strong>{" "}
            nhãn QR dán bao bì (mỗi lô 1 nhãn) và chuyển sang trạng thái{" "}
            <strong>Đang giao hàng</strong>.
          </span>
        </div>

        {error && (
          <p className={styles.submitErrorBanner} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          className={styles.footerSecondaryBtn}
          disabled={submitting || Boolean(pendingDispatchDelivery)}
          startIcon={<ArrowBack fontSize="small" />}
          onClick={() => onChangeStage?.(ORDER_CREATION_STAGE.INGREDIENTS)}
        >
          Quay lại sửa nguyên liệu
        </Button>

        <Button
          type="button"
          variant="contained"
          color="primary"
          className={styles.footerPrimaryBtn}
          disabled={submitting}
          startIcon={<LocalShippingOutlined fontSize="small" />}
          onClick={handleConfirmDelivery}
        >
          {submitting ? "Đang giao hàng..." : "Hoàn tất & Giao hàng"}
        </Button>
      </div>
    </section>
  )
}

OrderFulfillmentWorkflow.propTypes = {
  order: PropTypes.object,
  fulfillmentStage: PropTypes.string,
  pendingDispatchDelivery: PropTypes.shape({
    id: PropTypes.string,
    deliveryNo: PropTypes.string,
  }),
  submitting: PropTypes.bool,
  error: PropTypes.string,
  onChangeStage: PropTypes.func,
  onSubmitDelivery: PropTypes.func,
  onDraftChange: PropTypes.func,
}

export default OrderFulfillmentWorkflow
