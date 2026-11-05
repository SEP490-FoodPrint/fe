/**
 * Dữ liệu Thực đơn Tuần Học đường Chuẩn cho Bếp ăn
 * Đầy đủ trạng thái lô chế biến thực tế (Đã lập lô / Chưa lập lô)
 */

export const DEFAULT_WEEKLY_MENU = {
  // 1. THỨ HAI (Monday)
  1: {
    dayOfWeek: 1,
    dayIndexLabel: "T2",
    dayLabel: "Thứ Hai",
    meals: {
      LUNCH: {
        mealType: "LUNCH",
        mealLabel: "Bữa trưa (11:00)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-mon-1", name: "Thịt heo kho nước dừa", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-mon-01" },
          { id: "dish-mon-2", name: "Đậu cô ve xào thịt nạc xay", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-mon-02" },
          { id: "dish-mon-3", name: "Canh bí đao sườn heo", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-mon-4", name: "Cơm trắng dẻo thơm", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-mon-03" },
          { id: "dish-mon-5", name: "Thanh long ruột đỏ", portions: 1250, unit: "suất", isBatchCreated: false },
        ],
      },
      AFTERNOON: {
        mealType: "AFTERNOON",
        mealLabel: "Bữa xế (14:30)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-mon-6", name: "Bánh bao hấp nhân thịt", portions: 1250, unit: "suất", isBatchCreated: false },
        ],
      },
    },
  },

  // 2. THỨ BA (Tuesday)
  2: {
    dayOfWeek: 2,
    dayIndexLabel: "T3",
    dayLabel: "Thứ Ba",
    meals: {
      LUNCH: {
        mealType: "LUNCH",
        mealLabel: "Bữa trưa (11:00)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-tue-1", name: "Gà ta rang gừng thơm", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-tue-01" },
          { id: "dish-tue-2", name: "Bắp cải xào nấm tươi", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-tue-3", name: "Canh ngao nấu chua thì là", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-tue-4", name: "Cơm tám thơm Hải Hậu", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-tue-02" },
          { id: "dish-tue-5", name: "Chuối tiêu hồng", portions: 1250, unit: "quả", isBatchCreated: false },
        ],
      },
      AFTERNOON: {
        mealType: "AFTERNOON",
        mealLabel: "Bữa xế (14:30)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-tue-6", name: "Chè hạt sen long nhãn", portions: 1250, unit: "suất", isBatchCreated: false },
        ],
      },
    },
  },

  // 3. THỨ TƯ (Wednesday)
  3: {
    dayOfWeek: 3,
    dayIndexLabel: "T4",
    dayLabel: "Thứ Tư",
    meals: {
      LUNCH: {
        mealType: "LUNCH",
        mealLabel: "Bữa trưa (11:00)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-wed-1", name: "Cá ba sa phi lê sốt cà chua", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-wed-01" },
          { id: "dish-wed-2", name: "Trứng đúc thịt nạc vai", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-wed-02" },
          { id: "dish-wed-3", name: "Canh rau ngót nấu thịt băm", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-wed-4", name: "Cơm trắng dẻo thơm", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-wed-03" },
          { id: "dish-wed-5", name: "Dưa hấu đỏ Long An", portions: 1250, unit: "suất", isBatchCreated: false },
        ],
      },
      AFTERNOON: {
        mealType: "AFTERNOON",
        mealLabel: "Bữa xế (14:30)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-wed-6", name: "Chè / Mì kẹp xúc xích tiệt trùng", portions: 1250, unit: "suất", isBatchCreated: false },
        ],
      },
    },
  },

  // 4. THỨ NĂM (Thursday)
  4: {
    dayOfWeek: 4,
    dayIndexLabel: "T4",
    dayLabel: "Thứ Năm",
    meals: {
      LUNCH: {
        mealType: "LUNCH",
        mealLabel: "Bữa trưa (11:00)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-thu-1", name: "Thịt bò xào củ quả thập cẩm", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-thu-2", name: "Đậu phụ rán sốt cà chua hành hoa", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-thu-3", name: "Canh cải ngọt nấu tôm băm", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-thu-4", name: "Cơm tám thơm Hải Hậu", portions: 1250, unit: "suất", isBatchCreated: true, batchId: "b-thu-01" },
          { id: "dish-thu-5", name: "Táo Envy tráng miệng", portions: 1250, unit: "quả", isBatchCreated: false },
        ],
      },
      AFTERNOON: {
        mealType: "AFTERNOON",
        mealLabel: "Bữa xế (14:30)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-thu-6", name: "Bánh bông lan trứng muối chà bông", portions: 1250, unit: "suất", isBatchCreated: false },
        ],
      },
    },
  },

  // 5. THỨ SÁU (Friday)
  5: {
    dayOfWeek: 5,
    dayIndexLabel: "T6",
    dayLabel: "Thứ Sáu",
    meals: {
      LUNCH: {
        mealType: "LUNCH",
        mealLabel: "Bữa trưa (11:00)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-fri-1", name: "Sườn heo rim mặn ngọt", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-fri-2", name: "Chả quế hấp cắt lát", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-fri-3", name: "Canh cua đồng mồng tơi mướp hương", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-fri-4", name: "Cơm trắng dẻo thơm", portions: 1250, unit: "suất", isBatchCreated: false },
          { id: "dish-fri-5", name: "Bưởi da xanh Bến Tre", portions: 1250, unit: "quả", isBatchCreated: false },
        ],
      },
      AFTERNOON: {
        mealType: "AFTERNOON",
        mealLabel: "Bữa xế (14:30)",
        totalPortions: 1250,
        dishes: [
          { id: "dish-fri-6", name: "Phở bò Hà Nội mini", portions: 1250, unit: "suất", isBatchCreated: false },
        ],
      },
    },
  },
}
