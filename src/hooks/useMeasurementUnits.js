import { useCallback, useEffect, useState } from "react";
import service from "src/services/MeasurementUnitService";
import {
  findMeasurementUnit,
  unitStepWarning,
} from "src/utils/measurementUnits";
export default function useMeasurementUnits() {
  const [units, setUnits] = useState([]),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    service
      .all(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setUnits(result);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            "Chưa tải được danh mục đơn vị; chưa thể kiểm tra bước khuyến nghị. Bạn vẫn có thể nhập và gửi yêu cầu.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [version]);
  const retry = useCallback(() => setVersion((v) => v + 1), []);
  return {
    units,
    error,
    loading,
    retry,
    warning: (value, unit) =>
      unitStepWarning(value, findMeasurementUnit(units, unit)),
  };
}
