import React, { useEffect, useState } from "react";
import { Alert, Button, LinearProgress, Tab, Tabs } from "@mui/material";
import { Archive, ClipboardCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import notice from "src/components/Notice";
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

function getView(data, draft = {}) {
  if (!data) return { batches: [], demands: [], grades: [] };

  // Nếu API đã trả về cấu trúc phân cấp theo Khối -> Món -> Lô (grades)
  if (Array.isArray(data.grades) && data.grades.length > 0) {
    const grades = data.grades.map((grade) => {
      const demandById = new Map((grade.demands || []).map((d) => [d.id, d]));

      const dishes = (grade.dishes || []).map((dish) => {
        const batches = (dish.batches || []).map((batchSlot, idx) => {
          const key = `${batchSlot.cookingBatchId}_${dish.dishId}`;
          const rawEntries = draft[key] ?? batchSlot.entries ?? [];

          const entries = rawEntries.map((entry) => {
            const demId = entry.dailyMealPortionId || entry.id;
            const demand = demandById.get(demId);
            const portions = Number(entry.allocatedPortions || entry.portions) || 0;
            return {
              id: demId,
              dailyMealPortionId: demId,
              name: entry.className || demand?.className || demand?.name || `Lớp ${idx + 1}`,
              total: demand?.totalPortions || demand?.total || portions,
              portions,
              locked: entry.locked || false,
            };
          });

          const total = batchSlot.plannedPortions || 0;
          const allocated = entries.reduce((sum, e) => sum + e.portions, 0);
          const remaining = Math.max(0, total - allocated);
          const isAuto = Boolean(dish.autoAssigned && dish.batches?.length === 1);

          return {
            ...batchSlot,
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
  const [draft, setDraft] = useState({});
  const [openBatchKeys, setOpenBatchKeys] = useState([]);
  const [selectedDialogContext, setSelectedDialogContext] = useState(null);
  const [loadVersion, setLoadVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const snapshot = await MealAllocationService.getToday(controller.signal);
        if (controller.signal.aborted) return;
        setData(snapshot);
        setDraft({});
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
  }, [loadVersion]);

  const view = getView(data, draft);
  const ready = data?.status === "READY" && !loading && !loadError;
  const dirty = Object.keys(draft).length > 0;

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
    const existingEntries = batchSlot.entries || [];

    const availableClasses = classDemands.map((d) => {
      const alreadyInThisBatch = existingEntries.find(
        (e) => (e.dailyMealPortionId || e.id) === d.id,
      )?.portions || 0;
      return {
        id: d.id,
        name: d.className || d.name,
        total: d.totalPortions || d.total,
        remaining: (d.totalPortions || d.total) - alreadyInThisBatch + alreadyInThisBatch, // lớp có thể nhận lại suất
      };
    });

    setSelectedDialogContext({
      grade,
      dish,
      batchSlot,
      availableClasses,
    });
  }

  function applySelection(orderedIds) {
    if (!selectedDialogContext) return;
    const { dish, batchSlot, availableClasses } = selectedDialogContext;
    const key = batchSlot.key || `${batchSlot.cookingBatchId}_${dish.dishId}`;

    const { entries } = previewBatchAllocation(
      batchSlot.plannedPortions,
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

    updateDraft(key, newEntries);
    setSelectedDialogContext(null);
  }

  function removeClass(key, currentEntries, demId) {
    const updated = currentEntries.filter(
      (e) => e.locked || (e.dailyMealPortionId || e.id) !== demId,
    );
    updateDraft(key, updated);
  }

  async function save() {
    if (!ready || !dirty || saving || conflict) return;
    setSaving(true);
    try {
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
        batches: payloadBatches,
      });

      setData(result);
      setDraft({});
      notice({ msg: "Đã áp dụng phân bổ suất ăn.", isSuccess: true });
    } catch (error) {
      if (error.response?.status === 409) setConflict(true);
      notice({ msg: error.message, isSuccess: false });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDistribution() {
    if (saving || dirty || !data?.distribution?.canConfirmDistribution) return;
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
            Phân bổ suất ăn{data?.date ? ` ngày ${data.date.split("-").reverse().join("/")}` : ""}
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

      <Tabs
        className="kitchen-meal-allocation__tabs"
        aria-label="Các mục phân bổ suất ăn"
        value={activeTab}
        variant="scrollable"
        allowScrollButtonsMobile
        onChange={(_, value) => {
          const next = new URLSearchParams(params);
          if (value === "details") next.set("tab", value);
          else next.delete("tab");
          setParams(next);
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

        <div
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
                          expanded={openBatchKeys.includes(key)}
                          canAddClasses={
                            !batchSlot.autoAssigned &&
                            ((batchSlot.entries || []).some((e) => !e.locked) || batchSlot.remaining > 0)
                          }
                          onToggle={() => toggleBatchKey(key)}
                          onAddClasses={() => openSelectClasses(grade, dish, batchSlot)}
                          onRemoveClass={(demId) => removeClass(key, batchSlot.entries, demId)}
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
                expanded={openBatchKeys.includes(batch.id)}
                canAddClasses={
                  (batch.entries || []).some((entry) => !entry.locked) ||
                  (batch.remaining > 0 &&
                    view.demands.some(
                      (demand) =>
                        !demand.locked &&
                        demand.mealType === batch.mealType &&
                        (!batch.eligibleDemandIds || batch.eligibleDemandIds.includes(demand.id)) &&
                        demand.remaining > 0,
                    ))
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
        </div>

        {ready && (
          <div className={`${detailsStyles.footer} ${detailsStyles.applyFooter}`}>
            <Button
              className="kitchen-meal-allocation__action"
              variant="contained"
              disabled={!dirty || saving || conflict}
              onClick={save}
            >
              Áp dụng phân bổ
            </Button>
          </div>
        )}

        {/* Modal chọn lớp cho lô của món ăn */}
        {ready && selectedDialogContext && (
          <SelectClassesDialog
            batch={{
              ...selectedDialogContext.batchSlot,
              total: selectedDialogContext.batchSlot.plannedPortions,
              entries: selectedDialogContext.batchSlot.entries.filter((e) => !e.locked),
            }}
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
