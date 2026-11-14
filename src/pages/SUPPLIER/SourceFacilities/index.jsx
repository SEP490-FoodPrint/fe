import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { Add, RestartAltOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import SourceFacilityService, {
  getFacilityAttention,
} from "src/services/SourceFacilityService"
import FacilityDetailView from "./component/FacilityDetailView"
import FacilityFilterBar from "./component/FacilityFilterBar"
import FacilityFormModal from "./component/FacilityFormModal"
import FacilityListView from "./component/FacilityListView"
import FacilitySummaryCards from "./component/FacilitySummaryCards"
import "./style.scss"

function SourceFacilities() {
  const { id: detailId } = useParams()

  const [facilities, setFacilities] = useState([])
  const [listLoading, setListLoading] = useState(true)

  const [detailItem, setDetailItem] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [attentionOnly, setAttentionOnly] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [editingFacility, setEditingFacility] = useState(null)

  const loadFacilities = useCallback(async () => {
    setListLoading(true)
    try {
      const response = await SourceFacilityService.list()
      setFacilities(response.items || [])
    } finally {
      setListLoading(false)
    }
  }, [])

  const loadDetail = useCallback(async facilityId => {
    if (!facilityId) return
    setDetailLoading(true)
    setDetailError(null)
    try {
      const item = await SourceFacilityService.getById(facilityId)
      setDetailItem(item)
    } catch (error) {
      setDetailItem(null)
      setDetailError(error)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFacilities()
  }, [loadFacilities])

  useEffect(() => {
    if (!detailId) {
      setDetailItem(null)
      setDetailError(null)
      setDetailLoading(false)
      return
    }
    loadDetail(detailId)
  }, [detailId, loadDetail])

  const summaryStats = useMemo(() => {
    let active = 0
    let paused = 0
    let attention = 0

    facilities.forEach(item => {
      if (item.cooperationStatus === "PAUSED") {
        paused += 1
      } else {
        active += 1
      }
      if (getFacilityAttention(item).needsAttention) {
        attention += 1
      }
    })

    return {
      total: facilities.length,
      active,
      paused,
      attention,
    }
  }, [facilities])

  const filteredFacilities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return facilities.filter(item => {
      if (query) {
        const matchesName = item.name?.toLowerCase().includes(query)
        const matchesCode = item.code?.toLowerCase().includes(query)
        const matchesAddress = item.address?.toLowerCase().includes(query)
        if (!matchesName && !matchesCode && !matchesAddress) {
          return false
        }
      }

      if (typeFilter !== "ALL" && item.facilityType !== typeFilter) {
        return false
      }

      if (statusFilter !== "ALL" && item.cooperationStatus !== statusFilter) {
        return false
      }

      if (attentionOnly && !getFacilityAttention(item).needsAttention) {
        return false
      }

      return true
    })
  }, [facilities, searchQuery, typeFilter, statusFilter, attentionOnly])

  const activeQuickFilter = useMemo(() => {
    if (attentionOnly) return "ATTENTION"
    if (statusFilter === "ACTIVE") return "ACTIVE"
    if (statusFilter === "PAUSED") return "PAUSED"
    if (
      !searchQuery.trim() &&
      typeFilter === "ALL" &&
      statusFilter === "ALL" &&
      !attentionOnly
    ) {
      return "ALL"
    }
    return ""
  }, [searchQuery, typeFilter, statusFilter, attentionOnly])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    attentionOnly

  const handleSelectQuickFilter = key => {
    if (key === "ALL") {
      setSearchQuery("")
      setTypeFilter("ALL")
      setStatusFilter("ALL")
      setAttentionOnly(false)
      return
    }
    if (key === "ACTIVE" || key === "PAUSED") {
      setAttentionOnly(false)
      setStatusFilter(prev => (prev === key ? "ALL" : key))
      return
    }
    if (key === "ATTENTION") {
      setStatusFilter("ALL")
      setAttentionOnly(prev => !prev)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setTypeFilter("ALL")
    setStatusFilter("ALL")
    setAttentionOnly(false)
  }

  const handleOpenCreate = () => {
    setModalMode("create")
    setEditingFacility(null)
    setModalOpen(true)
  }

  const handleOpenEdit = facility => {
    setModalMode("edit")
    setEditingFacility(facility)
    setModalOpen(true)
  }

  const handleSubmitForm = async formPayload => {
    if (modalMode === "edit" && editingFacility) {
      const updated = await SourceFacilityService.update(
        editingFacility.id,
        formPayload,
      )
      setModalOpen(false)
      await loadFacilities()
      if (detailId && String(detailId) === String(updated.id)) {
        setDetailItem(updated)
      }
      notice({
        msg: "Cập nhật cơ sở nguồn cung thành công",
        desc: `${updated.code} · ${updated.name} đã được lưu trong phiên làm việc.`,
        isSuccess: true,
      })
      return
    }

    const created = await SourceFacilityService.create(formPayload)
    setModalOpen(false)
    await loadFacilities()
    notice({
      msg: "Thêm cơ sở nguồn cung thành công",
      desc: `${created.code} · ${created.name} đã được thêm vào danh sách.`,
      isSuccess: true,
    })
  }

  const handleResetDemoData = async () => {
    await SourceFacilityService.resetDemoData()
    await loadFacilities()
    handleResetFilters()
    notice({
      msg: "Đã khôi phục dữ liệu minh họa",
      desc: "Danh sách cơ sở nguồn cung đã trở về bộ dữ liệu mẫu ban đầu.",
      isSuccess: true,
    })
  }

  return (
    <>
      {detailId ? (
        <FacilityDetailView
          facility={detailItem}
          loading={detailLoading}
          error={detailError}
          demoNotice={SourceFacilityService.demoNotice}
          onRetry={() => loadDetail(detailId)}
          onEdit={handleOpenEdit}
        />
      ) : (
        <div className="sourceFacilitiesPage">
          <header className="sourceFacilitiesHeader">
            <div className="sourceFacilitiesHeadingGroup">
              <h1 className="sourceFacilitiesTitle">Cơ sở nguồn cung</h1>
              <p className="sourceFacilitiesSubtitle">
                Quản lý vùng trồng, trang trại, xưởng sơ chế, kho bảo quản và hồ sơ chứng nhận của nhà cung cấp.
              </p>
            </div>

            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenCreate}
              className="sourceFacilitiesAddBtn"
            >
              Thêm cơ sở
            </Button>
          </header>

          <div className="sourceFacilitiesDemoBanner" data-demo-source="mock">
            <div className="sourceFacilitiesDemoLeft">
              <span className="sourceFacilitiesDemoBadge">Dữ liệu minh họa</span>
              <span>{SourceFacilityService.demoNotice}</span>
            </div>
            <Button
              type="button"
              size="small"
              variant="text"
              startIcon={<RestartAltOutlined />}
              onClick={handleResetDemoData}
              className="sourceFacilitiesResetDemoBtn"
            >
              Khôi phục dữ liệu mẫu
            </Button>
          </div>

          <FacilitySummaryCards
            stats={summaryStats}
            activeQuickFilter={activeQuickFilter}
            onSelectFilter={handleSelectQuickFilter}
          />

          <section
            className="sourceFacilitiesSurface"
            aria-label="Danh sách cơ sở nguồn cung"
          >
            <FacilityFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              attentionOnly={attentionOnly}
              onToggleAttentionOnly={() => setAttentionOnly(prev => !prev)}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />

            {listLoading ? (
              <p
                className="sourceFacilitiesLoading"
                role="status"
                aria-live="polite"
              >
                Đang tải danh sách cơ sở nguồn cung...
              </p>
            ) : (
              <FacilityListView
                facilities={filteredFacilities}
                totalCount={facilities.length}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
                onCreate={handleOpenCreate}
                onEdit={handleOpenEdit}
              />
            )}
          </section>
        </div>
      )}

      <FacilityFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={editingFacility}
        existingFacilities={facilities}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitForm}
      />
    </>
  )
}

export default SourceFacilities
