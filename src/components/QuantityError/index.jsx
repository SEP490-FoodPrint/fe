import { quantityError } from "src/utils/measurementUnits";
import styles from "./QuantityError.module.scss";

/** Lỗi nhập số lượng (trống, không dương, quá 3 chữ số thập phân); không có gì để báo thì không hiện. */
export default function QuantityError({ value, validate = true }) {
  const error = validate ? quantityError(value) : "";
  if (!error) return null;
  return (
    <span className={styles.error} role="alert">
      {error}
    </span>
  );
}
