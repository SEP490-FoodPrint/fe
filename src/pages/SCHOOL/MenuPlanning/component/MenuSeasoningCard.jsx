import React from "react"
import styles from "./MenuSeasoningCard.module.scss"
import { WAREHOUSE_SEASONINGS_CATALOG } from "../mockMenuData"

export default function MenuSeasoningCard({
  seasonings,
  portionCount,
  onUpdateSeasoning,
  onAddSeasoning,
  onRemoveSeasoning
}) {
  const handleCatalogChange = (seasId, catalogId) => {
    const selectedCatalogItem = WAREHOUSE_SEASONINGS_CATALOG.find(w => w.id === catalogId)
    if (selectedCatalogItem) {
      onUpdateSeasoning(seasId, {
        catalogId: selectedCatalogItem.id,
        name: selectedCatalogItem.name,
        unit: selectedCatalogItem.defaultUnit
      })
    }
  }

  return (
    <div className={styles.seasoningCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>soup_kitchen</span>
          <div>
            <h2 className={styles.cardTitle}>
              Gia vị dùng chung cho bữa ăn ({portionCount} suất)
            </h2>
            <p className={styles.cardSubtitle}>
              Chọn gia vị từ danh mục do <strong>Bộ phận Quản lý nguyên liệu nhập kho</strong> và quy định định lượng / suất.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={styles.addSeasoningBtn}
          onClick={onAddSeasoning}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Thêm gia vị từ kho</span>
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.seasoningTable}>
          <thead>
            <tr>
              <th className={styles.thOrder}>STT</th>
              <th className={styles.thCatalogSelect}>
                Gia vị từ danh mục kho (Bộ phận Quản lý nguyên liệu)
              </th>
              <th className={styles.thQty}>Định lượng / Suất ăn</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {seasonings.map((seas, index) => {
              return (
                <tr key={seas.id} className={styles.seasoningRow}>
                  {/* STT */}
                  <td className={styles.tdOrder}>
                    <span className={styles.orderNumber}>{index + 1}</span>
                  </td>

                  {/* Chọn Gia vị từ Kho */}
                  <td className={styles.tdCatalogSelect}>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.catalogSelect}
                        value={seas.catalogId || ""}
                        onChange={(e) => handleCatalogChange(seas.id, e.target.value)}
                      >
                        <option value="">-- Chọn gia vị do Quản lý nguyên liệu nhập --</option>
                        {WAREHOUSE_SEASONINGS_CATALOG.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <span className={`material-symbols-outlined ${styles.selectChevron}`}>expand_more</span>
                    </div>
                  </td>

                  {/* Nhập Định lượng / Suất */}
                  <td className={styles.tdQty}>
                    <div className={styles.qtyControlGroup}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className={styles.qtyInput}
                        value={seas.portionQty}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          onUpdateSeasoning(seas.id, { portionQty: isNaN(val) ? 0 : val })
                        }}
                      />
                      <select
                        className={styles.unitSelect}
                        value={seas.unit}
                        onChange={(e) => onUpdateSeasoning(seas.id, { unit: e.target.value })}
                      >
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="thìa">thìa</option>
                      </select>
                      <span className={styles.portionLabel}>/suất</span>
                    </div>
                  </td>

                  {/* Thao tác xóa */}
                  <td className={styles.tdAction}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => onRemoveSeasoning(seas.id)}
                      title="Xóa gia vị"
                    >
                      <span className="material-symbols-outlined">delete_outline</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.cardFooter}>
        <button
          type="button"
          className={styles.addInlineBtn}
          onClick={onAddSeasoning}
        >
          <span className="material-symbols-outlined">add</span>
          <span>Thêm dòng gia vị khác</span>
        </button>
      </div>
    </div>
  )
}
