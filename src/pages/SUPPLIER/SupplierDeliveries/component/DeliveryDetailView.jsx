import React, { useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  Add,
  InfoOutlined,
  KeyboardArrowLeft,
  LocalShippingOutlined,
  QrCode2,
  ReplayOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import SupplierDeliveryService, {
  DELIVERY_SOURCE_TYPE,
  DELIVERY_STATUS,
  extractApiError,
  formatDateTimeVi,
  formatQuantityVi,
  formatSourceFacilityLabel,
  toIsoWithTimezoneOffset,
  validateDeliveryLogisticsStep,
} from "src/services/SupplierDeliveryService"
import DeliveryQrLabelsModal from "./DeliveryQrLabelsModal"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import styles from "./DeliveryDetailView.module.scss"

function getLifecycleBanner(status) {
  switch (status) {
    case DELIVERY_STATUS.PREPARING:
      return {
        tone: "warning",
        text: "Đơn đang ở trạng thái Đang chuẩn bị hàng. Nhập thời gian dự kiến đến trường và biển số xe để bắt đầu giao hàng.",
      }
    case DELIVERY_STATUS.IN_TRANSIT:
      return {
        tone: "info",
        text: "Đơn đang ở trạng thái Đang giao. Đơn chỉ chuyển sang Hoàn thành sau khi hàng đến trường và các vai trò liên quan kiểm nhận đạt.",
      }
    case DELIVERY_STATUS.ARRIVED:
    case DELIVERY_STATUS.PENDING_APPROVAL:
      return {
        tone: "warning",
        text: "Hàng đã đến trường và đang chờ các vai trò liên quan kiểm tra chất lượng trước khi hoàn thành.",
      }
    case DELIVERY_STATUS.APPROVED:
    case DELIVERY_STATUS.RECEIVED:
      return {
        tone: "success",
        text: "Các vai trò kiểm nhận tại trường đã kiểm tra đạt — đơn giao hàng đã hoàn thành.",
      }
    case DELIVERY_STATUS.REJECTED:
      return {
        tone: "error",
        text: "Kiểm nhận tại trường không đạt — trạng thái hiện tại là Yêu cầu giao hàng lại. Vui lòng tạo đơn giao thủ công mới để xử lý giao lại.",
      }
    default:
      return null
  }
}

function DeliveryDetailView({
  delivery,
  loading = false,
  error = null,
  onRetry,
  onDispatched,
}) {
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [focusedQrItemId, setFocusedQrItemId] = useState(null)
  const [expectedArrivalLocal, setExpectedArrivalLocal] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [dispatchErrors, setDispatchErrors] = useState({})
  const [dispatchSubmitError, setDispatchSubmitError] = useState("")
  const [dispatching, setDispatching] = useState(false)

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_DELIVERIES}
              className={styles.backBtn}
              aria-label="Quay lại danh sách đơn giao hàng"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết đơn giao hàng</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>Đang tải thông tin đơn giao hàng...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !delivery) {
    const status = error?.status
    const errorTitle =
      status === 403
        ? "Không có quyền truy cập đơn giao hàng"
        : status === 404 || status === 400
          ? "Không tìm thấy đơn giao hàng"
          : "Không thể tải chi tiết đơn giao hàng"

    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_DELIVERIES}
              className={styles.backBtn}
              aria-label="Quay lại danh sách đơn giao hàng"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết đơn giao hàng</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>{errorTitle}</p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Đơn giao hàng không tồn tại hoặc không thuộc nhà cung cấp hiện tại."}
            </p>
            <div className={styles.stateActions}>
              {onRetry && status !== 404 && status !== 403 && status !== 400 && (
                <Button variant="outlined" color="primary" onClick={onRetry}>
                  Thử lại
                </Button>
              )}
              <Button
                component={Link}
                to={ROUTER.SUPPLIER_DELIVERIES}
                variant="contained"
                color="primary"
              >
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isRequestSource = delivery.sourceType === DELIVERY_SOURCE_TYPE.REQUEST
  const items = Array.isArray(delivery.items) ? delivery.items : []
  const isTraceable = delivery.traceabilityVersion === 1
  const isRejected = delivery.status === DELIVERY_STATUS.REJECTED
  const canEnterShipping =
    delivery.nextAction === "ENTER_SHIPPING" ||
    (delivery.status === DELIVERY_STATUS.PREPARING && !delivery.nextAction)
  const recreateUrl = `${ROUTER.SUPPLIER_DELIVERY_CREATE}?prefillDeliveryId=${encodeURIComponent(delivery.id)}`
  const lifecycleBanner = getLifecycleBanner(delivery.status)

  const handleDispatchSubmit = async event => {
    event.preventDefault()
    if (dispatching) return
    setDispatchSubmitError("")

    const check = validateDeliveryLogisticsStep({
      expectedArrivalLocal,
      vehiclePlate,
    })
    setDispatchErrors(check.errors)
    if (!check.valid) return

    setDispatching(true)
    try {
      const expectedArrivalAt = toIsoWithTimezoneOffset(expectedArrivalLocal)
      const updated = await SupplierDeliveryService.dispatch(delivery.id, {
        expectedArrivalAt,
        vehiclePlate,
      })
      onDispatched?.(updated)
    } catch (err) {
      const parsed = extractApiError(
        err,
        "Không thể cập nhật thông tin vận chuyển. Vui lòng thử lại.",
      )
      setDispatchSubmitError(parsed.message)
      if (parsed.fieldErrors?.expectedArrivalAt || parsed.fieldErrors?.vehiclePlate) {
        setDispatchErrors(prev => ({
          ...prev,
          ...(parsed.fieldErrors?.expectedArrivalAt
            ? { expectedArrivalAt: parsed.fieldErrors.expectedArrivalAt }
            : {}),
          ...(parsed.fieldErrors?.vehiclePlate
            ? { vehiclePlate: parsed.fieldErrors.vehiclePlate }
            : {}),
        }))
      }
    } finally {
      setDispatching(false)
    }
  }

  const handleOpenAllLabels = () => {
    setFocusedQrItemId(null)
    setQrModalOpen(true)
  }

  const handleOpenSingleLabel = itemId => {
    setFocusedQrItemId(itemId || null)
    setQrModalOpen(true)
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderBar}>
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SUPPLIER_DELIVERIES}
            className={styles.backBtn}
            aria-label="Quay lại danh sách đơn giao hàng"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
          </Link>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>Chi tiết đơn giao hàng</h1>
            {delivery.deliveryNo && (
              <span className={styles.codeChip}>{delivery.deliveryNo}</span>
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          {isTraceable && items.length > 0 && (
            <Button
              type="button"
              variant={isRejected ? "outlined" : "contained"}
              color="primary"
              className={styles.createBtn}
              startIcon={<QrCode2 />}
              onClick={handleOpenAllLabels}
            >
              {`Nhãn QR bao bì (${items.length})`}
            </Button>
          )}

          {isRejected ? (
            <Button
              component={Link}
              to={recreateUrl}
              variant="contained"
              color="primary"
              className={styles.createBtn}
              startIcon={<ReplayOutlined />}
            >
              Tạo đơn thủ công giao lại
            </Button>
          ) : (
            <Button
              component={Link}
              to={ROUTER.SUPPLIER_DELIVERY_CREATE}
              variant="outlined"
              color="primary"
              className={styles.createBtn}
              startIcon={<Add />}
            >
              Tạo đơn thủ công
            </Button>
          )}
        </div>
      </div>

      {/* Section 1: Header info */}
      <section className={styles.detailCard} aria-labelledby="delivery-info-heading">
        <div className={styles.cardHeader}>
          <h2 id="delivery-info-heading" className={styles.sectionTitle}>
            Thông tin đơn giao hàng
          </h2>
          <DeliveryStatusBadge
            status={delivery.status}
            statusLabel={delivery.statusLabel}
          />
        </div>

        {lifecycleBanner && (
          <div
            className={`${styles.lifecycleBanner} ${
              lifecycleBanner.tone === "error"
                ? styles.bannerError
                : lifecycleBanner.tone === "success"
                  ? styles.bannerSuccess
                  : lifecycleBanner.tone === "warning"
                    ? styles.bannerWarning
                    : styles.bannerInfo
            }`}
            role="status"
          >
            <div className={styles.bannerTextWrap}>
              <InfoOutlined className={styles.bannerIcon} aria-hidden="true" />
              <span>{lifecycleBanner.text}</span>
            </div>
            {isRejected && (
              <Button
                component={Link}
                to={recreateUrl}
                variant="outlined"
                color="error"
                size="small"
                className={styles.bannerCtaBtn}
              >
                Tạo đơn thủ công
              </Button>
            )}
          </div>
        )}

        <dl className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Mã đơn giao</dt>
            <dd className={styles.metaValue}>{delivery.deliveryNo || "—"}</dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Trường nhận hàng</dt>
            <dd className={styles.metaValue}>{delivery.schoolName}</dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Nguồn tạo đơn</dt>
            <dd className={styles.metaValue}>
              {isRequestSource ? (
                delivery.supplyRequestId ? (
                  <Link
                    to={`${ROUTER.SUPPLIER_ORDERS}/${delivery.supplyRequestId}`}
                    className={styles.inlineLink}
                  >
                    {`Từ yêu cầu ${delivery.requestNo || delivery.supplyRequestId}`}
                  </Link>
                ) : (
                  "Từ yêu cầu của trường"
                )
              ) : (
                "Tạo đơn thủ công"
              )}
            </dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Thời gian dự kiến đến</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(delivery.expectedArrivalAt)}
            </dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Biển số xe</dt>
            <dd className={styles.metaValue}>{delivery.vehiclePlate || "—"}</dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Thời điểm tạo phiếu</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(delivery.createdAt)}
            </dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Thời điểm đến trường</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(delivery.arrivedAt)}
            </dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Thời điểm hoàn thành</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(delivery.receivedAt)}
            </dd>
          </div>
        </dl>

        <div className={styles.noteSection}>
          <span className={styles.metaLabel}>Ghi chú giao hàng</span>
          {delivery.note ? (
            <p className={styles.noteText}>{delivery.note}</p>
          ) : (
            <p className={styles.noteMuted}>Không có ghi chú kèm theo.</p>
          )}
        </div>
      </section>

      {/* Section 2: Pending Shipping / Dispatch (when status === PREPARING) */}
      {canEnterShipping && (
        <section
          className={styles.detailCard}
          aria-labelledby="dispatch-section-heading"
        >
          <div className={styles.cardHeader}>
            <h2 id="dispatch-section-heading" className={styles.sectionTitle}>
              Thông tin vận chuyển &amp; bắt đầu giao hàng
            </h2>
          </div>

          <form
            className={styles.dispatchForm}
            onSubmit={handleDispatchSubmit}
            noValidate
          >
            <div className={styles.dispatchGrid}>
              <div className={styles.dispatchFieldGroup}>
                <label
                  htmlFor="detail-expected-arrival-input"
                  className={styles.metaLabel}
                >
                  <span>{"Thời gian dự kiến đến trường "}</span>
                  <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  id="detail-expected-arrival-input"
                  type="datetime-local"
                  required
                  disabled={dispatching}
                  value={expectedArrivalLocal}
                  onChange={event => {
                    setExpectedArrivalLocal(event.target.value)
                    setDispatchErrors(prev => ({
                      ...prev,
                      expectedArrivalAt: undefined,
                    }))
                  }}
                  className={`${styles.dispatchInput} ${
                    dispatchErrors.expectedArrivalAt ? styles.hasError : ""
                  }`}
                  aria-invalid={Boolean(dispatchErrors.expectedArrivalAt)}
                />
                {dispatchErrors.expectedArrivalAt && (
                  <p className={styles.fieldError} role="alert">
                    {dispatchErrors.expectedArrivalAt}
                  </p>
                )}
              </div>

              <div className={styles.dispatchFieldGroup}>
                <label
                  htmlFor="detail-vehicle-plate-input"
                  className={styles.metaLabel}
                >
                  <span>{"Biển số xe giao hàng "}</span>
                  <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  id="detail-vehicle-plate-input"
                  type="text"
                  required
                  maxLength={40}
                  disabled={dispatching}
                  placeholder="VD: 51C-12345"
                  value={vehiclePlate}
                  onChange={event => {
                    setVehiclePlate(event.target.value)
                    setDispatchErrors(prev => ({
                      ...prev,
                      vehiclePlate: undefined,
                    }))
                  }}
                  className={`${styles.dispatchInput} ${
                    dispatchErrors.vehiclePlate ? styles.hasError : ""
                  }`}
                  aria-invalid={Boolean(dispatchErrors.vehiclePlate)}
                />
                {dispatchErrors.vehiclePlate && (
                  <p className={styles.fieldError} role="alert">
                    {dispatchErrors.vehiclePlate}
                  </p>
                )}
              </div>
            </div>

            {dispatchSubmitError && (
              <p className={styles.submitErrorBanner} role="alert">
                {dispatchSubmitError}
              </p>
            )}

            <div className={styles.dispatchFooter}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={styles.createBtn}
                disabled={dispatching}
                startIcon={<LocalShippingOutlined fontSize="small" />}
              >
                {dispatching ? "Đang cập nhật..." : "Lưu & bắt đầu giao hàng"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Section 3: Items */}
      <section className={styles.detailCard} aria-labelledby="delivery-items-heading">
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <h2 id="delivery-items-heading" className={styles.sectionTitle}>
              Danh sách nguyên liệu & Truy xuất bao bì
            </h2>
            {!isTraceable && (
              <span className={styles.legacyBadge}>Đơn cũ (chưa có QR)</span>
            )}
          </div>
          <span className={styles.itemCountChip}>{`${items.length} mặt hàng`}</span>
        </div>

        {items.length === 0 ? (
          <div className={styles.stateBox}>
            <p className={styles.stateDesc}>Đơn giao chưa có dòng nguyên liệu nào.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.colStt}>
                      STT
                    </th>
                    <th scope="col" className={styles.colIngredient}>
                      Nguyên liệu
                    </th>
                    <th scope="col" className={styles.colFacility}>
                      Cơ sở nguồn cung
                    </th>
                    <th scope="col" className={styles.colQuantity}>
                      Số lượng giao
                    </th>
                    <th scope="col" className={styles.colUnit}>
                      Đơn vị
                    </th>
                    <th scope="col" className={styles.colNote}>
                      Ghi chú
                    </th>
                    <th scope="col" className={styles.colQr}>
                      QR bao bì
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className={`${styles.colStt} ${styles.cellStt}`}>
                        {idx + 1}
                      </td>
                      <td className={styles.colIngredient}>
                        {item.ingredientName}
                      </td>
                      <td className={styles.colFacility}>
                        {item.sourceFacility ? (
                          <span className={styles.facilityText}>
                            {formatSourceFacilityLabel(item.sourceFacility)}
                          </span>
                        ) : (
                          <span className={styles.legacyMuted}>
                            Chưa gắn cơ sở
                          </span>
                        )}
                      </td>
                      <td className={styles.colQuantity}>
                        {formatQuantityVi(item.actualQuantity)}
                      </td>
                      <td className={styles.colUnit}>{item.unit || "—"}</td>
                      <td className={styles.colNote}>{item.note || "—"}</td>
                      <td className={styles.colQr}>
                        {isTraceable ? (
                          <button
                            type="button"
                            className={styles.qrRowBtn}
                            onClick={() => handleOpenSingleLabel(item.id)}
                          >
                            <QrCode2 fontSize="small" aria-hidden="true" />
                            <span>Xem QR</span>
                          </button>
                        ) : (
                          <span className={styles.legacyMuted}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className={styles.mobileItemsList} aria-label="Danh sách nguyên liệu giao">
              {items.map((item, idx) => (
                <li key={item.id || idx} className={styles.mobileItemRow}>
                  <div className={styles.mobileItemTop}>
                    <span className={styles.mobileItemName}>
                      {`${idx + 1}. ${item.ingredientName}`}
                    </span>
                    <span className={styles.mobileItemQty}>
                      {`${formatQuantityVi(item.actualQuantity)} ${item.unit || ""}`.trim()}
                    </span>
                  </div>
                  <p className={styles.mobileFacilityLine}>
                    {`Cơ sở nguồn cung: ${
                      item.sourceFacility
                        ? formatSourceFacilityLabel(item.sourceFacility)
                        : "Chưa gắn cơ sở"
                    }`}
                  </p>
                  {item.note && (
                    <p className={styles.mobileItemNote}>{`Ghi chú: ${item.note}`}</p>
                  )}
                  {isTraceable && (
                    <button
                      type="button"
                      className={styles.mobileQrBtn}
                      onClick={() => handleOpenSingleLabel(item.id)}
                    >
                      <QrCode2 fontSize="small" aria-hidden="true" />
                      <span>Xem mã QR dán bao bì</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <DeliveryQrLabelsModal
        open={qrModalOpen}
        delivery={delivery}
        initialItemId={focusedQrItemId}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  )
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  onRetry: PropTypes.func,
  onDispatched: PropTypes.func,
}

export default DeliveryDetailView
