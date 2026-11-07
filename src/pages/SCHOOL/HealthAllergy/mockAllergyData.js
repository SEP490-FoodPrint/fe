/**
 * mockAllergyData.js
 * Dữ liệu mẫu tra cứu thông tin dị ứng cho School Health Officer (FoodPrint).
 * 
 * Bám sát nghiệp vụ FoodPrint & DB PostgreSQL v5.4:
 * - Không có Student entity, không có thông tin cá nhân học sinh.
 * - Thông tin dị ứng tổng hợp theo Class và IngredientEntry.
 * - Mỗi bản ghi có số lượng học sinh bị ảnh hưởng (affected_count).
 */

export const MOCK_ACADEMIC_YEARS = [
  { value: "ALL", label: "Tất cả năm học" },
  { value: "2026-2027", label: "Năm học 2026 - 2027" },
  { value: "2025-2026", label: "Năm học 2025 - 2026" },
]

export const MOCK_CLASS_ALLERGIES = [
  {
    id: "cls-3a",
    className: "Lớp 3A",
    grade: 3,
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Nguyễn Thị Hoa",
    updatedAt: "24/10/2026",
    allergies: [
      {
        id: "alg-3a-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-001",
        ingredientName: "Đậu phộng",
        category: "Các loại hạt",
        affectedCount: 1,
        updatedAt: "24/10/2026",
      },
    ],
  },
  {
    id: "cls-3b",
    className: "Lớp 3B",
    grade: 3,
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Trần Thu Trang",
    updatedAt: "25/10/2026",
    allergies: [
      {
        id: "alg-3b-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-001",
        ingredientName: "Đậu phộng",
        category: "Các loại hạt",
        affectedCount: 2,
        updatedAt: "25/10/2026",
      },
    ],
  },
  {
    id: "cls-4a",
    className: "Lớp 4A",
    grade: 4,
    academicYear: "2026-2027",
    homeroomTeacher: "Thầy Lê Anh Tuấn",
    updatedAt: "26/10/2026",
    allergies: [
      {
        id: "alg-4a-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-001",
        ingredientName: "Đậu phộng",
        category: "Các loại hạt",
        affectedCount: 1,
        updatedAt: "26/10/2026",
      },
    ],
  },
  {
    id: "cls-2b",
    className: "Lớp 2B",
    grade: 2,
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Hoàng Thảo My",
    updatedAt: "27/10/2026",
    allergies: [
      {
        id: "alg-2b-1",
        ingredientId: "ing-shrimp",
        ingredientCode: "ING-002",
        ingredientName: "Tôm sú",
        category: "Thủy hải sản",
        affectedCount: 3,
        updatedAt: "27/10/2026",
      },
      {
        id: "alg-2b-2",
        ingredientId: "ing-egg",
        ingredientCode: "ING-003",
        ingredientName: "Trứng gà",
        category: "Trứng & Gia cầm",
        affectedCount: 1,
        updatedAt: "27/10/2026",
      },
    ],
  },
  {
    id: "cls-5a",
    className: "Lớp 5A",
    grade: 5,
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Đặng Thu Hà",
    updatedAt: "28/10/2026",
    allergies: [
      {
        id: "alg-5a-1",
        ingredientId: "ing-cow-milk",
        ingredientCode: "ING-004",
        ingredientName: "Sữa bò tươi",
        category: "Sữa & Chế phẩm",
        affectedCount: 2,
        updatedAt: "28/10/2026",
      },
    ],
  },
]

/**
 * Tính toán 2 chỉ số KPI nhỏ gọn:
 * 1. Số lớp có ghi nhận dị ứng
 * 2. Số loại nguyên liệu được ghi nhận dị ứng
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
