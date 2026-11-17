import React from "react"
import PropTypes from "prop-types"
import { Button, CircularProgress } from "@mui/material"
import { ClipboardCheck, CookingPot, FlaskConical, ShieldAlert, ShieldCheck, ShieldQuestion, Truck, Utensils } from "lucide-react"
import { STOP_STATES } from "src/services/BlockchainProofService/chainAdapter"
import styles from "./TraceSummary.module.scss"

export const PHASES = [
  { key: "declare", label: "NCC xuất hàng", icon: Truck },
  { key: "inspect", label: "Kiểm nhận", icon: ClipboardCheck },
  { key: "cook", label: "Nấu", icon: CookingPot },
  { key: "sample", label: "Lưu mẫu", icon: FlaskConical },
  { key: "distribute", label: "Phát suất", icon: Utensils },
]

const SEVERITY = ["BROKEN", "FAILED", "UNCHECKED", "MISSING", "PENDING", "SEALED", "VERIFIED"]

/** The worst state among the stops of a phase decides its colour on the progress bar. */
function phaseState(stops, phase) {
  const states = stops.filter(stop => stop.phase === phase).map(stop => stop.state)
  if (!states.length) return null
  return SEVERITY.find(state => states.includes(state))
}

function headline(chain, checked) {
  if (chain.counts.broken || !chain.intact)
    return { tone: "error", icon: ShieldAlert, title: "Phát hiện dữ liệu bị thay đổi", text: "Có bước trong hành trình không còn khớp với bản đã niêm phong trên blockchain. Xem các chặng màu đỏ bên dưới." }
  if (!checked)
    return { tone: "info", icon: ShieldQuestion, title: "Chưa kiểm tra toàn vẹn", text: "Bấm “Kiểm tra toàn vẹn” để đối chiếu dữ liệu hiện tại của từng chặng với blockchain." }
  if (chain.issues.some(issue => issue.tone === "warning"))
    return { tone: "warning", icon: ShieldQuestion, title: "Có chặng chưa kiểm tra được", text: "Các chặng đã kiểm tra đều khớp, nhưng vẫn còn chặng chưa niêm phong xong hoặc không kết nối được blockchain." }
  return { tone: "success", icon: ShieldCheck, title: "Hành trình nguyên vẹn", text: "Dữ liệu của mọi chặng đã niêm phong vẫn khớp với blockchain." }
}

export default function TraceSummary({ chain, checked, verifying, verifyError, onVerify }) {
  const head = headline(chain, checked)
  const HeadIcon = head.icon
  const problems = chain.issues.filter(issue => issue.tone !== "neutral")
  const missing = chain.issues.filter(issue => issue.tone === "neutral").length

  return (
    <article className={`${styles.card} ${styles[head.tone]}`}>
      <div className={styles.top}>
        <div className={styles.meal}>
          <span className={styles.eyebrow}>{chain.meal.mealLabel} · {formatDay(chain.date)}</span>
          <h2 className={styles.mealTitle}>{chain.meal.gradeLabel}</h2>
          <span className={styles.mealMeta}>
            {[chain.meal.classes.length && `${chain.meal.classes.length} lớp`, chain.meal.portions !== null && `${chain.meal.portions} suất`, chain.meal.statusLabel].filter(Boolean).join(" · ")}
          </span>
        </div>
        <Button
          variant={checked ? "outlined" : "contained"}
          onClick={onVerify}
          disabled={verifying}
          startIcon={verifying ? <CircularProgress size={16} color="inherit" /> : <ShieldCheck size={18} aria-hidden />}
          className={styles.verify}
        >
          {verifying ? "Đang kiểm tra…" : checked ? "Kiểm tra lại" : "Kiểm tra toàn vẹn"}
        </Button>
      </div>

      <div className={styles.status} role="status">
        <span className={styles.statusIcon}><HeadIcon size={22} aria-hidden /></span>
        <div>
          <p className={styles.statusTitle}>{head.title}</p>
          <p className={styles.statusText}>{head.text}</p>
        </div>
      </div>

      <ol className={styles.progress} aria-label="Tiến trình các chặng">
        {PHASES.map(phase => {
          const state = phaseState(chain.stops, phase.key)
          const Icon = phase.icon
          const tone = state ? STOP_STATES[state].tone : "empty"
          return (
            <li key={phase.key} className={`${styles.phase} ${styles[`phase_${tone}`]}`}>
              <span className={styles.phaseDot}><Icon size={16} aria-hidden /></span>
              <span className={styles.phaseLabel}>{phase.label}</span>
              <span className={styles.srOnly}>{state ? STOP_STATES[state].label : "Không có dữ liệu"}</span>
            </li>
          )
        })}
      </ol>

      {verifyError && <p className={styles.verifyError} role="alert">{verifyError}</p>}

      {problems.length > 0 && (
        <ul className={styles.issues}>
          {problems.map((issue, index) => (
            <li key={`${issue.stopKey}-${index}`} className={styles[`issue_${issue.tone}`]}>
              <a href={`#stop-${issue.stopKey}`}>{issue.stopTitle}</a>: {issue.message}
            </li>
          ))}
        </ul>
      )}
      {missing > 0 && (
        <p className={styles.note}>{missing} chặng chưa được niêm phong (thường là dữ liệu tạo trước khi bật blockchain).</p>
      )}
    </article>
  )
}

function formatDay(value) {
  if (!value) return ""
  const [year, month, day] = value.split("-")
  return `${day}/${month}/${year}`
}

TraceSummary.propTypes = {
  chain: PropTypes.object.isRequired,
  checked: PropTypes.bool,
  verifying: PropTypes.bool,
  verifyError: PropTypes.string,
  onVerify: PropTypes.func.isRequired,
}
