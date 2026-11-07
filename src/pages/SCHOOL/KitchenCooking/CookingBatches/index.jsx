import React, { useState, useContext, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, Button } from "@mui/material"
import { Plus, FileDown, Clock } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import STORAGE, { getStorage } from "src/lib/storage"
import { StoreContext } from "src/contexts"
import KitchenService from "src/services/KitchenService"
import {
  EMPTY_BATCH_FILTERS,
  COOKING_MODES,
  adaptCookingBatch,
  batchCSV,
  localDateISO,
  schoolClock,
} from "src/services/KitchenService/adapter"
import CookingBatchesKPI from "./component/CookingBatchesKPI"
import CookingBatchesFilter from "./component/CookingBatchesFilter"
import CookingBatchesTable from "./component/CookingBatchesTable"
import styles from "./index.module.scss"

export default function CookingBatches() {
  const navigate = useNavigate()
  const { userStore } = useContext(StoreContext) || {}
  const user = userStore?.user || getStorage(STORAGE.USER_INFO) || {}
  const schoolId = user.schoolId || user.orgId
  const [filters, setFilters] = useState({ ...EMPTY_BATCH_FILTERS })
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [paging, setPaging] = useState({ page: 1, limit: 10 })
  const [refresh, setRefresh] = useState(0)
  const [schoolAttempt, setSchoolAttempt] = useState(0)
  const [school, setSchool] = useState(null)
  const [schoolError, setSchoolError] = useState("")
  const [listState, setListState] = useState({
    key: "",
    loading: true,
    items: [],
    error: "",
  })
  const [statsState, setStatsState] = useState({
    key: "",
    loading: true,
    value: null,
    error: "",
  })
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState("")
  const scope = `${user.id || ""}:${schoolId || ""}`
  const statsKey = JSON.stringify({
    scope,
    query: { ...filters, search: debouncedSearch },
  })
  const queryKey = JSON.stringify({
    scope,
    query: { ...filters, search: debouncedSearch, ...paging },
  })
  const searchPending = debouncedSearch !== filters.search.trim()

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search.trim()),
      300,
    )
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setSchool(null)
    setSchoolError("")
    if (!schoolId) {
      setSchoolError("Tài khoản chưa có trường để tải cấu hình chế biến.")
      return () => {
        active = false
        controller.abort()
      }
    }
    KitchenService.getSchool(schoolId, { signal: controller.signal })
      .then((value) => {
        if (active) setSchool(value)
      })
      .catch((error) => {
        if (active) setSchoolError(error.message)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [schoolId, schoolAttempt])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const query = JSON.parse(queryKey).query
    setListState({ key: queryKey, loading: true, items: [], error: "" })
    KitchenService.getBatches(query, { signal: controller.signal })
      .then((result) => {
        if (!active) return
        if (query.page > result.pagination.totalPages) {
          setPaging((current) => ({
            ...current,
            page: result.pagination.totalPages,
          }))
          return
        }
        setListState({
          key: queryKey,
          loading: false,
          items: result.items,
          pagination: result.pagination,
          error: "",
        })
      })
      .catch((error) => {
        if (active)
          setListState({
            key: queryKey,
            loading: false,
            items: [],
            error: error.message,
          })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [queryKey, refresh, schoolId])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setStatsState({ key: statsKey, loading: true, value: null, error: "" })
    KitchenService.getStats(JSON.parse(statsKey).query, {
      signal: controller.signal,
    })
      .then((value) => {
        if (active)
          setStatsState({ key: statsKey, loading: false, value, error: "" })
      })
      .catch((error) => {
        if (active)
          setStatsState({
            key: statsKey,
            loading: false,
            value: null,
            error: error.message,
          })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [statsKey, refresh, schoolId])

  const loading =
    listState.key !== queryKey || listState.loading || searchPending
  const statsLoading =
    statsState.key !== statsKey || statsState.loading || searchPending
  const stats = statsState.key === statsKey ? statsState.value : null
  const rows = useMemo(
    () =>
      listState.key === queryKey ? listState.items.map(adaptCookingBatch) : [],
    [listState, queryKey],
  )
  const pagination =
    listState.key === queryKey && listState.pagination
      ? listState.pagination
      : { ...paging, totalItems: 0, totalPages: 1 }
  const listError = listState.key === queryKey ? listState.error : ""
  const canCreate = Boolean(COOKING_MODES[school?.cookingMode])
  const isSeparateMode = school?.cookingMode === "SEPARATE_BY_LOT"
  const mealTimes = [
    schoolClock(school?.lunchTime) && `Trưa ${schoolClock(school.lunchTime)}`,
    schoolClock(school?.afternoonMealTime) &&
      `Xế ${schoolClock(school.afternoonMealTime)}`,
  ]
    .filter(Boolean)
    .join(" · ")

  const changeFilters = (value) => {
    setFilters(value)
    setPaging((current) => ({ ...current, page: 1 }))
  }
  const reload = () => setRefresh((value) => value + 1)
  const navigateCreate = () => {
    if (canCreate)
      navigate(
        isSeparateMode
          ? ROUTER.SCHOOL_KITCHEN_BATCH_CREATE_SEPARATE
          : ROUTER.SCHOOL_KITCHEN_BATCH_CREATE,
      )
  }
  const exportReport = async () => {
    setExporting(true)
    setExportError("")
    try {
      const items = await KitchenService.getAllBatches(
        JSON.parse(statsKey).query,
      )
      const url = URL.createObjectURL(
        new Blob([batchCSV(items.map(adaptCookingBatch))], {
          type: "text/csv;charset=utf-8;",
        }),
      )
      const link = document.createElement("a")
      link.href = url
      link.download = `lo-che-bien-${filters.date || localDateISO()}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setExportError(error.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={styles.batchesContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Quản lý lô chế biến</h1>
          <div className={styles.shiftBadge}>
            <Clock size={14} aria-hidden="true" />
            <span>
              {school
                ? `${school.name}${mealTimes ? ` · ${mealTimes}` : ""}`
                : schoolError
                  ? "Chưa tải được cấu hình trường"
                  : "Đang tải cấu hình trường…"}
            </span>
          </div>
        </div>
        <div className={styles.actionBtns}>
          <Button
            variant="outlined"
            className={styles.exportBtn}
            onClick={exportReport}
            disabled={
              exporting ||
              loading ||
              !pagination.totalItems ||
              Boolean(listError)
            }
            startIcon={<FileDown size={16} />}
          >
            {exporting ? "Đang xuất…" : "Xuất báo cáo"}
          </Button>
          <Button
            variant="contained"
            className={styles.createBtn}
            onClick={navigateCreate}
            disabled={!canCreate}
            title={
              COOKING_MODES[school?.cookingMode] || "Chưa có cấu hình chế biến"
            }
            startIcon={<Plus size={18} />}
          >
            {isSeparateMode ? "Tạo lô nấu riêng" : "Tạo lô chế biến"}
          </Button>
        </div>
      </div>
      {schoolError && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              onClick={() => setSchoolAttempt((value) => value + 1)}
            >
              Tải lại
            </Button>
          }
        >
          {schoolError}
        </Alert>
      )}
      {school && !canCreate && (
        <Alert severity="info">
          Trường chưa có cấu hình phương thức chế biến hợp lệ để tạo lô mới.
        </Alert>
      )}
      {exportError && (
        <Alert severity="error" onClose={() => setExportError("")}>
          {exportError}
        </Alert>
      )}
      <CookingBatchesKPI stats={stats} loading={statsLoading} />
      {statsState.key === statsKey && statsState.error && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" onClick={reload}>
              Tải lại
            </Button>
          }
        >
          Chưa tải được thống kê: {statsState.error}
        </Alert>
      )}
      <CookingBatchesFilter
        filters={filters}
        onChange={changeFilters}
        onRefresh={reload}
      />
      <CookingBatchesTable
        rows={rows}
        pagination={pagination}
        loading={loading}
        error={listError}
        onRetry={reload}
        onPageChange={(page) => setPaging((current) => ({ ...current, page }))}
        onPageSizeChange={(limit) => setPaging({ page: 1, limit })}
      />
      <div className={styles.mobileStickyBar}>
        <Button
          variant="contained"
          className={styles.mobileCreateBtn}
          onClick={navigateCreate}
          disabled={!canCreate}
          startIcon={<Plus size={19} />}
        >
          {isSeparateMode ? "Tạo lô nấu riêng" : "Tạo lô chế biến"}
        </Button>
      </div>
    </div>
  )
}
