/**
 * Helper tính toán thời gian và trạng thái lưu mẫu 24 giờ của Bộ Y Tế
 */

export function get24hRetainedStatus(sampledAt, status) {
  if (status === "DISPOSED") {
    return {
      statusType: "DISPOSED",
      label: "Đã tiêu hủy",
      badgeClass: "badgeDisposed",
      isReadyToDispose: false,
      isDisposed: true,
      timeText: "Đã tiêu hủy",
      remainingHours: 0,
      remainingMinutes: 0,
      percent: 100,
    };
  }

  const sampledTime = new Date(sampledAt).getTime();
  const expiresTime = sampledTime + 24 * 60 * 60 * 1000;
  const currentTime = Date.now();
  const diffMs = expiresTime - currentTime;

  if (diffMs <= 0) {
    return {
      statusType: "READY_TO_DISPOSE",
      label: "Đã đủ 24 giờ",
      badgeClass: "badgeReady",
      isReadyToDispose: true,
      isDisposed: false,
      timeText: "Đã lưu 24h00",
      remainingHours: 0,
      remainingMinutes: 0,
      percent: 100,
    };
  }

  const remainingHours = Math.floor(diffMs / (60 * 60 * 1000));
  const remainingMinutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
  const elapsedMs = 24 * 60 * 60 * 1000 - diffMs;
  const percent = Math.min(100, Math.max(0, Math.round((elapsedMs / (24 * 60 * 60 * 1000)) * 100)));

  return {
    statusType: "STORED",
    label: "Đang lưu mẫu",
    badgeClass: "badgeStored",
    isReadyToDispose: false,
    isDisposed: false,
    timeText: `Còn ${String(remainingHours).padStart(2, "0")}h ${String(remainingMinutes).padStart(2, "0")}m`,
    remainingHours,
    remainingMinutes,
    percent,
  };
}

export function formatSampleDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return {
    full: `${timeStr} · ${dateStr}`,
    date: dateStr,
    time: timeStr,
  };
}
