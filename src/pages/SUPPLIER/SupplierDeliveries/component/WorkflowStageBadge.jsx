import PropTypes from "prop-types"
import { getWorkflowStageStatusMeta } from "src/services/SupplierDeliveryService"
import styles from "./WorkflowStageBadge.module.scss"

const TONE_CLASS = {
  warning: styles.toneWarning,
  success: styles.toneSuccess,
  info: styles.toneInfo,
  muted: styles.toneMuted,
}

function WorkflowStageBadge({ status }) {
  const meta = getWorkflowStageStatusMeta(status)
  const toneClass = TONE_CLASS[meta.tone] || styles.toneMuted

  return (
    <span className={`${styles.badge} ${toneClass}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  )
}

WorkflowStageBadge.propTypes = {
  status: PropTypes.string.isRequired,
}

export default WorkflowStageBadge
