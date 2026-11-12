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
import detailsStyles from "./component/AllocationDetails.module.scss";
import "./style.scss";

function getView(data, draft) {
  if (!data) return { batches: [], demands: [] };
  const demands = data.demands.map((demand) => ({ ...demand, total: demand.totalPortions, remaining: demand.totalPortions }));
  const demandById = new Map(demands.map((demand) => [demand.id, demand]));
  const batches = data.batches.map((batch, index) => {
    const entries = (draft[batch.id] ?? batch.entries).map((entry) => {
      const demand = demandById.get(entry.dailyMealPortionId);
      demand.remaining -= entry.allocatedPortions;
      return { ...entry, id: demand.id, name: demand.name, total: demand.total, portions: entry.allocatedPortions, demand };
    });
    const lockedCount = entries.filter((entry) => entry.locked)
      .reduce((sum, entry) => sum + entry.portions, 0);
    const total = batch.plannedPortions ?? 0;
    return {
      ...batch, name: `Lô ${index + 1} · ${batch.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"}`,
      total, entries, editableCapacity: total - lockedCount,
      remaining: total - entries.reduce((sum, entry) => sum + entry.portions, 0),
    };
  });
  for (const batch of batches)
    for (const entry of batch.entries) entry.remaining = entry.demand.remaining;
  return { batches, demands };
}

export default function KitchenMealAllocation() {
  const [params, setParams] = useSearchParams();
  const activeTab = params.get("tab") === "details" ? "details" : "allocation";
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState({});
  const [openBatchIds, setOpenBatchIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
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
        setSelectedId(null);
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
  const selected = view.batches.find((batch) => batch.id === selectedId);
  const available = selected
    ? view.demands.filter((demand) => !demand.locked && demand.mealType === selected.mealType)
        .map((demand) => ({
          ...demand,
          remaining: demand.remaining + (selected.entries.find((entry) => entry.id === demand.id)?.portions ?? 0),
        })).filter((demand) => demand.remaining > 0)
    : [];

  function updateBatch(batchId, entries) {
    setDraft((current) => ({ ...current, [batchId]: entries }));
  }

  function applySelection(orderedIds) {
    const { entries } = previewBatchAllocation(selected.editableCapacity, available, orderedIds);
    updateBatch(selected.id, [
      ...selected.entries.filter((entry) => entry.locked),
      ...entries.map((entry) => ({ dailyMealPortionId: entry.id, allocatedPortions: entry.portions, locked: false })),
    ]);
    setSelectedId(null);
  }

  async function save() {
    if (!ready || !dirty || saving || conflict) return;
    setSaving(true);
    try {
      const result = await MealAllocationService.apply({
        revision: data.revision,
        batches: view.batches.filter((batch) => batch.editableCapacity > 0).map((batch) => ({
          cookingBatchId: batch.id,
          entries: batch.entries.filter((entry) => !entry.locked).map(({ dailyMealPortionId, allocatedPortions }) => ({
            dailyMealPortionId, allocatedPortions,
          })),
        })),
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
      if (error.response?.status === 409) setLoadVersion((version) => version + 1);
      notice({ msg: error.message, isSuccess: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="kitchen-meal-allocation" aria-labelledby="meal-allocation-heading" aria-busy={loading || saving}>
      <header className="kitchen-meal-allocation__header">
        <div className="kitchen-meal-allocation__title">
          <span className="kitchen-meal-allocation__icon"><Archive size={17} aria-hidden="true" /></span>
          <h1 id="meal-allocation-heading">
            Phân bổ suất ăn{data ? ` ngày ${data.date.split("-").reverse().join("/")}` : ""}
          </h1>
        </div>
        {activeTab === "details" && data?.distribution && (
          <div className="kitchen-meal-allocation__day-total">
            <span className="kitchen-meal-allocation__icon"><ClipboardCheck size={17} aria-hidden="true" /></span>
            <div>
              <span>Tổng nhu cầu trong ngày</span>
              <strong>{data.distribution.demands.reduce((sum, demand) => sum + demand.requiredPortions, 0)} suất</strong>
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
        <Tab id="meal-allocation-details-tab" aria-controls="meal-allocation-details-panel" value="details" label="Thông tin phân bổ suất ăn" />
      </Tabs>

      {loading && <LinearProgress aria-label="Đang tải phân bổ" />}
      {loadError && (
        <Alert severity="error" action={<Button className="kitchen-meal-allocation__action" onClick={() => setLoadVersion((v) => v + 1)}>Thử lại</Button>}>
          {loadError}
        </Alert>
      )}
      <div id="meal-allocation-panel" role="tabpanel" aria-labelledby="meal-allocation-tab" hidden={activeTab !== "allocation"}>
        {conflict && (
          <Alert severity="warning" action={<Button className="kitchen-meal-allocation__action" onClick={() => {
            if (window.confirm("Tải lại sẽ bỏ các thay đổi chưa áp dụng. Bạn có muốn tiếp tục?"))
              setLoadVersion((v) => v + 1);
          }}>Tải lại</Button>}>
            Không thể áp dụng phân bổ. Tải lại để đối chiếu trạng thái và số suất mới nhất.
          </Alert>
        )}
        {!ready && !loading && !loadError && data && (
          <AllocationGate data={data} onRetry={() => setLoadVersion((v) => v + 1)} />
        )}

        <div className={`kitchen-meal-allocation__batches ${!ready ? "kitchen-meal-allocation__locked" : ""}`} inert={!ready || saving}>
          {view.batches.map((batch) => (
            <BatchAllocationPanel
              key={batch.id}
              batch={batch}
              expanded={openBatchIds.includes(batch.id)}
              canAddClasses={batch.entries.some((entry) => !entry.locked) ||
                (batch.remaining > 0 && view.demands.some((demand) => !demand.locked &&
                  demand.mealType === batch.mealType && demand.remaining > 0))}
              onToggle={() => setOpenBatchIds((current) => current.includes(batch.id)
                ? current.filter((id) => id !== batch.id) : [...current, batch.id])}
              onAddClasses={() => setSelectedId(batch.id)}
              onRemoveClass={(id) => updateBatch(batch.id, batch.entries.filter((entry) => entry.locked || entry.id !== id))}
            />
          ))}
        </div>

        {ready && (
          <div className={`${detailsStyles.footer} ${detailsStyles.applyFooter}`}>
            <Button className="kitchen-meal-allocation__action" variant="contained" disabled={!dirty || saving || conflict} onClick={save}>
              Áp dụng phân bổ
            </Button>
          </div>
        )}

        {ready && selected && (
          <SelectClassesDialog
            key={selected.id}
            batch={{ ...selected, total: selected.editableCapacity, entries: selected.entries.filter((entry) => !entry.locked) }}
            classes={available}
            onClose={() => setSelectedId(null)}
            onApply={applySelection}
          />
        )}
      </div>
      <div id="meal-allocation-details-panel" role="tabpanel" aria-labelledby="meal-allocation-details-tab" hidden={activeTab !== "details"}>
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
