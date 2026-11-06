import React, { useEffect, useState } from "react"
import { Alert, Button } from "@mui/material"
import { Sparkles, Info } from "lucide-react"
import styles from "./MenuSeasoningCard.module.scss"
import MenuService from "src/services/MenuService"

export default function MenuSeasoningCard({
  seasonings = [],
  onUpdateSeasoning,
  onAddSeasoning,
  onRemoveSeasoning,
  totalStudents = 1250,
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
        if (active) {
          // Lọc bỏ gạo nếu trong backend còn sót ở gia vị (vì gạo đã là món ăn chính)
          const filtered = (result.data || []).filter(
            (item) => !item.name?.toLowerCase().includes("gạo")
          )
          setCatalog(filtered)
        }
      })
      .catch((error) => {
        if (active) {
          setCatalog([])
          setCatalogError(error.message || "Không tải được danh mục gia vị của trường.")
        }
      })
      .finally(() => {
        if (active) setLoadingCatalog(false)
      })
    return () => {
      active = false
    }
  }, [catalogAttempt])

  const handleCatalogChange = (seasId, catalogId) => {
    if (!catalogId) {
      onUpdateSeasoning(seasId, { ingredientEntryId: "", catalogId: "", name: "" })
      return
    }
    const selectedCatalogItem = catalog.find((w) => w.id === catalogId)
    if (selectedCatalogItem) {
      onUpdateSeasoning(seasId, {
        ingredientEntryId: selectedCatalogItem.id,
        catalogId: selectedCatalogItem.id,
        name: selectedCatalogItem.name,
        unit: selectedCatalogItem.defaultUnit || "g",
      })
    }
  }

  // Quy đổi giữa định lượng/suất và tổng lượng ca ăn
  const calculateTotalBatch = (portionQty, unit) => {
    const qty = Number(portionQty) || 0
    const totalRaw = qty * totalStudents
    if (unit === "ml") {
      const liters = totalRaw / 1000
      return `${liters % 1 === 0 ? liters : liters.toFixed(2)} Lít`
    } else if (unit === "g") {
      const kgs = totalRaw / 1000
      return `${kgs % 1 === 0 ? kgs : kgs.toFixed(2)} Kg`
    }
    return `${totalRaw} ${unit}`
  }

  return (
    <div className={styles.seasoningCard} aria-busy={loadingCatalog}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            soup_kitchen
          </span>
          <div>
            <h2 className={styles.cardTitle}>Gia vị dùng chung cho bữa ăn</h2>
            <p className={styles.cardSubtitle}>
              Nhập theo định lượng trên <strong>1 bữa ăn của ngày cho toàn bộ {totalStudents.toLocaleString()} học sinh</strong>.
              (Gạo đã được đưa lên thành món ăn trong Kho món ăn).
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
          <span>+ Thêm gia vị từ kho</span>
        </button>
      </div>

      {loadingCatalog ? (
        <div className={styles.catalogNotice} role="status">
          Đang tải danh mục gia vị từ kho trường…
        </div>
      ) : catalogError ? (
        <Alert
          severity="error"
          className={styles.catalogNotice}
          action={
            <Button
              color="inherit"
              onClick={() => setCatalogAttempt((value) => value + 1)}
            >
              Tải lại
            </Button>
          }
        >
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
              <th className={styles.thQty}>Định lượng / 1 Suất</th>
              <th className={styles.thBatchQty}>
                Tổng định lượng 1 ca ({totalStudents.toLocaleString()} HS)
              </th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {seasonings.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Bữa ăn đang chọn chưa có định lượng gia vị được lưu. Bấm “+ Thêm gia vị từ kho” để khai báo.
                </td>
              </tr>
            ) : (
              seasonings.map((seas, index) => {
                const portion = Number(seas.portionQty ?? seas.quantityPerPortion) || 0
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
                          onChange={(e) =>
                            handleCatalogChange(seas.id, e.target.value)
                          }
                          aria-label={`Gia vị thứ ${index + 1}`}
                          disabled={
                            loadingCatalog ||
                            Boolean(catalogError) ||
                            catalog.length === 0
                          }
                        >
                          <option value="">
                            -- Chọn gia vị do Quản lý nguyên liệu nhập --
                          </option>
                          {(seas.ingredientEntryId || seas.catalogId) &&
                            !catalog.some(
                              (item) =>
                                item.id ===
                                (seas.ingredientEntryId || seas.catalogId)
                            ) && (
                              <option
                                value={seas.ingredientEntryId || seas.catalogId}
                              >
                                {seas.name} (đã lưu trong thực đơn)
                              </option>
                            )}
                          {catalog.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <span
                          className={`material-symbols-outlined ${styles.selectChevron}`}
                        >
                          expand_more
                        </span>
                      </div>
                    </td>

                    {/* Nhập Định lượng / 1 Suất */}
                    <td className={styles.tdQty}>
                      <div className={styles.qtyControlGroup}>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          className={styles.qtyInput}
                          value={seas.portionQty ?? seas.quantityPerPortion ?? ""}
                          aria-label={`Định lượng gia vị thứ ${index + 1} mỗi suất`}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            onUpdateSeasoning(seas.id, {
                              portionQty: isNaN(val) ? "" : val,
                              quantityPerPortion: isNaN(val) ? "" : val,
                            })
                          }}
                        />
                        <select
                          className={styles.unitSelect}
                          value={seas.unit || "g"}
                          onChange={(e) =>
                            onUpdateSeasoning(seas.id, { unit: e.target.value })
                          }
                          aria-label={`Đơn vị gia vị thứ ${index + 1}`}
                        >
                          <option value="ml">ml</option>
                          <option value="g">g</option>
                        </select>
                        <span className={styles.portionLabel}>/suất</span>
                      </div>
                    </td>

                    {/* Tổng định lượng cho 1 ca ăn của tất cả học sinh */}
                    <td className={styles.tdBatchQty}>
                      <div className={styles.batchQtyBadge}>
                        <span className={styles.batchValue}>
                          {calculateTotalBatch(portion, seas.unit || "g")}
                        </span>
                        <span className={styles.batchSub}>
                          xuất kho ({totalStudents.toLocaleString()} HS)
                        </span>
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
                        <span className="material-symbols-outlined">
                          delete_outline
                        </span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
