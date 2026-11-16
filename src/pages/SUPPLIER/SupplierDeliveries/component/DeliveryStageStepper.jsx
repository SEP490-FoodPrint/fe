import PropTypes from "prop-types"
import { Check } from "@mui/icons-material"
import styles from "./DeliveryStageStepper.module.scss"

export const DEFAULT_ORDER_STEPS = [
  {
    key: "CONFIRM",
    title: "1. Tiếp nhận & xác nhận đơn",
    statusText: "Đã xác nhận",
  },
  {
    key: "INGREDIENTS",
    title: "2. Nguyên liệu & nguồn cung",
    statusText: "Đang chuẩn bị hàng",
  },
  {
    key: "LOGISTICS",
    title: "3. Vận chuyển & biển số xe",
    statusText: "Đang giao hàng",
  },
]

function DeliveryStageStepper({
  activeIndex = 0,
  steps = DEFAULT_ORDER_STEPS,
  onStepSelect,
  isStepClickable,
}) {
  const defaultClickable = (_step, index) =>
    Boolean(onStepSelect) && index < activeIndex

  const checkClickable = isStepClickable || defaultClickable

  return (
    <nav className={styles.stepperNav} aria-label="Tiến trình thực hiện đơn">
      <ol
        className={styles.stepList}
        style={{ "--step-count": Math.max(1, steps.length) }}
      >
        {steps.map((step, index) => {
          const isDone = index < activeIndex
          const isActive = index === activeIndex
          const clickable = Boolean(onStepSelect) && Boolean(checkClickable(step, index))
          const stateClass = isDone
            ? styles.stepDone
            : isActive
              ? styles.stepActive
              : styles.stepPending

          const inner = (
            <>
              <span className={styles.stepCircle} aria-hidden="true">
                {isDone ? <Check className={styles.checkIcon} /> : index + 1}
              </span>
              <span className={styles.stepText}>
                <span className={styles.stepTitle}>{step.title}</span>
                {step.statusText && (
                  <span className={styles.stepStatus}>
                    {isDone ? `${step.statusText} · Hoàn tất` : step.statusText}
                  </span>
                )}
              </span>
            </>
          )

          return (
            <li
              key={step.key}
              className={`${styles.stepItem} ${stateClass} ${
                clickable ? styles.stepClickable : ""
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              {clickable ? (
                <button
                  type="button"
                  className={styles.stepTrigger}
                  onClick={() => onStepSelect(step, index)}
                >
                  {inner}
                </button>
              ) : (
                <div className={styles.stepStatic}>{inner}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

DeliveryStageStepper.propTypes = {
  activeIndex: PropTypes.number,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      statusText: PropTypes.string,
    }),
  ),
  onStepSelect: PropTypes.func,
  isStepClickable: PropTypes.func,
}

export default DeliveryStageStepper
