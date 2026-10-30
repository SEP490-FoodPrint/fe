import http from "../01_axios"
import {
  apiApproveMenu,
  apiGetMenuApprovalDetail,
  apiRequestMenuRevision,
} from "./urls"

const getApprovalDetail = menuId => http.get(apiGetMenuApprovalDetail(menuId))

const approveMenu = (menuId, body) => http.post(apiApproveMenu(menuId), body)

const requestRevision = (menuId, body) =>
  http.post(apiRequestMenuRevision(menuId), body)

const MenuService = { getApprovalDetail, approveMenu, requestRevision }

export default MenuService
