import React, { useEffect, useState } from "react";
import { Alert, Button, LinearProgress } from "@mui/material";
import MealAllocationService from "src/services/MealAllocationService";
import { formatAllocationDecimal as amount } from "src/utils/allocationDecimal";
import notice from "src/components/Notice";
import styles from "./MaterialAllocationPlan.module.scss";

export default function MaterialAllocationPlan({
  mealType,
  plan,
  error: planError,
  onApplied,
  onBusy,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
  }, [mealType, plan?.planId]);
  async function apply() {
    if (!plan || busy) return;
    setBusy(true);
    onBusy(true);
    setError("");
    try {
      await MealAllocationService.apply({
        mealType,
        priorityClassIds: [],
        revision: plan.revision,
        planId: plan.planId,
      });
      notice({ msg: "Đã áp dụng phân bổ theo nguyên liệu", isSuccess: true });
      onApplied();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  const groups = new Map();
  for (const entry of plan?.entries || []) {
    const key = `${entry.gradeId}:${entry.dishId}`;
    if (!groups.has(key))
      groups.set(key, {
        name: `${entry.gradeName} · ${entry.dishName}`,
        entries: [],
      });
    groups.get(key).entries.push(entry);
  }
  return (
    <section className={styles.root} aria-busy={busy}>
      {busy && <LinearProgress />}
      {(error || planError) && (
        <Alert severity="warning">{error || planError}</Alert>
      )}
      {plan && (
        <>
          {!plan.optimal && (
            <Alert severity="info">
              Phương án đáp ứng nhu cầu. Chưa chứng minh được mức tối ưu trong
              thời gian tính.
            </Alert>
          )}
          {[...groups.entries()].map(([key, group]) => (
            <details key={key} open className={styles.group}>
              <summary>{group.name}</summary>
              {plan.groups
                .filter(
                  (summary) => `${summary.gradeId}:${summary.dishId}` === key,
                )
                .map((summary) => (
                  <div key={key}>
                    <p>
                      {amount(summary.allocatedPortions)} /{" "}
                      {amount(summary.requiredPortions)} suất
                      {summary.requiredMassKg !== "0.000000000" && (
                        <>
                          {" "}
                          · {amount(summary.allocatedMassKg, 3)} /{" "}
                          {amount(summary.requiredMassKg, 3)} kg nguyên liệu
                        </>
                      )}
                    </p>
                    {summary.availability.map((slot) => (
                      <p key={slot.batchId}>
                        Lô {slot.batchNumber ?? "—"} · còn{" "}
                        {amount(slot.availablePortions)} suất quy đổi cho khối
                        sau phương án
                      </p>
                    ))}
                  </div>
                ))}
              {group.entries.map((entry) => (
                <div
                  key={`${entry.demandId}:${entry.batchId}`}
                  className={styles.row}
                >
                  <span>
                    {entry.className} · Lô {entry.batchNumber ?? "—"}
                  </span>
                  <strong>{amount(entry.allocatedPortions)} suất</strong>
                  {entry.materials.some(
                    (material) => material.unit === "g",
                  ) && (
                    <span>
                      {amount(entry.massKg, 3)} kg nguyên liệu quy đổi
                    </span>
                  )}
                  <details>
                    <summary>Nguyên liệu cấp</summary>
                    {entry.materials.map((material) => (
                      <p key={material.ingredientLotId}>
                        {material.ingredientName} ·{" "}
                        {amount(material.quantity, 3)} {material.unit}
                      </p>
                    ))}
                  </details>
                </div>
              ))}
            </details>
          ))}
          <details className={styles.group}>
            <summary>Tổng theo lớp và món</summary>
            {plan.totals.map((total) => (
              <p key={`${total.demandId}:${total.dishId}`}>
                {total.className} · {amount(total.allocatedPortions)} /{" "}
                {amount(total.requiredPortions)} suất
              </p>
            ))}
          </details>
          <Button variant="contained" disabled={busy} onClick={apply}>
            Áp dụng phương án
          </Button>
        </>
      )}
    </section>
  );
}
