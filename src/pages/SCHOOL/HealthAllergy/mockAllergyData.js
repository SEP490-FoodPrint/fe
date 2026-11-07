/**
 * mockAllergyData.js
 * Dữ liệu mẫu tra cứu thông tin dị ứng cho School Health Officer (FoodPrint).
 * 
 * Bám sát nghiệp vụ FoodPrint & DB PostgreSQL v5.4:
 * - Không có Student entity, không có thông tin cá nhân/hồ sơ học sinh.
 * - Thông tin dị ứng được tổng hợp theo Class và IngredientEntry.
 * - Mỗi bản ghi dị ứng có số lượng học sinh bị ảnh hưởng (affected_count).
 * - Tên nguyên liệu lấy từ danh mục nội bộ của trường.
 */

export const MOCK_ACADEMIC_YEARS = [
  { value: "ALL", label: "Tất cả năm học" },
  { value: "2026-2027", label: "Năm học 2026 - 2027" },
  { value: "2025-2026", label: "Năm học 2025 - 2026" },
]

export const MOCK_CLASS_ALLERGIES = [
  {
    id: "cls-3b",
    className: "Lớp 3B",
    grade: 3,
    academicYear: "2026-2027",
    schoolName: "Trường THCS & Tiểu học Đoàn Thị Điểm",
    roomLocation: "Phòng 302",
    roomBuilding: "Tầng 3, Dãy A",
    semester: "Học kỳ 1",
    totalStudents: 34,
    registeredPortions: 34,
    homeroomTeacher: "Cô Trần Thu Trang",
    profileStatus: "Chuẩn hóa",
    verificationStatus: "Đã đối chiếu BGH",
    updatedAt: "2026-10-25 09:10",
    allergies: [
      {
        id: "alg-3b-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-NUT-004",
        ingredientName: "Đậu phộng (Lạc)",
        category: "Các loại hạt (Nuts & Seeds)",
        handlingType: "DRY_STOCK",
        affectedCount: 2,
        updatedAt: "18/10/2026",
        commonSources: "Hạt khô, dầu đậu phộng, bơ đậu phộng",
        commonSourcesDetail: "Thường có trong các loại sốt chấm, bánh nướng",
        safeSubstitutes: "Hạt hướng dương, hạt bí ngô đã kiểm định",
        safeSubstitutesDetail: "Đã được chứng nhận trong danh mục nhà trường",
        verificationNote: "Hồ sơ y tế đầu năm hoàn tất",
        verificationSubnote: "Xác nhận phối hợp giữa GVCN & Phụ huynh",
        kitchenNote:
          "Cần đối soát và loại trừ đậu phộng khi lên thực đơn hoặc phân bổ suất ăn cho lớp 3B. Đối với khay ăn định suất phục vụ tại phòng ăn số 2, nhân viên phục vụ bếp cần gắn thẻ đánh dấu riêng biệt nhằm đảm bảo an toàn tuyệt đối cho bàn ăn khối 3B.",
      },
    ],
  },
  {
    id: "cls-3a",
    className: "Lớp 3A",
    grade: 3,
    academicYear: "2026-2027",
    schoolName: "Trường THCS & Tiểu học Đoàn Thị Điểm",
    roomLocation: "Phòng 301",
    roomBuilding: "Tầng 3, Dãy A",
    semester: "Học kỳ 1",
    totalStudents: 35,
    registeredPortions: 35,
    homeroomTeacher: "Cô Nguyễn Thị Hoa",
    profileStatus: "Chuẩn hóa",
    verificationStatus: "Đã đối chiếu BGH",
    updatedAt: "2026-10-24 09:00",
    allergies: [
      {
        id: "alg-3a-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-NUT-004",
        ingredientName: "Đậu phộng (Lạc)",
        category: "Các loại hạt (Nuts & Seeds)",
        handlingType: "DRY_STOCK",
        affectedCount: 1,
        updatedAt: "24/10/2026",
        commonSources: "Hạt rang, bơ đậu phộng, bánh kẹo hạt",
        commonSourcesDetail: "Cần chú ý trong các món chè, salad hoặc sốt gia vị",
        safeSubstitutes: "Hạt vừng trắng, hạt hạnh nhân lát kiểm định",
        safeSubstitutesDetail: "Đã được kiểm duyệt trong danh mục nguyên liệu trường",
        verificationNote: "Hồ sơ y tế đầu năm hoàn tất",
        verificationSubnote: "GVCN thu thập từ phiếu khai báo sức khỏe bán trú",
        kitchenNote:
          "Loại trừ đậu phộng trong toàn bộ món phụ và gia vị sốt của khay ăn dành cho lớp 3A. Bàn ăn được phân bổ tại dãy số 1 nhà ăn tiểu học.",
      },
    ],
  },
  {
    id: "cls-4a",
    className: "Lớp 4A",
    grade: 4,
    academicYear: "2026-2027",
    schoolName: "Trường THCS & Tiểu học Đoàn Thị Điểm",
    roomLocation: "Phòng 401",
    roomBuilding: "Tầng 4, Dãy B",
    semester: "Học kỳ 1",
    totalStudents: 38,
    registeredPortions: 38,
    homeroomTeacher: "Thầy Lê Anh Tuấn",
    profileStatus: "Chuẩn hóa",
    verificationStatus: "Đã đối chiếu BGH",
    updatedAt: "2026-10-26 08:30",
    allergies: [
      {
        id: "alg-4a-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-NUT-004",
        ingredientName: "Đậu phộng (Lạc)",
        category: "Các loại hạt (Nuts & Seeds)",
        handlingType: "DRY_STOCK",
        affectedCount: 1,
        updatedAt: "26/10/2026",
        commonSources: "Hạt khô, kẹo lạc, dầu phộng tinh luyện",
        commonSourcesDetail: "Cảnh báo chéo trong dây chuyền chế biến bánh ăn phụ",
        safeSubstitutes: "Hạt điều nguyên vị hoặc đậu tương hữu cơ đã duyệt",
        safeSubstitutesDetail: "Theo quy chuẩn nguyên liệu an toàn thực phẩm",
        verificationNote: "Hồ sơ y tế đầu năm hoàn tất",
        verificationSubnote: "Đã xác thực chữ ký phụ huynh và GVCN",
        kitchenNote:
          "Bộ phận chia suất lưu ý dán nhãn suất ăn riêng không chứa hạt cho học sinh lớp 4A. Kiểm tra dầu ăn dùng cho món chiên xào.",
      },
    ],
  },
  {
    id: "cls-2b",
    className: "Lớp 2B",
    grade: 2,
    academicYear: "2026-2027",
    schoolName: "Trường THCS & Tiểu học Đoàn Thị Điểm",
    roomLocation: "Phòng 202",
    roomBuilding: "Tầng 2, Dãy A",
    semester: "Học kỳ 1",
    totalStudents: 34,
    registeredPortions: 34,
    homeroomTeacher: "Cô Hoàng Thảo My",
    profileStatus: "Chuẩn hóa",
    verificationStatus: "Đã đối chiếu BGH",
    updatedAt: "2026-10-27 10:15",
    allergies: [
      {
        id: "alg-2b-1",
        ingredientId: "ing-shrimp",
        ingredientCode: "ING-SEA-002",
        ingredientName: "Tôm sú",
        category: "Thủy hải sản (Seafood)",
        handlingType: "COLD_STORAGE",
        affectedCount: 3,
        updatedAt: "27/10/2026",
        commonSources: "Tôm tươi, chả tôm, nước dùng nấu từ vỏ tôm",
        commonSourcesDetail: "Phổ biến trong các món canh chua, bún hải sản, tôm rim",
        safeSubstitutes: "Thịt nạc heo, phi lê cá ba sa tươi kiểm định",
        safeSubstitutesDetail: "Nguồn thịt tươi đạt chuẩn chuỗi VietGAP",
        verificationNote: "Hồ sơ y tế đầu năm hoàn tất",
        verificationSubnote: "Xác nhận phối hợp giữa GVCN & Phụ huynh",
        kitchenNote:
          "Lớp 2B có 3 học sinh dị ứng tôm sú. Khi thực đơn có món tôm, bếp trưởng chủ động thay thế bằng suất thịt heo rim nấm hoặc cá ba sa áp chảo cho 3 phần ăn này.",
      },
      {
        id: "alg-2b-2",
        ingredientId: "ing-egg",
        ingredientCode: "ING-EGG-001",
        ingredientName: "Trứng gà",
        category: "Trứng & Gia cầm (Eggs & Poultry)",
        handlingType: "DIRECT_USE",
        affectedCount: 1,
        updatedAt: "27/10/2026",
        commonSources: "Trứng luộc, trứng rán, bánh trứng, sốt kem",
        commonSourcesDetail: "Cần lưu ý trứng dùng làm chất kết dính trong chả viên",
        safeSubstitutes: "Đậu hũ non sốt cà chua, thịt băm viên mộc nhĩ",
        safeSubstitutesDetail: "Đã chứng nhận an toàn trong danh mục nhà trường",
        verificationNote: "Hồ sơ y tế đầu năm hoàn tất",
        verificationSubnote: "Đã cập nhật phiếu dinh dưỡng từ GVCN",
        kitchenNote:
          "Tránh sử dụng bột tẩm có trứng hoặc sốt mayonnaise cho phần ăn dị ứng trứng của lớp 2B.",
      },
    ],
  },
  {
    id: "cls-5a",
    className: "Lớp 5A",
    grade: 5,
    academicYear: "2026-2027",
    schoolName: "Trường THCS & Tiểu học Đoàn Thị Điểm",
    roomLocation: "Phòng 501",
    roomBuilding: "Tầng 5, Dãy B",
    semester: "Học kỳ 1",
    totalStudents: 35,
    registeredPortions: 35,
    homeroomTeacher: "Cô Đặng Thu Hà",
    profileStatus: "Chuẩn hóa",
    verificationStatus: "Đã đối chiếu BGH",
    updatedAt: "2026-10-28 14:20",
    allergies: [
      {
        id: "alg-5a-1",
        ingredientId: "ing-cow-milk",
        ingredientCode: "ING-DRY-008",
        ingredientName: "Sữa bò tươi",
        category: "Sữa & Sản phẩm từ sữa (Dairy)",
        handlingType: "COLD_STORAGE",
        affectedCount: 2,
        updatedAt: "28/10/2026",
        commonSources: "Sữa tươi, sữa chua, phô mai lát, bơ lạt",
        commonSourcesDetail: "Thường xuyên có trong bữa phụ xế chiều của học sinh",
        safeSubstitutes: "Sữa hạt đậu nành tiệt trùng, sữa yến mạch FOS",
        safeSubstitutesDetail: "Nguồn sữa thực vật tiêu chuẩn dinh dưỡng học đường",
        verificationNote: "Hồ sơ y tế đầu năm hoàn tất",
        verificationSubnote: "Đã kiểm tra chứng chỉ y bạ dị ứng đạm sữa bò",
        kitchenNote:
          "Bữa phụ chiều chuyển đổi sang sữa yến mạch cho 2 học sinh lớp 5A. Quản lý kho bếp xuất đúng số lượng sữa hạt theo tem dán lớp.",
      },
    ],
  },
]

/**
 * Tính toán 2 chỉ số KPI:
 * 1. Số lớp có ghi nhận dị ứng
 * 2. Số loại nguyên liệu được ghi nhận dị ứng
 * 
 * Lưu ý: TUYỆT ĐỐI không cộng gộp các affectedCount của các nguyên liệu
 * để tính "tổng số học sinh dị ứng toàn trường" (vì 1 học sinh có thể dị ứng nhiều loại).
 */
export function computeAllergySummary(classList = MOCK_CLASS_ALLERGIES) {
  const classesWithAllergies = classList.filter(
    (cls) => Array.isArray(cls.allergies) && cls.allergies.length > 0
  )

  const ingredientSet = new Set()
  classesWithAllergies.forEach((cls) => {
    cls.allergies.forEach((alg) => {
      if (alg.ingredientName) {
        ingredientSet.add(alg.ingredientName.trim().toLowerCase())
      }
    })
  })

  return {
    totalClasses: classesWithAllergies.length,
    totalIngredients: ingredientSet.size,
  }
}
