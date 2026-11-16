import React, { useCallback, useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { ArrowBack, ArrowForward, LocalShippingOutlined, QrCode2Outlined } from "@mui/icons-material"
import RequestSourcesAssigner from "src/pages/SUPPLIER/SupplierDeliveries/component/RequestSourcesAssigner"
import SupplierDeliveryService, {
  DELIVERY_SOURCE_TYPE,
  extractApiError,
  formatQuantityVi,
  formatSourceFacilityLabel,
  normalizeDecimalQuantity,
  ORDER_CREATION_STAGE,
  validateDeliveryIngredientsStep,
  validateDeliveryLogisticsStep,
} from "src/services/SupplierDeliveryService"
import { SUPPLY_ORDER_STATUS } from "src/services/SupplierOrderService"
import OrderStatusBadge from "./OrderStatusBadge"
import styles from "./OrderFulfillmentWorkflow.module.scss"

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

  const [sourceByItemId, setSourceByItemId] = useState({})
  const [expectedArrivalLocal, setExpectedArrivalLocal] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [note, setNote] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const items = useMemo(
    () => (Array.isArray(order?.items) ? order.items : []),
    [order],
  )

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
    setSourceByItemId({})
    setExpectedArrivalLocal("")
    setVehiclePlate("")
    setNote("")
    setFieldErrors({})
    if (order.status === SUPPLY_ORDER_STATUS.ACCEPTED) {
      loadFacilities()
    }
  }, [order?.id, order?.status, loadFacilities])

  const buildSourcesPayload = () =>
    items
      .filter(item => item.id)
      .map(item => ({
        supplyRequestItemId: item.id,
        sourceFacilityId: String(sourceByItemId[item.id] || "").trim(),
        actualQuantity: normalizeDecimalQuantity(item.requestedQuantity),
      }))

  const handleSourceChange = (itemId, facilityId) => {
    setSourceByItemId(prev => ({ ...prev, [itemId]: facilityId }))
    setFieldErrors(prev => {
      if (!prev.sources && !prev.sourceErrors?.[itemId]) return prev
      const nextSourceErrors = { ...(prev.sourceErrors || {}) }
      delete nextSourceErrors[itemId]
      return {
        ...prev,
        sources: undefined,
        sourceErrors: nextSourceErrors,
      }
    })
    onDraftChange?.()
  }

  const handleApplyAllFacilities = facilityId => {
    if (!facilityId) return
    const next = {}
    items.forEach(item => {
      if (item.id) next[item.id] = facilityId
    })
    setSourceByItemId(next)
    setFieldErrors(prev => ({
      ...prev,
      sources: undefined,
      sourceErrors: {},
    }))
    onDraftChange?.()
  }

  const handleProceedToLogistics = () => {
    const sources = buildSourcesPayload()
    const check = validateDeliveryIngredientsStep({
      sourceType: DELIVERY_SOURCE_TYPE.REQUEST,
      supplyRequestId: order?.id,
      sources,
      requestItems: items,
    })

    if (!check.valid) {
      setFieldErrors(check.errors)
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
    })

    if (!logisticsCheck.valid) {
      setFieldErrors(prev => ({ ...prev, ...logisticsCheck.errors }))
      return
    }

    setFieldErrors({})
    onSubmitDelivery?.({
      sources: buildSourcesPayload(),
      expectedArrivalLocal,
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
            sourceByItemId={sourceByItemId}
            sourceFacilityOptions={facilityOptions}
            loadingFacilities={loadingFacilities}
            facilitiesError={facilitiesError}
            fieldError={fieldErrors.sources}
            sourceErrors={fieldErrors.sourceErrors || {}}
            disabled={submitting}
            onChangeSource={handleSourceChange}
            onApplyAll={handleApplyAllFacilities}
          />
        </div>

        <div className={styles.cardFooter}>
          <Button
            type="button"
            variant="contained"
            color="primary"
            className={styles.footerPrimaryBtn}
            disabled={submitting || loadingFacilities}
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
              const fac = facilityMap.get(sourceByItemId[item.id])
              return (
                <li key={item.id || idx} className={styles.recapItem}>
                  <div className={styles.recapItemTop}>
                    <span className={styles.recapName}>{item.ingredientName}</span>
                    <span className={styles.recapQty}>
                      {`${formatQuantityVi(item.requestedQuantity)} ${item.unit || ""}`.trim()}
                    </span>
                  </div>
                  <span className={styles.recapFacility}>
                    {fac ? formatSourceFacilityLabel(fac) : "Đã gắn cơ sở nguồn cung"}
                  </span>
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
              <span>{"Thời gian dự kiến đến trường "}</span>
              <span className={styles.requiredMark}>*</span>
            </label>
            <input
              id="order-expected-arrival"
              type="datetime-local"
              className={styles.textInput}
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
            <strong>FP-DE-xxxxx</strong>, tạo <strong>{items.length}</strong>{" "}
            nhãn QR dán bao bì và chuyển sang trạng thái{" "}
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
