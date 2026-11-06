import React from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, PlusCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import { getStoredDishCatalog } from "src/pages/SCHOOL/MenuPlanning/dishCatalogData"
import styles from "./HealthMasterDataCard.module.scss"

export default function HealthMasterDataCard() {
  const navigate = useNavigate()
  const catalog = getStoredDishCatalog()

  // Thống kê nhanh theo từng nhóm món ăn
  const stats = [
    { key: "RICE_STARCH", label: "Cơm & Tinh bột", emoji: "🍚", count: catalog.filter((d) => d.category === "RICE_STARCH").length },
    { key: "MAIN_DISH", label: "Đạm chính / Món mặn", emoji: "🍖", count: catalog.filter((d) => d.category === "MAIN_DISH").length },
    { key: "VEGETABLE", label: "Món xào / Rau củ", emoji: "🥦", count: catalog.filter((d) => d.category === "VEGETABLE").length },
    { key: "SOUP", label: "Canh dinh dưỡng", emoji: "🍲", count: catalog.filter((d) => d.category === "SOUP").length },
    { key: "AFTERNOON", label: "Món xế bán trú", emoji: "🧋", count: catalog.filter((d) => d.category === "AFTERNOON").length },
    { key: "ALLERGY_SUBSTITUTE", label: "Thay thế dị ứng", emoji: "🛡️", count: catalog.filter((d) => d.category === "ALLERGY_SUBSTITUTE").length },
  ]

  return (
    <div className={styles.masterDataCard}>
      <div className={styles.leftInfo}>
        <div className={styles.iconWrap}>
          <BookOpen size={24} />
        </div>
        <div className={styles.textWrap}>
          <div className={styles.badgeRow}>
            <span className={styles.highlightBadge}>Master Data Y Tế</span>
            <span className={styles.countBadge}>
              <CheckCircle2 size={13} className={styles.miniCheck} />
              {catalog.length} món đã chuẩn hóa
            </span>
          </div>
          <h2 className={styles.title}>Kho Món Ăn Bán Trú Học Đường</h2>
          <p className={styles.desc}>
            Cán bộ Y tế nhập trước danh mục món ăn & định lượng chuẩn (suất/g/ml). Gạo được quản lý như món tinh bột chính. Khi lập thực đơn, chỉ cần chọn nhanh từ kho mà không phải gõ tay.
          </p>

          {/* Dải thống kê các nhóm món ăn */}
          <div className={styles.categoryPills}>
            {stats.map((s) => (
              <div key={s.key} className={styles.pillItem}>
                <span className={styles.pillEmoji}>{s.emoji}</span>
                <span className={styles.pillLabel}>{s.label}:</span>
                <strong className={styles.pillCount}>{s.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.rightActions}>
        <button
          type="button"
          className={styles.primaryActionBtn}
          onClick={() => navigate(ROUTER.SCHOOL_DISH_CATALOG)}
        >
          <span>Quản lý Kho Món Ăn</span>
          <ArrowRight size={16} className={styles.btnArrow} />
        </button>

        <button
          type="button"
          className={styles.secondaryActionBtn}
          onClick={() => navigate(ROUTER.SCHOOL_MENU_CREATE)}
        >
          <PlusCircle size={15} className={styles.btnPlus} />
          <span>Lập thực đơn từ Kho</span>
        </button>
      </div>
    </div>
  )
}
