import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import { Add, KeyboardArrowLeft } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  DELIVERY_SOURCE_TYPE,
  formatDateTimeVi,
  formatQuantityVi,
} from "src/services/SupplierDeliveryService"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import styles from "./DeliveryDetailView.module.scss"

function DeliveryDetailView({ delivery, loading = false, error = null, onRetry }) {
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

        <Button
          component={Link}
          to={ROUTER.SUPPLIER_DELIVERY_CREATE}
          variant="outlined"
          color="primary"
          className={styles.createBtn}
          startIcon={<Add />}
        >
          Tạo đơn mới
        </Button>
      </div>

      {/* Section 1: Header info */}
      <section className={styles.detailCard} aria-labelledby="delivery-info-heading">
        <div className={styles.cardHeader}>
          <h2 id="delivery-info-heading" className={styles.sectionTitle}>
            Thông tin đơn giao hàng
          </h2>
          <DeliveryStatusBadge status={delivery.status} />
        </div>

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
                "Đơn giao độc lập"
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
            <dt className={styles.metaLabel}>Thời điểm nhập kho</dt>
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

      {/* Section 2: Items */}
      <section className={styles.detailCard} aria-labelledby="delivery-items-heading">
        <div className={styles.cardHeader}>
          <h2 id="delivery-items-heading" className={styles.sectionTitle}>
            Danh sách nguyên liệu giao
          </h2>
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
                    <th scope="col" className={styles.colQuantity}>
                      Số lượng giao
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
                        {formatQuantityVi(item.actualQuantity)}
                      </td>
                      <td className={styles.colUnit}>{item.unit || "—"}</td>
                      <td className={styles.colNote}>{item.note || "—"}</td>
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

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    status: PropTypes.number,
    message: PropTypes.string,
  }),
  onRetry: PropTypes.func,
}

export default DeliveryDetailView
