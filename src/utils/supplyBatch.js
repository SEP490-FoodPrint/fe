// Nguồn sự thật: orderType + batchNo từ API (SupplyRequest). Không đoán theo mã/ghi chú/giờ.
export const BATCH_TYPE = {
  BATCH_1: "BATCH_1",
  BATCH_2: "BATCH_2",
  DRY_STOCK: "DRY_STOCK",
};

export function batchTypeOf(item) {
  const orderType = item?.orderType ?? item?.SupplyRequest?.orderType;
  const batchNo = item?.batchNo ?? item?.SupplyRequest?.batchNo;
  if (orderType === "DRY_STOCK") return BATCH_TYPE.DRY_STOCK;
  if (orderType === "DIRECT_USE" && Number(batchNo) === 1) return BATCH_TYPE.BATCH_1;
  if (orderType === "DIRECT_USE" && Number(batchNo) === 2) return BATCH_TYPE.BATCH_2;
  return null; // dữ liệu thiếu: hiển thị "Chưa xác định", KHÔNG đoán
}
