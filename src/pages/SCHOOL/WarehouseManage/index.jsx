import React, { useState, useMemo, useEffect, useCallback, useContext } from "react"
import { useSearchParams } from "react-router-dom"
import { StoreContext } from "src/contexts"
import STORAGE, { getStorage } from "src/lib/storage"
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Typography,
} from "@mui/material"
import {
  Package,
  ClipboardList,
  Search,
  RotateCcw,
  Plus,
} from "lucide-react"
import notice from "src/components/Notice"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import WarehouseService from "src/services/WarehouseService"
import TrackingService from "src/services/TrackingService"

import WarehouseHeader from "./component/WarehouseHeader"
import WarehouseStatsRail from "./component/WarehouseStatsRail"
import WarehouseFilterStrip from "./component/WarehouseFilterStrip"
import WarehouseTable from "./component/WarehouseTable"
import WarehousePagination from "./component/WarehousePagination"
import CreateDryOrderView from "./component/CreateDryOrderView"
import WarehouseDetailView from "./component/WarehouseDetailView"

// Reusable Order Tracking components for Dry Stock Orders tab
import TrackingTable from "./component/TrackingTable"
import TrackingDetailView from "./component/TrackingDetailView"

import styles from "./index.module.scss"

const PAGE_SIZE = 10

export default function WarehouseManage() {
  const { userStore } = useContext(StoreContext)
  const currentUser = userStore?.user || getStorage(STORAGE.USER_INFO)
  const currentSchoolId = currentUser?.schoolId || currentUser?.school_id || currentUser?.orgId || ""
  const currentSchoolName = currentUser?.schoolName || currentUser?.orgName || ""

  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get("tab") === "orders" ? "orders" : "inventory"

  // Tab chính: "inventory" (Danh sách nguyên liệu khô) | "orders" (Đơn hàng)
  const [activeTab, setActiveTab] = useState(initialTab)

  // Dữ liệu kho nguyên liệu khô
  const [inventory, setInventory] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  // Dữ liệu đơn hàng đồ khô
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Sub-view: "list" (mặc định) | "create" (tạo đơn) | "detail" (chi tiết NL kho) | "orderDetail" (chi tiết đơn hàng)
  const [subView, setSubView] = useState("list")
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedItemForOrder, setSelectedItemForOrder] = useState(null)

  // Filter state cho Tab 1 (Kho nguyên liệu khô)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
  })

  // Filter state cho Tab 2 (Đơn hàng đồ khô)
  const [orderFilters, setOrderFilters] = useState({
    search: "",
    status: "all",
  })

  // Pagination state cho Tab 1
  const [page, setPage] = useState(1)

  // Tải dữ liệu tồn kho thực tế từ Backend Database
  const loadInventory = useCallback(async () => {
    setLoading(true)
    try {
      const data = await WarehouseService.getWarehouseInventory()
      setInventory(data.items || [])
      setSuppliers(data.suppliers || [])
    } catch (err) {
      console.warn("Lỗi tải dữ liệu tồn kho:", err)
      setInventory([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Tải dữ liệu đơn hàng đồ khô
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const data = await TrackingService.getTrackingOrders()
      // Chỉ lấy các đơn đồ khô & gia vị
      const dryList = (data || []).filter(
        item => item.orderType === "DRY_STOCK" || item.batchType === "DRY_STOCK"
      )
      setOrders(dryList)
    } catch (err) {
      console.warn("Lỗi tải danh sách đơn hàng đồ khô:", err)
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInventory()
    loadOrders()
  }, [loadInventory, loadOrders, currentSchoolId, currentSchoolName])

  // Đồng bộ tab từ URL search params nếu có thay đổi
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl === "orders" && activeTab !== "orders") {
      setActiveTab("orders")
    } else if (tabFromUrl !== "orders" && activeTab === "orders" && !tabFromUrl) {
      // noop
    }
  }, [searchParams, activeTab])

  // Thống kê nhanh cho StatsRail (Tổng, Báo động < 30%, Cần nhập 30% - 50%, Đủ an toàn >= 50%)
  const stats = useMemo(() => {
    const total = inventory.length
    const criticalLowCount = inventory.filter(
      it => it.safetyStock > 0 && it.currentStock / it.safetyStock < 0.3
    ).length
    const warningCount = inventory.filter(
      it =>
        it.safetyStock > 0 &&
        it.currentStock / it.safetyStock >= 0.3 &&
        it.currentStock / it.safetyStock < 0.5
    ).length
    const safeStockCount = inventory.filter(
      it => it.safetyStock > 0 && it.currentStock / it.safetyStock >= 0.5
    ).length

    return {
      total,
      criticalLowCount,
      warningCount,
      safeStockCount,
    }
  }, [inventory])

  // Danh mục nhóm hàng độc nhất
  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map(it => it.category).filter(Boolean)))
  }, [inventory])

  // Xác định active rail filter
  const activeRailFilter = useMemo(() => {
    if (filters.status === "CRITICAL_LOW") return "CRITICAL_LOW"
    if (filters.status === "WARNING") return "WARNING"
    if (filters.status === "SAFE") return "SAFE"
    return "all"
  }, [filters.status])

  // Lọc dữ liệu tồn kho gạo & gia vị (Tab 1)
  const filteredInventory = useMemo(() => {
    return inventory.filter(it => {
      const kw = filters.search.trim().toLowerCase()
      const matchSearch =
        !kw ||
        it.name.toLowerCase().includes(kw) ||
        it.code.toLowerCase().includes(kw) ||
        it.supplierName.toLowerCase().includes(kw)

      const matchCategory =
        filters.category === "all" || it.category === filters.category

      const ratio = it.safetyStock > 0 ? it.currentStock / it.safetyStock : 1

      let matchStatus = true
      if (filters.status === "CRITICAL_LOW") {
        matchStatus = ratio < 0.3
      } else if (filters.status === "WARNING") {
        matchStatus = ratio >= 0.3 && ratio < 0.5
      } else if (filters.status === "SAFE") {
        matchStatus = ratio >= 0.5
      }

      return matchSearch && matchCategory && matchStatus
    })
  }, [inventory, filters])

  // Lọc dữ liệu đơn hàng đồ khô (Tab 2)
  const filteredDryOrders = useMemo(() => {
    return orders.filter(item => {
      const kw = orderFilters.search.trim().toLowerCase()
      const matchSearch =
        !kw ||
        item.orderNo?.toLowerCase().includes(kw) ||
        item.deliveryNo?.toLowerCase().includes(kw) ||
        item.supplierName?.toLowerCase().includes(kw) ||
        (Array.isArray(item.suppliers) &&
          item.suppliers.some(s => s?.toLowerCase().includes(kw))) ||
        (Array.isArray(item.items) &&
          item.items.some(
            it =>
              it.name?.toLowerCase().includes(kw) ||
              it.supplierName?.toLowerCase().includes(kw)
          ))

      const matchStatus =
        orderFilters.status === "all" ||
        item.status === orderFilters.status ||
        item.rawStatus === orderFilters.status ||
        (orderFilters.status === "CREATED" &&
          (item.status === "CREATED" ||
            item.status === "PENDING" ||
            item.rawStatus === "CREATED" ||
            item.rawStatus === "PENDING")) ||
        (orderFilters.status === "ACCEPTED" &&
          (item.status === "ACCEPTED" ||
            item.status === "CONFIRMED" ||
            item.rawStatus === "ACCEPTED" ||
            item.rawStatus === "CONFIRMED")) ||
        (orderFilters.status === "IN_TRANSIT" &&
          (item.status === "IN_TRANSIT" ||
            item.rawStatus === "IN_TRANSIT" ||
            item.rawStatus === "IN_PROGRESS")) ||
        (orderFilters.status === "COMPLETED" &&
          (item.status === "COMPLETED" ||
            item.status === "RECEIVED" ||
            item.rawStatus === "RECEIVED"))

      return matchSearch && matchStatus
    })
  }, [orders, orderFilters])

  // Phân trang Tab 1
  const currentTotal = filteredInventory.length
  const totalPages = Math.ceil(currentTotal / PAGE_SIZE) || 1

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages))
    }
  }, [page, totalPages])

  const paginatedInventory = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredInventory.slice(start, start + PAGE_SIZE)
  }, [filteredInventory, page])

  // Handlers Tab 1
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleFilterStat = statId => {
    setFilters(prev => ({
      ...prev,
      status: statId, // "all" | "CRITICAL_LOW" | "WARNING" | "SAFE"
    }))
  }

  // Chuyển Tab
  const handleTabChange = (_, newTab) => {
    setActiveTab(newTab)
    setSubView("list")
    setSelectedItem(null)
    setSelectedItemForOrder(null)
    setSelectedOrder(null)
    setSearchParams(newTab === "orders" ? { tab: "orders" } : {})
  }

  // Mở màn hình tạo đơn nhập hàng (Sub-view "create")
  const handleOpenCreate = (targetItem = null) => {
    setSelectedItemForOrder(targetItem)
    setSubView("create")
  }

  // Xem chi tiết mặt hàng tồn kho (Sub-view "detail")
  const handleViewDetail = item => {
    setSelectedItem(item)
    setSubView("detail")
  }

  // Xem chi tiết đơn hàng đồ khô (Sub-view "orderDetail")
  const handleViewOrderDetail = async orderItem => {
    setSelectedOrder(orderItem)
    setSubView("orderDetail")

    if (!orderItem.items || orderItem.items.length === 0) {
      try {
        const fullDetail = await TrackingService.getDeliveryDetail(orderItem.id)
        if (fullDetail) {
          setSelectedOrder(prev => ({
            ...prev,
            ...fullDetail,
            items: fullDetail.items?.length > 0 ? fullDetail.items : prev?.items,
          }))
        }
      } catch (err) {
        console.warn("Không thể tải bổ sung chi tiết đợt giao:", err)
      }
    }
  }

  // Quay lại danh sách
  const handleBackToList = () => {
    setSubView("list")
    setSelectedItem(null)
    setSelectedItemForOrder(null)
    setSelectedOrder(null)
  }

  // Submit tạo đơn mới đẩy trực tiếp lên Database thông qua Backend
  const handleCreateOrder = async orderPayload => {
    try {
      await WarehouseService.createDryOrder(orderPayload)
      const ordersToSave = Array.isArray(orderPayload) ? orderPayload : [orderPayload]
      const orderNos = ordersToSave.map(o => o.orderNo).join(", ")
      notice({
        msg: `Đã tạo Phiếu nhập hàng (${orderNos}) thành công trên hệ thống Database!`,
        isSuccess: true,
      })
      setSubView("list")
      await Promise.all([loadInventory(), loadOrders()])
      setActiveTab("orders")
      setSearchParams({ tab: "orders" })
    } catch (err) {
      console.error("Lỗi tạo phiếu đồ khô lên DB:", err)
      notice({
        msg: "Lỗi tạo phiếu nhập đồ khô lên hệ thống. Vui lòng thử lại!",
        isSuccess: false,
      })
    }
  }

  return (
    <Box className={styles.pageContainer}>
      {/* Sub-view 2: Lập phiếu nhập hàng gạo & gia vị (Giữ nguyên toàn màn hình) */}
      {subView === "create" && (
        <CreateDryOrderView
          inventoryItems={inventory}
          suppliers={suppliers}
          initialSelectedItem={selectedItemForOrder}
          onBack={handleBackToList}
          onSubmit={handleCreateOrder}
        />
      )}

      {/* Sub-view 3: Xem chi tiết mặt hàng tồn kho (Giữ nguyên toàn màn hình) */}
      {subView === "detail" && selectedItem && (
        <WarehouseDetailView
          item={selectedItem}
          onBack={handleBackToList}
          onQuickOrder={handleOpenCreate}
        />
      )}

      {/* Sub-view 4: Xem chi tiết đơn hàng đồ khô (Giữ nguyên toàn màn hình) */}
      {subView === "orderDetail" && selectedOrder && (
        <TrackingDetailView
          item={selectedOrder}
          inventoryItems={inventory}
          onBack={handleBackToList}
        />
      )}

      {/* Sub-view 1: Giao diện chính gồm 2 Tab (Danh sách nguyên liệu khô & Đơn hàng) */}
      {subView === "list" && (
        <>
          {/* Header */}
          <WarehouseHeader />

          {/* Thanh chuyển 2 Tab */}
          <Paper elevation={0} className={styles.tabsContainer}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className={styles.tabs}
            >
              <Tab
                value="inventory"
                icon={<Package size={18} />}
                iconPosition="start"
                label={
                  <Box className={styles.tabLabel}>
                    <span>Danh sách nguyên liệu khô</span>
                    {inventory.length > 0 && (
                      <Chip
                        label={inventory.length}
                        size="small"
                        className={activeTab === "inventory" ? styles.activeBadge : styles.inactiveBadge}
                      />
                    )}
                  </Box>
                }
                className={styles.tabItem}
              />

              <Tab
                value="orders"
                icon={<ClipboardList size={18} />}
                iconPosition="start"
                label={
                  <Box className={styles.tabLabel}>
                    <span>Tiếp nhận nguyên liệu</span>
                    {orders.length > 0 && (
                      <Chip
                        label={orders.length}
                        size="small"
                        className={activeTab === "orders" ? styles.activeBadge : styles.inactiveBadge}
                      />
                    )}
                  </Box>
                }
                className={styles.tabItem}
              />
            </Tabs>
          </Paper>

          {/* Nội dung Tab 1: Danh sách nguyên liệu khô */}
          {activeTab === "inventory" && (
            <>
              {/* Thẻ thống kê 4 nhóm: Tổng, Dưới an toàn, An toàn, Chờ giao */}
              <WarehouseStatsRail
                stats={stats}
                activeFilter={activeRailFilter}
                onFilterChange={handleFilterStat}
              />

              {/* Bộ lọc & Tìm kiếm + Nút Lập phiếu nhập đồ khô */}
              <WarehouseFilterStrip
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onOpenCreate={() => handleOpenCreate(null)}
              />

              {/* Bảng Dữ liệu Tồn kho hoặc Loading */}
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 10,
                    gap: 2,
                    bgcolor: "#ffffff",
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    my: 2,
                  }}
                >
                  <FoodPrintLoading size="large" />
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                    Đang tải danh sách tồn kho nguyên liệu đồ khô...
                  </Typography>
                </Box>
              ) : (
                <>
                  <WarehouseTable
                    items={paginatedInventory}
                    onViewDetail={handleViewDetail}
                  />

                  {/* Phân trang */}
                  <WarehousePagination
                    page={page}
                    count={totalPages}
                    totalItems={currentTotal}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                  />
                </>
              )}
            </>
          )}

          {/* Nội dung Tab 2: Đơn hàng đồ khô & theo dõi tiến trình */}
          {activeTab === "orders" && (
            <>
              {/* Bộ lọc đơn hàng đồ khô */}
              <Box className={styles.orderFilterBar}>
                <Box className={styles.orderFilterInputs}>
                  <TextField
                    size="small"
                    placeholder="Tìm theo mã đơn, mã phiếu, nhà cung cấp..."
                    value={orderFilters.search}
                    onChange={e =>
                      setOrderFilters(prev => ({ ...prev, search: e.target.value }))
                    }
                    className={styles.orderSearchInput}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={18} className={styles.searchIcon} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    select
                    size="small"
                    label="Trạng thái tiến trình"
                    value={orderFilters.status}
                    onChange={e =>
                      setOrderFilters(prev => ({ ...prev, status: e.target.value }))
                    }
                    className={styles.orderSelectInput}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value="CREATED">Chờ NCC xác nhận</MenuItem>
                    <MenuItem value="ACCEPTED">NCC đã xác nhận</MenuItem>
                    <MenuItem value="IN_TRANSIT">Đang giao</MenuItem>
                    <MenuItem value="ARRIVED">Đã tới trường (Chờ kiểm duyệt)</MenuItem>
                    <MenuItem value="COMPLETED">Đã hoàn tất (Đã nhập kho)</MenuItem>
                    <MenuItem value="REJECTED">Bị từ chối tiếp nhận</MenuItem>
                  </TextField>

                  {(orderFilters.search || orderFilters.status !== "all") && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RotateCcw size={16} />}
                      onClick={() => setOrderFilters({ search: "", status: "all" })}
                      className={styles.resetBtn}
                    >
                      Đặt lại
                    </Button>
                  )}
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Plus size={18} />}
                  onClick={() => {
                    setActiveTab("inventory")
                    handleOpenCreate(null)
                  }}
                  className={styles.createOrderBtn}
                >
                  Yêu cầu nhập đồ khô
                </Button>
              </Box>

              {/* Bảng danh sách đơn hàng đồ khô */}
              <TrackingTable
                orders={filteredDryOrders}
                loading={ordersLoading}
                onViewDetail={handleViewOrderDetail}
              />
            </>
          )}
        </>
      )}
    </Box>
  )
}
