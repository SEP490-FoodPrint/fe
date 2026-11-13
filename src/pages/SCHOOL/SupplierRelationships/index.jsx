import React, { useContext, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material"
import { Search } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { StoreContext } from "src/contexts"
import SupplierRelationshipService from "src/services/SupplierRelationshipService"
import RelationshipList from "./component/RelationshipList"
import SupplierList from "./component/SupplierList"
import SupplierWorkspace from "./component/SupplierWorkspace"
import WorkspaceHeader from "./component/WorkspaceHeader"
import "./style.scss"

const emptyPage = { page: 1, limit: 10, total: 0 }

function SupplierRelationships() {
  const { userStore } = useContext(StoreContext)
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState([])
  // Tab mà `rows` đang thuộc về: hai tab có dạng dữ liệu khác nhau
  const [rowsView, setRowsView] = useState(null)
  const [pagination, setPagination] = useState(emptyPage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([])
  const displayCategories = useMemo(() => {
    const list = categories.map((c) => (c === "Thịt" ? "Thịt tươi" : c))
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, "vi"))
  }, [categories])
  const [workspace, setWorkspace] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [search, setSearch] = useState(params.get("q") || "")
  const activeView =
    params.get("view") === "relationships" ? "relationships" : "suppliers"
  const q = params.get("q") || ""
  const status = params.get("status") || ""
  const category = params.get("category") || ""
  const page = Math.max(1, Number(params.get("page")) || 1)
  const canManage =
    userStore?.user?.permissions?.includes("supplier_relationship.manage") &&
    ["SCHOOL_MANAGEMENT_BOARD", "SCHOOL_ADMIN"].includes(userStore?.user?.role)

  const update = (updates) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      Object.entries({ page: null, ...updates }).forEach(([key, value]) =>
        value ? next.set(key, String(value)) : next.delete(key),
      )
      return next
    })

  useEffect(() => {
    setSearch(q)
  }, [q])
  useEffect(() => {
    if (search === q) return undefined
    const timer = setTimeout(() => update({ q: search.trim() || null }), 350)
    return () => clearTimeout(timer)
  }, [search, q])

  useEffect(() => {
    let active = true
    SupplierRelationshipService.getFilters()
      .then((filters) => {
        if (active) setCategories(filters.data.categories)
      })
      .catch((failure) => {
        if (active)
          setError(
            failure?.response?.data?.message ||
              "Không thể tải bộ lọc nhà cung cấp.",
          )
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    const query = {
      page,
      limit: 10,
      ...(q ? { q } : {}),
      ...(activeView === "relationships" && status ? { status } : {}),
      ...(activeView === "suppliers" ? { status: "ACTIVE" } : {}),
      ...(activeView === "suppliers" && category ? { category } : {}),
    }
    const request =
      activeView === "suppliers"
        ? SupplierRelationshipService.listSuppliers
        : SupplierRelationshipService.listPartners
    request(query, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          const items =
            activeView === "suppliers"
              ? response.data.items.filter((item) => item.status === "ACTIVE")
              : response.data.items
          setRows(items)
          setRowsView(activeView)
          setPagination(response.data.pagination)
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setRows([])
          setRowsView(activeView)
          setPagination(emptyPage)
          setError(
            failure?.response?.data?.message || "Không thể tải nhà cung cấp.",
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [
    activeView,
    page,
    q,
    status,
    category,
    refresh,
  ])

  // Vừa đổi tab thì `rows` còn là dữ liệu tab cũ cho tới khi request mới trả về
  const listLoading = loading || rowsView !== activeView
  const onOpen = (id, intent) => setWorkspace({ id, intent })
  return (
    <div className="supplier-relationships-page">
      <WorkspaceHeader
        activeView={activeView}
        onChangeView={(view) =>
          update({ view: view === "relationships" ? view : null, status: null })
        }
      />
      {error && <Alert severity="error">{error}</Alert>}
      <section className="supplier-filters" aria-label="Bộ lọc nhà cung cấp">
        <TextField
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên hoặc mã số thuế"
          label="Tìm nhà cung cấp"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        {activeView === "suppliers" && (
          <TextField
            select
            size="small"
            label="Nhóm nguyên liệu"
            value={category}
            onChange={(event) => update({ category: event.target.value })}
          >
            <MenuItem value="">Tất cả nhóm hàng</MenuItem>
            {displayCategories.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        )}
        {activeView === "relationships" && (
          <TextField
            select
            size="small"
            label="Trạng thái liên kết"
            value={status}
            onChange={(event) => update({ status: event.target.value })}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            <MenuItem value="ACTIVE">Đang liên kết</MenuItem>
            <MenuItem value="SUSPENDED">Tạm dừng</MenuItem>
            <MenuItem value="UNLINKED">Đã ngừng liên kết</MenuItem>
          </TextField>
        )}
        <Button
          className="supplier-clear-filters"
          onClick={() => {
            setSearch("")
            setParams(
              activeView === "relationships" ? { view: "relationships" } : {},
            )
          }}
        >
          Xóa bộ lọc
        </Button>
      </section>
      {activeView === "suppliers" ? (
        <SupplierList
          suppliers={rows}
          loading={listLoading}
          pagination={pagination}
          onPageChange={(value) => update({ page: value })}
          onOpen={onOpen}
          canManage={canManage}
        />
      ) : (
        <RelationshipList
          relationships={rows}
          loading={listLoading}
          pagination={pagination}
          onPageChange={(value) => update({ page: value })}
          onOpen={onOpen}
        />
      )}
      {workspace && (
        <SupplierWorkspace
          supplierId={workspace.id}
          intent={workspace.intent}
          onClose={() => setWorkspace(null)}
          onChanged={() => setRefresh((value) => value + 1)}
        />
      )}
    </div>
  )
}

export default SupplierRelationships
