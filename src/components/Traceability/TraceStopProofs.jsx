import React from "react"
import PropTypes from "prop-types"
import { ExternalLink } from "lucide-react"
import { CHECK_STATES, shortHash } from "src/services/BlockchainProofService/adapter"
import { formatTime, readableResult } from "src/services/BlockchainProofService/chainAdapter"
import styles from "./TraceStopProofs.module.scss"

const SEND_LABELS = {
  PREPARED: "Đang chờ gửi",
  SUBMITTED: "Đã gửi, chờ xác nhận",
  CONFIRMED: "Đã ghi lên blockchain",
  FAILED: "Gửi chưa thành công",
}

const LINK_STATES = {
  MATCH: { tone: "success", label: "khớp" },
  MISMATCH: { tone: "error", label: "không khớp" },
  NOT_LINKED: { tone: "neutral", label: "chưa liên kết" },
}

/** The proofs behind one stop: what was sealed, when, and what the last check found. */
export default function TraceStopProofs({ proofs }) {
  return (
    <ul className={styles.list}>
      {proofs.map(proof => {
        const check = CHECK_STATES[proof.verificationStatus] || CHECK_STATES.NOT_VERIFIED
        return (
          <li key={proof.id} className={styles.proof}>
            <div className={styles.row}>
              <span className={styles.event}>{proof.eventLabel}</span>
              <span className={`${styles.pill} ${styles[check.tone]}`}>{check.label}</span>
            </div>

            <dl className={styles.grid}>
              <dt>Trạng thái</dt>
              <dd>{SEND_LABELS[proof.transactionStatus] || proof.transactionStatus}</dd>
              {proof.recordedAt && (<><dt>Thời điểm ghi</dt><dd>{formatTime(proof.recordedAt)}</dd></>)}
              <dt>Dấu vân tay</dt>
              <dd className={styles.mono} title={proof.dataHash || ""}>{shortHash(proof.dataHash)}</dd>
              {proof.blockNumber && (<><dt>Khối</dt><dd className={styles.mono}>#{proof.blockNumber}</dd></>)}
            </dl>

            {proof.verificationResult && (
              <p className={`${styles.result} ${styles[check.tone]}`}>{readableResult(proof.verificationResult)}</p>
            )}

            {proof.links.length > 0 && (
              <ul className={styles.links}>
                {proof.links.map(link => {
                  const state = LINK_STATES[link.status] || LINK_STATES.NOT_LINKED
                  return (
                    <li key={link.field} className={styles[state.tone]}>
                      Liên kết với {link.label}: <strong>{state.label}</strong>
                    </li>
                  )
                })}
              </ul>
            )}

            {proof.lastError && proof.transactionStatus === "FAILED" && (
              <p className={`${styles.result} ${styles.warning}`}>{proof.lastError}</p>
            )}

            {proof.explorerUrl && (
              <a className={styles.explorer} href={proof.explorerUrl} target="_blank" rel="noopener noreferrer">
                Xem giao dịch trên Etherscan <ExternalLink size={14} aria-hidden />
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}

TraceStopProofs.propTypes = {
  proofs: PropTypes.arrayOf(PropTypes.object).isRequired,
}
