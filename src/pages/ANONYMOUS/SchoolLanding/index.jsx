import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SchoolService from "src/services/SchoolService";
import SchoolHeader from "./component/SchoolHeader";
import SchoolHero from "./component/SchoolHero";
import QuickStatsStrip from "./component/QuickStatsStrip";
import DailyMealSection from "./component/DailyMealSection";
import WeeklyMenuSection from "./component/WeeklyMenuSection";
import SchoolFooter from "./component/SchoolFooter";
import AllergyNoticeModal from "./component/AllergyNoticeModal";
import "./style.scss";

function SchoolLanding() {
  const { schoolCode } = useParams();
  const activeCode = (schoolCode || "SCH_ANH_DUONG").toUpperCase();

  const [school, setSchool] = useState(null);
  const [dailyMeal, setDailyMeal] = useState(null);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Nạp song song và độc lập thông tin trường, thực đơn ngày và thực đơn tuần
        const [schoolResult, dailyResult, weeklyResult] =
          await Promise.allSettled([
            SchoolService.getSchoolDetailByCode(activeCode),
            SchoolService.getDailyMealMenu(activeCode),
            SchoolService.getWeeklyMenu(activeCode),
          ]);

        if (isMounted) {
          // Xử lý thông tin chi tiết trường
          if (schoolResult.status === "fulfilled" && schoolResult.value) {
            const res = schoolResult.value;
            const schoolData =
              res?.data &&
              typeof res.data === "object" &&
              !Array.isArray(res.data) &&
              (res.data.id || res.data.code || res.data.name)
                ? res.data
                : res?.data?.data || res;
            setSchool(schoolData);
          } else if (schoolResult.status === "rejected") {
            console.error(
              "Lỗi khi tải chi tiết trường học:",
              schoolResult.reason,
            );
          }

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
        console.error("Lỗi khi tải dữ liệu trang trường:", err);
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

  const handleWeekChange = async (offset, groupId) => {
    try {
      const target = new Date();
      target.setDate(target.getDate() + offset * 7);
      const targetDateStr = target.toISOString().slice(0, 10);
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

  const handleGroupChange = async (groupId, offset = 0) => {
    try {
      const target = new Date();
      if (offset !== 0) {
        target.setDate(target.getDate() + offset * 7);
      }
      const targetDateStr = target.toISOString().slice(0, 10);
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
      {/* 1. School Header cố định trên cùng */}
      <SchoolHeader school={school} />

      {/* 2. Nội dung chính của trang trường */}
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
          onWeekChange={handleWeekChange}
          onGroupChange={handleGroupChange}
        />
      </main>

      {/* 3. Footer của riêng trường */}
      <SchoolFooter school={school} />

      {/* 4. Modal báo dị ứng món ăn */}
      <AllergyNoticeModal
        isOpen={isAllergyModalOpen}
        onClose={() => setIsAllergyModalOpen(false)}
        schoolName={school?.name}
      />
    </div>
  );
}

export default SchoolLanding;
