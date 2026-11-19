import InlineError from "src/components/InlineError";
import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getDeliveryInspections,
  getDeliveryInspection,
  decideDeliveryInspection,
  lookupDeliveryByCode,
  confirmDeliveryArrival,
} from "src/services/DeliveryInspectionService";
import useConfirmAction from "src/pages/SCHOOL/KitchenCooking/CreateBatch/component/useConfirmAction";
import DeliveryQrScanModal from "./component/DeliveryQrScanModal";
import DeliveryHeader from "./component/DeliveryHeader";
import DeliveryKPICards from "./component/DeliveryKPICards";
import DeliveryFilterStrip from "./component/DeliveryFilterStrip";
import DeliveryTableView from "./component/DeliveryTableView";
import DeliveryMobileCards from "./component/DeliveryMobileCards";
import DeliveryEmptyState from "./component/DeliveryEmptyState";
import DeliveryDetailView from "./component/DeliveryDetailView";
import DeliveryApprovalModal from "./component/DeliveryApprovalModal";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import styles from "./index.module.scss";

const getTodayDateString = () => {
  const now = new Date();
  const offset = 7 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset).toISOString().slice(0, 10);
};

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export default function IngredientInspect() {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryForApproval, setDeliveryForApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [cancelToast, setCancelToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(getTodayDateString);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanSearching, setScanSearching] = useState(false);
  const [scanError, setScanError] = useState("");
  const selectionRevision = useRef(0);
  const { confirm, element: confirmDialog } = useConfirmAction();
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    statusFilter !== "ALL" ||
    (dateFilter && dateFilter !== getTodayDateString()),
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      const query = { page, limit: 20 };
      if (searchTerm.trim()) query.search = searchTerm.trim();
      if (statusFilter !== "ALL") query.status = statusFilter;
      if (dateFilter) query.date = dateFilter;
      getDeliveryInspections(query, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) {
            setDeliveries(data.items);
            setStats(data.stats);
            setPagination(data.pagination);
          }
        })
        .catch((failure) => {
          if (!controller.signal.aborted)
            setError(failure.message || "Không tải được đợt giao.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, statusFilter, dateFilter, page, revision]);

  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => setSuccessToast(""), 6000);
    return () => clearTimeout(timer);
  }, [successToast]);
  useEffect(
    () => () => {
      selectionRevision.current++;
    },
    [],
  );
  const changeFilter = (setter) => (value) => {
    setter(value);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDateFilter(getTodayDateString());
    setPage(1);
  };

  const openDelivery = async (delivery) => {
    const version = ++selectionRevision.current;
    setDetailLoading(true);
    setError("");
    try {
      const data = await getDeliveryInspection(delivery.id);
      if (version === selectionRevision.current) setSelectedDelivery(data);
      return data;
    } catch (failure) {
      if (version === selectionRevision.current) setError(failure.message);
    } finally {
      if (version === selectionRevision.current) setDetailLoading(false);
    }
    return null;
  };

  // Xác nhận xe đã đến trường: chỉ vai trò kiểm nhận chính (PRIMARY) mới được xác nhận.
  const askConfirmArrival = (delivery) => {
    if (!delivery || delivery.status !== "IN_TRANSIT") return;
    if (delivery.canConfirmArrival === false) return;
    const vehicle = delivery.vehiclePlate
      ? `xe ${delivery.vehiclePlate}`
      : "xe giao";
    confirm({
      title: "Xác nhận xe đã đến?",
      message: `Xác nhận ${vehicle} của ${delivery.supplierName || "nhà cung cấp"} (${delivery.deliveryNo}) đã đến trường. Sau đó các bộ phận bắt đầu kiểm tra.`,
      confirmText: "Xe đã đến",
      onConfirm: async () => {
        const version = selectionRevision.current;
        setError("");
        try {
          const result = await confirmDeliveryArrival(delivery.id);
          if (version === selectionRevision.current)
            setSelectedDelivery(result);
          setRevision((value) => value + 1);
          setCancelToast(Boolean(result.receiptIssue));
          setSuccessToast(
            result.receiptIssue
              ? `Đã ghi nhận xe đến, nhưng đợt giao chưa thể tiếp nhận: ${result.receiptIssue}`
              : "Đã ghi nhận xe đến trường. Các bộ phận có thể bắt đầu kiểm tra.",
          );
        } catch (failure) {
          setError(
            failure?.response?.data?.message ||
              failure.message ||
              "Không xác nhận được xe đến.",
          );
        }
      },
    });
  };

  // Quét tem QR khi xe tới: tìm đúng xe giao của trường rồi mở chi tiết để kiểm tra.
  const handleScanCode = async (code) => {
    setScanSearching(true);
    setScanError("");
    try {
      const found = await lookupDeliveryByCode(code);
      setScanOpen(false);
      const detail = await openDelivery(found);
      // Quét tem khi xe tới cổng: hỏi xác nhận xe đến ngay nếu xe đang trên đường và người quét là vai trò chính.
      if (detail?.status === "IN_TRANSIT" && detail?.canConfirmArrival) askConfirmArrival(detail);
    } catch (failure) {
      setScanError(failure.message || "Không tìm thấy xe giao với mã này.");
    } finally {
      setScanSearching(false);
    }
  };

  const submitApproval = async (decision, reason, photo) => {
    if (!deliveryForApproval) return;
    const version = selectionRevision.current;
    const result = await decideDeliveryInspection(
      deliveryForApproval.id,
      decision,
      reason,
      photo,
    );
    setDeliveryForApproval(null);
    setCancelToast(Boolean(result.cancellationNotice));
    setRevision((value) => value + 1);
    setSelectedDelivery((previous) =>
      previous ? { ...previous, ...result } : previous,
    );
    setSuccessToast(
      result.cancellationNotice ||
        (result.status === "RECEIVED"
          ? "Đủ các bộ phận bắt buộc đồng ý. Đợt giao đã được tiếp nhận."
          : decision === "REJECT"
            ? (deliveryForApproval.currentTier === "OPTIONAL"
                ? "Đã lưu ý kiến không đồng ý của bạn (ý kiến tham khảo, không từ chối đợt giao)."
                : "Đã từ chối đợt giao. Cần giao lại và kiểm tra mới.")
            : "Đã lưu quyết định của bộ phận bạn. Đang chờ các bên còn lại."),
    );
    // The decision is committed; a failed detail refresh must not look like a failed write.
    try {
      const refreshed = await getDeliveryInspection(deliveryForApproval.id);
      if (version === selectionRevision.current) setSelectedDelivery(refreshed);
    } catch (failure) {
      setError(
        `Đã lưu quyết định; chưa tải lại được chi tiết: ${failure.message}`,
      );
    }
  };

  const totalItems = pagination?.totalItems ?? deliveries.length;
  const limit = pagination?.limit || 20;
  const totalPages =
    pagination?.totalPages || Math.max(1, Math.ceil(totalItems / limit));

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, totalPages]);

  const fromItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const toItem = Math.min(page * limit, totalItems);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className={styles.pageContainer}>
      {successToast && (
        <div
          className={`${styles.toastSuccess} ${cancelToast ? styles.toastCancellation : ""}`}
          role={cancelToast ? "alert" : "status"}
        >
          <div className={styles.toastContent}>
            {cancelToast ? (
              <AlertTriangle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast("")}
            aria-label="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      )}
      <InlineError
        messages={error}
        onRetry={() => {
          setRevision((value) => value + 1);
          if (selectedDelivery) openDelivery(selectedDelivery);
        }}
      />
      <DeliveryQrScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onSubmitCode={handleScanCode}
        searching={scanSearching}
        error={scanError}
      />
      {selectedDelivery ? (
        <DeliveryDetailView
          delivery={selectedDelivery}
          onBack={() => {
            selectionRevision.current++;
            setSelectedDelivery(null);
          }}
          onOpenApprovalModal={setDeliveryForApproval}
          onConfirmArrival={askConfirmArrival}
        />
      ) : (
        <div className={styles.viewContent}>
          <DeliveryHeader
            onScan={() => {
              setScanError("");
              setScanOpen(true);
            }}
          />
          {!loading && !error && <DeliveryKPICards stats={stats} />}
          <DeliveryFilterStrip
            searchTerm={searchTerm}
            onSearchChange={changeFilter(setSearchTerm)}
            statusFilter={statusFilter}
            onStatusChange={changeFilter(setStatusFilter)}
            dateFilter={dateFilter}
            onDateChange={changeFilter(setDateFilter)}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
          {loading ? (
            <div className={styles.loadingWrap} role="status">
              <FoodPrintLoading />
              <p>Đang tải các đợt giao từ hệ thống…</p>
            </div>
          ) : (
            !error &&
            (deliveries.length ? (
              <>
                <div className={styles.desktopViewWrap}>
                  <DeliveryTableView
                    deliveries={deliveries}
                    onSelectDelivery={openDelivery}
                  />
                </div>
                <div className={styles.mobileViewWrap}>
                  <DeliveryMobileCards
                    deliveries={deliveries}
                    onSelectDelivery={openDelivery}
                  />
                </div>
                <div className={styles.paginationLeftWrap}>
                  <div className={styles.paginationInfo}>
                    Hiển thị{" "}
                    <strong>
                      {fromItem}–{toItem}
                    </strong>{" "}
                    trên <strong>{totalItems}</strong> đợt giao
                  </div>
                  {totalPages > 1 && (
                    <div className={styles.paginationControls}>
                      <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((value) => Math.max(1, value - 1))
                        }
                        aria-label="Trang trước"
                      >
                        <ChevronLeft size={16} />
                        <span>Trước</span>
                      </button>

                      <div className={styles.pagePills}>
                        {pageNumbers.map((item, idx) =>
                          item === "..." ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className={styles.pageEllipsis}
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={`page-${item}`}
                              type="button"
                              className={`${styles.pageNumberBtn} ${item === page ? styles.activePageNumber : ""}`}
                              onClick={() => setPage(item)}
                              aria-current={item === page ? "page" : undefined}
                            >
                              {item}
                            </button>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        className={styles.pageBtn}
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPage((value) => Math.min(totalPages, value + 1))
                        }
                        aria-label="Trang sau"
                      >
                        <span>Sau</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <DeliveryEmptyState
                onResetFilters={hasActiveFilters ? resetFilters : null}
              />
            ))
          )}
        </div>
      )}
      {confirmDialog}
      {deliveryForApproval && (
        <DeliveryApprovalModal
          delivery={deliveryForApproval}
          onClose={() => setDeliveryForApproval(null)}
          onSubmitApproval={submitApproval}
        />
      )}
    </div>
  );
}
