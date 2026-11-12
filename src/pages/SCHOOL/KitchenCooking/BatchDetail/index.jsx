import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import { Alert, Button, Skeleton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import notice from "src/components/Notice";
import KitchenService from "src/services/KitchenService";
import { adaptBatchDetail, canRecordBatchSample } from "src/services/KitchenService/adapter";
import BatchDetailHeader from "./component/BatchDetailHeader";
import BatchInfoCard from "./component/BatchInfoCard";
import BatchIngredientsCard from "./component/BatchIngredientsCard";
import BatchTimelineCard from "./component/BatchTimelineCard";
import BatchActionsCard from "./component/BatchActionsCard";
import ConfirmBatchModal from "./component/ConfirmBatchModal";
import DeleteBatchModal from "./component/DeleteBatchModal";
import RetainedSampleModal from "./component/RetainedSampleModal";
import styles from "./index.module.scss";

export default function KitchenBatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(false);

  const fetchBatch = useCallback(
    async (signal) => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const rawBatch = await KitchenService.getBatchDetail(id, { signal });
        const adapted = adaptBatchDetail(rawBatch);
        setBatchData(adapted);

        // Tải thông tin mẫu lưu nếu mẻ đã hoàn thành
        if (adapted.status === "COMPLETED") {
          const samples = await KitchenService.getBatchSample(id, { signal });
          const sampleList = Array.isArray(samples)
            ? samples
            : samples
              ? [samples]
              : [];
          setSampleData(sampleList.length > 0 ? sampleList[0] : null);
          adapted.retainedFoodSamples = sampleList;
          setBatchData({ ...adapted });
          return { ...adapted };
        }
        setSampleData(null);
        return adapted;
      } catch (err) {
        if (!signal?.aborted) {
          setError(err.message || "Không thể tải thông tin lô chế biến.");
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchBatch(controller.signal);
    return () => controller.abort();
  }, [fetchBatch]);

  // Xử lý tạo lô chế biến (Chuyển sang CONFIRMED)
  const handleConfirmBatch = async () => {
    setActionLoading(true);
    try {
      await KitchenService.confirmBatch(id);
      notice({
        msg: "Xác nhận nấu thành công!",
        isSuccess: true,
      });
      setIsConfirmOpen(false);
      await fetchBatch();
    } catch (err) {
      notice({
        msg: err.message || "Không thể xác nhận nấu.",
        isSuccess: false,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý ghi nhận nấu xong (Chuyển sang COMPLETED) - Chạy trực tiếp không mở popup
  const handleCompleteBatch = async () => {
    setActionLoading(true);
    try {
      await KitchenService.completeBatch(id);
      notice({
        msg: "Ghi nhận nấu xong thành công!",
        isSuccess: true,
      });
      const completed = await fetchBatch();
      if (canRecordBatchSample(completed)) setIsSampleOpen(true);
    } catch (err) {
      notice({
        msg: err.message || "Không thể ghi nhận nấu xong.",
        isSuccess: false,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý xóa lô chế biến
  const handleDeleteBatch = async () => {
    setActionLoading(true);
    try {
      await KitchenService.deleteBatch(id);
      notice({
        msg: "Đã xóa lô chế biến thành công!",
        isSuccess: true,
      });
      setIsDeleteOpen(false);
      navigate(ROUTER.SCHOOL_KITCHEN_BATCHES);
    } catch (err) {
      notice({
        msg: err.message || "Không thể xóa lô chế biến.",
        isSuccess: false,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý lưu mẫu thực phẩm 24h
  const handleSaveSample = async (samplePayload) => {
    setActionLoading(true);
    try {
      const created = await KitchenService.createBatchSample(id, samplePayload);
      setSampleData(created);
      notice({
        msg: "Niêm phong lưu mẫu thực phẩm 24h thành công!",
        isSuccess: true,
      });
      setIsSampleOpen(false);
      const refreshed = await fetchBatch();
      if (canRecordBatchSample(refreshed)) setIsSampleOpen(true);
    } catch (err) {
      notice({
        msg: err.message || "Không thể ghi nhận lưu mẫu thực phẩm.",
        isSuccess: false,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.batchDetailPage} aria-busy="true">
        <div
          style={{
            padding: "96px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FoodPrintLoading />
        </div>
      </div>
    );
  }

  if (error || !batchData) {
    return (
      <div className={styles.batchDetailPage}>
        <div
          style={{
            padding: "32px 0",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => fetchBatch()}>
                Tải lại
              </Button>
            }
          >
            {error || "Không tìm thấy thông tin lô chế biến này."}
          </Alert>
          <div>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            >
              Quay lại danh sách lô
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.batchDetailPage}>
      {/* 1. Header Trang */}
      <BatchDetailHeader batchData={batchData} />

      {/* 2. Main Content Grid (8 Cols Left - 4 Cols Right trên Desktop, Stack trên Mobile) */}
      <div className={styles.contentGrid}>
        {/* CỘT TRÁI: Thông tin trọng tâm (Món ăn, số suất) & Nguyên liệu */}
        <div className={styles.leftCol}>
          {/* Thẻ 1: Thông tin lô chế biến (Món ăn, số suất, chế độ nấu) */}
          <BatchInfoCard batchData={batchData} />

          {/* Thẻ 2: Nguyên liệu sử dụng */}
          <BatchIngredientsCard ingredients={batchData.ingredients} />
        </div>

        {/* CỘT PHẢI: Tiến trình & Thao tác nghiệp vụ */}
        <div className={styles.rightCol}>
          {/* Thẻ 1: Tiến trình chế biến (3 bước gọn) */}
          <BatchTimelineCard
            status={batchData.status}
            batchCode={batchData.code}
          />

          {/* Thẻ 2: Thao tác nghiệp vụ (Nút bấm to rõ) */}
          <BatchActionsCard
            batchId={batchData.id}
            status={batchData.status}
            batchCode={batchData.code}
            dishName={batchData.dishName}
            hasSample={Boolean(sampleData)}
            allSamplesDone={
              batchData.dishes?.length > 1
                ? (batchData.retainedFoodSamples?.length || 0) >=
                  batchData.dishes.length
                : Boolean(sampleData)
            }
            sampledCount={
              batchData.retainedFoodSamples?.length || (sampleData ? 1 : 0)
            }
            totalDishes={batchData.dishes?.length || 1}
            onOpenConfirmModal={() => setIsConfirmOpen(true)}
            onOpenDeleteModal={() => setIsDeleteOpen(true)}
            onCompleteBatch={handleCompleteBatch}
            actionLoading={actionLoading}
            onOpenSampleModal={() => setIsSampleOpen(true)}
          />
        </div>
      </div>

      {/* 3. Modals */}
      <ConfirmBatchModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmBatch}
        batchData={batchData}
        loading={actionLoading}
      />

      <DeleteBatchModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteBatch}
        batchCode={batchData.code}
        loading={actionLoading}
      />

      <RetainedSampleModal
        isOpen={isSampleOpen}
        onClose={() => setIsSampleOpen(false)}
        onConfirm={handleSaveSample}
        batchData={batchData}
        loading={actionLoading}
      />
    </div>
  );
}
