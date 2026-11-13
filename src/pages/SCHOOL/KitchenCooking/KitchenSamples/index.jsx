import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Calendar, ClockAlert, ArrowLeft, Plus, Search, X, Utensils, Filter } from "lucide-react";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import ROUTER from "src/router/ROUTER";
import notice from "src/components/Notice";
import KitchenService from "src/services/KitchenService";
import { get24hRetainedStatus } from "./retainedStatusHelper";
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
  const { date: routeDate } = useParams();
  const [searchParams] = useSearchParams();
  const activeDate = routeDate || searchParams.get("date") || "";

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

  const selectedGroup = useMemo(() => {
    if (!activeDate || activeDate.toLowerCase() === "all") return null;
    return dayGroups.find((g) => g.dateKey === activeDate) || null;
  }, [activeDate, dayGroups]);

  const daySamples = useMemo(() => {
    if (!activeDate) return [];

    const searchLower = searchTerm.trim().toLowerCase();

    return samples
      .filter((s) => {
        // Lọc theo ngày (nếu không phải "all")
        if (activeDate.toLowerCase() !== "all") {
          const d = new Date(s.sampledAt || s.createdAt || 0);
          if (toDateKey(d) !== activeDate) {
            return false;
          }
        }

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

        // Lọc bữa ăn
        if (mealTypeFilter !== "ALL" && s.mealType !== mealTypeFilter) {
          return false;
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

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.sampledAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.sampledAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [samples, activeDate, searchTerm, mealTypeFilter, statusFilter]);

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
  };

  const handleOpenDayDetail = (dateKey) => {
    setSearchTerm("");
    setMealTypeFilter("ALL");
    setStatusFilter("ALL");
    navigate(`${ROUTER.SCHOOL_KITCHEN_SAMPLES}/${dateKey}`);
  };

  const handleBackToDays = () => {
    setSearchTerm("");
    setMealTypeFilter("ALL");
    setStatusFilter("ALL");
    navigate(ROUTER.SCHOOL_KITCHEN_SAMPLES);
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
      ) : activeDate ? (
        /* =======================================================
           TRANG 2: BẢNG CHI TIẾT MẪU LƯU THEO NGÀY (TRANG KHÁC)
        ======================================================= */
        <>
          {/* Header Trang Chi Tiết: Nút quay lại + Tiêu đề ngày + Tác vụ */}
          <div className={styles.detailPageHeader}>
            <div className={styles.detailHeaderLeft}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBackToDays}
                title="Quay lại danh sách ngày"
              >
                <ArrowLeft size={16} />
                <span>Danh sách ngày</span>
              </button>

              <div className={styles.detailTitleGroup}>
                <div className={styles.detailTitleRow}>
                  <h1 className={styles.detailTitle}>
                    {selectedGroup
                      ? `Chi tiết mẫu lưu: ${selectedGroup.dayLabel}, ${selectedGroup.dateDisplay}`
                      : activeDate.toLowerCase() === "all"
                      ? "Bảng chi tiết toàn bộ mẫu lưu"
                      : `Chi tiết mẫu lưu: ${activeDate}`}
                  </h1>
                  {selectedGroup?.isToday && (
                    <span className={styles.badgeToday}>Hôm nay</span>
                  )}
                  {selectedGroup?.isYesterday && (
                    <span className={styles.badgeYesterday}>Hôm qua</span>
                  )}
                </div>
                <p className={styles.detailSubtitle}>
                  {selectedGroup
                    ? `Tổng số ${daySamples.length} mẫu lưu (${selectedGroup.lunchCount} Bữa trưa · ${selectedGroup.afternoonCount} Bữa xế)`
                    : `Tổng số ${daySamples.length} mẫu lưu`}
                </p>
              </div>
            </div>

            <div className={styles.detailHeaderActions}>
              {selectedGroup?.readyCount > 0 && (
                <button
                  type="button"
                  className={styles.dayDisposeBtn}
                  onClick={() => handleOpenDisposeForDay(selectedGroup.dateKey)}
                  title="Tiêu hủy các mẫu đã đủ 24 giờ của ngày này"
                >
                  <ClockAlert size={14} />
                  <span>Tiêu hủy {selectedGroup.readyCount} mẫu đủ 24h</span>
                </button>
              )}

              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus size={15} />
                <span>Ghi nhận mẫu lưu</span>
              </button>
            </div>
          </div>

          {/* Bộ lọc tìm kiếm & lọc bữa ăn nhanh trong ngày */}
          <div className={styles.dayFilterStrip}>
            <div className={styles.searchWrapper}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm món ăn, mã lô trong ngày..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchTerm("")}
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.dayFilterSelects}>
              <div className={styles.selectWrapper}>
                <Utensils size={14} className={styles.selectIcon} />
                <select
                  className={styles.selectInput}
                  value={mealTypeFilter}
                  onChange={(e) => setMealTypeFilter(e.target.value)}
                  title="Lọc ca ăn"
                >
                  <option value="ALL">Tất cả bữa ăn</option>
                  <option value="LUNCH">Bữa trưa</option>
                  <option value="AFTERNOON">Bữa xế</option>
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <Filter size={14} className={styles.selectIcon} />
                <select
                  className={styles.selectInput}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  title="Lọc trạng thái"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="STORED">Đang lưu mẫu</option>
                  <option value="READY_TO_DISPOSE">Đã đủ 24 giờ</option>
                  <option value="DISPOSED">Đã tiêu hủy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bảng chi tiết gốc (Toàn bộ không gian trang) */}
          {daySamples.length > 0 ? (
            <>
              <div className={styles.desktopWrap}>
                <KitchenSamplesTable
                  samples={daySamples}
                  onViewDetail={setDetailSample}
                  onOpenDisposeModal={setDisposeSample}
                  onOpenUpdateModal={setUpdateSample}
                  onNavigateBatch={handleNavigateBatch}
                />
              </div>

              <div className={styles.mobileWrap}>
                <KitchenSamplesMobileCards
                  samples={daySamples}
                  onViewDetail={setDetailSample}
                  onOpenDisposeModal={setDisposeSample}
                  onOpenUpdateModal={setUpdateSample}
                  onNavigateBatch={handleNavigateBatch}
                />
              </div>
            </>
          ) : (
            <KitchenSamplesEmptyState
              isFiltered={Boolean(
                searchTerm || statusFilter !== "ALL" || mealTypeFilter !== "ALL"
              )}
              onResetFilters={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setMealTypeFilter("ALL");
              }}
              onOpenCreateModal={() => setIsCreateOpen(true)}
            />
          )}
        </>
      ) : (
        /* =======================================================
           TRANG 1: DANH SÁCH CÁC CỤC THEO NGÀY (KHÔNG CÓ BẢNG DƯỚI)
        ======================================================= */
        <>
          {/* 1. Tiêu đề trang & Phím tác vụ */}
          <KitchenSamplesHeader
            onOpenCreateModal={() => setIsCreateOpen(true)}
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

          {/* 4. Các cục theo các ngày (Day Cards Grid) - KHÔNG CÓ BẢNG Ở DƯỚI */}
          {filteredSamples.length > 0 ? (
            <KitchenSamplesDayCards
              dayGroups={dayGroups}
              selectedKey=""
              onSelectDay={handleOpenDayDetail}
              totalAll={filteredSamples.length}
              allStored={kpiStats.stored}
              allReady={kpiStats.ready}
              allDisposed={kpiStats.disposed}
            />
          ) : (
            <KitchenSamplesEmptyState
              isFiltered={hasActiveFilters}
              onResetFilters={handleResetFilters}
              onOpenCreateModal={() => setIsCreateOpen(true)}
            />
          )}
        </>
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
