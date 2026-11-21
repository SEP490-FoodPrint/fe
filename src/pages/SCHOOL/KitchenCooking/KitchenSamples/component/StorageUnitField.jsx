import React, { useEffect, useState, useMemo } from "react"
import PropTypes from "prop-types"
import { ChevronDown } from "lucide-react"
import SampleStorageService from "src/services/SampleStorageService"
import fieldStyles from "./StorageUnitField.module.scss"

const UNAVAILABLE_LABEL = { MAINTENANCE: "đang bảo trì", INACTIVE: "ngưng dùng" }

// Lý do tủ không nhận thêm mẫu (khớp kiểm tra ở BE: trạng thái và sức chứa); "" nếu dùng được.
export const storageUnitBlockReason = unit => {
  if (!unit) return "Chưa chọn tủ lưu mẫu."
  if (unit.status !== "ACTIVE") return `Tủ ${unit.name} ${UNAVAILABLE_LABEL[unit.status] || "không hoạt động"}.`
  if (Number(unit.currentUsage) >= Number(unit.capacity)) return `Tủ ${unit.name} đã đầy (${unit.currentUsage}/${unit.capacity} mẫu).`
  return ""
}

export const storageCompartmentBlockReason = (unit, position) => {
  const count = Number(unit?.compartmentCount) || 0
  return Array.from({ length: count }, (_, index) => `Ngăn ${index + 1}`).includes(position)
    ? ""
    : "Vui lòng chọn ngăn còn trống trong tủ lưu mẫu."
}

/**
 * Chọn tủ lưu mẫu của trường (bắt buộc) và ngăn/vị trí trong tủ (theo số ngăn của tủ).
 * Tủ đầy, bảo trì hoặc ngưng dùng hiển thị nhưng không chọn được.
 */
export default function StorageUnitField({
  styles,
  unitId,
  onUnitChange,
  position,
  onPositionChange,
  disabled,
  onUnitsLoaded,
}) {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [occupiedCompartments, setOccupiedCompartments] = useState([])
  const [loadedUnitId, setLoadedUnitId] = useState("")
  const [compartmentError, setCompartmentError] = useState("")

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    SampleStorageService.getSampleStorageUnits({})
      .then(res => {
        if (!active) return
        const data = res?.data?.data || res?.data || res
        const items = Array.isArray(data?.items) ? data.items : []
        setUnits(items)
        onUnitsLoaded?.(items)
        if (!unitId) {
          const firstAvailable = items.find(unit => !storageUnitBlockReason(unit))
          if (firstAvailable) onUnitChange(firstAvailable.id)
        }
      })
      .catch(() => { if (active) setError("Không tải được danh sách tủ lưu mẫu.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, []) // Chỉ tải một lần khi mở form.

  const selectedUnit = useMemo(() => units.find(unit => unit.id === unitId), [units, unitId])
  const compartmentCount = Number(selectedUnit?.compartmentCount) || 0

  useEffect(() => {
    if (!unitId) return
    let active = true
    setCompartmentError("")
    setLoadedUnitId("")
    SampleStorageService.getSampleStorageUnitDetail(unitId)
      .then(res => {
        if (!active) return
        const data = res?.data?.data || res?.data || res
        const occupied = (data?.retainedSamples || [])
          .map(sample => /(?:^| – )(Ngăn [1-9]\d*)$/.exec(sample.storageLocation || "")?.[1])
          .filter(Boolean)
        setOccupiedCompartments(occupied)
        if (occupied.includes(position)) onPositionChange("")
        setLoadedUnitId(unitId)
      })
      .catch(() => { if (active) setCompartmentError("Không tải được tình trạng các ngăn. Vui lòng thử lại.") })
    return () => { active = false }
  }, [unitId])

  const standardCompartments = useMemo(() => {
    if (!selectedUnit || compartmentCount <= 0) return []
    return Array.from({ length: compartmentCount }, (_, i) => `Ngăn ${i + 1}`)
  }, [selectedUnit, compartmentCount])

  const noUsableUnit = !loading && !error && !units.some(unit => !storageUnitBlockReason(unit))

  return (
    <>
      <div className={styles.formGroupFull}>
        <label className={styles.fieldLabel} htmlFor="sample-storage-unit">
          Tủ lưu mẫu <span className={styles.required}>*</span>
        </label>
        <div className={styles.selectWrap}>
          <select
            id="sample-storage-unit"
            className={styles.selectInput}
            value={unitId}
            onChange={event => {
              onPositionChange("")
              onUnitChange(event.target.value)
            }}
            disabled={disabled || loading || Boolean(error) || !units.length}
            required
          >
            <option value="" disabled>{loading ? "Đang tải tủ lưu mẫu..." : "Chọn tủ lưu mẫu"}</option>
            {units.map(unit => {
              const blocked = storageUnitBlockReason(unit)
              const state = unit.status !== "ACTIVE"
                ? ` – ${UNAVAILABLE_LABEL[unit.status] || "không hoạt động"}`
                : Number(unit.currentUsage) >= Number(unit.capacity) ? " – đã đầy" : ""
              return (
                <option key={unit.id} value={unit.id} disabled={Boolean(blocked)}>
                  {unit.name}{unit.location ? ` (${unit.location})` : ""} · {unit.currentUsage}/{unit.capacity} mẫu{state}
                </option>
              )
            })}
          </select>
          <ChevronDown size={16} className={styles.selectChevron} />
        </div>
        {error && <p className={styles.alertError} role="alert">{error}</p>}
        {noUsableUnit && (
          <p className={styles.alertError} role="alert">
            {units.length
              ? "Không còn tủ nào nhận thêm mẫu (đầy, bảo trì hoặc ngưng dùng)."
              : "Trường chưa có tủ lưu mẫu. Thêm tủ ở màn Tủ lưu mẫu trước."}
          </p>
        )}
      </div>

      <div className={styles.formGroupFull}>
        <div className={fieldStyles.compartmentHeader}>
          <label className={styles.fieldLabel} htmlFor="sample-storage-compartment">Ngăn trong tủ <span className={styles.required}>*</span></label>
          {selectedUnit && compartmentCount > 0 && (
            <span className={fieldStyles.compartmentCountBadge}>
              Tủ có {compartmentCount} ngăn
            </span>
          )}
        </div>

        {selectedUnit && standardCompartments.length > 0 ? (
          <div className={fieldStyles.compartmentContainer}>
            <div className={styles.selectWrap}>
              <select
                id="sample-storage-compartment"
                className={styles.selectInput}
                value={position}
                onChange={event => onPositionChange(event.target.value)}
                disabled={disabled || loadedUnitId !== unitId}
                required
              >
                <option value="" disabled>{loadedUnitId !== unitId ? "Đang kiểm tra ngăn..." : "Chọn ngăn"}</option>
                {standardCompartments.map(comp => {
                  const occupied = occupiedCompartments.includes(comp)
                  return (
                    <option key={comp} value={comp} disabled={occupied}>
                      {comp}{occupied ? " – đã có mẫu" : ""}
                    </option>
                  )
                })}
              </select>
              <ChevronDown size={16} className={styles.selectChevron} />
            </div>
            {loadedUnitId !== unitId && !compartmentError && <p className={fieldStyles.compartmentHint}>Đang kiểm tra ngăn còn trống...</p>}
            {loadedUnitId === unitId && standardCompartments.every(comp => occupiedCompartments.includes(comp)) && <p className={styles.alertError}>Các ngăn của tủ đã có mẫu lưu. Vui lòng chọn tủ khác.</p>}
            {compartmentError && <p className={styles.alertError} role="alert">{compartmentError}</p>}
          </div>
        ) : (
          <p className={fieldStyles.compartmentHint}>{unitId ? "Tủ chưa khai báo ngăn lưu mẫu." : "Vui lòng chọn tủ lưu mẫu trước."}</p>
        )}
      </div>
    </>
  )
}

StorageUnitField.propTypes = {
  styles: PropTypes.object.isRequired,
  unitId: PropTypes.string.isRequired,
  onUnitChange: PropTypes.func.isRequired,
  position: PropTypes.string.isRequired,
  onPositionChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  onUnitsLoaded: PropTypes.func,
}
