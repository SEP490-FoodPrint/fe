import { sumAllocationPortions } from "src/utils/allocationDecimal";
import { gradeBatchProjection, mergeGradeBatchEntries, classRemainingAcrossOtherBatches } from "src/utils/gradeAllocation";
import React, { useEffect, useState, useRef } from "react";
import { Alert, Button, LinearProgress, Tab, Tabs, TextField, MenuItem } from "@mui/material";
import { Archive, ClipboardCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import notice from "src/components/Notice";
import { mealByTime } from "src/utils/mealWindow";
import KitchenService from "src/services/KitchenService";
import useConfirmAction from "../KitchenCooking/CreateBatch/component/useConfirmAction";
import MealAllocationService from "src/services/MealAllocationService";
import { previewBatchAllocation } from "src/utils/mealAllocation";
import BatchAllocationPanel from "./component/BatchAllocationPanel";
import SelectClassesDialog from "./component/SelectClassesDialog";
import AllocationGate from "./component/AllocationGate";
import AllocationDetails from "./component/AllocationDetails";
import GradeContainer from "./component/GradeContainer";
import DishGroup from "./component/DishGroup";
import detailsStyles from "./component/AllocationDetails.module.scss";
import "./style.scss";

function projectMaterialPreview(data, plan, editing) {
  const entriesBySlot = new Map();
  for (const entry of plan.entries) {
    const key = `${entry.gradeId}:${entry.dishId}:${entry.batchId}`;
    if (!entriesBySlot.has(key)) entriesBySlot.set(key, []);
    entriesBySlot.get(key).push({
      ...entry,
      dailyMealPortionId: entry.demandId,
      locked: !editing,
    });
  }
  const summaries = new Map(plan.groups.map((group) => [
    `${group.gradeId}:${group.dishId}`, group,
  ]));

  return {
    ...data,
    grades: (data.grades || []).map((grade) => ({
      ...grade,
      dishes: grade.dishes.map((dish) => {
        const key = `${grade.gradeId}:${dish.dishId}`;
        const summary = summaries.get(key);
        const availability = new Map(summary?.availability.map((slot) => [slot.batchId, slot]));
        return {
          ...dish,
          materialPreview: Boolean(summary),
          totalRequiredPortions: summary?.requiredPortions ?? dish.totalRequiredPortions,
          batches: dish.batches.flatMap((batch) => {
            const entries = entriesBySlot.get(`${key}:${batch.cookingBatchId}`) ?? [];
            const plannedPortions = sumAllocationPortions(entries.map((entry) => entry.allocatedPortions));
            if (!editing && plannedPortions === "0.00") return [];
            return [{
              ...batch,
              materialPreview: true,
              allocationVersion: 2,
              entries,
              plannedPortions: editing ? batch.plannedPortions : plannedPortions,
              editMaterial: editing,
              materialAvailablePortions: availability.get(batch.cookingBatchId)?.availablePortions,
            }];
          }),
        };
      }),
    })),
  };
}

function allocationRows(data, draft = {}) {
  const rows = new Map();
  for (const grade of data?.grades ?? []) {
    for (const dish of grade.dishes) {
      for (const batch of dish.batches) {
        const slot = `${batch.cookingBatchId}_${dish.dishId}`;
        for (const entry of draft[slot] ?? batch.entries ?? []) {
          const demandId = entry.dailyMealPortionId ?? entry.id;
          rows.set(slot + ":" + demandId, {
            demandId, dishId: dish.dishId, batchId: batch.cookingBatchId,
            allocatedPortions: sumAllocationPortions([entry.allocatedPortions ?? entry.portions]),
          });
        }
      }
    }
  }
  return [...rows.keys()].sort().map((key) => rows.get(key));
}

function getView(data, draft = {}) {
  if (!data) return { batches: [], demands: [], grades: [] };

  // Nếu API đã trả về cấu trúc phân cấp theo Khối -> Món -> Lô (grades)
  if (Array.isArray(data.grades) && data.grades.length > 0) {
    const grades = data.grades.map((grade) => {
      const demandById = new Map((grade.demands || []).map((d) => [d.id, d]));

      const dishes = (grade.dishes || []).map((dish) => {
        const batches = (dish.batches || []).map((batchSlot, idx) => {
          const key = `${batchSlot.cookingBatchId}_${dish.dishId}`;
          const scope = gradeBatchProjection(data, draft, grade, dish, batchSlot);
          const rawEntries = scope.entries;

          const entries = rawEntries.map((entry) => {
            const demId = entry.dailyMealPortionId || entry.id;
            const demand = demandById.get(demId);
            const portions = Number(entry.allocatedPortions || entry.portions) || 0;
            return {
              id: demId,
              dailyMealPortionId: demId,
              name: entry.className || demand?.className || demand?.name || `Lớp ${idx + 1}`,
              total: dish.classRequirements?.find((row) => row.demandId === demId)?.requiredPortions ?? demand?.totalPortions ?? demand?.total ?? portions,
              portions,
              locked: entry.locked || false,
              materials: entry.materials,
              massKg: entry.massKg,
            };
          });

          const total = batchSlot.plannedPortions || 0;
          const allocated = Number(scope.allocatedForGrade);
          const remaining = Number(scope.remainingForGrade);
          const isAuto = !batchSlot.editMaterial && (batchSlot.allocationVersion === 2 || Boolean(dish.autoAssigned && dish.batches?.length === 1));

          return {
            ...batchSlot,
            ...scope,
            id: batchSlot.cookingBatchId,
            name:
              batchSlot.batchNumber != null
                ? `Lô ${batchSlot.batchNumber}`
                : batchSlot.batchCode || `Lô ${idx + 1}`,
            total,
            allocated,
            remaining,
            entries,
            editableCapacity: total,
            autoAssigned: isAuto,
            key,
          };
        });

        return {
          ...dish,
          batches,
        };
      });

      return {
        ...grade,
        dishes,
      };
    });

    return { grades, batches: [], demands: [], isGradesMode: true };
  }

  // Fallback cấu trúc phẳng cũ nếu API chưa trả grades
  if (!Array.isArray(data.demands) || !Array.isArray(data.batches)) {
    return { batches: [], demands: [], grades: [], isGradesMode: false };
  }

  const demands = data.demands.map((demand) => ({
    ...demand,
    total: demand.totalPortions ?? 0,
    remaining: demand.totalPortions ?? 0,
  }));
  const demandById = new Map(demands.map((demand) => [demand.id, demand]));

  const batches = data.batches.map((batch, index) => {
    const rawEntries = draft[batch.id] ?? batch.entries ?? [];
    const entries = rawEntries.map((entry) => {
      const demand = demandById.get(entry.dailyMealPortionId);
      if (!demand) {
        return {
          ...entry,
          portions: entry.allocatedPortions ?? 0,
        };
      }
      demand.remaining -= entry.allocatedPortions ?? 0;
      return {
        ...entry,
        id: demand.id,
        name: demand.name,
        total: demand.total,
        portions: entry.allocatedPortions ?? 0,
        demand,
      };
    });
    const lockedCount = entries
      .filter((entry) => entry.locked)
      .reduce((sum, entry) => sum + (entry.portions ?? 0), 0);
    const total = batch.plannedPortions ?? 0;
    return {
      ...batch,
      name:
        batch.batchNumber != null
          ? `Lô ${batch.batchNumber} · ${batch.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"} · ${batch.scopeLabel || "Toàn trường"}`
          : batch.name ||
            `Lô ${index + 1} · ${batch.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"} · ${batch.scopeLabel || "Toàn trường"}`,
      total,
      entries,
      editableCapacity: total - lockedCount,
      remaining:
        total - entries.reduce((sum, entry) => sum + (entry.portions ?? 0), 0),
    };
  });

  return { batches, demands, grades: [], isGradesMode: false };
}

export default function KitchenMealAllocation() {
  const [params, setParams] = useSearchParams();
  const activeTab = params.get("tab") === "details" ? "details" : "allocation";
  const [data, setData] = useState(null);
  const [meal, setMeal] = useState(() => mealByTime(null).toUpperCase());
  const [mealTimes, setMealTimes] = useState(null);
  const manualMeal = useRef(false);
  const { confirm, element: confirmElement } = useConfirmAction();
  const [draft, setDraft] = useState({});
  const [openBatchKeys, setOpenBatchKeys] = useState([]);
  const [selectedDialogContext, setSelectedDialogContext] = useState(null);
  const [loadVersion, setLoadVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(false);
  const [conflict, setConflict] = useState(false);

  const dirtyDraft = Object.keys(draft).length > 0;
  useEffect(() => {
    const controller = new AbortController();
    KitchenService.getContext({ signal: controller.signal })
      .then(context => { if (!controller.signal.aborted) setMealTimes({ lunch: context.lunchTime }); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const apply = () => {
      if (!manualMeal.current && !dirtyDraft && !saving) setMeal(mealByTime(mealTimes).toUpperCase());
    };
    apply();
    const timer = setInterval(apply, 60000);
    return () => clearInterval(timer);
  }, [mealTimes, dirtyDraft, saving]);
  function selectMeal(value) {
    if (value === meal) return;
    const change = () => { manualMeal.current = true; setDraft({}); setMeal(value); };
    if (dirtyDraft) confirm({ title: "Đổi bữa ăn?", message: "Bỏ các thay đổi phân bổ chưa lưu?", confirmText: "Đổi bữa", onConfirm: change });
    else change();
  }
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const snapshot = await MealAllocationService.getToday(controller.signal, activeTab === "allocation" ? meal : undefined);
        if (controller.signal.aborted) return;
        setData(snapshot);
        setDraft({});
        setEditingMaterial(false);
        setSelectedDialogContext(null);
        setConflict(false);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [loadVersion, meal, activeTab]);

  const plan = data?.mealType === meal ? data.materialPlan : undefined;
  const materialMode = data?.materialEditing === true;
  const editorData = materialMode && data.editorGrades
    ? { ...data, grades: data.editorGrades.map((grade) => ({
        ...grade, demands: grade.demands.map((demand) => ({ ...demand, locked: false })),
        dishes: grade.dishes.map((dish) => ({ ...dish, autoAssigned: false, batches: dish.batches.map((batch) => ({
          ...batch, editMaterial: true, entries: batch.entries.map((entry) => ({ ...entry, locked: false })),
        })) })),
      })) }
    : data;
  const baseView = plan ? projectMaterialPreview(editorData, plan, true) : editorData;
  const displayData = editingMaterial ? baseView : plan ? projectMaterialPreview(data, plan, false) : data;
  const view = getView(displayData, draft);
  const canEditBatches = materialMode ? editingMaterial
    : !plan && !data?.supportsMaterialAllocation && data?.materialEditing !== false;
  const ready = data?.status === "READY" && data?.mealType === meal && !loading && !loadError;
  const rows = materialMode ? allocationRows(baseView, draft) : [];
  const dirty = materialMode
    ? JSON.stringify(rows) !== JSON.stringify(allocationRows(baseView))
    : Object.keys(draft).length > 0;
  useEffect(() => {
    if (!data?.materialPlanPending || activeTab !== "allocation" || data.mealType !== meal || loading) return;
    const timeout = setTimeout(() => setLoadVersion((version) => version + 1), 2500);
    return () => clearTimeout(timeout);
  }, [data, activeTab, meal, loading]);

  function updateDraft(key, entries) {
    setDraft((current) => ({ ...current, [key]: entries }));
  }

  function toggleBatchKey(key) {
    setOpenBatchKeys((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  }

  // Mở Dialog chọn lớp cho 1 lô thuộc 1 món ăn trong khối
  function openSelectClasses(grade, dish, batchSlot) {
    // Chỉ lấy các lớp thuộc khối hiện tại
    const classDemands = (grade.demands || []).filter((d) => !d.locked);
    const availableClasses = classDemands.map((d) => {
      const total = dish.classRequirements?.find((row) => row.demandId === d.id)?.requiredPortions ?? d.totalPortions ?? d.total;
      return {
        id: d.id,
        name: d.className || d.name,
        total,
        remaining: Number(classRemainingAcrossOtherBatches(dish, batchSlot.cookingBatchId, d.id, total)),
      };
    }).filter((d) => d.total > 0);

    setSelectedDialogContext({
      grade,
      dish,
      batchSlot: { ...batchSlot, total: Number(batchSlot.editableCapacityForGrade) },
      availableClasses,
    });
  }

  function applySelection(orderedIds, materialEntries) {
    if (!selectedDialogContext) return;
    const { grade, dish, batchSlot, availableClasses } = selectedDialogContext;
    const key = batchSlot.key || `${batchSlot.cookingBatchId}_${dish.dishId}`;

    const { entries } = materialEntries ? { entries: materialEntries } : previewBatchAllocation(
      Number(batchSlot.editableCapacityForGrade),
      availableClasses,
      orderedIds,
    );

    const lockedEntries = (batchSlot.entries || []).filter((e) => e.locked);
    const newEntries = [
      ...lockedEntries,
      ...entries.map((e) => ({
        dailyMealPortionId: e.id,
        allocatedPortions: e.portions,
        className: e.name,
        locked: false,
      })),
    ];

    setDraft(current => ({ ...current, [key]: mergeGradeBatchEntries(baseView, current, key, grade.gradeId, newEntries) }));
    setSelectedDialogContext(null);
  }

  function removeClass(key, currentEntries, demId, gradeId) {
    const updated = currentEntries.filter(
      (e) => e.locked || (e.dailyMealPortionId || e.id) !== demId,
    );
    if (gradeId) setDraft(current => ({ ...current, [key]: mergeGradeBatchEntries(baseView, current, key, gradeId, updated) }));
    else updateDraft(key, updated);
  }

  async function save(keepDraft = false) {
    if (!ready || saving || conflict || (data.materialDraftStale && !dirty) ||
      (keepDraft && !dirty) || (!materialMode && (!canEditBatches || !dirty))) return;
    setSaving(true);
    try {
      if (materialMode) {
        const payload = { mealType: meal, revision: data.draftRevision, ...(dirty && { rows }) };
        if (keepDraft) await MealAllocationService.saveDraft(payload);
        else await MealAllocationService.apply(payload);
        setLoading(true);
        setLoadVersion((version) => version + 1);
        notice({ msg: keepDraft ? "Đã lưu bản nháp." : "Đã áp dụng phân bổ suất ăn.", isSuccess: true });
        return;
      }

      let payloadBatches = [];

      if (view.isGradesMode) {
        payloadBatches = Object.entries(draft).map(([key, entries]) => {
          const [cookingBatchId, dishId] = key.split("_");
          return {
            cookingBatchId,
            dishId,
            entries: entries.map((e) => ({
              dailyMealPortionId: e.dailyMealPortionId || e.id,
              allocatedPortions: Number(e.allocatedPortions || e.portions) || 0,
            })),
          };
        });
      } else {
        // Fallback cũ
        payloadBatches = view.batches
          .filter((batch) => batch.editableCapacity > 0)
          .map((batch) => ({
            cookingBatchId: batch.id,
            entries: batch.entries
              .filter((entry) => !entry.locked)
              .map(({ dailyMealPortionId, allocatedPortions }) => ({
                dailyMealPortionId,
                allocatedPortions,
              })),
          }));
      }

      const result = await MealAllocationService.apply({
        revision: data.revision,
        mealType: meal,
        batches: payloadBatches,
      });

      setData(result);
      setDraft({});
      notice({ msg: "Đã áp dụng phân bổ suất ăn.", isSuccess: true });
    } catch (error) {
      if (error.response?.data?.errors?.code === "ALLOCATION_STALE") setConflict(true);
      notice({ msg: error.response?.data?.message ?? error.message, isSuccess: false });
    } finally {
      setSaving(false);
    }
  }

  async function retryProposal() {
    setSaving(true);
    try {
      await MealAllocationService.retryDraft(meal);
      setLoadVersion((version) => version + 1);
    } catch (error) {
      notice({ msg: error.message, isSuccess: false });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDistribution() {
    if (saving || dirty || !data?.distribution?.canConfirmDistribution) return;
    if (data.hasUnappliedDrafts && !window.confirm("Xác nhận giao theo bản phân bổ đã áp dụng? Các bản nháp chưa áp dụng sẽ không được dùng.")) return;
    setSaving(true);
    try {
      setData(await MealAllocationService.confirmDistribution(data.revision));
      notice({ msg: "Đã xác nhận giao suất ăn trong ngày.", isSuccess: true });
    } catch (error) {
      if (error.response?.status === 409) setLoadVersion((v) => v + 1);
      notice({ msg: error.message, isSuccess: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="kitchen-meal-allocation" aria-labelledby="meal-allocation-heading" aria-busy={loading || saving}>
      <header className="kitchen-meal-allocation__header">
        <div className="kitchen-meal-allocation__title">
          <span className="kitchen-meal-allocation__icon">
            <Archive size={17} aria-hidden="true" />
          </span>
          <h1 id="meal-allocation-heading">
            Phân bổ suất ăn{data?.date && <> <time dateTime={data.date}>Ngày {data.date.split("-").reverse().join("/")}</time></>}
          </h1>
        </div>
        {activeTab === "details" && data?.distribution && (
          <div className="kitchen-meal-allocation__day-total">
            <span className="kitchen-meal-allocation__icon">
              <ClipboardCheck size={17} aria-hidden="true" />
            </span>
            <div>
              <span>Tổng nhu cầu trong ngày</span>
              <strong>
                {(data.distribution.demands || []).reduce(
                  (sum, demand) => sum + (demand.requiredPortions || 0),
                  0,
                )}{" "}
                suất
              </strong>
            </div>
          </div>
        )}
      </header>

      {confirmElement}
      {activeTab === "allocation" && (
        <TextField className="kitchen-meal-allocation__meal" select label="Bữa ăn" value={meal} onChange={event => selectMeal(event.target.value)} disabled={saving}>
          <MenuItem value="LUNCH">Bữa trưa</MenuItem>
          <MenuItem value="AFTERNOON">Bữa xế</MenuItem>
        </TextField>
      )}
      <Tabs
        className="kitchen-meal-allocation__tabs"
        aria-label="Các mục phân bổ suất ăn"
        value={activeTab}
        variant="scrollable"
        allowScrollButtonsMobile
        onChange={(_, value) => {
          if (saving) return;
          const next = new URLSearchParams(params);
          if (value === "details") next.set("tab", value);
          else next.delete("tab");
          if (dirty) confirm({ title: "Đổi tab?", message: "Bỏ các thay đổi phân bổ chưa lưu?", confirmText: "Đổi tab", onConfirm: () => setParams(next) });
          else setParams(next);
        }}
      >
        <Tab id="meal-allocation-tab" aria-controls="meal-allocation-panel" value="allocation" label="Phân bổ suất ăn" />
        <Tab
          id="meal-allocation-details-tab"
          aria-controls="meal-allocation-details-panel"
          value="details"
          label="Thông tin phân bổ suất ăn"
        />
      </Tabs>

      {loading && <LinearProgress aria-label="Đang tải phân bổ" />}
      {loadError && (
        <Alert
          severity="error"
          action={
            <Button className="kitchen-meal-allocation__action" onClick={() => setLoadVersion((v) => v + 1)}>
              Thử lại
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      {/* TAB 1: PHÂN BỔ SUẤT ĂN */}
      <div
        id="meal-allocation-panel"
        role="tabpanel"
        aria-labelledby="meal-allocation-tab"
        hidden={activeTab !== "allocation"}
      >
        {ready && data.materialPlanError && (
          <Alert severity="warning" action={<Button disabled={saving} onClick={retryProposal}>Thử lại</Button>}>
            {data.materialPlanError}
          </Alert>
        )}
        {ready && plan && plan.origin !== "MANUAL" && !plan.optimal && (
          <Alert severity="info">Phương án đủ suất. Chưa xác nhận được đây là phương án tối ưu.</Alert>
        )}
        {conflict && (
          <Alert
            severity="warning"
            action={
              <Button
                className="kitchen-meal-allocation__action"
                onClick={() => {
                  if (window.confirm("Tải lại sẽ bỏ các thay đổi chưa áp dụng. Bạn có muốn tiếp tục?"))
                    setLoadVersion((v) => v + 1);
                }}
              >
                Tải lại
              </Button>
            }
          >
            Không thể áp dụng phân bổ. Tải lại để đối chiếu trạng thái và số suất mới nhất.
          </Alert>
        )}

        {!ready && !loading && !loadError && data && (
          <AllocationGate data={data} onRetry={() => setLoadVersion((v) => v + 1)} />
        )}

        {ready && data.materialPlanPending && <Alert severity="info">Đang chuẩn bị phương án</Alert>}
        {ready && data.materialDraftStale && <Alert severity="warning">Dữ liệu bữa đã thay đổi. Kiểm tra lại bản nháp trước khi áp dụng.</Alert>}
        {!data?.materialPlanError && !data?.materialPlanPending && <div
          className={`kitchen-meal-allocation__batches ${!ready ? "kitchen-meal-allocation__locked" : ""}`}
          inert={!ready || saving}
        >
          {view.isGradesMode ? (
            // BỐ CỤC MỚI: Khối -> Món ăn -> Lô chế biến
            view.grades.map((grade) => (
              <GradeContainer key={grade.gradeId} grade={grade}>
                {grade.dishes.map((dish) => (
                  <DishGroup key={dish.dishId} dish={dish}>
                    {dish.batches.map((batchSlot) => {
                      const key = batchSlot.key;
                      return (
                        <BatchAllocationPanel
                          key={key}
                          batch={batchSlot}
                          readOnly={!canEditBatches}
                          expanded={openBatchKeys.includes(batchSlot.scopeKey)}
                          canAddClasses={
                            canEditBatches && !batchSlot.autoAssigned &&
                            (materialMode || (batchSlot.entries || []).some((e) => !e.locked) || batchSlot.remaining > 0)
                          }
                          onToggle={() => toggleBatchKey(batchSlot.scopeKey)}
                          onAddClasses={() => openSelectClasses(grade, dish, batchSlot)}
                          onRemoveClass={(demId) => removeClass(key, batchSlot.entries, demId, grade.gradeId)}
                        />
                      );
                    })}
                  </DishGroup>
                ))}
              </GradeContainer>
            ))
          ) : (
            // FALLBACK CŨ
            view.batches.map((batch) => (
              <BatchAllocationPanel
                key={batch.id}
                batch={batch}
                readOnly={!canEditBatches}
                expanded={openBatchKeys.includes(batch.id)}
                canAddClasses={
                  canEditBatches && ((batch.entries || []).some((entry) => !entry.locked) ||
                  (batch.remaining > 0 &&
                    view.demands.some(
                      (demand) =>
                        !demand.locked &&
                        demand.mealType === batch.mealType &&
                        (!batch.eligibleDemandIds || batch.eligibleDemandIds.includes(demand.id)) &&
                        demand.remaining > 0,
                    )))
                }
                onToggle={() => toggleBatchKey(batch.id)}
                onAddClasses={() => updateDraft(batch.id, batch.entries)}
                onRemoveClass={(id) =>
                  updateDraft(
                    batch.id,
                    (batch.entries || []).filter((entry) => entry.locked || entry.id !== id),
                  )
                }
              />
            ))
          )}
        </div>}

        {ready && (materialMode || canEditBatches) && (
          <div className={`${detailsStyles.footer} ${detailsStyles.applyFooter}`}>
            {materialMode && !editingMaterial && (
              <Button variant="outlined" disabled={saving} onClick={() => setEditingMaterial(true)}>
                Chỉnh sửa phân bổ
              </Button>
            )}
            {materialMode && editingMaterial && (
              <Button variant="outlined" disabled={!dirty || saving || conflict} onClick={() => save(true)}>
                Lưu bản nháp
              </Button>
            )}
            <Button
              className="kitchen-meal-allocation__action"
              variant="contained"
              disabled={(!plan && !dirty) || saving || conflict || (data.materialDraftStale && !dirty)}
              onClick={() => save()}
            >
              Áp dụng phân bổ
            </Button>
          </div>
        )}

        {/* Modal chọn lớp cho lô của món ăn */}
        {ready && canEditBatches && selectedDialogContext && (
          <SelectClassesDialog
            batch={{
              ...selectedDialogContext.batchSlot,
              total: selectedDialogContext.batchSlot.plannedPortions,
              entries: selectedDialogContext.batchSlot.entries.filter((e) => !e.locked),
            }}
            editQuantities={materialMode}
            classes={selectedDialogContext.availableClasses}
            dishName={selectedDialogContext.dish.dishName}
            onClose={() => setSelectedDialogContext(null)}
            onApply={applySelection}
          />
        )}
      </div>

      {/* TAB 2: THÔNG TIN PHÂN BỔ SUẤT ĂN */}
      <div
        id="meal-allocation-details-panel"
        role="tabpanel"
        aria-labelledby="meal-allocation-details-tab"
        hidden={activeTab !== "details"}
      >
        {!loading && !loadError && data?.distribution && (
          <AllocationDetails
            data={data}
            dirty={dirty}
            saving={saving}
            onDiscard={() => setDraft({})}
            onConfirm={confirmDistribution}
          />
        )}
        {!loading && !loadError && data && !data.distribution && (
          <Alert severity="info">Chưa tải được thông tin giao suất ăn từ máy chủ.</Alert>
        )}
      </div>
    </section>
  );
}
