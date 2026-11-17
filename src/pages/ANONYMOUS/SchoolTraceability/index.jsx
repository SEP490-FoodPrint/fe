import React, { useCallback } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import BlockchainProofService from "src/services/BlockchainProofService"
import TraceabilityView from "src/components/Traceability/TraceabilityView"
import "./style.scss"

/**
 * Public journey of a school's meals: anyone can see where a grade's meal came from and check it
 * against the blockchain. Plates, slip and batch codes are left out by the API.
 */
export default function SchoolTraceability() {
  const { schoolCode: routeCode } = useParams()
  const { school } = useOutletContext() || {}
  const schoolCode = school?.code || routeCode || ""

  const listMeals = useCallback(
    (date, options) => BlockchainProofService.listPublicGradeMeals(schoolCode, date, options),
    [schoolCode],
  )
  const getChain = useCallback(
    (key, options) => BlockchainProofService.getPublicGradeChain(schoolCode, key, options),
    [schoolCode],
  )

  return (
    <div className="schoolTraceabilityPage">
      <TraceabilityView
        listMeals={listMeals}
        getChain={getChain}
        title="Truy xuất nguồn gốc bữa ăn"
        lead={`Chọn ngày và khối để xem bữa ăn${school?.name ? ` của ${school.name}` : ""} đi từ nhà cung cấp, qua kiểm nhận, bếp nấu, lưu mẫu tới từng khối. Mỗi bước được niêm phong trên blockchain; bấm “Kiểm tra toàn vẹn” để tự đối chiếu.`}
      />
    </div>
  )
}
