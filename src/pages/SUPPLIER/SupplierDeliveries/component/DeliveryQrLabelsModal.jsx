import React, { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import PropTypes from "prop-types"
import { Button, CircularProgress } from "@mui/material"
import {
  Close,
  ContentCopy,
  DownloadOutlined,
  OpenInNew,
  PrintOutlined,
  QrCode2,
} from "@mui/icons-material"
import SupplierDeliveryService, {
  extractApiError,
  formatQuantityVi,
  formatSourceFacilityLabel,
} from "src/services/SupplierDeliveryService"
import styles from "./DeliveryQrLabelsModal.module.scss"

function DeliveryQrLabelsModal({
  open,
  delivery,
  initialItemId = null,
  onClose,
}) {
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAllLabels, setShowAllLabels] = useState(true)
  const [copiedId, setCopiedId] = useState("")

  useEffect(() => {
    setShowAllLabels(!initialItemId)
  }, [initialItemId, open])

  useEffect(() => {
    if (!open || !delivery?.id) return undefined
    const controller = new AbortController()
    setLoading(true)
    setError("")

    SupplierDeliveryService.listAllLabels(delivery.id, {
      limit: 50,
      signal: controller.signal,
    })
      .then(items => {
        if (controller.signal.aborted) return
        setLabels(items || [])
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setError(
          extractApiError(
            err,
            "Không thể tải danh sách nhãn QR bao bì cho đơn giao này.",
          ).message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [open, delivery?.id])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = event => {
      if (event.key === "Escape") {
        onClose?.()
      }
    }
    const handleAfterPrint = () => {
      document.body.classList.remove("printing-qr-labels")
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("afterprint", handleAfterPrint)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("afterprint", handleAfterPrint)
      document.body.classList.remove("printing-qr-labels")
    }
  }, [open, onClose])

  const visibleLabels = useMemo(() => {
    if (showAllLabels || !initialItemId) return labels
    const matched = labels.filter(lb => lb.deliveryItemId === initialItemId)
    return matched.length > 0 ? matched : labels
  }, [labels, showAllLabels, initialItemId])

  if (!open || !delivery) return null

  const handleCopyTraceUrl = async (labelId, url) => {
    if (!url || !navigator?.clipboard?.writeText) return
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(labelId)
      window.setTimeout(() => {
        setCopiedId(prev => (prev === labelId ? "" : prev))
      }, 1800)
    } catch {
      // Ignore clipboard failure silently
    }
  }

  const handlePrint = () => {
    if (visibleLabels.length === 0) return
    document.body.classList.add("printing-qr-labels")
    window.print()
  }

  const printSheet =
    typeof document !== "undefined" && visibleLabels.length > 0
      ? createPortal(
          <div className={styles.printOnlySheet} data-qr-print-sheet="true">
            <div className={styles.printSheetHeader}>
              <strong>{`NHÃN QR TRUY XUẤT BAO BÌ · ${delivery.deliveryNo || ""}`}</strong>
              <span>{delivery.schoolName || ""}</span>
            </div>
            <div className={styles.printStickersGrid}>
              {visibleLabels.map(label => (
                <article
                  key={`print-${label.deliveryItemId}`}
                  className={styles.printStickerCard}
                >
                  <div className={styles.stickerTopRow}>
                    <span className={styles.stickerOrderNo}>
                      {label.deliveryNo || delivery.deliveryNo}
                    </span>
                    <span className={styles.stickerSupplier}>
                      {label.supplierName}
                    </span>
                  </div>

                  <div className={styles.printQrBody}>
                    {label.qrImageDataUrl && (
                      <img
                        src={label.qrImageDataUrl}
                        alt={`Mã QR ${label.ingredientName}`}
                        className={styles.printQrImg}
                      />
                    )}
                    <div className={styles.printMetaCol}>
                      <div className={styles.stickerIngredient}>
                        {label.ingredientName}
                      </div>
                      <div className={styles.stickerQty}>
                        {`Định lượng: ${formatQuantityVi(label.actualQuantity)} ${label.unit}`}
                      </div>
                      <div className={styles.stickerFacility}>
                        {`Cơ sở nguồn: ${formatSourceFacilityLabel(label.sourceFacility)}`}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div
        className={styles.backdrop}
        role="presentation"
        onMouseDown={event => {
          if (event.target === event.currentTarget) {
            onClose?.()
          }
        }}
      >
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-labels-modal-title"
        >
          <header className={styles.header}>
            <div className={styles.headerTitleGroup}>
              <QrCode2 className={styles.headerIcon} aria-hidden="true" />
              <h2 id="qr-labels-modal-title" className={styles.title}>
                {`Nhãn QR dán bao bì · ${delivery.deliveryNo || ""}`}
              </h2>
            </div>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng cửa sổ nhãn QR"
            >
              <Close />
            </button>
          </header>

          {initialItemId && labels.length > 1 && (
            <div className={styles.scopeBar}>
              <span className={styles.scopeText}>
                {showAllLabels
                  ? `Đang xem toàn bộ ${labels.length} nhãn nguyên liệu trong đơn.`
                  : "Đang xem nhãn QR của nguyên liệu đã chọn."}
              </span>
              <button
                type="button"
                className={styles.scopeToggleBtn}
                onClick={() => setShowAllLabels(prev => !prev)}
              >
                {showAllLabels
                  ? "Chỉ xem dòng đã chọn"
                  : `Hiển thị tất cả (${labels.length} nhãn)`}
              </button>
            </div>
          )}

          <div className={styles.body}>
            {loading ? (
              <div className={styles.centerState} role="status">
                <CircularProgress size={26} />
                <p>Đang tải mã QR bao bì từ hệ thống...</p>
              </div>
            ) : error ? (
              <div className={styles.errorBox} role="alert">
                {error}
              </div>
            ) : visibleLabels.length === 0 ? (
              <div className={styles.centerState}>
                <p>Chưa có nhãn QR nào cho đơn giao này.</p>
              </div>
            ) : (
              <div className={styles.stickersGrid}>
                {visibleLabels.map((label, idx) => (
                  <article
                    key={label.deliveryItemId || idx}
                    className={styles.stickerCard}
                  >
                    <div className={styles.stickerHeader}>
                      <span className={styles.codeBadge}>
                        {label.deliveryNo || delivery.deliveryNo}
                      </span>
                      <span className={styles.supplierText}>
                        {label.supplierName}
                      </span>
                    </div>

                    <div className={styles.stickerContent}>
                      <div className={styles.qrFrame}>
                        {label.qrImageDataUrl ? (
                          <img
                            src={label.qrImageDataUrl}
                            alt={`Mã QR truy xuất ${label.ingredientName}`}
                            className={styles.qrImage}
                          />
                        ) : (
                          <QrCode2 className={styles.qrFallbackIcon} />
                        )}
                      </div>

                      <div className={styles.infoCol}>
                        <h3 className={styles.ingredientName}>
                          {label.ingredientName}
                        </h3>
                        <p className={styles.qtyLine}>
                          {`${formatQuantityVi(label.actualQuantity)} ${label.unit}`}
                        </p>
                        <div className={styles.facilityBox}>
                          <span className={styles.facilityLabel}>
                            Cơ sở nguồn cung
                          </span>
                          <span className={styles.facilityValue}>
                            {formatSourceFacilityLabel(label.sourceFacility)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.stickerFooter}>
                      <span className={styles.traceUrlText} title={label.traceUrl}>
                        {label.traceUrl || "Không có URL truy xuất"}
                      </span>

                      <div className={styles.stickerActions}>
                        {label.traceUrl && (
                          <>
                            <button
                              type="button"
                              className={styles.miniActionBtn}
                              onClick={() =>
                                handleCopyTraceUrl(
                                  label.deliveryItemId || String(idx),
                                  label.traceUrl,
                                )
                              }
                            >
                              <ContentCopy fontSize="inherit" />
                              <span>
                                {copiedId === (label.deliveryItemId || String(idx))
                                  ? "Đã chép"
                                  : "Sao chép"}
                              </span>
                            </button>

                            <a
                              href={label.traceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.miniActionBtn}
                            >
                              <OpenInNew fontSize="inherit" />
                              <span>Mở</span>
                            </a>
                          </>
                        )}

                        {label.qrImageDataUrl && (
                          <a
                            href={label.qrImageDataUrl}
                            download={`${label.deliveryNo || "QR"}-${idx + 1}.png`}
                            className={styles.miniActionBtn}
                          >
                            <DownloadOutlined fontSize="inherit" />
                            <span>Tải PNG</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <footer className={styles.footer}>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              className={styles.footerBtn}
              onClick={onClose}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              className={styles.footerBtn}
              startIcon={<PrintOutlined />}
              disabled={loading || Boolean(error) || visibleLabels.length === 0}
              onClick={handlePrint}
            >
              In nhãn dán bao bì
            </Button>
          </footer>
        </div>
      </div>

      {printSheet}
    </>
  )
}

DeliveryQrLabelsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  delivery: PropTypes.shape({
    id: PropTypes.string,
    deliveryNo: PropTypes.string,
    schoolName: PropTypes.string,
  }),
  initialItemId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

export default DeliveryQrLabelsModal
