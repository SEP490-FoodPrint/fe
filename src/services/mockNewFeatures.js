import STORAGE, { getStorage } from "src/lib/storage"
import { ROLES } from "src/constants/roles"

const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms))
const clone = value => JSON.parse(JSON.stringify(value))

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString()
}

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString()
}

function todayYmd(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400 * 1000)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function getCurrentUser() {
  const user = getStorage(STORAGE.USER_INFO)
  return {
    id: user?.id || user?.userId || "mock-current-user",
    fullName: user?.fullName || "Người dùng hiện tại",
    role: user?.role || ROLES.PARENTS_COMMITTEE,
    orgType: user?.orgType || "SCHOOL",
    orgName: user?.orgName || user?.schoolName || "Trường Tiểu học Cầu Giấy",
  }
}

function makeHttpError(status, message, { code = null, fields = null } = {}) {
  const err = new Error(message)
  err.response = {
    status,
    data: {
      success: false,
      statusCode: status,
      message,
      error: {
        ...(code ? { code } : {}),
        ...(fields ? { fields } : {}),
      },
    },
  }
  return err
}

function randomDigits(len = 5) {
  return String(Math.floor(10000 + Math.random() * 89999)).slice(0, len)
}

function paginateArray(items, page = 1, limit = 20) {
  const p = Math.max(1, Number(page) || 1)
  const l = Math.min(100, Math.max(1, Number(limit) || 20))
  const start = (p - 1) * l
  const sliced = items.slice(start, start + l)
  return {
    items: clone(sliced),
    pagination: {
      page: p,
      limit: l,
      hasNext: start + l < items.length,
    },
  }
}

/* ============================================================================
 * 1. LOCATIONS (PROVINCE level=1 -> WARD level=2)
 * ========================================================================== */
const MOCK_LOCATIONS = [
  { id: "loc-p-hn", code: "01", name: "Thành phố Hà Nội", type: "PROVINCE", level: 1, parentId: null },
  { id: "loc-w-dv", code: "00166", name: "Phường Dịch Vọng", type: "WARD", level: 2, parentId: "loc-p-hn" },
  { id: "loc-w-yh", code: "00169", name: "Phường Yên Hòa", type: "WARD", level: 2, parentId: "loc-p-hn" },
  { id: "loc-w-nd", code: "00157", name: "Phường Nghĩa Đô", type: "WARD", level: 2, parentId: "loc-p-hn" },
  { id: "loc-w-da", code: "00460", name: "Xã Đông Anh", type: "COMMUNE", level: 2, parentId: "loc-p-hn" },

  { id: "loc-p-hcm", code: "79", name: "Thành phố Hồ Chí Minh", type: "PROVINCE", level: 1, parentId: null },
  { id: "loc-w-bn", code: "26740", name: "Phường Bến Nghé", type: "WARD", level: 2, parentId: "loc-p-hcm" },
  { id: "loc-w-td", code: "27088", name: "Phường Thảo Điền", type: "WARD", level: 2, parentId: "loc-p-hcm" },
  { id: "loc-w-nb", code: "27649", name: "Xã Nhà Bè", type: "COMMUNE", level: 2, parentId: "loc-p-hcm" },

  { id: "loc-p-dn", code: "48", name: "Thành phố Đà Nẵng", type: "PROVINCE", level: 1, parentId: null },
  { id: "loc-w-hc1", code: "20230", name: "Phường Hải Châu I", type: "WARD", level: 2, parentId: "loc-p-dn" },
  { id: "loc-w-ma", code: "20284", name: "Phường Mỹ An", type: "WARD", level: 2, parentId: "loc-p-dn" },
]

export async function mockGetPublicLocations() {
  await delay(120)
  return clone(MOCK_LOCATIONS)
}

export async function mockUpdateDirectoryLocation(kind, id, locationId) {
  await delay(200)
  const ward = MOCK_LOCATIONS.find(l => l.id === locationId && l.level === 2)
  if (!ward) {
    throw makeHttpError(400, "Phường/xã không hợp lệ.", {
      fields: [{ field: "locationId", message: "Vui lòng chọn phường/xã hợp lệ." }],
    })
  }
  return {
    success: true,
    data: {
      id,
      name: kind === "school" ? "Trường Tiểu học Cầu Giấy" : "Công ty Thực phẩm Xanh An Việt",
      location: { id: ward.id, code: ward.code, name: ward.name },
    },
  }
}

/* ============================================================================
 * 2. TICKET HELPERS (ROLE-AWARE displayStatus & allowedActions)
 * ========================================================================== */
function computeTicketProjection(ticket, { isHandler, isRequester, allowEscalate = false }) {
  const status = ticket.status
  let displayStatus = status
  if (!isHandler && (status === "NEW" || status === "REOPENED")) {
    displayStatus = "IN_PROGRESS"
  }

  const allowedActions = []
  if (isHandler) {
    if (status === "NEW" || status === "REOPENED") allowedActions.push("ACCEPT")
    if (status === "IN_PROGRESS") allowedActions.push("COMMENT", "RESOLVE")
  }
  if (isRequester) {
    if (["NEW", "IN_PROGRESS", "REOPENED"].includes(status)) allowedActions.push("COMMENT")
    if (status === "RESOLVED") {
      allowedActions.push("SATISFY", "REOPEN")
      if (allowEscalate) allowedActions.push("ESCALATE")
    }
  }

  const lastComment = ticket.comments?.[ticket.comments.length - 1]
  const hasNewMessage = isHandler
    ? Boolean(
        lastComment?.authorSide === "REQUESTER" &&
          ["NEW", "IN_PROGRESS", "REOPENED"].includes(status),
      )
    : Boolean(lastComment?.authorSide === "HANDLER" && status === "IN_PROGRESS")

  return {
    ...clone(ticket),
    displayStatus,
    hasNewMessage,
    allowedActions,
  }
}

/* ============================================================================
 * 3. C03 MEAL COMPLAINTS & C05 AUTHORITY COMPLAINTS
 * ========================================================================== */
const mealComplaintsStore = [
  {
    id: "mc-10425",
    code: "FP-MC-10425",
    title: "Cơm bữa trưa lớp 2A1 bị khô và canh ít rau",
    complaintType: "MEAL_QUALITY",
    description:
      "Phụ huynh ghi nhận phản ánh của nhiều học sinh lớp 2A1 rằng cơm bữa trưa hôm nay khá khô, khó nuốt và phần canh cải ngọt gần như chỉ có nước, rất ít rau. Đề nghị Ban Giám hiệu kiểm tra lại định lượng chia suất tại bếp.",
    status: "NEW",
    closeReason: null,
    lastResolvedAt: null,
    resolvedCount: 0,
    feedbackDeadlineAt: null,
    closedAt: null,
    submittedAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    submitter: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
    meal: {
      dailyMealPortionId: "dmp-2a1-lunch",
      allocationId: "alloc-2a1-lunch",
      allocationStatus: "DISTRIBUTED",
      classId: "cls-2a1",
      className: "Lớp 2A1",
      academicYear: "2026-2027",
      mealDate: todayYmd(0),
      mealType: "LUNCH",
    },
    escalatedAuthorityComplaint: null,
    comments: [],
  },
  {
    id: "mc-10422",
    code: "FP-MC-10422",
    title: "Sữa chua bữa xế lớp 3A2 để ngoài lâu, không đủ độ mát",
    complaintType: "FOOD_HYGIENE",
    description:
      "Lúc 14h45 phát bữa xế cho lớp 3A2, nhiều hộp sữa chua đã ấm do lấy ra khỏi tủ mát quá sớm. Đề nghị nhà trường kiểm tra quy trình bảo quản trước giờ chia suất.",
    status: "REOPENED",
    closeReason: null,
    lastResolvedAt: hoursAgo(12),
    resolvedCount: 1,
    feedbackDeadlineAt: null,
    closedAt: null,
    submittedAt: hoursAgo(30),
    updatedAt: hoursAgo(3),
    submitter: { id: "u-teacher-1", fullName: "Trần Thu Trang (GVCN 3A2)" },
    meal: {
      dailyMealPortionId: "dmp-3a2-afternoon",
      allocationId: "alloc-3a2-afternoon",
      allocationStatus: "DISTRIBUTED",
      classId: "cls-3a2",
      className: "Lớp 3A2",
      academicYear: "2026-2027",
      mealDate: todayYmd(-1),
      mealType: "AFTERNOON",
    },
    escalatedAuthorityComplaint: null,
    comments: [
      {
        id: "c-mc-422-1",
        authorSide: "HANDLER",
        commentType: "RESOLUTION",
        content:
          "Nhà trường đã nhắc nhở bộ phận bếp chỉ lấy sữa chua khỏi tủ mát trước giờ phục vụ tối đa 15 phút và ghi nhật ký nhiệt độ tủ lạnh mỗi sáng.",
        createdAt: hoursAgo(12),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
      {
        id: "c-mc-422-2",
        authorSide: "REQUESTER",
        commentType: "REOPEN_NOTE",
        content:
          "Hôm nay tình trạng vẫn lặp lại ở khay cuối cùng của lớp 3A2, mong Ban Giám hiệu kiểm tra lại nhiệt độ ngăn mát tủ số 2.",
        createdAt: hoursAgo(3),
        author: { id: "u-teacher-1", fullName: "Trần Thu Trang (GVCN 3A2)" },
      },
    ],
  },
  {
    id: "mc-10421",
    code: "FP-MC-10421",
    title: "Thịt kho tàu hơi mặn so với khẩu vị học sinh lớp 1",
    complaintType: "MEAL_QUALITY",
    description:
      "Nhiều bé lớp 1A3 phản ánh món thịt kho tàu trưa qua bị mặn nên ăn ít cơm. Đề nghị bếp điều chỉnh giảm lượng gia vị cho khối lớp 1.",
    status: "IN_PROGRESS",
    closeReason: null,
    lastResolvedAt: null,
    resolvedCount: 0,
    feedbackDeadlineAt: null,
    closedAt: null,
    submittedAt: hoursAgo(26),
    updatedAt: hoursAgo(1.5),
    submitter: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
    meal: {
      dailyMealPortionId: "dmp-1a3-lunch",
      allocationId: "alloc-1a3-lunch",
      allocationStatus: "DISTRIBUTED",
      classId: "cls-1a3",
      className: "Lớp 1A3",
      academicYear: "2026-2027",
      mealDate: todayYmd(-1),
      mealType: "LUNCH",
    },
    escalatedAuthorityComplaint: null,
    comments: [
      {
        id: "c-mc-421-1",
        authorSide: "HANDLER",
        commentType: "MESSAGE",
        content:
          "Cảm ơn phụ huynh đã phản ánh kịp thời. Ban Giám hiệu đã làm việc với Bếp trưởng và nhân viên Dinh dưỡng để rà soát bảng định lượng nước mắm của món thịt kho khối 1.",
        createdAt: hoursAgo(22),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
      {
        id: "c-mc-421-2",
        authorSide: "REQUESTER",
        commentType: "MESSAGE",
        content:
          "Rất mong nhà trường điều chỉnh riêng mức nêm nhạt hơn cho khối 1 và 2 vì các bé ăn nhạt quen ở nhà ạ.",
        createdAt: hoursAgo(4),
        author: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
      },
      {
        id: "c-mc-421-3",
        authorSide: "HANDLER",
        commentType: "MESSAGE",
        content:
          "Bếp đã ghi nhận và áp dụng công thức giảm 20% muối/nước mắm cho các món kho khối 1–2 kể từ bữa trưa hôm nay. Ban Giám hiệu sẽ nếm thử trực tiếp và gửi kết quả cuối cùng trong chiều nay.",
        createdAt: hoursAgo(1.5),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
    ],
  },
  {
    id: "mc-10418",
    code: "FP-MC-10418",
    title: "Khay inox chia suất ăn còn đọng nước rửa bát",
    complaintType: "FOOD_HYGIENE",
    description:
      "Khi bàn giao khay cơm lớp 4A1 lúc 11h20, giáo viên và đại diện phụ huynh kiểm tra thấy một số khay ở đáy chồng vẫn còn hơi ẩm nước. Đề nghị kiểm tra quy trình sấy tiệt trùng khay.",
    status: "RESOLVED",
    closeReason: null,
    lastResolvedAt: hoursAgo(3),
    resolvedCount: 1,
    feedbackDeadlineAt: hoursFromNow(45),
    closedAt: null,
    submittedAt: hoursAgo(40),
    updatedAt: hoursAgo(3),
    submitter: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
    meal: {
      dailyMealPortionId: "dmp-4a1-lunch",
      allocationId: "alloc-4a1-lunch",
      allocationStatus: "DISTRIBUTED",
      classId: "cls-4a1",
      className: "Lớp 4A1",
      academicYear: "2026-2027",
      mealDate: todayYmd(-2),
      mealType: "LUNCH",
    },
    escalatedAuthorityComplaint: null,
    comments: [
      {
        id: "c-mc-418-1",
        authorSide: "HANDLER",
        commentType: "MESSAGE",
        content:
          "Ban Giám hiệu đã tiếp nhận và cử bộ phận cơ sở vật chất kiểm tra tủ sấy khay số 1 ngay trong chiều hôm qua.",
        createdAt: hoursAgo(34),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
      {
        id: "c-mc-418-2",
        authorSide: "HANDLER",
        commentType: "RESOLUTION",
        content:
          "Đã thay mới thanh nhiệt tủ sấy khay số 1, tăng thời gian sấy lên 35 phút ở 85°C và bổ sung bước kiểm tra khô ráo từng chồng khay trước khi chia suất ăn. Mời đại diện phụ huynh kiểm tra và xác nhận kết quả xử lý.",
        createdAt: hoursAgo(3),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
    ],
  },
  {
    id: "mc-10409",
    code: "FP-MC-10409",
    title: "Phát hiện mùi lạ trong món cá basa kho tộ bữa trưa",
    complaintType: "FOOD_HYGIENE",
    description:
      "Phụ huynh tham gia giám sát bữa ăn lớp 5A1 phát hiện món cá basa kho tộ có mùi tanh lạ dù đã nêm nhiều tiêu. Đề nghị làm rõ nguồn gốc lô cá và quy trình kiểm nhận đầu vào.",
    status: "CLOSED",
    closeReason: "ESCALATED",
    lastResolvedAt: hoursAgo(36),
    resolvedCount: 1,
    feedbackDeadlineAt: null,
    closedAt: hoursAgo(28),
    submittedAt: hoursAgo(72),
    updatedAt: hoursAgo(28),
    submitter: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
    meal: {
      dailyMealPortionId: "dmp-5a1-lunch",
      allocationId: "alloc-5a1-lunch",
      allocationStatus: "DISTRIBUTED",
      classId: "cls-5a1",
      className: "Lớp 5A1",
      academicYear: "2026-2027",
      mealDate: todayYmd(-3),
      mealType: "LUNCH",
    },
    escalatedAuthorityComplaint: {
      id: "ac-30112",
      code: "FP-AC-30112",
    },
    comments: [
      {
        id: "c-mc-409-1",
        authorSide: "HANDLER",
        commentType: "MESSAGE",
        content:
          "Ban Giám hiệu đã yêu cầu bếp lưu giữ mẫu đối chứng và kiểm tra biên bản nhập hàng lô cá basa ngày hôm đó.",
        createdAt: hoursAgo(60),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
      {
        id: "c-mc-409-2",
        authorSide: "HANDLER",
        commentType: "RESOLUTION",
        content:
          "Qua rà soát nội bộ, lô cá có giấy kiểm dịch đầy đủ nhưng khâu rã đông hơi lâu làm giảm độ tươi. Nhà trường đã rút kinh nghiệm với bếp và nhà cung cấp.",
        createdAt: hoursAgo(36),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
      {
        id: "c-mc-409-3",
        authorSide: "REQUESTER",
        commentType: "ESCALATION_NOTE",
        content:
          "Ban phụ huynh chưa yên tâm với giải trình rã đông nội bộ, đề nghị Cơ quan An toàn thực phẩm phường Dịch Vọng kiểm tra trực tiếp chứng từ và mẫu lưu của lô cá basa này.",
        createdAt: hoursAgo(28),
        author: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
      },
    ],
  },
  {
    id: "mc-10395",
    code: "FP-MC-10395",
    title: "Hoa quả tráng miệng dưa hấu cắt miếng hơi to cho học sinh lớp 1",
    complaintType: "OTHER",
    description:
      "Đề nghị nhà bếp cắt dưa hấu thành miếng nhỏ hơn để các bé lớp 1 dễ cầm và ăn hết khẩu phần.",
    status: "CLOSED",
    closeReason: "SATISFIED",
    lastResolvedAt: hoursAgo(96),
    resolvedCount: 1,
    feedbackDeadlineAt: null,
    closedAt: hoursAgo(90),
    submittedAt: hoursAgo(120),
    updatedAt: hoursAgo(90),
    submitter: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
    meal: {
      dailyMealPortionId: "dmp-1a1-lunch",
      allocationId: "alloc-1a1-lunch",
      allocationStatus: "DISTRIBUTED",
      classId: "cls-1a1",
      className: "Lớp 1A1",
      academicYear: "2026-2027",
      mealDate: todayYmd(-5),
      mealType: "LUNCH",
    },
    escalatedAuthorityComplaint: null,
    comments: [
      {
        id: "c-mc-395-1",
        authorSide: "HANDLER",
        commentType: "RESOLUTION",
        content:
          "Nhà bếp đã thống nhất cắt miếng hoa quả nhỏ bằng 1/2 kích cỡ cũ cho toàn bộ khối 1 và khối 2. Cảm ơn ý kiến đóng góp của phụ huynh.",
        createdAt: hoursAgo(96),
        author: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
      },
    ],
  },
]

const authorityComplaintsStore = [
  {
    id: "ac-30112",
    code: "FP-AC-30112",
    title: "Leo thang ATTP: Phát hiện mùi lạ trong món cá basa kho tộ bữa trưa",
    description:
      "Ban phụ huynh chưa yên tâm với giải trình rã đông nội bộ, đề nghị Cơ quan An toàn thực phẩm phường Dịch Vọng kiểm tra trực tiếp chứng từ và mẫu lưu của lô cá basa này.",
    status: "RESOLVED",
    closeReason: null,
    lastResolvedAt: hoursAgo(4),
    resolvedCount: 1,
    feedbackDeadlineAt: hoursFromNow(44),
    closedAt: null,
    submittedAt: hoursAgo(28),
    updatedAt: hoursAgo(4),
    sender: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy" },
    recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
    escalatedFrom: {
      id: "mc-10409",
      code: "FP-MC-10409",
      title: "Phát hiện mùi lạ trong món cá basa kho tộ bữa trưa",
      complaintType: "FOOD_HYGIENE",
      description:
        "Phụ huynh tham gia giám sát bữa ăn lớp 5A1 phát hiện món cá basa kho tộ có mùi tanh lạ dù đã nêm nhiều tiêu. Đề nghị làm rõ nguồn gốc lô cá và quy trình kiểm nhận đầu vào.",
      submittedAt: hoursAgo(72),
      meal: mealComplaintsStore[4].meal,
      comments: clone(mealComplaintsStore[4].comments),
    },
    comments: [
      {
        id: "c-ac-30112-1",
        authorSide: "HANDLER",
        commentType: "MESSAGE",
        content:
          "Đơn vị ATTP Phường Dịch Vọng đã tiếp nhận hồ sơ leo thang FP-AC-30112 và cử cán bộ xuống Trường Tiểu học Cầu Giấy đối chiếu nhật ký bảo quản lạnh và mẫu lưu 24h.",
        createdAt: hoursAgo(20),
        author: { id: "u-attp-1", fullName: "Phạm Quốc Hùng (Cán bộ ATTP)" },
      },
      {
        id: "c-ac-30112-2",
        authorSide: "REQUESTER",
        commentType: "MESSAGE",
        content:
          "Cảm ơn cán bộ đã xử lý nhanh. Nhờ anh kiểm tra giúp cả chứng từ nguồn gốc của nhà cung cấp cá basa ạ.",
        createdAt: hoursAgo(16),
        author: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
      },
      {
        id: "c-ac-30112-3",
        authorSide: "HANDLER",
        commentType: "RESOLUTION",
        content:
          "Kết quả kiểm tra đột xuất: Chứng từ kiểm dịch và truy xuất lô cá basa của Công ty Thực phẩm Xanh An Việt đầy đủ, mẫu lưu cảm quan đạt chuẩn an toàn, không có dấu hiệu ôi thiu hay vi sinh vượt ngưỡng. Tuy nhiên, tủ bảo quản sơ chế của bếp ở mức 7°C (cao hơn ngưỡng khuyến nghị 0–4°C). Đơn vị ATTP đã lập biên bản yêu cầu nhà trường hiệu chuẩn lại tủ mát trong 24h và tái kiểm tra sau 7 ngày.",
        createdAt: hoursAgo(4),
        author: { id: "u-attp-1", fullName: "Phạm Quốc Hùng (Cán bộ ATTP)" },
      },
    ],
  },
  {
    id: "ac-30115",
    code: "FP-AC-30115",
    title: "Leo thang ATTP: Rau cải xanh có dấu hiệu dập úa trong khay sơ chế",
    description:
      "Phụ huynh đề nghị Cơ quan ATTP kiểm tra quy trình kiểm nhận rau xanh đầu vào tại Trường Tiểu học Dịch Vọng B sau khi chưa đồng ý với phản hồi từ nhà trường.",
    status: "NEW",
    closeReason: null,
    lastResolvedAt: null,
    resolvedCount: 0,
    feedbackDeadlineAt: null,
    closedAt: null,
    submittedAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
    sender: { id: "u-parent-2", fullName: "Đỗ Lan Phương" },
    school: { id: "sch-dvb-02", name: "Trường Tiểu học Dịch Vọng B" },
    recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
    escalatedFrom: {
      id: "mc-10390",
      code: "FP-MC-10390",
      title: "Rau cải xanh có dấu hiệu dập úa trong khay sơ chế",
      complaintType: "FOOD_HYGIENE",
      description: "Nhiều lá rau cải xanh bị úa vàng nhưng vẫn được đưa vào khu vực sơ chế.",
      submittedAt: hoursAgo(50),
      meal: {
        dailyMealPortionId: "dmp-dvb-2b",
        classId: "cls-2b",
        className: "Lớp 2B",
        mealDate: todayYmd(-2),
        mealType: "LUNCH",
      },
      comments: [
        {
          id: "c-old-1",
          authorSide: "HANDLER",
          commentType: "RESOLUTION",
          content: "Nhà bếp đã loại bỏ phần lá dập trước khi nấu.",
          createdAt: hoursAgo(20),
          author: { id: "u-bgh-2", fullName: "Nguyễn Hải Nam (BGH Dịch Vọng B)" },
        },
      ],
    },
    comments: [
      {
        id: "c-ac-30115-1",
        authorSide: "REQUESTER",
        commentType: "ESCALATION_NOTE",
        content:
          "Tình trạng rau không tươi đã diễn ra 2 tuần liên tiếp, đề nghị Cơ quan ATTP kiểm tra trực tiếp nhà cung cấp rau của trường.",
        createdAt: hoursAgo(3),
        author: { id: "u-parent-2", fullName: "Đỗ Lan Phương" },
      },
    ],
  },
  {
    id: "ac-30114",
    code: "FP-AC-30114",
    title: "Leo thang ATTP: Nghi ngờ dầu chiên sử dụng lại nhiều lần",
    description:
      "Đại diện phụ huynh yêu cầu xác minh chất lượng dầu ăn tại bếp ăn Trường Mầm non Hoa Hồng.",
    status: "IN_PROGRESS",
    closeReason: null,
    lastResolvedAt: null,
    resolvedCount: 0,
    feedbackDeadlineAt: null,
    closedAt: null,
    submittedAt: hoursAgo(18),
    updatedAt: hoursAgo(5),
    sender: { id: "u-parent-3", fullName: "Hoàng Minh Tú" },
    school: { id: "sch-hh-03", name: "Trường Mầm non Hoa Hồng" },
    recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
    escalatedFrom: {
      id: "mc-10382",
      code: "FP-MC-10382",
      title: "Nghi ngờ dầu chiên sử dụng lại nhiều lần",
      complaintType: "FOOD_HYGIENE",
      description: "Món đậu rán có màu sậm bất thường, nghi ngờ dùng lại dầu chiên cũ.",
      submittedAt: hoursAgo(64),
      meal: {
        dailyMealPortionId: "dmp-hh-la1",
        classId: "cls-la1",
        className: "Lớp Lá 1",
        mealDate: todayYmd(-3),
        mealType: "LUNCH",
      },
      comments: [],
    },
    comments: [
      {
        id: "c-ac-30114-1",
        authorSide: "HANDLER",
        commentType: "MESSAGE",
        content:
          "Đơn vị ATTP đã tiếp nhận và hẹn lịch kiểm tra đột xuất khu vực bếp chiều mai cùng bộ test nhanh chỉ số peroxit dầu ăn.",
        createdAt: hoursAgo(5),
        author: { id: "u-attp-1", fullName: "Phạm Quốc Hùng (Cán bộ ATTP)" },
      },
    ],
  },
]

function projectMealComplaint(item) {
  const user = getCurrentUser()
  const isHandler = user.role === ROLES.SCHOOL_MANAGEMENT_BOARD
  const isRequester = [ROLES.PARENTS_COMMITTEE, ROLES.HOMEROOM_TEACHER].includes(user.role)
  const allowEscalate = user.role === ROLES.PARENTS_COMMITTEE
  return computeTicketProjection(item, { isHandler, isRequester, allowEscalate })
}

function projectAuthorityComplaint(item) {
  const user = getCurrentUser()
  const isHandler = user.role === ROLES.COMMUNE_FOOD_SAFETY_OFFICER
  const isRequester = user.role === ROLES.PARENTS_COMMITTEE
  return computeTicketProjection(item, { isHandler, isRequester, allowEscalate: false })
}

export const mockMealComplaints = {
  async list(params = {}) {
    await delay()
    const filtered = mealComplaintsStore
      .map(projectMealComplaint)
      .filter(item => {
        if (params.status && item.displayStatus !== params.status && item.status !== params.status) return false
        if (params.complaintType && item.complaintType !== params.complaintType) return false
        if (params.search) {
          const q = String(params.search).trim().toLowerCase()
          const hay = [item.code, item.title, item.description, item.submitter?.fullName, item.meal?.className]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          if (!hay.includes(q)) return false
        }
        if (params.from && item.submittedAt.slice(0, 10) < params.from) return false
        if (params.to && item.submittedAt.slice(0, 10) > params.to) return false
        return true
      })
    return { success: true, data: paginateArray(filtered, params.page, params.limit) }
  },

  async detail(id) {
    await delay()
    const found = mealComplaintsStore.find(item => item.id === id)
    if (!found) throw makeHttpError(404, "Không tìm thấy khiếu nại bữa ăn.")
    return { success: true, data: projectMealComplaint(found) }
  },

  async mealOptions() {
    await delay(140)
    return {
      success: true,
      data: {
        mealDate: todayYmd(0),
        classes: [
          {
            classId: "cls-1a3",
            className: "Lớp 1A3",
            lunch: { dailyMealPortionId: "dmp-1a3-lunch-today", canComplain: true },
            afternoon: { dailyMealPortionId: "dmp-1a3-pm-today", canComplain: true },
          },
          {
            classId: "cls-2a1",
            className: "Lớp 2A1",
            lunch: { dailyMealPortionId: "dmp-2a1-lunch-today", canComplain: true },
            afternoon: { dailyMealPortionId: "dmp-2a1-pm-today", canComplain: false },
          },
          {
            classId: "cls-3a2",
            className: "Lớp 3A2",
            lunch: { dailyMealPortionId: "dmp-3a2-lunch-today", canComplain: true },
            afternoon: null,
          },
        ],
      },
    }
  },

  async create(payload) {
    await delay(220)
    const user = getCurrentUser()
    const typeTitles = {
      MEAL_QUALITY: "Phản ánh chất lượng bữa ăn",
      FOOD_HYGIENE: "Phản ánh vệ sinh an toàn thực phẩm",
      OTHER: "Phản ánh khác về bữa ăn bán trú",
    }
    const created = {
      id: `mc-${Date.now()}`,
      code: `FP-MC-${randomDigits()}`,
      title: typeTitles[payload.complaintType] || "Khiếu nại bữa ăn",
      complaintType: payload.complaintType,
      description: payload.description,
      status: "NEW",
      closeReason: null,
      lastResolvedAt: null,
      resolvedCount: 0,
      feedbackDeadlineAt: null,
      closedAt: null,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submitter: { id: user.id, fullName: user.fullName },
      meal: {
        dailyMealPortionId: payload.dailyMealPortionId,
        allocationId: `alloc-${Date.now()}`,
        allocationStatus: "DISTRIBUTED",
        classId: "cls-1a3",
        className: "Lớp 1A3",
        academicYear: "2026-2027",
        mealDate: todayYmd(0),
        mealType: String(payload.dailyMealPortionId).includes("pm") ? "AFTERNOON" : "LUNCH",
      },
      escalatedAuthorityComplaint: null,
      comments: [],
    }
    mealComplaintsStore.unshift(created)
    return { success: true, data: projectMealComplaint(created) }
  },

  async accept(id) {
    await delay()
    const item = mealComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy khiếu nại.")
    if (!["NEW", "REOPENED"].includes(item.status)) {
      throw makeHttpError(409, "Chỉ tiếp nhận được đơn mới hoặc đơn được yêu cầu xử lý lại.")
    }
    item.status = "IN_PROGRESS"
    item.updatedAt = new Date().toISOString()
    return { success: true, data: projectMealComplaint(item) }
  },

  async comment(id, content) {
    await delay()
    const item = mealComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy khiếu nại.")
    const user = getCurrentUser()
    const isHandler = user.role === ROLES.SCHOOL_MANAGEMENT_BOARD
    item.comments.push({
      id: `c-${Date.now()}`,
      authorSide: isHandler ? "HANDLER" : "REQUESTER",
      commentType: "MESSAGE",
      content: String(content || "").trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, fullName: user.fullName },
    })
    item.updatedAt = new Date().toISOString()
    return { success: true, data: projectMealComplaint(item) }
  },

  async resolve(id, content) {
    await delay()
    const item = mealComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy khiếu nại.")
    const user = getCurrentUser()
    item.comments.push({
      id: `c-${Date.now()}`,
      authorSide: "HANDLER",
      commentType: "RESOLUTION",
      content: String(content || "").trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, fullName: user.fullName },
    })
    item.status = "RESOLVED"
    item.lastResolvedAt = new Date().toISOString()
    item.resolvedCount = (item.resolvedCount || 0) + 1
    item.feedbackDeadlineAt = hoursFromNow(48)
    item.updatedAt = new Date().toISOString()
    return { success: true, data: projectMealComplaint(item) }
  },

  async satisfy(id) {
    await delay()
    const item = mealComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy khiếu nại.")
    item.status = "CLOSED"
    item.closeReason = "SATISFIED"
    item.closedAt = new Date().toISOString()
    item.feedbackDeadlineAt = null
    item.updatedAt = new Date().toISOString()
    return { success: true, data: projectMealComplaint(item) }
  },

  async reopen(id, reason) {
    await delay()
    const item = mealComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy khiếu nại.")
    const user = getCurrentUser()
    if (reason) {
      item.comments.push({
        id: `c-${Date.now()}`,
        authorSide: "REQUESTER",
        commentType: "REOPEN_NOTE",
        content: reason,
        createdAt: new Date().toISOString(),
        author: { id: user.id, fullName: user.fullName },
      })
    }
    item.status = "REOPENED"
    item.feedbackDeadlineAt = null
    item.updatedAt = new Date().toISOString()
    return { success: true, data: projectMealComplaint(item) }
  },
}

export const mockAuthorityComplaints = {
  async list(params = {}) {
    await delay()
    const filtered = authorityComplaintsStore
      .map(projectAuthorityComplaint)
      .filter(item => {
        if (params.status && item.displayStatus !== params.status && item.status !== params.status) return false
        return true
      })
    return paginateArray(filtered, params.page, params.limit)
  },

  async detail(id) {
    await delay()
    const found = authorityComplaintsStore.find(x => x.id === id)
    if (!found) throw makeHttpError(404, "Không tìm thấy hồ sơ khiếu nại chuyển ATTP.")
    return projectAuthorityComplaint(found)
  },

  async escalate({ mealComplaintId, reason }) {
    await delay(240)
    const c03 = mealComplaintsStore.find(x => x.id === mealComplaintId)
    if (!c03) throw makeHttpError(404, "Không tìm thấy khiếu nại bữa ăn gốc.")
    if (c03.escalatedAuthorityComplaint) {
      throw makeHttpError(409, "Khiếu nại đã được chuyển ATTP.")
    }
    const user = getCurrentUser()
    const now = new Date().toISOString()
    const trimmedReason = String(reason || "").trim()
    if (trimmedReason) {
      c03.comments.push({
        id: `c-esc-${Date.now()}`,
        authorSide: "REQUESTER",
        commentType: "ESCALATION_NOTE",
        content: trimmedReason,
        createdAt: now,
        author: { id: user.id, fullName: user.fullName },
      })
    }
    const newAcId = `ac-${Date.now()}`
    const newAcCode = `FP-AC-${randomDigits()}`
    c03.status = "CLOSED"
    c03.closeReason = "ESCALATED"
    c03.closedAt = now
    c03.feedbackDeadlineAt = null
    c03.updatedAt = now
    c03.escalatedAuthorityComplaint = { id: newAcId, code: newAcCode }

    const created = {
      id: newAcId,
      code: newAcCode,
      title: `Leo thang ATTP: ${c03.title}`,
      description: trimmedReason || c03.description,
      status: "NEW",
      closeReason: null,
      lastResolvedAt: null,
      resolvedCount: 0,
      feedbackDeadlineAt: null,
      closedAt: null,
      submittedAt: now,
      updatedAt: now,
      sender: { id: user.id, fullName: user.fullName },
      school: { id: "sch-cg-01", name: user.orgName || "Trường Tiểu học Cầu Giấy" },
      recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
      escalatedFrom: {
        id: c03.id,
        code: c03.code,
        title: c03.title,
        complaintType: c03.complaintType,
        description: c03.description,
        submittedAt: c03.submittedAt,
        meal: clone(c03.meal),
        comments: clone(c03.comments),
      },
      comments: trimmedReason
        ? [
            {
              id: `c-ac-init-${Date.now()}`,
              authorSide: "REQUESTER",
              commentType: "ESCALATION_NOTE",
              content: trimmedReason,
              createdAt: now,
              author: { id: user.id, fullName: user.fullName },
            },
          ]
        : [],
    }
    authorityComplaintsStore.unshift(created)
    return projectAuthorityComplaint(created)
  },

  async accept(id) {
    await delay()
    const item = authorityComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    if (!["NEW", "REOPENED"].includes(item.status)) {
      throw makeHttpError(409, "Chỉ tiếp nhận được đơn mới hoặc đơn yêu cầu xử lý lại.")
    }
    item.status = "IN_PROGRESS"
    item.updatedAt = new Date().toISOString()
    return projectAuthorityComplaint(item)
  },

  async comment(id, content) {
    await delay()
    const item = authorityComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const user = getCurrentUser()
    const isHandler = user.role === ROLES.COMMUNE_FOOD_SAFETY_OFFICER
    item.comments.push({
      id: `c-ac-${Date.now()}`,
      authorSide: isHandler ? "HANDLER" : "REQUESTER",
      commentType: "MESSAGE",
      content: String(content || "").trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, fullName: user.fullName },
    })
    item.updatedAt = new Date().toISOString()
    return projectAuthorityComplaint(item)
  },

  async resolve(id, content) {
    await delay()
    const item = authorityComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const user = getCurrentUser()
    item.comments.push({
      id: `c-ac-res-${Date.now()}`,
      authorSide: "HANDLER",
      commentType: "RESOLUTION",
      content: String(content || "").trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, fullName: user.fullName },
    })
    item.status = "RESOLVED"
    item.lastResolvedAt = new Date().toISOString()
    item.resolvedCount = (item.resolvedCount || 0) + 1
    item.feedbackDeadlineAt = hoursFromNow(48)
    item.updatedAt = new Date().toISOString()
    return projectAuthorityComplaint(item)
  },

  async satisfy(id) {
    await delay()
    const item = authorityComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    item.status = "CLOSED"
    item.closeReason = "SATISFIED"
    item.closedAt = new Date().toISOString()
    item.feedbackDeadlineAt = null
    item.updatedAt = new Date().toISOString()
    return projectAuthorityComplaint(item)
  },

  async reopen(id, reason) {
    await delay()
    const item = authorityComplaintsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const user = getCurrentUser()
    if (reason) {
      item.comments.push({
        id: `c-ac-reo-${Date.now()}`,
        authorSide: "REQUESTER",
        commentType: "REOPEN_NOTE",
        content: reason,
        createdAt: new Date().toISOString(),
        author: { id: user.id, fullName: user.fullName },
      })
    }
    item.status = "REOPENED"
    item.feedbackDeadlineAt = null
    item.updatedAt = new Date().toISOString()
    return projectAuthorityComplaint(item)
  },
}

/* ============================================================================
 * 4. C02 INGREDIENT QUALITY FEEDBACK (SCHOOL <-> SUPPLIER)
 * ========================================================================== */
const MOCK_ELIGIBLE_DELIVERIES = [
  {
    id: "del-40812",
    deliveryNo: "FP-DE-40812",
    status: "RECEIVED",
    supplierName: "Công ty Thực phẩm Xanh An Việt",
    deliveryDate: todayYmd(0),
    lots: [
      { id: "lot-ga-01", lotCode: "LOT-GA-261125", ingredientName: "Ức gà tươi phi lê", status: "AVAILABLE" },
      { id: "lot-rau-01", lotCode: "LOT-RAU-261125", ingredientName: "Cải ngọt hữu cơ", status: "AVAILABLE" },
    ],
  },
  {
    id: "del-40809",
    deliveryNo: "FP-DE-40809",
    status: "RECEIVED",
    supplierName: "HTX Nông sản Sạch Sông Hồng",
    deliveryDate: todayYmd(-1),
    lots: [
      { id: "lot-ca-01", lotCode: "LOT-CA-251125", ingredientName: "Cá basa phi lê đông lạnh", status: "AVAILABLE" },
      { id: "lot-dau-01", lotCode: "LOT-DAU-251125", ingredientName: "Đậu phụ mơ", status: "AVAILABLE" },
    ],
  },
  {
    id: "del-40801",
    deliveryNo: "FP-DE-40801",
    status: "REJECTED",
    supplierName: "Công ty Thực phẩm Xanh An Việt",
    deliveryDate: todayYmd(-2),
    lots: [
      { id: "lot-thit-02", lotCode: "LOT-THIT-241125", ingredientName: "Thịt lợn vai sấn", status: "BLOCKED" },
    ],
  },
]

const ingredientFeedbackStore = [
  {
    id: "cp-20108",
    code: "FP-CP-20108",
    title: "Phản ánh chất lượng lô thịt lợn vai sấn không đạt cảm quan",
    description:
      "Chuyến giao sáng sớm có 12kg thịt lợn vai sấn bị nhớt nhẹ bề mặt, nhiệt độ tâm thịt đo được 11°C vượt mức cho phép nên tổ kiểm nhận đã từ chối nhập kho.",
    status: "NEW",
    closeReason: null,
    lastResolvedAt: null,
    resolvedCount: 0,
    feedbackDeadlineAt: null,
    closedAt: null,
    submittedAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
    delivery: { id: "del-40801", deliveryNo: "FP-DE-40801" },
    ingredientLot: { id: "lot-thit-02", lotCode: "LOT-THIT-241125" },
    submittedBy: { id: "u-kitchen-1", fullName: "Phạm Thị Lan (Bếp trưởng)" },
    comments: [],
  },
  {
    id: "cp-20105",
    code: "FP-CP-20105",
    title: "Rau cải ngọt giao sáng nay tỷ lệ lá dập vượt 15%",
    description:
      "Bao rau cải ngọt 20kg thuộc chuyến FP-DE-40812 bị ép chặt trong thùng xốp nên nhiều lá bị dập nát ở đáy thùng, tỷ lệ hao hụt sơ chế cao hơn định mức.",
    status: "IN_PROGRESS",
    closeReason: null,
    lastResolvedAt: null,
    resolvedCount: 0,
    feedbackDeadlineAt: null,
    closedAt: null,
    submittedAt: hoursAgo(20),
    updatedAt: hoursAgo(6),
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
    delivery: { id: "del-40812", deliveryNo: "FP-DE-40812" },
    ingredientLot: { id: "lot-rau-01", lotCode: "LOT-RAU-261125" },
    submittedBy: { id: "u-nutri-1", fullName: "Nguyễn Thu Trang (Dinh dưỡng)" },
    comments: [
      {
        id: "c-cp-105-1",
        authorSide: "HANDLER",
        commentType: "MESSAGE",
        content:
          "Nhà cung cấp đã tiếp nhận phản ánh và kiểm tra lại khâu đóng gói tại kho phân loại. Chúng tôi xin bù 4kg rau cải ngọt tươi vào chuyến giao đợt 2 sáng mai và chuyển sang sọt nhựa thoáng khí.",
        createdAt: hoursAgo(6),
        author: { id: "u-sup-1", fullName: "Vũ Thành Long (NCC An Việt)" },
      },
    ],
  },
  {
    id: "cp-20102",
    code: "FP-CP-20102",
    title: "Bao bì đậu phụ mơ bị rách góc khi vận chuyển",
    description:
      "Có 3 khay đậu phụ mơ trong chuyến FP-DE-40809 bị rách màng bọc niêm phong do xô lệch trên xe giao hàng.",
    status: "RESOLVED",
    closeReason: null,
    lastResolvedAt: hoursAgo(7),
    resolvedCount: 1,
    feedbackDeadlineAt: hoursFromNow(41),
    closedAt: null,
    submittedAt: hoursAgo(42),
    updatedAt: hoursAgo(7),
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
    delivery: { id: "del-40809", deliveryNo: "FP-DE-40809" },
    ingredientLot: { id: "lot-dau-01", lotCode: "LOT-DAU-251125" },
    submittedBy: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
    comments: [
      {
        id: "c-cp-102-1",
        authorSide: "HANDLER",
        commentType: "RESOLUTION",
        content:
          "HTX đã đổi bù ngay 3 khay đậu phụ mơ đạt chuẩn và bổ sung dây chằng cố định khay trên xe lạnh. Kính mời nhà trường xác nhận kết quả xử lý.",
        createdAt: hoursAgo(7),
        author: { id: "u-sup-2", fullName: "Đào Quang Minh (HTX Sông Hồng)" },
      },
    ],
  },
  {
    id: "cp-20098",
    code: "FP-CP-20098",
    title: "Thiếu tem truy xuất QR trên 1 thùng ức gà",
    description: "Thùng số 3/5 của lô ức gà bị bong tem QR khi gặp ẩm trên xe lạnh.",
    status: "CLOSED",
    closeReason: "SATISFIED",
    lastResolvedAt: hoursAgo(80),
    resolvedCount: 1,
    feedbackDeadlineAt: null,
    closedAt: hoursAgo(72),
    submittedAt: hoursAgo(100),
    updatedAt: hoursAgo(72),
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
    delivery: { id: "del-40812", deliveryNo: "FP-DE-40812" },
    ingredientLot: { id: "lot-ga-01", lotCode: "LOT-GA-261125" },
    submittedBy: { id: "u-kitchen-1", fullName: "Phạm Thị Lan (Bếp trưởng)" },
    comments: [
      {
        id: "c-cp-098-1",
        authorSide: "HANDLER",
        commentType: "RESOLUTION",
        content: "Đã thay toàn bộ tem giấy thường sang decal chống nước cho hàng mát/đông lạnh.",
        createdAt: hoursAgo(80),
        author: { id: "u-sup-1", fullName: "Vũ Thành Long (NCC An Việt)" },
      },
    ],
  },
]

function projectIngredientFeedback(item) {
  const user = getCurrentUser()
  const isHandler = user.orgType === "SUPPLIER"
  const isRequester = user.orgType === "SCHOOL"
  return computeTicketProjection(item, { isHandler, isRequester, allowEscalate: false })
}

export const mockIngredientFeedback = {
  async list({ page = 1, limit = 20 } = {}) {
    await delay()
    const projected = ingredientFeedbackStore.map(projectIngredientFeedback)
    return paginateArray(projected, page, limit)
  },

  async detail(id) {
    await delay()
    const found = ingredientFeedbackStore.find(x => x.id === id)
    if (!found) throw makeHttpError(404, "Không tìm thấy phản ánh nguyên liệu.")
    return projectIngredientFeedback(found)
  },

  async create({ deliveryId, ingredientLotId, description }) {
    await delay(220)
    const user = getCurrentUser()
    const del = MOCK_ELIGIBLE_DELIVERIES.find(d => d.id === deliveryId) || MOCK_ELIGIBLE_DELIVERIES[0]
    const lot = ingredientLotId ? del.lots.find(l => l.id === ingredientLotId) : null
    const now = new Date().toISOString()
    const created = {
      id: `cp-${Date.now()}`,
      code: `FP-CP-${randomDigits()}`,
      title: lot
        ? `Phản ánh chất lượng lô ${lot.lotCode} (${lot.ingredientName})`
        : `Phản ánh chất lượng chuyến giao ${del.deliveryNo}`,
      description: String(description || "").trim(),
      status: "NEW",
      closeReason: null,
      lastResolvedAt: null,
      resolvedCount: 0,
      feedbackDeadlineAt: null,
      closedAt: null,
      submittedAt: now,
      updatedAt: now,
      school: { id: "sch-cg-01", name: user.orgName || "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
      delivery: { id: del.id, deliveryNo: del.deliveryNo },
      ingredientLot: lot ? { id: lot.id, lotCode: lot.lotCode } : null,
      submittedBy: { id: user.id, fullName: user.fullName },
      comments: [],
    }
    ingredientFeedbackStore.unshift(created)
    return projectIngredientFeedback(created)
  },

  async accept(id) {
    await delay()
    const item = ingredientFeedbackStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy phản ánh.")
    item.status = "IN_PROGRESS"
    item.updatedAt = new Date().toISOString()
    return projectIngredientFeedback(item)
  },

  async comment(id, content) {
    await delay()
    const item = ingredientFeedbackStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy phản ánh.")
    const user = getCurrentUser()
    item.comments.push({
      id: `c-cp-${Date.now()}`,
      authorSide: user.orgType === "SUPPLIER" ? "HANDLER" : "REQUESTER",
      commentType: "MESSAGE",
      content: String(content || "").trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, fullName: user.fullName },
    })
    item.updatedAt = new Date().toISOString()
    return projectIngredientFeedback(item)
  },

  async resolve(id, content) {
    await delay()
    const item = ingredientFeedbackStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy phản ánh.")
    const user = getCurrentUser()
    item.comments.push({
      id: `c-cp-res-${Date.now()}`,
      authorSide: "HANDLER",
      commentType: "RESOLUTION",
      content: String(content || "").trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, fullName: user.fullName },
    })
    item.status = "RESOLVED"
    item.lastResolvedAt = new Date().toISOString()
    item.resolvedCount = (item.resolvedCount || 0) + 1
    item.feedbackDeadlineAt = hoursFromNow(48)
    item.updatedAt = new Date().toISOString()
    return projectIngredientFeedback(item)
  },

  async satisfy(id) {
    await delay()
    const item = ingredientFeedbackStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy phản ánh.")
    item.status = "CLOSED"
    item.closeReason = "SATISFIED"
    item.closedAt = new Date().toISOString()
    item.feedbackDeadlineAt = null
    item.updatedAt = new Date().toISOString()
    return projectIngredientFeedback(item)
  },

  async reopen(id, reason) {
    await delay()
    const item = ingredientFeedbackStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy phản ánh.")
    const user = getCurrentUser()
    if (reason) {
      item.comments.push({
        id: `c-cp-reo-${Date.now()}`,
        authorSide: "REQUESTER",
        commentType: "REOPEN_NOTE",
        content: reason,
        createdAt: new Date().toISOString(),
        author: { id: user.id, fullName: user.fullName },
      })
    }
    item.status = "REOPENED"
    item.feedbackDeadlineAt = null
    item.updatedAt = new Date().toISOString()
    return projectIngredientFeedback(item)
  },

  async listEligibleDeliveries() {
    await delay(140)
    return clone(
      MOCK_ELIGIBLE_DELIVERIES.map(({ lots: _lots, ...rest }) => rest),
    )
  },

  async getDeliveryLots(deliveryId) {
    await delay(120)
    const found = MOCK_ELIGIBLE_DELIVERIES.find(d => d.id === deliveryId)
    return clone(found?.lots || [])
  },
}

/* ============================================================================
 * 5. FOOD SAFETY INCIDENTS (BÁO CÁO NGỘ ĐỘC), SNAPSHOTS & INSPECTIONS
 * ========================================================================== */
const MOCK_SNAPSHOT_PAYLOAD_V2 = {
  potentialExposedPortionCount: 74,
  allocations: [
    {
      id: "alloc-50201-1",
      mealDate: todayYmd(-1),
      mealType: "LUNCH",
      className: "Lớp 3A2",
      portionCount: 38,
    },
    {
      id: "alloc-50201-2",
      mealDate: todayYmd(-1),
      mealType: "LUNCH",
      className: "Lớp 3A3",
      portionCount: 36,
    },
  ],
  allocationBatches: [
    { allocationId: "alloc-50201-1", cookingBatchId: "batch-01" },
    { allocationId: "alloc-50201-2", cookingBatchId: "batch-01" },
  ],
  cookingBatches: [
    {
      id: "batch-01",
      batchCode: "BATCH-261124-TRUA-01",
      dishName: "Gà xào nấm hương",
      cookedAt: hoursAgo(27),
      status: "COMPLETED",
    },
  ],
  lotUsages: [
    { cookingBatchId: "batch-01", ingredientLotId: "lot-ga-901", quantityUsed: 14.5, unit: "kg" },
    { cookingBatchId: "batch-01", ingredientLotId: "lot-nam-902", quantityUsed: 2.2, unit: "kg" },
  ],
  ingredientLots: [
    {
      id: "lot-ga-901",
      lotCode: "LOT-GA-241125-A",
      ingredientName: "Ức gà tươi phi lê",
      supplierId: "sup-anviet",
      sourceFacilityId: "fac-cp-01",
      expiryDate: todayYmd(1),
    },
    {
      id: "lot-nam-902",
      lotCode: "LOT-NAM-241125-B",
      ingredientName: "Nấm hương tươi",
      supplierId: "sup-songhong",
      sourceFacilityId: "fac-sh-02",
      expiryDate: todayYmd(2),
    },
  ],
  suppliers: [
    { id: "sup-anviet", name: "Công ty Thực phẩm Xanh An Việt", taxCode: "0108234567" },
    { id: "sup-songhong", name: "HTX Nông sản Sạch Sông Hồng", taxCode: "0109876543" },
  ],
  sourceFacilities: [
    { id: "fac-cp-01", name: "Trang trại Gia cầm Ba Vì", address: "Huyện Ba Vì, Hà Nội" },
    { id: "fac-sh-02", name: "HTX Trồng nấm Đông Anh", address: "Xã Đông Anh, Hà Nội" },
  ],
  retainedSamples: [
    {
      id: "sample-01",
      cookingBatchId: "batch-01",
      sampleCode: "ML-261124-01",
      dishName: "Gà xào nấm hương",
      storageLabel: "Tủ mẫu số 1 · Ngăn A2",
      sealedAt: hoursAgo(26),
      status: "STORED",
    },
  ],
}

const incidentsStore = [
  {
    id: "inc-50205",
    code: "FP-IC-50205",
    schoolId: "sch-cg-01",
    reportedByUserId: "u-parent-1",
    title: "6 học sinh lớp 2A1 bị đau bụng, buồn nôn sau bữa trưa",
    description:
      "Khoảng 14h15 sau giờ ngủ trưa, 6 học sinh lớp 2A1 có biểu hiện đau quặn bụng và buồn nôn, đã được đưa xuống phòng y tế trường theo dõi. Nghi ngờ liên quan đến món trứng đúc thịt bữa trưa.",
    status: "PENDING_SCHOOL_REVIEW",
    source: "PARENT_REPORT",
    reportedSymptomaticCount: 6,
    symptomDescription: "Đau bụng vùng rốn, buồn nôn, 2 em đi ngoài phân lỏng 1 lần, không sốt.",
    recipientCommuneFoodSafetyUnitId: null,
    occurredAt: hoursAgo(3),
    resolvedAt: null,
    createdAt: hoursAgo(2.5),
    updatedAt: hoursAgo(2.5),
    reportedClass: { id: "cls-2a1", name: "Lớp 2A1" },
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
    reportedBy: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
    reportedRoleCode: ROLES.PARENTS_COMMITTEE,
    preliminaryAssessment: null,
    preliminaryNote: null,
    reviewedBy: null,
    reviewedAt: null,
    recipientUnit: null,
    cancellationReason: null,
    cancellationNote: null,
    forwardings: [],
    traceCompleteness: null,
    traceSnapshots: [],
    allocations: [
      {
        mealAllocationId: "alloc-2a1-lunch-today",
        status: "DISTRIBUTED",
        mealDate: todayYmd(0),
        mealType: "LUNCH",
        classId: "cls-2a1",
        className: "Lớp 2A1",
      },
    ],
    histories: [
      {
        id: "h-50205-1",
        fromStatus: null,
        toStatus: "PENDING_SCHOOL_REVIEW",
        createdAt: hoursAgo(2.5),
        actor: { id: "u-parent-1", fullName: "Nguyễn Thị Minh Hạnh" },
        note: "Phụ huynh gửi báo cáo ngộ độc ban đầu.",
      },
    ],
    inspections: [],
  },
  {
    id: "inc-50203",
    code: "FP-IC-50203",
    schoolId: "sch-dvb-02",
    reportedByUserId: "u-bgh-2",
    title: "4 học sinh lớp 4B đau bụng nhẹ sau bữa xế sữa hạt",
    description:
      "Nhà trường ghi nhận 4 em lớp 4B đau bụng nhẹ lúc 15h30 sau bữa xế. Đã niêm phong mẫu lưu và chuyển hồ sơ tới Đơn vị ATTP Phường Dịch Vọng để xác minh.",
    status: "SUBMITTED_TO_AUTHORITY",
    source: "SCHOOL_DIRECT",
    reportedSymptomaticCount: 4,
    symptomDescription: "Đau bụng nhẹ, chóng mặt thoáng qua, đã ổn định sau 30 phút nghỉ ngơi.",
    recipientCommuneFoodSafetyUnitId: "unit-dv",
    occurredAt: hoursAgo(6),
    resolvedAt: null,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    reportedClass: { id: "cls-4b", name: "Lớp 4B" },
    school: { id: "sch-dvb-02", name: "Trường Tiểu học Dịch Vọng B", code: "TH-DVB02" },
    reportedBy: { id: "u-bgh-2", fullName: "Nguyễn Hải Nam (BGH Dịch Vọng B)" },
    reportedRoleCode: ROLES.SCHOOL_MANAGEMENT_BOARD,
    preliminaryAssessment: "UNDETERMINED",
    preliminaryNote: "Chưa rõ do bữa xế hay đồ ăn mang từ nhà, chuyển ATTP xác minh đồng thời.",
    reviewedBy: { id: "u-bgh-2", fullName: "Nguyễn Hải Nam (BGH Dịch Vọng B)" },
    reviewedAt: hoursAgo(5),
    recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
    cancellationReason: null,
    cancellationNote: null,
    forwardings: [
      {
        id: "rep-9001",
        status: "SENT",
        traceSnapshotVersion: 1,
        forwardedAt: hoursAgo(5),
        recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
      },
    ],
    traceCompleteness: "PARTIAL",
    traceSnapshots: [
      {
        id: "snap-50203-v1",
        version: 1,
        completeness: "PARTIAL",
        missingReasons: [
          { code: "COOKING_BATCH_DISH_WITHOUT_RETAINED_SAMPLE", cookingBatchId: "batch-01" },
        ],
        payloadVersion: "1.0",
        hashAlgorithm: "SHA-256",
        payloadHash: "7f4e9b2c1a0845d63c90e1a2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        createdAt: hoursAgo(5),
        createdBy: { id: "u-bgh-2", fullName: "Nguyễn Hải Nam" },
      },
    ],
    allocations: [
      {
        mealAllocationId: "alloc-4b-pm",
        status: "DISTRIBUTED",
        mealDate: todayYmd(0),
        mealType: "AFTERNOON",
        classId: "cls-4b",
        className: "Lớp 4B",
      },
    ],
    histories: [
      {
        id: "h-50203-1",
        fromStatus: null,
        toStatus: "SUBMITTED_TO_AUTHORITY",
        createdAt: hoursAgo(5),
        actor: { id: "u-bgh-2", fullName: "Nguyễn Hải Nam" },
        note: "BGH lập hồ sơ và chuyển trực tiếp Đơn vị ATTP Phường Dịch Vọng.",
      },
    ],
    inspections: [],
  },
  {
    id: "inc-50201",
    code: "FP-IC-50201",
    schoolId: "sch-cg-01",
    reportedByUserId: "u-teacher-1",
    title: "11 học sinh khối 3 nôn ói và sốt nhẹ sau bữa trưa ngày hôm qua",
    description:
      "Từ 14h00 đến 15h30 ngày hôm qua, 7 học sinh lớp 3A2 và 4 học sinh lớp 3A3 xuất hiện triệu chứng nôn ói, đau bụng dữ dội. Nhà trường đã đưa các em đi kiểm tra tại Trạm Y tế phường và lập tức khoanh vùng suất ăn bữa trưa.",
    status: "UNDER_INSPECTION",
    source: "TEACHER_REPORT",
    reportedSymptomaticCount: 11,
    symptomDescription: "Nôn 2–3 lần, đau quặn bụng, 3 em sốt nhẹ 37.9°C, hiện sức khỏe đã ổn định.",
    recipientCommuneFoodSafetyUnitId: "unit-dv",
    occurredAt: hoursAgo(24),
    resolvedAt: null,
    createdAt: hoursAgo(23),
    updatedAt: hoursAgo(4),
    reportedClass: { id: "cls-3a2", name: "Lớp 3A2" },
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
    reportedBy: { id: "u-teacher-1", fullName: "Trần Thu Trang (GVCN 3A2)" },
    reportedRoleCode: ROLES.HOMEROOM_TEACHER,
    preliminaryAssessment: "SCHOOL_MEAL_SUSPECTED",
    preliminaryNote: "Tập trung ở 2 lớp dùng chung mẻ gà xào nấm hương bữa trưa.",
    reviewedBy: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
    reviewedAt: hoursAgo(22),
    recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
    cancellationReason: null,
    cancellationNote: null,
    forwardings: [
      {
        id: "rep-9000",
        status: "SENT",
        traceSnapshotVersion: 2,
        forwardedAt: hoursAgo(22),
        recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
      },
    ],
    traceCompleteness: "COMPLETE",
    traceSnapshots: [
      {
        id: "snap-50201-v1",
        version: 1,
        completeness: "PARTIAL",
        missingReasons: [{ code: "NO_ALLOCATIONS" }],
        payloadVersion: "1.0",
        hashAlgorithm: "SHA-256",
        payloadHash: "3a1c8e2f90b74d12a6c5f8e0192b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2",
        createdAt: hoursAgo(22),
        createdBy: { id: "u-bgh-1", fullName: "Lê Văn Đức" },
      },
      {
        id: "snap-50201-v2",
        version: 2,
        completeness: "COMPLETE",
        missingReasons: [],
        payloadVersion: "1.0",
        hashAlgorithm: "SHA-256",
        payloadHash: "9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c",
        createdAt: hoursAgo(20),
        createdBy: { id: "u-bgh-1", fullName: "Lê Văn Đức" },
      },
    ],
    allocations: [
      {
        mealAllocationId: "alloc-50201-1",
        status: "DISTRIBUTED",
        mealDate: todayYmd(-1),
        mealType: "LUNCH",
        classId: "cls-3a2",
        className: "Lớp 3A2",
      },
      {
        mealAllocationId: "alloc-50201-2",
        status: "DISTRIBUTED",
        mealDate: todayYmd(-1),
        mealType: "LUNCH",
        classId: "cls-3a3",
        className: "Lớp 3A3",
      },
    ],
    histories: [
      {
        id: "h-50201-1",
        fromStatus: null,
        toStatus: "PENDING_SCHOOL_REVIEW",
        createdAt: hoursAgo(23),
        actor: { id: "u-teacher-1", fullName: "Trần Thu Trang" },
        note: "GVCN báo cáo ngộ độc lớp 3A2.",
      },
      {
        id: "h-50201-2",
        fromStatus: "PENDING_SCHOOL_REVIEW",
        toStatus: "SUBMITTED_TO_AUTHORITY",
        createdAt: hoursAgo(22),
        actor: { id: "u-bgh-1", fullName: "Lê Văn Đức" },
        note: "BGH xác minh sơ bộ và chuyển Đơn vị ATTP Phường Dịch Vọng.",
      },
      {
        id: "h-50201-3",
        fromStatus: "SUBMITTED_TO_AUTHORITY",
        toStatus: "AUTHORITY_ACKNOWLEDGED",
        createdAt: hoursAgo(19),
        actor: { id: "u-attp-1", fullName: "Phạm Quốc Hùng" },
        note: "Đơn vị ATTP tiếp nhận hồ sơ.",
      },
      {
        id: "h-50201-4",
        fromStatus: "AUTHORITY_ACKNOWLEDGED",
        toStatus: "UNDER_INSPECTION",
        createdAt: hoursAgo(16),
        actor: { id: "u-attp-1", fullName: "Phạm Quốc Hùng" },
        note: "Lập đoàn kiểm tra đợt 1 lấy mẫu xét nghiệm.",
      },
    ],
    inspections: [
      {
        id: "insp-50201-1",
        status: "COMPLETED",
        teamDescription:
          "Đoàn kiểm tra liên ngành Phường Dịch Vọng gồm 3 cán bộ ATTP và 1 bác sĩ Trạm Y tế phường.",
        scheduledAt: hoursAgo(15),
        createdAt: hoursAgo(16),
        createdBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng" },
        recordedAt: hoursAgo(5),
        recordedBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng", role: "Cán bộ ATTP cấp xã" },
        overallConclusion: "SUPPLIER_AT_FAULT",
        resultSummary:
          "Kết quả xét nghiệm nhanh mẫu lưu ML-261124-01 và mẫu nguyên liệu tồn kho phát hiện vi khuẩn Salmonella vượt giới hạn trên lô ức gà LOT-GA-241125-A của Công ty Thực phẩm Xanh An Việt. Mẫu nấm hương của HTX Sông Hồng âm tính, đạt yêu cầu.",
        findings: [
          {
            supplierId: "sup-anviet",
            supplierName: "Công ty Thực phẩm Xanh An Việt",
            finding: "AT_FAULT",
            evidenceNote: "Mẫu lưu ức gà dương tính Salmonella, xe bảo quản lạnh vượt ngưỡng 9°C.",
          },
          {
            supplierId: "sup-songhong",
            supplierName: "HTX Nông sản Sạch Sông Hồng",
            finding: "CLEARED",
            evidenceNote: "Mẫu nấm hương tươi đạt tiêu chuẩn vi sinh và tồn dư thuốc BVTV.",
          },
        ],
      },
      {
        id: "insp-50201-2",
        status: "PLANNED",
        teamDescription:
          "Đợt kiểm tra bổ sung kiểm tra điều kiện vệ sinh kho lạnh tại cơ sở Công ty Thực phẩm Xanh An Việt.",
        scheduledAt: hoursFromNow(3),
        createdAt: hoursAgo(4),
        createdBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng" },
        recordedAt: null,
        recordedBy: null,
        overallConclusion: null,
        resultSummary: null,
        findings: [],
      },
    ],
  },
  {
    id: "inc-50190",
    code: "FP-IC-50190",
    schoolId: "sch-cg-01",
    reportedByUserId: "u-bgh-1",
    title: "3 học sinh lớp 1A1 nổi mẩn đỏ nghi dị ứng thực phẩm",
    description:
      "3 học sinh lớp 1A1 bị nổi mẩn đỏ nhẹ sau giờ ăn trưa, nhà trường báo cáo trực tiếp ATTP để kiểm tra chéo nguồn nguyên liệu hải sản.",
    status: "INSPECTION_COMPLETED",
    source: "SCHOOL_DIRECT",
    reportedSymptomaticCount: 3,
    symptomDescription: "Nổi mẩn đỏ ở tay và cổ, không khó thở, đã uống thuốc kháng dị ứng theo chỉ định bác sĩ.",
    recipientCommuneFoodSafetyUnitId: "unit-dv",
    occurredAt: hoursAgo(60),
    resolvedAt: null,
    createdAt: hoursAgo(58),
    updatedAt: hoursAgo(10),
    reportedClass: { id: "cls-1a1", name: "Lớp 1A1" },
    school: { id: "sch-cg-01", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
    reportedBy: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
    reportedRoleCode: ROLES.SCHOOL_MANAGEMENT_BOARD,
    preliminaryAssessment: "OUTSIDE_MEAL",
    preliminaryNote: "Nghi ngờ liên quan đồ ăn vặt mang theo nhưng vẫn chuyển ATTP theo quy định.",
    reviewedBy: { id: "u-bgh-1", fullName: "Lê Văn Đức (Ban Giám hiệu)" },
    reviewedAt: hoursAgo(58),
    recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
    cancellationReason: null,
    cancellationNote: null,
    forwardings: [
      {
        id: "rep-8995",
        status: "SENT",
        traceSnapshotVersion: 1,
        forwardedAt: hoursAgo(58),
        recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
      },
    ],
    traceCompleteness: "COMPLETE",
    traceSnapshots: [
      {
        id: "snap-50190-v1",
        version: 1,
        completeness: "COMPLETE",
        missingReasons: [],
        payloadVersion: "1.0",
        hashAlgorithm: "SHA-256",
        payloadHash: "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
        createdAt: hoursAgo(58),
        createdBy: { id: "u-bgh-1", fullName: "Lê Văn Đức" },
      },
    ],
    allocations: [
      {
        mealAllocationId: "alloc-1a1-old",
        status: "DISTRIBUTED",
        mealDate: todayYmd(-3),
        mealType: "LUNCH",
        classId: "cls-1a1",
        className: "Lớp 1A1",
      },
    ],
    histories: [
      {
        id: "h-50190-1",
        fromStatus: null,
        toStatus: "SUBMITTED_TO_AUTHORITY",
        createdAt: hoursAgo(58),
        actor: { id: "u-bgh-1", fullName: "Lê Văn Đức" },
        note: "BGH báo cáo trực tiếp.",
      },
      {
        id: "h-50190-2",
        fromStatus: "UNDER_INSPECTION",
        toStatus: "INSPECTION_COMPLETED",
        createdAt: hoursAgo(10),
        actor: { id: "u-attp-1", fullName: "Phạm Quốc Hùng" },
        note: "Hoàn tất ghi kết quả đợt kiểm tra.",
      },
    ],
    inspections: [
      {
        id: "insp-50190-1",
        status: "COMPLETED",
        teamDescription: "Tổ kiểm tra nhanh ATTP Phường Dịch Vọng.",
        scheduledAt: hoursAgo(36),
        createdAt: hoursAgo(40),
        createdBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng" },
        recordedAt: hoursAgo(10),
        recordedBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng", role: "Cán bộ ATTP cấp xã" },
        overallConclusion: "NOT_FOOD_RELATED",
        resultSummary:
          "Mẫu lưu bữa trưa và nguyên liệu đầu vào đều an toàn, không chứa tác nhân gây dị ứng tôm/cua. Nguyên nhân do bánh kẹo học sinh chia nhau trong giờ ra chơi.",
        findings: [
          {
            supplierId: "sup-songhong",
            supplierName: "HTX Nông sản Sạch Sông Hồng",
            finding: "CLEARED",
            evidenceNote: "Đạt đầy đủ tiêu chuẩn an toàn thực phẩm.",
          },
        ],
      },
    ],
  },
]

const reportsInboxStore = [
  {
    id: "rep-9001",
    incidentId: "inc-50203",
    recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
    referenceNumber: "FP-IC-50203",
    status: "SENT",
    attemptedAt: hoursAgo(5),
    forwardedAt: hoursAgo(5),
    createdAt: hoursAgo(5),
  },
  {
    id: "rep-9000",
    incidentId: "inc-50201",
    recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
    referenceNumber: "FP-IC-50201",
    status: "SENT",
    attemptedAt: hoursAgo(22),
    forwardedAt: hoursAgo(22),
    createdAt: hoursAgo(22),
  },
]

function projectIncident(raw) {
  const user = getCurrentUser()
  const isReporter = [ROLES.PARENTS_COMMITTEE, ROLES.HOMEROOM_TEACHER].includes(user.role)
  const isBgh = user.role === ROLES.SCHOOL_MANAGEMENT_BOARD
  const isAttp = user.role === ROLES.COMMUNE_FOOD_SAFETY_OFFICER

  const allowedActions = []
  if (isBgh) {
    if (raw.status === "PENDING_SCHOOL_REVIEW") {
      allowedActions.push("FORWARD", "CANCEL", "ADD_ALLOCATIONS")
    } else if (["SUBMITTED_TO_AUTHORITY", "AUTHORITY_ACKNOWLEDGED", "UNDER_INSPECTION"].includes(raw.status)) {
      allowedActions.push("ADD_ALLOCATIONS")
    }
  }
  if (isAttp) {
    if (["AUTHORITY_ACKNOWLEDGED", "UNDER_INSPECTION"].includes(raw.status)) {
      allowedActions.push("PLAN_INSPECTION")
    }
    if (raw.status === "INSPECTION_COMPLETED") {
      allowedActions.push("CLOSE")
    }
  }

  if (isReporter) {
    return {
      view: "REPORTER",
      id: raw.id,
      code: raw.code,
      title: raw.title,
      description: raw.description,
      status: raw.status,
      source: raw.source,
      reportedSymptomaticCount: raw.reportedSymptomaticCount,
      symptomDescription: raw.symptomDescription,
      occurredAt: raw.occurredAt,
      reportedClass: clone(raw.reportedClass),
      cancellationReason: raw.cancellationReason,
      cancellationNote: raw.cancellationNote,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      histories: (raw.histories || []).map(h => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        createdAt: h.createdAt,
      })),
      inspections: (raw.inspections || []).map(insp => ({
        id: insp.id,
        status: insp.status,
        scheduledAt: insp.scheduledAt,
        recordedAt: insp.recordedAt,
        overallConclusion: insp.overallConclusion,
        resultSummary: insp.resultSummary,
        recordedBy: insp.recordedBy
          ? { fullName: insp.recordedBy.fullName, role: insp.recordedBy.role }
          : null,
        findings: clone(insp.findings || []),
      })),
      allowedActions: [],
    }
  }

  return {
    ...clone(raw),
    view: "FULL",
    allowedActions,
  }
}

export const mockFoodSafetyIncidents = {
  async listIncidents({ page = 1, limit = 20, status = "" } = {}) {
    await delay()
    const filtered = incidentsStore.filter(item => (!status ? true : item.status === status))
    return paginateArray(filtered, page, limit)
  },

  async getIncidentDetail(id) {
    await delay()
    const found = incidentsStore.find(x => x.id === id)
    if (!found) throw makeHttpError(404, "Không tìm thấy hồ sơ báo cáo ngộ độc.")
    return projectIncident(found)
  },

  async reportIncident(payload) {
    await delay(220)
    const user = getCurrentUser()
    const now = new Date().toISOString()
    const created = {
      id: `inc-${Date.now()}`,
      code: `FP-IC-${randomDigits()}`,
      schoolId: "sch-cg-01",
      reportedByUserId: user.id,
      title: payload.title,
      description: payload.description,
      status: "PENDING_SCHOOL_REVIEW",
      source: user.role === ROLES.HOMEROOM_TEACHER ? "TEACHER_REPORT" : "PARENT_REPORT",
      reportedSymptomaticCount: Number(payload.reportedSymptomaticCount) || 1,
      symptomDescription: payload.symptomDescription || null,
      recipientCommuneFoodSafetyUnitId: null,
      occurredAt: payload.occurredAt || now,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
      reportedClass: payload.classId ? { id: payload.classId, name: "Lớp 3A2" } : null,
      school: { id: "sch-cg-01", name: user.orgName || "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
      reportedBy: { id: user.id, fullName: user.fullName },
      reportedRoleCode: user.role,
      preliminaryAssessment: null,
      preliminaryNote: null,
      reviewedBy: null,
      reviewedAt: null,
      recipientUnit: null,
      cancellationReason: null,
      cancellationNote: null,
      forwardings: [],
      traceCompleteness: null,
      traceSnapshots: [],
      allocations: [],
      histories: [
        {
          id: `h-${Date.now()}`,
          fromStatus: null,
          toStatus: "PENDING_SCHOOL_REVIEW",
          createdAt: now,
          actor: { id: user.id, fullName: user.fullName },
          note: "Gửi báo cáo ngộ độc mới.",
        },
      ],
      inspections: [],
    }
    incidentsStore.unshift(created)
    return projectIncident(created)
  },

  async reportDirectIncident(payload) {
    await delay(240)
    const user = getCurrentUser()
    const now = new Date().toISOString()
    const newId = `inc-${Date.now()}`
    const newCode = `FP-IC-${randomDigits()}`
    const created = {
      id: newId,
      code: newCode,
      schoolId: "sch-cg-01",
      reportedByUserId: user.id,
      title: payload.title,
      description: payload.description,
      status: "SUBMITTED_TO_AUTHORITY",
      source: "SCHOOL_DIRECT",
      reportedSymptomaticCount: Number(payload.reportedSymptomaticCount) || 1,
      symptomDescription: payload.symptomDescription || null,
      recipientCommuneFoodSafetyUnitId: "unit-dv",
      occurredAt: payload.occurredAt || now,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
      reportedClass: payload.classId ? { id: payload.classId, name: "Lớp 3A2" } : null,
      school: { id: "sch-cg-01", name: user.orgName || "Trường Tiểu học Cầu Giấy", code: "TH-CG01" },
      reportedBy: { id: user.id, fullName: user.fullName },
      reportedRoleCode: user.role,
      preliminaryAssessment: payload.preliminaryAssessment,
      preliminaryNote: payload.preliminaryNote || null,
      reviewedBy: { id: user.id, fullName: user.fullName },
      reviewedAt: now,
      recipientUnit: { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" },
      cancellationReason: null,
      cancellationNote: null,
      forwardings: [
        {
          id: `rep-${Date.now()}`,
          status: "SENT",
          traceSnapshotVersion: 1,
          forwardedAt: now,
          recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
        },
      ],
      traceCompleteness: "COMPLETE",
      traceSnapshots: [
        {
          id: `snap-${Date.now()}-v1`,
          version: 1,
          completeness: "COMPLETE",
          missingReasons: [],
          payloadVersion: "1.0",
          hashAlgorithm: "SHA-256",
          payloadHash: "a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef",
          createdAt: now,
          createdBy: { id: user.id, fullName: user.fullName },
        },
      ],
      allocations: [],
      histories: [
        {
          id: `h-${Date.now()}`,
          fromStatus: null,
          toStatus: "SUBMITTED_TO_AUTHORITY",
          createdAt: now,
          actor: { id: user.id, fullName: user.fullName },
          note: "BGH tạo hồ sơ và chuyển trực tiếp Đơn vị ATTP.",
        },
      ],
      inspections: [],
    }
    incidentsStore.unshift(created)
    reportsInboxStore.unshift({
      id: `rep-${Date.now()}`,
      incidentId: newId,
      recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
      referenceNumber: newCode,
      status: "SENT",
      attemptedAt: now,
      forwardedAt: now,
      createdAt: now,
    })
    return projectIncident(created)
  },

  async forwardIncident(id, payload) {
    await delay(220)
    const item = incidentsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const user = getCurrentUser()
    const now = new Date().toISOString()
    item.status = "SUBMITTED_TO_AUTHORITY"
    item.preliminaryAssessment = payload.preliminaryAssessment
    item.preliminaryNote = payload.preliminaryNote || null
    item.reviewedBy = { id: user.id, fullName: user.fullName }
    item.reviewedAt = now
    item.recipientUnit = { id: "unit-dv", name: "Đơn vị ATTP Phường Dịch Vọng" }
    item.traceCompleteness = "COMPLETE"
    item.traceSnapshots.push({
      id: `snap-${Date.now()}`,
      version: item.traceSnapshots.length + 1,
      completeness: "COMPLETE",
      missingReasons: [],
      payloadVersion: "1.0",
      hashAlgorithm: "SHA-256",
      payloadHash: "e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9012345678",
      createdAt: now,
      createdBy: { id: user.id, fullName: user.fullName },
    })
    item.forwardings.push({
      id: `rep-${Date.now()}`,
      status: "SENT",
      traceSnapshotVersion: item.traceSnapshots.length,
      forwardedAt: now,
      recipientOrganization: "Đơn vị ATTP Phường Dịch Vọng",
    })
    item.histories.push({
      id: `h-${Date.now()}`,
      fromStatus: "PENDING_SCHOOL_REVIEW",
      toStatus: "SUBMITTED_TO_AUTHORITY",
      createdAt: now,
      actor: { id: user.id, fullName: user.fullName },
      note: payload.preliminaryNote || "Chuyển hồ sơ lên Đơn vị ATTP Phường Dịch Vọng.",
    })
    item.updatedAt = now
    return projectIncident(item)
  },

  async cancelIncident(id, payload) {
    await delay()
    const item = incidentsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const user = getCurrentUser()
    const now = new Date().toISOString()
    item.status = "CANCELLED_BY_SCHOOL"
    item.cancellationReason = payload.reason
    item.cancellationNote = payload.note
    item.histories.push({
      id: `h-${Date.now()}`,
      fromStatus: "PENDING_SCHOOL_REVIEW",
      toStatus: "CANCELLED_BY_SCHOOL",
      createdAt: now,
      actor: { id: user.id, fullName: user.fullName },
      note: payload.note,
    })
    item.updatedAt = now
    return projectIncident(item)
  },

  async addAllocations(id, mealAllocationIds = []) {
    await delay()
    const item = incidentsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const existing = new Set((item.allocations || []).map(a => a.mealAllocationId))
    let added = 0
    mealAllocationIds.forEach(allocId => {
      if (!existing.has(allocId)) {
        existing.add(allocId)
        added += 1
        item.allocations.push({
          mealAllocationId: allocId,
          status: "DISTRIBUTED",
          mealDate: todayYmd(0),
          mealType: "LUNCH",
          classId: "cls-3a2",
          className: `Lớp gắn thêm (${String(allocId).slice(-4)})`,
        })
      }
    })
    if (added > 0 && item.status !== "PENDING_SCHOOL_REVIEW") {
      const user = getCurrentUser()
      item.traceSnapshots.push({
        id: `snap-${Date.now()}`,
        version: item.traceSnapshots.length + 1,
        completeness: "COMPLETE",
        missingReasons: [],
        payloadVersion: "1.0",
        hashAlgorithm: "SHA-256",
        payloadHash: "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
        createdAt: new Date().toISOString(),
        createdBy: { id: user.id, fullName: user.fullName },
      })
    }
    return { added, incident: projectIncident(item) }
  },

  async getTraceSnapshot(id, version) {
    await delay(180)
    const item = incidentsStore.find(x => x.id === id)
    const snap = item?.traceSnapshots?.find(s => Number(s.version) === Number(version)) || {
      id: "snap-fallback",
      version: Number(version) || 1,
      completeness: "COMPLETE",
      missingReasons: [],
      payloadVersion: "1.0",
      hashAlgorithm: "SHA-256",
      payloadHash: "9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c",
      createdAt: hoursAgo(20),
      createdBy: { id: "u-bgh-1", fullName: "Lê Văn Đức" },
    }
    return {
      ...clone(snap),
      hashMatches: true,
      payload: clone(MOCK_SNAPSHOT_PAYLOAD_V2),
    }
  },

  async getInspectionSuppliers() {
    await delay(140)
    return {
      source: "SNAPSHOT",
      items: [
        { id: "sup-anviet", name: "Công ty Thực phẩm Xanh An Việt" },
        { id: "sup-songhong", name: "HTX Nông sản Sạch Sông Hồng" },
      ],
    }
  },

  async createInspection(id, payload) {
    await delay(200)
    const item = incidentsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const user = getCurrentUser()
    const now = new Date().toISOString()
    const created = {
      id: `insp-${Date.now()}`,
      status: "PLANNED",
      teamDescription: payload.teamDescription,
      scheduledAt: payload.scheduledAt,
      createdAt: now,
      createdBy: { id: user.id, fullName: user.fullName },
      recordedAt: null,
      recordedBy: null,
      overallConclusion: null,
      resultSummary: null,
      findings: [],
    }
    item.inspections.push(created)
    if (item.status === "AUTHORITY_ACKNOWLEDGED") {
      item.status = "UNDER_INSPECTION"
      item.histories.push({
        id: `h-${Date.now()}`,
        fromStatus: "AUTHORITY_ACKNOWLEDGED",
        toStatus: "UNDER_INSPECTION",
        createdAt: now,
        actor: { id: user.id, fullName: user.fullName },
        note: "Lập đợt kiểm tra mới.",
      })
    }
    item.updatedAt = now
    return clone(created)
  },

  async recordInspectionResult(id, inspectionId, payload) {
    await delay(220)
    const item = incidentsStore.find(x => x.id === id)
    const insp = item?.inspections?.find(x => x.id === inspectionId)
    if (!item || !insp) throw makeHttpError(404, "Không tìm thấy đợt kiểm tra.")
    const user = getCurrentUser()
    const now = new Date().toISOString()
    const supMap = {
      "sup-anviet": "Công ty Thực phẩm Xanh An Việt",
      "sup-songhong": "HTX Nông sản Sạch Sông Hồng",
    }
    insp.status = "COMPLETED"
    insp.resultSummary = payload.resultSummary
    insp.overallConclusion = payload.overallConclusion
    insp.recordedAt = now
    insp.recordedBy = { id: user.id, fullName: user.fullName, role: "Cán bộ ATTP cấp xã" }
    insp.findings = (payload.findings || []).map(f => ({
      ...f,
      supplierName: supMap[f.supplierId] || f.supplierId,
    }))
    const hasPlanned = item.inspections.some(x => x.status === "PLANNED")
    if (!hasPlanned) {
      const prev = item.status
      item.status = "INSPECTION_COMPLETED"
      item.histories.push({
        id: `h-${Date.now()}`,
        fromStatus: prev,
        toStatus: "INSPECTION_COMPLETED",
        createdAt: now,
        actor: { id: user.id, fullName: user.fullName },
        note: "Đã ghi kết quả tất cả các đợt kiểm tra.",
      })
    }
    item.updatedAt = now
    return { incidentStatus: item.status, inspection: clone(insp) }
  },

  async closeIncident(id, payload = {}) {
    await delay()
    const item = incidentsStore.find(x => x.id === id)
    if (!item) throw makeHttpError(404, "Không tìm thấy hồ sơ.")
    const user = getCurrentUser()
    const now = new Date().toISOString()
    const prev = item.status
    item.status = "CLOSED"
    item.resolvedAt = now
    item.histories.push({
      id: `h-${Date.now()}`,
      fromStatus: prev,
      toStatus: "CLOSED",
      createdAt: now,
      actor: { id: user.id, fullName: user.fullName },
      note: payload.note || "Đóng hồ sơ báo cáo ngộ độc.",
    })
    item.updatedAt = now
    return { id: item.id, status: "CLOSED" }
  },

  async listReports({ page = 1, limit = 20 } = {}) {
    await delay()
    return paginateArray(reportsInboxStore, page, limit)
  },

  async receiveReport(reportId) {
    await delay(200)
    const rep = reportsInboxStore.find(r => r.id === reportId)
    if (!rep) throw makeHttpError(404, "Không tìm thấy bản chuyển báo cáo.")
    const inc = incidentsStore.find(x => x.id === rep.incidentId)
    if (inc && inc.status === "SUBMITTED_TO_AUTHORITY") {
      const user = getCurrentUser()
      const now = new Date().toISOString()
      inc.status = "AUTHORITY_ACKNOWLEDGED"
      inc.histories.push({
        id: `h-${Date.now()}`,
        fromStatus: "SUBMITTED_TO_AUTHORITY",
        toStatus: "AUTHORITY_ACKNOWLEDGED",
        createdAt: now,
        actor: { id: user.id, fullName: user.fullName },
        note: "Đơn vị ATTP đã tiếp nhận hồ sơ.",
      })
      inc.updatedAt = now
    }
    return { id: reportId, incidentId: rep.incidentId, status: "AUTHORITY_ACKNOWLEDGED" }
  },

  async listSchoolClasses() {
    await delay(100)
    return [
      { id: "cls-1a1", name: "Lớp 1A1" },
      { id: "cls-1a3", name: "Lớp 1A3" },
      { id: "cls-2a1", name: "Lớp 2A1" },
      { id: "cls-3a2", name: "Lớp 3A2" },
      { id: "cls-4a1", name: "Lớp 4A1" },
      { id: "cls-5a1", name: "Lớp 5A1" },
    ]
  },

  async listDistributedAllocations() {
    await delay(100)
    return [
      {
        mealAllocationId: "11111111-1111-4111-8111-111111111101",
        classId: "cls-1a1",
        className: "Lớp 1A1",
        mealDate: todayYmd(0),
        mealType: "LUNCH",
        status: "DISTRIBUTED",
      },
      {
        mealAllocationId: "11111111-1111-4111-8111-111111111102",
        classId: "cls-2a1",
        className: "Lớp 2A1",
        mealDate: todayYmd(0),
        mealType: "LUNCH",
        status: "DISTRIBUTED",
      },
      {
        mealAllocationId: "11111111-1111-4111-8111-111111111103",
        classId: "cls-3a2",
        className: "Lớp 3A2",
        mealDate: todayYmd(0),
        mealType: "LUNCH",
        status: "DISTRIBUTED",
      },
      {
        mealAllocationId: "11111111-1111-4111-8111-111111111104",
        classId: "cls-3a3",
        className: "Lớp 3A3",
        mealDate: todayYmd(0),
        mealType: "LUNCH",
        status: "DISTRIBUTED",
      },
    ]
  },
}

/* ============================================================================
 * 6. SUPPLIER ENFORCEMENT ACTIONS (CHẾ TÀI NCC)
 * ========================================================================== */
const enforcementStore = [
  {
    id: "enf-01",
    incident: {
      id: "inc-50201",
      code: "FP-IC-50201",
      title: "11 học sinh khối 3 nôn ói và sốt nhẹ sau bữa trưa ngày hôm qua",
      status: "UNDER_INSPECTION",
    },
    supplier: { id: "sup-anviet", name: "Công ty Thực phẩm Xanh An Việt", taxCode: "0108234567" },
    actionType: "PAUSE_INTAKE",
    requestReason:
      "Đề nghị tạm dừng tiếp nhận đơn hàng mới trong thời gian chờ kết quả kiểm tra kho lạnh cơ sở cung cấp lô ức gà LOT-GA-241125-A.",
    evidenceInspection: null,
    requestedBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng (Đơn vị ATTP Phường Dịch Vọng)" },
    decisionStatus: "PENDING",
    decidedBy: null,
    decidedAt: null,
    decisionNote: null,
    executionStatus: "NOT_APPLIED",
    executedAt: null,
    executionNote: null,
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
  },
  {
    id: "enf-02",
    incident: {
      id: "inc-50201",
      code: "FP-IC-50201",
      title: "11 học sinh khối 3 nôn ói và sốt nhẹ sau bữa trưa ngày hôm qua",
      status: "UNDER_INSPECTION",
    },
    supplier: { id: "sup-anviet", name: "Công ty Thực phẩm Xanh An Việt", taxCode: "0108234567" },
    actionType: "LOCK_ACCOUNT",
    requestReason:
      "Kết quả xét nghiệm đợt kiểm tra 1 xác định mẫu lưu ức gà dương tính Salmonella vượt ngưỡng cho phép. Đề nghị khóa toàn bộ tài khoản của nhà cung cấp.",
    evidenceInspection: {
      id: "insp-50201-1",
      overallConclusion: "SUPPLIER_AT_FAULT",
      recordedAt: hoursAgo(5),
    },
    requestedBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng (Đơn vị ATTP Phường Dịch Vọng)" },
    decisionStatus: "PENDING",
    decidedBy: null,
    decidedAt: null,
    decisionNote: null,
    executionStatus: "NOT_APPLIED",
    executedAt: null,
    executionNote: null,
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
  },
  {
    id: "enf-03",
    incident: {
      id: "inc-50175",
      code: "FP-IC-50175",
      title: "Nghi ngờ ngộ độc do giò lụa chứa hàn the tại Trường Tiểu học Yên Hòa",
      status: "CLOSED",
    },
    supplier: { id: "sup-minhphat", name: "Cơ sở Chế biến Thực phẩm Minh Phát", taxCode: "0105544332" },
    actionType: "LOCK_ACCOUNT",
    requestReason: "Phát hiện dương tính hàn the trong mẫu lưu giò lụa đợt kiểm tra ngày 18/11.",
    evidenceInspection: {
      id: "insp-50175-1",
      overallConclusion: "SUPPLIER_AT_FAULT",
      recordedAt: hoursAgo(140),
    },
    requestedBy: { id: "u-attp-2", fullName: "Lê Minh Châu (Đơn vị ATTP Phường Yên Hòa)" },
    decisionStatus: "APPROVED",
    decidedBy: { id: "u-sys-1", fullName: "FoodPrint System Admin" },
    decidedAt: hoursAgo(120),
    decisionNote: "Đồng ý khóa khẩn cấp toàn bộ tài khoản nhà cung cấp.",
    executionStatus: "FAILED",
    executedAt: hoursAgo(120),
    executionNote: "Đã khóa 4/4 tài khoản, thu hồi 1 phiên đăng nhập cũ gặp lỗi mạng — cần thử lại.",
    createdAt: hoursAgo(130),
    updatedAt: hoursAgo(120),
  },
  {
    id: "enf-04",
    incident: {
      id: "inc-50190",
      code: "FP-IC-50190",
      title: "3 học sinh lớp 1A1 nổi mẩn đỏ nghi dị ứng thực phẩm",
      status: "INSPECTION_COMPLETED",
    },
    supplier: { id: "sup-songhong", name: "HTX Nông sản Sạch Sông Hồng", taxCode: "0109876543" },
    actionType: "RESTORE",
    requestReason: "Kết quả kiểm tra xác định nguyên liệu của HTX an toàn, đề nghị khôi phục hoạt động.",
    evidenceInspection: null,
    requestedBy: { id: "u-attp-1", fullName: "Phạm Quốc Hùng (Đơn vị ATTP Phường Dịch Vọng)" },
    decisionStatus: "APPROVED",
    decidedBy: { id: "u-sys-1", fullName: "FoodPrint System Admin" },
    decidedAt: hoursAgo(9),
    decisionNote: "Đã duyệt khôi phục trạng thái tiếp nhận.",
    executionStatus: "APPLIED",
    executedAt: hoursAgo(9),
    executionNote: "Đã gỡ hạn chế của hồ sơ FP-IC-50190; nhà cung cấp trở lại trạng thái ACTIVE.",
    createdAt: hoursAgo(10),
    updatedAt: hoursAgo(9),
  },
]

const activeRestrictionsBySupplier = {
  "sup-anviet": [
    {
      id: "rst-01",
      restrictionType: "PAUSE_INTAKE",
      incidentId: "inc-50201",
      activatedAt: hoursAgo(12),
      lockedAccountCount: 0,
    },
  ],
  "sup-minhphat": [
    {
      id: "rst-02",
      restrictionType: "LOCK_ACCOUNT",
      incidentId: "inc-50175",
      activatedAt: hoursAgo(120),
      lockedAccountCount: 4,
    },
  ],
}

export const mockSupplierEnforcement = {
  async listActions(params = {}) {
    await delay()
    const filtered = enforcementStore.filter(item => {
      if (params.incidentId && item.incident?.id !== params.incidentId) return false
      if (params.supplierId && item.supplier?.id !== params.supplierId) return false
      if (params.actionType && item.actionType !== params.actionType) return false
      if (params.decisionStatus && item.decisionStatus !== params.decisionStatus) return false
      if (params.executionStatus && item.executionStatus !== params.executionStatus) return false
      return true
    })
    return paginateArray(filtered, params.page, params.limit)
  },

  async getActionDetail(actionId) {
    await delay()
    const found = enforcementStore.find(x => x.id === actionId)
    if (!found) throw makeHttpError(404, "Không tìm thấy yêu cầu chế tài.")
    const user = getCurrentUser()
    const result = clone(found)
    if (user.role === ROLES.SYSTEM_ADMIN) {
      result.activeRestrictions = clone(activeRestrictionsBySupplier[found.supplier?.id] || [])
    }
    return result
  },

  async requestEnforcement(incidentId, payload) {
    await delay(220)
    const duplicate = enforcementStore.find(
      x =>
        x.incident?.id === incidentId &&
        x.supplier?.id === payload.supplierId &&
        x.actionType === payload.actionType &&
        x.decisionStatus === "PENDING",
    )
    if (duplicate) {
      throw makeHttpError(409, "Đã tồn tại một yêu cầu chế tài cùng loại đang chờ duyệt cho nhà cung cấp này.")
    }
    const inc = incidentsStore.find(x => x.id === incidentId)
    const supName =
      payload.supplierId === "sup-anviet"
        ? "Công ty Thực phẩm Xanh An Việt"
        : "HTX Nông sản Sạch Sông Hồng"
    const user = getCurrentUser()
    const now = new Date().toISOString()
    const created = {
      id: `enf-${Date.now()}`,
      incident: {
        id: incidentId,
        code: inc?.code || "FP-IC-50201",
        title: inc?.title || "Báo cáo ngộ độc",
        status: inc?.status || "UNDER_INSPECTION",
      },
      supplier: { id: payload.supplierId, name: supName },
      actionType: payload.actionType,
      requestReason: payload.reason,
      evidenceInspection: payload.evidenceInspectionId
        ? { id: payload.evidenceInspectionId, overallConclusion: "SUPPLIER_AT_FAULT", recordedAt: now }
        : null,
      requestedBy: { id: user.id, fullName: user.fullName },
      decisionStatus: "PENDING",
      decidedBy: null,
      decidedAt: null,
      decisionNote: null,
      executionStatus: "NOT_APPLIED",
      executedAt: null,
      executionNote: null,
      createdAt: now,
      updatedAt: now,
    }
    enforcementStore.unshift(created)
    return clone(created)
  },

  async approveAction(actionId, payload = {}) {
    await delay(240)
    const item = enforcementStore.find(x => x.id === actionId)
    if (!item) throw makeHttpError(404, "Không tìm thấy yêu cầu chế tài.")
    const user = getCurrentUser()
    const now = new Date().toISOString()
    item.decisionStatus = "APPROVED"
    item.decidedBy = { id: user.id, fullName: user.fullName }
    item.decidedAt = now
    item.decisionNote = payload.note || "Đã phê duyệt và thực thi."
    item.executionStatus = "APPLIED"
    item.executedAt = now
    item.executionNote =
      item.actionType === "LOCK_ACCOUNT"
        ? "Đã chuyển NCC sang tạm dừng kiểm tra ATTP và khóa toàn bộ 3 tài khoản hoạt động."
        : item.actionType === "PAUSE_INTAKE"
          ? "Đã chuyển trạng thái tiếp nhận của NCC sang PAUSED_FOR_FOOD_SAFETY_INSPECTION."
          : "Đã gỡ hạn chế của hồ sơ này và khôi phục trạng thái ACTIVE."
    item.updatedAt = now
    return {
      action: clone(item),
      lockedAccountCount: item.actionType === "LOCK_ACCOUNT" ? 3 : 0,
      unlockedAccountCount: item.actionType === "RESTORE" ? 3 : 0,
      supplierIntakeState:
        item.actionType === "RESTORE" ? "ACTIVE" : "PAUSED_FOR_FOOD_SAFETY_INSPECTION",
    }
  },

  async rejectAction(actionId, payload = {}) {
    await delay(200)
    const item = enforcementStore.find(x => x.id === actionId)
    if (!item) throw makeHttpError(404, "Không tìm thấy yêu cầu chế tài.")
    const user = getCurrentUser()
    const now = new Date().toISOString()
    item.decisionStatus = "REJECTED"
    item.decidedBy = { id: user.id, fullName: user.fullName }
    item.decidedAt = now
    item.decisionNote = payload.note
    item.updatedAt = now
    return clone(item)
  },

  async retryAction(actionId) {
    await delay(240)
    const item = enforcementStore.find(x => x.id === actionId)
    if (!item) throw makeHttpError(404, "Không tìm thấy yêu cầu chế tài.")
    const now = new Date().toISOString()
    item.executionStatus = "APPLIED"
    item.executedAt = now
    item.executionNote = "Đã thu hồi thành công toàn bộ phiên đăng nhập còn lại của nhà cung cấp."
    item.updatedAt = now
    return clone(item)
  },
}

/* ============================================================================
 * 7. AUTHORITY OFFICERS (SYSTEM ADMIN)
 * ========================================================================== */
const authorityOfficersStore = [
  {
    id: "off-01",
    username: "attp.dichvong",
    fullName: "Phạm Quốc Hùng",
    email: "hung.attp.dichvong@example.invalid",
    phone: "0912345678",
    status: "ACTIVE",
    emailSetupRequired: false,
    emailVerifiedAt: hoursAgo(240),
    createdAt: hoursAgo(250),
    unit: { id: "unit-dv", code: "ATTP-00166", name: "Đơn vị ATTP Phường Dịch Vọng", status: "ACTIVE" },
    location: { id: "loc-w-dv", code: "00166", name: "Phường Dịch Vọng" },
  },
  {
    id: "off-02",
    username: "attp.yenhoa",
    fullName: "Lê Minh Châu",
    email: null,
    phone: "0987654321",
    status: "UNVERIFIED",
    emailSetupRequired: true,
    emailVerifiedAt: null,
    createdAt: hoursAgo(12),
    unit: { id: "unit-yh", code: "ATTP-00169", name: "Đơn vị ATTP Phường Yên Hòa", status: "ACTIVE" },
    location: { id: "loc-w-yh", code: "00169", name: "Phường Yên Hòa" },
  },
  {
    id: "off-03",
    username: "attp.bennghe",
    fullName: "Nguyễn Hoàng Anh",
    email: "anh.attp.bennghe@example.invalid",
    phone: "0909112233",
    status: "ACTIVE",
    emailSetupRequired: false,
    emailVerifiedAt: hoursAgo(500),
    createdAt: hoursAgo(520),
    unit: { id: "unit-bn", code: "ATTP-26740", name: "Đơn vị ATTP Phường Bến Nghé", status: "ACTIVE" },
    location: { id: "loc-w-bn", code: "26740", name: "Phường Bến Nghé" },
  },
  {
    id: "off-04",
    username: "attp.haichau1",
    fullName: "Trần Thanh Tùng",
    email: "tung.attp.haichau@example.invalid",
    phone: null,
    status: "LOCKED",
    emailSetupRequired: false,
    emailVerifiedAt: hoursAgo(900),
    createdAt: hoursAgo(920),
    unit: { id: "unit-hc1", code: "ATTP-20230", name: "Đơn vị ATTP Phường Hải Châu I", status: "INACTIVE" },
    location: { id: "loc-w-hc1", code: "20230", name: "Phường Hải Châu I" },
  },
]

export const mockAuthorityOfficers = {
  async list(params = {}) {
    await delay()
    const filtered = authorityOfficersStore.filter(item => {
      if (params.status && params.status !== "ALL" && item.status !== params.status) return false
      if (params.locationId && item.location?.id !== params.locationId) return false
      if (params.search) {
        const q = String(params.search).trim().toLowerCase()
        const hay = `${item.fullName} ${item.username}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    return paginateArray(filtered, params.page, params.limit)
  },

  async detail(userId) {
    await delay()
    const found = authorityOfficersStore.find(x => x.id === userId)
    if (!found) throw makeHttpError(404, "Không tìm thấy tài khoản cán bộ ATTP.")
    return clone(found)
  },

  async create(payload) {
    await delay(240)
    const ward = MOCK_LOCATIONS.find(l => l.id === payload.locationId && l.level === 2)
    if (!ward) {
      throw makeHttpError(400, "Phường/xã không hợp lệ.", {
        fields: [{ field: "locationId", message: "Vui lòng chọn phường/xã hợp lệ." }],
      })
    }
    if (authorityOfficersStore.some(o => o.location?.id === ward.id)) {
      throw makeHttpError(409, "Phường/xã này đã có tài khoản cán bộ ATTP.", {
        code: "AUTHORITY_OFFICER_EXISTS",
      })
    }
    if (authorityOfficersStore.some(o => o.username === payload.username)) {
      throw makeHttpError(409, "Tên đăng nhập đã tồn tại.", {
        code: "USERNAME_TAKEN",
      })
    }
    const created = {
      id: `off-${Date.now()}`,
      username: payload.username,
      fullName: payload.fullName,
      email: null,
      phone: payload.phone || null,
      status: "UNVERIFIED",
      emailSetupRequired: true,
      emailVerifiedAt: null,
      createdAt: new Date().toISOString(),
      unit: {
        id: `unit-${ward.code}`,
        code: `ATTP-${ward.code}`,
        name: `Đơn vị ATTP ${ward.name}`,
        status: "ACTIVE",
      },
      location: { id: ward.id, code: ward.code, name: ward.name },
    }
    authorityOfficersStore.unshift(created)
    return clone(created)
  },
}

/* ============================================================================
 * 8. AUTHORITY SCHOOLS (ATTP PORTAL DEFAULT LANDING)
 * ========================================================================== */
const authoritySchoolsStore = [
  {
    id: "sch-cg-01",
    code: "TH-CG01",
    name: "Trường Tiểu học Cầu Giấy",
    address: "Số 18 phố Dịch Vọng, Cầu Giấy, Hà Nội",
    phone: "02437681234",
    email: "tieuhoccaugiay@example.invalid",
    status: "ACTIVE",
    location: { id: "loc-w-dv", code: "00166", name: "Phường Dịch Vọng" },
    suppliers: [
      {
        id: "sup-anviet",
        name: "Công ty Thực phẩm Xanh An Việt",
        taxCode: "0108234567",
        phone: "02439991122",
        email: "anviet.food@example.invalid",
        address: "KCN Phú Minh, Bắc Từ Liêm, Hà Nội",
        location: { id: "loc-w-nd", code: "00157", name: "Phường Nghĩa Đô" },
        intakeState: "PAUSED_FOR_FOOD_SAFETY_INSPECTION",
        relationshipStatus: "ACTIVE",
        linkedAt: hoursAgo(2400),
        suspendedAt: null,
      },
      {
        id: "sup-songhong",
        name: "HTX Nông sản Sạch Sông Hồng",
        taxCode: "0109876543",
        phone: "02438882233",
        email: "songhong.coop@example.invalid",
        address: "Xã Đông Anh, Hà Nội",
        location: { id: "loc-w-da", code: "00460", name: "Xã Đông Anh" },
        intakeState: "ACTIVE",
        relationshipStatus: "ACTIVE",
        linkedAt: hoursAgo(3000),
        suspendedAt: null,
      },
      {
        id: "sup-minhphat",
        name: "Cơ sở Chế biến Thực phẩm Minh Phát",
        taxCode: "0105544332",
        phone: "02437774455",
        email: "minhphat@example.invalid",
        address: "Phường Yên Hòa, Cầu Giấy, Hà Nội",
        location: { id: "loc-w-yh", code: "00169", name: "Phường Yên Hòa" },
        intakeState: "PAUSED",
        relationshipStatus: "SUSPENDED",
        linkedAt: hoursAgo(4000),
        suspendedAt: hoursAgo(120),
      },
    ],
  },
  {
    id: "sch-dvb-02",
    code: "TH-DVB02",
    name: "Trường Tiểu học Dịch Vọng B",
    address: "Ngõ 82 phố Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    phone: "02437685678",
    email: "tieuhocdichvongb@example.invalid",
    status: "ACTIVE",
    location: { id: "loc-w-dv", code: "00166", name: "Phường Dịch Vọng" },
    suppliers: [
      {
        id: "sup-songhong",
        name: "HTX Nông sản Sạch Sông Hồng",
        taxCode: "0109876543",
        phone: "02438882233",
        email: "songhong.coop@example.invalid",
        address: "Xã Đông Anh, Hà Nội",
        location: { id: "loc-w-da", code: "00460", name: "Xã Đông Anh" },
        intakeState: "ACTIVE",
        relationshipStatus: "ACTIVE",
        linkedAt: hoursAgo(1800),
        suspendedAt: null,
      },
    ],
  },
  {
    id: "sch-hh-03",
    code: "MN-HH03",
    name: "Trường Mầm non Hoa Hồng",
    address: "Đường Thành Thái, Phường Dịch Vọng, Hà Nội",
    phone: "02437913456",
    email: "mamnonhoahong@example.invalid",
    status: "ACTIVE",
    location: { id: "loc-w-dv", code: "00166", name: "Phường Dịch Vọng" },
    suppliers: [],
  },
  {
    id: "sch-dv-04",
    code: "THCS-DV04",
    name: "Trường THCS Dịch Vọng",
    address: "Số 186 đường Nguyễn Khánh Toàn, Hà Nội",
    phone: "02438331199",
    email: "thcsdichvong@example.invalid",
    status: "INACTIVE",
    location: { id: "loc-w-dv", code: "00166", name: "Phường Dịch Vọng" },
    suppliers: [],
  },
]

export const mockAuthoritySchools = {
  async listSchools(params = {}) {
    await delay()
    const filtered = authoritySchoolsStore
      .filter(item => {
        if (params.status && params.status !== "ALL" && item.status !== params.status) return false
        if (params.search) {
          const q = String(params.search).trim().toLowerCase()
          const hay = `${item.name} ${item.code}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .map(({ suppliers: _suppliers, ...rest }) => rest)
    return paginateArray(filtered, params.page, params.limit)
  },

  async getSchoolDetail(schoolId) {
    await delay()
    const found = authoritySchoolsStore.find(x => x.id === schoolId)
    if (!found) {
      throw makeHttpError(404, "Trường học không thuộc địa bàn quản lý của đơn vị ATTP này.")
    }
    return clone(found)
  },
}

/* ============================================================================
 * 9. EMAIL SETUP FIRST LOGIN (OTP = any 6 digits, e.g. 123456)
 * ========================================================================== */
export const mockEmailSetup = {
  async request(email) {
    await delay(200)
    const normalized = String(email || "").trim().toLowerCase()
    if (normalized === "taken@example.com") {
      throw makeHttpError(409, "Email này đã được sử dụng bởi tài khoản khác.", {
        code: "EMAIL_TAKEN",
      })
    }
    return { expiresIn: 600, resendAfter: 60 }
  },

  async verify({ email, code }) {
    await delay(220)
    if (!/^\d{6}$/.test(String(code || "").trim())) {
      throw makeHttpError(400, "Mã xác nhận gồm 6 chữ số không hợp lệ hoặc đã hết hạn.")
    }
    const stored = getStorage(STORAGE.USER_INFO) || {}
    return {
      user: {
        ...stored,
        id: stored.id || stored.userId || "off-02",
        role: stored.role || ROLES.COMMUNE_FOOD_SAFETY_OFFICER,
        orgType: stored.orgType || "AUTHORITY",
        email: String(email || "").trim().toLowerCase(),
        status: "ACTIVE",
        emailSetupRequired: false,
        emailVerifiedAt: new Date().toISOString(),
        permissions: [
          "authority_school.view",
          "authority_complaint.view",
          "authority_complaint.respond",
          "food_safety_incident.view",
          "food_safety_inspection.manage",
          "supplier_enforcement.request",
        ],
      },
      expiresIn: 3600,
    }
  },
}
