import React from "react"
import BlockchainProofService from "src/services/BlockchainProofService"
import TraceabilityView from "src/components/Traceability/TraceabilityView"

/** Staff view: any grade meal of the school, with checks saved for later review. */
export default function Traceability() {
  return (
    <TraceabilityView
      listMeals={BlockchainProofService.listGradeMeals}
      getChain={BlockchainProofService.getGradeChain}
    />
  )
}
