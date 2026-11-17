import React, { useState } from "react"
import PropTypes from "prop-types"
import { ChevronDown } from "lucide-react"
import { STOP_STATES, formatTime } from "src/services/BlockchainProofService/chainAdapter"
import { PHASES } from "./TraceSummary"
import TraceStopProofs from "./TraceStopProofs"
import styles from "./TraceTimeline.module.scss"

const ICONS = Object.fromEntries(PHASES.map(phase => [phase.key, phase.icon]))

/** Vertical journey, newest step last; a changed or missing step stands out in place. */
export default function TraceTimeline({ stops, checked }) {
  const [open, setOpen] = useState(() => new Set(stops.filter(stop => stop.state === "BROKEN").map(stop => stop.key)))
  const toggle = key => setOpen(current => {
    const next = new Set(current)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  return (
    <ol className={styles.timeline} aria-label="Hành trình bữa ăn">
      {stops.map((stop, index) => {
        const Icon = ICONS[stop.phase]
        const state = STOP_STATES[stop.state]
        const isOpen = open.has(stop.key) || stop.state === "BROKEN" && !open.size
        const nextTone = stops[index + 1] ? STOP_STATES[stops[index + 1].state].tone : null
        return (
          <li
            key={stop.key}
            id={`stop-${stop.key}`}
            className={`${styles.stop} ${styles[state.tone]} ${nextTone ? styles[`line_${nextTone}`] : styles.last}`}
          >
            <span className={styles.time}>{formatTime(stop.time) || "—"}</span>
            <span className={styles.rail} aria-hidden>
              <span className={styles.dot}><Icon size={16} /></span>
            </span>

            <div className={styles.card}>
              <div className={styles.head}>
                <div className={styles.titles}>
                  <p className={styles.title}>{stop.title}</p>
                  {stop.subtitle && <p className={styles.subtitle}>{stop.subtitle}</p>}
                </div>
                <span className={styles.badge}>{stop.state === "SEALED" && !checked ? "Đã niêm phong" : state.label}</span>
              </div>

              {stop.facts.length > 0 && (
                <ul className={styles.facts}>
                  {stop.facts.map(fact => <li key={fact}>{fact}</li>)}
                </ul>
              )}

              {stop.issues.map((issue, issueIndex) => (
                <p key={issueIndex} className={`${styles.issue} ${styles[`issue_${issue.tone}`]}`}>{issue.message}</p>
              ))}

              {stop.proofs.length > 0 && (
                <>
                  <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={isOpen}
                    onClick={() => toggle(stop.key)}
                  >
                    Chi tiết niêm phong
                    <ChevronDown size={16} className={isOpen ? styles.chevronOpen : ""} aria-hidden />
                  </button>
                  {isOpen && <TraceStopProofs proofs={stop.proofs} />}
                </>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

TraceTimeline.propTypes = {
  stops: PropTypes.arrayOf(PropTypes.object).isRequired,
  checked: PropTypes.bool,
}
