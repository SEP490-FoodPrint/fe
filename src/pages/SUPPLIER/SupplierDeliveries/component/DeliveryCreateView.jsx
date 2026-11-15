import React, { useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  Add,
  DeleteOutlined,
  KeyboardArrowDown,
  KeyboardArrowLeft,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import SupplierDeliveryService, {
  DELIVERY_SOURCE_TYPE,
  extractApiError,
  formatDateTimeVi,
  generateIdempotencyKey,
  toIsoWithTimezoneOffset,
  validateDeliveryDraft,
} from "src/services/SupplierDeliveryService"
import SupplierOrderService, {
  formatDateVi,
  formatQuantityVi,
  SUPPLY_ORDER_STATUS,
} from "src/services/SupplierOrderService"
import styles from "./DeliveryCreateView.module.scss"

function createEmptyItemRow() {
  return {
    rowKey: generateIdempotencyKey(),
    ingredientId: "",
    actualQuantity: "",
    unit: "",
  }
}

function DeliveryCreateView({ initialSupplyRequestId = "", onCreated }) {
  const [sourceType, setSourceType] = useState(
    initialSupplyRequestId
      ? DELIVERY_SOURCE_TYPE.REQUEST
      : DELIVERY_SOURCE_TYPE.REQUEST,
  )
  const [supplyRequestId, setSupplyRequestId] = useState(initialSupplyRequestId)
  const [schoolId, setSchoolId] = useState("")
  const [items, setItems] = useState(() => [createEmptyItemRow()])
  const [expectedArrivalLocal, setExpectedArrivalLocal] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [note, setNote] = useState("")

  const [acceptedOrders, setAcceptedOrders] = useState([])
  const [schoolOptions, setSchoolOptions] = useState([])
  const [ingredientOptions, setIngredientOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState("")

  const [requestPreview, setRequestPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState("")

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Preserve key across retries of an identical submission, rotate on payload change.
  const idempotencyKeyRef = useRef(generateIdempotencyKey())
  const rotateKey = () => {
    idempotencyKeyRef.current = generateIdempotencyKey()
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoadingOptions(true)
    setOptionsError("")

    Promise.all([
      SupplierOrderService.list({
        page: 1,
        limit: 100,
        status: SUPPLY_ORDER_STATUS.ACCEPTED,
        signal: controller.signal,
      }),
      SupplierDeliveryService.listSchoolOptions({
        page: 1,
        limit: 100,
        signal: controller.signal,
      }),
      SupplierDeliveryService.listIngredientOptions({
        page: 1,
        limit: 100,
        signal: controller.signal,
      }),
    ])
      .then(([ordersRes, schoolsRes, ingredientsRes]) => {
        if (controller.signal.aborted) return
        setAcceptedOrders(ordersRes.items || [])
        setSchoolOptions(schoolsRes.items || [])
        setIngredientOptions(ingredientsRes.items || [])
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setOptionsError(
          extractApiError(
            error,
            "Không thể tải danh sách yêu cầu, trường học hoặc nguyên liệu.",
          ).message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingOptions(false)
        }
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (
      sourceType !== DELIVERY_SOURCE_TYPE.REQUEST ||
      !String(supplyRequestId || "").trim()
    ) {
      setRequestPreview(null)
      setPreviewError("")
      return undefined
    }

    const controller = new AbortController()
    setLoadingPreview(true)
    setPreviewError("")

    SupplierOrderService.getById(supplyRequestId, { signal: controller.signal })
      .then(detail => {
        if (controller.signal.aborted) return
        setRequestPreview(detail)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setRequestPreview(null)
        setPreviewError(
          extractApiError(error, "Không thể tải chi tiết yêu cầu cung ứng.")
            .message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingPreview(false)
        }
      })

    return () => controller.abort()
  }, [sourceType, supplyRequestId])

  const ingredientMap = useMemo(
    () => new Map(ingredientOptions.map(ing => [ing.id, ing])),
    [ingredientOptions],
  )

  const usedIngredientIds = useMemo(
    () => new Set(items.map(row => row.ingredientId).filter(Boolean)),
    [items],
  )

  const selectedRequestSummary = useMemo(
    () =>
      acceptedOrders.find(order => order.id === supplyRequestId) ||
      requestPreview ||
      null,
    [acceptedOrders, supplyRequestId, requestPreview],
  )

  const selectedSchoolSummary = useMemo(
    () => schoolOptions.find(school => school.id === schoolId) || null,
    [schoolOptions, schoolId],
  )

  const handleModeChange = nextMode => {
    if (nextMode === sourceType) return
    rotateKey()
    setSourceType(nextMode)
    setErrors({})
    setSubmitError("")
  }

  const handleAddItemRow = () => {
    if (items.length >= 100) return
    rotateKey()
    setItems(prev => [...prev, createEmptyItemRow()])
    setErrors(prev => ({ ...prev, items: undefined }))
  }

  const handleRemoveItemRow = rowKey => {
    if (items.length <= 1) return
    rotateKey()
    setItems(prev => prev.filter(row => row.rowKey !== rowKey))
    setErrors(prev => ({ ...prev, itemErrors: undefined, items: undefined }))
  }

  const handleIngredientChange = (rowKey, ingredientId) => {
    rotateKey()
    const picked = ingredientMap.get(ingredientId)
    setItems(prev =>
      prev.map(row =>
        row.rowKey === rowKey
          ? {
              ...row,
              ingredientId,
              unit: picked?.defaultUnit || "",
            }
          : row,
      ),
    )
    setErrors(prev => ({ ...prev, itemErrors: undefined, items: undefined }))
  }

  const handleQuantityChange = (rowKey, actualQuantity) => {
    rotateKey()
    setItems(prev =>
      prev.map(row =>
        row.rowKey === rowKey ? { ...row, actualQuantity } : row,
      ),
    )
    setErrors(prev => ({ ...prev, itemErrors: undefined, items: undefined }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    setSubmitError("")

    const check = validateDeliveryDraft({
      sourceType,
      supplyRequestId,
      schoolId,
      items,
      expectedArrivalLocal,
      vehiclePlate,
      note,
    })
    setErrors(check.errors)
    if (!check.valid) return

    setSubmitting(true)
    try {
      const expectedArrivalAt = expectedArrivalLocal
        ? toIsoWithTimezoneOffset(expectedArrivalLocal)
        : null

      const created = await SupplierDeliveryService.create(
        {
          sourceType,
          supplyRequestId,
          schoolId,
          items,
          expectedArrivalAt,
          vehiclePlate,
          note,
        },
        idempotencyKeyRef.current,
      )
      onCreated?.(created)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể tạo đơn giao hàng. Vui lòng kiểm tra lại dữ liệu.",
      )
      setSubmitError(parsed.message)
      if (parsed.status === 409) {
        // Rotate key if backend rejected because key collided with different payload
        if (String(parsed.message || "").includes("Idempotency-Key")) {
          rotateKey()
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const expectedArrivalPreview = expectedArrivalLocal
    ? formatDateTimeVi(toIsoWithTimezoneOffset(expectedArrivalLocal))
    : "Chưa ấn định"

  const summarySchoolName =
    sourceType === DELIVERY_SOURCE_TYPE.REQUEST
      ? selectedRequestSummary?.schoolName || "Chưa chọn"
      : selectedSchoolSummary?.name || "Chưa chọn"

  const summaryItemCount =
    sourceType === DELIVERY_SOURCE_TYPE.REQUEST
      ? requestPreview?.items?.length || 0
      : items.filter(row => row.ingredientId).length

  return (
    <div className={styles.createPage}>
      <header className={styles.headerBar}>
        <div className={styles.navLeft}>
          <Link
            to={ROUTER.SUPPLIER_DELIVERIES}
            className={styles.backBtn}
            aria-label="Quay lại danh sách đơn giao hàng"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
          </Link>
          <div className={styles.headingGroup}>
            <h1 className={styles.pageTitle}>Tạo đơn giao hàng</h1>
            <p className={styles.pageSubtitle}>
              Lập phiếu giao từ yêu cầu đã tiếp nhận hoặc chủ động giao độc lập
              tới trường đang liên kết.
            </p>
          </div>
        </div>
      </header>

      <form className={styles.workspaceForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.mainColumn}>
          {/* 1. Nguồn tạo đơn */}
          <section className={styles.panelCard} aria-labelledby="source-mode-heading">
            <div className={styles.panelHeader}>
              <h2 id="source-mode-heading" className={styles.panelTitle}>
                1. Phương thức tạo đơn giao
              </h2>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.modeGrid} role="radiogroup" aria-label="Phương thức tạo đơn giao">
                <button
                  type="button"
                  role="radio"
                  aria-checked={sourceType === DELIVERY_SOURCE_TYPE.REQUEST}
                  className={`${styles.modeOption} ${
                    sourceType === DELIVERY_SOURCE_TYPE.REQUEST
                      ? styles.isModeSelected
                      : ""
                  }`}
                  onClick={() => handleModeChange(DELIVERY_SOURCE_TYPE.REQUEST)}
                >
                  <span className={styles.modeLabel}>
                    Từ yêu cầu đã tiếp nhận
                  </span>
                  <span className={styles.modeHint}>
                    Sao chép tự động mặt hàng và số lượng từ yêu cầu của trường.
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={sourceType === DELIVERY_SOURCE_TYPE.STANDALONE}
                  className={`${styles.modeOption} ${
                    sourceType === DELIVERY_SOURCE_TYPE.STANDALONE
                      ? styles.isModeSelected
                      : ""
                  }`}
                  onClick={() => handleModeChange(DELIVERY_SOURCE_TYPE.STANDALONE)}
                >
                  <span className={styles.modeLabel}>Tạo đơn giao độc lập</span>
                  <span className={styles.modeHint}>
                    Chọn trường liên kết và danh sách nguyên liệu giao trực tiếp.
                  </span>
                </button>
              </div>

              {optionsError && (
                <p className={styles.fieldError} role="alert">
                  {optionsError}
                </p>
              )}
            </div>
          </section>

          {/* 2. Dữ liệu nguồn theo sourceType */}
          {sourceType === DELIVERY_SOURCE_TYPE.REQUEST ? (
            <section className={styles.panelCard} aria-labelledby="request-source-heading">
              <div className={styles.panelHeader}>
                <h2 id="request-source-heading" className={styles.panelTitle}>
                  2. Yêu cầu cung ứng từ nhà trường
                </h2>
              </div>

              <div className={styles.panelBody}>
                {loadingOptions ? (
                  <div className={styles.loadingBlock} role="status">
                    <CircularProgress size={18} />
                    <span>Đang tải danh sách yêu cầu đã tiếp nhận...</span>
                  </div>
                ) : acceptedOrders.length === 0 && !supplyRequestId ? (
                  <div className={styles.infoNotice}>
                    <span>
                      Hiện chưa có yêu cầu cung ứng nào ở trạng thái{" "}
                      <strong>Đã tiếp nhận</strong>. Bạn có thể tiếp nhận đơn từ
                      nhà trường hoặc chuyển sang tạo đơn giao độc lập.
                    </span>
                    <div className={styles.infoNoticeActions}>
                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() =>
                          handleModeChange(DELIVERY_SOURCE_TYPE.STANDALONE)
                        }
                      >
                        Chuyển sang giao độc lập
                      </Button>
                      <Button
                        component={Link}
                        to={ROUTER.SUPPLIER_ORDERS}
                        variant="text"
                        color="primary"
                        size="small"
                      >
                        Mở Đơn hàng Cung ứng
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="supply-request-select" className={styles.fieldLabel}>
                        <span>{"Chọn yêu cầu đã tiếp nhận "}</span>
                        <span className={styles.requiredMark}>*</span>
                      </label>
                      <div className={styles.selectWrap}>
                        <select
                          id="supply-request-select"
                          value={supplyRequestId}
                          onChange={event => {
                            rotateKey()
                            setSupplyRequestId(event.target.value)
                            setErrors(prev => ({
                              ...prev,
                              supplyRequestId: undefined,
                            }))
                          }}
                          className={`${styles.selectControl} ${
                            errors.supplyRequestId ? styles.hasError : ""
                          }`}
                          aria-invalid={Boolean(errors.supplyRequestId)}
                        >
                          <option value="">-- Chọn mã yêu cầu cần giao --</option>
                          {acceptedOrders.map(order => (
                            <option key={order.id} value={order.id}>
                              {`${order.requestNo} — ${order.schoolName} (Giao: ${formatDateVi(order.requestedDeliveryDate)})`}
                            </option>
                          ))}
                          {supplyRequestId &&
                            !acceptedOrders.some(o => o.id === supplyRequestId) && (
                              <option value={supplyRequestId}>
                                {selectedRequestSummary?.requestNo
                                  ? `${selectedRequestSummary.requestNo} — ${selectedRequestSummary.schoolName}`
                                  : supplyRequestId}
                              </option>
                            )}
                        </select>
                        <KeyboardArrowDown
                          className={styles.selectChevron}
                          aria-hidden="true"
                        />
                      </div>
                      {errors.supplyRequestId && (
                        <p className={styles.fieldError} role="alert">
                          {errors.supplyRequestId}
                        </p>
                      )}
                    </div>

                    {loadingPreview && (
                      <div className={styles.loadingBlock} role="status">
                        <CircularProgress size={18} />
                        <span>Đang tải chi tiết nguyên liệu của yêu cầu...</span>
                      </div>
                    )}

                    {previewError && (
                      <p className={styles.fieldError} role="alert">
                        {previewError}
                      </p>
                    )}

                    {requestPreview && (
                      <>
                        <div className={styles.infoNotice}>
                          <span>
                            Hệ thống sẽ sao chép nguyên vẹn{" "}
                            <strong>{requestPreview.items.length} mặt hàng</strong>{" "}
                            từ yêu cầu <strong>{requestPreview.requestNo}</strong>{" "}
                            và chuyển trạng thái yêu cầu sang{" "}
                            <strong>Đang giao hàng</strong>.
                          </span>
                        </div>

                        {requestPreview.items.length > 0 && (
                          <div className={styles.previewWrap}>
                            <table className={styles.previewTable}>
                              <thead>
                                <tr>
                                  <th scope="col">STT</th>
                                  <th scope="col">Nguyên liệu</th>
                                  <th scope="col" className={styles.colNum}>
                                    Số lượng
                                  </th>
                                  <th scope="col">Đơn vị</th>
                                  <th scope="col">Ghi chú</th>
                                </tr>
                              </thead>
                              <tbody>
                                {requestPreview.items.map((item, idx) => (
                                  <tr key={item.id || idx}>
                                    <td>{idx + 1}</td>
                                    <td>{item.ingredientName}</td>
                                    <td className={styles.colNum}>
                                      {formatQuantityVi(item.requestedQuantity)}
                                    </td>
                                    <td>{item.unit}</td>
                                    <td>{item.note || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </section>
          ) : (
            <section
              className={styles.panelCard}
              aria-labelledby="standalone-source-heading"
            >
              <div className={styles.panelHeader}>
                <h2 id="standalone-source-heading" className={styles.panelTitle}>
                  2. Trường nhận & Danh sách nguyên liệu
                </h2>
              </div>

              <div className={styles.panelBody}>
                {loadingOptions ? (
                  <div className={styles.loadingBlock} role="status">
                    <CircularProgress size={18} />
                    <span>Đang tải danh sách trường liên kết và nguyên liệu...</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="school-select" className={styles.fieldLabel}>
                        <span>{"Trường học nhận hàng "}</span>
                        <span className={styles.requiredMark}>*</span>
                      </label>
                      <div className={styles.selectWrap}>
                        <select
                          id="school-select"
                          value={schoolId}
                          onChange={event => {
                            rotateKey()
                            setSchoolId(event.target.value)
                            setErrors(prev => ({ ...prev, schoolId: undefined }))
                          }}
                          className={`${styles.selectControl} ${
                            errors.schoolId ? styles.hasError : ""
                          }`}
                          aria-invalid={Boolean(errors.schoolId)}
                        >
                          <option value="">-- Chọn trường học đang liên kết --</option>
                          {schoolOptions.map(school => (
                            <option key={school.id} value={school.id}>
                              {school.code
                                ? `${school.name} (${school.code})`
                                : school.name}
                            </option>
                          ))}
                        </select>
                        <KeyboardArrowDown
                          className={styles.selectChevron}
                          aria-hidden="true"
                        />
                      </div>
                      {errors.schoolId && (
                        <p className={styles.fieldError} role="alert">
                          {errors.schoolId}
                        </p>
                      )}
                      {schoolOptions.length === 0 && (
                        <p className={styles.fieldHelper}>
                          Nhà cung cấp hiện chưa có trường liên kết ở trạng thái
                          hoạt động.
                        </p>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldRowHeader}>
                        <span className={styles.fieldLabel}>
                          <span>{"Nguyên liệu giao "}</span>
                          <span className={styles.requiredMark}>*</span>
                        </span>
                        <span className={styles.charHint}>
                          {`${items.length}/100 dòng`}
                        </span>
                      </div>

                      <div className={styles.itemsList}>
                        {items.map((row, idx) => {
                          const rowErr = errors.itemErrors?.[idx] || {}
                          return (
                            <div key={row.rowKey} className={styles.itemRow}>
                              <span className={styles.rowIndex}>{idx + 1}</span>

                              <div className={styles.rowCell}>
                                <div className={styles.selectWrap}>
                                  <select
                                    value={row.ingredientId}
                                    onChange={event =>
                                      handleIngredientChange(
                                        row.rowKey,
                                        event.target.value,
                                      )
                                    }
                                    className={`${styles.selectControl} ${
                                      rowErr.ingredientId ? styles.hasError : ""
                                    }`}
                                    aria-label={`Nguyên liệu dòng ${idx + 1}`}
                                    aria-invalid={Boolean(rowErr.ingredientId)}
                                  >
                                    <option value="">-- Chọn nguyên liệu --</option>
                                    {ingredientOptions.map(ing => {
                                      const alreadyUsed =
                                        usedIngredientIds.has(ing.id) &&
                                        ing.id !== row.ingredientId
                                      return (
                                        <option
                                          key={ing.id}
                                          value={ing.id}
                                          disabled={alreadyUsed}
                                        >
                                          {alreadyUsed
                                            ? `${ing.name} (${ing.defaultUnit}) — Đã chọn`
                                            : `${ing.name} (${ing.defaultUnit})`}
                                        </option>
                                      )
                                    })}
                                  </select>
                                  <KeyboardArrowDown
                                    className={styles.selectChevron}
                                    aria-hidden="true"
                                  />
                                </div>
                                {rowErr.ingredientId && (
                                  <p className={styles.fieldError} role="alert">
                                    {rowErr.ingredientId}
                                  </p>
                                )}
                              </div>

                              <div className={styles.rowCell}>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={row.actualQuantity}
                                  onChange={event =>
                                    handleQuantityChange(
                                      row.rowKey,
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Số lượng (VD: 12.5)"
                                  className={`${styles.textInput} ${
                                    rowErr.actualQuantity ? styles.hasError : ""
                                  }`}
                                  aria-label={`Số lượng dòng ${idx + 1}`}
                                  aria-invalid={Boolean(rowErr.actualQuantity)}
                                />
                                {rowErr.actualQuantity && (
                                  <p className={styles.fieldError} role="alert">
                                    {rowErr.actualQuantity}
                                  </p>
                                )}
                              </div>

                              <div className={styles.unitBox} aria-label="Đơn vị tính">
                                {row.unit || "Đơn vị"}
                              </div>

                              <button
                                type="button"
                                className={styles.removeRowBtn}
                                disabled={items.length <= 1}
                                onClick={() => handleRemoveItemRow(row.rowKey)}
                                aria-label={`Xóa dòng nguyên liệu ${idx + 1}`}
                              >
                                <DeleteOutlined fontSize="small" />
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      {errors.items && (
                        <p className={styles.fieldError} role="alert">
                          {errors.items}
                        </p>
                      )}

                      <div className={styles.addRowBar}>
                        <Button
                          type="button"
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Add />}
                          disabled={
                            items.length >= 100 ||
                            (ingredientOptions.length > 0 &&
                              items.length >= ingredientOptions.length)
                          }
                          onClick={handleAddItemRow}
                        >
                          Thêm nguyên liệu
                        </Button>
                        <span className={styles.fieldHelper}>
                          Đơn vị tự động lấy theo đơn vị mặc định của nguyên liệu.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* 3. Thông tin vận chuyển & ghi chú */}
          <section className={styles.panelCard} aria-labelledby="logistics-heading">
            <div className={styles.panelHeader}>
              <h2 id="logistics-heading" className={styles.panelTitle}>
                3. Thông tin vận chuyển & Ghi chú
              </h2>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.twoColFields}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="expected-arrival-input" className={styles.fieldLabel}>
                    Thời gian dự kiến đến trường
                  </label>
                  <input
                    id="expected-arrival-input"
                    type="datetime-local"
                    value={expectedArrivalLocal}
                    onChange={event => {
                      rotateKey()
                      setExpectedArrivalLocal(event.target.value)
                      setErrors(prev => ({
                        ...prev,
                        expectedArrivalAt: undefined,
                      }))
                    }}
                    className={`${styles.textInput} ${
                      errors.expectedArrivalAt ? styles.hasError : ""
                    }`}
                  />
                  {errors.expectedArrivalAt ? (
                    <p className={styles.fieldError} role="alert">
                      {errors.expectedArrivalAt}
                    </p>
                  ) : (
                    <p className={styles.fieldHelper}>
                      Không bắt buộc — bỏ trống nếu chưa chốt giờ xe đến.
                    </p>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="vehicle-plate-input" className={styles.fieldLabel}>
                    Biển số xe giao hàng
                  </label>
                  <input
                    id="vehicle-plate-input"
                    type="text"
                    maxLength={40}
                    value={vehiclePlate}
                    onChange={event => {
                      rotateKey()
                      setVehiclePlate(event.target.value)
                      setErrors(prev => ({ ...prev, vehiclePlate: undefined }))
                    }}
                    placeholder="VD: 51C-12345"
                    className={`${styles.textInput} ${
                      errors.vehiclePlate ? styles.hasError : ""
                    }`}
                  />
                  {errors.vehiclePlate && (
                    <p className={styles.fieldError} role="alert">
                      {errors.vehiclePlate}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.fieldRowHeader}>
                  <label htmlFor="delivery-note-input" className={styles.fieldLabel}>
                    Ghi chú đơn giao
                  </label>
                  <span className={styles.charHint}>{`${note.length}/2000`}</span>
                </div>
                <textarea
                  id="delivery-note-input"
                  maxLength={2000}
                  value={note}
                  onChange={event => {
                    rotateKey()
                    setNote(event.target.value)
                    setErrors(prev => ({ ...prev, note: undefined }))
                  }}
                  placeholder="Ghi chú về quy cách đóng gói, bảo quản lạnh hoặc cổng nhận hàng..."
                  className={`${styles.textArea} ${
                    errors.note ? styles.hasError : ""
                  }`}
                />
                {errors.note && (
                  <p className={styles.fieldError} role="alert">
                    {errors.note}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Summary Column */}
        <aside className={styles.summaryColumn}>
          <section className={styles.panelCard} aria-labelledby="summary-heading">
            <div className={styles.panelHeader}>
              <h2 id="summary-heading" className={styles.panelTitle}>
                Tóm tắt đơn giao
              </h2>
            </div>

            <div className={styles.panelBody}>
              <dl className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <dt>Phương thức</dt>
                  <dd>
                    {sourceType === DELIVERY_SOURCE_TYPE.REQUEST
                      ? "Từ yêu cầu trường"
                      : "Giao độc lập"}
                  </dd>
                </div>

                {sourceType === DELIVERY_SOURCE_TYPE.REQUEST && (
                  <div className={styles.summaryRow}>
                    <dt>Mã yêu cầu</dt>
                    <dd>{selectedRequestSummary?.requestNo || "Chưa chọn"}</dd>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <dt>Trường nhận</dt>
                  <dd>{summarySchoolName}</dd>
                </div>

                <div className={styles.summaryRow}>
                  <dt>Số mặt hàng</dt>
                  <dd>{`${summaryItemCount} mặt hàng`}</dd>
                </div>

                <div className={styles.summaryRow}>
                  <dt>Dự kiến đến</dt>
                  <dd>{expectedArrivalPreview}</dd>
                </div>

                <div className={styles.summaryRow}>
                  <dt>Biển số xe</dt>
                  <dd>{vehiclePlate.trim() || "—"}</dd>
                </div>
              </dl>

              {submitError && (
                <p className={styles.submitErrorBanner} role="alert">
                  {submitError}
                </p>
              )}

              <div className={styles.summaryActions}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={styles.submitBtn}
                  disabled={submitting || loadingOptions}
                >
                  {submitting ? "Đang tạo đơn giao..." : "Tạo đơn giao hàng"}
                </Button>
                <Button
                  component={Link}
                  to={ROUTER.SUPPLIER_DELIVERIES}
                  variant="outlined"
                  color="primary"
                  className={styles.cancelBtn}
                  disabled={submitting}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </section>
        </aside>
      </form>
    </div>
  )
}

DeliveryCreateView.propTypes = {
  initialSupplyRequestId: PropTypes.string,
  onCreated: PropTypes.func,
}

export default DeliveryCreateView
