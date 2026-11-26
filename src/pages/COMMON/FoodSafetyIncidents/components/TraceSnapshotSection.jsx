import React, { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import {
  ContentCopyOutlined,
  ExpandLess,
  ExpandMore,
  GppBadOutlined,
  ReplayOutlined,
  VerifiedUserOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material"
import notice from "src/components/Notice"
import FoodSafetyIncidentService, {
  extractApiError,
  formatDateTimeVi,
  formatDateVi,
  getCompletenessMeta,
  MEAL_TYPE_LABELS,
  MISSING_REASON_LABELS,
} from "src/services/FoodSafetyIncidentService"
import IncidentStatusBadge from "./IncidentStatusBadge"
import styles from "../FoodSafetyIncidents.module.scss"

function formatMissingReason(item) {
  if (!item) return ""
  if (typeof item === "string") {
    return MISSING_REASON_LABELS[item] || item
  }
  const base = MISSING_REASON_LABELS[item.code] || item.code || "Thiếu dữ liệu"
  const details = []
  if (item.mealAllocationId) details.push(`Suất ăn: ${item.mealAllocationId.slice(0, 8)}`)
  if (item.cookingBatchId) details.push(`Mẻ nấu: ${item.cookingBatchId.slice(0, 8)}`)
  if (item.dishName) details.push(`Món: ${item.dishName}`)
  else if (item.cookingBatchDishId) {
    details.push(`Món trong mẻ: ${item.cookingBatchDishId.slice(0, 8)}`)
  }
  return details.length > 0 ? `${base} (${details.join(" · ")})` : base
}

function truncateHash(hash) {
  if (!hash || typeof hash !== "string") return "—"
  if (hash.length <= 20) return hash
  return `${hash.slice(0, 12)}…${hash.slice(-8)}`
}

function TraceSnapshotSection({ incidentId, traceSnapshots, traceCompleteness }) {
  const sortedSnapshots = useMemo(
    () =>
      [...(traceSnapshots || [])].sort(
        (a, b) => Number(b.version || 0) - Number(a.version || 0),
      ),
    [traceSnapshots],
  )

  const [selectedVersion, setSelectedVersion] = useState(
    () => sortedSnapshots[0]?.version ?? null,
  )
  const [snapshotCache, setSnapshotCache] = useState({})
  const [loadingVersion, setLoadingVersion] = useState(null)
  const [snapshotError, setSnapshotError] = useState("")
  const [expandedAllocations, setExpandedAllocations] = useState({})

  useEffect(() => {
    const latest = sortedSnapshots[0]?.version ?? null
    if (latest !== null) {
      setSelectedVersion(prev => {
        const stillExists = sortedSnapshots.some(s => s.version === prev)
        return stillExists ? prev : latest
      })
    } else {
      setSelectedVersion(null)
    }
  }, [sortedSnapshots])

  const loadVersion = (version, force = false) => {
    if (version == null || !incidentId) return undefined
    if (!force && snapshotCache[version]) return undefined

    const controller = new AbortController()
    setLoadingVersion(version)
    setSnapshotError("")

    FoodSafetyIncidentService.getTraceSnapshot(
      incidentId,
      version,
      controller.signal,
    )
      .then(data => {
        if (controller.signal.aborted) return
        setSnapshotCache(prev => ({ ...prev, [version]: data }))
        const allocs = data?.payload?.allocations || []
        if (allocs.length > 0) {
          const initialExpanded = {}
          allocs.forEach((a, idx) => {
            const key = a.mealAllocationId || a.id || String(idx)
            initialExpanded[key] = idx === 0
          })
          setExpandedAllocations(initialExpanded)
        }
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setSnapshotError(
          extractApiError(error, "Không tải được dữ liệu truy xuất.")
            .message,
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingVersion(null)
        }
      })

    return () => controller.abort()
  }

  useEffect(() => {
    if (selectedVersion == null) return undefined
    return loadVersion(selectedVersion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId, selectedVersion])

  const activeSummary = useMemo(
    () => sortedSnapshots.find(s => s.version === selectedVersion) || null,
    [sortedSnapshots, selectedVersion],
  )
  const activeDetail =
    selectedVersion != null ? snapshotCache[selectedVersion] || null : null

  const completenessMeta = getCompletenessMeta(
    activeDetail?.completeness || activeSummary?.completeness || traceCompleteness,
  )

  const handleCopyHash = async hash => {
    if (!hash) return
    try {
      await navigator.clipboard.writeText(hash)
      notice({ msg: "Đã sao chép mã đối chiếu", isSuccess: true })
    } catch {
      notice({ msg: "Không sao chép được.", isSuccess: false })
    }
  }

  const buildTreeData = payload => {
    if (!payload || typeof payload !== "object") return null

    const allocations = Array.isArray(payload.allocations)
      ? payload.allocations
      : []
    const cookingBatches = Array.isArray(payload.cookingBatches)
      ? payload.cookingBatches
      : []
    const allocationBatches = Array.isArray(payload.allocationBatches)
      ? payload.allocationBatches
      : []
    const lotUsages = Array.isArray(payload.lotUsages) ? payload.lotUsages : []
    const ingredientLots = Array.isArray(payload.ingredientLots)
      ? payload.ingredientLots
      : []
    const suppliers = Array.isArray(payload.suppliers) ? payload.suppliers : []
    const sourceFacilities = Array.isArray(payload.sourceFacilities)
      ? payload.sourceFacilities
      : []
    const retainedSamples = Array.isArray(payload.retainedSamples)
      ? payload.retainedSamples
      : []

    const batchById = new Map()
    cookingBatches.forEach(b => {
      const id = b.id || b.cookingBatchId
      if (id) batchById.set(id, b)
    })

    const lotById = new Map()
    ingredientLots.forEach(l => {
      const id = l.id || l.ingredientLotId
      if (id) lotById.set(id, l)
    })

    const supplierById = new Map()
    suppliers.forEach(s => {
      const id = s.id || s.supplierId
      if (id) supplierById.set(id, s)
    })

    const facilityById = new Map()
    sourceFacilities.forEach(f => {
      const id = f.id || f.sourceFacilityId
      if (id) facilityById.set(id, f)
    })

    const batchesByAlloc = new Map()
    allocationBatches.forEach(ab => {
      const allocId = ab.mealAllocationId || ab.allocationId
      const batchId = ab.cookingBatchId || ab.batchId
      if (!allocId || !batchId) return
      if (!batchesByAlloc.has(allocId)) batchesByAlloc.set(allocId, [])
      batchesByAlloc.get(allocId).push({
        link: ab,
        batch: batchById.get(batchId) || { id: batchId },
      })
    })

    const usagesByBatch = new Map()
    lotUsages.forEach(u => {
      const batchId = u.cookingBatchId || u.batchId
      if (!batchId) return
      if (!usagesByBatch.has(batchId)) usagesByBatch.set(batchId, [])
      usagesByBatch.get(batchId).push(u)
    })

    const samplesByBatch = new Map()
    retainedSamples.forEach(s => {
      const batchId = s.cookingBatchId || s.batchId
      if (!batchId) return
      if (!samplesByBatch.has(batchId)) samplesByBatch.set(batchId, [])
      samplesByBatch.get(batchId).push(s)
    })

    return {
      allocations,
      cookingBatches,
      lotUsages,
      ingredientLots,
      suppliers,
      sourceFacilities,
      retainedSamples,
      batchesByAlloc,
      usagesByBatch,
      samplesByBatch,
      lotById,
      supplierById,
      facilityById,
      potentialExposedPortionCount: payload.potentialExposedPortionCount,
    }
  }

  const treeData = useMemo(
    () => buildTreeData(activeDetail?.payload),
    [activeDetail],
  )

  if (sortedSnapshots.length === 0) {
    return (
      <section className={styles.surface}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Snapshot truy xuất nguồn gốc</h2>
          {traceCompleteness ? (
            <IncidentStatusBadge
              label={completenessMeta.label}
              tone={completenessMeta.tone}
            />
          ) : null}
        </div>
        <div className={styles.sectionBody}>
          <span className={styles.mutedText}>
            Chưa có snapshot truy xuất nào. Snapshot bất biến sẽ được tự động
            tạo khi nhà trường chuyển hồ sơ tới đơn vị ATTP và cập nhật phiên
            bản mới nếu gắn thêm suất ăn.
          </span>
        </div>
      </section>
    )
  }

  const missingReasons =
    activeDetail?.missingReasons ?? activeSummary?.missingReasons ?? []
  const payloadHash = activeDetail?.payloadHash || activeSummary?.payloadHash

  return (
    <section className={styles.surface}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Snapshot truy xuất nguồn gốc</h2>
        <div className={styles.versionPills}>
          {sortedSnapshots.map(snap => (
            <button
              key={snap.id || snap.version}
              type="button"
              className={`${styles.versionPill} ${
                selectedVersion === snap.version ? styles.versionPillActive : ""
              }`}
              onClick={() => setSelectedVersion(snap.version)}
            >
              <span>Phiên bản v{snap.version}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sectionBody}>
        <div className={styles.snapshotMetaBar}>
          <div className={styles.hashGroup}>
            <IncidentStatusBadge
              label={completenessMeta.label}
              tone={completenessMeta.tone}
            />
            {activeDetail ? (
              activeDetail.hashMatches === false ? (
                <IncidentStatusBadge
                  label="Cảnh báo sai lệch mã băm SHA-256"
                  tone="danger"
                />
              ) : (
                <span
                  className={`${styles.badge} ${styles.toneSuccess}`}
                  title="Hệ thống đã tính lại SHA-256 từ payload và xác nhận khớp hoàn toàn"
                >
                  <VerifiedUserOutlined sx={{ fontSize: 15 }} />
                  <span>Khớp mã băm SHA-256</span>
                </span>
              )
            ) : null}
            {typeof treeData?.potentialExposedPortionCount === "number" ? (
              <span className={styles.codeChip}>
                Khẩu phần có nguy cơ phơi nhiễm:{" "}
                {treeData.potentialExposedPortionCount.toLocaleString("vi-VN")}
              </span>
            ) : null}
          </div>

          <div className={styles.hashGroup}>
            <span className={styles.mutedText}>
              Tạo lúc{" "}
              <span className={styles.tabularNum}>
                {formatDateTimeVi(
                  activeDetail?.createdAt || activeSummary?.createdAt,
                )}
              </span>
            </span>
            {payloadHash ? (
              <Button
                type="button"
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<ContentCopyOutlined sx={{ fontSize: 14 }} />}
                onClick={() => handleCopyHash(payloadHash)}
                sx={{
                  borderColor: "#cfdcd5",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 12,
                  height: 30,
                }}
                title={payloadHash}
              >
                {truncateHash(payloadHash)}
              </Button>
            ) : null}
          </div>
        </div>

        {activeDetail?.hashMatches === false ? (
          <div className={`${styles.banner} ${styles.bannerDanger}`} role="alert">
            <GppBadOutlined fontSize="small" sx={{ mt: "1px", flexShrink: 0 }} />
            <span>
              Mã băm SHA-256 tính lại không khớp với mã băm đã lưu khi chụp
              snapshot. Cần kiểm tra toàn vẹn dữ liệu truy xuất trước khi kết
              luận.
            </span>
          </div>
        ) : null}

        {Array.isArray(missingReasons) && missingReasons.length > 0 ? (
          <div className={`${styles.banner} ${styles.bannerWarning}`}>
            <WarningAmberOutlined
              fontSize="small"
              sx={{ mt: "1px", flexShrink: 0 }}
            />
            <div>
              <strong>Các điểm thiếu dữ liệu trong chuỗi truy xuất:</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {missingReasons.map((reason, idx) => (
                  <li key={idx}>{formatMissingReason(reason)}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {loadingVersion === selectedVersion && !activeDetail ? (
          <div className={styles.skeletonStack} style={{ padding: 0 }}>
            {[0, 1, 2].map(k => (
              <div key={k} className={styles.skeletonRow}>
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
                <div className={styles.skeletonBar} />
              </div>
            ))}
          </div>
        ) : snapshotError ? (
          <div className={styles.stateBox} style={{ padding: "24px 12px" }}>
            <p className={styles.stateDesc}>{snapshotError}</p>
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<ReplayOutlined />}
              onClick={() => loadVersion(selectedVersion, true)}
            >
              Tải lại snapshot
            </Button>
          </div>
        ) : treeData ? (
          <div className={styles.treeList}>
            {treeData.allocations.length === 0 ? (
              <div className={styles.mutedText}>
                Snapshot phiên bản v{selectedVersion} chưa có suất ăn nào được
                gắn vào hồ sơ.
              </div>
            ) : (
              treeData.allocations.map((alloc, allocIdx) => {
                const allocId = alloc.mealAllocationId || alloc.id || String(allocIdx)
                const isExpanded = Boolean(expandedAllocations[allocId])
                const linkedBatches = treeData.batchesByAlloc.get(allocId) || []

                return (
                  <div key={allocId} className={styles.treeBranch}>
                    <button
                      type="button"
                      className={styles.treeBranchHeader}
                      onClick={() =>
                        setExpandedAllocations(prev => ({
                          ...prev,
                          [allocId]: !prev[allocId],
                        }))
                      }
                      aria-expanded={isExpanded}
                    >
                      <span>
                        Suất ăn: {alloc.className || alloc.class?.name || "Lớp học"}
                        {alloc.mealDate ? ` · ${formatDateVi(alloc.mealDate)}` : ""}
                        {alloc.mealType
                          ? ` · ${MEAL_TYPE_LABELS[alloc.mealType] || alloc.mealType}`
                          : ""}
                        {alloc.portionCount != null
                          ? ` · ${alloc.portionCount} suất`
                          : ""}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#52635c",
                          fontWeight: 500,
                          fontSize: 12.5,
                        }}
                      >
                        <span className={styles.tabularNum}>
                          {linkedBatches.length} mẻ nấu
                        </span>
                        {isExpanded ? (
                          <ExpandLess fontSize="small" />
                        ) : (
                          <ExpandMore fontSize="small" />
                        )}
                      </span>
                    </button>

                    {isExpanded ? (
                      <div className={styles.treeBranchBody}>
                        {linkedBatches.length === 0 ? (
                          <span className={styles.mutedText}>
                            Chưa có mẻ nấu nào liên kết với suất ăn này.
                          </span>
                        ) : (
                          <div className={styles.treeLevel}>
                            {linkedBatches.map(({ link, batch }, bIdx) => {
                              const batchId = batch.id || batch.cookingBatchId || String(bIdx)
                              const usages =
                                treeData.usagesByBatch.get(batchId) || []
                              const samples =
                                treeData.samplesByBatch.get(batchId) || []
                              const dishes = Array.isArray(batch.dishes)
                                ? batch.dishes
                                : []

                              return (
                                <div key={`${allocId}-${batchId}`} className={styles.treeItemRow}>
                                  <div className={styles.treeItemTitle}>
                                    <span>
                                      Mẻ nấu:{" "}
                                      {batch.batchCode ||
                                        batch.name ||
                                        `Mẻ #${batch.batchNumber || bIdx + 1}`}
                                      {batch.dishName ? ` — ${batch.dishName}` : ""}
                                    </span>
                                    <span className={styles.treeItemMeta}>
                                      {link.allocatedPortions != null
                                        ? `${link.allocatedPortions} suất phân bổ`
                                        : batch.plannedPortions != null
                                          ? `${batch.plannedPortions} suất dự kiến`
                                          : ""}
                                    </span>
                                  </div>

                                  {dishes.length > 0 ? (
                                    <div className={styles.treeItemMeta}>
                                      Món ăn:{" "}
                                      {dishes
                                        .map(d => d.dishName || d.name || d.id)
                                        .join(", ")}
                                    </div>
                                  ) : null}

                                  {/* Ingredient Lot Usages -> Supplier / Source Facility */}
                                  <div className={styles.treeLevel} style={{ marginTop: 6 }}>
                                    <div className={styles.blockHeading}>
                                      Lô nguyên liệu sử dụng ({usages.length})
                                    </div>
                                    {usages.length === 0 ? (
                                      <span className={styles.mutedText}>
                                        Không có bản ghi sử dụng lô nguyên liệu.
                                      </span>
                                    ) : (
                                      usages.map((usage, uIdx) => {
                                        const lotId =
                                          usage.ingredientLotId || usage.lotId
                                        const lot =
                                          treeData.lotById.get(lotId) || {}
                                        const supplier =
                                          treeData.supplierById.get(
                                            lot.supplierId || usage.supplierId,
                                          ) || null
                                        const facility =
                                          treeData.facilityById.get(
                                            lot.sourceFacilityId ||
                                              usage.sourceFacilityId,
                                          ) || null

                                        return (
                                          <div
                                            key={usage.id || `${batchId}-u-${uIdx}`}
                                            className={styles.treeItemRow}
                                          >
                                            <div className={styles.treeItemTitle}>
                                              <span>
                                                Lô{" "}
                                                <span className={styles.monoText}>
                                                  {lot.lotCode ||
                                                    usage.lotCode ||
                                                    (lotId ? lotId.slice(0, 8) : "—")}
                                                </span>
                                                {lot.ingredientName ||
                                                usage.ingredientName
                                                  ? ` · ${lot.ingredientName || usage.ingredientName}`
                                                  : ""}
                                              </span>
                                              {usage.quantityUsed != null ? (
                                                <span className={styles.treeItemMeta}>
                                                  Dùng: {usage.quantityUsed}{" "}
                                                  {usage.unitName || lot.unitName || ""}
                                                </span>
                                              ) : null}
                                            </div>
                                            <div className={styles.treeItemMeta}>
                                              Nhà cung cấp:{" "}
                                              <strong>
                                                {supplier?.name ||
                                                  lot.supplierName ||
                                                  "Chưa ghi nhận"}
                                              </strong>
                                              {facility?.name
                                                ? ` · Cơ sở nguồn: ${facility.name}`
                                                : ""}
                                              {lot.expiryDate
                                                ? ` · HSD: ${formatDateVi(lot.expiryDate)}`
                                                : ""}
                                            </div>
                                          </div>
                                        )
                                      })
                                    )}

                                    {/* Retained Samples */}
                                    <div
                                      className={styles.blockHeading}
                                      style={{ marginTop: 6 }}
                                    >
                                      Mẫu lưu thực phẩm ({samples.length})
                                    </div>
                                    {samples.length === 0 ? (
                                      <span className={styles.mutedText}>
                                        Chưa có mẫu lưu gắn với mẻ nấu này.
                                      </span>
                                    ) : (
                                      samples.map((sample, sIdx) => (
                                        <div
                                          key={sample.id || `${batchId}-s-${sIdx}`}
                                          className={styles.treeItemRow}
                                        >
                                          <div className={styles.treeItemTitle}>
                                            <span>
                                              {sample.sampleCode ||
                                                sample.dishName ||
                                                `Mẫu lưu #${sIdx + 1}`}
                                            </span>
                                            <span className={styles.treeItemMeta}>
                                              {sample.status || ""}
                                            </span>
                                          </div>
                                          <div className={styles.treeItemMeta}>
                                            {sample.storageLocation || sample.cabinetName
                                              ? `Vị trí tủ lưu: ${sample.storageLocation || sample.cabinetName} · `
                                              : ""}
                                            Lưu lúc:{" "}
                                            {formatDateTimeVi(
                                              sample.collectedAt ||
                                                sample.sealedAt ||
                                                sample.createdAt,
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}

            {/* Summary chips for suppliers & source facilities in snapshot */}
            {treeData.suppliers.length > 0 || treeData.sourceFacilities.length > 0 ? (
              <div className={styles.dividerBlock}>
                <h3 className={styles.blockHeading}>
                  Tổng hợp nhà cung cấp &amp; cơ sở nguồn trong snapshot
                </h3>
                <div className={styles.chipList}>
                  {treeData.suppliers.map(s => (
                    <span key={s.id || s.supplierId} className={styles.codeChip}>
                      NCC: {s.name || s.id}
                    </span>
                  ))}
                  {treeData.sourceFacilities.map(f => (
                    <span
                      key={f.id || f.sourceFacilityId}
                      className={styles.codeChip}
                    >
                      Cơ sở nguồn: {f.name || f.id}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <span className={styles.fieldHint}>
          Snapshot truy xuất là bản chụp bất biến phục vụ thanh kiểm tra, không
          thể chỉnh sửa hay xóa.
        </span>
      </div>
    </section>
  )
}

TraceSnapshotSection.propTypes = {
  incidentId: PropTypes.string.isRequired,
  traceSnapshots: PropTypes.array,
  traceCompleteness: PropTypes.string,
}

export default TraceSnapshotSection
