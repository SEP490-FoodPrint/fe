// Rút gọn danh sách trong thông báo: hiện tối đa `limit` mục rồi "và N mục khác".
export function shortList(items = [], limit = 2) {
  const shown = items.slice(0, limit).join(", ")
  const rest = items.length - limit
  return rest > 0 ? `${shown} và ${rest} mục khác` : shown
}
