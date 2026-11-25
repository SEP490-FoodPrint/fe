import React, { useEffect, useMemo, useRef, useState } from "react"
import { Alert, Button, Skeleton } from "@mui/material"
import { shortList } from "src/utils/shortList"
import { normalizeRequestSearch } from "src/lib/registration"
import notice from "src/components/Notice"
import IngredientWasteRateService from "src/services/IngredientWasteRateService"
import WasteRateFilters, { EMPTY_FILTERS } from "./component/WasteRateFilters"
import WasteRateTable from "./component/WasteRateTable"
import { isDirty, parsePercent } from "./component/wasteRate"
import styles from "./component/KitchenWasteRates.module.scss"

const errorMessage = (failure, fallback) =>
  failure?.response?.data?.message || fallback

function KitchenWasteRates() {
  const [rows, setRows] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const savingRef = useRef(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    IngredientWasteRateService.getWasteRates()
      .then(response => {
        if (!active) return
        setRows(response)
        setDrafts({})
      })
      .catch(failure => {
        if (active)
          setError(errorMessage(failure, "Không tải được tỷ lệ hao hụt."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [retry])

  // Lọc theo tỷ lệ đã lưu để dòng không biến mất khi đang nhập.
  const filteredRows = useMemo(() => {
    const keyword = normalizeRequestSearch(filters.search)
    return rows.filter(row => {
      if (keyword && !normalizeRequestSearch(row.ingredientName).includes(keyword))
        return false
      if (filters.handlingType && row.handlingType !== filters.handlingType)
        return false
      if (filters.rate === "WITH") return Number(row.wasteRate) > 0
      if (filters.rate === "ZERO") return Number(row.wasteRate) === 0
      if (filters.rate === "UNSAVED") return row.id in drafts
      return true
    })
  }, [rows, filters, drafts])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  // Tính trên mọi trang, không chỉ các dòng đang hiện.
  const changes = useMemo(
    () =>
      rows
        .filter(row => isDirty(row, drafts))
        .map(row => ({ row, ...parsePercent(drafts[row.id]) })),
    [rows, drafts],
  )
  const invalidCount = changes.filter(change => change.error).length
  const pending = changes.filter(change => !change.error)

  const changeFilters = next => {
    setFilters(next)
    setPage(1)
  }

  const save = async () => {
    if (savingRef.current || invalidCount || !pending.length) return
    savingRef.current = true
    setSaving(true)
    const failed = []
    const updated = new Map()
    for (const change of pending) {
      try {
        const response = await IngredientWasteRateService.updateWasteRate(
          change.row.id,
          change.rate,
        )
        updated.set(change.row.id, response)
      } catch (failure) {
        failed.push(
          `${change.row.ingredientName}: ${errorMessage(failure, "không lưu được")}`,
        )
      }
    }
    setRows(current => current.map(row => updated.get(row.id) || row))
    setDrafts(current => {
      const next = { ...current }
      for (const id of updated.keys()) delete next[id]
      return next
    })
    if (failed.length) {
      notice({
        msg: `Còn ${failed.length} nguyên liệu chưa lưu được`,
        desc: shortList(failed),
        isSuccess: false,
      })
    } else {
      notice({ msg: `Đã lưu tỷ lệ hao hụt cho ${updated.size} nguyên liệu` })
      if (filters.rate === "UNSAVED") changeFilters(EMPTY_FILTERS)
    }
    savingRef.current = false
    setSaving(false)
  }

  return (
    <div className={styles["waste-rates-page"]}>
      <header>
        <h1 className={styles["waste-rates-page__title"]}>
          Tỷ lệ hao hụt nguyên liệu
        </h1>
        <p className={styles["waste-rates-page__intro"]}>
          Dùng để tính lượng nguyên liệu sống cần đặt và lấy từ kho. Không áp
          dụng cho gia vị dùng chung của bữa.
        </p>
      </header>

      {loading && <Skeleton variant="rounded" height={360} />}
      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => setRetry(value => value + 1)}
            >
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {!loading && !error && rows.length === 0 && (
        <Alert severity="info">
          Trường chưa có nguyên liệu nào trong danh mục.
        </Alert>
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <section className={styles["waste-rates-page__card"]}>
            <WasteRateFilters
              filters={filters}
              onChange={changeFilters}
              unsavedCount={changes.length}
            />
            <WasteRateTable
              rows={pageRows}
              drafts={drafts}
              saving={saving}
              onDraft={(id, value) =>
                setDrafts(current => ({ ...current, [id]: value }))
              }
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredRows.length}
              onPageChange={setPage}
              onPageSizeChange={size => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </section>

          {changes.length > 0 && (
            <div className={styles["waste-rates-page__footer"]}>
              <span
                className={`${styles["waste-rates-page__hint"]} ${
                  invalidCount ? styles["waste-rates-page__hint--error"] : ""
                }`}
                aria-live="polite"
              >
                {invalidCount
                  ? `${invalidCount} dòng nhập chưa đúng.`
                  : `${pending.length} nguyên liệu chưa lưu.`}
              </span>
              <div className={styles["waste-rates-page__actions"]}>
                {filters.rate !== "UNSAVED" && (
                  <Button
                    disabled={saving}
                    onClick={() =>
                      changeFilters({ ...EMPTY_FILTERS, rate: "UNSAVED" })
                    }
                  >
                    Xem lại
                  </Button>
                )}
                <Button
                  disabled={saving}
                  onClick={() => {
                    setDrafts({})
                    if (filters.rate === "UNSAVED") changeFilters(EMPTY_FILTERS)
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  disabled={saving || invalidCount > 0}
                  onClick={save}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default KitchenWasteRates
