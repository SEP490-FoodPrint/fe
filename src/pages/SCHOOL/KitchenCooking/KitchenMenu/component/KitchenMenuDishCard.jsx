import React from "react"
import { useNavigate } from "react-router-dom"
import {
  UtensilsCrossed,
  Eye,
  AlertTriangle,
  CheckCircle2,
  CookingPot,
  Plus,
} from "lucide-react"
import { Tooltip, IconButton } from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./KitchenMenuDishCard.module.scss"

export default function KitchenMenuDishCard({ dish }) {
  const navigate = useNavigate()

  const handleAction = (e) => {
    e.stopPropagation()
    if (dish.isBatchCreated && dish.batchId) {
      navigate(
        ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", dish.batchId)
      )
    } else {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_CREATE)
    }
  }

  const getCategoryClass = () => {
    switch (dish.category) {
      case "MAIN":
        return styles.catMain
      case "SOUP":
        return styles.catSoup
      case "SIDE":
        return styles.catSide
      case "DESSERT":
        return styles.catDessert
      case "SNACK":
      case "DRINK":
        return styles.catSnack
      default:
        return styles.catDefault
    }
  }

  return (
    <div
      className={styles.dishCard}
      onClick={handleAction}
      role="button"
      tabIndex={0}
      aria-label={`${dish.name} - ${dish.portions} ${dish.unit || "suất"}`}
    >
      <div className={styles.dishHeader}>
        <span className={`${styles.categoryTag} ${getCategoryClass()}`}>
          {dish.categoryLabel || "Món ăn"}
        </span>

        {dish.allergens && dish.allergens.length > 0 && (
          <span className={styles.allergenChip} title={`Có dị nguyên: ${dish.allergens.join(", ")}`}>
            <AlertTriangle size={11} />
            <span>{dish.allergens[0]}</span>
          </span>
        )}
      </div>

      <div className={styles.dishBody}>
        <h4 className={styles.dishName}>{dish.name}</h4>
      </div>

      <div className={styles.dishFooter}>
        <div className={styles.portionWrap}>
          <span className={styles.portionNum}>
            {(dish.portions || 1250).toLocaleString("vi-VN")}
          </span>
          <span className={styles.portionUnit}>{dish.unit || "suất"}</span>
        </div>

        <div className={styles.actionWrap}>
          {dish.isBatchCreated ? (
            <Tooltip title="Xem lô chế biến đã tạo" arrow>
              <IconButton
                size="small"
                className={styles.btnViewBatch}
                onClick={handleAction}
                aria-label={`Xem lô ${dish.name}`}
              >
                <Eye size={15} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Tạo lô chế biến món này" arrow>
              <IconButton
                size="small"
                className={styles.btnCreateBatch}
                onClick={handleAction}
                aria-label={`Tạo lô chế biến ${dish.name}`}
              >
                <Plus size={15} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}

