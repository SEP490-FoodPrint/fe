import React, { useContext, useEffect, useState } from "react";
import {
  Alert, Button, Chip, CircularProgress, MenuItem, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { StoreContext } from "src/contexts";
import { ROLES } from "src/constants/roles";
import notice from "src/components/Notice";
import ComplaintService from "src/services/ComplaintService";
import ComplaintDrawer from "./component/ComplaintDrawer";
import ComplaintDetail from "./component/ComplaintDetail";
import { complaintStatuses, complaintTypes, errorMessage, formatMealDate, formatTimestamp, mealLabels } from "./labels";
import styles from "./MealComplaints.module.scss";

export default function MealComplaints() {
  const { userStore } = useContext(StoreContext);
  const isTeacher = userStore?.user?.role === ROLES.HOMEROOM_TEACHER;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadVersion, setLoadVersion] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError("");
    ComplaintService.list({ page, limit: 10, status: status || undefined, complaintType: type || undefined }, controller.signal)
      .then(({ data }) => { if (!controller.signal.aborted) setResult(data); })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(errorMessage(failure, "Không tải được danh sách khiếu nại."));
      });
    return () => controller.abort();
  }, [page, status, type, loadVersion]);

  function created() {
    setShowForm(false);
    setPage(1);
    setStatus("");
    setType("");
    setLoadVersion((version) => version + 1);
    notice({ msg: "Đã gửi khiếu nại", isSuccess: true });
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Khiếu nại bữa ăn</h1>
          <p>Gửi khiếu nại và theo dõi phản hồi của Ban Giám hiệu.</p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>Gửi khiếu nại</Button>
      </header>
      <Paper variant="outlined" className={styles.panel}>
        <div className={styles.listHeader}>
          <h2>Khiếu nại của tôi</h2>
          <div className={styles.filters}>
            <TextField select size="small" label="Trạng thái" value={status}
              onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(complaintStatuses).map(([key, item]) => <MenuItem key={key} value={key}>{item.label}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Loại khiếu nại" value={type}
              onChange={(event) => { setType(event.target.value); setPage(1); }}>
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(complaintTypes).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
            </TextField>
          </div>
        </div>
        {!result && !error && <div className={styles.empty}><CircularProgress size={24} aria-label="Đang tải khiếu nại" /></div>}
        {error && <Alert severity="error" action={<Button color="inherit" onClick={() => setLoadVersion((version) => version + 1)}>Thử lại</Button>}>{error}</Alert>}
        {result?.items.length === 0 && <p className={styles.empty}>{status || type ? "Không có khiếu nại phù hợp." : "Bạn chưa gửi khiếu nại nào."}</p>}
        {!!result?.items.length && (
          <>
            <TableContainer className={styles.desktop}>
              <Table aria-label="Khiếu nại của tôi">
                <TableHead>
                  <TableRow>
                    {!isTeacher && <TableCell>Lớp</TableCell>}
                    <TableCell>Ngày ăn</TableCell><TableCell>Bữa ăn</TableCell><TableCell>Loại khiếu nại</TableCell>
                    <TableCell>Trạng thái</TableCell><TableCell>Thời gian gửi</TableCell><TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.items.map((item) => (
                    <TableRow key={item.id} hover>
                      {!isTeacher && <TableCell>{item.meal.className}</TableCell>}
                      <TableCell>{formatMealDate(item.meal.mealDate)}</TableCell>
                      <TableCell>{mealLabels[item.meal.mealType]}</TableCell>
                      <TableCell>
                        {complaintTypes[item.complaintType]}
                        <span className={styles.preview}>{item.description}</span>
                      </TableCell>
                      <TableCell><Chip size="small" {...complaintStatuses[item.status]} /></TableCell>
                      <TableCell>{formatTimestamp(item.submittedAt)}</TableCell>
                      <TableCell align="right"><Button endIcon={<ChevronRightIcon />} onClick={() => setSelectedId(item.id)}>Chi tiết</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <ul className={styles.mobile}>
              {result.items.map((item) => (
                <li key={item.id}>
                  <div className={styles.cardHeading}>
                    <strong>{complaintTypes[item.complaintType]}</strong>
                    <Chip size="small" {...complaintStatuses[item.status]} />
                  </div>
                  <span>{!isTeacher && `${item.meal.className} · `}{mealLabels[item.meal.mealType]} · {formatMealDate(item.meal.mealDate)}</span>
                  <span className={styles.preview}>{item.description}</span>
                  <div className={styles.cardHeading}>
                    <small>{formatTimestamp(item.submittedAt)}</small>
                    <Button endIcon={<ChevronRightIcon />} onClick={() => setSelectedId(item.id)}>Chi tiết</Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {result && (page > 1 || result.pagination.hasNext) && (
          <nav aria-label="Phân trang khiếu nại" className={styles.pagination}>
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
            <span>Trang {page}</span>
            <Button disabled={!result.pagination.hasNext} onClick={() => setPage(page + 1)}>Tiếp theo</Button>
          </nav>
        )}
      </Paper>
      {showForm && <ComplaintDrawer isTeacher={isTeacher} onCreated={created} onClose={() => setShowForm(false)} />}
      {selectedId && <ComplaintDetail key={selectedId} id={selectedId} isTeacher={isTeacher} onClose={() => setSelectedId(null)} />}
    </main>
  );
}
