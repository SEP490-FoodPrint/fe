import React, { useEffect, useId, useMemo, useState } from "react";
import styles from "./MenuScopeSelect.module.scss";
import { hasMenuScope } from "src/services/MenuService/scope";

export function menuGradeOptions(menus = [], grades = []) {
  menus = menus.filter(hasMenuScope);
  if (grades.length) return grades.map((grade) => ({ key: grade.id, label: grade.name, menuId: menus.find((menu) => menu.gradeIds?.includes(grade.id))?.id || menus.find((menu) => menu.isSchoolWide === true)?.id || "" }));
  const options = new Map();
  for (const menu of menus) {
    const ids = menu.gradeIds || [];
    const names = menu.gradeNames || [];
    if (!ids.length) {
      options.set(`school:${menu.id}`, { key: `school:${menu.id}`, label: "Toàn trường", menuId: menu.id });
      continue;
    }
    ids.forEach((id, index) => {
      if (!options.has(id)) options.set(id, { key: id, label: names[index] || names.join(", ") || "Khối lớp", menuId: menu.id });
    });
  }
  return [...options.values()];
}

/**
 * Khi mọi khối dùng chung một thực đơn (thực đơn toàn trường hoặc phủ hết các khối) thì không cần
 * chọn khối: trả về thực đơn đó với nhãn "Toàn trường". Có từ hai thực đơn trở lên, hoặc còn khối
 * chưa có thực đơn, thì trả null để vẫn cho chọn khối.
 */
export function sharedMenuScope(menus = [], grades = []) {
  const scoped = menus.filter(hasMenuScope);
  if (scoped.length !== 1) return null;
  const [menu] = scoped;
  const ids = menu.gradeIds || [];
  const coversAll = menu.isSchoolWide === true || (grades.length > 0 && grades.every((grade) => ids.includes(grade.id)));
  return coversAll ? { menuId: menu.id, label: "Toàn trường" } : null;
}

export default function MenuScopeSelect({ menus = [], grades = [], gradeValue, value = "", onChange, disabled = false, className = "" }) {
  const id = useId();
  const [chosenGrade, setChosenGrade] = useState("");
  const options = useMemo(() => menuGradeOptions(menus, grades), [menus, grades]);
  const shared = useMemo(() => sharedMenuScope(menus, grades), [menus, grades]);
  const selected = gradeValue !== undefined && gradeValue ? options.find((item) => item.key === gradeValue) : options.find((item) => item.key === chosenGrade && item.menuId === value)
    || (value ? options.find((item) => item.menuId === value) : null)
    || (menus.length === 1 ? options.find((item) => item.menuId === menus[0].id) : null);
  useEffect(() => {
    if (chosenGrade && options.length && !options.some((item) => item.key === chosenGrade && item.menuId === value)) setChosenGrade("");
  }, [chosenGrade, options, value]);
  // Thực đơn các khối giống nhau: số suất tính cho toàn trường, ô lọc cố định, không cho chọn khối.
  useEffect(() => {
    if (shared && value && value !== shared.menuId) onChange?.(shared.menuId, "");
  }, [shared, value, onChange]);
  if (shared) return <div className={`${styles.gradeFilter} ${className}`}>
    <label className={styles.srOnly} htmlFor={id}>Lọc theo khối lớp</label>
    <select id={id} className={styles.select} aria-label="Lọc theo khối lớp" value="shared" disabled title="Các khối dùng chung một thực đơn" onChange={() => {}}>
      <option value="shared">{shared.label}</option>
    </select>
  </div>;
  if (!options.length) return null;
  return <div className={`${styles.gradeFilter} ${className}`}>
    <label className={styles.srOnly} htmlFor={id}>Lọc theo khối lớp</label>
    <select id={id} className={styles.select} aria-label="Lọc theo khối lớp" value={selected?.key || ""} disabled={disabled} onChange={(event) => {
      const option = options.find((item) => item.key === event.target.value);
      setChosenGrade(option?.key || "");
      onChange(option?.menuId || "", option?.key || "");
    }}>
      <option value="">Chọn khối</option>
      {options.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
    </select>
  </div>;
}
