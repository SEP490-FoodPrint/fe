import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ClockAlert } from "lucide-react";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import ROUTER from "src/router/ROUTER";
import notice from "src/components/Notice";
import KitchenService from "src/services/KitchenService";
import { get24hRetainedStatus } from "./mockSamplesData";
import KitchenSamplesHeader from "./component/KitchenSamplesHeader";
import KitchenSamplesKPICards from "./component/KitchenSamplesKPICards";
import KitchenSamplesFilterStrip from "./component/KitchenSamplesFilterStrip";
import KitchenSamplesDayCards from "./component/KitchenSamplesDayCards";
import KitchenSamplesTable from "./component/KitchenSamplesTable";
import KitchenSamplesMobileCards from "./component/KitchenSamplesMobileCards";
import KitchenSamplesEmptyState from "./component/KitchenSamplesEmptyState";
import CreateSampleModal from "./component/CreateSampleModal";
import SampleDetailModal from "./component/SampleDetailModal";
import UpdateSampleModal from "./component/UpdateSampleModal";
import DisposeSampleModal from "./component/DisposeSampleModal";
import BatchDisposeConfirmModal from "./component/BatchDisposeConfirmModal";
import styles from "./index.module.scss";

export default function KitchenSamples() {
  const navigate = useNavigate();

  // 1. Data States: Không khởi tạo bằng Mock, mặc định rỗng
  const [samples, setSamples] = useState([]);
  const [unsampledBatches, setUnsampledBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  // 2. Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState("ALL");

  // 3. Modal / Popup States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailSample, setDetailSample] = useState(null);
  const [updateSample, setUpdateSample] = useState(null);
  const [disposeSample, setDisposeSample] = useState(null);
  const [isBatchDisposeOpen, setIsBatchDisposeOpen] = useState(false);
  const [batchDisposeTargetSamples, setBatchDisposeTargetSamples] = useState(null);

  // 4. Tải dữ liệu thực từ backend API
  const fetchSamples = useCallback(async (signal) => {
    try {
      setLoading(true);
      setLoadError("");
      const [samplesRes, batchesRes] = await Promise.all([
        KitchenService.getAllRetainedSamples({ signal }),
        KitchenService.getBatches(
          { status: "COMPLETED", hasSample: false, limit: 100 },
          { signal },
        ),
      ]);

      const rawItems = samplesRes?.items || [];
      const mapped = rawItems.map((item) => ({
        ...item,
        dishName:
          item.dishName || item.CookingBatch?.Dish?.name || "Món ăn bán trú",
        batchCode:
          item.batchCode || item.CookingBatch?.batchCode || item.cookingBatchId,
        mealType: item.mealType || item.CookingBatch?.mealType || "LUNCH",
        mealLabel:
          (item.mealType || item.CookingBatch?.mealType) === "AFTERNOON"
            ? "Bữa xế"
            : "Bữa trưa",
        portions: item.CookingBatch?.plannedPortions || 0,
      }));
      setSamples(mapped);

      // Lấy danh sách các mẻ nấu đã hoàn thành nhưng chưa lưu mẫu thật
      const unsampled = (batchesRes?.items || []).map((b) => {
        const dishes =
          Array.isArray(b.dishes) && b.dishes.length > 0
            ? b.dishes
            : b.dishId
              ? [
                {
                  dishId: b.dishId,
                  name: b.Dish?.name || "Món ăn bán trú",
                  plannedPortions: b.plannedPortions,
                },
              ]
              : [];
        const dishName =
          dishes.length > 0
            ? dishes.map((d) => d.name).join(", ")
            : b.Dish?.name || "Món ăn bán trú";

        return {
          id: b.id,
          cookingBatchId: b.id,
          batchCode: b.batchCode,
          batchGroupId: b.batchGroupId,
          batchGroupCode: b.BatchGroup?.batchCode || "",
          dishName,
          dishes,
          retainedFoodSamples: b.retainedFoodSamples || [],
          dishCategory: "Món ăn bán trú",
          mealType: b.mealType,
          mealLabel: b.mealType === "AFTERNOON" ? "Bữa xế" : "Bữa trưa",
          portions: b.plannedPortions || 0,
          completedAt: b.completedAt || b.createdAt,
          defaultQuantity: "150",
          defaultUnit: "g",
          defaultStorage: "Tủ A1 - Ngăn 01",
        };
      });
      setUnsampledBatches(unsampled);
    } catch (err) {
      if (!signal?.aborted) {
        setLoadError(
          err.message || "Không thể tải danh sách mẫu lưu từ hệ thống.",
        );
        setSamples([]);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSamples(controller.signal);
    return () => controller.abort();
  }, [fetchSamples]);

  // 5. Thống kê 3 chỉ số KPI (Đang lưu, Đã đủ 24h, Đã tiêu hủy)
  const kpiStats = useMemo(() => {
    let stored = 0;
    let ready = 0;
    let disposed = 0;

    samples.forEach((s) => {
      const info = get24hRetainedStatus(s.sampledAt, s.status);
      if (info.isDisposed) {
        disposed += 1;
      } else if (info.isReadyToDispose) {
        ready += 1;
      } else {
        stored += 1;
      }
    });

    return { stored, ready, disposed };
  }, [samples]);

  // 6. Danh sách mẫu đã đủ 24h chờ tiêu hủy
  const readyToDisposeSamples = useMemo(() => {
    return samples.filter((s) => {
      const info = get24hRetainedStatus(s.sampledAt, s.status);
      return info.isReadyToDispose && !info.isDisposed && s.status === "STORED";
    });
  }, [samples]);

  // 7. Lọc danh sách mẫu lưu và sắp xếp thời điểm lấy mẫu mới nhất ở trên
  const filteredSamples = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    const result = samples.filter((s) => {
      // Tìm kiếm từ khóa
      if (searchLower) {
        const dishMatch = s.dishName?.toLowerCase().includes(searchLower);
        const codeMatch = s.batchCode?.toLowerCase().includes(searchLower);
        const locationMatch = s.storageLocation
          ?.toLowerCase()
          .includes(searchLower);
        if (!dishMatch && !codeMatch && !locationMatch) {
          return false;
        }
      }

      // Lọc trạng thái
      if (statusFilter !== "ALL") {
        const info = get24hRetainedStatus(s.sampledAt, s.status);
        if (
          statusFilter === "STORED" &&
          (info.isDisposed || info.isReadyToDispose)
        ) {
          return false;
        }
        if (statusFilter === "READY_TO_DISPOSE" && !info.isReadyToDispose) {
          return false;
        }
        if (statusFilter === "DISPOSED" && !info.isDisposed) {
          return false;
        }
      }

      // Lọc ca ăn
      if (mealTypeFilter !== "ALL" && s.mealType !== mealTypeFilter) {
        return false;
      }

      // Lọc ngày (chọn từ lịch ngày/tháng/năm)
      if (dateFilter) {
        const d = new Date(s.sampledAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const itemDateStr = `${yyyy}-${mm}-${dd}`;
        if (itemDateStr !== dateFilter) {
          return false;
        }
      }

      return true;
    });

    // Sắp xếp thời điểm lấy mẫu muộn hơn (mới nhất) ở trên
    return result.sort((a, b) => {
      const timeA = new Date(a.sampledAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.sampledAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [samples, searchTerm, statusFilter, mealTypeFilter, dateFilter]);

  const DAYS_OF_WEEK = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  const padZero = (n) => String(n).padStart(2, "0");
  const toDateKey = (d) =>
    `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;

  // 7A. Nhóm mẫu lưu theo ngày (Day Groups)
  const dayGroups = useMemo(() => {
    const today = new Date();
    const todayKey = toDateKey(today);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayKey = toDateKey(yesterday);

    const map = new Map();

    filteredSamples.forEach((item) => {
      const d = new Date(item.sampledAt || item.createdAt || Date.now());
      if (isNaN(d.getTime())) return;
      const key = toDateKey(d);

      if (!map.has(key)) {
        map.set(key, {
          dateKey: key,
          dateObj: d,
          dateDisplay: `${padZero(d.getDate())}/${padZero(d.getMonth() + 1)}/${d.getFullYear()}`,
          dayLabel: DAYS_OF_WEEK[d.getDay()],
          isToday: key === todayKey,
          isYesterday: key === yesterdayKey,
          samples: [],
          lunchCount: 0,
          afternoonCount: 0,
          storedCount: 0,
          readyCount: 0,
          disposedCount: 0,
        });
      }

      const group = map.get(key);
      group.samples.push(item);
      if (item.mealType === "AFTERNOON") {
        group.afternoonCount += 1;
      } else {
        group.lunchCount += 1;
      }

      const info = get24hRetainedStatus(item.sampledAt, item.status);
      if (info.isDisposed) {
        group.disposedCount += 1;
      } else if (info.isReadyToDispose) {
        group.readyCount += 1;
      } else {
        group.storedCount += 1;
      }
    });

    return Array.from(map.values())
      .map((g) => ({
        ...g,
        totalSamples: g.samples.length,
      }))
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [filteredSamples]);

  const activeSelectedKey = useMemo(() => {
    if (selectedDayKey === "ALL") return "ALL";
    const exists = dayGroups.some((g) => g.dateKey === selectedDayKey);
    return exists ? selectedDayKey : "ALL";
  }, [selectedDayKey, dayGroups]);

  const selectedGroup = useMemo(() => {
    if (activeSelectedKey === "ALL") return null;
    return dayGroups.find((g) => g.dateKey === activeSelectedKey) || null;
  }, [activeSelectedKey, dayGroups]);

  const displayedSamples = useMemo(() => {
    if (activeSelectedKey === "ALL") {
      return filteredSamples;
    }
    return selectedGroup ? selectedGroup.samples : [];
  }, [activeSelectedKey, filteredSamples, selectedGroup]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "ALL" ||
    mealTypeFilter !== "ALL" ||
    Boolean(dateFilter);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setMealTypeFilter("ALL");
    setDateFilter("");
    setSelectedDayKey("ALL");
  };

  // 7. Xử lý Tạo mẫu lưu mới (SCREEN 02)
  const handleCreateSampleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        quantity: formData.quantity,
        unit: formData.unit,
        storageLocation: formData.storageLocation,
        sampledAt: formData.sampledAt,
      };
      if (formData.dishId) {
        payload.dishId = formData.dishId;
      }
      await KitchenService.createBatchSample(formData.cookingBatchId, payload);
      await fetchSamples();
      setIsCreateOpen(false);
      notice({
        msg: "Ghi nhận mẫu lưu thực phẩm 24h thành công!",
        isSuccess: true,
      });
    } catch (err) {
      notice({
        msg: err.message || "Không thể tạo mẫu lưu.",
        isSuccess: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 8. Xử lý Cập nhật mẫu lưu (SCREEN 04A)
  const handleUpdateSampleSubmit = (updatedData) => {
    setSamples((prev) =>
      prev.map((s) => (s.id === updatedData.id ? { ...s, ...updatedData } : s)),
    );
    if (detailSample?.id === updatedData.id) {
      setDetailSample((prev) => ({ ...prev, ...updatedData }));
    }
    setUpdateSample(null);
    notice({ msg: "Cập nhật thông tin mẫu lưu thành công!", isSuccess: true });
  };

  // 9. Xử lý Tiêu hủy mẫu lưu (SCREEN 04B)
  const handleDisposeSampleConfirm = async ({ disposedAt, disposalNote }) => {
    if (!disposeSample) return;
    setSubmitting(true);
    try {
      await KitchenService.disposeRetainedSample(disposeSample.id, {
        disposedAt,
        disposalNote,
      });
      await fetchSamples();
      if (detailSample?.id === disposeSample.id) {
        setDetailSample(null);
      }
      setDisposeSample(null);
      notice({ msg: "Ghi nhận tiêu hủy mẫu lưu thành công!", isSuccess: true });
    } catch (err) {
      notice({
        msg: err.message || "Không thể tiêu hủy mẫu.",
        isSuccess: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 10. Xử lý Tiêu hủy hàng loạt mẫu đã đủ 24 giờ (tất cả hoặc theo ngày cụ thể)
  const handleOpenDisposeForDay = (dateKey) => {
    const readyForDay = readyToDisposeSamples.filter((s) => {
      const d = new Date(s.sampledAt || s.createdAt || Date.now());
      return toDateKey(d) === dateKey;
    });
    if (readyForDay.length === 0) {
      notice({
        msg: "Không có mẫu lưu nào đã đủ 24 giờ của ngày này để tiêu hủy.",
        isSuccess: false,
      });
      return;
    }
    setBatchDisposeTargetSamples(readyForDay);
    setIsBatchDisposeOpen(true);
  };

  const handleBatchDisposeConfirm = async () => {
    const targets = batchDisposeTargetSamples || readyToDisposeSamples;
    if (!targets.length) return;
    setSubmitting(true);
    try {
      const nowISO = new Date().toISOString();
      await Promise.all(
        targets.map((sample) =>
          KitchenService.disposeRetainedSample(sample.id, {
            disposedAt: nowISO,
            disposalNote:
              "Tiêu hủy hàng loạt sau khi lưu trữ đủ 24 giờ theo quy chuẩn.",
          })
        )
      );
      await fetchSamples();
      setIsBatchDisposeOpen(false);
      setBatchDisposeTargetSamples(null);
      notice({
        msg: `Đã tiêu hủy thành công tất cả ${targets.length} mẫu lưu đủ 24 giờ!`,
        isSuccess: true,
      });
    } catch (err) {
      notice({
        msg: err.message || "Lỗi khi tiêu hủy hàng loạt mẫu lưu.",
        isSuccess: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 11. Điều hướng xem chi tiết mẻ nấu
  const handleNavigateBatch = (batchId) => {
    if (batchId) {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", batchId));
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. Tiêu đề trang & Phím tác vụ */}
      <KitchenSamplesHeader onOpenCreateModal={() => setIsCreateOpen(true)} />

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
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        readyCount={readyToDisposeSamples.length}
        onDisposeAllReady={() => {
          if (readyToDisposeSamples.length === 0) {
            notice({
              msg: "Hiện tại không có mẫu lưu nào đã đủ 24 giờ để tiêu hủy.",
              isSuccess: false,
            });
            return;
          }
          setBatchDisposeTargetSamples(null);
          setIsBatchDisposeOpen(true);
        }}
        disposing={submitting && isBatchDisposeOpen}
      />

      {/* 4. Các cục theo các ngày (Day Cards) */}
      {!loading && !loadError && filteredSamples.length > 0 && (
        <KitchenSamplesDayCards
          dayGroups={dayGroups}
          selectedKey={activeSelectedKey}
          onSelectDay={(key) =>
            setSelectedDayKey((prev) => (prev === key ? "ALL" : key))
          }
          totalAll={filteredSamples.length}
          allStored={kpiStats.stored}
          allReady={kpiStats.ready}
          allDisposed={kpiStats.disposed}
        />
      )}

      {/* 5. Tiêu đề khối bảng chi tiết của ngày đang chọn */}
      {!loading && !loadError && displayedSamples.length > 0 && (
        <div className={styles.tableHeaderBar}>
          <div className={styles.tableHeaderTitle}>
            <Calendar size={16} className={styles.tableHeaderIcon} />
            <span className={styles.tableHeaderHeading}>
              {selectedGroup
                ? `Chi tiết mẫu lưu: ${selectedGroup.dayLabel}, ${selectedGroup.dateDisplay}`
                : "Bảng chi tiết toàn bộ mẫu lưu"}
            </span>
            <span className={styles.tableHeaderCount}>
              {displayedSamples.length} mẫu
            </span>
          </div>

          <div className={styles.tableHeaderActions}>
            {selectedGroup?.readyCount > 0 && (
              <button
                type="button"
                className={styles.dayDisposeBtn}
                onClick={() => handleOpenDisposeForDay(selectedGroup.dateKey)}
                title="Tiêu hủy các mẫu đủ 24h của ngày này"
              >
                <ClockAlert size={14} />
                <span>Tiêu hủy {selectedGroup.readyCount} mẫu đủ 24h</span>
              </button>
            )}
            {activeSelectedKey !== "ALL" && (
              <button
                type="button"
                className={styles.viewAllBtn}
                onClick={() => setSelectedDayKey("ALL")}
                title="Hiển thị mẫu lưu của tất cả các ngày"
              >
                Xem tất cả các ngày
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Bảng mẫu lưu (Desktop) & Danh sách Card (Mobile) */}
      {loading ? (
        <div
          style={{
            padding: "80px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FoodPrintLoading />
        </div>
      ) : loadError ? (
        <div className="p-4 my-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {loadError}
        </div>
      ) : displayedSamples.length > 0 ? (
        <>
          <div className={styles.desktopWrap}>
            <KitchenSamplesTable
              samples={displayedSamples}
              onViewDetail={setDetailSample}
              onOpenDisposeModal={setDisposeSample}
              onOpenUpdateModal={setUpdateSample}
              onNavigateBatch={handleNavigateBatch}
            />
          </div>

          <div className={styles.mobileWrap}>
            <KitchenSamplesMobileCards
              samples={displayedSamples}
              onViewDetail={setDetailSample}
              onOpenDisposeModal={setDisposeSample}
              onOpenUpdateModal={setUpdateSample}
              onNavigateBatch={handleNavigateBatch}
            />
          </div>
        </>
      ) : (
        <KitchenSamplesEmptyState
          isFiltered={hasActiveFilters || activeSelectedKey !== "ALL"}
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

      {/* Modal Xác nhận tiêu hủy hàng loạt tất cả mẫu đủ 24 giờ */}
      <BatchDisposeConfirmModal
        open={isBatchDisposeOpen}
        count={(batchDisposeTargetSamples || readyToDisposeSamples).length}
        onClose={() => {
          setIsBatchDisposeOpen(false);
          setBatchDisposeTargetSamples(null);
        }}
        onConfirm={handleBatchDisposeConfirm}
        submitting={submitting}
      />
    </div>
  );
}
