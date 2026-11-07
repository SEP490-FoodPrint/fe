/**
 * mockAllergyData.js
 * Dữ liệu mẫu tra cứu thông tin dị ứng cho School Health Officer (FoodPrint).
 * 
 * Bám sát DB PostgreSQL FoodPrint v5.4:
 * - Bảng `classes`: (id, school_id, name, academic_year, registered_meal_portions, status)
 *   -> Không có trường `grade` (khối lớp).
 * - Bảng `class_allergies`: (class_id, ingredient_entry_id, affected_count, updated_by_user_id, updated_at).
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
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Nguyễn Thị Hoa",
    allergies: [
      {
        id: "alg-3a-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-001",
        ingredientName: "Đậu phộng",
        category: "Các loại hạt",
        affectedCount: 1,
      },
    ],
  },
  {
    id: "cls-3b",
    className: "Lớp 3B",
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Trần Thu Trang",
    allergies: [
      {
        id: "alg-3b-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-001",
        ingredientName: "Đậu phộng",
        category: "Các loại hạt",
        affectedCount: 2,
      },
    ],
  },
  {
    id: "cls-4a",
    className: "Lớp 4A",
    academicYear: "2026-2027",
    homeroomTeacher: "Thầy Lê Anh Tuấn",
    allergies: [
      {
        id: "alg-4a-1",
        ingredientId: "ing-peanuts",
        ingredientCode: "ING-001",
        ingredientName: "Đậu phộng",
        category: "Các loại hạt",
        affectedCount: 1,
      },
    ],
  },
  {
    id: "cls-2b",
    className: "Lớp 2B",
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Hoàng Thảo My",
    allergies: [
      {
        id: "alg-2b-1",
        ingredientId: "ing-shrimp",
        ingredientCode: "ING-002",
        ingredientName: "Tôm sú",
        category: "Thủy hải sản",
        affectedCount: 3,
      },
      {
        id: "alg-2b-2",
        ingredientId: "ing-egg",
        ingredientCode: "ING-003",
        ingredientName: "Trứng gà",
        category: "Trứng & Gia cầm",
        affectedCount: 1,
      },
    ],
  },
  {
    id: "cls-5a",
    className: "Lớp 5A",
    academicYear: "2026-2027",
    homeroomTeacher: "Cô Đặng Thu Hà",
    allergies: [
      {
        id: "alg-5a-1",
        ingredientId: "ing-cow-milk",
        ingredientCode: "ING-004",
        ingredientName: "Sữa bò tươi",
        category: "Sữa & Chế phẩm",
        affectedCount: 2,
      },
    ],
  },
]

/**
 * Tính toán 2 chỉ số KPI:
 * 1. Số lớp có ghi nhận dị ứng
 * 2. Số nguyên liệu dị ứng
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
