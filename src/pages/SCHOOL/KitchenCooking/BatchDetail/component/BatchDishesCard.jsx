import React from "react"
import { Utensils } from "lucide-react"
import styles from "./BatchDishesCard.module.scss"

export default function BatchDishesCard({ batchData = {} }) {
  const dishes = Array.isArray(batchData.dishes) && batchData.dishes.length > 0
    ? batchData.dishes
    : batchData.dishName
    ? [{ dishId: "single-dish", name: batchData.dishName, plannedPortions: batchData.portions }]
    : []

  return (
    <section className={styles.dishesSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWrap}>
          <Utensils size={16} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>
            Món ăn ({dishes.length})
          </h2>
        </div>
      </div>

      <div className={styles.dishesList}>
        {dishes.length === 0 ? (
          <div className={styles.emptyText}>Chưa có thông tin món ăn cho lô này.</div>
        ) : (
          dishes.map((dish, index) => {
            const portionsCount = dish.plannedPortions != null
              ? Number(dish.plannedPortions).toLocaleString("vi-VN")
              : (batchData.portions || 0).toLocaleString("vi-VN")

            return (
              <div key={dish.dishId || index} className={styles.dishRow}>
                <div className={styles.dishLeft}>
                  <span className={styles.dishIndex}>{index + 1}.</span>
                  <span className={styles.dishName}>{dish.name}</span>
                </div>
                <div className={styles.dishRight}>
                  <span className={styles.dishPortionLabel}>Số suất món:</span>
                  <strong className={styles.dishPortionVal}>{portionsCount}</strong>
                  <span className={styles.dishPortionUnit}>suất</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

