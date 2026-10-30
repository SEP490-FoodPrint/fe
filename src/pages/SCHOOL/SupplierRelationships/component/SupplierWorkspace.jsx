import React, { useEffect, useRef, useState } from "react"
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
  MenuItem,
  Skeleton,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
} from "@mui/material"
import { Download, FilePlus2, Plus, Trash2, X } from "lucide-react"
import Service from "src/services/SupplierRelationshipService"
import notice from "src/components/Notice"
import RelationshipStatus from "./RelationshipStatus"

const dateText = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—"
const contractLabels = {
  DRAFT: "Hồ sơ nháp",
  ACTIVE: "Đã kích hoạt",
  CLOSED: "Đã đóng",
}
const documentLabels = {
  SIGNED_CONTRACT: "Hợp đồng đã ký",
  COMPLIANCE: "Hồ sơ pháp lý/ATTP",
  APPENDIX: "Phụ lục khác",
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
  const currentRelationship = data?.relationships.find((item) =>
    ["ACTIVE", "SUSPENDED"].includes(item.status),
  )
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
      notice({ msg: "Đã lưu hồ sơ nháp", isSuccess: true })
    })
  const upload = (kind, file) => {
    if (!file) return
    run(async () => {
      if (file.size > 10 * 1024 * 1024) throw new Error("Tệp tối đa 10 MB.")
      const response = await Service.upload(contract.id, kind, file)
      await refresh(response.data.id)
      notice({ msg: "Đã lưu tài liệu", isSuccess: true })
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
            : "Đã kích hoạt hợp đồng và xác nhận liên kết",
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
        className="supplier-workspace"
      >
        <DialogTitle component="div">
          <div className="supplier-dialog-title">
            <div>
              <h2>{data?.supplier.name || "Hồ sơ nhà cung cấp"}</h2>
              <small>
                {data?.supplier.taxCode
                  ? `MST: ${data.supplier.taxCode}`
                  : "Kiểm tra hồ sơ trước khi hợp tác"}
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
        >
          <Tab label="Hồ sơ NCC" />
          <Tab label="Hợp đồng của trường" />
          <Tab label="Lịch sử hợp tác" />
        </Tabs>
        <DialogContent dividers>
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
                    <section>
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
                    <section>
                      <h3>Hồ sơ chứng nhận đã khai báo</h3>
                      {data.supplier.supplierCertifications.length ? (
                        data.supplier.supplierCertifications.map((cert) => (
                          <article className="supplier-evidence" key={cert.id}>
                            <strong>{cert.certificationType}</strong>
                            <p>
                              {cert.certificateNo} · Hết hạn:{" "}
                              {dateText(cert.expiryDate)}
                            </p>
                            <Chip
                              size="small"
                              label={
                                cert.status === "ACTIVE"
                                  ? "Đang hoạt động"
                                  : "Không hoạt động"
                              }
                              variant="outlined"
                            />
                            {cert.documentUrl && (
                              <Button
                                href={cert.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Xem tài liệu công bố
                              </Button>
                            )}
                          </article>
                        ))
                      ) : (
                        <p>
                          Chưa khai báo chứng nhận. Cần kiểm tra hồ sơ áp dụng
                          trước khi xác nhận liên kết.
                        </p>
                      )}
                    </section>
                    <section>
                      <h3>Danh mục nguyên liệu</h3>
                      <div className="supplier-ingredient-chips">
                        {data.supplier.ingredients.map((item) => (
                          <Chip
                            key={item.id}
                            label={`${item.name} · ${item.defaultUnit}`}
                            variant="outlined"
                          />
                        ))}
                      </div>
                      {!data.supplier.ingredients.length && (
                        <p>NCC chưa có nguyên liệu đang hoạt động.</p>
                      )}
                    </section>
                    <section>
                      <h3>Cơ sở nguồn đã khai báo</h3>
                      {data.supplier.sourceFacilities.length ? (
                        data.supplier.sourceFacilities.map((item) => (
                          <p key={item.id}>
                            <strong>{item.name}</strong>
                            <br />
                            {item.address}
                          </p>
                        ))
                      ) : (
                        <p>Chưa có cơ sở nguồn được khai báo.</p>
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
                          Liên kết và hiệu lực hợp đồng được quản lý riêng.
                        </small>
                      </div>
                      {data.canManage && currentRelationship && (
                        <div className="supplier-row-actions">
                          {currentRelationship.status === "ACTIVE" ? (
                            <Button
                              disabled={busy}
                              onClick={() =>
                                openDecision(
                                  "suspend",
                                  currentRelationship.id,
                                  "Tạm dừng hợp tác",
                                )
                              }
                            >
                              Tạm dừng
                            </Button>
                          ) : (
                            <Button
                              disabled={busy}
                              onClick={() =>
                                openDecision(
                                  "resume",
                                  currentRelationship.id,
                                  "Khôi phục hợp tác",
                                )
                              }
                            >
                              Khôi phục
                            </Button>
                          )}
                          <Button
                            color="error"
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
                        Liên kết hiện có chưa có hồ sơ hợp đồng. Cần bổ sung
                        trước khi gửi đơn đặt mới.
                      </Alert>
                    )}
                    {currentRelationship?.status === "SUSPENDED" && (
                      <Alert severity="warning">
                        Quan hệ đang tạm dừng. Bổ sung hồ sơ không tự khôi phục
                        quyền đặt hàng; người phụ trách cần xác nhận khôi phục
                        riêng.
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
                        <MenuItem value="new">Hồ sơ mới</MenuItem>
                        {data.contracts.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.number || "Chưa đặt số"} ·{" "}
                            {contractLabels[item.status]}
                          </MenuItem>
                        ))}
                      </TextField>
                      {data.canManage && (
                        <Button
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
                            !contract?.id || dirty || !metadataComplete
                              ? 0
                              : contract.issues?.some((issue) =>
                                    issue.includes("tải"),
                                  )
                                ? 1
                                : 2
                          }
                          alternativeLabel
                        >
                          <Step>
                            <StepLabel>Thông tin hợp đồng</StepLabel>
                          </Step>
                          <Step>
                            <StepLabel>Hồ sơ đã ký</StepLabel>
                          </Step>
                          <Step>
                            <StepLabel>Xác nhận</StepLabel>
                          </Step>
                        </Stepper>
                        {!draft && (
                          <Alert severity="info">
                            Hồ sơ đã kích hoạt được giữ nguyên để truy xuất. Gia
                            hạn bằng một hồ sơ hợp đồng/phụ lục mới và tải tài
                            liệu mới.
                          </Alert>
                        )}
                        <div className="supplier-contract-fields">
                          <TextField
                            size="small"
                            label="Số hợp đồng / phụ lục"
                            value={form.number}
                            disabled={!canEdit}
                            onChange={(event) =>
                              setField("number", event.target.value)
                            }
                            helperText="Số riêng cho từng hồ sơ hợp đồng/phụ lục"
                          />
                          <TextField
                            size="small"
                            label="Ngày ký"
                            type="date"
                            value={form.signedOn}
                            disabled={!canEdit}
                            onChange={(event) =>
                              setField("signedOn", event.target.value)
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                          <TextField
                            size="small"
                            label="Hiệu lực từ"
                            type="date"
                            value={form.startsOn}
                            disabled={!canEdit}
                            onChange={(event) =>
                              setField("startsOn", event.target.value)
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                          <TextField
                            size="small"
                            label="Hiệu lực đến"
                            type="date"
                            value={form.endsOn}
                            disabled={!canEdit}
                            onChange={(event) =>
                              setField("endsOn", event.target.value)
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        </div>
                        <section>
                          <h3>Nguyên liệu được phép cung cấp</h3>
                          <p className="supplier-help">
                            Chọn đúng phạm vi hợp đồng. Đơn đặt mới chỉ được gửi
                            cho những nguyên liệu này.
                          </p>
                          <div className="supplier-scope-items">
                            {data.supplier.ingredients.map((item) => (
                              <FormControlLabel
                                key={item.id}
                                control={
                                  <Checkbox
                                    checked={form.ingredientIds.includes(
                                      item.id,
                                    )}
                                    disabled={!canEdit}
                                    onChange={(event) =>
                                      setField(
                                        "ingredientIds",
                                        (event.target.checked
                                          ? [...form.ingredientIds, item.id]
                                          : form.ingredientIds.filter(
                                              (id) => id !== item.id,
                                            )
                                        ).sort(),
                                      )
                                    }
                                  />
                                }
                                label={`${item.name} (${item.defaultUnit})`}
                              />
                            ))}
                          </div>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                            label="Ghi chú phạm vi / điều kiện cung cấp"
                            value={form.scopeNote}
                            disabled={!canEdit}
                            onChange={(event) =>
                              setField("scopeNote", event.target.value)
                            }
                          />
                        </section>
                        <section>
                          <h3>Căn cứ hồ sơ pháp lý / ATTP</h3>
                          <div className="supplier-contract-fields">
                            <TextField
                              select
                              size="small"
                              label="Loại căn cứ"
                              value={basis}
                              disabled={!canEdit}
                              onChange={(event) => {
                                setBasis(event.target.value)
                                setField("certificationId", "")
                                setField("exemptionNote", "")
                              }}
                            >
                              <MenuItem value="certificate">
                                Chứng nhận đã khai báo
                              </MenuItem>
                              <MenuItem value="exemption">
                                Hồ sơ áp dụng / căn cứ miễn cấp
                              </MenuItem>
                            </TextField>
                            {basis === "certificate" ? (
                              <TextField
                                select
                                size="small"
                                label="Chứng nhận áp dụng"
                                value={form.certificationId}
                                disabled={!canEdit}
                                onChange={(event) =>
                                  setField(
                                    "certificationId",
                                    event.target.value,
                                  )
                                }
                              >
                                <MenuItem value="">Chọn chứng nhận</MenuItem>
                                {data.supplier.supplierCertifications.map(
                                  (cert) => (
                                    <MenuItem key={cert.id} value={cert.id}>
                                      {cert.certificateNo} · Hết hạn{" "}
                                      {dateText(cert.expiryDate)}
                                    </MenuItem>
                                  ),
                                )}
                              </TextField>
                            ) : (
                              <TextField
                                size="small"
                                label="Căn cứ hồ sơ áp dụng / miễn cấp"
                                value={form.exemptionNote}
                                disabled={!canEdit}
                                onChange={(event) =>
                                  setField("exemptionNote", event.target.value)
                                }
                                multiline
                                minRows={2}
                              />
                            )}
                          </div>
                          <p className="supplier-help">
                            Người phụ trách kiểm tra tính phù hợp theo loại NCC
                            và nguyên liệu; luôn đính kèm hồ sơ minh chứng bên
                            dưới.
                          </p>
                        </section>
                        {data.canManage && draft && (
                          <Button
                            variant="outlined"
                            disabled={busy}
                            onClick={save}
                          >
                            {busy ? "Đang xử lý…" : "Lưu nháp hồ sơ"}
                          </Button>
                        )}
                        <Divider />
                        <section>
                          <h3>Tài liệu hợp đồng</h3>
                          {draft && data.canManage && (
                            <>
                              <p className="supplier-help">
                                Lưu nháp trước khi tải tài liệu. Nhận PDF, PNG,
                                JPEG; tối đa 10 MB/tệp và 10 tệp/hồ sơ.
                              </p>
                              {dirty && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                  Có thay đổi chưa lưu. Lưu nháp trước khi tải
                                  tệp hoặc xác nhận.
                                </Alert>
                              )}
                              <div className="supplier-upload-buttons">
                                {Object.entries(documentLabels).map(
                                  ([kind, label]) => (
                                    <Button
                                      key={kind}
                                      component="label"
                                      variant="outlined"
                                      startIcon={<FilePlus2 size={16} />}
                                      disabled={busy || !contract?.id || dirty}
                                    >
                                      Tải {label.toLocaleLowerCase("vi")}
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
                                  ),
                                )}
                              </div>
                            </>
                          )}
                          <div className="supplier-document-list">
                            {contract?.documents?.map((file) => (
                              <div key={file.id}>
                                <div>
                                  <strong>{file.fileName}</strong>
                                  <small>
                                    {documentLabels[file.kind]} ·{" "}
                                    {Math.ceil(file.size / 1024)} KB ·{" "}
                                    {dateText(file.createdAt)}
                                  </small>
                                </div>
                                <IconButton
                                  aria-label={`Tải về ${file.fileName}`}
                                  disabled={busy}
                                  onClick={() =>
                                    run(() => Service.download(file))
                                  }
                                >
                                  <Download size={18} />
                                </IconButton>
                                {data.canManage && draft && (
                                  <IconButton
                                    aria-label={`Xóa ${file.fileName}`}
                                    color="error"
                                    disabled={busy || dirty}
                                    onClick={() =>
                                      run(async () => {
                                        const response =
                                          await Service.removeDocument(file.id)
                                        await refresh(response.data.id)
                                      })
                                    }
                                  >
                                    <Trash2 size={18} />
                                  </IconButton>
                                )}
                              </div>
                            ))}
                          </div>
                          {!contract?.documents?.length && (
                            <p className="supplier-help">
                              Chưa có tài liệu được lưu.
                            </p>
                          )}
                        </section>
                        {contract?.issues?.length > 0 && draft && (
                          <Alert severity="warning">
                            <strong>Chưa đủ điều kiện xác nhận</strong>
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
                          <section className="supplier-confirmation">
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
                              label="Tôi xác nhận đã kiểm tra hợp đồng ký giữa đúng hai bên, hồ sơ pháp lý/ATTP và phạm vi cung cấp."
                            />
                            <Button
                              variant="contained"
                              disabled={
                                busy ||
                                !verified ||
                                dirty ||
                                !contract?.id ||
                                Boolean(contract.issues?.length)
                              }
                              onClick={activate}
                            >
                              Xác nhận liên kết / kích hoạt hợp đồng
                            </Button>
                          </section>
                        )}
                        {data.canManage && contract?.status === "ACTIVE" && (
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
                            Đóng hợp đồng
                          </Button>
                        )}
                        {contract?.status === "CLOSED" && (
                          <Alert severity="info">
                            Đã đóng ngày {dateText(contract.closedAt)}. Lý do:{" "}
                            {contract.closeReason}
                          </Alert>
                        )}
                      </>
                    ) : (
                      <div className="supplier-empty">
                        Chưa có hồ sơ hợp đồng của trường.
                        {data.canManage && (
                          <Button onClick={newDraft}>Lập hồ sơ liên kết</Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {tab === 2 && (
                  <div className="supplier-timeline">
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Các thao tác liên kết và hợp đồng được lưu cùng người thực
                      hiện. Dữ liệu đơn hàng, lô hàng và tài liệu cũ vẫn được
                      giữ khi ngừng hợp tác.
                    </Alert>
                    {data.events.length ? (
                      data.events.map((item) => (
                        <article key={item.id}>
                          <strong>
                            {actionLabels[item.action] || item.action}
                          </strong>
                          <p>{item.reason}</p>
                          <small>
                            {item.actorName} ·{" "}
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
        <DialogActions>
          {busy && <CircularProgress size={20} />}
          <Button disabled={busy} onClick={closeWorkspace}>
            Đóng
          </Button>
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
