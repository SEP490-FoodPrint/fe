/**
 * Dữ liệu Thông tin Dị ứng Học sinh do Giáo viên Chủ nhiệm thu thập (FoodPrint)
 * Ánh xạ với Cơ sở dữ liệu:
 * - classes: id, name (Lớp 1A, 2B...), academic_year, registered_meal_portions
 * - class_homeroom_assignments & users: teacher_user_id -> full_name (Cô Nguyễn Thị Mai), phone, email
 * - class_allergies: class_id, ingredient_entry_id, affected_count, updated_by_user_id, updated_at
 * - ingredients & ingredient_entries: name (Tôm sú, Đậu phộng, Trứng gà...), category
 * - daily_meal_portions: allergy_notes (Ghi chú báo ăn & danh sách suất riêng hàng ngày của GVCN)
 */

export const ALLERGEN_OPTIONS = [
  { id: "ing-shrimp", name: "Tôm / Giáp xác", category: "Thủy hải sản", severityDefault: "HIGH" },
  { id: "ing-crab", name: "Cua / Ghẹ", category: "Thủy hải sản", severityDefault: "HIGH" },
  { id: "ing-peanut", name: "Đậu phộng / Lạc", category: "Hạt & Khô", severityDefault: "HIGH" },
  { id: "ing-egg", name: "Trứng gà / Trứng vịt", category: "Trứng gia cầm", severityDefault: "MEDIUM" },
  { id: "ing-milk", name: "Sữa bò tươi / Phô mai", category: "Sữa & Chế phẩm", severityDefault: "MEDIUM" },
  { id: "ing-fish", name: "Cá biển", category: "Thủy hải sản", severityDefault: "MEDIUM" },
  { id: "ing-soy", name: "Đậu nành / Đậu phụ", category: "Đậu & Ngũ cốc", severityDefault: "LOW" },
  { id: "ing-wheat", name: "Bột mì / Gluten", category: "Tinh bột", severityDefault: "LOW" },
]

export const SCHOOL_CLASSES_MASTER = [
  { id: "cls-1a", name: "Lớp 1A", grade: "1", teacherName: "Cô Nguyễn Thị Mai", teacherPhone: "0912.456.789", totalStudents: 38 },
  { id: "cls-1b", name: "Lớp 1B", grade: "1", teacherName: "Thầy Lê Minh Quân", teacherPhone: "0983.123.456", totalStudents: 36 },
  { id: "cls-1c", name: "Lớp 1C", grade: "1", teacherName: "Cô Trần Bích Loan", teacherPhone: "0912.888.999", totalStudents: 35 },
  { id: "cls-2a", name: "Lớp 2A", grade: "2", teacherName: "Cô Hoàng Lan Anh", teacherPhone: "0977.654.321", totalStudents: 37 },
  { id: "cls-2b", name: "Lớp 2B", grade: "2", teacherName: "Cô Phạm Thanh Hằng", teacherPhone: "0904.789.321", totalStudents: 39 },
  { id: "cls-3a", name: "Lớp 3A", grade: "3", teacherName: "Thầy Đỗ Văn Cường", teacherPhone: "0915.998.877", totalStudents: 40 },
  { id: "cls-4a", name: "Lớp 4A", grade: "4", teacherName: "Cô Bùi Bích Phương", teacherPhone: "0936.112.233", totalStudents: 35 },
  { id: "cls-4b", name: "Lớp 4B", grade: "4", teacherName: "Thầy Trần Đức Nam", teacherPhone: "0944.556.677", totalStudents: 38 },
  { id: "cls-5a", name: "Lớp 5A", grade: "5", teacherName: "Cô Vũ Thu Hằng", teacherPhone: "0909.887.766", totalStudents: 41 },
]

// Danh sách học sinh cụ thể do Giáo viên chủ nhiệm thu thập từ phụ huynh
export const INITIAL_STUDENT_ALLERGIES = [
  {
    id: "stu-1",
    studentName: "Nguyễn Minh An",
    gender: "Nam",
    className: "Lớp 1A",
    grade: "1",
    homeroomTeacher: "Cô Nguyễn Thị Mai",
    teacherPhone: "0912.456.789",
    allergenName: "Tôm sú, Cua đồng",
    allergenCategory: "Thủy hải sản",
    symptoms: "Nổi mề đay đỏ quanh miệng và cổ, ngứa nhiều sau khi ăn 15 phút.",
    severity: "HIGH", // HIGH: Nặng, MEDIUM: Trung bình, LOW: Nhẹ
    dietaryNote: "Suất ăn riêng: Đổi sang thịt heo rim hoặc thịt gà. Tuyệt đối không dùng chung chảo rán tôm.",
    parentPhone: "0903.111.222 (Mẹ em An)",
    reportedDate: "2026-10-15",
    teacherNotes: "Phụ huynh đã nộp giấy khám của BV Nhi Trung ương đầu năm học.",
    hasEmergencyMedicine: true,
    emergencyMedicineNote: "Gửi 1 vỉ Siro Desloratadine tại tủ y tế trường.",
  },
  {
    id: "stu-2",
    studentName: "Trần Bảo Ngọc",
    gender: "Nữ",
    className: "Lớp 1A",
    grade: "1",
    homeroomTeacher: "Cô Nguyễn Thị Mai",
    teacherPhone: "0912.456.789",
    allergenName: "Đậu phộng / Lạc",
    allergenCategory: "Hạt & Khô",
    symptoms: "Ngứa rát cổ họng, buồn nôn, sưng môi nhẹ.",
    severity: "HIGH",
    dietaryNote: "Không ăn món có rắc lạc, bơ lạc hoặc dầu lạc.",
    parentPhone: "0918.222.333 (Bố em Ngọc)",
    reportedDate: "2026-10-15",
    teacherNotes: "Gia đình dặn rất kỹ khi có món xào rắc đậu phộng.",
    hasEmergencyMedicine: true,
    emergencyMedicineNote: "Có bút tiêm dị ứng mang theo balo cá nhân.",
  },
  {
    id: "stu-3",
    studentName: "Lê Hoàng Long",
    gender: "Nam",
    className: "Lớp 1A",
    grade: "1",
    homeroomTeacher: "Cô Nguyễn Thị Mai",
    teacherPhone: "0912.456.789",
    allergenName: "Tôm, Tép biển",
    allergenCategory: "Thủy hải sản",
    symptoms: "Mẩn đỏ vùng bụng và tay, gãi nhiều.",
    severity: "MEDIUM",
    dietaryNote: "Báo bếp nấu canh riêng không nêm tôm/tép khô.",
    parentPhone: "0972.333.444 (Mẹ em Long)",
    reportedDate: "2026-10-18",
    teacherNotes: "Ăn tôm đồng ít bị, nhưng tôm biển bị ngứa nhiều.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
  {
    id: "stu-4",
    studentName: "Phạm Thùy Linh",
    gender: "Nữ",
    className: "Lớp 1B",
    grade: "1",
    homeroomTeacher: "Thầy Lê Minh Quân",
    teacherPhone: "0983.123.456",
    allergenName: "Trứng gà, Trứng vịt",
    allergenCategory: "Trứng gia cầm",
    symptoms: "Đỏ quanh miệng, ngứa mí mắt sau khi ăn trứng cuộn hoặc trứng ốp.",
    severity: "MEDIUM",
    dietaryNote: "Suất ăn riêng: Đổi sang chả lụa heo hoặc thịt kho nạc.",
    parentPhone: "0934.444.555 (Mẹ em Linh)",
    reportedDate: "2026-10-16",
    teacherNotes: "Không ăn được cả bánh bông lan có trứng.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
  {
    id: "stu-5",
    studentName: "Đặng Tuấn Kiệt",
    gender: "Nam",
    className: "Lớp 1B",
    grade: "1",
    homeroomTeacher: "Thầy Lê Minh Quân",
    teacherPhone: "0983.123.456",
    allergenName: "Trứng gà",
    allergenCategory: "Trứng gia cầm",
    symptoms: "Nổi mẩn sần li ti hai bên má.",
    severity: "LOW",
    dietaryNote: "Tránh các món trứng rán, trứng kho.",
    parentPhone: "0908.555.666 (Bố em Kiệt)",
    reportedDate: "2026-10-20",
    teacherNotes: "Nếu ăn một lượng nhỏ thì không sao, ăn nhiều sẽ mẩn đỏ.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
  {
    id: "stu-6",
    studentName: "Vũ Gia Huy",
    gender: "Nam",
    className: "Lớp 2B",
    grade: "2",
    homeroomTeacher: "Cô Phạm Thanh Hằng",
    teacherPhone: "0904.789.321",
    allergenName: "Tôm sú, Ghẹ biển",
    allergenCategory: "Thủy hải sản",
    symptoms: "Phù môi trên, nổi ban đỏ ngực và lưng, khó chịu vùng họng.",
    severity: "HIGH",
    dietaryNote: "Suất ăn riêng 100%: Thay bằng thịt bò xào hoặc sườn rim.",
    parentPhone: "0915.666.777 (Mẹ em Huy)",
    reportedDate: "2026-10-14",
    teacherNotes: "Tiền sử dị ứng nặng, cô giáo kiểm tra khay ăn trước khi cho ăn.",
    hasEmergencyMedicine: true,
    emergencyMedicineNote: "Thuốc Aerius gửi tại phòng y tế trường.",
  },
  {
    id: "stu-7",
    studentName: "Bùi Khánh Vy",
    gender: "Nữ",
    className: "Lớp 2B",
    grade: "2",
    homeroomTeacher: "Cô Phạm Thanh Hằng",
    teacherPhone: "0904.789.321",
    allergenName: "Tôm biển",
    allergenCategory: "Thủy hải sản",
    symptoms: "Nổi mẩn ngứa vùng cổ tay và mí mắt.",
    severity: "MEDIUM",
    dietaryNote: "Đổi món canh tôm sang canh thịt băm nấu rau ngót.",
    parentPhone: "0989.777.888 (Mẹ em Vy)",
    reportedDate: "2026-10-15",
    teacherNotes: "Phụ huynh ghi chú trong sổ liên lạc điện tử.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
  {
    id: "stu-8",
    studentName: "Ngô Đức Phúc",
    gender: "Nam",
    className: "Lớp 3A",
    grade: "3",
    homeroomTeacher: "Thầy Đỗ Văn Cường",
    teacherPhone: "0915.998.877",
    allergenName: "Sữa bò tươi, Phô mai",
    allergenCategory: "Sữa & Chế phẩm",
    symptoms: "Đau quặn bụng, tiêu chảy sau uống sữa tươi 20–30 phút (bất dung nạp lactose).",
    severity: "MEDIUM",
    dietaryNote: "Bữa phụ chiều: Đổi sang sữa hạt hoặc nước hoa quả ép tươi.",
    parentPhone: "0902.888.999 (Bố em Phúc)",
    reportedDate: "2026-10-17",
    teacherNotes: "Học sinh uống sữa hạt bình thường, không được phát sữa chua hoặc sữa tươi hộp.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
  {
    id: "stu-9",
    studentName: "Hoàng Mai Chi",
    gender: "Nữ",
    className: "Lớp 4A",
    grade: "4",
    homeroomTeacher: "Cô Bùi Bích Phương",
    teacherPhone: "0936.112.233",
    allergenName: "Trứng gà",
    allergenCategory: "Trứng gia cầm",
    symptoms: "Ngứa da quanh miệng, đầy bụng.",
    severity: "LOW",
    dietaryNote: "Tránh món trứng đúc thịt hoặc chả trứng.",
    parentPhone: "0913.999.000 (Mẹ em Chi)",
    reportedDate: "2026-10-19",
    teacherNotes: "Cô giáo nhắc nhở em khi ăn tại nhà ăn.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
  {
    id: "stu-10",
    studentName: "Dương Quốc Bảo",
    gender: "Nam",
    className: "Lớp 4B",
    grade: "4",
    homeroomTeacher: "Thầy Trần Đức Nam",
    teacherPhone: "0944.556.677",
    allergenName: "Cá biển (Cá ngừ, cá nục)",
    allergenCategory: "Thủy hải sản",
    symptoms: "Chóng mặt nhẹ, nổi ban đỏ hai bên thái dương và cổ.",
    severity: "MEDIUM",
    dietaryNote: "Đổi sang thịt nạc kho củ cải hoặc gà chiên mắm.",
    parentPhone: "0988.000.111 (Mẹ em Bảo)",
    reportedDate: "2026-10-16",
    teacherNotes: "Cá đồng ăn bình thường, chỉ bị cá ngừ/cá nục.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
  {
    id: "stu-11",
    studentName: "Lý Gia Hân",
    gender: "Nữ",
    className: "Lớp 5A",
    grade: "5",
    homeroomTeacher: "Cô Vũ Thu Hằng",
    teacherPhone: "0909.887.766",
    allergenName: "Đậu phộng / Lạc",
    allergenCategory: "Hạt & Khô",
    symptoms: "Khó nuốt, cảm giác nghẹn họng, nổi mề đay toàn thân.",
    severity: "HIGH",
    dietaryNote: "Khay ăn riêng biệt, kiểm tra kỹ nguồn sốt và gia vị.",
    parentPhone: "0905.111.333 (Mẹ em Hân)",
    reportedDate: "2026-10-14",
    teacherNotes: "Học sinh tự ý thức được việc hỏi cô giáo xem thức ăn có lạc không.",
    hasEmergencyMedicine: true,
    emergencyMedicineNote: "Có thuốc dị ứng tại phòng Y tế trường.",
  },
  {
    id: "stu-12",
    studentName: "Trịnh Thảo Nguyên",
    gender: "Nữ",
    className: "Lớp 5A",
    grade: "5",
    homeroomTeacher: "Cô Vũ Thu Hằng",
    teacherPhone: "0909.887.766",
    allergenName: "Bột mì / Gluten",
    allergenCategory: "Tinh bột",
    symptoms: "Chướng bụng, đầy hơi sau ăn bánh mì hoặc đồ tẩm bột chiên xù.",
    severity: "LOW",
    dietaryNote: "Ưu tiên cơm trắng, không cho ăn đồ chiên xù.",
    parentPhone: "0938.222.444 (Bố em Nguyên)",
    reportedDate: "2026-10-21",
    teacherNotes: "Cô giáo nhắc nhở khi đến bữa có món tẩm bột rán.",
    hasEmergencyMedicine: false,
    emergencyMedicineNote: "",
  },
]

const STORAGE_KEY = "foodprint_student_allergies_collected_v2"

export function getStoredStudentAllergies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error("Lỗi đọc dữ liệu dị ứng học sinh từ localStorage:", e)
  }
  return INITIAL_STUDENT_ALLERGIES
}

export function saveStoredStudentAllergies(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Lỗi ghi dữ liệu dị ứng học sinh vào localStorage:", e)
  }
}

// Hàm tính toán thống kê tổng hợp phục vụ nhân viên y tế
export function computeStudentAllergyStats(list) {
  const totalStudents = list.length
  let highSeverityCount = 0
  let mediumSeverityCount = 0
  let lowSeverityCount = 0

  const classSet = new Set()
  const allergenCountMap = {}

  list.forEach((item) => {
    classSet.add(item.className)
    if (item.severity === "HIGH") highSeverityCount += 1
    else if (item.severity === "MEDIUM") mediumSeverityCount += 1
    else lowSeverityCount += 1

    const cat = item.allergenCategory || "Khác"
    allergenCountMap[cat] = (allergenCountMap[cat] || 0) + 1
  })

  const topAllergens = Object.entries(allergenCountMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }))

  return {
    totalStudents,
    totalClasses: classSet.size,
    highSeverityCount,
    mediumSeverityCount,
    lowSeverityCount,
    topAllergens,
  }
}

// Nhóm danh sách học sinh theo từng Lớp học
export function groupAllergiesByClass(list) {
  const map = {}
  list.forEach((item) => {
    if (!map[item.className]) {
      map[item.className] = {
        className: item.className,
        grade: item.grade,
        homeroomTeacher: item.homeroomTeacher,
        teacherPhone: item.teacherPhone,
        students: [],
      }
    }
    map[item.className].students.push(item)
  })

  return Object.values(map).sort((a, b) => a.className.localeCompare(b.className))
}
