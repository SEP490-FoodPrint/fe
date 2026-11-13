import React, { useEffect, useState } from "react";
import {
  Alert, Button, CircularProgress, Drawer, FormControl, FormControlLabel,
  FormLabel, MenuItem, Radio, RadioGroup, TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import ComplaintService from "src/services/ComplaintService";
import { complaintTypes, errorMessage, formatMealDate, mealLabels } from "../labels";
import styles from "./ComplaintDrawer.module.scss";

const mealChoices = [["lunch", "LUNCH"], ["afternoon", "AFTERNOON"]];

export default function ComplaintDrawer({ isTeacher, onClose, onCreated }) {
  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadVersion, setLoadVersion] = useState(0);
  const [classId, setClassId] = useState("");
  const [mealId, setMealId] = useState("");
  const [complaintType, setComplaintType] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    ComplaintService.mealOptions(controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted) setOptions(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setOptionsError(errorMessage(error, "Không tải được danh sách bữa ăn."));
      });
    return () => controller.abort();
  }, [loadVersion]);

  const selectedClass = isTeacher ? options?.classes[0] : options?.classes.find((item) => item.classId === classId);
  const eligible = mealChoices.some(([key]) =>
    selectedClass?.[key]?.canComplain && selectedClass[key].dailyMealPortionId === mealId,
  );
  const canSubmit = eligible && complaintType && description.trim().length >= 10 && !saving;

  function reloadOptions() {
    setOptions(null);
    setOptionsError("");
    setMealId("");
    setLoadVersion((version) => version + 1);
  }

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setSubmitError("");
    try {
      await ComplaintService.create({ dailyMealPortionId: mealId, complaintType, description: description.trim() });
      onCreated();
    } catch (error) {
      setSubmitError(errorMessage(error, "Không thể gửi khiếu nại."));
      if ([404, 409].includes(error.response?.status)) reloadOptions();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer anchor="right" open onClose={saving ? undefined : onClose}
      slotProps={{ paper: { className: styles.drawer, role: "dialog", "aria-labelledby": "create-complaint-title" } }}>
      <form className={styles.form} onSubmit={submit}>
        <header className={styles.header}>
          <h2 id="create-complaint-title">Gửi khiếu nại bữa ăn</h2>
          <IconButton aria-label="Đóng" onClick={onClose} disabled={saving}><CloseIcon /></IconButton>
        </header>
        <div className={styles.content}>
          {!options && !optionsError && <CircularProgress size={24} aria-label="Đang tải bữa ăn" />}
          {optionsError && <Alert severity="error" action={<Button color="inherit" onClick={reloadOptions}>Thử lại</Button>}>{optionsError}</Alert>}
          {submitError && <Alert severity="error">{submitError}</Alert>}
          {options && (
            <>
              <TextField label="Ngày ăn" value={formatMealDate(options.mealDate)} slotProps={{ input: { readOnly: true } }} />
              {!isTeacher && (
                <TextField select label="Lớp" value={selectedClass?.classId ?? ""} disabled={saving || !options.classes.length}
                  helperText={options.classes.length ? undefined : "Chưa có lớp để chọn."}
                  onChange={(event) => { setClassId(event.target.value); setMealId(""); }}>
                  {options.classes.map((item) => <MenuItem key={item.classId} value={item.classId}>{item.className}</MenuItem>)}
                </TextField>
              )}
              {selectedClass && (
                <FormControl component="fieldset">
                  <FormLabel component="legend">Bữa ăn</FormLabel>
                  <RadioGroup className={styles.meals} value={mealId} onChange={(event) => setMealId(event.target.value)}>
                    {mealChoices.map(([key, type]) => {
                      const meal = selectedClass[key];
                      return (
                        <div key={key} className={styles.meal}>
                          <FormControlLabel value={meal?.dailyMealPortionId ?? key} control={<Radio />}
                            label={mealLabels[type]} disabled={saving || !meal?.canComplain} />
                          {!meal?.canComplain && <small>{meal ? "Chưa xác nhận giao" : "Chưa có bữa"}</small>}
                        </div>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              )}
            </>
          )}
          <TextField select label="Loại khiếu nại" value={complaintType} disabled={saving}
            onChange={(event) => setComplaintType(event.target.value)}>
            {Object.entries(complaintTypes).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
          </TextField>
          <TextField label="Nội dung khiếu nại" multiline minRows={4} value={description} disabled={saving}
            onChange={(event) => setDescription(event.target.value)} slotProps={{ htmlInput: { maxLength: 2000 } }}
            helperText={`${description.length}/2.000 ký tự · Tối thiểu 10 ký tự`} />
        </div>
        <footer className={styles.footer}>
          <Button onClick={onClose} disabled={saving}>Hủy</Button>
          <Button variant="contained" type="submit" disabled={!canSubmit}>{saving ? "Đang gửi…" : "Gửi khiếu nại"}</Button>
        </footer>
      </form>
    </Drawer>
  );
}
