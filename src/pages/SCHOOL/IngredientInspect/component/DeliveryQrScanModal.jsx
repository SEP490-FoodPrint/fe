import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Dialog } from "@mui/material"
import { ScanLine, X } from "lucide-react"
import InlineError from "src/components/InlineError"
import styles from "./DeliveryQrScanModal.module.scss"

const canScanWithCamera = () =>
  typeof window !== "undefined" &&
  "BarcodeDetector" in window &&
  Boolean(navigator.mediaDevices?.getUserMedia)

/**
 * Quét tem QR trên hàng khi xe giao tới (camera qua BarcodeDetector của trình duyệt),
 * hoặc nhập / dán mã thủ công (link tem QR, mã QR lô, mã đợt giao).
 */
export default function DeliveryQrScanModal({ open, onClose, onSubmitCode, searching = false, error = "" }) {
  const videoRef = useRef(null)
  const [cameraError, setCameraError] = useState("")
  const [manualCode, setManualCode] = useState("")
  const supported = canScanWithCamera()
  // Giữ giá trị mới nhất mà không khởi động lại camera.
  const searchingRef = useRef(searching)
  const submitRef = useRef(onSubmitCode)
  const lastScanRef = useRef({ value: "", at: 0 })
  searchingRef.current = searching
  submitRef.current = onSubmitCode

  useEffect(() => {
    if (!open) {
      setManualCode("")
      setCameraError("")
      return undefined
    }
    if (!supported) return undefined
    let stream = null
    let timer = null
    let stopped = false
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] })

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((media) => {
        if (stopped) {
          media.getTracks().forEach((track) => track.stop())
          return
        }
        stream = media
        const video = videoRef.current
        if (!video) return
        video.srcObject = media
        video.play().catch(() => {})
        timer = setInterval(async () => {
          if (!video.videoWidth || searchingRef.current) return
          try {
            const codes = await detector.detect(video)
            const value = codes[0]?.rawValue?.trim()
            const last = lastScanRef.current
            // Bỏ qua cùng một mã trong 3 giây để không gửi trùng.
            if (!value || stopped || (value === last.value && Date.now() - last.at < 3000)) return
            lastScanRef.current = { value, at: Date.now() }
            submitRef.current(value)
          } catch {
            // Bỏ qua khung hình lỗi, thử lại ở lần quét sau.
          }
        }, 400)
      })
      .catch((failure) => {
        setCameraError(
          failure?.name === "NotAllowedError"
            ? "Chưa được cấp quyền camera. Hãy cho phép camera hoặc nhập mã bên dưới."
            : "Không mở được camera. Hãy nhập hoặc dán mã bên dưới.",
        )
      })

    return () => {
      stopped = true
      if (timer) clearInterval(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [open, supported])

  const submitManual = (event) => {
    event.preventDefault()
    if (manualCode.trim()) onSubmitCode(manualCode.trim())
  }

  return (
    <Dialog open={open} onClose={searching ? undefined : onClose} maxWidth="xs" fullWidth classes={{ paper: styles.paper }} aria-labelledby="qr-scan-title">
      <header className={styles.header}>
        <ScanLine size={20} className={styles.headerIcon} aria-hidden="true" />
        <h2 id="qr-scan-title" className={styles.title}>Quét mã QR xe giao</h2>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng" disabled={searching}>
          <X size={18} />
        </button>
      </header>

      <div className={styles.body}>
        {supported && !cameraError ? (
          <div className={styles.viewport}>
            <video ref={videoRef} className={styles.video} muted playsInline aria-label="Camera quét mã QR" />
            <span className={styles.frame} aria-hidden="true" />
            <p className={styles.hint}>{searching ? "Đang tìm xe giao…" : "Đưa tem QR trên hàng vào khung"}</p>
          </div>
        ) : (
          <p className={styles.notice}>
            {cameraError ||
              "Trình duyệt này chưa hỗ trợ quét trực tiếp. Bạn có thể quét tem bằng ứng dụng Camera rồi dán link vào ô bên dưới."}
          </p>
        )}

        <InlineError messages={error} />

        <form className={styles.manual} onSubmit={submitManual}>
          <label htmlFor="qr-manual-code" className={styles.label}>Hoặc nhập / dán mã</label>
          <div className={styles.manualRow}>
            <input
              id="qr-manual-code"
              className={styles.input}
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="Link tem QR hoặc mã đợt giao"
              autoComplete="off"
              disabled={searching}
            />
            <button type="submit" className={styles.submitBtn} disabled={searching || !manualCode.trim()}>
              {searching ? "Đang tìm…" : "Tìm"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

DeliveryQrScanModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitCode: PropTypes.func.isRequired,
  searching: PropTypes.bool,
  error: PropTypes.string,
}
