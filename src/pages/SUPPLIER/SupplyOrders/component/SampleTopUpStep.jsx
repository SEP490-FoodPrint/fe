import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Button, Checkbox, FormControlLabel } from "@mui/material"
import {
  CheckCircleOutlined,
  LocalShippingOutlined,
  RefreshOutlined,
} from "@mui/icons-material"
import {
  formatQuantityVi,
  getMinArrivalTime,
  validateDeliveryLogisticsStep,
} from "src/services/SupplierDeliveryService"
import workflow from "./OrderFulfillmentWorkflow.module.scss"
import styles from "./SampleTopUpStep.module.scss"

/**
 * Bước 3 (Đợt 2, trường nấu riêng — TASK-10 v8, V22/V24/V31):
 * NCC thấy lượng cần lấy thêm cho lưu mẫu theo từng nguyên liệu → nguồn/lô ngay khi món đã lập mẻ;
 * nút "Xác nhận đã chuẩn bị" chỉ bật khi mọi nguyên liệu của đơn đã được kho duyệt.
 */
export function SampleTopUpStep({ delivery, busy, error, onReload, onConfirm }) {
  const [checked, setChecked] = useState({})
  const lots = useMemo(() => delivery?.topUpLots ?? [], [delivery])
  const readiness = useMemo(() => delivery?.topUpReadiness ?? [], [delivery])
  const stage = delivery?.preparationStage

  const groups = useMemo(() => {
    const byEntry = new Map()
    for (const status of readiness)
      byEntry.set(status.ingredientEntryId, { ...status, lots: [] })
    for (const lot of lots) {
      const key = lot.ingredientEntryId || lot.ingredientName || lot.lotCode
      const group = byEntry.get(key) ?? {
        ingredientEntryId: key,
        ingredientName: lot.ingredientName || "Nguyên liệu",
        ready: true,
        approved: stage === "TOP_UP_PENDING",
        waitingFor: [],
        lots: [],
      }
      group.lots.push(lot)
      byEntry.set(key, group)
    }
    return [...byEntry.values()]
  }, [lots, readiness, stage])

  const allApproved =
    stage === "TOP_UP_PENDING" &&
    groups.length > 0 &&
    groups.every((group) => group.approved !== false)
  const allChecked = lots.every((lot) => checked[lot.ingredientLotId])
  const nothingToAdd =
    stage === "TOP_UP_PENDING" && groups.every((group) => !group.lots.length)

  return (
    <section className={workflow.workflowCard} aria-labelledby="sample-step-heading">
      <div className={workflow.cardHeader}>
        <h2 id="sample-step-heading" className={workflow.sectionTitle}>
          3. Xác nhận bổ sung lưu mẫu
        </h2>
        <Button
          type="button"
          variant="outlined"
          size="small"
          startIcon={<RefreshOutlined fontSize="small" />}
          disabled={busy}
          onClick={onReload}
        >
          Tải lại trạng thái
        </Button>
      </div>
      <div className={workflow.cardBody}>
        {stage !== "TOP_UP_PENDING" && (
          <div className={styles.noticeBox} role="status">
            Hệ thống lập mẻ khi các nhà cung cấp của món đã khai báo lô. Nguyên liệu nào đã
            lập mẻ sẽ hiện ngay lượng cần chuẩn bị thêm để bạn chuẩn bị trước; nút xác nhận mở
            khi kho trường đã duyệt mọi món dùng nguyên liệu của đơn.
          </div>
        )}
        {nothingToAdd && (
          <div className={styles.doneBox} role="status">
            Đơn này không cần bổ sung lưu mẫu. Bấm xác nhận để chuyển sang bước vận chuyển.
          </div>
        )}
        <ul className={styles.ingredientList}>
          {groups.map((group) => {
            const unit = group.lots[0]?.unit || ""
            const total = group.lots.reduce(
              (sum, lot) => sum + Number(lot.sampleTopUpQuantity || 0),
              0,
            )
            return (
              <li key={group.ingredientEntryId} className={styles.ingredientBlock}>
                <div className={styles.ingredientHead}>
                  <span>{group.ingredientName}</span>
                  <span>
                    {group.approved
                      ? "Kho đã duyệt"
                      : group.ready
                        ? "Đã lập mẻ · chờ kho duyệt"
                        : "Chờ lập mẻ"}
                  </span>
                </div>
                {group.ready &&
                  group.lots.map((lot) => (
                    <div key={lot.ingredientLotId} className={styles.lotRow}>
                      <div>
                        <div className={styles.lotSource}>
                          {lot.sourceFacilityName || "Nguồn cung"}
                        </div>
                        <div className={styles.lotCode}>{lot.lotCode}</div>
                      </div>
                      <span className={styles.lotQty}>
                        {`+ ${formatQuantityVi(lot.sampleTopUpQuantity)} ${lot.unit || ""}`}
                      </span>
                      <FormControlLabel
                        label="Đã chuẩn bị"
                        control={
                          <Checkbox
                            size="small"
                            checked={Boolean(checked[lot.ingredientLotId])}
                            disabled={busy || !allApproved}
                            onChange={(event) =>
                              setChecked((prev) => ({
                                ...prev,
                                [lot.ingredientLotId]: event.target.checked,
                              }))
                            }
                          />
                        }
                      />
                    </div>
                  ))}
                {group.ready && !group.lots.length && (
                  <div className={styles.waiting}>Không cần bổ sung cho nguyên liệu này.</div>
                )}
                {group.waitingFor?.length > 0 && (
                  <div className={styles.waiting}>{`Đang chờ: ${group.waitingFor.join("; ")}`}</div>
                )}
                {group.lots.length > 0 && group.ready && (
                  <div className={styles.totalRow}>
                    <span>Tổng bổ sung cho lưu mẫu</span>
                    <span>{`${formatQuantityVi(total)} ${unit}`}</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        {error && (
          <p className={workflow.submitErrorBanner} role="alert">
            {error}
          </p>
        )}
      </div>
      <div className={workflow.cardFooter}>
        {!allApproved && (
          <span className={workflow.footerHint} role="status">
            Chờ mọi nguyên liệu của đơn được ghép mẻ và kho trường duyệt.
          </span>
        )}
        <Button
          type="button"
          variant="contained"
          color="primary"
          className={workflow.footerPrimaryBtn}
          disabled={busy || !allApproved || !allChecked}
          startIcon={<CheckCircleOutlined fontSize="small" />}
          onClick={() => onConfirm?.(lots)}
        >
          {busy ? "Đang xác nhận..." : "Xác nhận đã chuẩn bị"}
        </Button>
      </div>
    </section>
  )
}

SampleTopUpStep.propTypes = {
  delivery: PropTypes.object,
  busy: PropTypes.bool,
  error: PropTypes.string,
  onReload: PropTypes.func,
  onConfirm: PropTypes.func,
}

/** Bước 4: nhập giờ dự kiến đến và biển số xe cho chuyến đã khai báo lô. */
export function SampleDispatchStep({ delivery, busy, error, onDispatch }) {
  const [expectedArrivalLocal, setExpectedArrivalLocal] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const submit = () => {
    const check = validateDeliveryLogisticsStep({ expectedArrivalLocal, vehiclePlate })
    setFieldErrors(check.errors || {})
    if (!check.valid) return
    onDispatch?.({ expectedArrivalLocal, vehiclePlate: vehiclePlate.trim() })
  }

  return (
    <section className={workflow.workflowCard} aria-labelledby="dispatch-step-heading">
      <div className={workflow.cardHeader}>
        <h2 id="dispatch-step-heading" className={workflow.sectionTitle}>
          4. Nhập thời gian dự kiến &amp; biển số xe
        </h2>
      </div>
      <div className={workflow.cardBody}>
        {delivery?.deliveryNo && (
          <div className={styles.doneBox} role="status">
            {`Chuyến ${delivery.deliveryNo} đã khai báo lô và chuẩn bị đủ phần lưu mẫu.`}
          </div>
        )}
        <div className={workflow.logisticsGrid}>
          <div className={workflow.fieldGroup}>
            <label className={workflow.fieldLabel} htmlFor="sample-expected-arrival">
              <span>{"Giờ dự kiến đến trường (hôm nay) "}</span>
              <span className={workflow.requiredMark}>*</span>
            </label>
            <input
              id="sample-expected-arrival"
              type="time"
              className={workflow.textInput}
              min={getMinArrivalTime()}
              value={expectedArrivalLocal}
              disabled={busy}
              onChange={(event) => {
                setExpectedArrivalLocal(event.target.value)
                setFieldErrors((prev) => ({ ...prev, expectedArrivalAt: undefined }))
              }}
            />
            {fieldErrors.expectedArrivalAt && (
              <p className={workflow.fieldError} role="alert">
                {fieldErrors.expectedArrivalAt}
              </p>
            )}
          </div>
          <div className={workflow.fieldGroup}>
            <label className={workflow.fieldLabel} htmlFor="sample-vehicle-plate">
              <span>{"Biển số xe giao hàng "}</span>
              <span className={workflow.requiredMark}>*</span>
            </label>
            <input
              id="sample-vehicle-plate"
              type="text"
              maxLength={40}
              className={workflow.textInput}
              placeholder="VD: 51D-123.45"
              value={vehiclePlate}
              disabled={busy}
              onChange={(event) => {
                setVehiclePlate(event.target.value)
                setFieldErrors((prev) => ({ ...prev, vehiclePlate: undefined }))
              }}
            />
            {fieldErrors.vehiclePlate && (
              <p className={workflow.fieldError} role="alert">
                {fieldErrors.vehiclePlate}
              </p>
            )}
          </div>
        </div>
        {error && (
          <p className={workflow.submitErrorBanner} role="alert">
            {error}
          </p>
        )}
      </div>
      <div className={workflow.cardFooter}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          className={workflow.footerPrimaryBtn}
          disabled={busy}
          startIcon={<LocalShippingOutlined fontSize="small" />}
          onClick={submit}
        >
          {busy ? "Đang giao hàng..." : "Hoàn tất & Giao hàng"}
        </Button>
      </div>
    </section>
  )
}

SampleDispatchStep.propTypes = {
  delivery: PropTypes.object,
  busy: PropTypes.bool,
  error: PropTypes.string,
  onDispatch: PropTypes.func,
}
