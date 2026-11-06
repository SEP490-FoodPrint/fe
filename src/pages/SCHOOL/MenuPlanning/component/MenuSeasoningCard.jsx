import React, { useEffect, useState } from "react"
import { Alert, Button } from "@mui/material"
import styles from "./MenuSeasoningCard.module.scss"
import MenuService from "src/services/MenuService"

export default function MenuSeasoningCard({
  seasonings,
  onUpdateSeasoning,
  onAddSeasoning,
  onRemoveSeasoning
}) {
  const [catalog, setCatalog] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [catalogError, setCatalogError] = useState("")
  const [catalogAttempt, setCatalogAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoadingCatalog(true)
    setCatalogError("")
    MenuService.getIngredientOptions("seasoning")
      .then((result) => {
        if (active) setCatalog(result.data)
      })
      .catch((error) => {
        if (active) {
          setCatalog([])
          setCatalogError(error.message || "Không tải được danh mục gia vị của trường.")
        }
      })
      .finally(() => { if (active) setLoadingCatalog(false) })
    return () => { active = false }
  }, [catalogAttempt])

  const handleCatalogChange = (seasId, catalogId) => {
    if (!catalogId) {
      onUpdateSeasoning(seasId, { ingredientEntryId: "", catalogId: "", name: "" })
      return
    }
    const selectedCatalogItem = catalog.find(w => w.id === catalogId)
    if (selectedCatalogItem) {
      onUpdateSeasoning(seasId, {
        ingredientEntryId: selectedCatalogItem.id,
        catalogId: selectedCatalogItem.id,
        name: selectedCatalogItem.name,
        unit: selectedCatalogItem.defaultUnit
      })
    }
  }

  return (
    <div className={styles.seasoningCard} aria-busy={loadingCatalog}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>soup_kitchen</span>
          <div>
            <h2 className={styles.cardTitle}>
              Gia vị dùng chung cho bữa ăn
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
          disabled={loadingCatalog || Boolean(catalogError) || catalog.length === 0}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span>Thêm gia vị từ kho</span>
        </button>
      </div>

      {loadingCatalog ? (
        <div className={styles.catalogNotice} role="status">Đang tải danh mục gia vị từ kho trường…</div>
      ) : catalogError ? (
        <Alert severity="error" className={styles.catalogNotice}
          action={<Button color="inherit" onClick={() => setCatalogAttempt(value => value + 1)}>Tải lại</Button>}>
          {catalogError}
        </Alert>
      ) : catalog.length === 0 ? (
        <Alert severity="info" className={styles.catalogNotice}>
          Kho trường chưa có nguyên liệu kho khô đang hoạt động để chọn làm gia vị.
        </Alert>
      ) : null}

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
            {seasonings.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  Bữa ăn đang chọn chưa có định lượng gia vị được lưu. Bấm “Thêm gia vị từ kho” để khai báo.
                </td>
              </tr>
            ) : (
              seasonings.map((seas, index) => {
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
                        value={seas.ingredientEntryId || seas.catalogId || ""}
                        onChange={(e) => handleCatalogChange(seas.id, e.target.value)}
                        aria-label={`Gia vị thứ ${index + 1}`}
                        disabled={loadingCatalog || Boolean(catalogError) || catalog.length === 0}
                      >
                        <option value="">-- Chọn gia vị do Quản lý nguyên liệu nhập --</option>
                        {(seas.ingredientEntryId || seas.catalogId) && !catalog.some((item) => item.id === (seas.ingredientEntryId || seas.catalogId)) && (
                          <option value={seas.ingredientEntryId || seas.catalogId}>{seas.name} (đã lưu trong thực đơn)</option>
                        )}
                        {catalog.map(item => (
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
                        min="0.001"
                        step="0.001"
                        className={styles.qtyInput}
                        value={seas.portionQty ?? seas.quantityPerPortion ?? ""}
                        aria-label={`Định lượng gia vị thứ ${index + 1} mỗi suất`}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          onUpdateSeasoning(seas.id, { portionQty: isNaN(val) ? "" : val, quantityPerPortion: isNaN(val) ? "" : val })
                        }}
                      />
                      <select
                        className={styles.unitSelect}
                        value={seas.unit}
                        onChange={(e) => onUpdateSeasoning(seas.id, { unit: e.target.value })}
                        aria-label={`Đơn vị gia vị thứ ${index + 1}`}
                      >
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="l">l</option>
                        <option value="thìa">thìa</option>
                        {seas.unit && !["ml", "g", "kg", "l", "thìa"].includes(seas.unit) && <option value={seas.unit}>{seas.unit}</option>}
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
            }))}
          </tbody>
        </table>
      </div>

      <div className={styles.cardFooter}>
        <button
          type="button"
          className={styles.addInlineBtn}
          onClick={onAddSeasoning}
          disabled={loadingCatalog || Boolean(catalogError) || catalog.length === 0}
        >
          <span className="material-symbols-outlined">add</span>
          <span>Thêm dòng gia vị khác</span>
        </button>
      </div>
    </div>
  )
}
