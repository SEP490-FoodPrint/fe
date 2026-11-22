import { useCallback, useEffect, useState } from "react";
import service from "src/services/MeasurementUnitService";
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
            "Chưa tải được danh mục đơn vị. Vui lòng thử lại.",
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
  };
}
