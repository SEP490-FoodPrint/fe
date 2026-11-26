import React, { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import SchoolService from "src/services/SchoolService";
import {
  getPublicMealData,
  isPublicMealError,
  pickDefaultGradeId,
} from "src/utils/publicMeal";
import { resolveWeekStartDate } from "src/utils/weeklyMenu";
import SchoolHero from "./component/SchoolHero";
import QuickStatsStrip from "./component/QuickStatsStrip";
import DailyMealSection from "./component/DailyMealSection";
import WeeklyMenuSection from "./component/WeeklyMenuSection";
import SchoolSuppliersSection from "./component/SchoolSuppliersSection";
import "./style.scss";

function SchoolLanding() {
  const { schoolCode } = useParams();
  const outletContext = useOutletContext() || {};
  const school = outletContext.school || null;
  // Không đoán mã trường mặc định: thiếu mã thì không tải dữ liệu.
  const activeCode = (outletContext.schoolCode || schoolCode || school?.code || "").toUpperCase();

  const [dailyMeal, setDailyMeal] = useState(null);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [weeklyMenuError, setWeeklyMenuError] = useState(false);
  const [schoolGrades, setSchoolGrades] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [, setLoading] = useState(true);

  // Tên khối đang chọn, lấy từ danh mục khối gốc của trường
  const selectedGradeName = React.useMemo(() => {
    if (!selectedGradeId) return "";
    const found = schoolGrades.find((g) => g.id === selectedGradeId);
    return found?.name || "";
  }, [selectedGradeId, schoolGrades]);

  const applyWeeklyResponse = (res) => {
    setWeeklyMenuError(isPublicMealError(res));
    setWeeklyMenu(getPublicMealData(res));
  };

  // Khi vào trang hoặc đổi trường: tải danh sách khối trước, chọn khối đầu tiên có thực đơn,
  // rồi tải thực đơn ngày và tuần theo khối đó. Khối không có thực đơn riêng sẽ
  // nhận thực đơn toàn trường (BE lọc theo khối hoặc isSchoolWide).
  useEffect(() => {
    let isMounted = true;
    if (!activeCode) return undefined;

    const loadData = async () => {
      try {
        setLoading(true);

        let grades = [];
        try {
          const gradesRes = await SchoolService.getSchoolGrades(activeCode);
          const gradesData = gradesRes?.data?.data || gradesRes?.data || [];
          grades = Array.isArray(gradesData) ? gradesData : [];
        } catch (err) {
          console.error("Lỗi khi tải danh sách khối:", err);
        }
        if (!isMounted) return;
        setSchoolGrades(grades);
        const firstGradeId = pickDefaultGradeId(grades);
        setSelectedGradeId(firstGradeId);
        const gradeQuery = firstGradeId || undefined;

        const [dailyResult, weeklyResult, suppliersResult] = await Promise.allSettled([
          SchoolService.getDailyMealMenu(activeCode, undefined, gradeQuery),
          SchoolService.getWeeklyMenu(activeCode, undefined, gradeQuery),
          SchoolService.getSchoolSuppliers(activeCode),
        ]);

        if (isMounted) {
          // Xử lý thực đơn ngày
          if (dailyResult.status === "fulfilled" && dailyResult.value) {
            setDailyMeal(getPublicMealData(dailyResult.value));
          } else {
            setDailyMeal(null);
          }

          // Xử lý thực đơn tuần (lỗi menu không ảnh hưởng danh sách khối)
          if (weeklyResult.status === "fulfilled") {
            applyWeeklyResponse(weeklyResult.value);
          } else {
            setWeeklyMenu(null);
            setWeeklyMenuError(true);
          }

          // Xử lý danh sách nhà cung cấp liên kết
          if (suppliersResult.status === "fulfilled" && suppliersResult.value) {
            const raw = suppliersResult.value;
            const supData =
              raw?.data?.data ||
              raw?.data ||
              (Array.isArray(raw) ? raw : []);
            setSuppliers(Array.isArray(supData) ? supData : []);
          } else {
            setSuppliers([]);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thực đơn trang trường:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    // Đưa người dùng về phần giới thiệu khi chuyển sang trường khác.
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [activeCode]);

  // Đổi tuần giữ nguyên khối đang chọn
  const handleWeekChange = (weekValue, groupId) => {
    const activeGroup = groupId || selectedGradeId;
    loadWeeklyMenu(weekValue, activeGroup, "Lỗi khi chuyển đổi tuần:");
  };

  // Đổi khối: cập nhật đồng bộ cả thực đơn ngày và thực đơn tuần theo id khối
  const handleGradeChange = async (groupId, weekValue) => {
    setSelectedGradeId(groupId);
    loadWeeklyMenu(weekValue, groupId, "Lỗi khi chuyển đổi khối tuần:");
    try {
      const res = await SchoolService.getDailyMealMenu(activeCode, undefined, groupId);
      setDailyMeal(getPublicMealData(res));
    } catch (err) {
      console.error("Lỗi khi lọc thực đơn ngày theo khối:", err);
      setDailyMeal(null);
    }
  };

  const loadWeeklyMenu = async (weekValue, groupId, errorMessage) => {
    try {
      const res = await SchoolService.getWeeklyMenu(
        activeCode,
        resolveWeekStartDate(weekValue),
        groupId,
      );
      applyWeeklyResponse(res);
    } catch (err) {
      console.error(errorMessage, err);
      setWeeklyMenu(null);
      setWeeklyMenuError(true);
    }
  };

  return (
    <div className="school-landing-wrapper">
      <main className="school-landing-main">
        {/* Banner giới thiệu trường */}
        <SchoolHero school={school} />

        {/* 3 khối giá trị cốt lõi */}
        <QuickStatsStrip />

        {/* Thực đơn hôm nay */}
        <DailyMealSection
          dailyMeal={dailyMeal}
          selectedGradeName={selectedGradeName}
        />

        {/* Thực đơn bán trú theo tuần */}
        <WeeklyMenuSection
          weeklyMenu={weeklyMenu}
          schoolCode={activeCode}
          schoolGrades={schoolGrades}
          selectedGradeId={selectedGradeId}
          selectedGradeName={selectedGradeName}
          menuError={weeklyMenuError}
          onWeekChange={handleWeekChange}
          onGroupChange={handleGradeChange}
        />

        {/* Nhà cung cấp nguyên liệu liên kết */}
        <SchoolSuppliersSection
          suppliers={suppliers}
          schoolName={school?.name}
        />
      </main>
    </div>
  );
}

export default SchoolLanding;
