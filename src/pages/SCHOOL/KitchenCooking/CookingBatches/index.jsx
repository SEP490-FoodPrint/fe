import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button } from "@mui/material";
import { Plus, Clock } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import STORAGE, { getStorage } from "src/lib/storage";
import { StoreContext } from "src/contexts";
import KitchenService from "src/services/KitchenService";
import {
  EMPTY_BATCH_FILTERS,
  COOKING_MODES,
  adaptCookingBatch,
  localDateISO,
  schoolClock,
} from "src/services/KitchenService/adapter";
import {
  getWeeksOfAcademicYear,
} from "src/services/MenuService/adapter";
import CookingBatchesKPI from "./component/CookingBatchesKPI";
import CookingBatchesFilter from "./component/CookingBatchesFilter";
import CookingBatchesTable from "./component/CookingBatchesTable";
import styles from "./index.module.scss";

export default function CookingBatches() {
  const navigate = useNavigate();
  const { userStore } = useContext(StoreContext) || {};
  const user = userStore?.user || getStorage(STORAGE.USER_INFO) || {};
  const schoolId = user.schoolId || user.orgId || user.school_id || "";

  const [school, setSchool] = useState(null);
  const [schoolError, setSchoolError] = useState("");

  const availableAcademicYears = useMemo(() => {
    if (Array.isArray(school?.academicYears) && school.academicYears.length > 0) {
      return school.academicYears;
    }
    return [
      {
        id: "ay-default",
        academicYear: "2026-2027",
        startDate: "2026-09-05",
        endDate: "2027-05-31",
        holidays: [],
      },
    ];
  }, [school?.academicYears]);

  const [filters, setFilters] = useState({
    ...EMPTY_BATCH_FILTERS,
    academicYear: "2026-2027",
    week: "current",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paging, setPaging] = useState({ page: 1, limit: 10 });
  const [refresh, setRefresh] = useState(0);
  const [schoolAttempt, setSchoolAttempt] = useState(0);
  const [listState, setListState] = useState({
    key: "",
    loading: true,
    items: [],
    error: "",
  });
  const [statsState, setStatsState] = useState({
    key: "",
    loading: true,
    value: null,
    error: "",
  });

  // 1. Cấu hình năm học được chọn (ưu tiên năm học đang diễn ra theo ngày hôm nay)
  const currentAcademicYearConfig = useMemo(() => {
    const todayISO = localDateISO();
    const activeYear = availableAcademicYears.find((ay) => {
      if (ay.startDate && ay.endDate) {
        return ay.startDate <= todayISO && todayISO <= ay.endDate;
      }
      return false;
    });
    return (
      activeYear ||
      availableAcademicYears.find(
        (ay) => ay.academicYear === filters.academicYear,
      ) ||
      availableAcademicYears[0]
    );
  }, [availableAcademicYears, filters.academicYear]);

  // 2. Danh sách tuần học thực tế trong năm học theo BGH
  const schoolWeeks = useMemo(() => {
    return getWeeksOfAcademicYear(currentAcademicYearConfig);
  }, [currentAcademicYearConfig]);

  // 3. Tuần hiện tại
  const currentWeekObj = useMemo(() => {
    return schoolWeeks.find((w) => w.isCurrentWeek) || schoolWeeks[0];
  }, [schoolWeeks]);

  // Tự động đồng bộ tuần học và năm học hiện hành khi tải xong cấu hình BGH
  useEffect(() => {
    if (currentWeekObj?.isoWeek && (filters.week === "current" || !filters.week)) {
      setFilters((prev) => ({
        ...prev,
        academicYear: currentAcademicYearConfig?.academicYear || prev.academicYear,
        week: currentWeekObj.isoWeek,
      }));
    }
  }, [currentWeekObj, currentAcademicYearConfig]);

  // 4. Đối tượng tuần đang chọn
  const selectedWeekObj = useMemo(() => {
    if (filters.week === "all") return null;
    if (filters.week === "current" || !filters.week) return currentWeekObj;
    return (
      schoolWeeks.find((w) => w.isoWeek === Number(filters.week)) ||
      currentWeekObj
    );
  }, [schoolWeeks, filters.week, currentWeekObj]);

  // 5. Khoảng ngày tương ứng với tuần đang chọn
  const effectiveDateRange = useMemo(() => {
    if (filters.week === "all") {
      return { startDate: "", endDate: "" };
    }
    if (selectedWeekObj?.startDateISO && selectedWeekObj?.endDateISO) {
      return {
        startDate: selectedWeekObj.startDateISO,
        endDate: selectedWeekObj.endDateISO,
      };
    }
    return { startDate: "", endDate: "" };
  }, [filters.week, selectedWeekObj]);

  // 6. Params chuẩn hóa để gửi tới KitchenService (list & stats)
  const effectiveFilterParams = useMemo(() => {
    const params = {
      search: debouncedSearch || undefined,
      mealType: filters.mealType || undefined,
      status: filters.status || undefined,
      cookingModeApplied: filters.cookingModeApplied || undefined,
    };
    if (effectiveDateRange.startDate && effectiveDateRange.endDate) {
      params.startDate = effectiveDateRange.startDate;
      params.endDate = effectiveDateRange.endDate;
    }
    return params;
  }, [
    debouncedSearch,
    effectiveDateRange,
    filters.mealType,
    filters.status,
    filters.cookingModeApplied,
  ]);

  const scope = `${user.id || ""}:${schoolId || ""}`;
  const statsKey = JSON.stringify({
    scope,
    query: effectiveFilterParams,
  });
  const queryKey = JSON.stringify({
    scope,
    query: { ...effectiveFilterParams, ...paging },
  });
  const searchPending = debouncedSearch !== filters.search.trim();

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search.trim()),
      300,
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setSchool(null);
    setSchoolError("");
    KitchenService.getContext({ signal: controller.signal })
      .then((value) => {
        if (active) setSchool(value);
      })
      .catch((error) => {
        if (active) setSchoolError(error.message || "Không thể tải cấu hình bếp từ máy chủ.");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [schoolAttempt]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const query = JSON.parse(queryKey).query;
    setListState({ key: queryKey, loading: true, items: [], error: "" });
    KitchenService.getBatches(query, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        if (query.page > result.pagination.totalPages) {
          setPaging((current) => ({
            ...current,
            page: result.pagination.totalPages,
          }));
          return;
        }
        setListState({
          key: queryKey,
          loading: false,
          items: result.items,
          pagination: result.pagination,
          error: "",
        });
      })
      .catch((error) => {
        if (active)
          setListState({
            key: queryKey,
            loading: false,
            items: [],
            error: error.message,
          });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [queryKey, refresh]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setStatsState({ key: statsKey, loading: true, value: null, error: "" });
    KitchenService.getStats(JSON.parse(statsKey).query, {
      signal: controller.signal,
    })
      .then((value) => {
        if (active)
          setStatsState({ key: statsKey, loading: false, value, error: "" });
      })
      .catch((error) => {
        if (active)
          setStatsState({
            key: statsKey,
            loading: false,
            value: null,
            error: error.message,
          });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [statsKey, refresh, schoolId]);

  const loading =
    listState.key !== queryKey || listState.loading || searchPending;
  const statsLoading =
    statsState.key !== statsKey || statsState.loading || searchPending;
  const stats = statsState.key === statsKey ? statsState.value : null;
  const rows = useMemo(
    () =>
      listState.key === queryKey ? listState.items.map(adaptCookingBatch) : [],
    [listState, queryKey],
  );
  const pagination =
    listState.key === queryKey && listState.pagination
      ? listState.pagination
      : { ...paging, totalItems: 0, totalPages: 1 };
  const listError = listState.key === queryKey ? listState.error : "";
  const canCreate = Boolean(COOKING_MODES[school?.cookingMode]);
  const isSeparateMode = school?.cookingMode === "SEPARATE_BY_LOT";
  const mealTimes = [
    schoolClock(school?.lunchTime) && `Bữa trưa ${schoolClock(school.lunchTime)}`,
    schoolClock(school?.afternoonMealTime) &&
    `Bữa xế ${schoolClock(school.afternoonMealTime)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const changeFilters = (newFilters) => {
    if (newFilters.academicYear !== filters.academicYear) {
      const nextConfig =
        availableAcademicYears.find(
          (ay) => ay.academicYear === newFilters.academicYear,
        ) || availableAcademicYears[0];
      const nextWeeks = getWeeksOfAcademicYear(nextConfig);
      const nextCurrent =
        nextWeeks.find((w) => w.isCurrentWeek) || nextWeeks[0];
      newFilters.week = nextCurrent ? nextCurrent.isoWeek : "current";
    }
    setFilters(newFilters);
    setPaging((current) => ({ ...current, page: 1 }));
  };

  const reload = () => setRefresh((value) => value + 1);

  const navigateCreate = () => {
    if (canCreate)
      navigate(
        isSeparateMode
          ? ROUTER.SCHOOL_KITCHEN_BATCH_CREATE_SEPARATE
          : ROUTER.SCHOOL_KITCHEN_BATCH_CREATE,
      );
  };

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

      {/* KPI Cards: hiển thị số lượng lô theo tuần (tuần này đã tạo bao nhiêu lô) */}
      <CookingBatchesKPI
        stats={stats}
        loading={statsLoading}
        selectedWeekObj={selectedWeekObj}
        isAllWeeks={filters.week === "all"}
      />

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

      {/* Bộ lọc: Năm học + Tuần học + Bữa ăn + Trạng thái */}
      <CookingBatchesFilter
        filters={filters}
        onChange={changeFilters}
        onRefresh={reload}
        onReset={() => {
          setFilters({
            ...EMPTY_BATCH_FILTERS,
            academicYear: currentAcademicYearConfig?.academicYear || "2026-2027",
            week: currentWeekObj?.isoWeek || "all",
          });
          setPaging((current) => ({ ...current, page: 1 }));
        }}
        academicYearOptions={availableAcademicYears}
        weeks={schoolWeeks}
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
  );
}
