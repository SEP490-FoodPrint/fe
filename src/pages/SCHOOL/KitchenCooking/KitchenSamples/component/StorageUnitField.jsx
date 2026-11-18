import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { ChevronDown } from "lucide-react"
import SampleStorageService from "src/services/SampleStorageService"

const UNAVAILABLE_LABEL = { MAINTENANCE: "đang bảo trì", INACTIVE: "ngưng dùng" }

// Lý do tủ không nhận thêm mẫu (khớp kiểm tra ở BE: trạng thái và sức chứa); "" nếu dùng được.
export const storageUnitBlockReason = unit => {
  if (!unit) return "Chưa chọn tủ lưu mẫu."
  if (unit.status !== "ACTIVE") return `Tủ ${unit.name} ${UNAVAILABLE_LABEL[unit.status] || "không hoạt động"}.`
  if (Number(unit.currentUsage) >= Number(unit.capacity)) return `Tủ ${unit.name} đã đầy (${unit.currentUsage}/${unit.capacity} mẫu).`
  return ""
}

/**
 * Chọn tủ lưu mẫu của trường (bắt buộc) và ngăn/vị trí trong tủ (không bắt buộc).
 * Tủ đầy, bảo trì hoặc ngưng dùng hiển thị nhưng không chọn được.
 */
export default function StorageUnitField({ styles, unitId, onUnitChange, position, onPositionChange, disabled, onUnitsLoaded }) {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
            onChange={event => onUnitChange(event.target.value)}
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
        <label className={styles.fieldLabel} htmlFor="sample-storage-position">
          Ngăn / vị trí trong tủ
        </label>
        <input
          id="sample-storage-position"
          type="text"
          maxLength={255}
          className={styles.textInput}
          placeholder="Ví dụ: Ngăn 2"
          value={position}
          onChange={event => onPositionChange(event.target.value)}
          disabled={disabled}
        />
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
