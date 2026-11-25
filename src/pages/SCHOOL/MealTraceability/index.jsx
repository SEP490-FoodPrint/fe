import React, { useState, useEffect, useMemo } from "react"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Share2, Check, AlertCircle } from "lucide-react"
import styles from "./index.module.scss"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import TraceabilityService from "src/services/TraceabilityService"

import TraceabilityHero from "./component/TraceabilityHero"
import TraceabilityMenuDishes from "./component/TraceabilityMenuDishes"
import TraceabilityTimeline from "./component/TraceabilityTimeline"
import TraceabilityIngredientsFlow from "./component/TraceabilityIngredientsFlow"
import TraceabilityFoodSafety from "./component/TraceabilityFoodSafety"
import TraceabilityBlockchainCard from "./component/TraceabilityBlockchainCard"
import {
  buildBlockchainSteps,
  chainVerdict,
} from "./component/traceabilityBlockchainAdapter"

/**
 * Truy xuất chung một bữa của cả khối (mọi lớp trong khối). `dishId` trên URL
 * chọn sẵn món được bấm từ Chi tiết thực đơn; đổi món sẽ cập nhật URL.
 */
export default function MealTraceability() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { schoolCode } = useParams()
  const navigate = useNavigate()

  const gradeId = searchParams.get("gradeId")
  const dateParam = searchParams.get("date")
  const mealTypeParam = searchParams.get("mealType")
  const dishIdParam = searchParams.get("dishId")

  const [loading, setLoading] = useState(true)
  const [traceData, setTraceData] = useState(null)
  const [error, setError] = useState(null)
  const [toastMsg, setToastMsg] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  // true khi blockchainProof hiện tại là kết quả của lần gọi verify=true
  const [isChecked, setIsChecked] = useState(false)

  const showToast = msg => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }

  const queryParams = useMemo(
    () => ({
      gradeId: gradeId || undefined,
      date: dateParam || undefined,
      mealType: mealTypeParam || undefined,
      schoolCode: schoolCode || undefined,
    }),
    [gradeId, dateParam, mealTypeParam, schoolCode],
  )

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    const fetchTraceability = async () => {
      setLoading(true)
      setError(null)
      setIsChecked(false)
      if (!queryParams.gradeId || !queryParams.date || !queryParams.mealType) {
        setError({
          title: "Thiếu thông tin tra cứu",
          message:
            "Thiếu khối, ngày hoặc bữa. Mở lại từ Chi tiết thực đơn.",
        })
        setTraceData(null)
        setLoading(false)
        return
      }
      try {
        const data = await TraceabilityService.getGradeMealTraceability(
          queryParams,
          controller.signal,
        )
        if (!mounted) return
        if (data && !data.isNotFound) {
          setTraceData(data)
        } else {
          setError({
            title: "Chưa có thông tin truy xuất",
            message:
              data?.message ||
              "Chưa có dữ liệu cho bữa này. Chọn ngày khác.",
          })
          setTraceData(null)
        }
      } catch (err) {
        if (!mounted || err?.name === "CanceledError") return
        setError({
          title: "Không thể tải dữ liệu truy xuất",
          message:
            err.response?.data?.message ||
            err.message ||
            "Không kết nối được máy chủ truy xuất nguồn gốc. Vui lòng thử lại sau.",
        })
        setTraceData(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchTraceability()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [queryParams])

  const dishes = useMemo(
    () => (Array.isArray(traceData?.dishes) ? traceData.dishes : []),
    [traceData],
  )

  // Món đang xem: món trên URL nếu có trong bữa, không thì món đầu tiên.
  const activeDish = useMemo(
    () => dishes.find(d => d.dishId === dishIdParam) || dishes[0] || null,
    [dishes, dishIdParam],
  )

  const handleSelectDish = id => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.set("dishId", id)
        return next
      },
      { replace: true },
    )
  }

  const blockchainSteps = useMemo(
    () => buildBlockchainSteps(traceData, activeDish),
    [traceData, activeDish],
  )

  const verdict = useMemo(
    () =>
      traceData?.blockchainProof
        ? chainVerdict(traceData.blockchainProof, isChecked)
        : isChecked
          ? "INCOMPLETE"
          : "UNCHECKED",
    [traceData, isChecked],
  )

  // Đối soát on-chain qua chính API truy xuất (verify=true). Không bao giờ
  // tự đánh dấu "đã xác thực" khi API lỗi hoặc không trả về chuỗi bằng chứng.
  const handleVerifyBlockchain = async () => {
    if (isVerifying) return
    setIsVerifying(true)
    try {
      const data =
        await TraceabilityService.verifyGradeMealTraceability(queryParams)
      if (!data || data.isNotFound) {
        showToast("Chưa có dữ liệu bữa ăn để kiểm tra.")
        return
      }
      setTraceData(data)
      setIsChecked(true)
      showToast(
        data.blockchainProof
          ? "Đã kiểm tra xong dữ liệu truy xuất"
          : "Chưa kiểm tra được dữ liệu. Vui lòng thử lại.",
      )
    } catch {
      showToast("Chưa kiểm tra được dữ liệu. Vui lòng thử lại.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast("Đã sao chép liên kết")
    } else {
      showToast("Không sao chép được. Hãy chép từ thanh địa chỉ.")
    }
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingBox}>
          <FoodPrintLoading />
          <p style={{ marginTop: "16px" }}>
            Đang tải thông tin truy xuất của khối...
          </p>
        </div>
      </div>
    )
  }

  if (error || !traceData) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.errorBox}>
            <AlertCircle
              size={44}
              style={{
                margin: "0 auto 12px auto",
                color: "var(--color-warning)",
              }}
            />
            <h3>{error?.title || "Chưa có thông tin truy xuất"}</h3>
            <p
              style={{
                maxWidth: "540px",
                margin: "8px auto 24px auto",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {error?.message ||
                "Khối chưa có bữa ăn được phân bổ vào ngày và bữa đã chọn."}
            </p>
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
    )
  }

  return (
    <div className={styles.pageContainer}>
      {toastMsg && (
        <div className={styles.toastNotice}>
          <Check size={18} color="var(--green-300)" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className={styles.contentWrapper}>
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

        {/* 1. Giới thiệu chung: trường, khối, ngày, bữa */}
        <TraceabilityHero data={traceData} />

        {/* 2. Món trong bữa: chọn sẵn món được bấm, đổi món để truy xuất tiếp */}
        {dishes.length > 0 && (
          <TraceabilityMenuDishes
            dishes={dishes}
            activeDishId={activeDish?.dishId}
            onSelectDish={handleSelectDish}
          />
        )}

        {/* 3. Quy trình phục vụ: tiếp nhận → chuẩn bị → lưu mẫu → giao */}
        <TraceabilityTimeline meal={traceData.meal} dish={activeDish} />

        {/* 4. Nguồn gốc nguyên liệu: nhà cung cấp, đơn giao, blockchain */}
        {activeDish && (
          <TraceabilityIngredientsFlow
            dish={activeDish}
            proofNodes={traceData.blockchainProof?.nodes}
          />
        )}

        {/* 5. An toàn thực phẩm: mẫu lưu */}
        {activeDish && <TraceabilityFoodSafety dish={activeDish} />}

        {/* 6. Xác thực blockchain 5 chặng */}
        <TraceabilityBlockchainCard
          steps={blockchainSteps}
          verdict={verdict}
          errorMessage={traceData.blockchainProofError || null}
          isVerifying={isVerifying}
          onVerify={handleVerifyBlockchain}
        />
      </div>
    </div>
  )
}
