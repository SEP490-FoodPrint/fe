import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { AlertTriangle, PackagePlus } from "lucide-react"
import WarehouseService from "src/services/WarehouseService"
import styles from "./StockAlertPanel.module.scss"

const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]

/** "2026-11-24" → "Thứ Ba 24/11" (không phụ thuộc múi giờ trình duyệt). */
export const formatAlertDate = iso => {
  const [year, month, day] = String(iso).split("-").map(Number)
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return `${weekday} ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`
}

/** Làm tròn lên 1 chữ số thập phân để không đặt thiếu. */
export const roundUpQuantity = value => Math.ceil(Number(value) * 10 - 1e-9) / 10

const fmt = value => Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 3 })

/**
 * Cảnh báo đồ lưu kho cần nhập thêm cho các thực đơn đã duyệt (Ban quản lý nguyên liệu).
 * - levels: mức hiển thị (URGENT = thiếu từ hôm nay/ngày mai, UPCOMING = các ngày sau).
 * - onCreateOrder(items): hiện nút "Lập phiếu nhập" với các dòng đang thiếu.
 */
export function StockAlertList({ items, levels = ["URGENT", "UPCOMING"], onCreateOrder }) {
  const visible = items.filter(item => levels.includes(item.level))
  if (!visible.length) return null
  const urgent = visible.some(item => item.level === "URGENT")
  return (
    <section className={`${styles.panel} ${urgent ? styles.panelUrgent : styles.panelUpcoming}`} aria-label="Cảnh báo đồ lưu kho">
      <div className={styles.head}>
        <AlertTriangle size={18} aria-hidden="true" />
        <strong>
          {urgent ? "Đồ lưu kho sắp thiếu, cần nhập gấp" : "Đồ lưu kho cần nhập thêm cho thực đơn đã duyệt"}
        </strong>
        {onCreateOrder && (
          <button type="button" className={styles.action} onClick={() => onCreateOrder(visible)}>
            <PackagePlus size={16} aria-hidden="true" />
            <span>Lập phiếu nhập</span>
          </button>
        )}
      </div>
      <ul className={styles.list}>
        {visible.map(item => (
          <li key={item.ingredientId} className={item.level === "URGENT" ? styles.urgent : styles.upcoming} role={item.level === "URGENT" ? "alert" : undefined}>
            <span className={styles.name}>{item.name}</span>: cần nhập thêm{" "}
            <strong>{fmt(roundUpQuantity(item.shortage))} {item.unit}</strong> trước {formatAlertDate(item.firstShortDate)}
            <span className={styles.meta}>
              {" "}(cần {fmt(item.required)} {item.unit}, kho còn {fmt(item.onHand)} {item.unit}, đã đặt {fmt(item.pending)} {item.unit})
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

StockAlertList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  levels: PropTypes.arrayOf(PropTypes.string),
  onCreateOrder: PropTypes.func,
}

/** Tự tải cảnh báo mỗi lần mở màn (cảnh báo tự hết khi đã nhập / đặt đủ). */
export default function StockAlertPanel({ levels, onCreateOrder, reloadKey }) {
  const [items, setItems] = useState([])
  useEffect(() => {
    const controller = new AbortController()
    WarehouseService.getStockAlerts({ signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setItems(data.items) })
      .catch(() => { if (!controller.signal.aborted) setItems([]) })
    return () => controller.abort()
  }, [reloadKey])
  return <StockAlertList items={items} levels={levels} onCreateOrder={onCreateOrder} />
}

StockAlertPanel.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.string),
  onCreateOrder: PropTypes.func,
  reloadKey: PropTypes.any,
}
