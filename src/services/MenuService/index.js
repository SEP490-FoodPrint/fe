import http from "../01_axios"
import { displayName } from "src/lib/displayName"
import {
  apiApproveMenu,
  apiGetMenus,
  apiGetMenuApprovalDetail,
  apiRequestMenuRevision,
} from "./urls"

const getApprovalDetail = async menuId => {
  const response = await http.get(apiGetMenuApprovalDetail(menuId))
  return { ...response, data: { ...response.data, title: displayName(response.data.title) } }
}

const getMenus = async () => {
  const items = []
  let page = 1
  let hasNext = false

  do {
    const response = await http.get(apiGetMenus, {
      params: { page, limit: 100 },
    })
    items.push(...(response?.data?.items || []).map(menu => ({ ...menu, title: displayName(menu.title) })))
    hasNext = Boolean(response?.data?.pagination?.hasNext)
    page += 1
  } while (hasNext)

  return items
}

const approveMenu = (menuId, body) => http.post(apiApproveMenu(menuId), body)

const requestRevision = (menuId, body) =>
  http.post(apiRequestMenuRevision(menuId), body)

const MenuService = { getMenus, getApprovalDetail, approveMenu, requestRevision }

export default MenuService
