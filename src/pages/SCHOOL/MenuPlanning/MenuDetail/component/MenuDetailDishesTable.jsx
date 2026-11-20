import { formatSmallQuantity } from "src/utils/quantity"
import React from "react"
import styles from "./MenuDetailDishesTable.module.scss"

/**
 * Kiểm tra xem một nguyên liệu có thuộc nhóm gia vị / phụ gia nêm nếm hay không.
 */
function isSeasoningItem(ing, mealSeasonings = []) {
  if (ing.ingredientRole === "SEASONING") return true
  if (ing.ingredientRole === "MAIN") return false

  const cat = (ing.category || "").toLowerCase()
  if (cat.includes("gia vị") || cat.includes("phụ gia")) return true

  const name = (ing.name || "").trim().toLowerCase()
  if (Array.isArray(mealSeasonings) && mealSeasonings.some(s => (s.name || "").trim().toLowerCase() === name)) {
    return true
  }

  const seasoningKeywords = [
    "gia vị", "nước mắm", "muối", "hạt nêm", "mì chính", "bột ngọt", "đường kính", "đường trắng",
    "dầu ăn", "dầu thực vật", "hành khô", "tỏi xay", "hành tỏi", "tiêu xay", "hạt tiêu", "tiêu đen",
    "xì dầu", "nước tương", "giấm", "gừng", "sả", "ớt", "bột canh", "ngũ vị hương", "mắm tôm",
    "dầu hào", "bơ thực vật", "mỡ lợn"
  ]
  return seasoningKeywords.some(kw => name.includes(kw))
}

function getDishIngredientsList(dish) {
  if (Array.isArray(dish.ingredientDetails) && dish.ingredientDetails.length > 0) {
    return dish.ingredientDetails
  }
  if (Array.isArray(dish.ingredientStandards) && dish.ingredientStandards.length > 0) {
    return dish.ingredientStandards
  }
  return (dish.ingredients || []).map((name) => (typeof name === "string" ? { name } : name))
}

function splitIngredients(ingredientsList, mealSeasonings) {
  const mainIngredients = []
  const seasonings = []

  ;(ingredientsList || []).forEach((ing) => {
    if (isSeasoningItem(ing, mealSeasonings)) {
      seasonings.push(ing)
    } else {
      mainIngredients.push(ing)
    }
  })

  return { mainIngredients, seasonings }
}

export default function MenuDetailDishesTable({
  dishes = [],
  substituteDish = null,
  mealSeasonings = [],
}) {

  if (!dishes || dishes.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <p className="text-slate-500 font-medium">Chưa có món ăn nào trong thực đơn này.</p>
      </div>
    )
  }

  return (
    <div className={styles.tableCard}>
      {/* Header chỉ có chữ tiêu đề (đã bỏ icon theo yêu cầu) */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.titleWithBadge}>
            <h2 className={styles.cardTitle}>Danh sách món ăn</h2>
            <span className={styles.dishCountBadge}>{dishes.length} món</span>
          </div>
        </div>
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.table} aria-label="Cơ cấu món ăn và định lượng nguyên liệu, gia vị trên suất">
          <thead>
            <tr>
              <th scope="col" className={styles.thIndex}>STT</th>
              <th scope="col" className={styles.thDish}>Tên món ăn</th>
              <th scope="col" className={styles.thMainIngredients}>Nguyên liệu chính</th>
              <th scope="col" className={styles.thSeasonings}>Gia vị</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, idx) => {
              const ingredientsList = getDishIngredientsList(dish)
              const { mainIngredients, seasonings } = splitIngredients(ingredientsList, mealSeasonings)

              const dishKey = dish.dishId || dish.id
              const subs = dish.substituteDishes?.length
                ? dish.substituteDishes
                : dish.substituteDish
                  ? [dish.substituteDish]
                  : substituteDish?.substituteForDishId === dishKey
                    ? [substituteDish]
                    : []

              const rowClass = `${styles.tr} ${idx % 2 === 0 ? styles.rowEven : styles.rowOdd}`

              const subRows = subs.map((sub, subIdx) => {
                const subIngredientsList = getDishIngredientsList(sub)
                const subSplit = splitIngredients(subIngredientsList, mealSeasonings)

                return (
                  <tr key={`sub-${dishKey}-${sub.dishId || sub.id || subIdx}`} className={`${styles.tr} ${styles.substituteRow}`}>
                    <td className={`${styles.tdIndex} ${styles.tdSubIndex}`}>
                      <span className={styles.subArrowIcon}>↳</span>
                    </td>
                    <td className={`${styles.tdDish} ${styles.tdSubDish}`}>
                      <div className={styles.subDishContainer}>
                        <div className={styles.subDishHeader}>
                          <span className={styles.subDishTag}>Món thay thế dị ứng</span>
                        </div>
                        <span className={styles.subDishName}>{sub.name}</span>
                      </div>
                    </td>
                    <td className={styles.tdMainIngredients}>
                      <div className={styles.textItemsWrapper}>
                        {subSplit.mainIngredients.length > 0 ? (
                          subSplit.mainIngredients.map((ing, iIdx) => {
                            const hasQty = ing.quantityPerPortion != null && ing.quantityPerPortion !== ""
                            return (
                              <span key={iIdx} className={`${styles.mainIngItem} ${styles.subItemText}`}>
                                <span className={styles.mainIngName}>{ing.name}</span>
                                {hasQty && (
                                  <>
                                    <span className={styles.colon}>: </span>
                                    <span className={styles.mainIngQty}>
                                      {formatSmallQuantity(ing.quantityPerPortion, ing.unit || "g")}
                                    </span>
                                  </>
                                )}
                                {iIdx < subSplit.mainIngredients.length - 1 && <span className={styles.itemSeparator}>,</span>}
                              </span>
                            )
                          })
                        ) : (
                          <span className={styles.emptyNote}>-</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.tdSeasonings}>
                      <div className={styles.textItemsWrapper}>
                        {subSplit.seasonings.length > 0 ? (
                          subSplit.seasonings.map((ing, sIdx) => {
                            const hasQty = ing.quantityPerPortion != null && ing.quantityPerPortion !== ""
                            return (
                              <span key={sIdx} className={`${styles.seasoningItem} ${styles.subItemText}`}>
                                <span className={styles.seasoningName}>{ing.name}</span>
                                {hasQty && (
                                  <>
                                    <span className={styles.colon}>: </span>
                                    <span className={styles.seasoningQty}>
                                      {formatSmallQuantity(ing.quantityPerPortion, ing.unit || "g")}
                                    </span>
                                  </>
                                )}
                                {sIdx < subSplit.seasonings.length - 1 && <span className={styles.itemSeparator}>,</span>}
                              </span>
                            )
                          })
                        ) : (
                          <span className={styles.emptyNote}>Không sử dụng</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })

              return (
                <React.Fragment key={dishKey || idx}>
                  <tr className={rowClass}>
                    <td className={styles.tdIndex}>{idx + 1}</td>

                    {/* Tên món */}
                    <td className={styles.tdDish}>
                      <span className={styles.dishName}>{dish.name}</span>
                    </td>

                    {/* Nguyên liệu chính: không nền, không viền, chữ có màu, dạng tên: định lượng */}
                    <td className={styles.tdMainIngredients}>
                      <div className={styles.textItemsWrapper}>
                        {mainIngredients.length > 0 ? (
                          mainIngredients.map((ing, iIdx) => {
                            const hasQty = ing.quantityPerPortion != null && ing.quantityPerPortion !== ""
                            return (
                              <span key={iIdx} className={styles.mainIngItem}>
                                <span className={styles.mainIngName}>{ing.name}</span>
                                {hasQty && (
                                  <>
                                    <span className={styles.colon}>: </span>
                                    <span className={styles.mainIngQty}>
                                      {formatSmallQuantity(ing.quantityPerPortion, ing.unit || "g")}
                                    </span>
                                  </>
                                )}
                                {iIdx < mainIngredients.length - 1 && <span className={styles.itemSeparator}>,</span>}
                              </span>
                            )
                          })
                        ) : (
                          <span className={styles.emptyNote}>-</span>
                        )}
                      </div>
                    </td>

                    {/* Gia vị: không nền, không viền, chữ có màu, dạng tên: định lượng */}
                    <td className={styles.tdSeasonings}>
                      <div className={styles.textItemsWrapper}>
                        {seasonings.length > 0 ? (
                          seasonings.map((ing, sIdx) => {
                            const hasQty = ing.quantityPerPortion != null && ing.quantityPerPortion !== ""
                            return (
                              <span key={sIdx} className={styles.seasoningItem}>
                                <span className={styles.seasoningName}>{ing.name}</span>
                                {hasQty && (
                                  <>
                                    <span className={styles.colon}>: </span>
                                    <span className={styles.seasoningQty}>
                                      {formatSmallQuantity(ing.quantityPerPortion, ing.unit || "g")}
                                    </span>
                                  </>
                                )}
                                {sIdx < seasonings.length - 1 && <span className={styles.itemSeparator}>,</span>}
                              </span>
                            )
                          })
                        ) : (
                          <span className={styles.emptyNote}>Không sử dụng</span>
                        )}
                      </div>
                    </td>

                  </tr>
                  {subRows}
                  {dish.excludedInGroups?.length > 0 && (
                    <tr className={`${styles.tr} ${styles.substituteRow}`}>
                      <td className={`${styles.tdIndex} ${styles.tdSubIndex}`}>
                        <span className={styles.subArrowIcon}>↳</span>
                      </td>
                      <td className={`${styles.tdDish} ${styles.tdSubDish}`} colSpan={3}>
                        <div className={styles.subDishContainer}>
                          <div className={styles.subDishHeader}>
                            <span className={styles.subDishTag}>Suất kiêng dị ứng</span>
                          </div>
                          <span className={styles.subDishName}>
                            Không dùng món này cho {dish.excludedInGroups.join(", ")} (chưa có món thay thế)
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
