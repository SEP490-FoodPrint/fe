// Illustrative fixtures for the Figma prototype, never production organization records.
const people = [
  ["Nguyễn Thị Thanh Mai", "thanhmai@hoasen.edu.vn", "Trường Tiểu học Hoa Sen", "SCHOOL", "PENDING", "2026-10-22T09:15:00+07:00"],
  ["Trần Quốc Huy", "quochuy@binhanfood.vn", "Công ty Thực phẩm Bình An", "SUPPLIER", "PENDING", "2026-10-22T08:40:00+07:00"],
  ["Lê Minh Anh", "minhanh@hongha.edu.vn", "Trường Tiểu học Hồng Hà", "SCHOOL", "APPROVED", "2026-10-21T15:20:00+07:00"],
  ["Phạm Hoàng Nam", "nam.ph@bentreagri.vn", "Công ty Nông sản Bến Tre", "SUPPLIER", "APPROVED", "2026-10-21T10:30:00+07:00"],
  ["Võ Thu Hà", "thuha.vo@gmail.com", null, "SCHOOL", "REJECTED", "2026-10-20T14:10:00+07:00"],
]

const documents = [
  { id: "attp", name: "Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm", number: "ATTP-0248/2026", issued_at: "2026-09-05", expires_at: "2029-09-05", mime_type: "application/pdf", is_demo: true },
  { id: "fsms", name: "Chứng nhận hệ thống quản lý an toàn thực phẩm", number: "FSMS-1186/2026", issued_at: "2026-08-10", expires_at: "2029-08-10", mime_type: "image/jpeg", is_demo: true },
]
const ingredients = [
  { id: "rice", name: "Gạo tẻ", group: "Gạo và ngũ cốc", unit: "kg", is_proposed: false, note: "Gạo hạt dài, đóng bao 25 kg." },
  { id: "carrot", name: "Cà rốt", group: "Rau củ", unit: "kg", is_proposed: false, note: "Thu hoạch trong ngày." },
  { id: "pumpkin", name: "Bí đỏ hữu cơ", group: "Rau củ", unit: "kg", is_proposed: true, note: "Đề xuất bổ sung theo hồ sơ." },
]

export const MOCK_REGISTRATION_REQUESTS = Array.from({ length: 80 }, (_, index) => {
  const original = people[index % people.length]
  const [full_name, email, name, request_type] = original
  const status = index < 5 ? original[4] : index < 15 ? "PENDING" : index % 4 === 0 ? "REJECTED" : "APPROVED"
  const submitted_at = index < 5 ? original[5] : `2026-10-${String(19 - Math.floor((index - 5) / 6)).padStart(2, "0")}T08:40:00+07:00`
  const reviewed_at = status === "PENDING" ? null : index < 4 ? "2026-10-22T09:30:00+07:00" : index === 4 ? "2026-10-21T09:30:00+07:00" : submitted_at
  return {
    id: `${String(248 - index).padStart(6, "0")}00-0000-4000-8000-000000000001`,
    applicant_user_id: `demo-applicant-${index + 1}`,
    request_type, status, submitted_at, reviewed_at, updated_at: reviewed_at || submitted_at,
    reviewed_by_user_id: reviewed_at ? "demo-system-admin" : null,
    reviewer: reviewed_at ? { full_name: "Nguyễn An" } : null,
    rejection_reason: status === "REJECTED" ? "Tệp minh chứng chưa thể hiện rõ ngày hết hạn." : null,
    applicant: {
      full_name, email, username: index === 1 ? "tranquochuy" : `nguoidangky${index + 1}`,
      phone: index === 1 ? "0903 456 789" : null, status: "ACTIVE",
      email_verified_at: index === 1 ? "2026-10-22T08:10:00+07:00" : submitted_at,
    },
    profile_data: {
      name,
      ...(index === 1 ? {
        tax_code: "0317654321", email: "lienhe@binhanfood.vn", phone: "028 3948 2686",
        address: "125 Nguyễn Văn Linh, Phường Tân Phong, TP. Hồ Chí Minh",
        description: "Phân phối rau củ và thực phẩm tươi cho bếp ăn trường học.",
      } : { email, address: null }),
      ingredients: request_type === "SUPPLIER" ? ingredients : [],
    },
    supporting_documents: request_type === "SUPPLIER" ? documents : [],
  }
})
