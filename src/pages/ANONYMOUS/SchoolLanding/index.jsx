import React, { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import SchoolService from "src/services/SchoolService";
import SchoolHero from "./component/SchoolHero";
import QuickStatsStrip from "./component/QuickStatsStrip";
import DailyMealSection from "./component/DailyMealSection";
import WeeklyMenuSection from "./component/WeeklyMenuSection";
import AllergyNoticeModal from "./component/AllergyNoticeModal";
import "./style.scss";

function SchoolLanding() {
  const { schoolCode } = useParams();
  const outletContext = useOutletContext() || {};
  const school = outletContext.school || null;
  const activeCode = (outletContext.schoolCode || schoolCode || school?.code || "SCH_ANH_DUONG").toUpperCase();

  const [dailyMeal, setDailyMeal] = useState(null);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Nạp song song thực đơn ngày và thực đơn tuần
        const [dailyResult, weeklyResult] = await Promise.allSettled([
          SchoolService.getDailyMealMenu(activeCode),
          SchoolService.getWeeklyMenu(activeCode),
        ]);

        if (isMounted) {
          // Xử lý thực đơn ngày
          if (dailyResult.status === "fulfilled" && dailyResult.value) {
            const rawDaily = dailyResult.value;
            const dailyData =
              rawDaily?.data && !rawDaily.data.data
                ? rawDaily.data
                : rawDaily?.data?.data || rawDaily;
            setDailyMeal(dailyData || null);
          }

          // Xử lý thực đơn tuần
          if (weeklyResult.status === "fulfilled" && weeklyResult.value) {
            const rawWeekly = weeklyResult.value;
            const weeklyData =
              rawWeekly?.data && !rawWeekly.data.data
                ? rawWeekly.data
                : rawWeekly?.data?.data || rawWeekly;
            setWeeklyMenu(weeklyData || null);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thực đơn trang trường:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    // Scroll to top on page or school code change
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [activeCode]);

  const handleWeekChange = async (weekValue, groupId) => {
    try {
      let targetDateStr;
      if (typeof weekValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(weekValue)) {
        targetDateStr = weekValue;
      } else {
        const offset = Number(weekValue) || 0;
        const target = new Date();
        target.setDate(target.getDate() + offset * 7);
        targetDateStr = target.toISOString().slice(0, 10);
      }
      const res = await SchoolService.getWeeklyMenu(
        activeCode,
        targetDateStr,
        groupId,
      );
      const data =
        res?.data && !res.data.data ? res.data : res?.data?.data || res;
      setWeeklyMenu(data || null);
    } catch (err) {
      console.error("Lỗi khi chuyển đổi tuần:", err);
    }
  };

  const handleGroupChange = async (groupId, weekValue) => {
    try {
      let targetDateStr;
      if (typeof weekValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(weekValue)) {
        targetDateStr = weekValue;
      } else {
        const offset = Number(weekValue) || 0;
        const target = new Date();
        if (offset !== 0) {
          target.setDate(target.getDate() + offset * 7);
        }
        targetDateStr = target.toISOString().slice(0, 10);
      }
      const res = await SchoolService.getWeeklyMenu(
        activeCode,
        targetDateStr,
        groupId,
      );
      const data =
        res?.data && !res.data.data ? res.data : res?.data?.data || res;
      setWeeklyMenu(data || null);
    } catch (err) {
      console.error("Lỗi khi chuyển đổi nhóm bán trú:", err);
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
          onOpenAllergyModal={() => setIsAllergyModalOpen(true)}
        />

        {/* Thực đơn bán trú theo tuần */}
        <WeeklyMenuSection
          weeklyMenu={weeklyMenu}
          schoolCode={activeCode}
          onWeekChange={handleWeekChange}
          onGroupChange={handleGroupChange}
        />
      </main>

      {/* Modal báo dị ứng món ăn */}
      <AllergyNoticeModal
        isOpen={isAllergyModalOpen}
        onClose={() => setIsAllergyModalOpen(false)}
        schoolName={school?.name}
      />
    </div>
  );
}

export default SchoolLanding;
