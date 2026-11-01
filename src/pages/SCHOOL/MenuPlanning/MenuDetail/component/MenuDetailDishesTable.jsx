import React from "react"
import styles from "./MenuDetailDishesTable.module.scss"

export default function MenuDetailDishesTable({ dishes = [], portionCount = 210 }) {
  if (!dishes || dishes.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <span className="material-symbols-outlined text-[32px] text-slate-400">restaurant_menu</span>
        <p className="text-slate-500 font-medium">Chưa có món ăn nào trong thực đơn này.</p>
      </div>
    )
  }

  // Helper tính tổng nhu cầu
  const calculateTotalDemand = (qtyStr, count) => {
    if (!qtyStr) return "—"
    const match = qtyStr.match(/([\d.]+)\s*([a-zA-Z]+)/)
    if (!match) return "—"
    const num = parseFloat(match[1])
    const unit = match[2]

    if (isNaN(num)) return "—"
    const total = num * count

    if (unit.toLowerCase() === "g") {
      if (total >= 1000) {
        return `${(total / 1000).toFixed(2)} kg`
      }
      return `${total.toLocaleString()} g`
    }
    if (unit.toLowerCase() === "ml") {
      if (total >= 1000) {
        return `${(total / 1000).toFixed(2)} lít`
      }
      return `${total.toLocaleString()} ml`
    }
    return `${total.toLocaleString()} ${unit}`
  }

  // Helper kiểm tra cảnh báo dị ứng theo tên món và thành phần
  const getAllergyWarning = (dish) => {
    const text = (dish.name + " " + (dish.ingredients || []).join(" ")).toLowerCase()
    if (text.includes("tôm") || text.includes("cua") || text.includes("mực") || text.includes("hải sản") || text.includes("ngao")) {
      return { type: "SEAFOOD", label: "Dị ứng Hải sản", severity: "danger" }
    }
    if (text.includes("lạc") || text.includes("đậu phộng") || text.includes("hạt điều") || text.includes("óc chó")) {
      return { type: "NUTS", label: "Dị ứng Các loại hạt", severity: "danger" }
    }
    if (text.includes("trứng")) {
      return { type: "EGG", label: "Dị ứng Trứng gia cầm", severity: "warning" }
    }
    if (text.includes("sữa") || text.includes("phô mai")) {
      return { type: "DAIRY", label: "Dị ứng Sữa & Lactose", severity: "warning" }
    }
    return null
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
          <div className={styles.titleWithBadge}>
            <h2 className={styles.cardTitle}>Cơ cấu món ăn trong thực đơn</h2>
            <span className={styles.dishCountBadge}>{dishes.length} món ăn</span>
          </div>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.portionInfo}>
            Áp dụng cho: <strong>{portionCount} suất tiêu chuẩn</strong>
          </span>
        </div>
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thIndex}>STT</th>
              <th className={styles.thDish}>Tên món ăn</th>
              <th className={styles.thQty}>Định lượng / Suất</th>
              <th className={styles.thIngredients}>Thành phần chính & Nhà cung cấp liên kết</th>
              <th className={styles.thDemand}>Tổng nhu cầu</th>
              <th className={styles.thAllergy}>Đối soát dị ứng</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, idx) => {
              const allergy = getAllergyWarning(dish)
              const demand = calculateTotalDemand(dish.qty, portionCount)

              return (
                <tr key={idx} className={styles.tr}>
                  <td className={styles.tdIndex}>{idx + 1}</td>

                  {/* Tên món */}
                  <td className={styles.tdDish}>
                    <div className={styles.dishNameBlock}>
                      <span className={styles.dishName}>{dish.name}</span>
                      <span className={styles.dishCategory}>
                        {idx === 0 ? "Món chính (Đạm & Khoáng)" : idx === 1 ? "Món mặn đậm đà" : idx === 2 ? "Món canh rau củ" : "Món tinh bột / Tráng miệng"}
                      </span>
                    </div>
                  </td>

                  {/* Định lượng */}
                  <td className={styles.tdQty}>
                    <div className={styles.qtyBadge}>
                      <span className={styles.qtyNumber}>{dish.qty}</span>
                      <span className={styles.qtyLabel}>/ suất</span>
                    </div>
                  </td>

                  {/* Thành phần & NCC */}
                  <td className={styles.tdIngredients}>
                    <div className={styles.ingredientList}>
                      {dish.ingredients && dish.ingredients.length > 0 ? (
                        dish.ingredients.map((ing, iIdx) => (
                          <div key={iIdx} className={styles.ingredientTag}>
                            <span className={`material-symbols-outlined ${styles.ingIcon}`}>eco</span>
                            <span className={styles.ingText}>{ing}</span>
                            <span className={styles.vietgapBadge}>VietGAP</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">Chưa xác định thành phần</span>
                      )}
                    </div>
                  </td>

                  {/* Tổng nhu cầu */}
                  <td className={styles.tdDemand}>
                    <div className={styles.demandBlock}>
                      <span className={styles.demandValue}>{demand}</span>
                      <span className={styles.demandSub}>Theo quy mô ca</span>
                    </div>
                  </td>

                  {/* Đối soát dị ứng */}
                  <td className={styles.tdAllergy}>
                    {allergy ? (
                      <div className={`${styles.allergyPill} ${styles[allergy.severity]}`}>
                        <span className="material-symbols-outlined text-[15px]">warning</span>
                        <span>{allergy.label}</span>
                      </div>
                    ) : (
                      <div className={styles.safePill}>
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        <span>An toàn phổ thông</span>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

