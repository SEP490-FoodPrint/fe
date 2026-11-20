import { HANDLING_TYPE_LABELS } from "src/constants/ui"

/** Nhãn loại nguyên liệu: "Lưu kho" / "Dùng ngay", chưa có thì "Chưa chọn". */
export const handlingText = (value) => HANDLING_TYPE_LABELS[value] || "Chưa chọn"

/** Map ingredientId → handlingType ("" khi chưa chọn) từ các dòng hợp đồng. */
export const toHandlingMap = (items = []) =>
  Object.fromEntries(
    items.map((item) => [item.ingredientId, item.handlingType || ""]),
  )

/** Các nguyên liệu đã chọn nhưng chưa có loại; form không được lưu khi còn dòng này. */
export const missingHandling = (ingredientIds, handling) =>
  ingredientIds.filter((id) => !handling[id])

/** Payload `items` cho POST/PUT /supplier-contracts. */
export const contractItems = (ingredientIds, handling) =>
  ingredientIds.map((ingredientId) => ({
    ingredientId,
    handlingType: handling[ingredientId],
  }))

/** Danh sách thay đổi giữa loại hiện tại và bản nháp đang sửa (chỉ dòng đổi thật). */
export const handlingChanges = (items, draft) =>
  items
    .filter(
      (item) =>
        draft[item.ingredientId] &&
        draft[item.ingredientId] !== item.handlingType,
    )
    .map((item) => ({
      ingredientId: item.ingredientId,
      name: item.name,
      from: item.handlingType,
      to: draft[item.ingredientId],
    }))
