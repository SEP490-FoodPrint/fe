import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, Button, Skeleton } from "@mui/material"
import { ArrowLeft } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import notice from "src/components/Notice"
import KitchenService from "src/services/KitchenService"
import KitchenSamplesTable from "./component/KitchenSamplesTable"
import DisposeSampleModal from "./component/DisposeSampleModal"
import styles from "./index.module.scss"

/**
 * KitchenSamples - Sổ lưu mẫu thực phẩm 24 giờ
 * Tuân thủ quy chuẩn ai_coding_rule (component/ separation, mobile-first touch >= 44px)
 */
export default function KitchenSamples() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [samples, setSamples] = useState([])
  const [selectedSample, setSelectedSample] = useState(null)
  const [disposeNote, setDisposeNote] = useState("Tiêu hủy mẫu sau khi hết thời hạn lưu trữ 24 giờ.")
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

  return (
    <div className={styles.container}>
      {/* 1. Header Trang */}
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Sổ lưu mẫu thực phẩm 24h</h1>
            <span className={styles.headerBadge}>Kiểm thực 3 bước</span>
          </div>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_COOKING)}
          className={styles.backBtn}
        >
          Về bảng điều khiển
        </Button>
      </div>

      {/* 2. Nội dung bảng mẫu lưu */}
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
      ) : (
        <KitchenSamplesTable
          samples={samples}
          onOpenDisposeModal={(sample) => setSelectedSample(sample)}
        />
      )}

      {/* 3. Modal xác nhận tiêu hủy mẫu */}
      <DisposeSampleModal
        open={Boolean(selectedSample)}
        sample={selectedSample}
        disposeNote={disposeNote}
        setDisposeNote={setDisposeNote}
        onClose={() => setSelectedSample(null)}
        onConfirm={handleDispose}
        submitting={submitting}
      />
    </div>
  )
}
