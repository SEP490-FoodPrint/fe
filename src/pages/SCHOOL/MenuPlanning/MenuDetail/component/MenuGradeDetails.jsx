import InlineError from "src/components/InlineError"
import React, { useEffect, useState } from "react"
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { ArrowLeftRight, RefreshCw } from "lucide-react"
import MenuService from "src/services/MenuService"
import {
  loadGradeMenuDetails,
  gradeComparisonRows,
} from "src/services/MenuService/gradeDetail"
import styles from "./MenuGradeDetails.module.scss"

export function MenuGradeComparisonTable({ scopes, allergyResults = {} }) {
  const rows = gradeComparisonRows(scopes)
  return (
    <TableContainer className={styles.tableWrap}>
      <Table
        className={styles.table}
        aria-label="So sánh định lượng giữa các khối"
      >
        <TableHead>
          <TableRow>
            <TableCell>Món / Nguyên liệu</TableCell>
            <TableCell>Đơn vị</TableCell>
            {scopes.map((scope) => (
              <TableCell key={scope.key}>
                {scope.label}
                <small>{scope.menu?.statusLabel || scope.error}</small>
                <small>{scope.portionLabel}</small>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((section) => (
            <React.Fragment key={section.id}>
              <TableRow className={styles.dishRow}>
                <TableCell component="th" colSpan={scopes.length + 2}>
                  {section.name}
                </TableCell>
              </TableRow>
              {section.rows.length ? (
                section.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.unit || "—"}</TableCell>
                    {scopes.map((scope) => (
                      <TableCell key={scope.key}>
                        {row.values[scope.key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={scopes.length + 2}>
                    Chưa có định lượng đã lưu cho món này.
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {!rows.length && (
            <TableRow>
              <TableCell colSpan={scopes.length + 2}>
                Chưa có định lượng để so sánh.
              </TableCell>
            </TableRow>
          )}
          <TableRow className={styles.allergyRow}>
            <TableCell component="th" scope="row" colSpan={2}>
              Đối soát dị ứng theo khối
            </TableCell>
            {scopes.map((scope) => {
              const result = allergyResults[scope.key]
              return (
                <TableCell key={scope.key}>
                  {!scope.menu ? (
                    <span className={styles.warning}>{scope.error}</span>
                  ) : !result ? (
                    "Đang kiểm tra…"
                  ) : result.error ? (
                    <span className={styles.warning}>{result.error}</span>
                  ) : result.conflicts?.length ? (
                    result.conflicts.map((conflict) => (
                      <p className={styles.warning} key={conflict.ingredientId}>
                        {conflict.ingredientName}:{" "}
                        {(conflict.affectedClasses || [])
                          .map((item) => `${item.className} (${item.count})`)
                          .join(", ")}
                      </p>
                    ))
                  ) : (
                    "Chưa phát hiện xung đột với hồ sơ dị ứng đã lưu."
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default function MenuGradeDetails({
  weeklyMenu,
  menu,
  selectedScope,
  onScopeChange,
  onNavigate,
  onModeChange,
}) {
  const requestKey = `${weeklyMenu.id}:${menu.menuDayId}:${menu.mealType}`
  const [data, setData] = useState({
    key: "",
    scopes: [],
    loading: true,
    error: "",
  })
  const [retry, setRetry] = useState(0)
  const [compare, setCompare] = useState(false)
  const [allergies, setAllergies] = useState({ key: "", results: {} })
  const current =
    data.key === requestKey ? data : { scopes: [], loading: true, error: "" }
  const selected =
    current.scopes.find(
      (scope) =>
        scope.key === selectedScope?.key &&
        scope.candidate.id === weeklyMenu.id,
    ) || current.scopes.find((scope) => scope.candidate.id === weeklyMenu.id)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setCompare(false)
    onModeChange(false)
    setData({ key: requestKey, scopes: [], loading: true, error: "" })
    loadGradeMenuDetails(weeklyMenu, menu.menuDayId, menu.mealType, {
      signal: controller.signal,
    })
      .then((scopes) => {
        if (!active) return
        setData({ key: requestKey, scopes, loading: false, error: "" })
        onScopeChange(
          (previous) =>
            scopes.find(
              (scope) =>
                scope.key === previous?.key &&
                scope.candidate.id === weeklyMenu.id,
            ) || scopes.find((scope) => scope.candidate.id === weeklyMenu.id),
        )
      })
      .catch((error) => {
        if (active)
          setData({
            key: requestKey,
            scopes: [],
            loading: false,
            error: error.message,
          })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [weeklyMenu, requestKey, retry, onModeChange, onScopeChange])

  useEffect(() => {
    if (!compare || current.loading || current.error) return undefined
    let active = true
    setAllergies({ key: "", results: {} })
    Promise.all(
      current.scopes.map(async (scope) => {
        if (!scope.menu) return [scope.key, { error: scope.error }]
        if (!scope.ingredientIds?.length)
          return [
            scope.key,
            { error: "Chưa đủ dữ liệu nguyên liệu để kiểm tra dị ứng." },
          ]
        try {
          const batches = []
          for (let index = 0; index < scope.ingredientIds.length; index += 100)
            batches.push(scope.ingredientIds.slice(index, index + 100))
          const checks = await Promise.all(
            batches.map((ids) =>
              MenuService.checkAllergies(ids, scope.gradeIds),
            ),
          )
          return [
            scope.key,
            { conflicts: checks.flatMap((check) => check.data.conflicts) },
          ]
        } catch {
          return [
            scope.key,
            {
              error: "Chưa kiểm tra được dị ứng. Chọn khối để xem và thử lại.",
            },
          ]
        }
      }),
    ).then((results) => {
      if (active)
        setAllergies({ key: requestKey, results: Object.fromEntries(results) })
    })
    return () => {
      active = false
    }
  }, [compare, data, requestKey])

  const retryButton = (
    <Button
      size="small"
      variant="outlined"
      startIcon={<RefreshCw size={14} />}
      onClick={() => setRetry((value) => value + 1)}
    >
      Thử lại
    </Button>
  )
  return (
    <section
      className={styles.section}
      aria-label="Định lượng thực đơn theo khối"
    >
      <div className={styles.toolbar}>
        <div className={styles.leftGroup}>
          <div className={styles.filter}>
            <span id="menu-grade-label" className={styles.filterLabel}>Khối áp dụng</span>
            <FormControl className={styles.gradeSelect} size="small">
              <Select
                labelId="menu-grade-label"
                id="menu-grade-select"
                value={selected?.key || ""}
                displayEmpty
                disabled={current.loading || !current.scopes.length}
                onChange={(event) => {
                  const scope = current.scopes.find(
                    (item) => item.key === event.target.value,
                  )
                  if (!scope?.menu) return
                  onScopeChange(scope)
                  if (scope.candidate.id !== weeklyMenu.id) onNavigate(scope)
                }}
              >
                {!current.scopes.length && (
                  <MenuItem value="">
                    {current.loading ? "Đang tải khối…" : "Chưa tải được khối"}
                  </MenuItem>
                )}
                {current.scopes.map((scope) => (
                  <MenuItem
                    key={scope.key}
                    value={scope.key}
                    disabled={!scope.menu}
                  >
                    {scope.label}
                    {scope.loadFailed
                      ? " — tải không thành công"
                      : !scope.menu
                        ? " — chưa có bữa ăn"
                        : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {selected && (
            <span className={styles.portions}>
              {selected.portionLabel || selected.error}
            </span>
          )}
        </div>
        <Button
          className={styles.compareButton}
          variant="outlined"
          size="small"
          aria-pressed={compare}
          disabled={current.loading || current.scopes.length < 2}
          startIcon={<ArrowLeftRight size={14} />}
          onClick={() => {
            setCompare(!compare)
            onModeChange(!compare)
          }}
        >
          {compare ? "Xem từng khối" : "So sánh định lượng"}
        </Button>
      </div>
      <InlineError
        messages={[
          current.error,
          current.scopes.some((scope) => scope.loadFailed) ? "Chưa tải được thực đơn của một số khối." : "",
        ]}
      />
      {(current.error || current.scopes.some((scope) => scope.loadFailed)) && retryButton}

      {compare && (
        <>
          <p className={styles.hint}>
            Định lượng cho một suất từ từng thực đơn đã lưu. Dấu “—” là không có
            món hoặc nguyên liệu ở khối đó.
          </p>
          <MenuGradeComparisonTable
            scopes={current.scopes}
            allergyResults={
              allergies.key === requestKey ? allergies.results : {}
            }
          />
        </>
      )}
    </section>
  )
}
