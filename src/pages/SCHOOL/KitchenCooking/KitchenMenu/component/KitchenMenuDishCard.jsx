import React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuDishCard.module.scss"

export default function KitchenMenuDishCard({ dish, mealType = "LUNCH" }) {
  const navigate = useNavigate()

  const handleAction = () => {
    if (dish.isBatchCreated && dish.batchId) {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", dish.batchId))
    }
  }

  const isLunch = mealType === "LUNCH"

  return (
    <div
      className={`${styles.dishRow} ${
        isLunch ? styles.lunchDishRow : styles.afternoonDishRow
      } ${dish.isBatchCreated ? styles.dishRowClickable : ""}`}
      onClick={dish.isBatchCreated ? handleAction : undefined}
      role={dish.isBatchCreated ? "button" : undefined}
      tabIndex={dish.isBatchCreated ? 0 : undefined}
      title={
        dish.isBatchCreated
          ? `Món "${dish.name}" đã lập lô chế biến — Bấm để xem chi tiết`
          : dish.name
      }
      aria-label={`${dish.name} - ${dish.isBatchCreated ? "Đã lập lô" : "Chưa tạo lô"}`}
    >
      <div className={styles.dishContent}>
        {/* Chấm bullet tròn nhỏ giống danh sách thực đơn Dinh dưỡng */}
        <span className={isLunch ? styles.dishDotLunch : styles.dishDotAfternoon} />
        {/* Tên món ăn & món thay thế */}
        <div className={styles.dishTitleCol}>
          <span className={styles.dishName}>{dish.name}</span>
          {(dish.substituteDish || dish.substitute) && (
            <span className={styles.substituteDishNote}>
              ({dish.substituteDish?.name || dish.substitute?.name || dish.substituteDish || dish.substitute})
            </span>
          )}
        </div>
      </div>

      {/* Trạng thái nếu đã lập lô */}
      {dish.isBatchCreated && (
        <div className={styles.actionWrap}>
          <span className={styles.badgeBatchDone}>
            <CheckCircle2 size={11} className={styles.btnIcon} />
            <span>Đã lập lô</span>
          </span>
        </div>
      )}
    </div>
  )
}
