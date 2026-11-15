import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { Add } from "@mui/icons-material"
import notice from "src/components/Notice"
import SourceFacilityService, {
  extractApiError,
} from "src/services/SourceFacilityService"
import ConfirmDeactivateDialog from "./component/ConfirmDeactivateDialog"
import FacilityDetailView from "./component/FacilityDetailView"
import FacilityFilterBar from "./component/FacilityFilterBar"
import FacilityFormModal from "./component/FacilityFormModal"
import FacilityListView from "./component/FacilityListView"
import FacilitySummaryCards from "./component/FacilitySummaryCards"
import "./style.scss"

const DEFAULT_PAGE_SIZE = 20

function SourceFacilities() {
  const { id } = useParams()
  const isDetailView = Boolean(id)

  const [facilities, setFacilities] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const [detailFacility, setDetailFacility] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [editingFacility, setEditingFacility] = useState(null)
  const [loadingEditDetail, setLoadingEditDetail] = useState(false)

  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [deactivating, setDeactivating] = useState(false)

  const refreshList = useCallback((targetPage = 1) => {
    setPagination(prev => ({ ...prev, page: targetPage }))
    setReloadTick(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (isDetailView) return undefined
    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SourceFacilityService.list({
      page: pagination.page,
      limit: pagination.limit,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setFacilities(result.items)
        setPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setListError(
          extractApiError(
            error,
            "Không thể tải danh sách cơ sở nguồn cung.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingList(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, pagination.page, pagination.limit, reloadTick])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailFacility(null)
      setDetailError(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SourceFacilityService.getById(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setDetailFacility(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) return
        setDetailFacility(null)
        setDetailError(
          extractApiError(error, "Không thể tải thông tin cơ sở nguồn cung."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, id, reloadTick])

  const stats = useMemo(() => {
    let active = 0
    let inactive = 0
    facilities.forEach(item => {
      if (item.status === "INACTIVE") inactive += 1
      else active += 1
    })
    return {
      total: facilities.length,
      active,
      inactive,
    }
  }, [facilities])

  const filteredFacilities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return facilities.filter(item => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false
      if (query) {
        const haystack = [item.name, item.facilityCode]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [facilities, searchQuery, statusFilter])

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== "ALL")

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
  }

  const handlePageChange = nextPage => {
    if (nextPage < 1) return
    setPagination(prev => ({ ...prev, page: nextPage }))
  }

  const handleOpenCreate = () => {
    setModalMode("create")
    setEditingFacility(null)
    setLoadingEditDetail(false)
    setModalOpen(true)
  }

  const handleOpenEdit = async facility => {
    if (!facility?.id) return
    setModalMode("edit")
    setModalOpen(true)

    if (detailFacility && detailFacility.id === facility.id) {
      setEditingFacility(detailFacility)
      setLoadingEditDetail(false)
      return
    }

    setEditingFacility(facility)
    setLoadingEditDetail(true)
    try {
      const fullDetail = await SourceFacilityService.getById(facility.id)
      setEditingFacility(fullDetail)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể tải thông tin chi tiết cơ sở để chỉnh sửa.",
      )
      notice({ msg: parsed.message, isSuccess: false })
      setModalOpen(false)
      setEditingFacility(null)
    } finally {
      setLoadingEditDetail(false)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingFacility(null)
    setLoadingEditDetail(false)
  }

  const handleFormSubmit = async formValues => {
    if (modalMode === "edit" && editingFacility?.id) {
      const updated = await SourceFacilityService.update(
        editingFacility.id,
        formValues,
      )
      notice({
        msg: "Đã cập nhật cơ sở nguồn cung",
        desc: updated.facilityCode
          ? `${updated.facilityCode} — ${updated.name}`
          : updated.name,
        isSuccess: true,
      })
      if (detailFacility && detailFacility.id === updated.id) {
        setDetailFacility(updated)
      }
      handleCloseModal()
      refreshList(pagination.page)
      return
    }

    const created = await SourceFacilityService.create(formValues)
    notice({
      msg: "Đã thêm cơ sở nguồn cung",
      desc: created.facilityCode
        ? `${created.facilityCode} — ${created.name}`
        : created.name,
      isSuccess: true,
    })
    handleCloseModal()
    refreshList(1)
  }

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget?.id || deactivating) return
    setDeactivating(true)
    try {
      const updated = await SourceFacilityService.deactivate(deactivateTarget.id)
      notice({
        msg: "Đã dừng hoạt động cơ sở nguồn cung",
        desc: updated.facilityCode
          ? `${updated.facilityCode} — ${updated.name}`
          : updated.name,
        isSuccess: true,
      })
      if (detailFacility && detailFacility.id === updated.id) {
        setDetailFacility(updated)
      }
      setDeactivateTarget(null)
      refreshList(pagination.page)
    } catch (error) {
      const parsed = extractApiError(
        error,
        "Không thể dừng hoạt động cơ sở nguồn cung.",
      )
      notice({ msg: parsed.message, isSuccess: false })
    } finally {
      setDeactivating(false)
    }
  }

  if (isDetailView) {
    return (
      <div className="sourceFacilitiesPage">
        <FacilityDetailView
          facility={detailFacility}
          loading={loadingDetail}
          error={detailError}
          onRetry={() => setReloadTick(prev => prev + 1)}
          onEdit={handleOpenEdit}
          onDeactivate={facility => setDeactivateTarget(facility)}
        />

        <FacilityFormModal
          open={modalOpen}
          mode={modalMode}
          initialData={editingFacility}
          loadingDetail={loadingEditDetail}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
        />

        <ConfirmDeactivateDialog
          open={Boolean(deactivateTarget)}
          facility={deactivateTarget}
          submitting={deactivating}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={handleConfirmDeactivate}
        />
      </div>
    )
  }

  return (
    <div className="sourceFacilitiesPage">
      <header className="sourceFacilitiesHeader">
        <div className="sourceFacilitiesHeadingGroup">
          <h1 className="sourceFacilitiesTitle">Cơ sở nguồn cung</h1>
          <p className="sourceFacilitiesSubtitle">
            Quản lý danh sách cơ sở nguồn cung, thông tin liên hệ và trạng thái
            hoạt động của nhà cung cấp.
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

      <FacilitySummaryCards
        stats={stats}
        activeStatusFilter={statusFilter}
        onSelectStatus={nextStatus => setStatusFilter(nextStatus)}
      />

      <section
        className="sourceFacilitiesSurface"
        aria-label="Danh sách cơ sở nguồn cung"
      >
        <FacilityFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {listError ? (
          <div className="sourceFacilitiesErrorState">
            <p className="sourceFacilitiesErrorTitle">
              {listError.status === 403
                ? "Không có quyền truy cập"
                : "Không thể tải danh sách cơ sở nguồn cung"}
            </p>
            <p className="sourceFacilitiesErrorDesc">{listError.message}</p>
            {listError.status !== 403 && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={() => refreshList(pagination.page)}
              >
                Thử lại
              </Button>
            )}
          </div>
        ) : (
          <FacilityListView
            facilities={filteredFacilities}
            pageTotalCount={facilities.length}
            loading={loadingList}
            hasActiveFilters={hasActiveFilters}
            pagination={pagination}
            onResetFilters={handleResetFilters}
            onCreate={handleOpenCreate}
            onPageChange={handlePageChange}
          />
        )}
      </section>

      <FacilityFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={editingFacility}
        loadingDetail={loadingEditDetail}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeactivateDialog
        open={Boolean(deactivateTarget)}
        facility={deactivateTarget}
        submitting={deactivating}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  )
}

export default SourceFacilities
