import React, { useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import styles from "./HolidayEditor.module.scss";

const blank = { mode: "single", startDate: "", endDate: "", reason: "" };
const displayDate = (value) =>
  value ? value.split("-").reverse().join("/") : "—";
const displayPeriod = (holiday) =>
  holiday.startDate === holiday.endDate
    ? displayDate(holiday.startDate)
    : `${displayDate(holiday.startDate)} – ${displayDate(holiday.endDate)}`;
const dayCount = (startDate, endDate) =>
  !startDate || !endDate
    ? 0
    : Math.round(
        (new Date(`${endDate}T00:00:00Z`) -
          new Date(`${startDate}T00:00:00Z`)) /
          86400000,
      ) + 1;

function HolidayEditor({ active, holidays, startDate, endDate, disabled, onChange }) {
  const [dialog, setDialog] = useState(null);
  const [draft, setDraft] = useState(blank);
  const openCreate = () => {
    setDraft(blank);
    setDialog({ index: -1 });
  };
  const openEdit = (index) => {
    const holiday = holidays[index];
    setDraft({
      ...holiday,
      mode: holiday.startDate === holiday.endDate ? "single" : "range",
    });
    setDialog({ index });
  };
  const draftEndDate =
    draft.mode === "single" ? draft.startDate : draft.endDate;
  const outsideAcademicYear = Boolean(
    draft.startDate &&
    draftEndDate &&
    (draft.startDate < startDate || draftEndDate > endDate),
  );
  const reversedRange = Boolean(
    draft.startDate && draftEndDate && draft.startDate > draftEndDate,
  );
  const overlap = holidays.some(
    (item, index) =>
      index !== dialog?.index &&
      draft.startDate &&
      draftEndDate &&
      draft.startDate <= item.endDate &&
      draftEndDate >= item.startDate,
  );
  const valid =
    draft.startDate &&
    draftEndDate &&
    draft.reason.trim() &&
    !outsideAcademicYear &&
    !reversedRange &&
    !overlap;
  const save = () => {
    if (!valid) return;
    const next = [...holidays];
    const value = {
      startDate: draft.startDate,
      endDate: draftEndDate,
      reason: draft.reason.trim(),
    };
    if (dialog.index < 0) next.push(value);
    else next[dialog.index] = value;
    next.sort((a, b) => a.startDate.localeCompare(b.startDate));
    onChange(next);
    setDialog(null);
  };
  const remove = (index) =>
    onChange(holidays.filter((_, itemIndex) => itemIndex !== index));
  const rangeError = overlap
    ? "Khoảng này trùng với một kỳ nghỉ đã có."
    : outsideAcademicYear
      ? "Kỳ nghỉ phải nằm trong khoảng niên khóa."
      : reversedRange
        ? "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu."
        : " ";

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div>
          <h2>Danh sách kỳ nghỉ</h2>
          <p>
            Khai báo một ngày hoặc một khoảng ngày nghỉ liên tục của toàn
            trường.
          </p>
        </div>
        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          disabled={disabled || !startDate || !endDate}
          onClick={openCreate}
        >
          Thêm kỳ nghỉ
        </Button>
      </div>
      {!holidays.length ? (
        <div className={styles.empty}>
          <EventBusyOutlinedIcon />
          <div>
            <strong>Chưa có kỳ nghỉ</strong>
            <p>Thêm ngày nghỉ lễ, nghỉ Tết hoặc một khoảng nghỉ liên tục.</p>
          </div>
        </div>
      ) : (
        <>
          <TableContainer className={styles.table}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian nghỉ</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.map((holiday, index) => (
                  <TableRow key={`${holiday.startDate}-${holiday.endDate}`}>
                    <TableCell className={styles.date}>
                      <strong>{displayPeriod(holiday)}</strong>
                      <span className={styles.dayBadge}>
                        {dayCount(holiday.startDate, holiday.endDate)} ngày
                      </span>
                    </TableCell>
                    <TableCell>{holiday.reason}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Sửa kỳ nghỉ">
                        <IconButton
                          size="small"
                          disabled={disabled}
                          onClick={() => openEdit(index)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa khỏi bản nháp">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={disabled}
                          onClick={() => remove(index)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className={styles.cards}>
            {holidays.map((holiday, index) => (
              <article key={`${holiday.startDate}-${holiday.endDate}`}>
                <div>
                  <strong>{displayPeriod(holiday)}</strong>
                  <span>
                    {dayCount(holiday.startDate, holiday.endDate)} ngày
                  </span>
                  <p>{holiday.reason}</p>
                </div>
                <div>
                  <IconButton
                    aria-label="Sửa kỳ nghỉ"
                    disabled={disabled}
                    onClick={() => openEdit(index)}
                  >
                    <EditOutlinedIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Xóa khỏi bản nháp"
                    color="error"
                    disabled={disabled}
                    onClick={() => remove(index)}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <Dialog
        open={active && Boolean(dialog)}
        onClose={() => !disabled && setDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog?.index < 0 ? "Thêm kỳ nghỉ" : "Sửa kỳ nghỉ"}
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={draft.mode}
            onChange={(_, mode) =>
              mode &&
              setDraft((current) => ({
                ...current,
                mode,
                endDate:
                  mode === "single" ? current.startDate : current.endDate,
              }))
            }
            aria-label="Số ngày nghỉ"
          >
            <ToggleButton value="single">Một ngày</ToggleButton>
            <ToggleButton value="range">Nhiều ngày</ToggleButton>
          </ToggleButtonGroup>
          <div
            className={draft.mode === "range" ? styles.dateFields : undefined}
          >
            <TextField
              fullWidth
              type="date"
              label={draft.mode === "single" ? "Ngày nghỉ" : "Từ ngày"}
              value={draft.startDate}
              disabled={disabled}
              slotProps={{
                htmlInput: { min: startDate, max: endDate },
                inputLabel: { shrink: true },
              }}
              error={outsideAcademicYear || overlap}
              helperText={draft.mode === "single" ? rangeError : " "}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  startDate: event.target.value,
                  endDate:
                    current.mode === "single"
                      ? event.target.value
                      : current.endDate,
                }))
              }
            />
            {draft.mode === "range" && (
              <TextField
                fullWidth
                type="date"
                label="Đến ngày"
                value={draft.endDate}
                disabled={disabled}
                slotProps={{
                  htmlInput: { min: draft.startDate || startDate, max: endDate },
                  inputLabel: { shrink: true },
                }}
                error={outsideAcademicYear || reversedRange || overlap}
                helperText={rangeError}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            )}
          </div>
          {valid && draft.mode === "range" && (
            <p className={styles.duration}>
              Tổng thời gian nghỉ:{" "}
              <strong>{dayCount(draft.startDate, draftEndDate)} ngày</strong>
            </p>
          )}
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Lý do"
            value={draft.reason}
            disabled={disabled}
            slotProps={{ htmlInput: { maxLength: 255 } }}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                reason: event.target.value,
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={disabled} onClick={() => setDialog(null)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={disabled || !valid}
            onClick={save}
          >
            Lưu kỳ nghỉ
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

HolidayEditor.propTypes = {
  holidays: PropTypes.arrayOf(
    PropTypes.shape({
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      reason: PropTypes.string.isRequired,
    }),
  ).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
export default HolidayEditor;
