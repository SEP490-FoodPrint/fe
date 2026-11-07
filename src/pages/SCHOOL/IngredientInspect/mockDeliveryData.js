/**
 * Dữ liệu mẫu (Mock Data) chuẩn hóa theo Database Schema PostgreSQL v5.4
 * Bảng: deliveries, delivery_items, ingredient_lots, suppliers, ingredient_quality_feedback
 * Phục vụ nghiệp vụ Theo dõi & Đánh giá chất lượng giao hàng - School Health Officer
 */

export const INITIAL_DELIVERIES = [
  {
    id: "fb17c225-a940-57ca-aa30-049c8bd910b2",
    deliveryNo: "FP-DEMO-DEL-001",
    supplyRequestId: "397b7012-3b3c-544d-a079-7a76714bf44a",
    supplyRequestNo: "REQ-20261023-001",
    supplierId: "fd161c1b-6f2d-5c8d-ab59-f430cfc2415a",
    supplierName: "VinaFresh Farm",
    supplierFullCompany: "Công ty TNHH Nông sản Sạch VinaFresh",
    supplierPhone: "024.3888.6789",
    status: "RECEIVED",
    expectedArrivalAt: "2026-10-24T06:30:00+07:00",
    arrivedAt: "2026-10-24T06:45:00+07:00",
    receivedAt: "2026-10-24T07:10:00+07:00",
    vehiclePlate: "29B-441.90",
    note: "Giao nguyên liệu chuẩn bị bữa trưa và bữa phụ chiều. Xe thùng lạnh 4°C.",
    deliveryItems: [
      {
        id: "54f9e458-951a-593b-8523-9c716fef1c67",
        ingredientName: "Gạo tẻ ST25",
        category: "Lương thực",
        requestedQuantity: 8.0,
        actualQuantity: 8.0,
        unit: "kg",
        note: "Đóng bao 5kg và 3kg có niêm phong",
        ingredientLots: [
          {
            id: "2c098c77-f3a9-5dc9-9ff7-3ee52227dbfe",
            lotCode: "FP-DEMO-LOT-RICE-001",
            sourceFacility: "Nhà máy Chế biến Lương thực Sóc Trăng",
            manufactureDate: "2026-10-18",
            expiryDate: "2027-04-18",
            receivedQuantity: 5.0,
            unit: "kg",
            status: "AVAILABLE",
          },
          {
            id: "3ace7f45-c86f-5688-8ff8-1c83f4922818",
            lotCode: "FP-DEMO-LOT-RICE-002",
            sourceFacility: "Nhà máy Chế biến Lương thực Sóc Trăng",
            manufactureDate: "2026-10-20",
            expiryDate: "2027-04-20",
            receivedQuantity: 3.0,
            unit: "kg",
            status: "AVAILABLE",
          },
        ],
      },
      {
        id: "9b7a8419-dfa5-50e1-9360-bbc7ea422475",
        ingredientName: "Cà rốt Đà Lạt",
        category: "Rau củ",
        requestedQuantity: 3.0,
        actualQuantity: 3.0,
        unit: "kg",
        note: "Củ đều, không dập nát, đóng thùng carton đục lỗ",
        ingredientLots: [
          {
            id: "c011bab5-a260-5a10-9ab2-fbc8ca44b570",
            lotCode: "FP-DEMO-LOT-CARROT-001",
            sourceFacility: "Hợp tác xã Rau sạch Đơn Dương - Lâm Đồng",
            manufactureDate: "2026-10-22",
            expiryDate: "2026-10-28",
            receivedQuantity: 2.0,
            unit: "kg",
            status: "AVAILABLE",
          },
          {
            id: "da65b954-2916-5e64-92da-dfcdf439c35d",
            lotCode: "FP-DEMO-LOT-CARROT-002",
            sourceFacility: "Hợp tác xã Rau sạch Đơn Dương - Lâm Đồng",
            manufactureDate: "2026-10-22",
            expiryDate: "2026-10-28",
            receivedQuantity: 1.0,
            unit: "kg",
            status: "DEPLETED",
          },
        ],
      },
    ],
  },
  {
    id: "297d926f-61cc-53c0-a410-c886cf0bf78c",
    deliveryNo: "FP-DEMO-DEL-002",
    supplyRequestId: "e2825b30-66a3-5dd8-92c2-7b5154438938",
    supplyRequestNo: "REQ-20261024-002",
    supplierId: "8b52e391-4e12-4c6d-921a-96944e05b381",
    supplierName: "HTX Nông nghiệp Ba Vì",
    supplierFullCompany: "Hợp tác xã Nông nghiệp Công nghệ cao Ba Vì",
    supplierPhone: "024.3396.1122",
    status: "ARRIVED",
    expectedArrivalAt: "2026-10-24T07:00:00+07:00",
    arrivedAt: "2026-10-24T07:10:00+07:00",
    receivedAt: null,
    vehiclePlate: "29C-882.15",
    note: "Xe đang đỗ tại cổng phụ số 2. Chờ đại diện trường tiếp nhận.",
    deliveryItems: [
      {
        id: "71e5481b-a912-4c28-9844-315f6291a823",
        ingredientName: "Rau muống hữu cơ",
        category: "Rau xanh",
        requestedQuantity: 15.0,
        actualQuantity: 15.0,
        unit: "kg",
        note: "Bó cuống ngắn, chuẩn VietGAP",
        ingredientLots: [
          {
            id: "a143891b-8521-4d32-8cb2-463991823901",
            lotCode: "FP-DEMO-LOT-SPIN-001",
            sourceFacility: "Cánh đồng Rau hữu cơ Ba Vì Lô A3",
            manufactureDate: "2026-10-24",
            expiryDate: "2026-10-26",
            receivedQuantity: 15.0,
            unit: "kg",
            status: "AVAILABLE",
          },
        ],
      },
      {
        id: "8c772b14-419b-463d-883a-48a60421739c",
        ingredientName: "Thịt nạc vai heo",
        category: "Thực phẩm tươi sống",
        requestedQuantity: 12.0,
        actualQuantity: 12.0,
        unit: "kg",
        note: "Thịt tươi mổ sáng sớm, kiểm dịch thú y đầy đủ",
        ingredientLots: [
          {
            id: "f83910c2-7744-42b1-91a3-289551bc4428",
            lotCode: "FP-DEMO-LOT-PORK-001",
            sourceFacility: "Trang trại Heo an toàn sinh học Ba Vì",
            manufactureDate: "2026-10-24",
            expiryDate: "2026-10-25",
            receivedQuantity: 12.0,
            unit: "kg",
            status: "AVAILABLE",
          },
        ],
      },
    ],
  },
  {
    id: "3b51e944-941d-544a-b68b-8b986dc4156c",
    deliveryNo: "FP-DEMO-DEL-003",
    supplyRequestId: "f09b90e2-bb9b-55ba-bd04-a6547b205984",
    supplyRequestNo: "REQ-20261024-003",
    supplierId: "fd161c1b-6f2d-5c8d-ab59-f430cfc2415a",
    supplierName: "VinaFresh Farm",
    supplierFullCompany: "Công ty TNHH Nông sản Sạch VinaFresh",
    supplierPhone: "024.3888.6789",
    status: "IN_TRANSIT",
    expectedArrivalAt: "2026-10-24T08:00:00+07:00",
    arrivedAt: null,
    receivedAt: null,
    vehiclePlate: "29D-119.42",
    note: "Đang trên hành trình từ kho trung chuyển Gia Lâm đến trường.",
    deliveryItems: [
      {
        id: "e492bb1a-5512-4c77-9812-74823901ba83",
        ingredientName: "Khoai tây vàng Đà Lạt",
        category: "Rau củ",
        requestedQuantity: 10.0,
        actualQuantity: 10.0,
        unit: "kg",
        note: "Không mọc mầm, củ khô ráo",
        ingredientLots: [
          {
            id: "d9182374-1294-49ab-8113-582910482b99",
            lotCode: "FP-DEMO-LOT-POTATO-001",
            sourceFacility: "Hợp tác xã Nông sản Lạc Dương",
            manufactureDate: "2026-10-21",
            expiryDate: "2026-11-10",
            receivedQuantity: 10.0,
            unit: "kg",
            status: "AVAILABLE",
          },
        ],
      },
    ],
  },
  {
    id: "4471c082-8821-5a23-8182-993817462819",
    deliveryNo: "FP-DEMO-DEL-004",
    supplyRequestId: "99182347-1928-4822-ba33-847291038291",
    supplyRequestNo: "REQ-20261023-015",
    supplierId: "e9912837-1284-4822-99bb-182746392011",
    supplierName: "Nông sản Bến Tre",
    supplierFullCompany: "Công ty Cổ phần Nông sản Xanh Bến Tre",
    supplierPhone: "0275.3822.456",
    status: "RECEIVED",
    expectedArrivalAt: "2026-10-23T06:15:00+07:00",
    arrivedAt: "2026-10-23T06:20:00+07:00",
    receivedAt: "2026-10-23T06:40:00+07:00",
    vehiclePlate: "71B-302.88",
    note: "Đã giao hoa quả tráng miệng tuần học thứ 8.",
    deliveryItems: [
      {
        id: "2284910b-1928-4821-ba38-192837465920",
        ingredientName: "Bưởi da xanh",
        category: "Trái cây",
        requestedQuantity: 25.0,
        actualQuantity: 25.0,
        unit: "kg",
        note: "Quả loại 1, vỏ mỏng ruột hồng",
        ingredientLots: [
          {
            id: "55910283-4819-4820-aa38-192837461928",
            lotCode: "FP-DEMO-LOT-POMELO-001",
            sourceFacility: "Vùng trồng Bưởi đặc sản Giồng Trôm",
            manufactureDate: "2026-10-21",
            expiryDate: "2026-11-05",
            receivedQuantity: 25.0,
            unit: "kg",
            status: "AVAILABLE",
          },
        ],
      },
    ],
  },
  {
    id: "bf8fc144-941d-544a-b68b-8b986dc4156c",
    deliveryNo: "FP-DEMO-DEL-005",
    supplyRequestId: "f09b90e2-bb9b-55ba-bd04-a6547b205984",
    supplyRequestNo: "REQ-20261025-001",
    supplierId: "fd161c1b-6f2d-5c8d-ab59-f430cfc2415a",
    supplierName: "VinaFresh Farm",
    supplierFullCompany: "Công ty TNHH Nông sản Sạch VinaFresh",
    supplierPhone: "024.3888.6789",
    status: "CREATED",
    expectedArrivalAt: "2026-10-25T08:30:00+07:00",
    arrivedAt: null,
    receivedAt: null,
    vehiclePlate: null,
    note: "Lịch giao theo đơn đặt hàng trước ngày Chủ nhật. Chưa xuất phát.",
    deliveryItems: [
      {
        id: "91823746-1294-4821-bb38-482910382911",
        ingredientName: "Trứng gà ta thảo dược",
        category: "Thực phẩm tươi sống",
        requestedQuantity: 150.0,
        actualQuantity: 150.0,
        unit: "quả",
        note: "Xếp khay vỉ carton 30 quả",
        ingredientLots: [],
      },
    ],
  },
]

/**
 * Danh sách phản hồi chất lượng (IngredientQualityFeedback)
 * Khởi tạo với 2 bản ghi mẫu trích xuất từ database demo SQL v5.4
 */
export const INITIAL_FEEDBACKS = [
  {
    id: "b051e7fb-7970-5ca6-a48e-28581ec3c8b0",
    deliveryId: "fb17c225-a940-57ca-aa30-049c8bd910b2",
    deliveryNo: "FP-DEMO-DEL-001",
    supplierId: "fd161c1b-6f2d-5c8d-ab59-f430cfc2415a",
    supplierName: "VinaFresh Farm",
    ingredientLotId: "c011bab5-a260-5a10-9ab2-fbc8ca44b570",
    lotCode: "FP-DEMO-LOT-CARROT-001",
    ingredientName: "Cà rốt Đà Lạt",
    submittedByUserId: "c28e8442-4623-5d32-a96e-1e2f80e96a73",
    submittedByName: "BS. Nguyễn Thu Trang",
    submittedByRole: "Chuyên viên Y tế học đường",
    title: "Nhãn lô cà rốt khó đọc",
    description:
      "Tem in mã vạch và ngày thu hoạch bị nhòe mực do hơi lạnh trong thùng xe. Đề nghị Supplier bổ sung tem nhãn chống thấm nước rõ hơn; không đánh giá nguyên liệu bị hỏng hay ảnh hưởng độ tươi.",
    status: "RESPONDED",
    supplierResponse:
      "VinaFresh Farm trân trọng cảm ơn phản hồi của Ban Y tế nhà trường. Chúng tôi đã ghi nhận và bổ sung tem phủ nilon chống ẩm cho toàn bộ các lô giao từ ngày mai, đồng thời gửi mã lô điện tử đối soát kèm theo biên bản giao nhận.",
    respondedByUserId: "924bad15-e1a9-5d47-8c04-9258d4884771",
    respondedByName: "Nguyễn Văn Tuấn (Bộ phận CSKH & QC VinaFresh)",
    respondedAt: "2026-10-24T07:40:00+07:00",
    createdAt: "2026-10-24T07:20:00+07:00",
  },
  {
    id: "305f27f7-a239-5004-bc7e-735faa6e8314",
    deliveryId: "fb17c225-a940-57ca-aa30-049c8bd910b2",
    deliveryNo: "FP-DEMO-DEL-001",
    supplierId: "fd161c1b-6f2d-5c8d-ab59-f430cfc2415a",
    supplierName: "VinaFresh Farm",
    ingredientLotId: "2c098c77-f3a9-5dc9-9ff7-3ee52227dbfe",
    lotCode: "FP-DEMO-LOT-RICE-001",
    ingredientName: "Gạo tẻ ST25",
    submittedByUserId: "c28e8442-4623-5d32-a96e-1e2f80e96a73",
    submittedByName: "BS. Nguyễn Thu Trang",
    submittedByRole: "Chuyên viên Y tế học đường",
    title: "Bao bì gạo cần kiểm tra mép dán",
    description:
      "Bao bì có vết cọ xát nhẹ ở góc dưới mép dán do vận chuyển xếp chồng. Hạt gạo bên trong còn nguyên vẹn, bao bì chưa rách hở; ghi nhận để Supplier lưu ý quy cách bọc lót khi vận chuyển chuyến tiếp theo.",
    status: "SUBMITTED",
    supplierResponse: null,
    respondedByUserId: null,
    respondedByName: null,
    respondedAt: null,
    createdAt: "2026-10-24T08:00:00+07:00",
  },
]

/**
 * Bản đồ nhãn và màu sắc trạng thái DeliveryStatus theo quy chuẩn tiếng Việt
 */
export const DELIVERY_STATUS_CONFIG = {
  CREATED: {
    label: "Đã tạo",
    bg: "#f1f5f9",
    color: "#475569",
    border: "#cbd5e1",
    dot: "#94a3b8",
  },
  IN_TRANSIT: {
    label: "Đang vận chuyển",
    bg: "#e0f2fe",
    color: "#0369a1",
    border: "#bae6fd",
    dot: "#0284c7",
    pulse: true,
  },
  ARRIVED: {
    label: "Đã đến trường",
    bg: "#fef3c7",
    color: "#b45309",
    border: "#fde68a",
    dot: "#d97706",
  },
  PENDING_APPROVAL: {
    label: "Chờ phê duyệt",
    bg: "#fef9c3",
    color: "#854d0e",
    border: "#fef08a",
    dot: "#ca8a04",
  },
  APPROVED: {
    label: "Đã phê duyệt",
    bg: "#dcfce7",
    color: "#15803d",
    border: "#bbf7d0",
    dot: "#16a34a",
  },
  REJECTED: {
    label: "Bị từ chối",
    bg: "#fee2e2",
    color: "#b91c1c",
    border: "#fecaca",
    dot: "#dc2626",
  },
  RECEIVED: {
    label: "Đã tiếp nhận",
    bg: "#eaf7f0",
    color: "#0a8066",
    border: "#bbf0da",
    dot: "#00654f",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "#f1f5f9",
    color: "#64748b",
    border: "#e2e8f0",
    dot: "#94a3b8",
  },
  CANCELLED_MEAL: {
    label: "Đã hủy theo quy trình",
    bg: "#f1f5f9",
    color: "#64748b",
    border: "#e2e8f0",
    dot: "#94a3b8",
  },
}

/**
 * Bản đồ nhãn và màu sắc phản hồi IngredientQualityFeedbackStatus
 */
export const FEEDBACK_STATUS_CONFIG = {
  SUBMITTED: {
    label: "Đang chờ phản hồi",
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  RESPONDED: {
    label: "Đã phản hồi",
    bg: "#eaf7f0",
    color: "#0a8066",
    border: "#bbf0da",
    dot: "#00654f",
  },
}

/**
 * Trạng thái của lô nguyên liệu (IngredientLotStatus)
 */
export const LOT_STATUS_CONFIG = {
  AVAILABLE: {
    label: "Có sẵn",
    bg: "#eaf7f0",
    color: "#0a8066",
  },
  DEPLETED: {
    label: "Đã dùng hết",
    bg: "#f1f5f9",
    color: "#64748b",
  },
  BLOCKED: {
    label: "Tạm khóa",
    bg: "#fee2e2",
    color: "#b91c1c",
  },
}

