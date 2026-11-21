// Xuất file Excel Báo Cáo Nguyên Liệu dùng thư viện exceljs
const loadExcel = async () => {
  const module = await import("exceljs")
  return module.default || module
}

const PORTION_PRICE = 35000 // Định mức chi phí nguyên liệu trung bình / suất ăn

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE8F5E9" },
}

const styleHeader = (row) => {
  row.font = { bold: true, color: { argb: "FF1E7E34" }, size: 11 }
  row.alignment = { vertical: "middle", horizontal: "center" }
  row.height = 26
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.border = {
      top: { style: "thin", color: { argb: "FFB0BEC5" } },
      bottom: { style: "medium", color: { argb: "FF1E7E34" } },
      left: { style: "thin", color: { argb: "FFCFD8DC" } },
      right: { style: "thin", color: { argb: "FFCFD8DC" } },
    }
  })
}

const styleDataRow = (row, isAlt = false) => {
  row.alignment = { vertical: "middle" }
  row.height = 22
  if (isAlt) {
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF9FAFB" },
      }
    })
  }
}

const downloadWorkbook = async (workbook, filename) => {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function exportIngredientReportExcel({ deliveries = [], inventoryItems = [] }) {
  const ExcelJS = await loadExcel()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "FoodPrint - Quản Lý Nguyên Liệu Trường Học"
  workbook.created = new Date()

  // Sheet 1: Hiệu quả giao nhận & Tiết kiệm ngân sách
  const sheetDeliveries = workbook.addWorksheet("Giao_Nhan_Tiet_Kiem", {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  sheetDeliveries.columns = [
    { header: "Mã phiếu", key: "deliveryNo", width: 18 },
    { header: "Ngày giao", key: "deliveryDate", width: 14 },
    { header: "Loại đợt", key: "batchLabel", width: 22 },
    { header: "Nhà cung cấp", key: "supplierName", width: 26 },
    { header: "Tiến độ giờ giao", key: "onTimeStatus", width: 20 },
    { header: "Suất tối đa", key: "maxPortions", width: 13 },
    { header: "Sĩ số chốt", key: "actualAttendance", width: 13 },
    { header: "Suất tiết kiệm", key: "savedPortions", width: 15 },
    { header: "Kinh phí tối ưu (VNĐ)", key: "savedMoney", width: 22 },
    { header: "Nghiệm thu 4 bên", key: "statusLabel", width: 24 },
  ]

  styleHeader(sheetDeliveries.getRow(1))

  deliveries.forEach((d, idx) => {
    const saved =
      d.batchType === "BATCH_2" && d.maxPortions && d.actualAttendance
        ? Math.max(0, d.maxPortions - d.actualAttendance)
        : 0
    const money = saved > 0 ? (saved * PORTION_PRICE).toLocaleString("vi-VN") + " đ" : "--"

    // Kiểm tra đúng giờ
    let onTimeText = "Đúng hẹn"
    if (d.batchType === "BATCH_1" && d.deliveryTime && d.deliveryTime > "06:15") {
      onTimeText = `Trễ hẹn (${d.deliveryTime})`
    } else if (d.batchType === "BATCH_2" && d.deliveryTime && d.deliveryTime > "08:45") {
      onTimeText = `Trễ hẹn (${d.deliveryTime})`
    } else if (d.deliveryTime) {
      onTimeText = `Đúng hẹn (${d.deliveryTime})`
    }

    const row = sheetDeliveries.addRow({
      deliveryNo: d.deliveryNo || "--",
      deliveryDate: d.deliveryDate || "--",
      batchLabel: d.batchLabel || "Chưa xác định",
      supplierName: d.supplierName || "Đối tác",
      onTimeStatus: onTimeText,
      maxPortions: d.maxPortions || "--",
      actualAttendance: d.actualAttendance || "--",
      savedPortions: saved > 0 ? `+${saved} suất` : "--",
      savedMoney: money,
      statusLabel: d.statusLabel || "Đạt chuẩn",
    })
    styleDataRow(row, idx % 2 === 1)
  })

  // Sheet 2: Danh mục nguyên liệu, tồn kho & Cảnh báo hạn dùng
  const sheetInventory = workbook.addWorksheet("Ton_Kho_Va_Han_Dung", {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  sheetInventory.columns = [
    { header: "Mã NL", key: "code", width: 14 },
    { header: "Tên nguyên liệu", key: "name", width: 28 },
    { header: "Phân loại", key: "category", width: 16 },
    { header: "Tồn hiện tại", key: "currentStock", width: 15 },
    { header: "Định mức tối thiểu", key: "minThreshold", width: 18 },
    { header: "Cảnh báo HSD (Cận date)", key: "expiryStatus", width: 24 },
    { header: "Đánh giá mức tồn", key: "stockStatus", width: 18 },
    { header: "Nhà cung cấp", key: "supplierName", width: 28 },
  ]

  styleHeader(sheetInventory.getRow(1))

  inventoryItems.forEach((it, idx) => {
    let stockStatus = "Đủ an toàn"
    if (it.currentStock <= (it.minThreshold || 0)) {
      stockStatus = "Báo động thiếu"
    } else if (it.currentStock < (it.standardStock || it.minThreshold * 1.5)) {
      stockStatus = "Cần nhập thêm"
    }

    let expiryStatus = "Hạn dùng an toàn"
    if (it.daysUntilExpiry !== undefined && it.daysUntilExpiry !== null) {
      if (it.daysUntilExpiry <= 0) {
        expiryStatus = "Hết hạn sử dụng"
      } else if (it.daysUntilExpiry <= 30) {
        expiryStatus = `Cận date (${it.daysUntilExpiry} ngày)`
      } else {
        expiryStatus = `Còn ${it.daysUntilExpiry} ngày`
      }
    } else if (it.expiringSoon) {
      expiryStatus = "Cận date (< 30 ngày)"
    }

    const row = sheetInventory.addRow({
      code: it.code || it.id || "--",
      name: it.name || "--",
      category: it.category || "Kho khô",
      currentStock: `${it.currentStock ?? 0} ${it.unit || "kg"}`,
      minThreshold: `${it.minThreshold ?? 0} ${it.unit || "kg"}`,
      expiryStatus,
      stockStatus,
      supplierName: it.supplierName || "--",
    })
    styleDataRow(row, idx % 2 === 1)
  })

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const filename = `Bao_Cao_Nguyen_Lieu_${dateStr}.xlsx`
  await downloadWorkbook(workbook, filename)
}
