import { Button } from "@mui/material";
import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import ROUTER from "src/router/ROUTER";
import styles from "./AllocationGate.module.scss";

const actions = {
  COOKING: { label: "Đến trang nấu ăn", path: ROUTER.SCHOOL_KITCHEN_BATCHES },
  SAMPLES: { label: "Đến trang lưu mẫu thực phẩm", path: ROUTER.SCHOOL_KITCHEN_SAMPLES },
};

export default function AllocationGate({ data, onRetry }) {
  if (!data) return null;
  const action = actions[data.action];
  return (
    <div className={styles.blocker} role="status">
      {data.status !== "EMPTY" && <LockKeyhole size={20} aria-hidden="true" />}
      <div>
        <strong>{data.message}</strong>
        {data.status === "SAMPLES_PENDING" && <p>{data.missingSampleBatches} lô còn thiếu mẫu.</p>}
        {data.status !== "EMPTY" && data.totals && (
          <p>{data.totals.sampled ?? 0}/{data.totals.finalized ?? 0} suất đã lưu mẫu đầy đủ</p>
        )}
      </div>
      {action && <Button className={styles.action} component={Link} to={action.path} variant="contained">{action.label}</Button>}
      {data.action === "RETRY" && <Button className={styles.action} onClick={onRetry}>Kiểm tra lại</Button>}
    </div>
  );
}
