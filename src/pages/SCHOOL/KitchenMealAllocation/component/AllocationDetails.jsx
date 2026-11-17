import React, { useState } from "react";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import { BarChart3, CheckCircle2, ChevronDown, GraduationCap, Info } from "lucide-react";
import ClassAllocationDetailModal from "./ClassAllocationDetailModal";
import styles from "./AllocationDetails.module.scss";

const mealLabels = { LUNCH: "Bữa trưa", AFTERNOON: "Bữa chiều" };
const mealTypes = Object.keys(mealLabels);

function AllocationRow({ title, summary, icon, badge, expanded, onChange, children }) {
  return (
    <Accordion disableGutters elevation={0} className={styles.row} expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ChevronDown size={16} />}>
        {icon && <span className={styles.rowIcon}>{icon}</span>}
        <span className={styles.rowCopy}>
          <span className={styles.rowHeading}>
            <strong>{title}</strong>
            {summary && <span className={styles.summary}>{summary}</span>}
          </span>
        </span>
        {badge}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

export default function AllocationDetails({ data, dirty, saving, onDiscard, onConfirm }) {
  const [meal, setMeal] = useState("ALL");
  const [groupBy, setGroupBy] = useState("batch");
  const [expandedBatches, setExpandedBatches] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);

  const { distribution, grades } = data || {};
  const visibleMeals = meal === "ALL" ? mealTypes : [meal];
  const visibleDemands = (distribution?.demands || []).filter((demand) => visibleMeals.includes(demand.mealType));

  const batchesById = new Map(
    (data?.batches || []).map((batch, index) => [
      batch.id,
      {
        ...batch,
        name:
          batch.batchNumber != null
            ? `Lô ${batch.batchNumber}`
            : batch.name || `Lô chế biến ${index + 1}`,
        recipients: [],
      },
    ]),
  );

  const classesById = new Map();
  for (const demand of visibleDemands) {
    const meals = classesById.get(demand.classId) ?? [];
    meals.push(demand);
    classesById.set(demand.classId, meals);
    for (const entry of (demand.batches || [])) {
      batchesById.get(entry.batchId)?.recipients?.push({ ...entry, demand });
    }
  }

  const visibleBatches = [...batchesById.values()].filter((batch) => visibleMeals.includes(batch.mealType));
  const incomplete = (distribution?.demands || []).filter(
    (demand) =>
      demand.requiredPortions > 0 &&
      (!demand.demandFinalized || (demand.allocatedPortions || 0) < demand.requiredPortions),
  );
  const delivered = distribution?.status === "DISTRIBUTED";
  const allVisibleBatchKeys = grades && Array.isArray(grades) && grades.length > 0
    ? grades.flatMap((g) =>
        (g.dishes || [])
          .filter((d) => visibleMeals.includes(d.mealType))
          .flatMap((d) => (d.batches || []).map((b) => `${d.dishId}_${b.cookingBatchId}`)),
      )
    : visibleBatches.map((b) => b.id);

  const allVisibleExpanded =
    allVisibleBatchKeys.length > 0 && allVisibleBatchKeys.every((k) => expandedBatches.has(k));

  function toggleAllVisibleExpansion() {
    setExpandedBatches((current) => {
      const next = new Set(current);
      for (const k of allVisibleBatchKeys) {
        if (allVisibleExpanded) next.delete(k);
        else next.add(k);
      }
      return next;
    });
  }

  function getClassDishesDetail(demand) {
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return (demand.batches || []).map((b) => ({
        dishName: "Món ăn trong bữa",
        allocatedPortions: b.allocatedPortions,
        batches: [
          {
            batchCode:
              b.batchNumber != null
                ? `Lô ${b.batchNumber}`
                : batchesById.get(b.batchId)?.name || "Lô chế biến",
            allocatedPortions: b.allocatedPortions,
          },
        ],
      }));
    }

    // Xác định khối chứa lớp hiện tại
    const myGrade = grades.find((g) =>
      (g.demands || []).some((d) => (d.id || d.dailyMealPortionId) === demand.id),
    );

    const targetDishes = myGrade
      ? (myGrade.dishes || []).filter((dish) => dish.mealType === demand.mealType)
      : grades.flatMap((g) => g.dishes || []).filter((dish) => dish.mealType === demand.mealType);

    const result = [];
    for (const dish of targetDishes) {
      const matchingBatches = [];
      let totalDishAllocated = 0;

      for (const batchSlot of dish.batches || []) {
        const entry = (batchSlot.entries || []).find(
          (e) => (e.dailyMealPortionId || e.id) === demand.id,
        );
        if (entry && (entry.allocatedPortions || entry.portions) > 0) {
          const count = entry.allocatedPortions || entry.portions;
          totalDishAllocated += count;
          matchingBatches.push({
            batchCode:
              batchSlot.batchNumber != null
                ? `Lô ${batchSlot.batchNumber}`
                : batchSlot.batchCode || "Lô chế biến",
            allocatedPortions: count,
          });
        }
      }

      // Luôn trả về tất cả các món ăn trong thực đơn của khối (kể cả món chưa phân lô)
      result.push({
        dishId: dish.dishId,
        dishName: dish.dishName,
        allocatedPortions: totalDishAllocated,
        batches: matchingBatches,
      });
    }
    return result;
  }

  return (
    <div className={styles.details}>
      <div className={styles.toolbar}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={meal}
          aria-label="Lọc theo bữa ăn"
          onChange={(_, value) => value && setMeal(value)}
        >
          <ToggleButton value="ALL">Tất cả bữa</ToggleButton>
          {mealTypes.map((type) => (
            <ToggleButton key={type} value={type}>
              {mealLabels[type]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div className={styles.viewSwitch}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={groupBy}
            aria-label="Cách xem phân bổ"
            onChange={(_, value) => value && setGroupBy(value)}
          >
            <ToggleButton value="batch">
              <BarChart3 size={15} /> Theo lô
            </ToggleButton>
            <ToggleButton value="class">
              <GraduationCap size={15} /> Theo lớp
            </ToggleButton>
          </ToggleButtonGroup>

          {groupBy === "batch" && (
            <Button
              variant="outlined"
              size="small"
              disabled={!allVisibleBatchKeys.length}
              onClick={toggleAllVisibleExpansion}
            >
              {allVisibleExpanded ? "Thu gọn tất cả" : "Mở tất cả"}
            </Button>
          )}
        </div>
      </div>

      {groupBy === "batch" && (
        <>
          {grades && Array.isArray(grades) && grades.length > 0 ? (
            grades.map((grade) => (
              <section key={grade.gradeId} className={styles.group}>
                <div className={styles.groupHeading}>
                  <h2>
                    <span aria-hidden="true" />
                    {grade.gradeName}
                  </h2>
                  <span className={styles.badge}>
                    {grade.demands?.length || 0} lớp ·{" "}
                    <strong>
                      {(grade.demands || []).reduce((sum, d) => sum + (d.totalPortions || 0), 0)} suất
                    </strong>
                  </span>
                </div>

                {(grade.dishes || [])
                  .filter((dish) => visibleMeals.includes(dish.mealType))
                  .map((dish) => (
                    <div key={dish.dishId} style={{ display: "grid", gap: "var(--space-2)" }}>
                      <p className={styles.kicker} style={{ marginTop: "var(--space-1)" }}>
                        Món: {dish.dishName} ({mealLabels[dish.mealType]}) — {dish.totalRequiredPortions} suất
                      </p>

                      {(dish.batches || []).map((batchSlot) => {
                        const entries = batchSlot.entries || [];
                        const allocated = entries.reduce(
                          (sum, e) => sum + (e.allocatedPortions || e.portions || 0),
                          0,
                        );
                        const isFull = batchSlot.plannedPortions > 0 && allocated >= batchSlot.plannedPortions;

                        const batchRowKey = `${dish.dishId}_${batchSlot.cookingBatchId}`;
                        return (
                          <AllocationRow
                            key={batchRowKey}
                            title={
                              batchSlot.batchNumber != null
                                ? `Lô ${batchSlot.batchNumber}`
                                : batchSlot.batchCode || `Lô chế biến`
                            }
                            expanded={expandedBatches.has(batchRowKey)}
                            onChange={(_, expanded) => {
                              setExpandedBatches((prev) => {
                                const next = new Set(prev);
                                if (expanded) next.add(batchRowKey);
                                else next.delete(batchRowKey);
                                return next;
                              });
                            }}
                            summary={`${allocated}/${batchSlot.plannedPortions} suất`}
                            badge={
                              <span className={styles.badge} data-complete={isFull}>
                                {isFull ? "Đã phân hết" : "Chưa phân hết"}
                              </span>
                            }
                          >
                            {entries.length ? (
                              <>
                                <p className={styles.kicker}>Các lớp tiếp nhận ({entries.length})</p>
                                <ul className={styles.tiles}>
                                  {entries.map((entry) => (
                                    <li key={entry.dailyMealPortionId || entry.id}>
                                      <strong>{entry.className || entry.name}</strong>
                                      <span className={styles.tileCount}>
                                        {entry.allocatedPortions || entry.portions} suất
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              "Chưa phân bổ cho lớp nào."
                            )}
                          </AllocationRow>
                        );
                      })}
                    </div>
                  ))}
              </section>
            ))
          ) : (
            visibleMeals.map((type) => {
              const batches = visibleBatches.filter((batch) => batch.mealType === type);
              if (!batches.length) return null;
              const required = visibleDemands
                .filter((demand) => demand.mealType === type)
                .reduce((sum, demand) => sum + demand.requiredPortions, 0);

              return (
                <section key={type} className={styles.group} data-tone={type}>
                  <div className={styles.groupHeading}>
                    <h2>
                      <span aria-hidden="true" />
                      {mealLabels[type]}
                    </h2>
                    <span className={styles.badge}>
                      Nhu cầu <strong>{required} suất</strong>
                    </span>
                  </div>
                  {batches.map((batch) => {
                    const allocated = batch.recipients.reduce((sum, entry) => sum + entry.allocatedPortions, 0);
                    const fullyAllocated = batch.plannedPortions > 0 && allocated === batch.plannedPortions;

                    return (
                      <AllocationRow
                        key={batch.id}
                        title={batch.name}
                        expanded={expandedBatches.has(batch.id)}
                        onChange={(_, expanded) => setBatchExpansion([batch], expanded)}
                        summary={batch.plannedPortions == null ? "Chưa có tổng suất" : `${batch.plannedPortions} suất`}
                        badge={
                          <span className={styles.badge} data-complete={fullyAllocated}>
                            {fullyAllocated ? "Đã phân hết" : "Chưa phân hết"}
                          </span>
                        }
                      >
                        {batch.recipients.length ? (
                          <>
                            <p className={styles.kicker}>Lớp tiếp nhận ({batch.recipients.length})</p>
                            <ul className={styles.tiles}>
                              {batch.recipients.map(({ demand, allocatedPortions }) => (
                                <li key={demand.id}>
                                  <strong>{demand.className}</strong>
                                  <span className={styles.tileCount}>{allocatedPortions} suất</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          "Chưa phân bổ cho lớp nào."
                        )}
                      </AllocationRow>
                    );
                  })}
                </section>
              );
            })
          )}
        </>
      )}

      {/* VIEW THEO LỚP: Dạng BẢNG (Table/Grid) */}
      {groupBy === "class" && (
        <div className={styles.classTableWrapper}>
          <table className={styles.classTable}>
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Lớp học</th>
                <th style={{ width: "20%" }}>Nhu cầu suất ăn</th>
                <th style={{ width: "55%" }}>Lô món ăn tiếp nhận (nhấp để xem chi tiết)</th>
              </tr>
            </thead>
            <tbody>
              {visibleDemands.map((demand) => {
                const dishesDetail = getClassDishesDetail(demand);
                const summaryString = dishesDetail
                  .filter((d) => d.batches && d.batches.length > 0)
                  .map(
                    (d) =>
                      `${d.dishName}: ${d.batches.map((b) => `${b.batchCode} (${b.allocatedPortions})`).join(", ")}`,
                  )
                  .join(" · ");

                // Suất ăn hoàn chỉnh của lớp là số suất nhận được tối thiểu qua tất cả các món trong bữa
                const classAllocatedPortions = dishesDetail.length > 0
                  ? Math.min(...dishesDetail.map((d) => d.allocatedPortions))
                  : (demand.allocatedPortions ?? 0);
                const isFullPortions = classAllocatedPortions >= demand.requiredPortions;

                return (
                  <tr key={demand.id}>
                    <td>
                      <strong>{demand.className}</strong>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        {mealLabels[demand.mealType]}
                      </div>
                    </td>
                    <td>
                      <b style={{ color: isFullPortions ? "var(--color-success, #16a34a)" : "var(--color-warning, #d97706)" }}>
                        {classAllocatedPortions}
                      </b> / {demand.requiredPortions} suất
                    </td>
                    <td className={styles.batchSummaryCell}>
                      {summaryString ? (
                        <span
                          className={styles.batchSummaryText}
                          title="Nhấp vào để xem chi tiết các món ăn từ từng lô"
                          onClick={() =>
                            setSelectedClassDetail({
                              className: demand.className,
                              totalPortions: demand.requiredPortions,
                              mealLabel: mealLabels[demand.mealType],
                              dishes: dishesDetail,
                            })
                          }
                        >
                          <strong>{summaryString}</strong>
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                          Chưa phân bổ lô nào
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(groupBy === "batch" ? !visibleBatches.length : !visibleDemands.length) && (
        <Alert severity="info">Chưa có dữ liệu phân bổ cho lựa chọn này.</Alert>
      )}

      {incomplete.length > 0 && (
        <Alert severity="warning">
          Còn {incomplete.length} lớp chưa chốt hoặc chưa được phân bổ đủ suất ăn.
        </Alert>
      )}

      {dirty && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={onDiscard}>
              Bỏ thay đổi
            </Button>
          }
        >
          Bạn có thay đổi phân bổ chưa được áp dụng ở tab &quot;Phân bổ suất ăn&quot;.
        </Alert>
      )}

      <div className={styles.footer}>
        <div className={styles.footerNote}>
          <CheckCircle2 size={16} />
          <span>
            {delivered
              ? "Suất ăn hôm nay đã được xác nhận bàn giao."
              : distribution?.canConfirmDistribution
              ? "Đã sẵn sàng xác nhận giao suất ăn trong ngày."
              : "Hoàn tất phân bổ đủ suất trước khi xác nhận giao."}
          </span>
        </div>

        <Button
          variant="contained"
          disabled={!distribution?.canConfirmDistribution || saving || dirty}
          onClick={() => setConfirmOpen(true)}
        >
          {delivered ? "Đã giao suất ăn" : "Xác nhận giao suất ăn"}
        </Button>
      </div>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận giao suất ăn</DialogTitle>
        <DialogContent>
          <p>
            Bạn có chắc chắn muốn xác nhận bàn giao toàn bộ suất ăn trong ngày {data?.date || "hôm nay"}?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmOpen(false);
              onConfirm?.();
            }}
          >
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>

      <ClassAllocationDetailModal
        open={Boolean(selectedClassDetail)}
        onClose={() => setSelectedClassDetail(null)}
        classData={selectedClassDetail}
      />
    </div>
  );
}
