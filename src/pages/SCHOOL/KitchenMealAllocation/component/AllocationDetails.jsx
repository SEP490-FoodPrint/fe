import React, { useState } from "react";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import { BarChart3, CheckCircle2, ChevronDown, GraduationCap, Info } from "lucide-react";
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
  const { distribution } = data;
  const date = data.date.split("-").reverse().join("/");
  const total = distribution.meals.reduce((sum, item) => sum + item.allocatedPortions, 0);
  const visibleMeals = meal === "ALL" ? mealTypes : [meal];
  const visibleDemands = distribution.demands.filter((demand) => visibleMeals.includes(demand.mealType));
  const batchesById = new Map(data.batches.map((batch, index) => [
    batch.id, { ...batch, name: `Lô chế biến ${index + 1}`, recipients: [] },
  ]));
  const classesById = new Map();
  for (const demand of visibleDemands) {
    const meals = classesById.get(demand.classId) ?? [];
    meals.push(demand);
    classesById.set(demand.classId, meals);
    for (const entry of demand.batches) {
      batchesById.get(entry.batchId)?.recipients.push({ ...entry, demand });
    }
  }
  const visibleBatches = [...batchesById.values()].filter((batch) => visibleMeals.includes(batch.mealType));
  const incomplete = distribution.demands.filter((demand) =>
    demand.requiredPortions > 0 && (!demand.demandFinalized || demand.allocatedPortions < demand.requiredPortions),
  );
  const delivered = distribution.status === "DISTRIBUTED";
  const allVisibleExpanded = visibleBatches.length > 0 &&
    visibleBatches.every((batch) => expandedBatches.has(batch.id));

  function setBatchExpansion(batches, expanded) {
    setExpandedBatches((current) => {
      const next = new Set(current);
      for (const { id } of batches) {
        if (expanded) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  return (
    <div className={styles.details}>
      <div className={styles.toolbar}>
        <ToggleButtonGroup size="small" exclusive value={meal} aria-label="Lọc theo bữa ăn"
          onChange={(_, value) => value && setMeal(value)}>
          <ToggleButton value="ALL">Tất cả bữa</ToggleButton>
          {mealTypes.map((type) => <ToggleButton key={type} value={type}>{mealLabels[type]}</ToggleButton>)}
        </ToggleButtonGroup>
        <div className={styles.viewSwitch}>
          <ToggleButtonGroup size="small" exclusive value={groupBy} aria-label="Cách xem phân bổ"
            onChange={(_, value) => value && setGroupBy(value)}>
            <ToggleButton value="batch"><BarChart3 size={15} /> Theo lô</ToggleButton>
            <ToggleButton value="class"><GraduationCap size={15} /> Theo lớp</ToggleButton>
          </ToggleButtonGroup>
          {groupBy === "batch" && (
            <Button variant="outlined" size="small" disabled={!visibleBatches.length}
              onClick={() => setBatchExpansion(visibleBatches, !allVisibleExpanded)}>
              {allVisibleExpanded ? "Thu gọn tất cả danh sách" : "Mở tất cả danh sách"}
            </Button>
          )}
        </div>
      </div>

      {groupBy === "batch" && visibleMeals.map((type) => {
        const batches = visibleBatches.filter((batch) => batch.mealType === type);
        if (!batches.length) return null;
        const required = visibleDemands.filter((demand) => demand.mealType === type)
          .reduce((sum, demand) => sum + demand.requiredPortions, 0);
        return (
          <section key={type} className={styles.group} data-tone={type}>
            <div className={styles.groupHeading}>
              <h2><span aria-hidden="true" />{mealLabels[type]}</h2>
              <span className={styles.badge}>Nhu cầu <strong>{required} suất</strong></span>
            </div>
            {batches.map((batch) => {
              const allocated = batch.recipients.reduce((sum, entry) => sum + entry.allocatedPortions, 0);
              const fullyAllocated = batch.plannedPortions > 0 && allocated === batch.plannedPortions;
              return (
                <AllocationRow key={batch.id} title={batch.name}
                  expanded={expandedBatches.has(batch.id)}
                  onChange={(_, expanded) => setBatchExpansion([batch], expanded)}
                  summary={batch.plannedPortions == null ? "Chưa có tổng suất" : `${batch.plannedPortions} suất`}
                  badge={<span className={styles.badge} data-complete={fullyAllocated}>
                    {fullyAllocated ? "Đã phân hết" : "Chưa phân hết"}
                  </span>}>
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
                  ) : "Chưa phân bổ cho lớp nào."}
                </AllocationRow>
              );
            })}
          </section>
        );
      })}

      {groupBy === "class" && [...classesById].map(([classId, demands]) => (
        <AllocationRow key={classId} title={demands[0].className} icon={<GraduationCap size={19} />}
          summary={demands.map((item) =>
            `${mealLabels[item.mealType]} ${item.allocatedPortions}/${item.requiredPortions} suất`,
          ).join(" · ")}>
          {demands.map((demand) => (
            <div key={demand.id} className={styles.classMeal}>
              <strong>{mealLabels[demand.mealType]}</strong>
              {demand.batches.length ? (
                <ul className={styles.tiles}>
                  {demand.batches.map(({ batchId, allocatedPortions }) => (
                    <li key={batchId}>
                      <strong>{batchesById.get(batchId)?.name}</strong>
                      <span className={styles.tileCount}>{allocatedPortions} suất</span>
                    </li>
                  ))}
                </ul>
              ) : <span>Chưa nhận suất từ lô nào.</span>}
            </div>
          ))}
        </AllocationRow>
      ))}

      {(groupBy === "batch" ? !visibleBatches.length : !visibleDemands.length) && (
        <Alert severity="info">Chưa có dữ liệu phân bổ cho lựa chọn này.</Alert>
      )}
      {distribution.message && (
        <Alert severity="info">
          {distribution.message}
          {!!incomplete.length && (
            <ul className={styles.incomplete}>
              {incomplete.map((demand) => (
                <li key={demand.id}>
                  {demand.className} · {mealLabels[demand.mealType]} · {demand.demandFinalized
                    ? `thiếu ${demand.requiredPortions - demand.allocatedPortions} suất`
                    : "chưa chốt nhu cầu"}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}
      {dirty && (
        <Alert severity="warning" action={<Button color="inherit" onClick={onDiscard}>Bỏ bản nháp</Button>}>
          Quay lại tab Phân bổ suất ăn để lưu, hoặc bỏ bản nháp trước khi xác nhận.
        </Alert>
      )}
      <div className={styles.footer}>
        <span className={styles.footerNote}><Info size={17} />{delivered ? `Đã giao ${total} suất ngày ${date}.` : `Xác nhận áp dụng cho toàn bộ ${total} suất đã phân bổ trong ngày ${date}.`}</span>
        {!delivered && (
          <Button variant="contained" startIcon={<CheckCircle2 size={16} />}
            disabled={dirty || saving || !distribution.canConfirmDistribution} onClick={() => setConfirmOpen(true)}>
            Xác nhận đã giao
          </Button>
        )}
      </div>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="confirm-distribution-title">
        <DialogTitle id="confirm-distribution-title">Xác nhận giao suất ăn ngày {date}</DialogTitle>
        <DialogContent>
          <p>Ghi nhận đã giao toàn bộ <strong>{total} suất</strong> trong ngày.</p>
          <ul>
            {distribution.meals.filter((item) => item.allocatedPortions > 0).map((item) => (
              <li key={item.mealType}>{mealLabels[item.mealType]} · {item.allocatedPortions} suất</li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Quay lại</Button>
          <Button variant="contained" onClick={() => { setConfirmOpen(false); onConfirm(); }}>Xác nhận đã giao</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
