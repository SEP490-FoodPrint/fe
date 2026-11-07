import React from "react"
import PropTypes from "prop-types"
import { ClipboardCheck, Save, Workflow } from "lucide-react"
import { cookingModeLabel } from "./cookingModeConfig"
import styles from "./CookingModeProcess.module.scss"

const RESULT_COPY = {
  SEPARATE_BY_LOT: "Hệ thống có thể tạo nhiều mẻ; mỗi loại nguyên liệu trong một mẻ chỉ lấy từ một lô.",
  COMBINE_LOTS: "Hệ thống tạo một mẻ và có thể lấy cùng một loại nguyên liệu từ nhiều lô.",
}

function CookingModeProcess({ mode }) {
  return (
    <section className={styles.process} aria-labelledby="cooking-mode-process-title">
      <div className={styles.heading}>
        <h2 id="cooking-mode-process-title">Chế độ được sử dụng như thế nào?</h2>
        {mode && <span className={styles.mode}>{cookingModeLabel(mode)}</span>}
      </div>

      <ol className={styles.steps}>
        <li>
          <span className={styles.icon}><Save size={18} aria-hidden="true" /></span>
          <div>
            <strong>Lưu chế độ</strong>
            <p>Cấu hình được lưu và áp dụng cho toàn trường.</p>
          </div>
        </li>
        <li>
          <span className={styles.icon}><Workflow size={18} aria-hidden="true" /></span>
          <div>
            <strong>Hệ thống tự lập mẻ</strong>
            <p>
              Khi nhà bếp lập phương án mới, hệ thống tự đọc cấu hình này. {mode
                ? RESULT_COPY[mode]
                : "Chọn một chế độ để xác định cách hệ thống chia mẻ."}
            </p>
          </div>
        </li>
        <li>
          <span className={styles.icon}><ClipboardCheck size={18} aria-hidden="true" /></span>
          <div>
            <strong>Nhà bếp kiểm tra và xác nhận</strong>
            <p>Phương án hiển thị số mẻ và các lô nguyên liệu đã được phân bổ.</p>
          </div>
        </li>
      </ol>

      <p className={styles.note}>
        Chế độ mới chỉ áp dụng khi lập phương án mới. Các mẻ đã lập vẫn giữ nguyên chế độ cũ.
      </p>
    </section>
  )
}

CookingModeProcess.propTypes = {
  mode: PropTypes.string,
}

export default CookingModeProcess
