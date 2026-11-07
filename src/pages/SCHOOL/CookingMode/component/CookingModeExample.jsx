import React from "react"
import PropTypes from "prop-types"
import { Info, PackageOpen, Scale } from "lucide-react"
import { cookingModeLabel } from "./cookingModeConfig"
import styles from "./CookingModeExample.module.scss"

const EXAMPLE_BATCHES = {
  SEPARATE_BY_LOT: [
    { name: "Mẻ 1", portions: 60, lots: ["6 kg từ CR-001"] },
    { name: "Mẻ 2", portions: 40, lots: ["4 kg từ CR-002"] },
  ],
  COMBINE_LOTS: [
    { name: "Mẻ 1", portions: 100, lots: ["6 kg từ CR-001", "4 kg từ CR-002"] },
  ],
}

function CookingModeExample({ mode }) {
  const batches = EXAMPLE_BATCHES[mode] || []

  return (
    <section className={styles.example} aria-labelledby="cooking-mode-example-title">
      <div className={styles.heading}>
        <div>
          <h2 id="cooking-mode-example-title">Ví dụ cách hệ thống chia mẻ</h2>
          <p>100 suất canh cần 10 kg cà rốt, với định mức 0,1 kg mỗi suất.</p>
        </div>
        {mode && <span className={styles.mode}>{cookingModeLabel(mode)}</span>}
      </div>

      <div className={styles.inventory} aria-label="Dữ liệu nguyên liệu minh họa">
        <div>
          <Scale size={18} aria-hidden="true" />
          <span>Cần dùng</span>
          <strong>10 kg cà rốt</strong>
        </div>
        <div>
          <PackageOpen size={18} aria-hidden="true" />
          <span>CR-001</span>
          <strong>6 kg khả dụng</strong>
        </div>
        <div>
          <PackageOpen size={18} aria-hidden="true" />
          <span>CR-002</span>
          <strong>7 kg khả dụng</strong>
        </div>
      </div>

      <div className={styles.result} aria-live="polite">
        {batches.length ? (
          batches.map(batch => (
            <div className={styles.batch} key={batch.name}>
              <div className={styles.batchName}>
                <strong>{batch.name}</strong>
                <span>{batch.portions} suất</span>
              </div>
              <ul>
                {batch.lots.map(lot => <li key={lot}>{lot}</li>)}
              </ul>
            </div>
          ))
        ) : (
          <p className={styles.empty}>Chọn một chế độ để xem cách hệ thống chia mẻ.</p>
        )}
      </div>

      <p className={styles.note}>
        <Info size={16} aria-hidden="true" />
        Ví dụ minh họa, không phải dữ liệu tồn kho thực tế. Giả định CR-001 được ưu tiên sử dụng trước.
      </p>
    </section>
  )
}

CookingModeExample.propTypes = {
  mode: PropTypes.string,
}

export default CookingModeExample
