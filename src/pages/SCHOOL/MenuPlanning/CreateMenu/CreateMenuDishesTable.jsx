import React from "react"
import { Plus, Trash2, Utensils } from "lucide-react"
import styles from "./CreateMenuDishesTable.module.scss"

const CAT_STYLE = {
  RICE_STARCH: styles.catRice,
  MAIN_DISH: styles.catMain,
  VEGETABLE: styles.catVeg,
  SOUP: styles.catSoup,
  DESSERT: styles.catDessert,
}

export default function CreateMenuDishesTable({
  dishes = [],
  onOpenDishPicker,
  onRemoveDish,
  readOnly = false,
}) {
  return (
    <div className={styles.tableCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h2 className={styles.cardTitle}>Món ăn trong ca này</h2>
            <span className={styles.countBadge}>{dishes.length} món</span>
          </div>
          <p className={styles.cardSubtitle}>
            Chọn món từ Kho món ăn bán trú. Đã đồng bộ sẵn định lượng chuẩn và nhà cung cấp liên kết.
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            className={styles.addDishBtn}
            onClick={onOpenDishPicker}
            title="Mở kho món ăn để chọn món vào thực đơn"
          >
            <Plus size={16} />
            <span>+ Chọn món từ Kho món ăn</span>
          </button>
        )}
      </div>

      {/* Body Table / Empty State */}
      {dishes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconBox}>
            <Utensils size={24} />
          </div>
          <h3 className={styles.emptyTitle}>Ca ăn này chưa có món nào</h3>
          <p className={styles.emptySub}>
            Bấm vào nút bên dưới để chọn các món ăn chuẩn từ Kho món ăn cho ca này.
          </p>
          {!readOnly && (
            <button
              type="button"
              className={styles.emptyActionBtn}
              onClick={onOpenDishPicker}
            >
              <Plus size={15} />
              <span>+ Chọn món từ Kho món ăn</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 45, textAlign: "center" }}>#</th>
                <th style={{ minWidth: 200 }}>Tên món ăn</th>
                <th style={{ width: 130 }}>Định lượng / suất</th>
                <th style={{ minWidth: 260 }}>Nguyên liệu & Nhà cung cấp</th>
                {!readOnly && <th style={{ width: 60, textAlign: "center" }}>Xóa</th>}
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish, idx) => {
                const catClass = CAT_STYLE[dish.category] || ""
                const mainIng = dish.mainIngredient || dish.ingredientNames?.[0] || dish.name

                return (
                  <tr key={dish.id || idx}>
                    {/* STT */}
                    <td className={styles.sttCell}>{idx + 1}</td>

                    {/* Tên món & Nhóm món */}
                    <td>
                      <div className={styles.dishCell}>
                        <strong className={styles.dishName}>{dish.name}</strong>
                        {dish.categoryLabel && (
                          <span className={`${styles.catBadge} ${catClass}`}>
                            {dish.categoryLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Định lượng chuẩn từ kho (KHÔNG CÓ INPUT) */}
                    <td>
                      <span className={styles.portionBadge}>
                        {dish.portionQty} {dish.unit || "g"}
                      </span>
                    </td>

                    {/* Nguyên liệu chính & NCC liên kết (KHÔNG CÓ NÚT CHỌN NGUYÊN LIỆU) */}
                    <td>
                      <div className={styles.ingredientText}>{mainIng}</div>
                      <div className={styles.supplierRow}>
                        <span>NCC: {dish.supplierName || "CP Foods Việt Nam"}</span>
                        {dish.supplierBadge && (
                          <span className={styles.supplierPill}>
                            {dish.supplierBadge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Thao tác xóa khỏi ca ăn */}
                    {!readOnly && (
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => onRemoveDish(dish.id)}
                          title={`Xóa món "${dish.name}" khỏi ca ăn này`}
                          aria-label="Xóa món"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

