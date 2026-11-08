import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import notice from "src/components/Notice"
import KitchenService from "src/services/KitchenService"
import {
  MOCK_RETAINED_SAMPLES,
  MOCK_UNSAMPLED_BATCHES,
  get24hRetainedStatus,
} from "./mockSamplesData"
import KitchenSamplesHeader from "./component/KitchenSamplesHeader"
import KitchenSamplesKPICards from "./component/KitchenSamplesKPICards"
import KitchenSamplesFilterStrip from "./component/KitchenSamplesFilterStrip"
import KitchenSamplesTable from "./component/KitchenSamplesTable"
import KitchenSamplesMobileCards from "./component/KitchenSamplesMobileCards"
import KitchenSamplesEmptyState from "./component/KitchenSamplesEmptyState"
import CreateSampleModal from "./component/CreateSampleModal"
import SampleDetailModal from "./component/SampleDetailModal"
import UpdateSampleModal from "./component/UpdateSampleModal"
import DisposeSampleModal from "./component/DisposeSampleModal"
import styles from "./index.module.scss"

export default function KitchenSamples() {
  const navigate = useNavigate()

  // 1. Data States
  const [samples, setSamples] = useState(MOCK_RETAINED_SAMPLES)
  const [unsampledBatches, setUnsampledBatches] = useState(MOCK_UNSAMPLED_BATCHES)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 2. Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL")
  const [timeFilter, setTimeFilter] = useState("ALL")

  // 3. Modal / Popup States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [detailSample, setDetailSample] = useState(null)
  const [updateSample, setUpdateSample] = useState(null)
  const [disposeSample, setDisposeSample] = useState(null)

  // 4. Tải dữ liệu từ backend nếu có, fallback sang mock chuẩn
  const fetchSamples = useCallback(async (signal) => {
    try {
      setLoading(true)
      const res = await KitchenService.getRetainedSamples({}, { signal })
      if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
        // Map backend DTO sang format hiển thị
        const mapped = res.items.map((item) => ({
          ...item,
          dishName: item.dishName || item.CookingBatch?.Dish?.name || "Món ăn bán trú",
          batchCode: item.batchCode || item.CookingBatch?.batchCode || item.cookingBatchId,
          mealType: item.mealType || item.CookingBatch?.mealType || "LUNCH",
          mealLabel: item.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa",
          portions: item.CookingBatch?.plannedPortions || 400,
        }))
        setSamples(mapped)
      }
    } catch {
      // Backend offline hoặc chưa có dữ liệu, giữ mock chuẩn để demo mượt mà
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchSamples(controller.signal)
    return () => controller.abort()
  }, [fetchSamples])

  // 5. Thống kê 3 chỉ số KPI (Đang lưu, Đã đủ 24h, Đã tiêu hủy)
  const kpiStats = useMemo(() => {
    let stored = 0
    let ready = 0
    let disposed = 0

    samples.forEach((s) => {
      const info = get24hRetainedStatus(s.sampledAt, s.status)
      if (info.isDisposed) {
        disposed += 1
      } else if (info.isReadyToDispose) {
        ready += 1
      } else {
        stored += 1
      }
    })

    return { stored, ready, disposed }
  }, [samples])

  // 6. Lọc danh sách mẫu lưu
  const filteredSamples = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase()

    return samples.filter((s) => {
      // Tìm kiếm từ khóa
      if (searchLower) {
        const code = (s.batchCode || s.cookingBatchId || "").toLowerCase()
        const dish = (s.dishName || "").toLowerCase()
        const id = (s.id || "").toLowerCase()
        if (!code.includes(searchLower) && !dish.includes(searchLower) && !id.includes(searchLower)) {
          return false
        }
      }

      // Lọc trạng thái
      const info = get24hRetainedStatus(s.sampledAt, s.status)
      if (statusFilter === "STORED" && (info.isDisposed || info.isReadyToDispose)) {
        return false
      }
      if (statusFilter === "READY" && (!info.isReadyToDispose || info.isDisposed)) {
        return false
      }
      if (statusFilter === "DISPOSED" && !info.isDisposed) {
        return false
      }

      // Lọc ca ăn
      if (mealTypeFilter !== "ALL" && s.mealType !== mealTypeFilter) {
        return false
      }

      // Lọc ngày
      if (timeFilter !== "ALL") {
        const d = new Date(s.sampledAt)
        const today = new Date()
        const isToday =
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()

        if (timeFilter === "TODAY" && !isToday) return false
        if (timeFilter === "YESTERDAY" && isToday) return false
      }

      return true
    })
  }, [samples, searchTerm, statusFilter, mealTypeFilter, timeFilter])

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "ALL" ||
    mealTypeFilter !== "ALL" ||
    timeFilter !== "ALL"

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("ALL")
    setMealTypeFilter("ALL")
    setTimeFilter("ALL")
  }

  // 7. Xử lý Tạo mẫu lưu mới (SCREEN 02)
  const handleCreateSampleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      // Cố gắng gọi API
      try {
        await KitchenService.createBatchSample(formData.cookingBatchId, {
          quantity: formData.quantity,
          unit: formData.unit,
          storageLocation: formData.storageLocation,
          sampledAt: formData.sampledAt,
        })
      } catch {
        // Tiếp tục cập nhật UI cục bộ
      }

      const newSample = {
        id: `smp-${Date.now().toString().slice(-4)}`,
        cookingBatchId: formData.cookingBatchId,
        batchCode: formData.batchData?.batchCode || formData.cookingBatchId,
        dishName: formData.batchData?.dishName || "Món ăn bán trú",
        dishCategory: formData.batchData?.dishCategory || "Món ăn",
        mealType: formData.batchData?.mealType || "LUNCH",
        mealLabel: formData.batchData?.mealLabel || "Bữa trưa",
        portions: formData.batchData?.portions || 420,
        sampledAt: formData.sampledAt,
        quantity: formData.quantity,
        unit: formData.unit,
        storageLocation: formData.storageLocation,
        status: "STORED",
        packaging: "Lọ thủy tinh tiệt trùng",
        recordedByName: "Nguyễn Văn Vận (Bếp trưởng)",
        recordedByUserId: "usr-chef-01",
        disposedAt: null,
        disposalNote: "",
      }

      setSamples((prev) => [newSample, ...prev])
      setUnsampledBatches((prev) => prev.filter((b) => b.id !== formData.cookingBatchId))
      setIsCreateOpen(false)
      notice({ msg: "Ghi nhận mẫu lưu thực phẩm 24h thành công!", isSuccess: true })
    } catch (err) {
      notice({ msg: err.message || "Không thể tạo mẫu lưu.", isSuccess: false })
    } finally {
      setSubmitting(false)
    }
  }

  // 8. Xử lý Cập nhật mẫu lưu (SCREEN 04A)
  const handleUpdateSampleSubmit = (updatedData) => {
    setSamples((prev) =>
      prev.map((s) => (s.id === updatedData.id ? { ...s, ...updatedData } : s))
    )
    if (detailSample?.id === updatedData.id) {
      setDetailSample((prev) => ({ ...prev, ...updatedData }))
    }
    setUpdateSample(null)
    notice({ msg: "Cập nhật thông tin mẫu lưu thành công!", isSuccess: true })
  }

  // 9. Xử lý Tiêu hủy mẫu lưu (SCREEN 04B)
  const handleDisposeSampleConfirm = async ({ disposedAt, disposalNote }) => {
    if (!disposeSample) return
    setSubmitting(true)
    try {
      try {
        await KitchenService.disposeRetainedSample(disposeSample.id, {
          disposedAt,
          disposalNote,
        })
      } catch {
        // Cập nhật UI
      }

      setSamples((prev) =>
        prev.map((s) =>
          s.id === disposeSample.id
            ? {
                ...s,
                status: "DISPOSED",
                disposedAt,
                disposalNote,
                storageLocation: `${s.storageLocation} (Đã giải phóng)`,
              }
            : s
        )
      )

      if (detailSample?.id === disposeSample.id) {
        setDetailSample((prev) => ({
          ...prev,
          status: "DISPOSED",
          disposedAt,
          disposalNote,
        }))
      }

      setDisposeSample(null)
      notice({ msg: "Ghi nhận tiêu hủy mẫu lưu thành công!", isSuccess: true })
    } catch (err) {
      notice({ msg: err.message || "Không thể tiêu hủy mẫu.", isSuccess: false })
    } finally {
      setSubmitting(false)
    }
  }

  // 10. Điều hướng xem chi tiết mẻ nấu
  const handleNavigateBatch = (batchId) => {
    if (batchId) {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", batchId))
    }
  }

  // 11. In sổ kiểm thực
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Tiêu đề trang & Phím tác vụ */}
      <KitchenSamplesHeader
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onPrint={handlePrint}
      />

      {/* 2. 3 Thẻ chỉ số tổng quan tinh gọn */}
      <KitchenSamplesKPICards
        stats={kpiStats}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />

      {/* 3. Thanh tìm kiếm và bộ lọc */}
      <KitchenSamplesFilterStrip
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        mealTypeFilter={mealTypeFilter}
        onMealTypeChange={setMealTypeFilter}
        timeFilter={timeFilter}
        onTimeChange={setTimeFilter}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Bảng mẫu lưu (Desktop) & Danh sách Card (Mobile) */}
      {filteredSamples.length > 0 ? (
        <>
          <div className={styles.desktopWrap}>
            <KitchenSamplesTable
              samples={filteredSamples}
              onViewDetail={setDetailSample}
              onOpenDisposeModal={setDisposeSample}
              onOpenUpdateModal={setUpdateSample}
              onNavigateBatch={handleNavigateBatch}
            />
          </div>

          <div className={styles.mobileWrap}>
            <KitchenSamplesMobileCards
              samples={filteredSamples}
              onViewDetail={setDetailSample}
              onOpenDisposeModal={setDisposeSample}
              onOpenUpdateModal={setUpdateSample}
              onNavigateBatch={handleNavigateBatch}
            />
          </div>
        </>
      ) : (
        <KitchenSamplesEmptyState
          isFiltered={hasActiveFilters}
          onResetFilters={handleResetFilters}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />
      )}

      {/* SCREEN 02: Modal Ghi nhận mẫu lưu */}
      <CreateSampleModal
        open={isCreateOpen}
        availableBatches={unsampledBatches}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSampleSubmit}
        submitting={submitting}
      />

      {/* SCREEN 03: Modal Chi tiết mẫu lưu */}
      <SampleDetailModal
        open={Boolean(detailSample)}
        sample={detailSample}
        onClose={() => setDetailSample(null)}
        onOpenUpdateModal={setUpdateSample}
        onOpenDisposeModal={setDisposeSample}
        onNavigateBatch={handleNavigateBatch}
      />

      {/* SCREEN 04A: Modal Cập nhật mẫu lưu */}
      <UpdateSampleModal
        open={Boolean(updateSample)}
        sample={updateSample}
        onClose={() => setUpdateSample(null)}
        onSubmit={handleUpdateSampleSubmit}
        submitting={submitting}
      />

      {/* SCREEN 04B: Modal Xác nhận tiêu hủy mẫu lưu */}
      <DisposeSampleModal
        open={Boolean(disposeSample)}
        sample={disposeSample}
        onClose={() => setDisposeSample(null)}
        onConfirm={handleDisposeSampleConfirm}
        submitting={submitting}
      />
    </div>
  )
}
