// Xuất thực đơn tuần ra PDF cho Ban Giám hiệu: dựng một tài liệu A4 ngang (mỗi thực đơn / khối một trang)
// rồi mở hộp thoại in của trình duyệt (chọn "Lưu dưới dạng PDF"). Chữ trong PDF là văn bản thật,
// hiển thị đúng tiếng Việt, không cần thư viện tạo PDF.

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]

// Đọc ngày ở các dạng API trả về: "2026-11-23" (ISO), "23/11/2026" và "14:30 20/11/26" (vi-VN) → [năm, tháng, ngày]
export const dateParts = (value) => {
  const text = String(value || "")
  const iso = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text)
  if (iso) return [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  const vn = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(text)
  if (vn) {
    const year = Number(vn[3])
    return [year < 100 ? 2000 + year : year, Number(vn[2]), Number(vn[1])]
  }
  return [0, 0, 0]
}

/** "2026-11-23" → "23/11/2026" */
export const formatPdfDate = (iso) => {
  const [year, month, day] = dateParts(iso)
  if (!year) return ""
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
}

/** "2026-11-23" → { weekday: "Thứ Hai", date: "23/11" } (không phụ thuộc múi giờ máy) */
export const pdfDayLabel = (iso) => {
  const [year, month, day] = dateParts(iso)
  if (!year) return { weekday: "", date: "" }
  return {
    weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
    date: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`,
  }
}

const STATUS = {
  APPROVED: { label: "Đã phê duyệt", tone: "approved" },
  PENDING_APPROVAL: { label: "Chờ phê duyệt", tone: "pending" },
  REVISION_REQUIRED: { label: "Yêu cầu điều chỉnh", tone: "revision" },
  DRAFT: { label: "Bản nháp", tone: "pending" },
}

const scopeLabel = (menu) =>
  menu.isSchoolWide || !menu.grades?.length ? "Toàn trường" : menu.grades.map((grade) => grade.name).join(", ")

// Chữ viết tắt khi trường chưa có logo: bỏ các từ chung ("Trường Tiểu học", "THCS"...),
// một từ viết hoa kiểu "FoodPrint" lấy các chữ hoa → "FP"; còn lại lấy chữ đầu của 2 từ cuối.
const COMMON_WORDS = new Set(["trường", "tiểu", "học", "trung", "cơ", "sở", "phổ", "thông", "mầm", "non", "thcs", "thpt", "liên", "cấp"])
export const schoolInitials = (name) => {
  const words = String(name || "").split(/\s+/).filter((word) => word && !COMMON_WORDS.has(word.toLowerCase()))
  if (!words.length) return "FP"
  if (words.length === 1) {
    const capitals = words[0].replace(/[^A-ZÀ-Ỹ]/g, "")
    return (capitals.length >= 2 ? capitals : words[0]).slice(0, 2).toUpperCase()
  }
  return words.slice(-2).map((word) => word[0]).join("").toUpperCase()
}
const initials = schoolInitials

const dishList = (dishes) =>
  dishes?.length
    ? `<ul class="dishes">${dishes
        .map(
          (dish) =>
            `<li><span class="dish">${escapeHtml(dish.name)}</span></li>`,
        )
        .join("")}</ul>`
    : `<span class="empty">—</span>`

function menuPage({ menu, school, week }) {
  const status = STATUS[menu.status] || STATUS.PENDING_APPROVAL
  const days = menu.days || []
  const hasSnack = days.some((day) => day.snack?.length)
  const totalPortions = days.reduce((sum, day) => sum + (Number(day.portions) || 0), 0)
  const weekTitle = week.weekNumber ? `Tuần ${week.weekNumber}` : "Thực đơn tuần"
  const range = week.weekStartDate ? `${formatPdfDate(week.weekStartDate)} – ${formatPdfDate(week.weekEndDate)}` : ""
  const logo = school.logoUrl
    ? `<img class="logo" src="${escapeHtml(school.logoUrl)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'logo logo-fallback',textContent:'${escapeHtml(initials(school.name))}'}))" />`
    : `<div class="logo logo-fallback">${escapeHtml(initials(school.name))}</div>`
  const contact = [school.address, school.phone && `ĐT: ${school.phone}`, school.email].filter(Boolean)
  const dayCards = days
    .map((day) => {
      const label = pdfDayLabel(day.date)
      const weekday = day.shortLabel || label.weekday
      return `
      <article class="day">
        <div class="day-head">
          <div class="weekday">${escapeHtml(weekday)}</div>
          <div class="date">${escapeHtml(label.date)}</div>
        </div>
        <div class="meal-band meal-lunch">Bữa trưa</div>
        <div class="meal-body">${dishList(day.lunch)}</div>
        ${
          hasSnack
            ? `<div class="meal-band meal-snack">Bữa xế</div><div class="meal-body">${dishList(day.snack)}</div>`
            : ""
        }
      </article>`
    })
    .join("")

  return `
  <section class="page">
    <header class="head">
      <div class="school">
        ${logo}
        <div>
          <div class="school-name">${escapeHtml(school.name || "Trường học")}</div>
          ${contact.length ? `<div class="school-contact">${contact.map(escapeHtml).join(" · ")}</div>` : ""}
        </div>
      </div>
      <div class="title-block">
        <div class="eyebrow">Thực đơn bán trú</div>
        <h1>${escapeHtml(menu.title || `Thực đơn dinh dưỡng ${weekTitle.toLowerCase()}`)}</h1>
        <div class="range">${escapeHtml(weekTitle)}${range ? ` · ${escapeHtml(range)}` : ""}</div>
      </div>
      <div class="badge badge-${status.tone}">${status.label}</div>
    </header>

    <div class="info">
      <div><span>Áp dụng</span><strong>${escapeHtml(scopeLabel(menu))}</strong></div>
      <div><span>Thời gian phục vụ</span><strong>${escapeHtml(menu.summary?.servingPeriod || range)}</strong></div>
      <div><span>Người lập</span><strong>${escapeHtml(menu.summary?.proposer || "—")}</strong></div>
      <div><span>Tổng số suất</span><strong>${totalPortions.toLocaleString("vi-VN")} suất</strong></div>
    </div>

    <div class="days ${hasSnack ? "with-snack" : ""}" style="grid-template-columns: repeat(${Math.max(days.length, 1)}, 1fr)">${dayCards}</div>

    <footer class="signs">
      <div>
        <div class="sign-date">&nbsp;</div>
        <div class="sign-role">Người lập thực đơn</div>
        <div class="sign-hint">(Ký, ghi rõ họ tên)</div>
        <div class="sign-name">${escapeHtml(menu.summary?.proposer || "")}</div>
      </div>
      <div>
        <div class="sign-date">${
          menu.approval?.reviewedAt ? `Ngày ${escapeHtml(formatPdfDate(menu.approval.reviewedAt))}` : "&nbsp;"
        }</div>
        <div class="sign-role">Ban Giám hiệu phê duyệt</div>
        <div class="sign-hint">(Ký, ghi rõ họ tên)</div>
        <div class="sign-name">${escapeHtml(menu.approval?.approver || "")}</div>
      </div>
    </footer>
  </section>`
}

// Lề giấy 0: trình duyệt không còn chỗ in đường dẫn, ngày giờ, tên file ở đầu / cuối trang
const PAGE_RULE = "@page { size: A4 landscape; margin: 0; }"

// Quy tắc viết như trang độc lập ("body", "*", ".page"...); khi in trong app được giới hạn trong
// khung .fp-menu-pdf để không ảnh hưởng giao diện app.
const RAW_STYLES = `
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; color: #0f172a; font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 11px; background: #fff; }
  .page { display: flex; flex-direction: column; gap: 10px; min-height: 209mm; padding: 10mm 12mm; page-break-after: always; break-after: page; }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .head { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 16px; padding: 12px 16px;
    border-radius: 12px; background: linear-gradient(120deg, #0f766e 0%, #14b8a6 100%); color: #fff; }
  .school { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .logo { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; background: #fff; border: 2px solid rgba(255,255,255,.85); flex-shrink: 0; }
  .logo-fallback { display: flex; align-items: center; justify-content: center; color: #0f766e; font-weight: 800; font-size: 18px; }
  .school-name { font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px; }
  .school-contact { margin-top: 2px; font-size: 10px; opacity: .9; }
  .title-block { text-align: right; }
  .eyebrow { font-size: 9.5px; letter-spacing: 1.6px; text-transform: uppercase; opacity: .85; }
  h1 { margin: 2px 0 0; padding: 0; color: #fff; font-family: inherit; font-size: 19px; line-height: 1.2; font-weight: 800; letter-spacing: normal; }
  .range { margin-top: 2px; font-size: 11px; font-weight: 600; opacity: .95; }
  .badge { padding: 5px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; background: #fff; white-space: nowrap; }
  .badge-approved { color: #15803d; }
  .badge-pending { color: #b45309; }
  .badge-revision { color: #b91c1c; }
  .info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .info > div { padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
  .info span { display: block; color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 2px; }
  .info strong { font-size: 11.5px; }
  /* Các thẻ ngày dùng chung hàng lưới (subgrid): dải bữa trưa / bữa xế thẳng hàng giữa các ngày,
     bữa xế nằm ngay dưới bữa trưa, thẻ kết thúc ngay sau món cuối (không kéo dài). */
  .days { display: grid; column-gap: 8px; grid-template-rows: auto auto auto; }
  .days.with-snack { grid-template-rows: auto auto auto auto auto; }
  .day { display: grid; grid-row: 1 / -1; grid-template-rows: subgrid; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fefce8; }
  .day-head { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; padding: 8px 10px 6px; background: transparent; }
  .weekday { font-size: 13px; font-weight: 800; color: #0f172a; }
  .date { font-size: 10px; color: #64748b; font-weight: 600; }
  .meal-band { padding: 4px 10px; font-size: 9.5px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; }
  .meal-lunch { background: #e8f5f1; color: #08604d; border-top: 1px solid #c9e8de; border-bottom: 1px solid #bce6cf; }
  .meal-snack { background: #f4eeea; color: #584b46; border-top: 1px solid #eae1db; border-bottom: 1px solid #ded3cd; }
  .meal-body { padding: 11px 10px 14px; }
  .dishes { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .dishes li { padding-left: 11px; position: relative; line-height: 1.45; }
  .dishes li::before { content: ""; position: absolute; left: 0; top: 7px; width: 5px; height: 5px; border-radius: 50%; background: #14b8a6; }
  .meal-snack + .meal-body .dishes li::before { background: #a8978f; }
  .dish { font-weight: 600; font-size: 11px; }
  .empty { color: #94a3b8; }
  .signs { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; text-align: center; padding-top: 6px; }
  .sign-date { color: #64748b; font-style: italic; font-size: 9.5px; margin-bottom: 3px; }
  .sign-role { font-weight: 800; text-transform: uppercase; font-size: 11px; }
  .sign-hint { color: #64748b; font-style: italic; font-size: 9.5px; margin-top: 2px; }
  .sign-name { margin-top: 38px; font-weight: 700; font-size: 11.5px; }
`

const SCOPE = ".fp-menu-pdf"

/** Giới hạn CSS trong khung in: "body" → khung, "*" → khung và mọi phần tử con, còn lại thêm tiền tố. */
export const scopeStyles = (css, scope = SCOPE) =>
  css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/([^{}]+)\{/g, (_, selectors) =>
    `${selectors
      .split(",")
      .map((selector) => {
        const item = selector.trim()
        if (item === "body") return scope
        if (item === "*") return `${scope}, ${scope} *`
        return `${scope} ${item}`
      })
      .join(", ")} {`,
  )

const STYLES = scopeStyles(RAW_STYLES)

/** Phần thân để in: các trang thực đơn trong khung .fp-menu-pdf. */
export function buildMenuPdfBody({ school = {}, week = {}, menus = [] }) {
  return `<div class="fp-menu-pdf">${menus.map((menu) => menuPage({ menu, school, week })).join("")}</div>`
}

/** Tài liệu HTML hoàn chỉnh (xem thử / kiểm thử). */
export function buildMenuPdfHtml({ school = {}, week = {}, menus = [] }) {
  const title = menuPdfTitle(week)
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>${PAGE_RULE}${STYLES}</style></head><body style="margin:0">${buildMenuPdfBody({ school, week, menus })}</body></html>`
}

/** Tên file PDF gợi ý: "Thuc-don-tuan-12_23-11-2026" */
export function menuPdfTitle(week = {}) {
  const [year, month, day] = dateParts(week.weekStartDate)
  const date = year ? `_${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}` : ""
  return `Thuc-don-tuan${week.weekNumber ? `-${week.weekNumber}` : ""}${date}`
}

/**
 * In thực đơn ngay trên trang app (không dùng iframe): khi in chỉ hiện khung thực đơn, ẩn giao diện app,
 * lề giấy 0 để trình duyệt không in ngày giờ / tên file / đường dẫn. Tên tài liệu dùng làm tên file PDF.
 * Chờ ảnh logo tải tối đa 3 giây.
 */
export function printMenuPdf({ school = {}, week = {}, menus = [] }) {
  const root = document.createElement("div")
  root.className = "fp-menu-pdf-root"
  root.setAttribute("aria-hidden", "true")
  root.innerHTML = buildMenuPdfBody({ school, week, menus })
  const style = document.createElement("style")
  style.textContent = `
    ${PAGE_RULE}
    @media screen { .fp-menu-pdf-root { display: none !important; } }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; background: #fff !important; }
      body > *:not(.fp-menu-pdf-root) { display: none !important; }
      .fp-menu-pdf-root { display: block !important; }
    }
    ${STYLES}`
  document.head.appendChild(style)
  document.body.appendChild(root)
  const previousTitle = document.title
  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    document.title = previousTitle
    root.remove()
    style.remove()
  }
  const images = [...root.querySelectorAll("img")].filter((image) => !image.complete)
  const ready = Promise.race([
    Promise.all(images.map((image) => new Promise((resolve) => { image.onload = image.onerror = resolve }))),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ])
  return ready.then(() => {
    document.title = menuPdfTitle(week)
    window.addEventListener("afterprint", cleanup, { once: true })
    window.print()
    // Trình duyệt không phát afterprint (hoặc print() không chặn): dọn sau một lúc
    setTimeout(cleanup, 1000)
  })
}
