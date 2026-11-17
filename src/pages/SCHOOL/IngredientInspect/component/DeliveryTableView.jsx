import React from "react"
import PropTypes from "prop-types"
import { Eye } from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import { approvalProgress, groupDeliveriesByRound, groupSummary } from "./deliveryGroups"
import styles from "./DeliveryTableView.module.scss"

const formatDateTime = (expectedAt, arrivedAt) => {
  const timeSrc = arrivedAt || expectedAt
  if (!timeSrc) return "--"
  const d = new Date(timeSrc)
  if (Number.isNaN(d.getTime())) return "--"
  const pad = (n) => String(n).padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())} • ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** Danh sách xe giao, gom theo Đợt 1 / Đợt 2…; mỗi xe kiểm tra độc lập với 4 bộ phận. */
export default function DeliveryTableView({ deliveries, onSelectDelivery }) {
  const groups = groupDeliveriesByRound(deliveries)

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thSupplier}>Nhà cung cấp</th>
            <th>Biển số xe</th>
            <th className={styles.thDate}>Thời gian giao</th>
            <th>Bộ phận đã ký</th>
            <th className={styles.thStatus}>Trạng thái</th>
            <th className={styles.thAction}>Thao tác</th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.key}>
            <tr className={styles.groupRow}>
              <th scope="colgroup" colSpan={6}>
                <span className={styles.groupLabel}>{group.label}</span>
                <span className={styles.groupSummary}>{groupSummary(group)}</span>
              </th>
            </tr>
            {group.items.map((item) => {
              const progress = approvalProgress(item)
              return (
                <tr key={item.id} className={styles.tableRow}>
                  <td className={styles.tdSupplier}>
                    <button
                      type="button"
                      className={styles.supplierNameBtn}
                      onClick={() => onSelectDelivery(item)}
                      title="Xem chi tiết xe giao này"
                    >
                      {item.supplierName}
                    </button>
                    {item.requestNo && <div className={styles.subText}>{item.requestNo}</div>}
                  </td>
                  <td>
                    <span className={styles.plate}>{item.vehiclePlate || "—"}</span>
                  </td>
                  <td className={styles.tdDate}>
                    <span className={styles.dateText}>{formatDateTime(item.expectedArrivalAt, item.arrivedAt)}</span>
                  </td>
                  <td>
                    <span className={progress.rejected ? styles.progressRejected : progress.approved === progress.total ? styles.progressDone : styles.progress}>
                      {progress.rejected ? "Có bộ phận từ chối" : `${progress.approved}/${progress.total} bộ phận`}
                    </span>
                  </td>
                  <td className={styles.tdStatus}>
                    <DeliveryStatusBadge status={item.status} />
                  </td>
                  <td className={styles.tdAction}>
                    <button
                      type="button"
                      className={styles.iconActionBtn}
                      onClick={() => onSelectDelivery(item)}
                      title="Xem chi tiết xe giao"
                      aria-label={`Xem chi tiết xe giao của ${item.supplierName}${item.vehiclePlate ? `, biển số ${item.vehiclePlate}` : ""}`}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>
    </div>
  )
}

DeliveryTableView.propTypes = {
  deliveries: PropTypes.array.isRequired,
  onSelectDelivery: PropTypes.func.isRequired,
}
