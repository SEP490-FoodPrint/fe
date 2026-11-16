import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button } from "@mui/material"
import { Add, LocalShippingOutlined } from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import {
  DELIVERY_SOURCE_TYPE,
  formatDateTimeVi,
} from "src/services/SupplierDeliveryService"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import styles from "./DeliveryListView.module.scss"

const SKELETON_ROWS = [0, 1, 2, 3, 4]

function getDeliverySourceLabel(delivery) {
  if (delivery?.sourceType !== DELIVERY_SOURCE_TYPE.REQUEST) {
    return "Tạo thủ công"
  }
  return delivery.requestNo ? `YC · ${delivery.requestNo}` : "Từ yêu cầu"
}

function DeliveryListView({
  deliveries,
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
        aria-label="Đang tải danh sách đơn giao hàng"
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

  if (deliveries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap} aria-hidden="true">
          <LocalShippingOutlined />
        </div>
        <p className={styles.emptyTitle}>
          {hasActiveFilters
            ? "Không tìm thấy đơn giao hàng phù hợp"
            : "Chưa có đơn giao hàng nào được tạo"}
        </p>
        <p className={styles.emptyDesc}>
          {hasActiveFilters
            ? "Thử xóa từ khóa hoặc chuyển bộ lọc nguồn tạo và trạng thái để xem toàn bộ đơn."
            : "Đơn giao từ yêu cầu nhà trường sẽ được tạo ngay khi bạn tiếp nhận tại Đơn hàng Cung ứng; hoặc tạo đơn thủ công cho trường liên kết tại đây."}
        </p>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onResetFilters}
          >
            Xóa bộ lọc
          </Button>
        ) : (
          <Button
            component={Link}
            to={ROUTER.SUPPLIER_DELIVERY_CREATE}
            variant="contained"
            color="primary"
            startIcon={<Add />}
          >
            Tạo đơn thủ công
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.deliveryTable}>
          <thead>
            <tr>
              <th scope="col" className={styles.colStt}>
                STT
              </th>
              <th scope="col" className={styles.colCode}>
                Mã đơn giao
              </th>
              <th scope="col" className={styles.colSource}>
                Nguồn tạo
              </th>
              <th scope="col" className={styles.colSchool}>
                Trường nhận hàng
              </th>
              <th scope="col" className={styles.colExpected}>
                Dự kiến đến
              </th>
              <th scope="col" className={styles.colStatus}>
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery, idx) => {
              const rowNumber = (currentPage - 1) * pageLimit + idx + 1
              const detailPath = `${ROUTER.SUPPLIER_DELIVERIES}/${delivery.id}`
              const isRequestSource =
                delivery.sourceType === DELIVERY_SOURCE_TYPE.REQUEST
              const sourceLabel = getDeliverySourceLabel(delivery)

              return (
                <tr key={delivery.id} className={styles.tableRow}>
                  <td className={`${styles.colStt} ${styles.cellStt}`}>
                    {rowNumber}
                  </td>

                  <td className={styles.colCode}>
                    <Link
                      to={detailPath}
                      className={styles.codeLink}
                      title={delivery.deliveryNo}
                    >
                      {delivery.deliveryNo}
                    </Link>
                  </td>

                  <td className={styles.colSource}>
                    <span
                      className={`${styles.sourceChip} ${
                        isRequestSource ? styles.sourceChipRequest : ""
                      }`}
                      title={sourceLabel}
                    >
                      {sourceLabel}
                    </span>
                  </td>

                  <td className={styles.colSchool}>
                    <Link
                      to={detailPath}
                      className={styles.schoolLink}
                      title={delivery.schoolName}
                    >
                      {delivery.schoolName}
                    </Link>
                  </td>

                  <td className={`${styles.colExpected} ${styles.cellMuted}`}>
                    <span className={styles.expectedDateText}>
                      {formatDateTimeVi(delivery.expectedArrivalAt)}
                    </span>
                    {delivery.vehiclePlate && (
                      <span className={styles.plateSubText}>
                        {`Xe: ${delivery.vehiclePlate}`}
                      </span>
                    )}
                  </td>

                  <td className={styles.colStatus}>
                    <DeliveryStatusBadge
                      status={delivery.status}
                      statusLabel={delivery.statusLabel}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className={styles.mobileList} aria-label="Danh sách đơn giao hàng">
        {deliveries.map(delivery => {
          const detailPath = `${ROUTER.SUPPLIER_DELIVERIES}/${delivery.id}`
          const isRequestSource =
            delivery.sourceType === DELIVERY_SOURCE_TYPE.REQUEST
          const sourceLabel = getDeliverySourceLabel(delivery)

          return (
            <li key={delivery.id} className={styles.mobileItem}>
              <Link to={detailPath} className={styles.mobileRowLink}>
                <div className={styles.mobileTopRow}>
                  <span
                    className={styles.mobileCodeChip}
                    title={delivery.deliveryNo}
                  >
                    {delivery.deliveryNo}
                  </span>
                  <DeliveryStatusBadge
                    status={delivery.status}
                    statusLabel={delivery.statusLabel}
                  />
                </div>
                <span className={styles.mobileSchoolName}>{delivery.schoolName}</span>
                <div className={styles.mobileMetaRow}>
                  <span
                    className={`${styles.sourceChip} ${
                      isRequestSource ? styles.sourceChipRequest : ""
                    }`}
                    title={sourceLabel}
                  >
                    {sourceLabel}
                  </span>
                  <span>
                    {`Dự kiến: ${formatDateTimeVi(delivery.expectedArrivalAt)}`}
                  </span>
                  {delivery.vehiclePlate && (
                    <span>{`Xe: ${delivery.vehiclePlate}`}</span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className={styles.paginationBar}>
        <span className={styles.paginationInfo}>
          {`Trang ${currentPage} · ${deliveries.length} đơn hiển thị`}
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

DeliveryListView.propTypes = {
  deliveries: PropTypes.arrayOf(PropTypes.object).isRequired,
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

export default DeliveryListView
