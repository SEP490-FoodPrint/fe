import schoolHttp from "../01_axios"

const SchoolOverviewService = {
  getOverview: () => schoolHttp.get("/school-overview"),
}

export default SchoolOverviewService
