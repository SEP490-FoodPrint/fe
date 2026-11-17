import React, { useCallback, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Button, Card, CircularProgress, Collapse } from "@mui/material"
import {
  AlertTriangle, CheckCircle2, ChevronDown, ExternalLink, FileText, RefreshCw,
  ShieldAlert, ShieldCheck, ShieldEllipsis, ShieldQuestion, XCircle,
} from "lucide-react"
import BlockchainProofService from "src/services/BlockchainProofService"
import {
  CHECK_STATES, DOCUMENT_STATES, SEAL_STATES, firstUnconfirmed, latestConfirmed, sealState, shortHash,
} from "src/services/BlockchainProofService/adapter"
import styles from "./BlockchainProofCard.module.scss"

const POLL_MS = 8000
const MAX_POLLS = 15
const SEAL_ICONS = { NONE: ShieldQuestion, PENDING: ShieldEllipsis, FAILED: ShieldAlert, CONFIRMED: ShieldCheck }
const RESULT_ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, neutral: AlertTriangle }

function formatTime(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const pad = number => String(number).padStart(2, "0")
  return `${pad(date.getHours())}:${pad(date.getMinutes())} · ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

/**
 * Shows whether a record is sealed on the blockchain, in plain language.
 * Hidden when the viewer has no permission (403) so pages can mount it unconditionally.
 */
export default function BlockchainProofCard({
  kind, recordId = null, title = "Niêm phong blockchain", canVerify = false, canAnchor = false, refreshKey = null,
}) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(null)
  const [check, setCheck] = useState(null)
  const [checkError, setCheckError] = useState("")
  const [open, setOpen] = useState(false)
  const [reload, setReload] = useState(0)
  const polls = useRef(0)

  const load = useCallback(async signal => {
    try {
      const rows = await BlockchainProofService.listVersions(kind, recordId, { signal })
      setVersions(rows)
      setError("")
      return rows
    } catch (err) {
      if (signal?.aborted) return null
      if (err.status === 403 || err.status === 401) setHidden(true)
      else setError(err.message)
      return null
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [kind, recordId])

  useEffect(() => {
    if (!recordId) return undefined
    const controller = new AbortController()
    let timer = null
    polls.current = 0
    setLoading(true)
    setCheck(null)
    setCheckError("")
    const tick = async () => {
      const rows = await load(controller.signal)
      // Keep refreshing while the transaction is on its way, then stop.
      if (rows && sealState(rows) === "PENDING" && polls.current < MAX_POLLS) {
        polls.current += 1
        timer = setTimeout(tick, POLL_MS)
      }
    }
    tick()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [load, recordId, refreshKey, reload])

  if (hidden || !recordId) return null

  const state = sealState(versions)
  const seal = SEAL_STATES[state]
  const SealIcon = SEAL_ICONS[state]
  const confirmed = latestConfirmed(versions)
  const retry = firstUnconfirmed(versions)
  const lastCheck = versions
    .filter(item => item.verifiedAt)
    .sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt))[0]
  const headingId = `proof-${kind}-${recordId}`

  const runCheck = async () => {
    if (!confirmed) return
    setBusy("verify")
    setCheckError("")
    try {
      const result = await BlockchainProofService.verify(kind, confirmed.id)
      setCheck(result)
      setVersions(rows => rows.map(row => (row.id === result.id ? { ...row, ...result } : row)))
    } catch (err) {
      setCheckError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const runAnchor = async () => {
    if (!retry) return
    setBusy("anchor")
    setCheckError("")
    try {
      await BlockchainProofService.anchor(kind, retry.id)
    } catch (err) {
      setCheckError(err.message)
    } finally {
      setBusy(null)
      setReload(value => value + 1)
    }
  }

  const checkState = check ? CHECK_STATES[check.verificationStatus] || CHECK_STATES.FAILED : null
  const ResultIcon = checkState ? RESULT_ICONS[checkState.tone] : null

  return (
    <Card component="section" variant="outlined" className={styles.card} aria-labelledby={headingId} aria-busy={loading}>
      <header className={styles.header}>
        <span className={`${styles.icon} ${styles[loading || error ? "neutral" : seal.tone]}`} aria-hidden="true">
          {loading ? <CircularProgress size={18} color="inherit" /> : <SealIcon size={20} />}
        </span>
        <div className={styles.heading}>
          <h2 id={headingId}>{title}</h2>
          <p>Bằng chứng chống chỉnh sửa, ghi trên blockchain</p>
        </div>
        {!loading && !error && <span className={`${styles.badge} ${styles[seal.tone]}`}>{seal.label}</span>}
      </header>

      {loading ? (
        <p className={styles.description} role="status">Đang kiểm tra trạng thái niêm phong…</p>
      ) : error ? (
        <div className={`${styles.notice} ${styles.warning}`} role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button size="small" onClick={() => setReload(value => value + 1)}>Thử lại</Button>
        </div>
      ) : (
        <>
          <p className={styles.description}>{seal.description}</p>

          {versions.length > 0 && (
            <dl className={styles.facts}>
              <div><dt>Niêm phong lúc</dt><dd>{formatTime(confirmed?.recordedAt)}</dd></div>
              <div><dt>Số lần ghi nhận</dt><dd>{versions.length}</dd></div>
              <div>
                <dt>Kiểm tra gần nhất</dt>
                <dd>{lastCheck ? <>{CHECK_STATES[lastCheck.verificationStatus]?.label} <span className={styles.subtle}>· {formatTime(lastCheck.verifiedAt)}</span></> : "Chưa kiểm tra"}</dd>
              </div>
            </dl>
          )}

          {check && checkState && (
            <div className={`${styles.result} ${styles[checkState.tone]}`} role="status">
              <div className={styles.resultHead}>
                <ResultIcon size={18} aria-hidden="true" />
                <div>
                  <strong>{checkState.label}</strong>
                  {check.verificationResult && <p>{check.verificationResult}</p>}
                </div>
              </div>
              {check.documents?.length > 0 && (
                <ul className={styles.files} aria-label="Đối chiếu từng tệp minh chứng">
                  {check.documents.map(document => {
                    const status = DOCUMENT_STATES[document.status] || DOCUMENT_STATES.NO_HASH
                    return (
                      <li key={document.id || document.fileName}>
                        <FileText size={16} aria-hidden="true" />
                        <span className={styles.fileName}>{document.fileName}</span>
                        <span className={`${styles.pill} ${styles[status.tone]}`}>{status.label}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
          {checkError && (
            <div className={`${styles.notice} ${styles.warning}`} role="alert">
              <AlertTriangle size={18} aria-hidden="true" /><span>{checkError}</span>
            </div>
          )}

          {(versions.length > 0) && (
            <div className={styles.actions}>
              {canVerify && confirmed && (
                <Button variant="contained" onClick={runCheck} disabled={Boolean(busy)}
                  startIcon={busy === "verify" ? <CircularProgress size={14} color="inherit" /> : <ShieldCheck size={18} />}>
                  {busy === "verify" ? "Đang đối chiếu…" : "Kiểm tra toàn vẹn"}
                </Button>
              )}
              {canAnchor && state === "FAILED" && retry && (
                <Button variant="outlined" onClick={runAnchor} disabled={Boolean(busy)} startIcon={<RefreshCw size={18} />}>
                  {busy === "anchor" ? "Đang gửi lại…" : "Gửi lại lên blockchain"}
                </Button>
              )}
              <Button variant="text" className={styles.toggle} onClick={() => setOpen(value => !value)} aria-expanded={open}
                endIcon={<ChevronDown size={16} className={open ? styles.rotated : styles.chevron} />}>
                {open ? "Ẩn lịch sử ghi nhận" : "Xem lịch sử ghi nhận"}
              </Button>
            </div>
          )}

          <Collapse in={open} unmountOnExit>
            <ol className={styles.timeline} aria-label="Lịch sử ghi nhận trên blockchain">
              {versions.map(version => {
                const step = SEAL_STATES[sealState([version])]
                return (
                  <li key={version.id} className={styles[step.tone]}>
                    <span className={styles.dot} aria-hidden="true" />
                    <div className={styles.stepHead}>
                      <span className={styles.stepTitle}>Lần {version.version} · {version.eventLabel}</span>
                      <span className={`${styles.pill} ${styles[step.tone]}`}>{step.label}</span>
                    </div>
                    <dl className={styles.meta}>
                      <div><dt>Thời điểm ghi</dt><dd>{formatTime(version.recordedAt || version.createdAt)}</dd></div>
                      <div><dt>Mã băm dữ liệu</dt><dd className={styles.mono} title={version.dataHash || ""}>{shortHash(version.dataHash)}</dd></div>
                      <div>
                        <dt>Giao dịch</dt>
                        <dd className={styles.mono}>
                          {version.explorerUrl
                            ? <a href={version.explorerUrl} target="_blank" rel="noopener noreferrer" title="Mở trên Etherscan">{shortHash(version.transactionHash)}<ExternalLink size={12} aria-hidden="true" /></a>
                            : shortHash(version.transactionHash)}
                        </dd>
                      </div>
                      {version.verificationStatus !== "NOT_VERIFIED" && (
                        <div><dt>Kiểm tra</dt><dd>{CHECK_STATES[version.verificationStatus]?.label} <span className={styles.subtle}>· {formatTime(version.verifiedAt)}</span></dd></div>
                      )}
                      {version.transactionStatus === "FAILED" && version.lastError && (
                        <div className={styles.wide}><dt>Lỗi</dt><dd>{version.lastError}</dd></div>
                      )}
                    </dl>
                  </li>
                )
              })}
            </ol>
          </Collapse>
        </>
      )}
    </Card>
  )
}

BlockchainProofCard.propTypes = {
  kind: PropTypes.oneOf(["deliveries", "cooking-batches", "retained-samples", "registrations"]).isRequired,
  recordId: PropTypes.string,
  title: PropTypes.string,
  canVerify: PropTypes.bool,
  canAnchor: PropTypes.bool,
  refreshKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}
