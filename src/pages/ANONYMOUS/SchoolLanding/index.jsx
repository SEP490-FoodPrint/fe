import React, { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import SchoolService from "src/services/SchoolService";
import { getPublicMealData } from "src/utils/publicMeal";
import { resolveWeekStartDate } from "src/utils/weeklyMenu";
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

  // Khi vào trang hoặc đổi trường, tải thực đơn ngày và tuần cho trường đang xem.
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Hiển thị phần tải thành công kể cả khi request còn lại lỗi.
        const [dailyResult, weeklyResult] = await Promise.allSettled([
          SchoolService.getDailyMealMenu(activeCode),
          SchoolService.getWeeklyMenu(activeCode),
        ]);

        if (isMounted) {
          // Xử lý thực đơn ngày
          if (dailyResult.status === "fulfilled" && dailyResult.value) {
            setDailyMeal(getPublicMealData(dailyResult.value));
          }

          // Xử lý thực đơn tuần
          if (weeklyResult.status === "fulfilled" && weeklyResult.value) {
            setWeeklyMenu(getPublicMealData(weeklyResult.value));
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

  // Hai thao tác của WeeklyMenuSection chỉ tải lại phần thực đơn tuần.
  const handleWeekChange = (weekValue, groupId) =>
    loadWeeklyMenu(weekValue, groupId, "Lỗi khi chuyển đổi tuần:");

  const handleGroupChange = (groupId, weekValue) =>
    loadWeeklyMenu(weekValue, groupId, "Lỗi khi chuyển đổi nhóm bán trú:");

  const loadWeeklyMenu = async (weekValue, groupId, errorMessage) => {
    try {
      const res = await SchoolService.getWeeklyMenu(
        activeCode,
        resolveWeekStartDate(weekValue),
        groupId,
      );
      setWeeklyMenu(getPublicMealData(res));
    } catch (err) {
      console.error(errorMessage, err);
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
