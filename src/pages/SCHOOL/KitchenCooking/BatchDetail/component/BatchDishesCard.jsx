import React, { useState, useEffect } from "react"
import { Utensils, ChevronDown, ChevronUp, Package, Sparkles } from "lucide-react"
import { loadDishCatalog } from "src/services/DishService"
import styles from "./BatchDishesCard.module.scss"

export default function BatchDishesCard({ batchData = {} }) {
  const [catalogMap, setCatalogMap] = useState({})
  const [expandedIds, setExpandedIds] = useState(() => new Set([0])) // Mặc định mở món đầu tiên

  const dishes = Array.isArray(batchData.dishes) && batchData.dishes.length > 0
    ? batchData.dishes
    : batchData.dishName
    ? [{ dishId: "single-dish", name: batchData.dishName, plannedPortions: batchData.portions }]
    : []

  // Tải danh mục món ăn để lấy nguyên liệu chính & gia vị chuẩn nếu batch chưa đính kèm sẵn
  useEffect(() => {
    let isMounted = true
    loadDishCatalog()
      .then((catalog) => {
        if (!isMounted || !Array.isArray(catalog)) return
        const map = {}
        for (const item of catalog) {
          if (item.id) map[item.id] = item
          if (item.name) map[item.name.trim().toLowerCase()] = item
        }
        setCatalogMap(map)
      })
      .catch(() => {
        // Nếu không tải được catalog, fallback hiển thị từ dữ liệu batch hiện có
      })
    return () => {
      isMounted = false
    }
  }, [])

  const toggleExpand = (index) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

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
            const isExpanded = expandedIds.has(index)

            // Lấy nguyên liệu từ dish hoặc catalog
            const catalogItem =
              (dish.dishId && catalogMap[dish.dishId]) ||
              (dish.name && catalogMap[dish.name.trim().toLowerCase()])

            // 1. Nguyên liệu chính
            let mainIngredients =
              dish.mainIngredients && dish.mainIngredients.length > 0
                ? dish.mainIngredients
                : catalogItem?.lines
                ? catalogItem.lines
                    .filter((l) => l.ingredientRole === "MAIN")
                    .map((l) => ({
                      name: l.name,
                      requiredQuantity: l.requiredQuantity,
                      unit: l.unit || "g",
                    }))
                : []

            // Fallback nếu có trong batchData.ingredients gắn với dish
            if (mainIngredients.length === 0 && Array.isArray(batchData.ingredients)) {
              mainIngredients = batchData.ingredients
                .filter(
                  (ing) =>
                    (ing.dishId && ing.dishId === dish.dishId) ||
                    (ing.dishName && ing.dishName === dish.name)
                )
                .map((ing) => ({
                  name: ing.name,
                  requiredQuantity: ing.quantity,
                  unit: ing.unit || "kg",
                }))
            }

            // 2. Gia vị
            const seasonings =
              dish.seasonings && dish.seasonings.length > 0
                ? dish.seasonings
                : catalogItem?.lines
                ? catalogItem.lines
                    .filter((l) => l.ingredientRole === "SEASONING")
                    .map((l) => ({
                      name: l.name,
                      requiredQuantity: l.requiredQuantity,
                      unit: l.unit || "g",
                    }))
                : catalogItem?.seasonings
                ? catalogItem.seasonings.map((s) => ({
                    name: s.name,
                    requiredQuantity: s.portionQty,
                    unit: s.unit || "g",
                  }))
                : []

            return (
              <div
                key={dish.dishId || index}
                className={`${styles.dishCard} ${isExpanded ? styles.dishCardExpanded : ""}`}
              >
                {/* Header hàng món ăn - Bấm để sổ lên / xuống */}
                <div
                  className={styles.dishRowHeader}
                  onClick={() => toggleExpand(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleExpand(index)
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className={styles.dishLeft}>
                    <span className={styles.dishIndex}>{index + 1}.</span>
                    <span className={styles.dishName}>{dish.name}</span>
                  </div>

                  <div className={styles.dishRight}>
                    <span className={styles.expandHint}>
                      {isExpanded ? "Thu gọn" : "Xem nguyên liệu & gia vị"}
                    </span>
                    <span className={styles.chevronWrap}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {/* Phần chi tiết sổ xuống: Nguyên liệu chính & Gia vị */}
                {isExpanded && (
                  <div className={styles.dishDetailPanel}>
                    <div className={styles.recipeGrid}>
                      {/* Cột 1: Nguyên liệu chính */}
                      <div className={styles.recipeCol}>
                        <div className={styles.colTitleRow}>
                          <Package size={14} className={styles.mainIngIcon} />
                          <span className={styles.colTitle}>
                            Nguyên liệu chính ({mainIngredients.length})
                          </span>
                        </div>

                        {mainIngredients.length === 0 ? (
                          <div className={styles.emptySubText}>
                            Chưa có thông tin nguyên liệu chính
                          </div>
                        ) : (
                          <div className={styles.ingredientChipsWrap}>
                            {mainIngredients.map((ing, iIdx) => (
                              <div key={iIdx} className={styles.mainChip}>
                                <span className={styles.chipName}>{ing.name}</span>
                                {ing.requiredQuantity && (
                                  <span className={styles.chipQty}>
                                    {ing.requiredQuantity} {ing.unit}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Cột 2: Gia vị dùng cho món */}
                      <div className={styles.recipeCol}>
                        <div className={styles.colTitleRow}>
                          <Sparkles size={14} className={styles.seasoningIcon} />
                          <span className={styles.colTitle}>
                            Gia vị ({seasonings.length})
                          </span>
                        </div>

                        {seasonings.length === 0 ? (
                          <div className={styles.emptySubText}>
                            Chưa có thông tin gia vị
                          </div>
                        ) : (
                          <div className={styles.ingredientChipsWrap}>
                            {seasonings.map((sea, sIdx) => (
                              <div key={sIdx} className={styles.seasoningChip}>
                                <span className={styles.chipName}>{sea.name}</span>
                                {sea.requiredQuantity && (
                                  <span className={styles.chipQty}>
                                    {sea.requiredQuantity} {sea.unit}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
