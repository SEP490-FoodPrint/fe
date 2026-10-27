import React from "react"
import { useLocation } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import FeatureOverview from "./component/FeatureOverview"

const FEATURE_CONFIG = {
  [ROUTER.SCHOOL_SUPPLIERS]: {
    title: "Nhà cung cấp",
    description: "Theo dõi hồ sơ, chứng nhận và tình trạng hợp tác của các nhà cung cấp thực phẩm.",
    type: "supplier",
  },
  [ROUTER.SCHOOL_FOOD_SAFETY]: {
    title: "An toàn thực phẩm",
    description: "Giám sát kiểm thực, lưu mẫu và các cảnh báo an toàn thực phẩm trong nhà trường.",
    type: "safety",
  },
  [ROUTER.SCHOOL_TRACEABILITY]: {
    title: "Truy xuất nguồn gốc",
    description: "Truy xuất chuỗi cung ứng từ suất ăn, mẻ nấu, lô nguyên liệu đến nhà cung cấp.",
    type: "traceability",
  },
  [ROUTER.SCHOOL_REPORTS]: {
    title: "Báo cáo & thống kê",
    description: "Tổng hợp báo cáo thực đơn, suất ăn, nhà cung cấp và tình hình an toàn thực phẩm.",
    type: "report",
  },
  [ROUTER.SCHOOL_NOTIFICATIONS]: {
    title: "Thông báo",
    description: "Tiếp nhận thông báo phê duyệt, cảnh báo an toàn và cập nhật vận hành bếp ăn.",
    type: "notification",
  },
}

function ManagementFeature() {
  const { pathname } = useLocation()
  const feature = FEATURE_CONFIG[pathname] || FEATURE_CONFIG[ROUTER.SCHOOL_REPORTS]
  return <FeatureOverview {...feature} />
}

export default ManagementFeature
