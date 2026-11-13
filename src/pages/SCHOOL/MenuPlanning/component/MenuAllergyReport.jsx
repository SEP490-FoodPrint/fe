import React from "react"

export default function MenuAllergyReport({ report }) {
  if (!report) return null
  const checks = report.allergyChecks?.filter(check=>check.hasConflict) || []
  return <section role="status" aria-label="Kết quả đối soát dị ứng" style={{border:"1px solid #d97706",borderRadius:8,padding:16,marginBlock:16}}>
    <strong>{report.hasUnresolvedAllergies ? "Đã lưu nháp — cần hoàn thiện phương án dị ứng trước khi gửi duyệt" : "Đã đối chiếu hồ sơ dị ứng của trường"}</strong>
    {!checks.length ? <p>Chưa ghi nhận xung đột với hồ sơ dị ứng đã khai báo.</p> : checks.map(check=><div key={`${check.menuDayId}-${check.mealType}`}>
      <p>{check.menuDate} · {check.mealType==="LUNCH"?"Bữa trưa":"Bữa xế"}</p>
      <ul>{check.conflicts.map(conflict=><li key={conflict.ingredientEntryId}>
        <strong>{conflict.ingredientName}</strong>: {conflict.affectedClasses.map(group=>`${group.className}: ${group.count}`).join("; ")}
        {conflict.coveredBySeparateGroup ? " — Đã bố trí nhóm suất riêng" : " — Chưa bố trí nhóm suất riêng phù hợp"}
      </li>)}</ul>
    </div>)}
  </section>
}
