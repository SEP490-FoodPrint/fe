import React from "react"
import { useNavigate } from "react-router-dom"
import {
  UtensilsCrossed,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react"
import { Tooltip, IconButton } from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuDishCard.module.scss"

export default function KitchenMenuDishCard({ dish }) {
  const navigate = useNavigate()

  const handleAction = (e) => {
    e.stopPropagation()
    if (dish.isBatchCreated && dish.batchId) {
      navigate(
        ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", dish.batchId)
      )
    } else {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_CREATE)
    }
  }

  return (
    <div
      className={styles.dishCard}
      onClick={handleAction}
      role="button"
      tabIndex={0}
      aria-label={`${dish.name} - ${dish.portions} ${dish.unit || "suất"}`}
    >
      <div className={styles.dishHeader}>
        {/* Huy hiệu trạng thái lô chế biến */}
        {dish.isBatchCreated ? (
          <span className={styles.batchReadyBadge}>
            <CheckCircle2 size={11} />
            <span>Đã lập lô</span>
          </span>
        ) : (
          <span className={styles.batchPendingBadge}>
            <span>Chưa lập lô</span>
          </span>
        )}

        {/* Cảnh báo dị ứng nếu có */}
        {dish.allergens && dish.allergens.length > 0 && (
          <span
            className={styles.allergenChip}
            title={`Có dị nguyên: ${dish.allergens.join(", ")}`}
          >
            <AlertTriangle size={11} />
            <span>{dish.allergens[0]}</span>
          </span>
        )}
      </div>

      <div className={styles.dishBody}>
        <h4 className={styles.dishName}>{dish.name}</h4>
      </div>

      <div className={styles.dishFooter}>
        <div className={styles.portionWrap}>
          <span className={styles.portionNum}>
            {(dish.portions || 1250).toLocaleString("vi-VN")}
          </span>
          <span className={styles.portionUnit}>{dish.unit || "suất"}</span>
        </div>

        <div className={styles.actionWrap}>
          {dish.isBatchCreated ? (
            <Tooltip title="Xem lô chế biến đã tạo" arrow>
              <IconButton
                size="small"
                className={styles.btnViewBatch}
                onClick={handleAction}
                aria-label={`Xem lô ${dish.name}`}
              >
                <Eye size={15} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Tạo lô chế biến món này" arrow>
              <IconButton
                size="small"
                className={styles.btnCreateBatch}
                onClick={handleAction}
                aria-label={`Tạo lô chế biến ${dish.name}`}
              >
                <Plus size={15} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
