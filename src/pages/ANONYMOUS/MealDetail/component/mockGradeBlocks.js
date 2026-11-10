/**
 * Mock Data & Helpers: Khối lớp học đường (Grade Blocks)
 * Hỗ trợ các trường có phân khối (Khối 1-3, Khối 4-5) hoặc khối mặc định
 */

export const MOCK_GRADE_BLOCKS = [
  {
    id: "BLOCK_1_3",
    name: "Khối 1 - 3",
    description: "Học sinh các lớp 1, 2, 3",
    isDefault: true,
  },
  {
    id: "BLOCK_4_5",
    name: "Khối 4 - 5",
    description: "Học sinh các lớp 4, 5",
    isDefault: false,
  },
];

/**
 * Xử lý danh sách khối theo dữ liệu của trường:
 * - Nếu trường có cấu hình blocks: trả về blocks đó.
 * - Nếu không có nhưng có khối mặc định: trả về khối mặc định.
 * - Nếu không có gì: trả về mảng rỗng để hiển thị 'Không có khối nào'.
 */
export function resolveSchoolGradeBlocks(schoolGradeBlocks, defaultBlockName) {
  if (Array.isArray(schoolGradeBlocks) && schoolGradeBlocks.length > 0) {
    return schoolGradeBlocks;
  }
  if (defaultBlockName) {
    return [
      {
        id: "DEFAULT_BLOCK",
        name: defaultBlockName,
        description: "Khối học áp dụng cho toàn trường",
        isDefault: true,
      },
    ];
  }
  return MOCK_GRADE_BLOCKS;
}
