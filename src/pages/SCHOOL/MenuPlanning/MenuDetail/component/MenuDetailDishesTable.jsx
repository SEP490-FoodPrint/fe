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
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>restaurant</span>
          <div className={styles.titleWithBadge}>
            <h2 className={styles.cardTitle}>Cơ cấu món ăn trong thực đơn</h2>
            <span className={styles.dishCountBadge}>{dishes.length} món ăn</span>
          </div>
        </div>
      </div>

      <div className={styles.allergyNotice} role="status" aria-live="polite">
        <span>{currentCheck.status === "loading"
          ? "Đang đối chiếu nguyên liệu với hồ sơ dị ứng của các lớp…"
          : currentCheck.status === "error"
            ? currentCheck.message || "Chưa tải được kết quả đối soát dị ứng."
            : "Đối soát dựa trên nguyên liệu và hồ sơ dị ứng của các lớp hiện có."}</span>
        {currentCheck.status === "error" && <Button size="small" onClick={() => setRetryAttempt(value => value + 1)}>Thử lại</Button>}
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.table} aria-label="Cơ cấu món ăn và đối soát dị ứng">
          <thead>
            <tr>
              <th scope="col" className={styles.thIndex}>STT</th>
              <th scope="col" className={styles.thDish}>Tên món ăn</th>
              <th scope="col" className={styles.thQty}>Định lượng / Suất</th>
              <th scope="col" className={styles.thIngredients}>Thành phần chính & Nhà cung cấp liên kết</th>
              <th scope="col" className={styles.thAllergy}>Đối soát dị ứng</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, idx) => {
              const allergy = getDishAllergyState(dish, currentCheck)
              const AllergyIcon = allergy.status === "conflict" ? ShieldAlert
                : allergy.status === "clear" ? ClipboardCheck
                  : allergy.status === "loading" ? LoaderCircle : CircleHelp

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

                  {/* Đối soát dị ứng */}
                  <td className={styles.tdAllergy}>
                    <div className={styles.allergyStatus}>
                      <Chip className={`${styles.allergyChip} ${styles[allergy.status]}`}
                        icon={<AllergyIcon aria-hidden="true" className={allergy.status === "loading" ? styles.loadingIcon : undefined} />}
                        label={allergy.label} />
                      {allergy.description && <span className={styles.allergyDescription}>{allergy.description}</span>}
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

