import React from "react"
import PropTypes from "prop-types"
import { Eye } from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import { approvalProgress, groupDeliveriesByRound, groupSummary } from "./deliveryGroups"
import styles from "./DeliveryMobileCards.module.scss"
import { deliveryTimeLines } from "src/utils/deliveryTime"


export default function DeliveryMobileCards({ deliveries, onSelectDelivery }) {
  return (
    <div className={styles.cardsWrap}>
      {groupDeliveriesByRound(deliveries).map((group) => (
        <section key={group.key} className={styles.group} aria-label={group.label}>
          <header className={styles.groupHeader}>
            <span className={styles.groupLabel}>{group.label}</span>
            <span className={styles.groupSummary}>{groupSummary(group)}</span>
          </header>
          {group.items.map((item) => {
            const progress = approvalProgress(item)
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.supplierName}>{item.supplierName}</span>
                  <DeliveryStatusBadge status={item.status} />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Biển số xe:</span>
                    <span className={styles.value}>{item.vehiclePlate || "—"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Thời gian giao:</span>
                    <span className={styles.value}>{deliveryTimeLines(item).map((line) => <span key={line.label} style={{ display: "block" }}>{line.label}: {line.value}</span>)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Bộ phận đã ký:</span>
                    <span className={styles.value}>
                      {progress.rejected ? "Có bộ phận từ chối" : `${progress.approved}/${progress.total}`}
                    </span>
                  </div>
                  {item.requestNo && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Đơn:</span>
                      <span className={styles.value}>{item.requestNo}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    className={styles.viewBtn}
                    onClick={() => onSelectDelivery(item)}
                    aria-label={`Xem chi tiết xe giao của ${item.supplierName}`}
                  >
                    <Eye size={16} />
                    <span>Xem chi tiết</span>
                  </button>
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}

DeliveryMobileCards.propTypes = {
  deliveries: PropTypes.array.isRequired,
  onSelectDelivery: PropTypes.func.isRequired,
}
