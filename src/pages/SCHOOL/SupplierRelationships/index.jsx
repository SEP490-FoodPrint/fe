import React, { useContext, useEffect, useState } from "react"
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
  const [pagination, setPagination] = useState(emptyPage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [categories, setCategories] = useState([])
  const [workspace, setWorkspace] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [search, setSearch] = useState(params.get("q") || "")
  const activeView =
    params.get("view") === "relationships" ? "relationships" : "suppliers"
  const provinceId = params.get("provinceId") || ""
  const wardId = params.get("wardId") || ""
  const q = params.get("q") || ""
  const status = params.get("status") || ""
  const category = params.get("category") || ""
  const locationMode = params.get("locationMode") || "REGISTERED"
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
    Promise.all([
      SupplierRelationshipService.getLocations(),
      SupplierRelationshipService.getFilters(),
    ])
      .then(([locations, filters]) => {
        if (active) {
          setProvinces(locations.data)
          setCategories(filters.data.categories)
        }
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
    setWards([])
    if (provinceId)
      SupplierRelationshipService.getLocations(provinceId, controller.signal)
        .then((response) => setWards(response.data))
        .catch((failure) => {
          if (!controller.signal.aborted)
            setError(
              failure?.response?.data?.message ||
                "Không thể tải danh mục xã/phường.",
            )
        })
    return () => controller.abort()
  }, [provinceId])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    const query = {
      page,
      limit: 10,
      ...(q ? { q } : {}),
      ...(status ? { status } : {}),
      ...(activeView === "suppliers"
        ? {
            ...(provinceId ? { provinceId } : {}),
            ...(wardId ? { wardId } : {}),
            ...(category ? { category } : {}),
            locationMode,
          }
        : {}),
    }
    const request =
      activeView === "suppliers"
        ? SupplierRelationshipService.listSuppliers
        : SupplierRelationshipService.listPartners
    request(query, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setRows(response.data.items)
          setPagination(response.data.pagination)
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setRows([])
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
    provinceId,
    wardId,
    category,
    locationMode,
    refresh,
  ])

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
          <>
            <TextField
              select
              size="small"
              label="Lọc theo địa bàn"
              value={locationMode}
              onChange={(event) => update({ locationMode: event.target.value })}
            >
              <MenuItem value="REGISTERED">Địa chỉ trụ sở</MenuItem>
              <MenuItem value="SERVICE">Khu vực giao hàng</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Tỉnh/thành phố"
              value={
                provinces.some((item) => item.id === provinceId)
                  ? provinceId
                  : ""
              }
              onChange={(event) =>
                update({ provinceId: event.target.value, wardId: null })
              }
            >
              <MenuItem value="">Tất cả tỉnh/thành</MenuItem>
              {provinces.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Xã/phường"
              disabled={!provinceId}
              value={wards.some((item) => item.id === wardId) ? wardId : ""}
              onChange={(event) => update({ wardId: event.target.value })}
            >
              <MenuItem value="">Tất cả xã/phường</MenuItem>
              {wards.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Nhóm nguyên liệu"
              value={category}
              onChange={(event) => update({ category: event.target.value })}
            >
              <MenuItem value="">Tất cả nhóm hàng</MenuItem>
              {categories.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
        <TextField
          select
          size="small"
          label={
            activeView === "suppliers"
              ? "Trạng thái NCC"
              : "Trạng thái liên kết"
          }
          value={status}
          onChange={(event) => update({ status: event.target.value })}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value="ACTIVE">
            {activeView === "suppliers" ? "Đang hoạt động" : "Đang liên kết"}
          </MenuItem>
          {activeView === "suppliers" ? (
            <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
          ) : (
            [
              <MenuItem key="SUSPENDED" value="SUSPENDED">
                Tạm dừng
              </MenuItem>,
              <MenuItem key="UNLINKED" value="UNLINKED">
                Đã ngừng liên kết
              </MenuItem>,
            ]
          )}
        </TextField>
        <Button
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
          loading={loading}
          pagination={pagination}
          onPageChange={(value) => update({ page: value })}
          onOpen={onOpen}
          canManage={canManage}
        />
      ) : (
        <RelationshipList
          relationships={rows}
          loading={loading}
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
