// Đọc/ghi file Excel cho màn Lớp học & GVCN. exceljs chỉ được tải khi người dùng dùng chức năng Excel.
const loadExcel = async () => {
  const module = await import("exceljs")
  return module.default || module
}

export const IMPORT_MAX_ROWS = 300
export const IMPORT_MAX_FILE_SIZE = 2 * 1024 * 1024

const CLASS_SHEET = "Lớp học"
const TEACHER_SHEET = "Danh sách GVCN"
const GUIDE_SHEET = "Hướng dẫn"

const COLUMNS = {
  name: "Tên lớp",
  portions: "Số suất đăng ký",
  teacher: "Tài khoản GVCN",
}

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } }

const styleHeader = row => {
  row.font = { bold: true }
  row.alignment = { vertical: "middle" }
  row.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.border = { bottom: { style: "thin", color: { argb: "FFB0BEC5" } } }
  })
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

const addClassSheet = (workbook, extraColumns = []) => {
  const sheet = workbook.addWorksheet(CLASS_SHEET, { views: [{ state: "frozen", ySplit: 1 }] })
  sheet.columns = [
    { header: `${COLUMNS.name} *`, key: "name", width: 22 },
    { header: COLUMNS.portions, key: "portions", width: 18 },
    { header: COLUMNS.teacher, key: "teacher", width: 26 },
    ...extraColumns,
  ]
  styleHeader(sheet.getRow(1))
  return sheet
}

/** File mẫu: sheet nhập lớp, danh sách GVCN còn trống (dùng làm dropdown) và hướng dẫn. */
export async function downloadClassTemplate({ academicYear, teachers }) {
  const ExcelJS = await loadExcel()
  const workbook = new ExcelJS.Workbook()
  const sheet = addClassSheet(workbook)

  const teacherSheet = workbook.addWorksheet(TEACHER_SHEET)
  teacherSheet.columns = [
    { header: "Tài khoản", key: "username", width: 26 },
    { header: "Họ và tên", key: "fullName", width: 30 },
  ]
  styleHeader(teacherSheet.getRow(1))
  teachers.forEach(teacher => teacherSheet.addRow({ username: teacher.username, fullName: teacher.fullName }))

  const lastDataRow = IMPORT_MAX_ROWS + 1
  for (let row = 2; row <= lastDataRow; row += 1) {
    sheet.getCell(`B${row}`).dataValidation = {
      type: "whole",
      operator: "greaterThanOrEqual",
      formulae: [0],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Số suất không hợp lệ",
      error: "Nhập số nguyên từ 0 trở lên.",
    }
    if (teachers.length) {
      sheet.getCell(`C${row}`).dataValidation = {
        type: "list",
        formulae: [`'${TEACHER_SHEET}'!$A$2:$A$${teachers.length + 1}`],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: "warning",
        errorTitle: "GVCN không có trong danh sách",
        error: `Chọn tài khoản trong sheet "${TEACHER_SHEET}" hoặc để trống.`,
      }
    }
  }

  const guide = workbook.addWorksheet(GUIDE_SHEET)
  guide.getColumn(1).width = 110
  const guideLines = [
    `Niên khóa: ${academicYear}`,
    "",
    `1. Điền mỗi lớp một dòng trong sheet "${CLASS_SHEET}", bắt đầu từ dòng 2. Không đổi tên hay thứ tự cột tiêu đề.`,
    `2. ${COLUMNS.name} (bắt buộc): tối đa 120 ký tự, không trùng nhau trong file. Ví dụ: 1A, Lá 2, 10A1.`,
    `3. ${COLUMNS.portions}: số nguyên từ 0 trở lên; để trống sẽ được tính là 0.`,
    `4. ${COLUMNS.teacher} (không bắt buộc): chọn từ dropdown, lấy từ sheet "${TEACHER_SHEET}" (các GVCN chưa chủ nhiệm lớp nào trong niên khóa). Mỗi GVCN chỉ được gán cho một lớp.`,
    `5. Lớp đã có trong niên khóa (kể cả lớp đã ngừng hoạt động) sẽ được bỏ qua, không bị ghi đè.`,
    `6. Mỗi lần nhập tối đa ${IMPORT_MAX_ROWS} lớp. Hệ thống cho xem trước kết quả và chỉ lưu khi file không còn dòng lỗi.`,
  ]
  guideLines.forEach(text => guide.addRow([text]))
  guide.getRow(1).font = { bold: true }

  await downloadWorkbook(workbook, `mau-nhap-lop-${academicYear}.xlsx`)
}

/** Xuất danh sách lớp; 3 cột đầu cùng định dạng file mẫu để có thể dùng làm file nhập. */
export async function downloadClassList({ academicYear, classes }) {
  const ExcelJS = await loadExcel()
  const workbook = new ExcelJS.Workbook()
  const sheet = addClassSheet(workbook, [
    { header: "Họ tên GVCN", key: "teacherName", width: 28 },
    { header: "Ngày phân công", key: "assignedAt", width: 16 },
    { header: "Trạng thái", key: "status", width: 18 },
  ])
  classes.forEach(item => {
    const teacher = item.homeroomTeacher
    sheet.addRow({
      name: item.name,
      portions: item.registeredMealPortions,
      teacher: teacher?.username || "",
      teacherName: teacher?.fullName || "",
      assignedAt: teacher?.assignedAt ? new Date(teacher.assignedAt).toLocaleDateString("vi-VN") : "",
      status: item.status === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động",
    })
  })
  await downloadWorkbook(workbook, `danh-sach-lop-${academicYear}.xlsx`)
}

// Giá trị ô có thể là chuỗi, số, công thức, rich text hoặc hyperlink.
const cellText = value => {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") {
    if (value instanceof Date) return value.toLocaleDateString("vi-VN")
    if ("result" in value) return cellText(value.result)
    if (Array.isArray(value.richText)) return value.richText.map(part => part.text).join("")
    if ("text" in value) return cellText(value.text)
    return ""
  }
  return String(value).trim()
}

const normalizeHeader = text =>
  cellText(text)
    .replace(/\*/g, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()

const HEADER_KEYS = {
  name: normalizeHeader(COLUMNS.name),
  portions: normalizeHeader(COLUMNS.portions),
  teacher: normalizeHeader(COLUMNS.teacher),
}

export class ClassFileError extends Error {}

/** Đọc file .xlsx thành các dòng gửi lên backend; backend kiểm tra quy tắc nghiệp vụ. */
export async function readClassFile(file) {
  if (!/\.xlsx$/i.test(file.name)) throw new ClassFileError("Chỉ hỗ trợ file Excel định dạng .xlsx.")
  if (file.size > IMPORT_MAX_FILE_SIZE) throw new ClassFileError("File vượt quá dung lượng tối đa 2MB.")

  const ExcelJS = await loadExcel()
  const workbook = new ExcelJS.Workbook()
  try {
    await workbook.xlsx.load(await file.arrayBuffer())
  } catch {
    throw new ClassFileError("Không đọc được file. Hãy dùng file mẫu và lưu ở định dạng .xlsx.")
  }
  const sheet = workbook.getWorksheet(CLASS_SHEET) || workbook.worksheets[0]
  if (!sheet) throw new ClassFileError("File không có sheet dữ liệu.")

  const columns = {}
  sheet.getRow(1).eachCell((cell, column) => {
    const header = normalizeHeader(cell.value)
    Object.entries(HEADER_KEYS).forEach(([key, expected]) => {
      if (header === expected && !columns[key]) columns[key] = column
    })
  })
  if (!columns.name) {
    throw new ClassFileError(`Không tìm thấy cột "${COLUMNS.name}" ở dòng tiêu đề. Hãy dùng file mẫu.`)
  }

  const rows = []
  for (let index = 2; index <= sheet.rowCount; index += 1) {
    const row = sheet.getRow(index)
    const name = cellText(row.getCell(columns.name).value)
    const portions = columns.portions ? cellText(row.getCell(columns.portions).value) : ""
    const teacher = columns.teacher ? cellText(row.getCell(columns.teacher).value) : ""
    if (!name && !portions && !teacher) continue
    rows.push({
      rowNumber: index,
      name: name.slice(0, 500),
      registeredMealPortions: portions === "" ? null : portions.slice(0, 50),
      teacherUsername: teacher ? teacher.slice(0, 120) : null,
    })
  }
  if (!rows.length) throw new ClassFileError("File không có dòng dữ liệu nào.")
  if (rows.length > IMPORT_MAX_ROWS) {
    throw new ClassFileError(`File có ${rows.length} dòng, mỗi lần nhập tối đa ${IMPORT_MAX_ROWS} lớp.`)
  }
  return rows
}
