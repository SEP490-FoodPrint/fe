import React from "react"
import { Check } from "lucide-react"
import styles from "./BatchTimelineCard.module.scss"

export default function BatchTimelineCard({ status = "UNCONFIRMED" }) {
  const isDraft = status === "DRAFT" || status === "UNCONFIRMED"
  const isConfirmed = status === "CONFIRMED"
  const isCompleted = status === "COMPLETED"

  const steps = [
    {
      id: "draft",
      number: 1,
      title: "Chưa tạo",
      isCurrent: isDraft,
      isDone: !isDraft,
    },
    {
      id: "confirmed",
      number: 2,
      title: "Đang chế biến",
      isCurrent: isConfirmed,
      isDone: isCompleted,
    },
    {
      id: "completed",
      number: 3,
      title: "Đã xong",
      isCurrent: isCompleted,
      isDone: isCompleted,
    },
  ]

  return (
    <section className={styles.timelineCard}>
      <h3 className={styles.cardTitle}>Tiến trình chế biến</h3>
      <div className={styles.stepperRow}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div
              className={`${styles.stepItem} ${
                step.isCurrent
                  ? styles.stepCurrent
                  : step.isDone
                    ? styles.stepDone
                    : styles.stepPending
              }`}
            >
              <div className={styles.stepCircle}>
                {step.isDone && !step.isCurrent ? (
                  <Check size={13} className={styles.checkIcon} />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span className={styles.stepLabel}>{step.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`${styles.stepConnector} ${
                  step.isDone ? styles.connectorDone : ""
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
