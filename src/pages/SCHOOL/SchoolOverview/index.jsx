import React, { useState } from "react"
import OverviewHeader from "./component/OverviewHeader"
import KpiGrid from "./component/KpiGrid"
import AnalyticsGrid from "./component/AnalyticsGrid"
import AttentionPanel from "./component/AttentionPanel"
import "./style.scss"

const kpis = [
  { type: "menu", label: "Thực đơn chờ duyệt", value: 3, unit: "bản", note: "Cần xử lý trong tuần", trend: "+1 so với tuần trước" },
  { type: "complaint", label: "Khiếu nại chưa giải quyết", value: 8, unit: "phản ánh", note: "2 trường hợp khẩn cấp", trend: "Thời hạn dưới 24 giờ" },
  { type: "supplier", label: "Nhà cung cấp liên kết", value: 16, unit: "đối tác", note: "12 đơn vị đạt chuẩn", trend: "Tỷ lệ đạt chuẩn 75%" },
  { type: "safety", label: "Sự cố ATTP đang xử lý", value: 2, unit: "nghi vụ", note: "Đang thanh tra độc lập", trend: "Giảm 33% trong tháng" },
]

function SchoolOverview() {
  const [period, setPeriod] = useState("30")

  return (
    <div className="schoolOverviewPage">
      <OverviewHeader period={period} onPeriodChange={setPeriod} />
      <KpiGrid items={kpis} />
      <AnalyticsGrid period={period} />
      <AttentionPanel />
    </div>
  )
}

export default SchoolOverview
