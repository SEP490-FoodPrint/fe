import React, { useEffect, useMemo, useRef, useState } from "react"
import { displayName } from "src/lib/displayName"
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material"
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Info,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  Upload,
  UtensilsCrossed,
  X,
} from "lucide-react"
import Service from "src/services/SupplierRelationshipService"
import notice from "src/components/Notice"
import RelationshipStatus from "./RelationshipStatus"
import DateFieldVN from "src/components/Common/DateFieldVN"

const dateText = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—"
const vietnamToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })
// Cùng quy tắc với BE (supplier-onboarding.rules) để báo lỗi ngay khi nhập
const contractDateErrors = ({ signedOn, startsOn, endsOn }, today) => ({
  signedOn: signedOn > today ? "Ngày ký không được ở tương lai" : "",
  endsOn:
    endsOn && startsOn && endsOn < startsOn
      ? "Phải từ ngày hiệu lực trở đi"
      : endsOn && endsOn < today
        ? "Hợp đồng đã hết hạn"
        : "",
})
const contractLabels = {
  DRAFT: "Hồ sơ nháp",
  ACTIVE: "Đã kích hoạt",
  CLOSED: "Đã đóng",
}
const documentLabels = {
  SIGNED_CONTRACT: {
    label: "Hợp đồng đã ký",
    hint: "Bản hợp đồng chính thức đã ký giữa Nhà trường và NCC",
    required: true,
  },
  COMPLIANCE: {
    label: "Hồ sơ pháp lý / ATTP",
    hint: "Bản sao GCN ATTP hoặc biên bản thẩm định điều kiện cơ sở",
    required: true,
  },
  APPENDIX: {
    label: "Phụ lục hợp đồng",
    hint: "Phụ lục bảng giá, danh mục điều kiện giao nhận",
    required: false,
  },
}
const actionLabels = {
  LINKED: "Thiết lập liên kết",
  CONTRACT_ACTIVATED: "Kích hoạt hợp đồng",
  CONTRACT_CLOSED: "Đóng hợp đồng",
  SUSPENDED: "Tạm dừng hợp tác",
  RESUMED: "Khôi phục hợp tác",
  UNLINKED: "Ngừng liên kết",
}
const toForm = (contract) => ({
  number: contract?.number || "",
  signedOn: contract?.signedOn?.slice(0, 10) || "",
  startsOn: contract?.startsOn?.slice(0, 10) || "",
  endsOn: contract?.endsOn?.slice(0, 10) || "",
  scopeNote: contract?.scopeNote || "",
  certificationId: contract?.certificationId || "",
  exemptionNote: contract?.exemptionNote || "",
  ingredientIds: (contract?.items || [])
    .map((item) => item.ingredientId)
    .sort(),
})

function SupplierWorkspace({ supplierId, intent, onClose, onChanged }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState(intent === "link" ? 1 : 0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [contract, setContract] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(toForm(null))
  const [basis, setBasis] = useState("certificate")
  const [ingredientSearch, setIngredientSearch] = useState("")
  const [verified, setVerified] = useState(false)
  const [decision, setDecision] = useState(null)
  const [reason, setReason] = useState("")
  const [confirmLeave, setConfirmLeave] = useState(false)
  const lock = useRef(false)

  const selectContract = (value) => {
    setContract(value)
    setForm(toForm(value))
    setBasis(value?.exemptionNote ? "exemption" : "certificate")
    setEditing(true)
    setVerified(false)
    setError("")
  }
  const newDraft = () => {
    selectContract(null)
    setTab(1)
  }

  useEffect(() => {
    let active = true
    Service.getDetail(supplierId)
      .then((response) => {
        if (!active) return
        setData(response.data)
        const selected =
          response.data.contracts.find((item) => item.status === "DRAFT") ||
          response.data.contracts[0]
        if (selected) selectContract(selected)
        else if (intent === "link" && response.data.canManage)
          selectContract(null)
      })
      .catch((failure) => {
        if (active)
          setError(
            failure?.response?.data?.message ||
              "Không thể tải hồ sơ nhà cung cấp.",
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [supplierId, intent])

  const refresh = async (id) => {
    const response = await Service.getDetail(supplierId)
    setData(response.data)
    if (id) {
      const updated = response.data.contracts.find((item) => item.id === id)
      if (updated) selectContract(updated)
    }
    onChanged()
  }
  const run = async (operation) => {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError("")
    try {
      await operation()
    } catch (failure) {
      setError(
        failure?.response?.data?.message ||
          failure.message ||
          "Không thể thực hiện thao tác.",
      )
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const setField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setVerified(false)
  }
  const dirty =
    Boolean(contract?.id) &&
    JSON.stringify(form) !== JSON.stringify(toForm(contract))
  const closeWorkspace = () => {
    if (busy) return
    const unsaved =
      dirty ||
      (!contract?.id &&
        editing &&
        Object.values(form).some((value) =>
          Array.isArray(value) ? value.length : Boolean(value),
        ))
    if (unsaved) setConfirmLeave(true)
    else onClose()
  }
  const metadataComplete = Boolean(
    form.number.trim() &&
    form.signedOn &&
    form.startsOn &&
    form.endsOn &&
    form.ingredientIds.length &&
    (form.certificationId || form.exemptionNote.trim()),
  )
  const draft = !contract?.id || contract.status === "DRAFT"
  const canEdit = Boolean(data?.canManage && draft && !busy)
  const today = vietnamToday()
  const dateErrors = draft
    ? contractDateErrors(form, today)
    : { signedOn: "", endsOn: "" }
  const datesInvalid = Boolean(dateErrors.signedOn || dateErrors.endsOn)
  const currentRelationship = data?.relationships.find((item) =>
    ["ACTIVE", "SUSPENDED"].includes(item.status),
  )

  // Nhóm nguyên liệu theo Danh mục (category)
  const groupedIngredients = useMemo(() => {
    const all = data?.supplier?.ingredients || []
    const query = ingredientSearch.toLowerCase().trim()
    const groups = {}
    for (const item of all) {
      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      if (!matchesSearch) continue

      const rawCat = item.category?.trim() || "Nhóm nguyên liệu khác"
      const catName = rawCat === "Thịt" ? "Thịt tươi" : rawCat
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(item)
    }
    return groups
  }, [data?.supplier?.ingredients, ingredientSearch])

  const allIngredients = data?.supplier?.ingredients || []

  const toggleCategory = (catName) => {
    if (!canEdit) return
    const catItems = allIngredients.filter((item) => {
      const rawCat = item.category?.trim() || "Nhóm nguyên liệu khác"
      return (rawCat === "Thịt" ? "Thịt tươi" : rawCat) === catName
    })
    const catIds = catItems.map((item) => item.id)
    const allSelected = catIds.every((id) => form.ingredientIds.includes(id))

    let nextIds
    if (allSelected) {
      nextIds = form.ingredientIds.filter((id) => !catIds.includes(id))
    } else {
      nextIds = Array.from(new Set([...form.ingredientIds, ...catIds])).sort()
    }
    setField("ingredientIds", nextIds)
  }

  const selectAllIngredients = () => {
    if (!canEdit) return
    const allIds = allIngredients.map((item) => item.id).sort()
    setField("ingredientIds", allIds)
  }

  const clearAllIngredients = () => {
    if (!canEdit) return
    setField("ingredientIds", [])
  }

  const save = () =>
    run(async () => {
      const response = await Service.saveDraft(
        {
          ...form,
          ...(contract?.id ? { revision: contract.revision } : { supplierId }),
        },
        contract?.id,
      )
      await refresh(response.data.id)
      notice({ msg: "Đã lưu hồ sơ nháp hợp đồng", isSuccess: true })
    })

  const upload = (kind, file) => {
    if (!file) return
    run(async () => {
      if (file.size > 10 * 1024 * 1024) throw new Error("Tệp tối đa 10 MB.")
      const response = await Service.upload(contract.id, kind, file)
      await refresh(response.data.id)
      notice({ msg: "Đã tải lên và lưu tài liệu", isSuccess: true })
    })
  }

  const activate = () =>
    run(async () => {
      const response = await Service.activate(contract.id, contract.revision)
      await refresh(response.data.id)
      notice({
        msg:
          currentRelationship?.status === "SUSPENDED"
            ? "Đã kích hoạt hợp đồng; liên kết vẫn đang tạm dừng"
            : "Đã kích hoạt hợp đồng và xác nhận liên kết thành công",
        isSuccess: true,
      })
    })

  const decide = () =>
    run(async () => {
      if (!reason.trim()) throw new Error("Vui lòng nhập lý do.")
      if (decision.type === "close")
        await Service.closeContract(decision.id, reason.trim())
      else
        await Service.changeRelationship(
          decision.id,
          decision.type,
          reason.trim(),
        )
      await refresh(contract?.id)
      setDecision(null)
      setReason("")
      notice({ msg: "Đã cập nhật và lưu lịch sử", isSuccess: true })
    })

  const openDecision = (type, id, title) => {
    setDecision({ type, id, title })
    setReason("")
  }

  return (
    <>
      <Dialog
        open
        onClose={closeWorkspace}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        className="supplier-workspace-dialog"
      >
        <DialogTitle component="div" className="supplier-dialog-title-wrapper">
          <div className="supplier-dialog-title">
            <div>
              <h2>{displayName(data?.supplier.name) || "Hồ sơ nhà cung cấp"}</h2>
              <small>
                {data?.supplier.taxCode
                  ? `Mã số thuế: ${displayName(data.supplier.taxCode)}`
                  : "Hồ sơ liên kết & hợp đồng cung cấp thực phẩm"}
              </small>
            </div>
            <IconButton
              aria-label="Đóng hồ sơ"
              disabled={busy}
              onClick={closeWorkspace}
            >
              <X />
            </IconButton>
          </div>
        </DialogTitle>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          className="supplier-workspace-tabs"
        >
          <Tab label="Hồ sơ NCC" />
          <Tab label="Hợp đồng của trường" />
          <Tab label="Lịch sử hợp tác" />
        </Tabs>
        <DialogContent dividers className="supplier-workspace-content">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Skeleton variant="rounded" height={400} />
          ) : (
            data && (
              <>
                {tab === 0 && (
                  <div className="supplier-profile">
                    <section className="supplier-section-block">
                      <h3>Thông tin doanh nghiệp</h3>
                      <dl>
                        <div>
                          <dt>Trạng thái</dt>
                          <dd>
                            {data.supplier.status === "ACTIVE"
                              ? "Đang hoạt động"
                              : "Ngừng hoạt động"}
                          </dd>
                        </div>
                        <div>
                          <dt>Địa chỉ</dt>
                          <dd>{data.supplier.address || "Chưa cập nhật"}</dd>
                        </div>
                        <div>
                          <dt>Địa bàn trụ sở</dt>
                          <dd>
                            {[
                              data.supplier.location?.name,
                              data.supplier.location?.parent?.name,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Chưa cập nhật"}
                          </dd>
                        </div>
                        <div>
                          <dt>Điện thoại</dt>
                          <dd>{data.supplier.phone || "Chưa cập nhật"}</dd>
                        </div>
                        <div>
                          <dt>Email</dt>
                          <dd>{data.supplier.email || "Chưa cập nhật"}</dd>
                        </div>
                        <div>
                          <dt>Khu vực giao hàng</dt>
                          <dd>
                            {data.supplier.serviceAreas
                              .map((item) => item.location.name)
                              .join(", ") || "Chưa khai báo"}
                          </dd>
                        </div>
                      </dl>
                    </section>
                    <section className="supplier-section-block">
                      <h3>Hồ sơ chứng nhận đã khai báo</h3>
                      {data.supplier.supplierCertifications.length ? (
                        <div className="supplier-cert-grid">
                          {data.supplier.supplierCertifications.map((cert) => (
                            <article className="supplier-evidence-card" key={cert.id}>
                              <div className="supplier-evidence-card__header">
                                <strong>{displayName(cert.certificationType)}</strong>
                                <Chip
                                  size="small"
                                  label={
                                    cert.status === "ACTIVE"
                                      ? "Còn hiệu lực"
                                      : "Hết hiệu lực"
                                  }
                                  color={cert.status === "ACTIVE" ? "success" : "default"}
                                  variant="outlined"
                                />
                              </div>
                              <p className="supplier-evidence-card__number">
                                Số: {displayName(cert.certificateNo)}
                              </p>
                              <p className="supplier-evidence-card__expiry">
                                Hạn dùng: {dateText(cert.expiryDate)}
                              </p>
                              {cert.documentUrl && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<ExternalLink size={14} />}
                                  href={cert.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Xem tài liệu công bố
                                </Button>
                              )}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <Alert severity="info">
                          NCC chưa khai báo chứng nhận ATTP trên hệ thống. Cần kiểm tra hồ sơ trước khi xác nhận liên kết.
                        </Alert>
                      )}
                    </section>
                    <section className="supplier-section-block">
                      <h3>Danh mục nguyên liệu do NCC cung cấp</h3>
                      <div className="supplier-ingredient-chips">
                        {data.supplier.ingredients.map((item) => (
                          <Chip
                            key={item.id}
                            label={`${displayName(item.name)} · ${item.defaultUnit}${item.category ? ` (${item.category === "Thịt" ? "Thịt tươi" : item.category})` : ""}`}
                            variant="outlined"
                          />
                        ))}
                      </div>
                      {!data.supplier.ingredients.length && (
                        <p className="supplier-help">NCC chưa có nguyên liệu đang hoạt động.</p>
                      )}
                    </section>
                    <section className="supplier-section-block">
                      <h3>Cơ sở nguồn đã khai báo</h3>
                      {data.supplier.sourceFacilities.length ? (
                        data.supplier.sourceFacilities.map((item) => (
                          <p key={item.id}>
                            <strong>{displayName(item.name)}</strong>
                            <br />
                            {item.address}
                          </p>
                        ))
                      ) : (
                        <p className="supplier-help">Chưa có cơ sở nguồn được khai báo.</p>
                      )}
                    </section>
                    {data.canManage && data.supplier.status === "ACTIVE" && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (!editing) newDraft()
                          else setTab(1)
                        }}
                      >
                        Chuẩn bị hồ sơ hợp tác
                      </Button>
                    )}
                  </div>
                )}
                {tab === 1 && (
                  <div className="supplier-contract-workflow">
                    <div className="supplier-partnership-bar">
                      <div>
                        <RelationshipStatus
                          status={currentRelationship?.status}
                        />
                        <small>
                          Quan hệ liên kết và từng kỳ hợp đồng được quản lý độc lập.
                        </small>
                      </div>
                      {data.canManage && currentRelationship && (
                        <div className="supplier-row-actions">
                          {currentRelationship.status === "ACTIVE" ? (
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={busy}
                              onClick={() =>
                                openDecision(
                                  "suspend",
                                  currentRelationship.id,
                                  "Tạm dừng hợp tác",
                                )
                              }
                            >
                              Tạm dừng hợp tác
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={busy}
                              onClick={() =>
                                openDecision(
                                  "resume",
                                  currentRelationship.id,
                                  "Khôi phục hợp tác",
                                )
                              }
                            >
                              Khôi phục hợp tác
                            </Button>
                          )}
                          <Button
                            color="error"
                            variant="outlined"
                            size="small"
                            disabled={busy}
                            onClick={() =>
                              openDecision(
                                "unlink",
                                currentRelationship.id,
                                "Ngừng liên kết",
                              )
                            }
                          >
                            Ngừng liên kết
                          </Button>
                        </div>
                      )}
                    </div>
                    {!!currentRelationship && !data.contracts.length && (
                      <Alert severity="warning">
                        Liên kết hiện tại chưa có hồ sơ hợp đồng. Cần bổ sung hợp đồng hợp lệ trước khi gửi đơn đặt hàng mới.
                      </Alert>
                    )}
                    {currentRelationship?.status === "SUSPENDED" && (
                      <Alert severity="warning">
                        Quan hệ hợp tác đang tạm dừng. Bổ sung hồ sơ không tự động khôi phục quyền đặt hàng; cần xác nhận khôi phục riêng.
                      </Alert>
                    )}

                    <div className="supplier-contract-picker">
                      <TextField
                        select
                        size="small"
                        label="Hồ sơ hợp đồng"
                        value={contract?.id || "new"}
                        onChange={(event) => {
                          if (event.target.value === "new") newDraft()
                          else
                            selectContract(
                              data.contracts.find(
                                (item) => item.id === event.target.value,
                              ),
                            )
                        }}
                      >
                        <MenuItem value="new">+ Soạn hồ sơ hợp đồng mới</MenuItem>
                        {data.contracts.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {displayName(item.number) || "Chưa đặt số"} ·{" "}
                            {contractLabels[item.status]}
                          </MenuItem>
                        ))}
                      </TextField>
                      {data.canManage && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Plus size={16} />}
                          disabled={busy || data.supplier.status !== "ACTIVE"}
                          onClick={newDraft}
                        >
                          Thêm / gia hạn hợp đồng
                        </Button>
                      )}
                    </div>

                    {editing ? (
                      <>
                        <Stepper
                          activeStep={
                            !contract?.id ||
                            dirty ||
                            !metadataComplete ||
                            datesInvalid
                              ? 0
                              : contract.issues?.some((issue) =>
                                    issue.includes("tải"),
                                  )
                                ? 1
                                : 2
                          }
                          alternativeLabel
                          className="supplier-stepper"
                        >
                          <Step>
                            <StepLabel>1. Thông tin hợp đồng & Phạm vi</StepLabel>
                          </Step>
                          <Step>
                            <StepLabel>2. Căn cứ ATTP & Tài liệu ký</StepLabel>
                          </Step>
                          <Step>
                            <StepLabel>3. Xác nhận & Kích hoạt</StepLabel>
                          </Step>
                        </Stepper>

                        {!draft && (
                          <Alert severity="info">
                            Hồ sơ hợp đồng đã kích hoạt được lưu trữ cố định để phục vụ truy xuất nguồn gốc. Để cập nhật điều khoản mới, vui lòng tạo hợp đồng hoặc phụ lục mới.
                          </Alert>
                        )}

                        {/* Section 1: Thông tin chung hợp đồng */}
                        <section className="supplier-section-block">
                          <div className="supplier-section-block__header">
                            <FileText size={18} className="supplier-section-icon" />
                            <div>
                              <h3>Thời hạn và số hợp đồng</h3>
                              <p className="supplier-help">
                                Nhập số văn bản và thời gian hiệu lực ký kết giữa Nhà trường và Nhà cung cấp.
                              </p>
                            </div>
                          </div>
                          <div className="supplier-contract-fields">
                            <TextField
                              size="small"
                              label="Số hợp đồng / phụ lục"
                              value={canEdit ? form.number : displayName(form.number)}
                              disabled={!canEdit}
                              onChange={(event) =>
                                setField("number", event.target.value)
                              }
                              placeholder="Ví dụ: HĐ-2026/01-TP"
                            />
                            <DateFieldVN
                              size="small"
                              label="Ngày ký hợp đồng"
                              value={form.signedOn}
                              disabled={!canEdit}
                              onChange={(val) => setField("signedOn", val)}
                              error={Boolean(dateErrors.signedOn)}
                              helperText={dateErrors.signedOn}
                              max={today}
                            />
                            <DateFieldVN
                              size="small"
                              label="Hiệu lực từ"
                              value={form.startsOn}
                              disabled={!canEdit}
                              onChange={(val) => setField("startsOn", val)}
                            />
                            <DateFieldVN
                              size="small"
                              label="Hiệu lực đến"
                              value={form.endsOn}
                              disabled={!canEdit}
                              onChange={(val) => setField("endsOn", val)}
                              error={Boolean(dateErrors.endsOn)}
                              helperText={dateErrors.endsOn}
                              min={form.startsOn > today ? form.startsOn : today}
                            />
                          </div>
                        </section>

                        {/* Section 2: Nguyên liệu được phép cung cấp (Grouped by Category) */}
                        <section className="supplier-section-block">
                          <div className="supplier-section-block__header">
                            <UtensilsCrossed size={18} className="supplier-section-icon" />
                            <div style={{ flex: 1 }}>
                              <div className="supplier-scope-title-row">
                                <h3>Nguyên liệu được phép cung cấp</h3>
                                <Chip
                                  size="small"
                                  label={`Đã chọn ${form.ingredientIds.length}/${allIngredients.length} mặt hàng`}
                                  color={form.ingredientIds.length > 0 ? "primary" : "default"}
                                  variant="outlined"
                                />
                              </div>
                              <p className="supplier-help">
                                Phân nhóm theo loại mặt hàng. Đơn đặt hàng mới từ bếp chỉ được gửi các nguyên liệu nằm trong phạm vi đã chọn tại đây.
                              </p>
                            </div>
                          </div>

                          {/* Toolbar tìm kiếm & chọn nhanh */}
                          <div className="supplier-scope-toolbar">
                            <TextField
                              size="small"
                              placeholder="Tìm nhanh mặt hàng hoặc nhóm nguyên liệu…"
                              value={ingredientSearch}
                              onChange={(e) => setIngredientSearch(e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Search size={16} />
                                  </InputAdornment>
                                ),
                                endAdornment: ingredientSearch && (
                                  <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setIngredientSearch("")}>
                                      <X size={14} />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              className="supplier-scope-search"
                            />
                            {canEdit && (
                              <div className="supplier-scope-actions">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={selectAllIngredients}
                                >
                                  Chọn tất cả
                                </Button>
                                <Button
                                  size="small"
                                  variant="text"
                                  color="inherit"
                                  disabled={!form.ingredientIds.length}
                                  onClick={clearAllIngredients}
                                >
                                  Bỏ chọn tất cả
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Danh sách các nhóm nguyên liệu */}
                          {Object.keys(groupedIngredients).length > 0 ? (
                            <div className="supplier-categories-container">
                              {Object.entries(groupedIngredients).map(([catName, items]) => {
                                const selectedInCat = items.filter((item) =>
                                  form.ingredientIds.includes(item.id),
                                )
                                const allInCatSelected =
                                  items.length > 0 && selectedInCat.length === items.length
                                const someInCatSelected =
                                  selectedInCat.length > 0 && !allInCatSelected

                                return (
                                  <div className="supplier-category-card" key={catName}>
                                    <div className="supplier-category-card__header">
                                      <div className="supplier-category-card__title">
                                        <strong>{catName}</strong>
                                        <span className="supplier-category-card__count">
                                          ({selectedInCat.length}/{items.length} mặt hàng)
                                        </span>
                                      </div>
                                      {canEdit && (
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              size="small"
                                              checked={allInCatSelected}
                                              indeterminate={someInCatSelected}
                                              onChange={() => toggleCategory(catName)}
                                            />
                                          }
                                          label="Chọn toàn bộ nhóm này"
                                          className="supplier-category-card__toggle"
                                        />
                                      )}
                                    </div>
                                    <div className="supplier-category-card__items">
                                      {items.map((item) => {
                                        const isSelected = form.ingredientIds.includes(item.id)
                                        return (
                                          <div
                                            key={item.id}
                                            className={`supplier-ingredient-checkbox ${isSelected ? "is-selected" : ""}`}
                                            onClick={() => {
                                              if (!canEdit) return
                                              setField(
                                                "ingredientIds",
                                                (isSelected
                                                  ? form.ingredientIds.filter((id) => id !== item.id)
                                                  : [...form.ingredientIds, item.id]
                                                ).sort(),
                                              )
                                            }}
                                          >
                                            <Checkbox
                                              size="small"
                                              checked={isSelected}
                                              disabled={!canEdit}
                                              tabIndex={-1}
                                            />
                                            <div className="supplier-ingredient-info">
                                              <span className="supplier-ingredient-name">
                                                {displayName(item.name)}
                                              </span>
                                              <span className="supplier-ingredient-unit">
                                                {item.defaultUnit}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="supplier-empty-scope">
                              <p>Không tìm thấy mặt hàng nào phù hợp với từ khóa &ldquo;{ingredientSearch}&rdquo;.</p>
                            </div>
                          )}

                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                            label="Ghi chú phạm vi / điều kiện cung cấp"
                            placeholder="Ví dụ: Quy cách giao hàng vào sáng sớm, rau củ còn nguyên cuống tươi..."
                            value={canEdit ? form.scopeNote : displayName(form.scopeNote)}
                            disabled={!canEdit}
                            onChange={(event) =>
                                setField("scopeNote", event.target.value)
                            }
                          />
                        </section>

                        {/* Section 3: Căn cứ hồ sơ pháp lý / ATTP của Nhà cung cấp */}
                        <section className="supplier-section-block">
                          <div className="supplier-section-block__header">
                            <ShieldCheck size={18} className="supplier-section-icon" />
                            <div>
                              <h3>Căn cứ hồ sơ pháp lý & ATTP của Nhà cung cấp</h3>
                              <p className="supplier-help">
                                Giấy chứng nhận ATTP do Nhà cung cấp chịu trách nhiệm công bố trên hệ thống. Nhà trường đối chiếu và chọn chứng nhận còn hiệu lực áp dụng cho hợp đồng này.
                              </p>
                            </div>
                          </div>

                          <div className="supplier-basis-selector">
                            <div className="supplier-basis-tabs">
                              <Button
                                size="small"
                                variant={basis === "certificate" ? "contained" : "outlined"}
                                onClick={() => {
                                  setBasis("certificate")
                                  setField("exemptionNote", "")
                                }}
                                disabled={!canEdit}
                              >
                                Chứng nhận ATTP của NCC
                              </Button>
                              <Button
                                size="small"
                                variant={basis === "exemption" ? "contained" : "outlined"}
                                onClick={() => {
                                  setBasis("exemption")
                                  setField("certificationId", "")
                                }}
                                disabled={!canEdit}
                              >
                                Căn cứ miễn cấp / Hồ sơ áp dụng đặc thù
                              </Button>
                            </div>

                            {basis === "certificate" ? (
                              <div className="supplier-cert-picker-area">
                                {data.supplier.supplierCertifications.length > 0 ? (
                                  <div className="supplier-cert-grid">
                                    {data.supplier.supplierCertifications.map((cert) => {
                                      const isSelected = form.certificationId === cert.id
                                      const isExpired = cert.expiryDate && cert.expiryDate < today
                                      return (
                                        <div
                                          key={cert.id}
                                          className={`supplier-cert-card ${isSelected ? "is-selected" : ""}`}
                                          onClick={() => {
                                            if (canEdit) setField("certificationId", cert.id)
                                          }}
                                        >
                                          <div className="supplier-cert-card__top">
                                            <Radio
                                              checked={isSelected}
                                              disabled={!canEdit}
                                              size="small"
                                              tabIndex={-1}
                                            />
                                            <div style={{ flex: 1 }}>
                                              <strong className="supplier-cert-card__type">
                                                {displayName(cert.certificationType)}
                                              </strong>
                                              <p className="supplier-cert-card__no">
                                                Số: {displayName(cert.certificateNo)}
                                              </p>
                                            </div>
                                            <Chip
                                              size="small"
                                              label={
                                                isExpired
                                                  ? "Đã hết hạn"
                                                  : cert.status === "ACTIVE"
                                                    ? "Còn hiệu lực"
                                                    : "Ngừng hoạt động"
                                              }
                                              color={
                                                !isExpired && cert.status === "ACTIVE"
                                                  ? "success"
                                                  : "error"
                                              }
                                              variant="outlined"
                                            />
                                          </div>
                                          <div className="supplier-cert-card__bottom">
                                            <span className="supplier-cert-card__date">
                                              Hạn dùng: {dateText(cert.expiryDate)}
                                            </span>
                                            {cert.documentUrl && (
                                              <Button
                                                size="small"
                                                variant="text"
                                                startIcon={<ExternalLink size={14} />}
                                                href={cert.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                Xem bản gốc NCC tải
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <Alert severity="warning">
                                    Nhà cung cấp chưa cập nhật Giấy chứng nhận ATTP nào trên hệ thống. Vui lòng yêu cầu NCC đăng tải chứng nhận trong hồ sơ của họ, hoặc chuyển sang tab &ldquo;Căn cứ miễn cấp / Hồ sơ áp dụng đặc thù&rdquo; nếu NCC thuộc diện được miễn theo quy định.
                                  </Alert>
                                )}
                              </div>
                            ) : (
                              <div className="supplier-exemption-area">
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Căn cứ hồ sơ áp dụng / lý do miễn cấp"
                                  placeholder="Ghi rõ căn cứ (Ví dụ: Cơ sở sản xuất ban đầu nhỏ lẻ theo Điều 12 Nghị định 15/2018/NĐ-CP hoặc có hồ sơ thẩm định cơ sở riêng)..."
                                  value={canEdit ? form.exemptionNote : displayName(form.exemptionNote)}
                                  disabled={!canEdit}
                                  onChange={(event) =>
                                    setField("exemptionNote", event.target.value)
                                  }
                                  multiline
                                  minRows={2}
                                />
                              </div>
                            )}
                          </div>
                        </section>

                        {/* Section 4: Tài liệu đính kèm hợp đồng */}
                        <section className="supplier-section-block">
                          <div className="supplier-section-block__header">
                            <FileCheck2 size={18} className="supplier-section-icon" />
                            <div>
                              <h3>Tài liệu đính kèm hợp đồng</h3>
                              <p className="supplier-help">
                                Lưu trữ bản scan hợp đồng đã ký giữa hai bên và các tài liệu đối chiếu pháp lý (Tối đa 10 MB/tệp, định dạng PDF, PNG, JPEG).
                              </p>
                            </div>
                          </div>

                          {draft && data.canManage && (
                            <>
                              {dirty && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                  Có thay đổi chưa lưu trên biểu mẫu. Vui lòng nhấn &ldquo;Lưu nháp hồ sơ&rdquo; ở góc dưới trước khi tải tài liệu hoặc kích hoạt hợp đồng.
                                </Alert>
                              )}
                              <div className="supplier-upload-actions-grid">
                                {Object.entries(documentLabels).map(([kind, config]) => {
                                  const uploadedCount = (contract?.documents || []).filter(
                                    (doc) => doc.kind === kind,
                                  ).length
                                  return (
                                    <div className="supplier-upload-card" key={kind}>
                                      <div className="supplier-upload-card__info">
                                        <div className="supplier-upload-card__title">
                                          <strong>{config.label}</strong>
                                          <Chip
                                            size="small"
                                            label={config.required ? "Bắt buộc" : "Tùy chọn"}
                                            color={
                                              uploadedCount > 0
                                                ? "success"
                                                : config.required
                                                  ? "error"
                                                  : "default"
                                            }
                                            variant="outlined"
                                          />
                                        </div>
                                        <small>{config.hint}</small>
                                      </div>
                                      <Button
                                        component="label"
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Upload size={15} />}
                                        disabled={busy || !contract?.id || dirty}
                                        className="supplier-upload-btn"
                                      >
                                        {uploadedCount > 0 ? "Tải thêm tệp" : "Tải tệp lên"}
                                        <input
                                          hidden
                                          type="file"
                                          accept="application/pdf,image/png,image/jpeg"
                                          onChange={(event) => {
                                            const file = event.target.files?.[0]
                                            event.target.value = ""
                                            upload(kind, file)
                                          }}
                                        />
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            </>
                          )}

                          <div className="supplier-document-list">
                            {contract?.documents?.map((file) => (
                              <div className="supplier-document-item" key={file.id}>
                                <FileText size={20} className="supplier-document-icon" />
                                <div className="supplier-document-meta">
                                  <strong>{displayName(file.fileName)}</strong>
                                  <div className="supplier-document-tags">
                                    <Chip
                                      size="small"
                                      label={documentLabels[file.kind]?.label || file.kind}
                                      variant="outlined"
                                    />
                                    <span>{Math.ceil(file.size / 1024)} KB</span>
                                    <span>·</span>
                                    <span>{dateText(file.createdAt)}</span>
                                  </div>
                                </div>
                                <div className="supplier-document-actions">
                                  <IconButton
                                    aria-label={`Tải về ${displayName(file.fileName)}`}
                                    size="small"
                                    disabled={busy}
                                    onClick={() => run(() => Service.download(file))}
                                  >
                                    <Download size={17} />
                                  </IconButton>
                                  {data.canManage && draft && (
                                    <IconButton
                                      aria-label={`Xóa ${displayName(file.fileName)}`}
                                      size="small"
                                      color="error"
                                      disabled={busy || dirty}
                                      onClick={() =>
                                        run(async () => {
                                          const response = await Service.removeDocument(file.id)
                                          await refresh(response.data.id)
                                        })
                                      }
                                    >
                                      <Trash2 size={17} />
                                    </IconButton>
                                  )}
                                </div>
                              </div>
                            ))}
                            {!contract?.documents?.length && (
                              <p className="supplier-help" style={{ textAlign: "center", padding: "12px 0" }}>
                                Chưa có tệp tài liệu nào được đính kèm.
                              </p>
                            )}
                          </div>
                        </section>

                        {/* Section 5: Điều kiện xác nhận & Kích hoạt */}
                        {contract?.issues?.length > 0 && draft && (
                          <Alert severity="warning" className="supplier-issues-alert">
                            <strong>Chưa đủ điều kiện kích hoạt hợp đồng:</strong>
                            <ul>
                              {contract.issues.map((issue) => (
                                <li key={issue}>{issue}</li>
                              ))}
                            </ul>
                          </Alert>
                        )}
                        {contract?.issues?.length > 0 && !draft && (
                          <Alert severity="warning">
                            {contract.issues.join(" ")}
                          </Alert>
                        )}

                        {data.canManage && draft && (
                          <section className="supplier-confirmation-block">
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={verified}
                                  disabled={
                                    busy ||
                                    !contract?.id ||
                                    dirty ||
                                    Boolean(contract.issues?.length)
                                  }
                                  onChange={(event) =>
                                    setVerified(event.target.checked)
                                  }
                                />
                              }
                              label={
                                <span>
                                  <strong>Xác nhận hồ sơ:</strong> Tôi xác nhận đã kiểm tra hợp đồng ký giữa đúng hai bên, hồ sơ pháp lý/ATTP của nhà cung cấp và danh mục nguyên liệu được phép cung cấp.
                                </span>
                              }
                            />
                          </section>
                        )}

                        {data.canManage && contract?.status === "ACTIVE" && (
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                              color="error"
                              variant="outlined"
                              disabled={busy}
                              onClick={() =>
                                openDecision(
                                  "close",
                                  contract.id,
                                  "Đóng hợp đồng",
                                )
                              }
                            >
                              Đóng hợp đồng này
                            </Button>
                          </div>
                        )}
                        {contract?.status === "CLOSED" && (
                          <Alert severity="info">
                            Hợp đồng đã đóng ngày {dateText(contract.closedAt)}. Lý do:{" "}
                            {contract.closeReason}
                          </Alert>
                        )}
                      </>
                    ) : (
                      <div className="supplier-empty">
                        Chưa có hồ sơ hợp đồng của trường.
                        {data.canManage && (
                          <div style={{ marginTop: 12 }}>
                            <Button variant="contained" onClick={newDraft}>Lập hồ sơ liên kết</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {tab === 2 && (
                  <div className="supplier-timeline">
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Các thao tác liên kết và hợp đồng được lưu cùng thông tin người thực hiện. Dữ liệu đơn hàng, lô hàng và tài liệu cũ vẫn được lưu giữ an toàn khi ngừng hợp tác.
                    </Alert>
                    {data.events.length ? (
                      data.events.map((item) => (
                        <article key={item.id}>
                          <strong>
                            {actionLabels[item.action] || item.action}
                          </strong>
                          <p>{displayName(item.reason)}</p>
                          <small>
                            {displayName(item.actorName)} ·{" "}
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </small>
                        </article>
                      ))
                    ) : (
                      <p>
                        Chưa có hoạt động nào được ghi nhận cho quan hệ này.
                      </p>
                    )}
                    <small>Hiển thị tối đa 50 hoạt động gần nhất.</small>
                  </div>
                )}
              </>
            )
          )}
        </DialogContent>
        <DialogActions className="supplier-dialog-footer">
          <div className="supplier-dialog-footer__status">
            {dirty && (
              <span className="supplier-unsaved-badge">
                <AlertCircle size={15} /> Có thay đổi chưa lưu
              </span>
            )}
            {draft && !dirty && contract?.id && (
              <span className="supplier-draft-hint">
                Trạng thái: Hồ sơ nháp (chưa kích hoạt)
              </span>
            )}
          </div>
          <div className="supplier-dialog-footer__actions">
            {busy && <CircularProgress size={20} />}
            <Button disabled={busy} onClick={closeWorkspace} variant="outlined" color="inherit">
              Đóng
            </Button>
            {data?.canManage && draft && tab === 1 && editing && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={busy || datesInvalid}
                  onClick={save}
                >
                  {busy ? "Đang xử lý…" : "Lưu nháp hồ sơ"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    busy ||
                    !verified ||
                    dirty ||
                    !contract?.id ||
                    Boolean(contract.issues?.length)
                  }
                  onClick={activate}
                >
                  Xác nhận & Kích hoạt hợp đồng
                </Button>
              </>
            )}
          </div>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(decision)}
        onClose={() => {
          if (!busy) setDecision(null)
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{decision?.title}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Thao tác này tác động tới việc đặt hàng mới. Không tự hủy đơn đang
            thực hiện, không xóa hợp đồng hay dữ liệu truy xuất cũ.
          </Alert>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Lý do"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={busy}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setDecision(null)}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            disabled={busy || !reason.trim()}
            onClick={decide}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Có thay đổi chưa lưu</DialogTitle>
        <DialogContent>
          Tiếp tục soạn và lưu nháp để giữ thay đổi. Các thông tin đã lưu trước
          đó vẫn được giữ nguyên.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLeave(false)}>Tiếp tục soạn</Button>
          <Button color="error" onClick={onClose}>
            Bỏ thay đổi và đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SupplierWorkspace