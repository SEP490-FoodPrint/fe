import {
  findMeasurementUnit,
  unitStepWarning,
  quantityError,
} from "src/utils/measurementUnits";
import styles from "./QuantityRecommendation.module.scss";
export default function QuantityRecommendation({
  value,
  unit,
  units = [],
  validate = false,
}) {
  const error = validate ? quantityError(value) : "";
  const warning = unitStepWarning(value, findMeasurementUnit(units, unit));
  if (!error && !warning) return null;
  return (
    <span
      className={error ? styles.error : styles.warning}
      role={error ? "alert" : "status"}
    >
      {error || warning}
    </span>
  );
}
