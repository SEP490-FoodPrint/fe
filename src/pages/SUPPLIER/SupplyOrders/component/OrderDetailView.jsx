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
import {
  formatDateTimeVi,
  formatDateVi,
  formatQuantityVi,
  SUPPLY_ORDER_STATUS,
} from "src/services/SupplierOrderService"
import OrderStatusBadge from "./OrderStatusBadge"
import styles from "./OrderDetailView.module.scss"

function OrderDetailView({
  order,
  loading = false,
  error = null,
  accepting = false,
  onRetry,
  onRequestAccept,
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
            onClick={onRequestAccept}
          >
            Tiếp nhận đơn hàng
          </Button>
        )}

        {order.status === SUPPLY_ORDER_STATUS.ACCEPTED && (
          <Button
            component={Link}
            to={`${ROUTER.SUPPLIER_DELIVERY_CREATE}?supplyRequestId=${encodeURIComponent(order.id)}`}
            variant="contained"
            color="primary"
            className={styles.acceptBtn}
            startIcon={<LocalShippingOutlined className={styles.btnIcon} />}
          >
            Tạo đơn giao hàng
          </Button>
        )}
      </div>

      {/* Section 1: Thông tin đơn hàng */}
      <section className={styles.detailCard} aria-labelledby="order-info-heading">
        <div className={styles.cardHeader}>
          <h2 id="order-info-heading" className={styles.sectionTitle}>
            Thông tin đơn đặt hàng
          </h2>
          <OrderStatusBadge status={order.status} showDot={isPendingAccept} />
        </div>

        {isPendingAccept && (
          <div className={styles.pendingNotice} role="status">
            <div className={styles.pendingNoticeLeft}>
              <InfoOutlined className={styles.noticeIcon} aria-hidden="true" />
              <span>
                Đơn hàng đang chờ xác nhận từ nhà cung cấp. Vui lòng đối chiếu ngày
                giao dự kiến và danh sách nguyên liệu trước khi tiếp nhận.
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
            <dt className={styles.metaLabel}>Thời điểm tiếp nhận</dt>
            <dd className={styles.metaValue}>
              {order.acceptedAt
                ? formatDateTimeVi(order.acceptedAt)
                : "Chưa tiếp nhận"}
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

      {/* Section 2: Danh sách nguyên liệu yêu cầu */}
      <section className={styles.detailCard} aria-labelledby="order-items-heading">
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
    </div>
  )
}

OrderDetailView.propTypes = {
  order: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  accepting: PropTypes.bool,
  onRetry: PropTypes.func,
  onRequestAccept: PropTypes.func,
}

export default OrderDetailView
