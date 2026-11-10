import React, { useMemo, useState } from "react";
import { Alert, Chip, Snackbar } from "@mui/material";
import { Archive } from "lucide-react";
import {
  getMealAllocationView,
  replaceBatchAllocation,
  withoutBatchAllocation,
} from "src/utils/mealAllocation";
import BatchAllocationPanel from "./component/BatchAllocationPanel";
import SelectClassesDialog from "./component/SelectClassesDialog";
import {
  allocationScenarios,
  createScenarioData,
  getMockAllocationId,
  mockMealAllocation,
} from "./component/mockMealAllocation";
import "./style.scss";

const [firstBatch, , thirdBatch] = mockMealAllocation.cookingBatches;
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export default function KitchenMealAllocation() {
  const [data, setData] = useState(() =>
    createScenarioData(allocationScenarios[0]),
  );
  const [openBatchId, setOpenBatchId] = useState(thirdBatch.id);
  const [selectingBatchId, setSelectingBatchId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const view = useMemo(() => getMealAllocationView(data), [data]);
  const selectingBatch = view.batches.find(
    (batch) => batch.id === selectingBatchId,
  );
  const draft = useMemo(
    () =>
      selectingBatchId
        ? getMealAllocationView(withoutBatchAllocation(data, selectingBatchId))
        : null,
    [data, selectingBatchId],
  );

  const closeDialog = () => setSelectingBatchId(null);

  const applySelection = (orderedIds) => {
    setData(
      replaceBatchAllocation(
        data,
        selectingBatchId,
        orderedIds,
        new Date(),
        getMockAllocationId,
      ),
    );
    setFeedback(`Đã áp dụng phân bổ cho ${selectingBatch.name}.`);
    closeDialog();
  };


  return (
    <section
      className="kitchen-meal-allocation"
      aria-labelledby="meal-allocation-heading"
    >
      <header className="kitchen-meal-allocation__header">
        <div>
          <div className="kitchen-meal-allocation__title">
            <span className="kitchen-meal-allocation__icon">
              <Archive size={17} aria-hidden="true" />
            </span>
            <h1 id="meal-allocation-heading">Phân bổ suất ăn</h1>
            <Chip
              size="small"
              label="Nhân viên bếp"
              className="kitchen-meal-allocation__role"
            />
          </div>
          <p>Phân bổ số suất từ các lô chế biến đến từng lớp học.</p>
        </div>

        <dl className="kitchen-meal-allocation__context">
          <div>
            <dt>Ngày:</dt>
            <dd>{dateFormatter.format(data.menuDay.menuDate)}</dd>
          </div>
        </dl>
      </header>

      <div className="kitchen-meal-allocation__tip">
        <span>
          Mẹo thao tác: Nhấp vào lô chế biến để mở danh sách lớp đã nhận hoặc
          thêm lớp mới.
        </span>
        <strong>Đang phân bổ theo luồng một chiều</strong>
      </div>

      <div className="kitchen-meal-allocation__batches">
        {view.batches.map((batch) => (
          <BatchAllocationPanel
            key={batch.id}
            batch={batch}
            expanded={batch.id === openBatchId}
            canAddClasses={
              batch.entries.length > 0 ||
              (view.classes.length > 0 && batch.remaining > 0)
            }
            onToggle={() =>
              setOpenBatchId((current) =>
                current === batch.id ? null : batch.id,
              )
            }
            onAddClasses={() => setSelectingBatchId(batch.id)}
          />
        ))}
      </div>

      {selectingBatch && (
        <SelectClassesDialog
          batch={selectingBatch}
          classes={draft.classes}
          dishName={data.dish.name}
          onClose={closeDialog}
          onApply={applySelection}
        />
      )}

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3500}
        onClose={() => setFeedback("")}
      >
        <Alert severity="success" onClose={() => setFeedback("")}>
          {feedback}
        </Alert>
      </Snackbar>
    </section>
  );
}
