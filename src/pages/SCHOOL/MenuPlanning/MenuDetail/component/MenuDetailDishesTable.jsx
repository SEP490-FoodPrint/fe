import React, { useEffect, useMemo, useState } from "react"
import { Button, Chip } from "@mui/material"
import { ClipboardCheck, CircleHelp, LoaderCircle, ShieldAlert } from "lucide-react"
import styles from "./MenuDetailDishesTable.module.scss"
import MenuService from "src/services/MenuService"
import { getDishAllergyState } from "src/services/MenuService/adapter"

export default function MenuDetailDishesTable({ dishes = [] }) {
  const ingredientKey = useMemo(() => [...new Set((Array.isArray(dishes) ? dishes : []).flatMap((dish) =>
    dish.ingredientIds || dish.ingredientStandards?.map((line) => line.ingredientId) || [],
  ))].filter((id) => /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)).sort().join(","), [dishes])
  const [allergyCheck, setAllergyCheck] = useState({ key: "", status: "unknown", conflicts: [], ingredientIds: [] })
  const [retryAttempt, setRetryAttempt] = useState(0)

  useEffect(() => {
    let active = true
    if (!ingredientKey) return () => { active = false }
    const ingredientIds = ingredientKey.split(",")
    setAllergyCheck({ key: ingredientKey, status: "loading", conflicts: [], ingredientIds })
    const batches = []
    for (let index = 0; index < ingredientIds.length; index += 100) {
      batches.push(ingredientIds.slice(index, index + 100))
    }
    Promise.all(batches.map((ids) => MenuService.checkAllergies(ids)))
      .then((results) => {
        if (active) setAllergyCheck({ key: ingredientKey, status: "ready", ingredientIds, conflicts: results.flatMap((result) => result.data.conflicts) })
      })
      .catch((error) => {
        if (active) setAllergyCheck({ key: ingredientKey, status: "error", ingredientIds, conflicts: [], message: error.message })
      })
    return () => { active = false }
  }, [ingredientKey, retryAttempt])

  const currentCheck = allergyCheck.key === ingredientKey
    ? allergyCheck
    : { status: ingredientKey ? "loading" : "unknown", conflicts: [], ingredientIds: [] }

  if (!dishes || dishes.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <span className="material-symbols-outlined text-[32px] text-slate-400">restaurant_menu</span>
        <p className="text-slate-500 font-medium">Chưa có món ăn nào trong thực đơn này.</p>
      </div>
    )
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant_menu</span>
          <h2 className={styles.cardTitle}>Danh sách món ăn</h2>
        </div>
      </div>

      {currentCheck.status === "error" && (
        <div className={styles.allergyNotice} role="status">
          <span>{currentCheck.message || "Chưa tải được kết quả đối soát dị ứng."}</span>
          <Button size="small" onClick={() => setRetryAttempt(value => value + 1)}>Thử lại</Button>
        </div>
      )}

      <div className={styles.tableResponsive}>
        <table className={styles.table} aria-label="Cơ cấu món ăn và định lượng nguyên liệu trên suất">
          <thead>
            <tr>
              <th scope="col" className={styles.thIndex}>STT</th>
              <th scope="col" className={styles.thDish}>Tên món ăn</th>
              <th scope="col" className={styles.thIngredients}>Định lượng nguyên liệu / suất</th>
              <th scope="col" className={styles.thAllergy}>Đối soát dị ứng</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, idx) => {
              const allergy = getDishAllergyState(dish, currentCheck)
              const AllergyIcon = allergy.status === "conflict" ? ShieldAlert
                : allergy.status === "clear" ? ClipboardCheck
                  : allergy.status === "loading" ? LoaderCircle : CircleHelp

              const ingredientsList = dish.ingredientDetails && dish.ingredientDetails.length > 0
                ? dish.ingredientDetails
                : dish.ingredientStandards && dish.ingredientStandards.length > 0
                  ? dish.ingredientStandards
                  : (dish.ingredients || []).map((name) => ({ name }))

              return (
                <tr key={idx} className={styles.tr}>
                  <td className={styles.tdIndex}>{idx + 1}</td>

                  {/* Tên món */}
                  <td className={styles.tdDish}>
                    <span className={styles.dishName}>{dish.name}</span>
                  </td>

                  {/* Định lượng nguyên liệu / suất */}
                  <td className={styles.tdIngredients}>
                    <div className={styles.ingredientItems}>
                      {ingredientsList.length > 0 ? (
                        ingredientsList.map((ing, iIdx) => {
                          const hasQty = ing.quantityPerPortion != null && ing.quantityPerPortion !== ""
                          return (
                            <div key={iIdx} className={styles.ingredientPill}>
                              <span className={styles.ingName}>{ing.name}</span>
                              {hasQty && (
                                <span className={styles.ingQtyBadge}>
                                  {ing.quantityPerPortion} {ing.unit || "g"}
                                </span>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <span className="text-slate-400 text-xs italic">Chưa xác định nguyên liệu</span>
                      )}
                    </div>
                  </td>

                  {/* Đối soát dị ứng */}
                  <td className={styles.tdAllergy}>
                    <div className={styles.allergyStatus}>
                      <Chip
                        className={`${styles.allergyChip} ${styles[allergy.status]}`}
                        icon={<AllergyIcon aria-hidden="true" className={allergy.status === "loading" ? styles.loadingIcon : undefined} />}
                        label={allergy.label}
                      />
                      {allergy.description && allergy.status === "conflict" && (
                        <span className={styles.allergyDescription}>{allergy.description}</span>
                      )}
                      {allergy.classes?.length > 0 && (
                        <span className={styles.affectedClasses}>Lớp: {allergy.classes.join(", ")}</span>
                      )}
                    </div>
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
