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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Nạp song song thông tin trường, thực đơn ngày và thực đơn tuần
        const [schoolRes, dailyRes, weeklyRes] = await Promise.all([
          SchoolService.getSchoolDetailByCode(activeCode),
          SchoolService.getDailyMealMenu(activeCode),
          SchoolService.getWeeklyMenu(activeCode),
        ]);

        if (isMounted) {
          const schoolData = schoolRes?.data;

          setSchool(schoolData);
          setDailyMeal(dailyRes?.data || null);
          setWeeklyMenu(weeklyRes?.data || null);
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
        <WeeklyMenuSection weeklyMenu={weeklyMenu} />
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
