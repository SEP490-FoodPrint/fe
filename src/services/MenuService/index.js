import http from "../01_axios"
import {
  apiApproveMenu,
  apiGetMenuApprovalDetail,
  apiRequestMenuRevision,
} from "./urls"
import { MOCK_MENU_APPROVAL } from "./mockData"

const useMock = import.meta.env.VITE_USE_MOCK === "true"
const wait = duration => new Promise(resolve => setTimeout(resolve, duration))
const cloneMock = () => JSON.parse(JSON.stringify(MOCK_MENU_APPROVAL))

const getApprovalDetail = async menuId => {
  if (useMock) {
    await wait(280)
    return { success: true, data: cloneMock() }
  }
  return http.get(apiGetMenuApprovalDetail(menuId))
}

const approveMenu = async (menuId, body) => {
  if (useMock) {
    await wait(420)
    return { success: true, data: { id: menuId, status: "APPROVED", ...body } }
  }
  return http.post(apiApproveMenu(menuId), body)
}

const requestRevision = async (menuId, body) => {
  if (useMock) {
    await wait(420)
    return { success: true, data: { id: menuId, status: "REVISION_REQUESTED", ...body } }
  }
  return http.post(apiRequestMenuRevision(menuId), body)
}

const MenuService = { getApprovalDetail, approveMenu, requestRevision }

export default MenuService
