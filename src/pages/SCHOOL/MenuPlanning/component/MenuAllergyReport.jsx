import React from "react"
import InlineError from "src/components/InlineError"

// Chỉ hiện một dòng cảnh báo khi còn xung đột dị ứng chưa bố trí suất riêng.
export default function MenuAllergyReport({ report }) {
  if (!report?.hasUnresolvedAllergies) return null
  const unresolved = (report.allergyChecks || [])
    .filter((check) => check.hasConflict)
    .flatMap((check) => check.conflicts || [])
    .filter((conflict) => !conflict.coveredBySeparateGroup).length
  return (
    <InlineError
      messages={
        unresolved > 0
          ? `Còn ${unresolved} nguyên liệu trùng dị ứng chưa bố trí suất riêng. Mở từng ngày để xử lý trước khi gửi duyệt.`
          : "Cần hoàn thiện phương án dị ứng trước khi gửi duyệt."
      }
    />
  )
}
