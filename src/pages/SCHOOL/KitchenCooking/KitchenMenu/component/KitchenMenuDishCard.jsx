import React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuDishCard.module.scss"
// Dòng món dùng chung giao diện với màn Danh sách thực đơn của nhân viên dinh dưỡng
import nv from "src/pages/SCHOOL/MenuPlanning/component/MenuListWeeklyVerticalView.module.scss"

export default function KitchenMenuDishCard({ dish, mealType = "LUNCH" }) {
  const navigate = useNavigate()
  const isLunch = mealType === "LUNCH"
  const clickable = Boolean(dish.isBatchCreated && dish.batchId)

  const handleAction = () => {
    if (clickable) navigate(ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", dish.batchId))
  }

  const substitutes = dish.substituteDishes?.length
    ? dish.substituteDishes
    : dish.substituteDish || dish.substitute
      ? [dish.substituteDish || dish.substitute]
      : []

  return (
    <div
      className={`${isLunch ? nv.lunchDishRow : nv.afternoonDishRow} ${clickable ? "" : styles.notClickable}`}
      onClick={clickable ? handleAction : undefined}
      onKeyDown={clickable ? event => { if (event.key === "Enter") handleAction() } : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={clickable ? `Món "${dish.name}" đã lập lô chế biến — Bấm để xem chi tiết` : dish.name}
      aria-label={`${dish.name} - ${dish.isBatchCreated ? "Đã lập lô" : "Chưa tạo lô"}`}
    >
      <div className={nv.dishCol}>
        <div className={nv.dishLeftWrap}>
          <span className={isLunch ? nv.dishDotLunch : nv.dishDotAfternoon} />
          <span className={nv.dishName}>{dish.name}</span>
        </div>
        {substitutes.map((sub, index) => (
          <div key={sub?.dishId || sub?.id || index} className={nv.substituteDishNote}>
            ({sub?.name || sub})
          </div>
        ))}
        {dish.excludedInGroups?.length > 0 && (
          <div className={nv.substituteDishNote}>
            (Không dùng cho {dish.excludedInGroups.join(", ")})
          </div>
        )}
      </div>

      {dish.isBatchCreated && (
        <span className={styles.badgeBatchDone}>
          <CheckCircle2 size={11} className={styles.btnIcon} />
          <span>Đã lập lô</span>
        </span>
      )}
    </div>
  )
}
