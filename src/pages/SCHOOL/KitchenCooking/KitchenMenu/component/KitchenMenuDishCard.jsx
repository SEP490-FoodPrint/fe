import React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Plus } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuDishCard.module.scss"

export default function KitchenMenuDishCard({ dish, mealType = "LUNCH" }) {
  const navigate = useNavigate()

  const handleAction = (e) => {
    e.stopPropagation()
    if (dish.isBatchCreated && dish.batchId) {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", dish.batchId))
    } else {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_CREATE)
    }
  }

  return (
    <div
      className={styles.dishRow}
      onClick={handleAction}
      role="button"
      tabIndex={0}
      title={
        dish.isBatchCreated
          ? `Món "${dish.name}" đã lập lô chế biến - Bấm để xem chi tiết`
          : `Bấm để tạo lô chế biến cho món "${dish.name}"`
      }
      aria-label={`${dish.name} - ${dish.isBatchCreated ? "Đã lập lô" : "Chưa tạo lô"}`}
    >
      {/* 1. Tên món ăn: NỔI BẬT NHẤT CHO NGƯỜI LÀM BẾP DỄ QUÉT MẮT */}
      <span className={styles.dishName}>{dish.name}</span>

      {/* 2. Cụm thao tác lô: Nhẹ nhàng, tinh tế, không lấn át tên món */}
      <div className={styles.actionWrap}>
        {dish.isBatchCreated ? (
          <button
            type="button"
            className={styles.badgeBatchDone}
            onClick={handleAction}
            aria-label={`Xem lô chế biến món ${dish.name}`}
          >
            <CheckCircle2 size={11} className={styles.btnIcon} />
            <span>Đã lập lô</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.btnCreateBatch}
            onClick={handleAction}
            aria-label={`Tạo lô chế biến món ${dish.name}`}
          >
            <Plus size={11} className={styles.btnIcon} />
            <span>Tạo lô</span>
          </button>
        )}
      </div>
    </div>
  )
}
