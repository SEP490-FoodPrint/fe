import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, Button, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material"
import { FlaskConical, ArrowLeft, Trash2, Check, Clock } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import notice from "src/components/Notice"
import KitchenService from "src/services/KitchenService"
import styles from "./index.module.scss"

export default function KitchenSamples() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [samples, setSamples] = useState([])
  const [selectedSample, setSelectedSample] = useState(null)
  const [disposeNote, setDisposeNote] = useState("Tiêu hủy mẫu sau khi hết thời hạn lưu trữ 24 giờ theo quy định.")
  const [submitting, setSubmitting] = useState(false)

  const fetchSamples = useCallback(async (signal) => {
    setLoading(true)
    setError("")
    try {
      const res = await KitchenService.getRetainedSamples({}, { signal })
      setSamples(res.items || [])
    } catch (err) {
      if (!signal?.aborted) {
        setError(err.message || "Không thể tải danh sách mẫu lưu.")
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchSamples(controller.signal)
    return () => controller.abort()
  }, [fetchSamples])

  const handleDispose = async () => {
    if (!selectedSample) return
    setSubmitting(true)
    try {
      await KitchenService.disposeRetainedSample(selectedSample.id, {
        disposedAt: new Date().toISOString(),
        disposalNote: disposeNote.trim() || undefined,
      })
      notice({ msg: "Ghi nhận tiêu hủy mẫu lưu thành công!", isSuccess: true })
      setSelectedSample(null)
      fetchSamples()
    } catch (err) {
      notice({ msg: err.message || "Không thể tiêu hủy mẫu lưu.", isSuccess: false })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateTime = (val) => {
    if (!val) return "—"
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Sổ lưu mẫu thực phẩm 24h</h1>
          <p className={styles.subtitle}>
            Quản lý niêm phong và theo dõi thời hạn lưu mẫu thức ăn phục vụ kiểm thực an toàn theo quy định của Bộ Y tế.
          </p>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_COOKING)}
        >
          Về bảng điều khiển
        </Button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={60} />
        </div>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => fetchSamples()}>
              Tải lại
            </Button>
          }
        >
          {error}
        </Alert>
      ) : samples.length === 0 ? (
        <div className={styles.tableCard} style={{ padding: "48px 24px", textAlign: "center" }}>
          <FlaskConical size={40} color="#059669" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>
            Chưa có mẫu lưu thực phẩm nào được ghi nhận
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0 0 16px" }}>
            Sau khi một mẻ nấu hoàn thành, nhân viên bếp sẽ thực hiện lấy mẫu và niêm phong trong chi tiết lô chế biến.
          </p>
          <Button
            variant="contained"
            style={{ backgroundColor: "#0a8066" }}
            onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
          >
            Xem danh sách lô chế biến
          </Button>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Mã mẫu lưu</th>
                <th className={styles.th}>Lô chế biến</th>
                <th className={styles.th}>Lượng mẫu</th>
                <th className={styles.th}>Vị trí bảo quản</th>
                <th className={styles.th}>Thời điểm lấy mẫu</th>
                <th className={styles.th}>Trạng thái</th>
                <th className={styles.th} style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((row) => (
                <tr key={row.id}>
                  <td className={styles.td} style={{ fontFamily: "monospace", fontWeight: 600 }}>
                    SMP-{row.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className={styles.td}>
                    <Button
                      variant="text"
                      size="small"
                      style={{ padding: 0, minWidth: "auto", fontWeight: 600, color: "#0a8066" }}
                      onClick={() =>
                        navigate(
                          ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(
                            ":id",
                            row.cookingBatchId,
                          ),
                        )
                      }
                    >
                      Xem mẻ nấu
                    </Button>
                  </td>
                  <td className={styles.td}>
                    <strong>{row.quantity}</strong> {row.unit}
                  </td>
                  <td className={styles.td}>{row.storageLocation}</td>
                  <td className={styles.td}>{formatDateTime(row.sampledAt)}</td>
                  <td className={styles.td}>
                    {row.status === "STORED" ? (
                      <span className={styles.statusStored}>
                        <Clock size={12} />
                        Đang lưu mẫu (24h)
                      </span>
                    ) : (
                      <span className={styles.statusDisposed}>
                        <Check size={12} />
                        Đã tiêu hủy
                      </span>
                    )}
                  </td>
                  <td className={styles.td} style={{ textAlign: "right" }}>
                    {row.status === "STORED" && (
                      <button
                        type="button"
                        className={styles.disposeBtn}
                        onClick={() => setSelectedSample(row)}
                      >
                        <Trash2 size={13} />
                        <span>Hủy mẫu</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tiêu Hủy Mẫu */}
      <Dialog
        open={Boolean(selectedSample)}
        onClose={() => setSelectedSample(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận tiêu hủy mẫu lưu thực phẩm</DialogTitle>
        <DialogContent style={{ paddingTop: 12 }}>
          <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: "0 0 16px" }}>
            Tiêu hủy mẫu <strong>SMP-{selectedSample?.id?.slice(0, 8).toUpperCase()}</strong> sau khi đã bảo đảm thời gian lưu trữ tối thiểu 24 giờ và không có phản ánh bất thường về ATTP.
          </p>
          <TextField
            fullWidth
            size="small"
            label="Ghi chú tiêu hủy"
            value={disposeNote}
            onChange={(e) => setDisposeNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSample(null)} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDispose}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý…" : "Xác nhận tiêu hủy mẫu"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

