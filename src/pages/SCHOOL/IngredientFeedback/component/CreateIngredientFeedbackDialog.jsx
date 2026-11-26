import React, { useEffect, useState } from "react"
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import {
  countCodePoints,
  formatDateTimeVi,
  parseApiError,
} from "src/components/ComplaintThread"
import { EvidenceFilePicker } from "src/components/EvidenceFiles"
import SupplierComplaintService, {
  INGREDIENT_ISSUE_TYPE_LABELS,
} from "src/services/SupplierComplaintService"
import styles from "../IngredientFeedback.module.scss"

const STATUS_LABEL = {
  RECEIVED: "Đã tiếp nhận",
  REJECTED: "Bị từ chối",
}

export default function CreateIngredientFeedbackDialog({
  open,
  onClose,
  onCreated,
}) {
  const [deliveries, setDeliveries] = useState([])
  const [loadingDeliveries, setLoadingDeliveries] = useState(false)
  const [deliveriesError, setDeliveriesError] = useState("")
  const [reloadTick, setReloadTick] = useState(0)

  const [deliveryId, setDeliveryId] = useState("")
  const [lots, setLots] = useState([])
  const [loadingLots, setLoadingLots] = useState(false)
  const [lotsError, setLotsError] = useState("")
  const [ingredientLotId, setIngredientLotId] = useState("")
  const [title, setTitle] = useState("")
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState([])

  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    setLoadingDeliveries(true)
    setDeliveriesError("")

    SupplierComplaintService.listEligibleDeliveries({
      signal: controller.signal,
    })
      .then(list => {
        if (!controller.signal.aborted) {
          setDeliveries(list)
        }
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setDeliveriesError(
          parseApiError(
            err,
            "Không tải được danh sách chuyến giao đủ điều kiện.",
          ).message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDeliveries(false)
      })

    return () => controller.abort()
  }, [open, reloadTick])

  useEffect(() => {
    if (!open || !deliveryId) {
      setLots([])
      setIngredientLotId("")
      setLotsError("")
      return undefined
    }
    const controller = new AbortController()
    setLoadingLots(true)
    setLotsError("")
    setIngredientLotId("")

    SupplierComplaintService.getDeliveryLots(deliveryId, {
      signal: controller.signal,
    })
      .then(list => {
        if (!controller.signal.aborted) {
          setLots(list)
        }
      })
      .catch(err => {
        if (err?.name === "CanceledError" || controller.signal.aborted) return
        setLots([])
        setLotsError(
          parseApiError(
            err,
            "Không tải được danh sách lô nguyên liệu của chuyến giao này.",
          ).message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingLots(false)
      })

    return () => controller.abort()
  }, [open, deliveryId])

  const descLen = countCodePoints(description.trim())
  const titleLen = countCodePoints(title.trim())
  const canSubmit =
    Boolean(deliveryId) &&
    Boolean(issueType) &&
    titleLen >= 5 &&
    titleLen <= 255 &&
    descLen >= 10 &&
    descLen <= 2000 &&
    !saving

  const handleSubmit = async event => {
    event.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setSubmitError("")
    setFieldErrors({})
    try {
      const created = await SupplierComplaintService.create({
        deliveryId,
        ingredientLotId: ingredientLotId || undefined,
        title: title.trim(),
        issueType,
        description: description.trim(),
        files,
      })
      onCreated(created)
    } catch (err) {
      const parsed = parseApiError(
        err,
        "Không thể gửi phản ánh chất lượng nguyên liệu.",
      )
      setSubmitError(parsed.message)
      setFieldErrors(parsed.fields || {})
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      aria-labelledby="create-ingredient-feedback-title"
      slotProps={{ paper: { className: styles.dialogPaper } }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle
          id="create-ingredient-feedback-title"
          className={styles.dialogTitle}
        >
          <span>Gửi phản ánh chất lượng nguyên liệu</span>
          <IconButton
            aria-label="Đóng"
            size="small"
            onClick={onClose}
            disabled={saving}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers className={styles.dialogContent}>
          <div className={styles.dialogContentStack}>
            {deliveriesError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setReloadTick(prev => prev + 1)}
                  >
                    Thử lại
                  </Button>
                }
              >
                {deliveriesError}
              </Alert>
            ) : null}

            {submitError ? <Alert severity="error">{submitError}</Alert> : null}

            <div className={styles.field}>
              <label id="cif-delivery-label" htmlFor="cif-delivery">
                Chuyến giao hàng <span className={styles.required}>*</span>
              </label>
              <TextField
                id="cif-delivery"
                select
                required
                fullWidth
                size="small"
                slotProps={{ select: { labelId: "cif-delivery-label" } }}
                value={deliveryId}
                disabled={saving || loadingDeliveries}
                error={Boolean(fieldErrors.deliveryId)}
                helperText={
                  fieldErrors.deliveryId ||
                  (loadingDeliveries
                    ? "Đang tải danh sách chuyến giao..."
                    : deliveries.length === 0 && !deliveriesError
                      ? "Chưa có chuyến giao đã tiếp nhận hoặc bị từ chối."
                      : "Chỉ gồm chuyến giao đã tiếp nhận hoặc bị từ chối.")
                }
                onChange={event => {
                  setDeliveryId(event.target.value)
                  setFieldErrors(prev => ({ ...prev, deliveryId: "" }))
                }}
              >
                {deliveries.map(d => (
                  <MenuItem key={d.id} value={d.id}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong>
                        {d.deliveryNo}
                        {d.code && d.code !== d.deliveryNo
                          ? ` (${d.code})`
                          : ""}
                      </strong>
                      <small style={{ color: "var(--text-muted)" }}>
                        {[
                          d.supplierName,
                          STATUS_LABEL[d.status] || d.status,
                          d.receivedAt
                            ? formatDateTimeVi(d.receivedAt, "")
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </small>
                    </div>
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className={styles.field}>
              <label id="cif-lot-label" htmlFor="cif-lot">
                Lô nguyên liệu
              </label>
              <TextField
                id="cif-lot"
                select
                fullWidth
                size="small"
                slotProps={{
                  select: { labelId: "cif-lot-label", displayEmpty: true },
                }}
                value={ingredientLotId}
                disabled={saving || !deliveryId || loadingLots}
                error={Boolean(fieldErrors.ingredientLotId)}
                helperText={
                  fieldErrors.ingredientLotId ||
                  lotsError ||
                  (!deliveryId
                    ? "Chọn chuyến giao trước."
                    : !loadingLots && lots.length === 0
                      ? "Chuyến giao không có lô chi tiết."
                      : undefined)
                }
                onChange={event => {
                  setIngredientLotId(event.target.value)
                  setFieldErrors(prev => ({ ...prev, ingredientLotId: "" }))
                }}
              >
                <MenuItem value="">Toàn bộ chuyến giao</MenuItem>
                {lots.map(lot => (
                  <MenuItem key={lot.id} value={lot.id}>
                    {lot.lotCode}
                    {lot.ingredientName ? ` — ${lot.ingredientName}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {loadingLots ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CircularProgress size={16} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Đang tải danh sách lô...
                </span>
              </div>
            ) : null}

            <div className={styles.field}>
              <label htmlFor="cif-title">
                Tiêu đề <span className={styles.required}>*</span>
              </label>
              <TextField
                id="cif-title"
                required
                fullWidth
                size="small"
                value={title}
                disabled={saving}
                error={Boolean(fieldErrors.title)}
                onChange={event => {
                  setTitle(event.target.value)
                  setFieldErrors(prev => ({ ...prev, title: "" }))
                }}
                slotProps={{ htmlInput: { maxLength: 255 } }}
                helperText={
                  fieldErrors.title ||
                  `${titleLen.toLocaleString("vi-VN")}/255 ký tự · Tối thiểu 5 ký tự`
                }
              />
            </div>

            <div className={styles.field}>
              <label id="cif-issue-label" htmlFor="cif-issue">
                Loại vấn đề <span className={styles.required}>*</span>
              </label>
              <TextField
                id="cif-issue"
                select
                required
                fullWidth
                size="small"
                slotProps={{ select: { labelId: "cif-issue-label" } }}
                value={issueType}
                disabled={saving}
                error={Boolean(fieldErrors.issueType)}
                helperText={fieldErrors.issueType}
                onChange={event => {
                  setIssueType(event.target.value)
                  setFieldErrors(prev => ({ ...prev, issueType: "" }))
                }}
              >
                {Object.entries(INGREDIENT_ISSUE_TYPE_LABELS).map(
                  ([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ),
                )}
              </TextField>
            </div>

            <div className={styles.field}>
              <label htmlFor="cif-description">
                Mô tả vấn đề chất lượng{" "}
                <span className={styles.required}>*</span>
              </label>
              <TextField
                id="cif-description"
                required
                fullWidth
                multiline
                minRows={4}
                value={description}
                disabled={saving}
                error={Boolean(fieldErrors.description)}
                onChange={event => {
                  setDescription(event.target.value)
                  setFieldErrors(prev => ({ ...prev, description: "" }))
                }}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
                helperText={
                  fieldErrors.description ||
                  `${descLen.toLocaleString("vi-VN")}/2.000 ký tự · Tối thiểu 10 ký tự`
                }
              />
            </div>

            <EvidenceFilePicker
              value={files}
              onChange={next => {
                setFiles(next)
                setFieldErrors(prev => ({ ...prev, files: "" }))
              }}
              disabled={saving}
              error={fieldErrors.files}
            />
          </div>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button
            type="submit"
            variant="contained"
            className={styles.createBtn}
            disabled={!canSubmit}
          >
            {saving ? "Đang gửi…" : "Gửi phản ánh"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
