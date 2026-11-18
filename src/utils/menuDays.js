// Ngày hôm nay theo giờ Việt Nam (UTC+7), dạng YYYY-MM-DD.
export const vietnamTodayISO = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

// BE không cho lập mới hoặc đổi món của ngày đã qua (menu-week.ts: assertMenuDaysEditable).
export const isPastMenuDay = dateISO => Boolean(dateISO) && dateISO < vietnamTodayISO()
