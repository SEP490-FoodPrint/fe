import React, { useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, CircularProgress } from "@mui/material"
import {
  Add,
  ArrowBack,
  ArrowForward,
  DeleteOutlined,
  InfoOutlined,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  LocalShippingOutlined,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import SupplierDeliveryService, {
  DELIVERY_SOURCE_TYPE,
  DUPLICATE_INGREDIENT_FACILITY_MSG,
  extractApiError,
  formatQuantityVi,
  formatSourceFacilityLabel,
  generateIdempotencyKey,
  getDuplicateIngredientFacilityIndices,
  normalizeOptionId,
  ORDER_CREATION_STAGE,
  toIsoWithTimezoneOffset,
  validateDeliveryDraft,
  validateDeliveryIngredientsStep,
  validateDeliveryLogisticsStep,
  WORKFLOW_STAGE_STATUS,
} from "src/services/SupplierDeliveryService"
import DeliveryStageStepper from "./DeliveryStageStepper"
import WorkflowStageBadge from "./WorkflowStageBadge"
import styles from "./DeliveryCreateView.module.scss"

const MANUAL_ORDER_STEPS = [
  {
    key: ORDER_CREATION_STAGE.INGREDIENTS,
    title: "1. Trường nhận & nguyên liệu",
    statusText: "Đang chuẩn bị hàng",
  },
  {
    key: ORDER_CREATION_STAGE.LOGISTICS,
    title: "2. Vận chuyển & biển số xe",
    statusText: "Đang giao hàng",
  },
]

function createEmptyItemRow(defaultFacilityId = "") {
  return {
    rowKey: generateIdempotencyKey(),
    ingredientId: "",
    sourceFacilityId: defaultFacilityId,
    actualQuantity: "",
    unit: "",
    // Ngày của lô: bắt buộc nếu trường xếp nguyên liệu là đồ khô (BE kiểm tra theo danh mục của trường).
    manufactureDate: "",
    expiryDate: "",
  }
}

function buildDuplicateItemErrors(rows = []) {
  const duplicateIndices = getDuplicateIngredientFacilityIndices(rows)
  if (duplicateIndices.size === 0) return undefined
  const mapped = {}
  duplicateIndices.forEach(index => {
    mapped[index] = {
      sourceFacilityId: DUPLICATE_INGREDIENT_FACILITY_MSG,
    }
  })
  return mapped
}

function mapApiItemsFieldErrors(fieldErrors = {}) {
  const mapped = {}
  Object.entries(fieldErrors).forEach(([field, message]) => {
    const match = /^items\.(\d+)\.(\w+)$/.exec(field)
    if (!match) return
    const index = Number(match[1])
    const key = match[2]
    if (!Number.isInteger(index) || index < 0) return
    mapped[index] = {
      ...(mapped[index] || {}),
      [key]: message,
    }
  })
  return mapped
}

function DeliveryCreateView({ prefillDeliveryId = "", onCreated }) {
  const [schoolOptions, setSchoolOptions] = useState([])
  const [ingredientOptions, setIngredientOptions] = useState([])
  const [sourceFacilityOptions, setSourceFacilityOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState("")

  // Proactive manual delivery starts directly at Step 1 (school + ingredients -> preparing)
  const [stage, setStage] = useState(ORDER_CREATION_STAGE.INGREDIENTS)
  const [highestStageIndex, setHighestStageIndex] = useState(0)
  const [pendingDispatchDelivery, setPendingDispatchDelivery] = useState(null)

  // Step 1 state
  const [schoolId, setSchoolId] = useState("")
  const [items, setItems] = useState(() => [createEmptyItemRow()])
  const [prefillNotice, setPrefillNotice] = useState(null)

  // Step 2 state (preserved when navigating back to Step 1)
  const [expectedArrivalLocal, setExpectedArrivalLocal] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [note, setNote] = useState("")

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const idempotencyKeyRef = useRef(generateIdempotencyKey())
  const rotateKey = () => {
    idempotencyKeyRef.current = generateIdempotencyKey()
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoadingOptions(true)
    setOptionsError("")

    const prefillPromise = prefillDeliveryId
      ? SupplierDeliveryService.getById(prefillDeliveryId, {
          signal: controller.signal,
        }).catch(() => null)
      : Promise.resolve(null)

    Promise.all([
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
      SupplierDeliveryService.listSourceFacilityOptions({
        page: 1,
        limit: 100,
        signal: controller.signal,
      }),
      prefillPromise,
    ])
      .then(([schoolsRes, ingredientsRes, facilitiesRes, prefilledDelivery]) => {
        if (controller.signal.aborted) return
        const schools = schoolsRes.items || []
        const ingredients = ingredientsRes.items || []
        const facilities = facilitiesRes.items || []

        setSchoolOptions(schools)
        setIngredientOptions(ingredients)
        setSourceFacilityOptions(facilities)

        const defaultFacilityId =
          facilities.length === 1 ? facilities[0].id : ""

        if (prefilledDelivery) {
          const schoolValid = schools.some(
            s => s.id === prefilledDelivery.schoolId,
          )
          setSchoolId(schoolValid ? prefilledDelivery.schoolId : "")

          const validIngMap = new Map(ingredients.map(i => [i.id, i]))
          const activeFacIds = new Set(facilities.map(f => f.id))
          const mappedRows = (prefilledDelivery.items || [])
            .filter(it => validIngMap.has(it.ingredientId))
            .map(it => {
              const ing = validIngMap.get(it.ingredientId)
              const facId =
                it.sourceFacility?.id && activeFacIds.has(it.sourceFacility.id)
                  ? it.sourceFacility.id
                  : defaultFacilityId
              return {
                rowKey: generateIdempotencyKey(),
                ingredientId: it.ingredientId,
                sourceFacilityId: facId,
                actualQuantity: it.actualQuantity || "",
                unit: ing?.defaultUnit || it.unit || "",
              }
            })

          setItems(
            mappedRows.length > 0
              ? mappedRows
              : [createEmptyItemRow(defaultFacilityId)],
          )
          setPrefillNotice({
            deliveryNo: prefilledDelivery.deliveryNo || prefilledDelivery.id,
          })
        } else if (defaultFacilityId) {
          setItems(prev =>
            prev.map(row =>
              row.sourceFacilityId
                ? row
                : { ...row, sourceFacilityId: defaultFacilityId },
            ),
          )
        }
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setOptionsError(
          extractApiError(
            error,
            "Không thể tải danh mục trường học, nguyên liệu và cơ sở nguồn cung.",
          ).message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingOptions(false)
        }
      })

    return () => controller.abort()
  }, [prefillDeliveryId])

  const ingredientMap = useMemo(
    () => new Map(ingredientOptions.map(ing => [ing.id, ing])),
    [ingredientOptions],
  )

  const maxItemRows =
    ingredientOptions.length > 0 && sourceFacilityOptions.length > 0
      ? Math.min(100, ingredientOptions.length * sourceFacilityOptions.length)
      : 100

  const getOtherUsedFacilitySet = (excludeRowKey, targetIngredientId) => {
    const targetIng = normalizeOptionId(targetIngredientId)
    const used = new Set()
    if (!targetIng) return used
    items.forEach(other => {
      if (other.rowKey === excludeRowKey) return
      if (normalizeOptionId(other.ingredientId) !== targetIng) return
      const facId = normalizeOptionId(other.sourceFacilityId)
      if (facId) used.add(facId)
    })
    return used
  }

  const singleDefaultFacilityId =
    sourceFacilityOptions.length === 1 ? sourceFacilityOptions[0].id : ""

  const selectedSchoolSummary = useMemo(
    () => schoolOptions.find(school => school.id === schoolId) || null,
    [schoolOptions, schoolId],
  )

  const facilityMap = useMemo(
    () => new Map(sourceFacilityOptions.map(fac => [fac.id, fac])),
    [sourceFacilityOptions],
  )

  const applyItemsChange = nextItems => {
    rotateKey()
    setSubmitError("")
    setItems(nextItems)
    setErrors(prev => ({
      ...prev,
      items: undefined,
      itemErrors: buildDuplicateItemErrors(nextItems),
    }))
  }

  const handleAddItemRow = () => {
    if (items.length >= maxItemRows) return
    applyItemsChange([...items, createEmptyItemRow(singleDefaultFacilityId)])
  }

  const handleRemoveItemRow = rowKey => {
    if (items.length <= 1) return
    applyItemsChange(items.filter(row => row.rowKey !== rowKey))
  }

  const handleIngredientChange = (rowKey, ingredientId) => {
    const picked = ingredientMap.get(ingredientId)
    applyItemsChange(
      items.map(row =>
        row.rowKey === rowKey
          ? {
              ...row,
              ingredientId,
              unit: picked?.defaultUnit || "",
            }
          : row,
      ),
    )
  }

  const handleRowFacilityChange = (rowKey, sourceFacilityId) => {
    applyItemsChange(
      items.map(row =>
        row.rowKey === rowKey ? { ...row, sourceFacilityId } : row,
      ),
    )
  }

  const handleApplyAllStandaloneFacilities = sourceFacilityId => {
    if (!sourceFacilityId) return
    applyItemsChange(items.map(row => ({ ...row, sourceFacilityId })))
  }

  const handleLotDateChange = (rowKey, field, value) => {
    applyItemsChange(
      items.map(row => (row.rowKey === rowKey ? { ...row, [field]: value } : row)),
    )
  }

  const handleQuantityChange = (rowKey, actualQuantity) => {
    applyItemsChange(
      items.map(row =>
        row.rowKey === rowKey ? { ...row, actualQuantity } : row,
      ),
    )
  }

  const handleCompleteIngredientsStep = () => {
    setSubmitError("")
    const check = validateDeliveryIngredientsStep({
      sourceType: DELIVERY_SOURCE_TYPE.STANDALONE,
      schoolId,
      items,
    })
    if (!check.valid) {
      setErrors(prev => ({
        ...prev,
        schoolId: check.errors.schoolId,
        items: check.errors.items,
        itemErrors: check.errors.itemErrors,
      }))
      return
    }
    setErrors(prev => ({
      ...prev,
      schoolId: undefined,
      items: undefined,
      itemErrors: undefined,
    }))
    setHighestStageIndex(prev => Math.max(prev, 1))
    setStage(ORDER_CREATION_STAGE.LOGISTICS)
  }

  const handleStepSelect = step => {
    if (submitting || pendingDispatchDelivery) return
    if (step.key === ORDER_CREATION_STAGE.INGREDIENTS) {
      setSubmitError("")
      setStage(ORDER_CREATION_STAGE.INGREDIENTS)
      return
    }
    if (step.key === ORDER_CREATION_STAGE.LOGISTICS) {
      handleCompleteIngredientsStep()
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    if (stage !== ORDER_CREATION_STAGE.LOGISTICS) {
      handleCompleteIngredientsStep()
      return
    }
    setSubmitError("")

    const check = pendingDispatchDelivery
      ? validateDeliveryLogisticsStep({
          expectedArrivalLocal,
          vehiclePlate,
        })
      : validateDeliveryDraft({
          sourceType: DELIVERY_SOURCE_TYPE.STANDALONE,
          schoolId,
          items,
          expectedArrivalLocal,
          vehiclePlate,
          note,
        })
    setErrors(check.errors)
    if (!check.valid) {
      if (
        !pendingDispatchDelivery &&
        (check.errors.schoolId || check.errors.items || check.errors.itemErrors)
      ) {
        setStage(ORDER_CREATION_STAGE.INGREDIENTS)
      }
      return
    }

    setSubmitting(true)
    try {
      let activeDraft = pendingDispatchDelivery
      if (!activeDraft) {
        activeDraft = await SupplierDeliveryService.create(
          {
            sourceType: DELIVERY_SOURCE_TYPE.STANDALONE,
            schoolId,
            items,
            note,
          },
          idempotencyKeyRef.current,
        )
        setPendingDispatchDelivery(activeDraft)
      }

      const expectedArrivalAt = toIsoWithTimezoneOffset(expectedArrivalLocal)
      const dispatched = await SupplierDeliveryService.dispatch(activeDraft.id, {
        expectedArrivalAt,
        vehiclePlate,
      })
      onCreated?.(dispatched)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể tạo đơn thủ công. Vui lòng kiểm tra lại dữ liệu.",
      )
      setSubmitError(parsed.message)
      const parsedItemErrors = mapApiItemsFieldErrors(parsed.fieldErrors)
      const hasLogisticsFieldError = Boolean(
        parsed.fieldErrors?.expectedArrivalAt ||
          parsed.fieldErrors?.vehiclePlate ||
          parsed.fieldErrors?.note,
      )
      const hasStep1Error = Boolean(
        !pendingDispatchDelivery &&
          (parsed.fieldErrors?.schoolId ||
            parsed.fieldErrors?.items ||
            Object.keys(parsedItemErrors).length > 0),
      )

      if (hasStep1Error || hasLogisticsFieldError) {
        setErrors(prev => ({
          ...prev,
          ...(parsed.fieldErrors?.schoolId
            ? { schoolId: parsed.fieldErrors.schoolId }
            : {}),
          ...(parsed.fieldErrors?.items
            ? { items: parsed.fieldErrors.items }
            : {}),
          ...(Object.keys(parsedItemErrors).length > 0
            ? { itemErrors: parsedItemErrors }
            : {}),
          ...(parsed.fieldErrors?.expectedArrivalAt
            ? { expectedArrivalAt: parsed.fieldErrors.expectedArrivalAt }
            : {}),
          ...(parsed.fieldErrors?.vehiclePlate
            ? { vehiclePlate: parsed.fieldErrors.vehiclePlate }
            : {}),
          ...(parsed.fieldErrors?.note ? { note: parsed.fieldErrors.note } : {}),
        }))
        if (hasStep1Error) {
          setStage(ORDER_CREATION_STAGE.INGREDIENTS)
        }
      }
      if (
        !pendingDispatchDelivery &&
        parsed.status === 409 &&
        String(parsed.message || "").includes("Idempotency-Key")
      ) {
        rotateKey()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const activeStageIndex = stage === ORDER_CREATION_STAGE.LOGISTICS ? 1 : 0
  const selectedSchoolName = selectedSchoolSummary?.name || "Chưa chọn trường"
  const isStep1Locked = Boolean(pendingDispatchDelivery)

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
          <h1 className={styles.pageTitle}>Tạo đơn thủ công</h1>
        </div>
      </header>

      <DeliveryStageStepper
        activeIndex={activeStageIndex}
        steps={MANUAL_ORDER_STEPS}
        onStepSelect={handleStepSelect}
        isStepClickable={(_step, index) =>
          !submitting &&
          !isStep1Locked &&
          index !== activeStageIndex &&
          index <= highestStageIndex
        }
      />

      {prefillNotice && (
        <div className={styles.prefillBanner} role="status">
          <InfoOutlined className={styles.prefillIcon} aria-hidden="true" />
          <div className={styles.prefillContent}>
            <strong>{`Lập đơn giao lại từ ${prefillNotice.deliveryNo}`}</strong>
          </div>
        </div>
      )}

      <form className={styles.workspaceForm} onSubmit={handleSubmit} noValidate>
        {stage === ORDER_CREATION_STAGE.INGREDIENTS ? (
          <section
            className={styles.panelCard}
            aria-labelledby="step-ingredients-heading"
          >
            <div className={styles.panelHeader}>
              <h2 id="step-ingredients-heading" className={styles.panelTitle}>
                1. Chọn trường nhận &amp; nguyên liệu
              </h2>
              <WorkflowStageBadge status={WORKFLOW_STAGE_STATUS.PREPARING} />
            </div>

            <div className={styles.panelBody}>
              {optionsError && (
                <p className={styles.fieldError} role="alert">
                  {optionsError}
                </p>
              )}

              {loadingOptions ? (
                <div className={styles.loadingBlock} role="status">
                  <CircularProgress size={18} />
                  <span>Đang tải danh mục trường học, nguyên liệu và cơ sở nguồn cung...</span>
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
                      <p className={styles.fieldError}>
                        Nhà cung cấp hiện chưa có trường liên kết ở trạng thái hoạt động.
                      </p>
                    )}
                  </div>

                  {sourceFacilityOptions.length === 0 && (
                    <div className={styles.warningNotice} role="alert">
                      <span>
                        Chưa có cơ sở nguồn cung đang hoạt động. Vui lòng thiết lập tại{" "}
                        <Link
                          to={ROUTER.SUPPLIER_SOURCE_FACILITIES}
                          className={styles.inlineLink}
                        >
                          Cơ sở nguồn cung
                        </Link>
                        .
                      </span>
                    </div>
                  )}

                  {items.length > 1 && sourceFacilityOptions.length > 0 && (
                    <div className={styles.bulkBar}>
                      <label
                        htmlFor="standalone-bulk-facility"
                        className={styles.bulkLabel}
                      >
                        Áp dụng nhanh cơ sở nguồn cung cho tất cả dòng
                      </label>
                      <div className={styles.selectWrap}>
                        <select
                          id="standalone-bulk-facility"
                          defaultValue=""
                          onChange={event => {
                            if (event.target.value) {
                              handleApplyAllStandaloneFacilities(event.target.value)
                              event.target.value = ""
                            }
                          }}
                          className={styles.selectControl}
                        >
                          <option value="">
                            -- Chọn để gán hàng loạt cơ sở nguồn cung --
                          </option>
                          {sourceFacilityOptions.map(fac => (
                            <option key={fac.id} value={fac.id}>
                              {formatSourceFacilityLabel(fac)}
                            </option>
                          ))}
                        </select>
                        <KeyboardArrowDown
                          className={styles.selectChevron}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  )}

                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldRowHeader}>
                      <span className={styles.fieldLabel}>
                        <span>{"Nguyên liệu & Cơ sở nguồn cung "}</span>
                        <span className={styles.requiredMark}>*</span>
                      </span>
                      <span className={styles.charHint}>
                        {`${items.length}/100 dòng`}
                      </span>
                    </div>

                    <div className={styles.itemsList}>
                      {items.map((row, idx) => {
                        const rowErr = errors.itemErrors?.[idx] || {}
                        const otherUsedFacilities = row.ingredientId
                          ? getOtherUsedFacilitySet(row.rowKey, row.ingredientId)
                          : null

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
                                  <option value="">-- Chọn nguyên liệu * --</option>
                                  {ingredientOptions.map(ing => {
                                    const usedFacilitiesCount =
                                      getOtherUsedFacilitySet(
                                        row.rowKey,
                                        ing.id,
                                      ).size
                                    const allFacilitiesUsed =
                                      sourceFacilityOptions.length > 0 &&
                                      usedFacilitiesCount >=
                                        sourceFacilityOptions.length &&
                                      normalizeOptionId(ing.id) !==
                                        normalizeOptionId(row.ingredientId)

                                    return (
                                      <option
                                        key={ing.id}
                                        value={ing.id}
                                        disabled={allFacilitiesUsed}
                                      >
                                        {allFacilitiesUsed
                                          ? `${ing.name} (${ing.defaultUnit}) — Đã đủ cơ sở`
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
                              <div className={styles.selectWrap}>
                                <select
                                  value={row.sourceFacilityId}
                                  disabled={sourceFacilityOptions.length === 0}
                                  onChange={event =>
                                    handleRowFacilityChange(
                                      row.rowKey,
                                      event.target.value,
                                    )
                                  }
                                  className={`${styles.selectControl} ${
                                    rowErr.sourceFacilityId ? styles.hasError : ""
                                  }`}
                                  aria-label={`Cơ sở nguồn cung dòng ${idx + 1}`}
                                  aria-invalid={Boolean(rowErr.sourceFacilityId)}
                                >
                                  <option value="">
                                    -- Chọn cơ sở nguồn cung * --
                                  </option>
                                  {sourceFacilityOptions.map(fac => {
                                    const facNorm = normalizeOptionId(fac.id)
                                    const alreadyUsedForIngredient =
                                      Boolean(otherUsedFacilities?.has(facNorm)) &&
                                      facNorm !==
                                        normalizeOptionId(row.sourceFacilityId)

                                    return (
                                      <option
                                        key={fac.id}
                                        value={fac.id}
                                        disabled={alreadyUsedForIngredient}
                                      >
                                        {alreadyUsedForIngredient
                                          ? `${formatSourceFacilityLabel(fac)} — Đã chọn`
                                          : formatSourceFacilityLabel(fac)}
                                      </option>
                                    )
                                  })}
                                </select>
                                <KeyboardArrowDown
                                  className={styles.selectChevron}
                                  aria-hidden="true"
                                />
                              </div>
                              {rowErr.sourceFacilityId && (
                                <p className={styles.fieldError} role="alert">
                                  {rowErr.sourceFacilityId}
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
                                placeholder="Số lượng"
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

                            <div className={styles.rowCell} title="Bắt buộc với đồ khô">
                              <input
                                type="date"
                                value={row.manufactureDate || ""}
                                onChange={event => handleLotDateChange(row.rowKey, "manufactureDate", event.target.value)}
                                className={styles.textInput}
                                aria-label={`Ngày sản xuất dòng ${idx + 1} (bắt buộc với đồ khô)`}
                              />
                            </div>

                            <div className={styles.rowCell} title="Bắt buộc với đồ khô">
                              <input
                                type="date"
                                value={row.expiryDate || ""}
                                onChange={event => handleLotDateChange(row.rowKey, "expiryDate", event.target.value)}
                                className={styles.textInput}
                                aria-label={`Hạn sử dụng dòng ${idx + 1} (bắt buộc với đồ khô)`}
                              />
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
                        disabled={items.length >= maxItemRows}
                        onClick={handleAddItemRow}
                      >
                        Thêm nguyên liệu
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.panelFooter}>
              <Button
                component={Link}
                to={ROUTER.SUPPLIER_DELIVERIES}
                variant="outlined"
                color="inherit"
                className={styles.footerSecondaryBtn}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                className={styles.footerPrimaryBtn}
                disabled={loadingOptions}
                endIcon={<ArrowForward fontSize="small" />}
                onClick={handleCompleteIngredientsStep}
              >
                Hoàn tất nguyên liệu
              </Button>
            </div>
          </section>
        ) : (
          <section
            className={styles.panelCard}
            aria-labelledby="logistics-heading"
          >
            <div className={styles.panelHeader}>
              <h2 id="logistics-heading" className={styles.panelTitle}>
                2. Nhập thời gian dự kiến &amp; biển số xe
              </h2>
              <WorkflowStageBadge status={WORKFLOW_STAGE_STATUS.PREPARING} />
            </div>

            <div className={styles.panelBody}>
              {pendingDispatchDelivery && (
                <div className={styles.prefillBanner} role="status">
                  <InfoOutlined className={styles.prefillIcon} aria-hidden="true" />
                  <div className={styles.prefillContent}>
                    <strong>
                      {`Đã tạo đơn ${pendingDispatchDelivery.deliveryNo || ""} (Đang chuẩn bị hàng). Hoàn tất thông tin vận chuyển để bắt đầu giao.`}
                    </strong>
                  </div>
                </div>
              )}

              <div className={styles.recapBox}>
                <div className={styles.recapHeader}>
                  <span>
                    <strong>{selectedSchoolName}</strong>{" "}
                    {`· ${items.length} dòng nguyên liệu`}
                  </span>
                  <button
                    type="button"
                    className={styles.inlineActionBtn}
                    disabled={submitting || isStep1Locked}
                    onClick={() => setStage(ORDER_CREATION_STAGE.INGREDIENTS)}
                  >
                    Đổi trường / sửa nguyên liệu
                  </button>
                </div>
                <ul className={styles.recapList}>
                  {items.map((row, idx) => {
                    const ing = ingredientMap.get(row.ingredientId)
                    const fac = facilityMap.get(row.sourceFacilityId)
                    return (
                      <li key={row.rowKey || idx} className={styles.recapItem}>
                        <div className={styles.recapItemTop}>
                          <span className={styles.recapName}>
                            {ing?.name || "Nguyên liệu"}
                          </span>
                          <span className={styles.recapQty}>
                            {`${formatQuantityVi(row.actualQuantity)} ${row.unit || ""}`.trim()}
                          </span>
                        </div>
                        <span className={styles.recapFacility}>
                          {fac
                            ? formatSourceFacilityLabel(fac)
                            : "Đã gắn cơ sở nguồn cung"}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className={styles.twoColFields}>
                <div className={styles.fieldGroup}>
                  <label
                    htmlFor="expected-arrival-input"
                    className={styles.fieldLabel}
                  >
                    <span>{"Thời gian dự kiến đến trường "}</span>
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    id="expected-arrival-input"
                    type="datetime-local"
                    required
                    value={expectedArrivalLocal}
                    onChange={event => {
                      if (!isStep1Locked) rotateKey()
                      setExpectedArrivalLocal(event.target.value)
                      setErrors(prev => ({
                        ...prev,
                        expectedArrivalAt: undefined,
                      }))
                    }}
                    className={`${styles.textInput} ${
                      errors.expectedArrivalAt ? styles.hasError : ""
                    }`}
                    aria-invalid={Boolean(errors.expectedArrivalAt)}
                  />
                  {errors.expectedArrivalAt && (
                    <p className={styles.fieldError} role="alert">
                      {errors.expectedArrivalAt}
                    </p>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label
                    htmlFor="vehicle-plate-input"
                    className={styles.fieldLabel}
                  >
                    <span>{"Biển số xe giao hàng "}</span>
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <input
                    id="vehicle-plate-input"
                    type="text"
                    required
                    maxLength={40}
                    value={vehiclePlate}
                    onChange={event => {
                      if (!isStep1Locked) rotateKey()
                      setVehiclePlate(event.target.value)
                      setErrors(prev => ({
                        ...prev,
                        vehiclePlate: undefined,
                      }))
                    }}
                    placeholder="VD: 51C-12345"
                    className={`${styles.textInput} ${
                      errors.vehiclePlate ? styles.hasError : ""
                    }`}
                    aria-invalid={Boolean(errors.vehiclePlate)}
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
                  <label
                    htmlFor="delivery-note-input"
                    className={styles.fieldLabel}
                  >
                    Ghi chú đơn giao
                  </label>
                  <span className={styles.charHint}>{`${note.length}/2000`}</span>
                </div>
                <textarea
                  id="delivery-note-input"
                  maxLength={2000}
                  disabled={submitting || isStep1Locked}
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

              {submitError && (
                <p className={styles.submitErrorBanner} role="alert">
                  {submitError}
                </p>
              )}
            </div>

            <div className={styles.panelFooter}>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                className={styles.footerSecondaryBtn}
                disabled={submitting || isStep1Locked}
                startIcon={<ArrowBack fontSize="small" />}
                onClick={() => setStage(ORDER_CREATION_STAGE.INGREDIENTS)}
              >
                Quay lại bước 1
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={styles.footerPrimaryBtn}
                disabled={submitting}
                startIcon={<LocalShippingOutlined fontSize="small" />}
              >
                {submitting
                  ? "Đang tạo đơn & giao hàng..."
                  : "Hoàn tất & Giao hàng"}
              </Button>
            </div>
          </section>
        )}
      </form>
    </div>
  )
}

DeliveryCreateView.propTypes = {
  prefillDeliveryId: PropTypes.string,
  onCreated: PropTypes.func,
}

export default DeliveryCreateView
