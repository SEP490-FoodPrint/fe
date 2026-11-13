import React from "react"
import {
  Utensils,
  Calendar,
  Layers,
  Clock,
  Timer,
} from "lucide-react"
import styles from "./BatchInfoCard.module.scss"

export default function BatchInfoCard({ batchData = {} }) {
  const portions = (batchData.portions || 0).toLocaleString("vi-VN")
  const methodLabel =
    batchData.method === "SEPARATE" ? "Nấu riêng theo lớp" : "Nấu chung"

  const multipleDishes = batchData.dishes && batchData.dishes.length > 1

  return (
    <section className={styles.infoCard}>
      {/* 1. Hero Block: Tên món ăn chính & Quy mô suất ăn */}
      <div className={styles.heroBox}>
        <div className={styles.heroLeft}>
          <div className={styles.dishLabelRow}>
            <Utensils size={16} className={styles.dishIcon} />
            <span className={styles.dishCategoryText}>
              {multipleDishes ? `Tổ hợp ${batchData.dishes.length} món ăn` : "Món ăn chế biến"}
            </span>
          </div>
          <h2 className={styles.dishNameTitle}>{batchData.dishName || "—"}</h2>

          {/* Nếu mẻ có nhiều món thì hiển thị danh sách các món dạng tags */}
          {multipleDishes && (
            <div className={styles.dishesListWrap}>
              {batchData.dishes.map((dish, idx) => (
                <div key={dish.dishId || idx} className={styles.dishChip}>
                  <span className={styles.dishChipName}>{dish.name}</span>
                  {dish.plannedPortions && (
                    <span className={styles.dishChipPortions}>
                      {dish.plannedPortions.toLocaleString("vi-VN")} suất
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khối quy mô suất ăn */}
        <div className={styles.portionBox}>
          <span className={styles.portionLabel}>Quy mô chế biến</span>
          <div className={styles.portionValueRow}>
            <span className={styles.portionBigNumber}>{portions}</span>
            <span className={styles.portionUnit}>suất</span>
          </div>
        </div>
      </div>

      {/* 2. Dải thông số nghiệp vụ cốt lõi */}
      <div className={styles.metaStrip}>
        <div className={styles.metaItem}>
          <div className={styles.metaIconWrap}>
            <Utensils size={15} />
          </div>
          <div className={styles.metaContent}>
            <span className={styles.metaLabel}>Bữa ăn</span>
            <span className={styles.metaVal}>
              <strong>{batchData.mealType || "Bữa trưa"}</strong>
              {batchData.servingTime && (
                <span className={styles.subText}> • {batchData.servingTime}</span>
              )}
            </span>
          </div>
        </div>

        <div className={styles.metaItem}>
          <div className={styles.metaIconWrap}>
            <Calendar size={15} />
          </div>
          <div className={styles.metaContent}>
            <span className={styles.metaLabel}>Ngày nấu</span>
            <span className={styles.metaVal}>
              <strong>{batchData.menuDate || "Hôm nay"}</strong>
            </span>
          </div>
        </div>

        <div className={styles.metaItem}>
          <div className={styles.metaIconWrap}>
            <Layers size={15} />
          </div>
          <div className={styles.metaContent}>
            <span className={styles.metaLabel}>Quy cách nấu</span>
            <span className={styles.metaVal}>
              <span className={styles.methodTag}>{methodLabel}</span>
            </span>
          </div>
        </div>

        {/* Thời gian ghi nhận */}
        <div className={styles.metaItem}>
          <div className={styles.metaIconWrap}>
            <Timer size={15} />
          </div>
          <div className={styles.metaContent}>
            <span className={styles.metaLabel}>
              {batchData.status === "COMPLETED" ? "Hoàn thành lúc" : "Khởi tạo lúc"}
            </span>
            <span className={styles.metaVal}>
              <strong>
                {batchData.status === "COMPLETED"
                  ? batchData.completedAtFull || batchData.completedAt || "Đã nấu xong"
                  : batchData.createdAt || "Hôm nay"}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
