import React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Plus, Eye } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuDishCard.module.scss"

export default function KitchenMenuDishCard({ dish, mealType = "LUNCH" }) {
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

  const isLunch = mealType === "LUNCH"

  return (
    <div
      className={`${styles.dishCard} ${
        isLunch ? styles.dishCardLunch : styles.dishCardAfternoon
      }`}
      onClick={handleAction}
      role="button"
      tabIndex={0}
      aria-label={`${dish.name} - ${dish.portions} ${dish.unit || "suất"}`}
    >
      {/* 1. Tên món ăn (to rõ, dễ đọc, không hiển thị dị ứng) */}
      <div className={styles.dishTopRow}>
        <h4 className={styles.dishName}>{dish.name}</h4>
      </div>

      {/* 2. Hàng chân thẻ: Định lượng suất + Trạng thái lập lô */}
      <div className={styles.dishBottomRow}>
        <div className={styles.portionWrap}>
          <span className={styles.portionNum}>
            {(dish.portions || 1250).toLocaleString("vi-VN")}
          </span>
          <span className={styles.portionUnit}>{dish.unit || "suất"}</span>
        </div>

        <div className={styles.statusActionWrap}>
          {dish.isBatchCreated ? (
            <span
              className={styles.batchReadyBadge}
              title="Đã lập lô chế biến - Bấm để xem"
            >
              <CheckCircle2 size={12} className={styles.checkIcon} />
              <span>Đã lập lô</span>
            </span>
          ) : (
            <span
              className={`${styles.batchCreateAction} ${
                isLunch ? styles.btnLunchAction : styles.btnAfternoonAction
              }`}
              title="Bấm để tạo lô chế biến"
            >
              <Plus size={12} />
              <span>Tạo lô</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
