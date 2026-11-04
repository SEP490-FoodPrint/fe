import schoolHttp from "../01_axios"
import { apiGetSchoolOverview } from "./urls"

const SchoolOverviewService = {
  getOverview: () => schoolHttp.get(apiGetSchoolOverview),
}

export default SchoolOverviewService
