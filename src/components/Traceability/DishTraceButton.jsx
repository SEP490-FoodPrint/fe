import React from "react";
import PropTypes from "prop-types";
import logo from "src/assets/images/logo.png";
import styles from "./DishTraceButton.module.scss";

/**
 * Nút logo FoodPrint cạnh tên món: mở trang truy xuất chung theo khối,
 * chọn sẵn món này.
 */
function DishTraceButton({ dishName, onClick, disabled, size }) {
  const label = disabled
    ? "Chọn khối để truy xuất nguồn gốc món"
    : `Truy xuất nguồn gốc món ${dishName || ""}`.trim();
  return (
    <button
      type="button"
      className={`${styles.traceBtn} ${size === "sm" ? styles.sm : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onClick) onClick();
      }}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <img src={logo} alt="" className={styles.logo} width={20} height={20} />
    </button>
  );
}

DishTraceButton.propTypes = {
  dishName: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md"]),
};

DishTraceButton.defaultProps = {
  dishName: "",
  onClick: undefined,
  disabled: false,
  size: "md",
};

export default DishTraceButton;
