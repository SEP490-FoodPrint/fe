import React from "react"
import { Layers, PackageCheck, Info, CheckCircle2 } from "lucide-react"
import styles from "./BatchIngredientsCard.module.scss"

export default function BatchIngredientsCard({ ingredients = [] }) {
  return (
    <section className={styles.ingredientsCard}>
      {/* Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <Layers size={18} />
          </div>
          <h2 className={styles.cardTitle}>Nguyên liệu sử dụng</h2>
        </div>
        <div className={styles.countBadge}>
          <PackageCheck size={14} />
          <span>{ingredients.length} nguyên liệu (từ các lô xuất kho đạt chuẩn)</span>
        </div>
      </div>

      {/* 1. Desktop Table View (>= 640px) */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thName}>Tên nguyên liệu</th>
              <th className={styles.thLot}>Mã lô nguyên liệu</th>
              <th className={styles.thPlanned}>Lượng dự kiến</th>
              <th className={styles.thActual}>Lượng thực dùng</th>
              <th className={styles.thUnit}>Đơn vị</th>
              <th className={styles.thExpiry}>Hạn sử dụng (HSD)</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((item) => (
              <tr key={item.id} className={styles.row}>
                {/* Tên */}
                <td className={styles.tdName}>
                  <div className={styles.nameWrap}>
                    <span className={styles.dot} />
                    <span className={styles.nameText}>{item.name}</span>
                  </div>
                </td>

                {/* Mã lô */}
                <td className={styles.tdLot}>
                  <div className={styles.lotWrap}>
                    <span className={styles.lotCode}>{item.lotCode}</span>
                    <span className={styles.lotQualityBadge}>Đạt</span>
                  </div>
                </td>

                {/* Lượng dự kiến */}
                <td className={styles.tdPlanned}>
                  <span className={styles.numBold}>{item.plannedQty}</span>
                </td>

                {/* Lượng thực dùng */}
                <td className={styles.tdActual}>
                  {item.actualQty ? (
                    <span className={styles.numActual}>{item.actualQty}</span>
                  ) : (
                    <span className={styles.dashText} title="Sẽ cập nhật sau khi nấu">
                      — (Chưa ghi nhận)
                    </span>
                  )}
                </td>

                {/* Đơn vị */}
                <td className={styles.tdUnit}>
                  <span className={styles.unitText}>{item.unit}</span>
                </td>

                {/* HSD */}
                <td className={styles.tdExpiry}>
                  <div className={styles.expiryWrap}>
                    <span className={styles.expiryDate}>{item.expiryDate}</span>
                    <span className={`${styles.expiryNotePill} ${styles[`note_${item.noteType || "default"}`]}`}>
                      {item.expiryNote}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card List (< 640px) */}
      <div className={styles.mobileCardList}>
        {ingredients.map((item) => (
          <div key={item.id} className={styles.mobileItemCard}>
            <div className={styles.mobileItemTop}>
              <div className={styles.mobileItemName}>
                <span className={styles.dot} />
                <span>{item.name}</span>
              </div>
              <div className={styles.lotWrap}>
                <span className={styles.lotCode}>{item.lotCode}</span>
                <span className={styles.lotQualityBadge}>Đạt</span>
              </div>
            </div>

            <div className={styles.mobileItemGrid}>
              <div className={styles.mobileGridCol}>
                <span className={styles.mobileLabel}>Dự kiến:</span>
                <span className={styles.mobileValBold}>
                  {item.plannedQty} {item.unit}
                </span>
              </div>

              <div className={styles.mobileGridCol}>
                <span className={styles.mobileLabel}>Thực dùng:</span>
                <span className={styles.mobileValMuted}>
                  {item.actualQty ? `${item.actualQty} ${item.unit}` : "—"}
                </span>
              </div>
            </div>

            <div className={styles.mobileItemBottom}>
              <span className={styles.mobileLabel}>HSD: {item.expiryDate}</span>
              <span className={`${styles.expiryNotePill} ${styles[`note_${item.noteType || "default"}`]}`}>
                {item.expiryNote}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className={styles.footerNote}>
        <Info size={15} className={styles.infoIcon} />
        <span>
          Lượng thực dùng sẽ được bếp trưởng cân đo và cập nhật chính xác sau khi hoàn tất quy trình chế biến thực tế.
        </span>
      </div>
    </section>
  )
}

