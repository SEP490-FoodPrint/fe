import { formatSmallQuantity } from "src/utils/quantity"
import React, { useEffect, useMemo, useState } from "react"
import { Button, Chip } from "@mui/material"
import { ClipboardCheck, CircleHelp, LoaderCircle, ShieldAlert } from "lucide-react"
import styles from "./MenuDetailDishesTable.module.scss"
import MenuService from "src/services/MenuService"
import { getDishAllergyState } from "src/services/MenuService/adapter"

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
  gradeIds = [],
}) {
  const gradeKey = [...gradeIds].sort().join(",")
  
  const ingredientKey = useMemo(() => {
    const list = Array.isArray(dishes) ? dishes : []
    const allDishes = [...list]
    if (substituteDish) allDishes.push(substituteDish)
    list.forEach(d => {
      if (d.substituteDish) allDishes.push(d.substituteDish)
    })
    return [...new Set(allDishes.flatMap((dish) =>
      dish.ingredientIds || dish.ingredientStandards?.map((line) => line.ingredientId) || []
    ))].filter((id) => /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)).sort().join(",")
  }, [dishes, substituteDish])

  const [allergyCheck, setAllergyCheck] = useState({ key: "", status: "unknown", conflicts: [], ingredientIds: [] })
  const [retryAttempt, setRetryAttempt] = useState(0)
  const checkKey = `${gradeKey}:${ingredientKey}`

  useEffect(() => {
    let active = true
    if (!ingredientKey) return () => { active = false }
    const ingredientIds = ingredientKey.split(",")
    setAllergyCheck({ key: checkKey, status: "loading", conflicts: [], ingredientIds })
    const batches = []
    for (let index = 0; index < ingredientIds.length; index += 100) {
      batches.push(ingredientIds.slice(index, index + 100))
    }
    Promise.all(batches.map((ids) => MenuService.checkAllergies(ids, gradeIds)))
      .then((results) => {
        if (active) setAllergyCheck({ key: checkKey, status: "ready", ingredientIds, conflicts: results.flatMap((result) => result.data.conflicts) })
      })
      .catch((error) => {
        if (active) setAllergyCheck({ key: checkKey, status: "error", ingredientIds, conflicts: [], message: error.message })
      })
    return () => { active = false }
  }, [checkKey, retryAttempt])

  const currentCheck = allergyCheck.key === checkKey
    ? allergyCheck
    : { status: ingredientKey ? "loading" : "unknown", conflicts: [], ingredientIds: [] }

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

      {currentCheck.status === "error" && (
        <div className={styles.allergyNotice} role="status">
          <span>{currentCheck.message || "Chưa tải được kết quả đối soát dị ứng."}</span>
          <Button size="small" onClick={() => setRetryAttempt((value) => value + 1)}>Thử lại</Button>
        </div>
      )}

      <div className={styles.tableResponsive}>
        <table className={styles.table} aria-label="Cơ cấu món ăn và định lượng nguyên liệu, gia vị trên suất">
          <thead>
            <tr>
              <th scope="col" className={styles.thIndex}>STT</th>
              <th scope="col" className={styles.thDish}>Tên món ăn</th>
              <th scope="col" className={styles.thMainIngredients}>Nguyên liệu chính</th>
              <th scope="col" className={styles.thSeasonings}>Gia vị</th>
              <th scope="col" className={styles.thAllergy}>Đối soát dị ứng</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, idx) => {
              const allergy = getDishAllergyState(dish, currentCheck)
              const AllergyIcon = allergy.status === "conflict" ? ShieldAlert
                : allergy.status === "clear" ? ClipboardCheck
                  : allergy.status === "loading" ? LoaderCircle : CircleHelp

              const ingredientsList = getDishIngredientsList(dish)
              const { mainIngredients, seasonings } = splitIngredients(ingredientsList, mealSeasonings)

              const dishKey = dish.dishId || dish.id
              const sub =
                dish.substituteDish ||
                (substituteDish?.substituteForDishId === dishKey
                  ? substituteDish
                  : null)

              const rowClass = `${styles.tr} ${idx % 2 === 0 ? styles.rowEven : styles.rowOdd}`

              let subRow = null
              if (sub) {
                const subAllergy = getDishAllergyState(sub, currentCheck)
                const SubAllergyIcon = subAllergy.status === "conflict" ? ShieldAlert
                  : subAllergy.status === "clear" ? ClipboardCheck
                    : subAllergy.status === "loading" ? LoaderCircle : CircleHelp
                const subIngredientsList = getDishIngredientsList(sub)
                const subSplit = splitIngredients(subIngredientsList, mealSeasonings)

                subRow = (
                  <tr key={`sub-${dishKey}-${idx}`} className={`${styles.tr} ${styles.substituteRow}`}>
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
                    {/* Đối soát dị ứng: không viền, không màu nền, chữ mờ màu xám "Chưa ghi nhận" */}
                    <td className={styles.tdAllergy}>
                      {subAllergy.status === "conflict" ? (
                        <div className={styles.allergyStatus}>
                          <span className={`${styles.allergyConflictText} ${styles.subItemText}`}>{subAllergy.label}</span>
                          {subAllergy.description && (
                            <span className={styles.allergyDescription}>{subAllergy.description}</span>
                          )}
                          {subAllergy.classes?.length > 0 && (
                            <span className={styles.affectedClasses}>Lớp: {subAllergy.classes.join(", ")}</span>
                          )}
                        </div>
                      ) : (
                        <span className={`${styles.unrecordedText} ${styles.subItemText}`}>Chưa ghi nhận</span>
                      )}
                    </td>
                  </tr>
                )
              }

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

                    {/* Đối soát dị ứng: không viền, không màu nền, chữ mờ màu xám "Chưa ghi nhận" */}
                    <td className={styles.tdAllergy}>
                      {allergy.status === "conflict" ? (
                        <div className={styles.allergyStatus}>
                          <span className={styles.allergyConflictText}>{allergy.label}</span>
                          {allergy.description && (
                            <span className={styles.allergyDescription}>{allergy.description}</span>
                          )}
                          {allergy.classes?.length > 0 && (
                            <span className={styles.affectedClasses}>Lớp: {allergy.classes.join(", ")}</span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.unrecordedText}>Chưa ghi nhận</span>
                      )}
                    </td>
                  </tr>
                  {subRow}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
