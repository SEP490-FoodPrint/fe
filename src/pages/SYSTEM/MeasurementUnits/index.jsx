import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import service from "src/services/MeasurementUnitService";
import notice from "src/components/Notice";
import UnitForm from "./component/UnitForm";
import styles from "./MeasurementUnits.module.scss";
export const groups = {
  MASS: "Khối lượng",
  VOLUME: "Thể tích",
  COUNT: "Đếm",
  OTHER: "Khác",
};
export default function MeasurementUnits() {
  const [search, setSearch] = useState(""),
    [group, setGroup] = useState(""),
    [status, setStatus] = useState("ALL"),
    [page, setPage] = useState(1),
    [data, setData] = useState({ items: [], pagination: { totalPages: 0 } }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0),
    [editing, setEditing] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(
      () =>
        service
          .list(
            {
              page,
              limit: 20,
              status,
              ...(search.trim() ? { search: search.trim() } : {}),
              ...(group ? { group } : {}),
            },
            controller.signal,
          )
          .then((result) => {
            if (!controller.signal.aborted) {
              setData(result);
              setError("");
            }
          })
          .catch((e) => {
            if (!controller.signal.aborted)
              setError(e.message || "Không tải được đơn vị tính");
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          }),
      250,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [page, search, group, status, version]);
  const filter = (setter, value) => {
    setter(value);
    setPage(1);
  };
  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1>Đơn vị tính</h1>
          <p>Quản lý danh mục dùng chung và bước số lượng khuyến nghị.</p>
        </div>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setEditing({})}
        >
          Thêm đơn vị
        </Button>
      </header>
      <Alert severity="info">
        Bước số lượng khuyến nghị — không bắt buộc làm tròn khi nhập hàng. Mã,
        ký hiệu và nhóm không đổi sau khi tạo.
      </Alert>
      <div className={styles.filters}>
        <TextField
          label="Tìm đơn vị"
          value={search}
          onChange={(e) => filter(setSearch, e.target.value)}
        />
        <TextField
          select
          label="Nhóm"
          value={group}
          onChange={(e) => filter(setGroup, e.target.value)}
        >
          <MenuItem value="">Tất cả nhóm</MenuItem>
          {Object.entries(groups).map(([key, name]) => (
            <MenuItem key={key} value={key}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Trạng thái"
          value={status}
          onChange={(e) => filter(setStatus, e.target.value)}
        >
          <MenuItem value="ALL">Tất cả</MenuItem>
          <MenuItem value="ACTIVE">Đang dùng</MenuItem>
          <MenuItem value="INACTIVE">Ngừng dùng</MenuItem>
        </TextField>
      </div>
      {error && (
        <Alert
          severity="error"
          action={
            <Button onClick={() => setVersion((v) => v + 1)}>Thử lại</Button>
          }
        >
          {error}
        </Alert>
      )}
      {loading ? (
        <Box className={styles.loading}>
          <CircularProgress aria-label="Đang tải đơn vị" />
        </Box>
      ) : (
        <>
          <div className={styles.desktop}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Tên đơn vị",
                    "Ký hiệu",
                    "Nhóm",
                    "Trạng thái",
                    "Thao tác",
                  ].map((label) => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.symbol}</TableCell>
                    <TableCell>{groups[unit.group]}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          unit.status === "ACTIVE" ? "Đang dùng" : "Ngừng dùng"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => setEditing(unit)}>
                        Chỉnh sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className={styles.mobile}>
            {data.items.map((unit) => (
              <article key={unit.id}>
                <strong>
                  {unit.name} ({unit.symbol})
                </strong>
                <p>{groups[unit.group]}</p>
                <p>{unit.status === "ACTIVE" ? "Đang dùng" : "Ngừng dùng"}</p>
                <Button onClick={() => setEditing(unit)}>Chỉnh sửa</Button>
              </article>
            ))}
          </div>
          {!data.items.length && <p>Không có đơn vị phù hợp.</p>}
          <Pagination
            page={page}
            count={Math.max(1, data.pagination.totalPages)}
            onChange={(_e, p) => setPage(p)}
          />
        </>
      )}
      {editing && (
        <UnitForm
          unit={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setVersion((v) => v + 1);
            notice({ msg: "Đã lưu đơn vị tính", isSuccess: true });
          }}
        />
      )}
    </main>
  );
}
