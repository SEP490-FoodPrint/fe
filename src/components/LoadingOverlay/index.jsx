import React from "react"
import PropTypes from "prop-types"
import FoodPrintLoading from "../FoodPrintLoading"

export default function LoadingOverlay({
  isOverlay,
  isLoadingTable,
  sizeSmall,
}) {
  return (
    <FoodPrintLoading
      size={sizeSmall ? "small" : "medium"}
      fullscreen={isOverlay}
      background={isLoadingTable ? "transparent" : isOverlay ? "white" : "transparent"}
    />
  )
}

LoadingOverlay.propTypes = {
  isOverlay: PropTypes.bool,
  isLoadingTable: PropTypes.bool,
  sizeSmall: PropTypes.bool,
}

LoadingOverlay.defaultProps = {
  isOverlay: false,
  isLoadingTable: false,
  sizeSmall: false,
}
