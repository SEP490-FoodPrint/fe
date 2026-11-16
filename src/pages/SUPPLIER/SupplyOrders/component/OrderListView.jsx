import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button } from "@mui/material"
import { InboxOutlined } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  formatDateTimeVi,
  formatDateVi,
  SUPPLY_ORDER_STATUS,
} from "src/services/SupplierOrderService"
import OrderStatusBadge from "./OrderStatusBadge"
import styles from "./OrderListView.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]

function OrderListView({
  orders,
  pageTotalCount,
  loading,
  hasActiveFilters,
  pagination,
  onResetFilters,
  onPageChange,
}) {
  const currentPage = pagination?.page || 1
  const pageLimit = pagination?.limit || 20

  if (loading && pageTotalCount === 0) {
    return (
      <div
        className={styles.skeletonStack}
        role="status"
        aria-live="polite"
        aria-label="Đang tải danh sách đơn hàng"
      >
        {SKELETON_ROWS.map(rowKey => (
          <div key={rowKey} className={styles.skeletonRow}>
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonBar} />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap} aria-hidden="true">
          <InboxOutlined />
        </div>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không có đơn hàng khớp điều kiện lọc"
            : "Chưa có đơn hàng nào từ nhà trường"}
        </p>
        <p className={styles.emptyDesc}>
          {hasActiveFilters
            ? "Thử xóa từ khóa tìm kiếm hoặc chọn trạng thái khác để xem toàn bộ đơn đặt hàng."
            : "Khi nhà trường gửi yêu cầu nhập nguyên liệu đến đơn vị của bạn, đơn hàng mới sẽ hiển thị tại đây."}
        </p>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onResetFilters}
          >
            Xem tất cả đơn hàng
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.orderTable}>
          <thead>
            <tr>
              <th scope="col" className={styles.colStt}>
                STT
              </th>
              <th scope="col" className={styles.colCode}>
                Mã đơn hàng
              </th>
              <th scope="col" className={styles.colSchool}>
                Trường đặt hàng
              </th>
              <th scope="col" className={styles.colDeliveryDate}>
                Ngày giao dự kiến
              </th>
              <th scope="col" className={styles.colSentAt}>
                Thời điểm gửi
              </th>
              <th scope="col" className={styles.colStatus}>
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const rowNumber = (currentPage - 1) * pageLimit + idx + 1
              const detailPath = `${ROUTER.SUPPLIER_ORDERS}/${order.id}`
              const isPending = order.status === SUPPLY_ORDER_STATUS.SENT

              return (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={`${styles.colStt} ${styles.cellStt}`}>
                    {rowNumber}
                  </td>

                  <td className={styles.colCode}>
                    <Link
                      to={detailPath}
                      className={styles.codeLink}
                      title={order.requestNo}
                    >
                      {order.requestNo}
                    </Link>
                  </td>

                  <td className={styles.colSchool}>
                    <Link
                      to={detailPath}
                      className={styles.schoolLink}
                      title={order.schoolName}
                    >
                      {order.schoolName}
                    </Link>
                  </td>

                  <td className={styles.colDeliveryDate}>
                    {formatDateVi(order.requestedDeliveryDate)}
                  </td>

                  <td className={`${styles.colSentAt} ${styles.cellMuted}`}>
                    {formatDateTimeVi(order.sentAt || order.createdAt)}
                  </td>

                  <td className={styles.colStatus}>
                    <OrderStatusBadge status={order.status} showDot={isPending} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className={styles.mobileList} aria-label="Danh sách đơn hàng từ nhà trường">
        {orders.map(order => {
          const detailPath = `${ROUTER.SUPPLIER_ORDERS}/${order.id}`
          const isPending = order.status === SUPPLY_ORDER_STATUS.SENT

          return (
            <li key={order.id} className={styles.mobileItem}>
              <Link to={detailPath} className={styles.mobileRowLink}>
                <div className={styles.mobileTopRow}>
                  <span className={styles.mobileCodeChip} title={order.requestNo}>
                    {order.requestNo}
                  </span>
                  <OrderStatusBadge status={order.status} showDot={isPending} />
                </div>
                <span className={styles.mobileSchoolName}>{order.schoolName}</span>
                <div className={styles.mobileMetaRow}>
                  <span>Giao dự kiến: {formatDateVi(order.requestedDeliveryDate)}</span>
                  <span>Gửi: {formatDateTimeVi(order.sentAt || order.createdAt)}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className={styles.paginationBar}>
        <span className={styles.paginationInfo}>
          {`Trang ${currentPage} · ${orders.length} đơn hiển thị`}
        </span>

        <div className={styles.paginationControls}>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            size="small"
            className={styles.pageBtn}
            disabled={loading || currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            size="small"
            className={styles.pageBtn}
            disabled={loading || !pagination?.hasNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </>
  )
}

OrderListView.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object).isRequired,
  pageTotalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  hasActiveFilters: PropTypes.bool,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    hasNext: PropTypes.bool,
  }).isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
}

export default OrderListView
