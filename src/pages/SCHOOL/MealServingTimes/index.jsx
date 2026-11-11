import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Divider,
  Paper,
  Skeleton,
  TextField,
} from "@mui/material";
import {
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Truck,
  Utensils,
} from "lucide-react";
import notice from "src/components/Notice";
import SchoolService from "src/services/SchoolService";
import "./style.scss";

const STORAGE_KEY = "foodprint_receiving_times";
const errorMessage = (failure, fallback) =>
  failure?.response?.data?.message || fallback;

function MealServingTimes() {
  const [saved, setSaved] = useState({
    lunchTime: null,
    afternoonMealTime: null,
    deliverySlot1: null,
    deliverySlot2: null,
  });
  const [form, setForm] = useState({
    lunchTime: "",
    afternoonMealTime: "",
    deliverySlot1: "",
    deliverySlot2: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    SchoolService.getMealTimes()
      .then((response) => {
        if (!active) return;
        const mealData = response.data || {};
        let receivingData = { slot1: "06:00", slot2: "09:30" };
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            receivingData = JSON.parse(cached);
          }
        } catch {
          // fallback
        }

        const initialSaved = {
          lunchTime: mealData.lunchTime || null,
          afternoonMealTime: mealData.afternoonMealTime || null,
          deliverySlot1: receivingData.slot1 || null,
          deliverySlot2: receivingData.slot2 || null,
        };
        setSaved(initialSaved);
        setForm({
          lunchTime: initialSaved.lunchTime || "",
          afternoonMealTime: initialSaved.afternoonMealTime || "",
          deliverySlot1: initialSaved.deliverySlot1 || "",
          deliverySlot2: initialSaved.deliverySlot2 || "",
        });
      })
      .catch(
        (failure) =>
          active &&
          setError(errorMessage(failure, "Không thể tải khung giờ vận hành.")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const hasConfiguredDelivery = Boolean(
    saved.deliverySlot1 || saved.deliverySlot2,
  );
  const hasConfiguredMeals = Boolean(
    saved.lunchTime || saved.afternoonMealTime,
  );
  const hasConfigured = hasConfiguredDelivery || hasConfiguredMeals;

  const changedDelivery =
    (saved.deliverySlot1 || "") !== form.deliverySlot1 ||
    (saved.deliverySlot2 || "") !== form.deliverySlot2;
  const changedMeals =
    (saved.lunchTime || "") !== form.lunchTime ||
    (saved.afternoonMealTime || "") !== form.afternoonMealTime;
  const changed = changedDelivery || changedMeals;

  const orderedMeals =
    !form.lunchTime ||
    !form.afternoonMealTime ||
    form.lunchTime < form.afternoonMealTime;
  const orderedDelivery =
    !form.deliverySlot1 ||
    !form.deliverySlot2 ||
    form.deliverySlot1 < form.deliverySlot2;
  const canSave = !saving && changed && orderedMeals && orderedDelivery;

  const reset = () => {
    setForm({
      lunchTime: saved.lunchTime || "",
      afternoonMealTime: saved.afternoonMealTime || "",
      deliverySlot1: saved.deliverySlot1 || "",
      deliverySlot2: saved.deliverySlot2 || "",
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await SchoolService.updateMealTimes({
        lunchTime: form.lunchTime || null,
        afternoonMealTime: form.afternoonMealTime || null,
      });
      const nextReceiving = {
        slot1: form.deliverySlot1 || null,
        slot2: form.deliverySlot2 || null,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextReceiving));
      } catch {
        // fallback
      }

      const nextSaved = {
        lunchTime: response.data?.lunchTime || null,
        afternoonMealTime: response.data?.afternoonMealTime || null,
        deliverySlot1: nextReceiving.slot1,
        deliverySlot2: nextReceiving.slot2,
      };
      setSaved(nextSaved);
      notice({ msg: "Đã lưu khung giờ vận hành" });
    } catch (failure) {
      notice({
        msg: errorMessage(failure, "Không thể lưu khung giờ vận hành."),
        isSuccess: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="meal-times-page">
      <header>
        <h1>Khung giờ vận hành</h1>
      </header>

      {loading && <Skeleton variant="rounded" height={360} />}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Paper variant="outlined" className="meal-times-page__card">
          {/* Khối 1: Khung giờ nhận nguyên liệu */}
          <div className="meal-times-page__section">
            <div className="meal-times-page__section-header">
              <div className="meal-times-page__section-title">
                <Truck size={20} />
                <h2>Khung giờ nhận nguyên liệu</h2>
                {hasConfiguredDelivery && !changedDelivery && (
                  <span className="meal-times-page__badge success">
                    <CheckCircle2 size={13} />
                    <span>Đang áp dụng</span>
                  </span>
                )}
                {changedDelivery && (
                  <span className="meal-times-page__badge warning">
                    <AlertCircle size={13} />
                    <span>Chưa lưu thay đổi</span>
                  </span>
                )}
                {!hasConfiguredDelivery && !changedDelivery && (
                  <span className="meal-times-page__badge default">
                    <span>Chưa thiết lập</span>
                  </span>
                )}
              </div>
            </div>
            <div className="meal-times-page__fields">
              <TextField
                type="time"
                label="Đợt 1"
                value={form.deliverySlot1}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deliverySlot1: event.target.value,
                  }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="time"
                label="Đợt 2"
                value={form.deliverySlot2}
                disabled={saving}
                error={!orderedDelivery}
                helperText={
                  !orderedDelivery ? "Đợt 2 phải sau đợt 1" : undefined
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    deliverySlot2: event.target.value,
                  }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>
          </div>

          <Divider className="meal-times-page__divider" />

          {/* Khối 2: Khung giờ phục vụ bữa ăn */}
          <div className="meal-times-page__section">
            <div className="meal-times-page__section-header">
              <div className="meal-times-page__section-title">
                <Utensils size={20} />
                <h2>Khung giờ phục vụ bữa ăn</h2>
                {hasConfiguredMeals && !changedMeals && (
                  <span className="meal-times-page__badge success">
                    <CheckCircle2 size={13} />
                    <span>Đang áp dụng</span>
                  </span>
                )}
                {changedMeals && (
                  <span className="meal-times-page__badge warning">
                    <AlertCircle size={13} />
                    <span>Chưa lưu thay đổi</span>
                  </span>
                )}
                {!hasConfiguredMeals && !changedMeals && (
                  <span className="meal-times-page__badge default">
                    <span>Chưa thiết lập</span>
                  </span>
                )}
              </div>
            </div>
            <div className="meal-times-page__fields">
              <TextField
                type="time"
                label="Bữa trưa"
                value={form.lunchTime}
                disabled={saving}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lunchTime: event.target.value,
                  }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="time"
                label="Bữa phụ"
                value={form.afternoonMealTime}
                disabled={saving}
                error={!orderedMeals}
                helperText={
                  !orderedMeals ? "Bữa phụ phải sau bữa trưa" : undefined
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    afternoonMealTime: event.target.value,
                  }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>
          </div>

          {/* Thanh điều khiển cuối thẻ */}
          <div className="meal-times-page__footer">
            <div className="meal-times-page__status-info">
              {!changed && hasConfigured && (
                <span className="meal-times-page__status-text success">
                  <CheckCircle2 size={16} /> Toàn bộ khung giờ vận hành hiện tại
                  đã được cấu hình và đang áp dụng.
                </span>
              )}
              {changed && (
                <span className="meal-times-page__status-text warning">
                  <AlertCircle size={16} /> Có thay đổi chưa lưu. Nhấn "Lưu cấu
                  hình" để áp dụng cho vận hành toàn trường.
                </span>
              )}
              {!hasConfigured && !changed && (
                <span>
                  Để trống ca mà trường không tổ chức. Thay đổi áp dụng cho các
                  kế hoạch sau khi lưu.
                </span>
              )}
            </div>
            <div className="meal-times-page__actions">
              {changed && (
                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={saving}
                  startIcon={<RotateCcw size={15} />}
                  onClick={reset}
                >
                  Hủy thay đổi
                </Button>
              )}
              <Button
                variant="contained"
                disabled={
                  saving || !changed || !orderedMeals || !orderedDelivery
                }
                onClick={save}
                startIcon={
                  !changed && hasConfigured ? (
                    <CheckCircle2 size={16} />
                  ) : undefined
                }
              >
                {saving
                  ? "Đang lưu..."
                  : !changed && hasConfigured
                    ? "Đã lưu cấu hình"
                    : "Lưu cấu hình"}
              </Button>
            </div>
          </div>
        </Paper>
      )}
    </div>
  );
}

export default MealServingTimes;
