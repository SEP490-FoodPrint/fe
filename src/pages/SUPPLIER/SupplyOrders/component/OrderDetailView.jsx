import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  CheckCircleOutlined,
  InfoOutlined,
  KeyboardArrowLeft,
  LocalShippingOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import DeliveryStageStepper from "src/pages/SUPPLIER/SupplierDeliveries/component/DeliveryStageStepper"
import { ORDER_CREATION_STAGE } from "src/services/SupplierDeliveryService"
import {
  formatDateTimeVi,
  formatDateVi,
  formatQuantityVi,
  SUPPLY_ORDER_STATUS,
} from "src/services/SupplierOrderService"
import OrderFulfillmentWorkflow from "./OrderFulfillmentWorkflow"
import OrderStatusBadge from "./OrderStatusBadge"
import styles from "./OrderDetailView.module.scss"

const SUPPLY_ORDER_STEPS = [
  {
    key: "CONFIRM",
    title: "1. Tiếp nhận đơn hàng",
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

function OrderDetailView({
  order,
  createdDelivery = null,
  pendingDispatchDelivery = null,
  fulfillmentStage = ORDER_CREATION_STAGE.INGREDIENTS,
  loading = false,
  error = null,
  accepting = false,
  acceptError = "",
  onRetry,
  onAcceptOrder,
  onChangeFulfillmentStage,
  onSubmitDelivery,
  onDraftChange,
}) {
  if (loading) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_ORDERS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách đơn hàng"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết đơn hàng</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.stateBox} role="status" aria-live="polite">
            <CircularProgress size={28} />
            <p className={styles.stateDesc}>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    const status = error?.status
    const errorTitle =
      status === 403
        ? "Không có quyền truy cập đơn hàng"
        : status === 404 || status === 400
          ? "Không tìm thấy đơn hàng"
          : "Không thể tải chi tiết đơn hàng"

    return (
      <div className={styles.detailPage}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_ORDERS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách đơn hàng"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết đơn hàng</h1>
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>{errorTitle}</p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Đơn đặt hàng không tồn tại, đang ở bản nháp hoặc bạn không thuộc nhà cung cấp tiếp nhận."}
            </p>
            <div className={styles.stateActions}>
              {onRetry && status !== 404 && status !== 403 && status !== 400 && (
                <Button variant="outlined" color="primary" onClick={onRetry}>
                  Thử lại
                </Button>
              )}
              <Button
                component={Link}
                to={ROUTER.SUPPLIER_ORDERS}
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

  const isPendingAccept = order.status === SUPPLY_ORDER_STATUS.SENT
  const isAcceptedStage = order.status === SUPPLY_ORDER_STATUS.ACCEPTED
  const isPreparingStage =
    isAcceptedStage && fulfillmentStage === ORDER_CREATION_STAGE.LOGISTICS
  const isFulfilled =
    order.status === SUPPLY_ORDER_STATUS.IN_PROGRESS ||
    order.status === SUPPLY_ORDER_STATUS.COMPLETED
  const isCancelled = order.status === SUPPLY_ORDER_STATUS.CANCELLED

  const activeStageIndex = isPendingAccept
    ? 0
    : isAcceptedStage
      ? isPreparingStage
        ? 2
        : 1
      : 3

  const displayBadgeStatus = isPreparingStage ? "PREPARING" : order.status

  const matchedDelivery =
    createdDelivery && createdDelivery.supplyRequestId === order.id
      ? createdDelivery
      : null
  const deliveryTargetUrl = matchedDelivery?.id
    ? `${ROUTER.SUPPLIER_DELIVERIES}/${matchedDelivery.id}`
    : `${ROUTER.SUPPLIER_DELIVERIES}?sourceType=REQUEST`
  const items = Array.isArray(order.items) ? order.items : []

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeaderBar}>
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SUPPLIER_ORDERS}
            className={styles.backBtn}
            aria-label="Quay lại danh sách đơn hàng"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
          </Link>
          <div className={styles.titleGroup}>
            <h1 className={styles.pageTitle}>Chi tiết đơn hàng</h1>
            {order.requestNo && (
              <span className={styles.requestNoChip}>{order.requestNo}</span>
            )}
          </div>
        </div>

        {isPendingAccept && (
          <Button
            type="button"
            variant="contained"
            color="primary"
            className={styles.acceptBtn}
            disabled={accepting}
            startIcon={<CheckCircleOutlined className={styles.btnIcon} />}
            onClick={onAcceptOrder}
          >
            {accepting ? "Đang tiếp nhận..." : "Tiếp nhận đơn hàng"}
          </Button>
        )}

        {isFulfilled && (
          <Button
            component={Link}
            to={deliveryTargetUrl}
            variant="outlined"
            color="primary"
            className={styles.acceptBtn}
            startIcon={<LocalShippingOutlined className={styles.btnIcon} />}
          >
            {matchedDelivery?.deliveryNo
              ? `Xem đơn giao ${matchedDelivery.deliveryNo}`
              : "Xem đơn giao hàng"}
          </Button>
        )}
      </div>

      {!isCancelled && (
        <DeliveryStageStepper
          activeIndex={activeStageIndex}
          steps={SUPPLY_ORDER_STEPS}
          onStepSelect={(_step, index) => {
            if (!isAcceptedStage || pendingDispatchDelivery) return
            if (index === 1) {
              onChangeFulfillmentStage?.(ORDER_CREATION_STAGE.INGREDIENTS)
            }
          }}
          isStepClickable={(_step, index) =>
            isAcceptedStage &&
            !accepting &&
            !pendingDispatchDelivery &&
            fulfillmentStage === ORDER_CREATION_STAGE.LOGISTICS &&
            index === 1
          }
        />
      )}

      {isAcceptedStage && (
        <OrderFulfillmentWorkflow
          order={order}
          fulfillmentStage={fulfillmentStage}
          pendingDispatchDelivery={pendingDispatchDelivery}
          submitting={accepting}
          error={acceptError}
          onChangeStage={onChangeFulfillmentStage}
          onSubmitDelivery={onSubmitDelivery}
          onDraftChange={onDraftChange}
        />
      )}

      {/* Section 1: Thông tin đơn hàng */}
      <section className={styles.detailCard} aria-labelledby="order-info-heading">
        <div className={styles.cardHeader}>
          <h2 id="order-info-heading" className={styles.sectionTitle}>
            Thông tin đơn đặt hàng
          </h2>
          <OrderStatusBadge status={displayBadgeStatus} showDot={isPendingAccept || isAcceptedStage} />
        </div>

        {isPendingAccept && (
          <div className={styles.pendingNotice} role="status">
            <div className={styles.pendingNoticeLeft}>
              <InfoOutlined className={styles.noticeIcon} aria-hidden="true" />
              <span>
                Đơn hàng đang chờ tiếp nhận. Bấm{" "}
                <strong>Tiếp nhận đơn hàng</strong> để xác nhận đơn (trạng thái{" "}
                <strong>Đã xác nhận</strong>), sau đó gắn cơ sở nguồn cung cho
                từng nguyên liệu và nhập thông tin giao hàng.
              </span>
            </div>
          </div>
        )}

        {isPendingAccept && acceptError && (
          <div className={styles.errorNotice} role="alert">
            {acceptError}
          </div>
        )}

        {matchedDelivery && (
          <div className={styles.deliveryReadyNotice} role="status">
            <div className={styles.pendingNoticeLeft}>
              <LocalShippingOutlined
                className={styles.noticeIcon}
                aria-hidden="true"
              />
              <span>
                Đã tạo đơn giao hàng{" "}
                <strong>{matchedDelivery.deliveryNo}</strong> ở trạng thái{" "}
                <strong>Đang giao hàng</strong> — bấm{" "}
                <strong>{`Xem đơn giao ${matchedDelivery.deliveryNo}`}</strong>{" "}
                để xem và in nhãn QR dán bao bì.
              </span>
            </div>
          </div>
        )}

        <dl className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Mã đơn yêu cầu</dt>
            <dd className={styles.metaValue}>{order.requestNo || "—"}</dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Trường đặt hàng</dt>
            <dd className={styles.metaValue}>{order.schoolName}</dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Ngày giao dự kiến</dt>
            <dd className={styles.metaValue}>
              {formatDateVi(order.requestedDeliveryDate)}
            </dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Thời điểm trường gửi</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(order.sentAt || order.createdAt)}
            </dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Thời điểm xác nhận</dt>
            <dd className={styles.metaValue}>
              {order.acceptedAt
                ? formatDateTimeVi(order.acceptedAt)
                : "Chưa xác nhận"}
            </dd>
          </div>

          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Cập nhật lần cuối</dt>
            <dd className={styles.metaValue}>
              {formatDateTimeVi(order.updatedAt)}
            </dd>
          </div>
        </dl>

        <div className={styles.noteSection}>
          <span className={styles.metaLabel}>Ghi chú từ nhà trường</span>
          {order.note ? (
            <p className={styles.noteText}>{order.note}</p>
          ) : (
            <p className={styles.noteMuted}>Không có ghi chú kèm theo.</p>
          )}
        </div>
      </section>

      {/* Section 2: Danh sách nguyên liệu (ẩn khi đang gắn nguồn / nhập xe ở bước 2-3 để tránh lặp) */}
      {!isAcceptedStage && (
        <section
          className={styles.detailCard}
          aria-labelledby="order-items-heading"
        >
          <div className={styles.cardHeader}>
            <h2 id="order-items-heading" className={styles.sectionTitle}>
              Danh sách nguyên liệu đặt mua
            </h2>
            <span className={styles.itemCountChip}>{`${items.length} mặt hàng`}</span>
          </div>

          {items.length === 0 ? (
            <div className={styles.stateBox}>
              <p className={styles.stateDesc}>
                Đơn hàng chưa có dòng nguyên liệu chi tiết.
              </p>
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
                      <th scope="col" className={styles.colQuantity}>
                        Số lượng yêu cầu
                      </th>
                      <th scope="col" className={styles.colUnit}>
                        Đơn vị
                      </th>
                      <th scope="col" className={styles.colNote}>
                        Ghi chú
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
                        <td className={styles.colQuantity}>
                          {formatQuantityVi(item.requestedQuantity)}
                        </td>
                        <td className={styles.colUnit}>{item.unit || "—"}</td>
                        <td className={styles.colNote}>{item.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className={styles.mobileItemsList} aria-label="Chi tiết mặt hàng">
                {items.map((item, idx) => (
                  <li key={item.id || idx} className={styles.mobileItemRow}>
                    <div className={styles.mobileItemTop}>
                      <span className={styles.mobileItemName}>
                        {`${idx + 1}. ${item.ingredientName}`}
                      </span>
                      <span className={styles.mobileItemQty}>
                        {`${formatQuantityVi(item.requestedQuantity)} ${item.unit || ""}`.trim()}
                      </span>
                    </div>
                    {item.note && (
                      <p className={styles.mobileItemNote}>{`Ghi chú: ${item.note}`}</p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  )
}

OrderDetailView.propTypes = {
  order: PropTypes.object,
  createdDelivery: PropTypes.shape({
    id: PropTypes.string,
    deliveryNo: PropTypes.string,
    supplyRequestId: PropTypes.string,
  }),
  pendingDispatchDelivery: PropTypes.shape({
    id: PropTypes.string,
    deliveryNo: PropTypes.string,
    supplyRequestId: PropTypes.string,
  }),
  fulfillmentStage: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  accepting: PropTypes.bool,
  acceptError: PropTypes.string,
  onRetry: PropTypes.func,
  onAcceptOrder: PropTypes.func,
  onChangeFulfillmentStage: PropTypes.func,
  onSubmitDelivery: PropTypes.func,
  onDraftChange: PropTypes.func,
}

export default OrderDetailView
