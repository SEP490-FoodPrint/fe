export function getWeekLabel(week) {
  const title = week.title?.trim().replace(/^Thực đơn(?:\s+|$)/i, "");
  return title?.replace(/^tuần(?=\s|$)/i, "Tuần") || `Tuần ${week.weekNumber}`;
}

export function formatWeekRange(weekRange) {
  return weekRange.replace(/\s*[–—]\s*/g, " - ");
}

export function getAvailableWeeks(weeklyMenu) {
  const weeks = weeklyMenu?.availableWeeks || weeklyMenu?.available_weeks;
  if (!Array.isArray(weeks)) return [];

  return [...weeks].sort((a, b) =>
    (a.weekStartDate || "").localeCompare(b.weekStartDate || ""),
  );
}

export function resolveWeekStartDate(weekValue, now = new Date()) {
  if (typeof weekValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(weekValue)) {
    return weekValue;
  }

  const offset = Number(weekValue) || 0;
  const target = new Date(now);
  if (offset !== 0) target.setDate(target.getDate() + offset * 7);
  return target.toISOString().slice(0, 10);
}

export function isDateInMenuWeek(dateIso, weekStartDate) {
  if (!weekStartDate || dateIso < weekStartDate) return false;

  const weekEnd = new Date(weekStartDate);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 4);
  return dateIso <= weekEnd.toISOString().slice(0, 10);
}
