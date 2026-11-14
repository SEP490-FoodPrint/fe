import React, { useId } from "react";

export default function MenuScopeSelect({
  menus = [],
  value = "",
  onChange,
  disabled = false,
}) {
  const id = useId();
  if (!menus.length) return null;
  return (
    <div style={{ padding: "12px 0" }}>
      <label htmlFor={id}>Thực đơn / khối áp dụng </label>
      <select
        id={id}
        value={value || (menus.length === 1 ? menus[0].id : "")}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        style={{ maxWidth: "100%", padding: 8, marginLeft: 8 }}
      >
        <option value="">Chọn thực đơn để xem</option>
        {menus.map((menu) => (
          <option key={menu.id} value={menu.id}>
            {menu.title || "Thực đơn"} ·{" "}
            {menu.gradeNames?.join(", ") || "Toàn trường"}
          </option>
        ))}
      </select>
    </div>
  );
}
