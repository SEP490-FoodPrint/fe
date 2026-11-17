import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@mui/material"
import { ErrorOutlineOutlined, ReplayOutlined } from "@mui/icons-material"
import notice from "src/components/Notice"
import SupplierSchoolService, {
  extractApiError,
  extractBlobError,
} from "src/services/SupplierSchoolService"
import DocumentPreviewModal from "./component/DocumentPreviewModal"
import SchoolDetailView from "./component/SchoolDetailView"
import SchoolFilterBar from "./component/SchoolFilterBar"
import SchoolListView from "./component/SchoolListView"
import styles from "./SupplierSchools.module.scss"

const DEFAULT_PAGE_SIZE = 20

function SupplierSchools() {
  const { id } = useParams()
  const isDetailView = Boolean(id)

  const [schools, setSchools] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState(null)
  const [listReloadTick, setListReloadTick] = useState(0)

  const [detailSchool, setDetailSchool] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [detailReloadTick, setDetailReloadTick] = useState(0)

  const [contracts, setContracts] = useState([])
  const [contractPagination, setContractPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasNext: false,
  })
  const [loadingContracts, setLoadingContracts] = useState(false)
  const [contractsError, setContractsError] = useState(null)
  const [contractsReloadTick, setContractsReloadTick] = useState(0)

  const [previewTarget, setPreviewTarget] = useState(null)
  const [downloadingDocId, setDownloadingDocId] = useState(null)
  const [docErrors, setDocErrors] = useState({})

  useEffect(() => {
    if (isDetailView) return undefined

    const controller = new AbortController()
    setLoadingList(true)
    setListError(null)

    SupplierSchoolService.listSchools({
      page: pagination.page,
      limit: pagination.limit,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setSchools(result.items)
        setPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setListError(
          extractApiError(
            error,
            "Không thể tải danh sách trường đã liên kết.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingList(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, pagination.page, pagination.limit, listReloadTick])

  useEffect(() => {
    setContractPagination({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
      hasNext: false,
    })
    setContracts([])
    setContractsError(null)
    setPreviewTarget(null)
    setDocErrors({})
  }, [id])

  useEffect(() => {
    if (!isDetailView || !id) {
      setDetailSchool(null)
      setDetailError(null)
      return undefined
    }

    const controller = new AbortController()
    setLoadingDetail(true)
    setDetailError(null)

    SupplierSchoolService.getSchoolById(id, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setDetailSchool(result)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setDetailSchool(null)
        setDetailError(
          extractApiError(error, "Không thể tải chi tiết trường học."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetail(false)
        }
      })

    return () => controller.abort()
  }, [isDetailView, id, detailReloadTick])

  useEffect(() => {
    if (!isDetailView || !detailSchool?.id) {
      setContracts([])
      setContractsError(null)
      setLoadingContracts(false)
      return undefined
    }

    const controller = new AbortController()
    setLoadingContracts(true)
    setContractsError(null)

    SupplierSchoolService.listContracts(detailSchool.id, {
      page: contractPagination.page,
      limit: contractPagination.limit,
      signal: controller.signal,
    })
      .then(result => {
        if (controller.signal.aborted) return
        setContracts(result.items)
        setContractPagination(result.pagination)
      })
      .catch(error => {
        if (error?.name === "CanceledError" || controller.signal.aborted) {
          return
        }
        setContracts([])
        setContractsError(
          extractApiError(error, "Không thể tải danh sách hợp đồng."),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingContracts(false)
        }
      })

    return () => controller.abort()
  }, [
    isDetailView,
    detailSchool?.id,
    contractPagination.page,
    contractPagination.limit,
    contractsReloadTick,
  ])

  const filteredSchools = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return schools.filter(school => {
      if (
        statusFilter !== "ALL" &&
        school.relationship?.status !== statusFilter
      ) {
        return false
      }
      if (!keyword) return true
      const haystack = [
        school.name,
        school.code || "",
        school.email || "",
        school.phone || "",
        school.address || "",
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [schools, searchQuery, statusFilter])

  const hasActiveFilters = Boolean(searchQuery.trim()) || statusFilter !== "ALL"

  const handleResetFilters = useCallback(() => {
    setSearchQuery("")
    setStatusFilter("ALL")
  }, [])

  const handlePreviewDocument = useCallback(
    (contractId, doc) => {
      if (!detailSchool?.id || !contractId || !doc?.id) return
      setDocErrors(prev => {
        if (!prev[doc.id]) return prev
        const next = { ...prev }
        delete next[doc.id]
        return next
      })
      setPreviewTarget({
        schoolId: detailSchool.id,
        contractId,
        document: doc,
      })
    },
    [detailSchool?.id],
  )

  const handleDownloadDocument = useCallback(
    async (contractId, doc) => {
      if (!detailSchool?.id || !contractId || !doc?.id || downloadingDocId) {
        return
      }
      setDownloadingDocId(doc.id)
      setDocErrors(prev => {
        if (!prev[doc.id]) return prev
        const next = { ...prev }
        delete next[doc.id]
        return next
      })

      try {
        await SupplierSchoolService.downloadDocument({
          schoolId: detailSchool.id,
          contractId,
          document: doc,
        })
      } catch (error) {
        const parsed = await extractBlobError(
          error,
          "Không thể tải về tệp tài liệu. Vui lòng thử lại.",
        )
        setDocErrors(prev => ({ ...prev, [doc.id]: parsed.message }))
        notice({
          msg: parsed.message,
          isSuccess: false,
        })
      } finally {
        setDownloadingDocId(null)
      }
    },
    [detailSchool?.id, downloadingDocId],
  )

  if (isDetailView) {
    return (
      <>
        <SchoolDetailView
          school={detailSchool}
          loading={loadingDetail}
          error={detailError}
          contracts={contracts}
          contractPagination={contractPagination}
          loadingContracts={loadingContracts}
          contractsError={contractsError}
          downloadingDocId={downloadingDocId}
          docErrors={docErrors}
          onRetryDetail={() => setDetailReloadTick(prev => prev + 1)}
          onRetryContracts={() => setContractsReloadTick(prev => prev + 1)}
          onContractPageChange={nextPage =>
            setContractPagination(prev => ({ ...prev, page: nextPage }))
          }
          onPreviewDocument={handlePreviewDocument}
          onDownloadDocument={handleDownloadDocument}
        />

        <DocumentPreviewModal
          open={Boolean(previewTarget)}
          schoolId={previewTarget?.schoolId}
          contractId={previewTarget?.contractId}
          document={previewTarget?.document}
          downloading={
            Boolean(previewTarget?.document?.id) &&
            downloadingDocId === previewTarget?.document?.id
          }
          onDownload={handleDownloadDocument}
          onClose={() => setPreviewTarget(null)}
        />
      </>
    )
  }

  return (
    <div className={styles.schoolsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <h1 className={styles.pageTitle}>Trường đã liên kết</h1>
        </div>
      </div>

      <section
        className={styles.surface}
        aria-label="Danh sách trường đã liên kết"
      >
        <SchoolFilterBar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          visibleCount={filteredSchools.length}
          totalCount={schools.length}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />

        {listError ? (
          <div className={styles.errorState} role="alert">
            <div className={styles.errorIconWrap} aria-hidden="true">
              <ErrorOutlineOutlined />
            </div>
            <p className={styles.errorTitle}>
              {listError.status === 403
                ? "Bạn không có quyền xem danh sách trường đã liên kết"
                : "Không thể tải danh sách trường đã liên kết"}
            </p>
            <p className={styles.errorDesc}>{listError.message}</p>
            {listError.status !== 403 ? (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<ReplayOutlined />}
                className={styles.retryBtn}
                onClick={() => setListReloadTick(prev => prev + 1)}
              >
                Thử lại
              </Button>
            ) : null}
          </div>
        ) : (
          <SchoolListView
            schools={filteredSchools}
            pageTotalCount={schools.length}
            loading={loadingList}
            hasActiveFilters={hasActiveFilters}
            pagination={pagination}
            onResetFilters={handleResetFilters}
            onPageChange={nextPage =>
              setPagination(prev => ({ ...prev, page: nextPage }))
            }
          />
        )}
      </section>
    </div>
  )
}

export default SupplierSchools
