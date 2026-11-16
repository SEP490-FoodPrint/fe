import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Check, AlertCircle } from "lucide-react";
import styles from "./index.module.scss";
import ROUTER from "src/router/ROUTER";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import TraceabilityService from "src/services/TraceabilityService";

import TraceabilityHero from "./component/TraceabilityHero";
import TraceabilityMenuDishes from "./component/TraceabilityMenuDishes";
import TraceabilityTimeline from "./component/TraceabilityTimeline";
import TraceabilityCookingBatches from "./component/TraceabilityCookingBatches";
import TraceabilityIngredientsFlow from "./component/TraceabilityIngredientsFlow";
import TraceabilityFoodSafety from "./component/TraceabilityFoodSafety";
import TraceabilityBlockchainCard from "./component/TraceabilityBlockchainCard";

export default function MealTraceability() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const classId = searchParams.get("classId");
  const classNameParam = searchParams.get("className");
  const dateParam = searchParams.get("date");
  const mealTypeParam = searchParams.get("mealType");

  const [loading, setLoading] = useState(true);
  const [traceData, setTraceData] = useState(null);
  const [error, setError] = useState(null);
  const [activeDishId, setActiveDishId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    let mounted = true;
    const fetchTraceability = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await TraceabilityService.getMealTraceability({
          classId: classId || undefined,
          date: dateParam || undefined,
          mealType: mealTypeParam || undefined,
        });

        if (mounted) {
          if (data && !data.isNotFound) {
            // Override class name if passed from filter modal
            if (classNameParam && data.classInfo) {
              data.classInfo.name = decodeURIComponent(classNameParam);
            }
            setTraceData(data);
            if (data.dishes && data.dishes.length > 0) {
              setActiveDishId(data.dishes[0].dishId);
            }
          } else {
            setError({
              title: "Không có thông tin truy xuất nguồn gốc",
              message:
                data?.message ||
                "Chưa có dữ liệu phân bổ mẻ nấu và suất ăn cho lớp học này vào ngày đã chọn trên hệ thống. Vui lòng kiểm tra lại ngày phục vụ hoặc liên hệ nhà trường.",
            });
            setTraceData(null);
          }
        }
      } catch (err) {
        if (mounted) {
          setError({
            title: "Không thể tải dữ liệu truy xuất",
            message:
              err.response?.data?.message ||
              err.message ||
              "Không thể kết nối đến máy chủ truy xuất nguồn gốc. Vui lòng kiểm tra lại dịch vụ Backend.",
          });
          setTraceData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTraceability();

    return () => {
      mounted = false;
    };
  }, [classId, classNameParam, dateParam, mealTypeParam]);

  const activeDish = useMemo(() => {
    if (!traceData?.dishes || !activeDishId) return null;
    return (
      traceData.dishes.find((d) => d.dishId === activeDishId) ||
      traceData.dishes[0] ||
      null
    );
  }, [traceData, activeDishId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép liên kết truy xuất nguồn gốc!");
    } else {
      showToast("Liên kết trang truy xuất: " + window.location.href);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingBox}>
          <FoodPrintLoading />
          <p style={{ marginTop: "16px" }}>Đang tải chuỗi cung ứng truy xuất nguồn gốc...</p>
        </div>
      </div>
    );
  }

  if (error || !traceData) {
    const title = error?.title || "Không có thông tin truy xuất nguồn gốc";
    const message =
      error?.message ||
      "Chưa có dữ liệu phân bổ mẻ nấu và suất ăn cho lớp học này vào ngày đã chọn trên hệ thống.";
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.errorBox}>
            <AlertCircle
              size={44}
              style={{
                margin: "0 auto 12px auto",
                color: "var(--color-warning, #f59e0b)",
              }}
            />
            <h3>{title}</h3>
            <p
              style={{
                maxWidth: "540px",
                margin: "8px auto 24px auto",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className={styles.btnBack}
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} /> Quay lại thực đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {toastMsg && (
        <div className={styles.toastNotice}>
          <Check size={18} color="#4ade80" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Top bar with back and share */}
        <div className={styles.topBarActions}>
          <button
            type="button"
            className={styles.btnBack}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Quay lại chi tiết thực đơn
          </button>

          <button
            type="button"
            className={styles.btnShare}
            onClick={handleShare}
          >
            <Share2 size={16} /> Chia sẻ liên kết
          </button>
        </div>

        {/* Section 1: Hero Info & QR Code */}
        <TraceabilityHero data={traceData} />

        {/* Section 2: Menu Dishes & Tabs Switcher */}
        {Array.isArray(traceData?.dishes) && traceData.dishes.length > 0 && (
          <TraceabilityMenuDishes
            dishes={traceData.dishes}
            activeDishId={activeDishId}
            onSelectDish={(id) => setActiveDishId(id)}
          />
        )}

        {/* Section 3: Process Timeline */}
        <TraceabilityTimeline
          allocation={traceData?.allocation}
          classInfo={traceData?.classInfo}
        />

        {/* Section 4: Cooking Batches of Selected Dish */}
        {activeDish && (
          <TraceabilityCookingBatches
            dish={activeDish}
            totalAllocationPortions={traceData.allocation?.totalPortions || 30}
          />
        )}

        {/* Section 5: Ingredients Supply Chain of Selected Dish */}
        {activeDish && <TraceabilityIngredientsFlow dish={activeDish} />}

        {/* Section 6: Food Safety & Retained Samples */}
        {activeDish && <TraceabilityFoodSafety dish={activeDish} />}

        {/* Section 7: Blockchain Card (Empty State / Pending Verification) */}
        <TraceabilityBlockchainCard proof={traceData.blockchainProof} />
      </div>
    </div>
  );
}
