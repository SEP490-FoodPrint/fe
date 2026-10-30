import React from "react"
import OverviewHeader from "./component/OverviewHeader"
import OverviewEmptyState from "./component/OverviewEmptyState"
import "./style.scss"

function SchoolOverview() {
  return (
    <div className="schoolOverviewPage">
      <OverviewHeader />
      <OverviewEmptyState />
    </div>
  )
}

export default SchoolOverview
