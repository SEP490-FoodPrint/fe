import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Alert,
  Button,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import notice from "src/components/Notice"
import IngredientWasteRateService from "src/services/IngredientWasteRateService"
import styles from "./component/KitchenWasteRates.module.scss"

const errorMessage = (failure, fallback) =>
  failure?.response?.data?.message || fallback

const HANDLING_LABELS = { DIRECT_USE: "Đồ tươi", DRY_STOCK: "Đồ lưu kho" }

/** "0.2000" → "20"; "0.1250" → "12.5" */
const rateToPercent = rate => {
  const value = Math.round(Number(rate || 0) * 10000) / 100
  return Number.isFinite(value) ? String(value) : "0"
}

/** Kiểm tra % nhập vào: 0 <= p < 100, tối đa 2 chữ số thập phân. Trả về tỷ lệ thập phân hoặc lỗi. */
const parsePercent = text => {
  const normalized = String(text ?? "")
    .trim()
    .replace(",", ".")
  if (normalized === "") return { error: "Nhập tỷ lệ, để 0 nếu không hao hụt" }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized))
    return { error: "Chỉ nhận số, tối đa 2 chữ số thập phân" }
  const percent = Number(normalized)
  if (percent >= 100) return { error: "Tỷ lệ phải nhỏ hơn 100%" }
  return { rate: Math.round(percent * 100) / 10000 }
}

/** Lượng sống cần cho 1 đơn vị thành phẩm: 1 / (1 − r). */
const rawPerCooked = rate => (rate > 0 ? 1 / (1 - rate) : 1)

const formatNumber = value =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(value)

function KitchenWasteRates() {
  const [rows, setRows] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState("")
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
          setError(errorMessage(failure, "Không thể tải tỷ lệ hao hụt."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [retry])

  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return rows
    return rows.filter(row =>
      row.ingredientName.toLowerCase().includes(keyword),
    )
  }, [rows, search])

  const changes = useMemo(
    () =>
      rows.flatMap(row => {
        if (!(row.id in drafts)) return []
        const parsed = parsePercent(drafts[row.id])
        if (parsed.error) return [{ row, error: parsed.error }]
        if (Math.abs(parsed.rate - Number(row.wasteRate)) < 1e-9) return []
        return [{ row, rate: parsed.rate }]
      }),
    [rows, drafts],
  )
  const invalid = changes.some(change => change.error)
  const pending = changes.filter(change => !change.error)

  const save = async () => {
    if (savingRef.current || invalid || !pending.length) return
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
        msg: "Một số tỷ lệ chưa lưu được",
        desc: failed.join("; "),
        isSuccess: false,
      })
    } else {
      notice({ msg: `Đã lưu tỷ lệ hao hụt cho ${updated.size} nguyên liệu` })
    }
    savingRef.current = false
    setSaving(false)
  }

  return (
    <div className={styles["waste-rates-page"]}>
      <header>
        <nav
          className={styles["waste-rates-page__breadcrumb"]}
          aria-label="Đường dẫn trang"
        >
          <span>Nhà bếp</span>
          <span>/</span>
          <span>Cấu hình</span>
          <span>/</span>
          <strong>Tỷ lệ hao hụt</strong>
        </nav>
        <h1 className={styles["waste-rates-page__title"]}>
          Tỷ lệ hao hụt nguyên liệu
        </h1>
        <p className={styles["waste-rates-page__intro"]}>
          Định lượng trong thực đơn là lượng thành phẩm. Hệ thống dùng tỷ lệ hao
          hụt để tính lượng nguyên liệu sống cần đặt hàng và lấy từ kho khi nấu.
          Gia vị dùng chung của bữa không áp dụng tỷ lệ này.
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
      {!loading && !error && (
        <>
          <TextField
            className={styles["waste-rates-page__search"]}
            size="small"
            placeholder="Tìm nguyên liệu"
            value={search}
            onChange={event => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { "aria-label": "Tìm nguyên liệu" },
            }}
          />

          {rows.length === 0 ? (
            <Alert severity="info">
              Trường chưa có nguyên liệu nào trong danh mục.
            </Alert>
          ) : (
            <TableContainer className={styles["waste-rates-page__table"]}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nguyên liệu</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell
                      className={styles["waste-rates-page__rate-cell"]}
                    >
                      Hao hụt (%)
                    </TableCell>
                    <TableCell>Lượng sống cho 1 đơn vị thành phẩm</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map(row => {
                    const value =
                      row.id in drafts
                        ? drafts[row.id]
                        : rateToPercent(row.wasteRate)
                    const parsed = parsePercent(value)
                    const rate = parsed.error
                      ? Number(row.wasteRate)
                      : parsed.rate
                    const dirty =
                      row.id in drafts &&
                      !parsed.error &&
                      Math.abs(parsed.rate - Number(row.wasteRate)) >= 1e-9
                    return (
                      <TableRow
                        key={row.id}
                        className={dirty ? styles.dirty : undefined}
                      >
                        <TableCell>
                          <span className={styles["waste-rates-page__name"]}>
                            {row.ingredientName}
                          </span>
                        </TableCell>
                        <TableCell>
                          {HANDLING_LABELS[row.handlingType] ||
                            row.handlingType}
                        </TableCell>
                        <TableCell
                          className={styles["waste-rates-page__rate-cell"]}
                        >
                          <TextField
                            size="small"
                            value={value}
                            disabled={saving}
                            error={Boolean(parsed.error)}
                            helperText={parsed.error || " "}
                            onChange={event =>
                              setDrafts(current => ({
                                ...current,
                                [row.id]: event.target.value,
                              }))
                            }
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    %
                                  </InputAdornment>
                                ),
                              },
                              htmlInput: {
                                inputMode: "decimal",
                                "aria-label": `Tỷ lệ hao hụt của ${row.ingredientName}`,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell
                          className={styles["waste-rates-page__example"]}
                        >
                          {formatNumber(rawPerCooked(rate))} {row.unit}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {visibleRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className={styles["waste-rates-page__empty"]}
                      >
                        Không có nguyên liệu khớp từ khóa.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <div className={styles["waste-rates-page__footer"]}>
            <span
              className={styles["waste-rates-page__hint"]}
              aria-live="polite"
            >
              {pending.length
                ? `${pending.length} nguyên liệu có thay đổi chưa lưu.`
                : "Tỷ lệ mới áp dụng cho các lần đặt hàng, lập mẻ và phân bổ tiếp theo."}
            </span>
            <div className={styles["waste-rates-page__actions"]}>
              <Button
                disabled={saving || !Object.keys(drafts).length}
                onClick={() => setDrafts({})}
              >
                Hủy thay đổi
              </Button>
              <Button
                variant="contained"
                disabled={saving || invalid || !pending.length}
                onClick={save}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default KitchenWasteRates
