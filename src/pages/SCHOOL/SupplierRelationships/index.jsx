import React, { useEffect, useMemo, useState } from "react"
import { Alert, Snackbar } from "@mui/material"
import { useSearchParams } from "react-router-dom"
import SupplierRelationshipService from "src/services/SupplierRelationshipService"
import ConfirmRelationshipDialog from "./component/ConfirmRelationshipDialog"
import DocumentPreviewDialog from "./component/DocumentPreviewDialog"
import RelationshipDetail from "./component/RelationshipDetail"
import RelationshipList from "./component/RelationshipList"
import SupplierDetail from "./component/SupplierDetail"
import SupplierList from "./component/SupplierList"
import WorkspaceHeader from "./component/WorkspaceHeader"
import "./style.scss"

function SupplierRelationships() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [suppliers, setSuppliers] = useState([])
  const [relationships, setRelationships] = useState([])
  const [supplier, setSupplier] = useState(null)
  const [relationship, setRelationship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [localMessage, setLocalMessage] = useState("")

  const supplierId = searchParams.get("supplier")
  const relationshipId = searchParams.get("relationship")
  const documentId = searchParams.get("document")
  const action = searchParams.get("action")
  const result = searchParams.get("result")
  const supplierSearch = searchParams.get("q") || ""
  const supplierAddressSearch = searchParams.get("address") || ""
  const supplierRelationshipFilter = searchParams.get("relation") || "ALL"
  const relationshipSearch = searchParams.get("rq") || ""
  const relationshipStatusFilter = searchParams.get("rstatus") || "ALL"
  const activeView = searchParams.get("view") === "relationships"
    ? "relationships"
    : "suppliers"

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError("")
      try {
        if (relationshipId) {
          const data = await SupplierRelationshipService.getRelationship(relationshipId)
          if (mounted) setRelationship(data)
        } else if (supplierId) {
          const data = await SupplierRelationshipService.getSupplier(supplierId)
          if (mounted) setSupplier(data)
        } else if (activeView === "relationships") {
          const data = await SupplierRelationshipService.getRelationships()
          if (mounted) setRelationships(data)
        } else {
          const data = await SupplierRelationshipService.getSuppliers()
          if (mounted) setSuppliers(data)
        }
      } catch (requestError) {
        if (mounted) setError(requestError.message || "Không thể tải dữ liệu mock.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [activeView, relationshipId, supplierId])

  const selectedSupplier = relationship?.supplier || supplier
  const selectedDocument = useMemo(
    () => selectedSupplier?.certifications?.find(item => item.id === documentId) || null,
    [documentId, selectedSupplier],
  )

  const updateParams = updates => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") next.delete(key)
      else next.set(key, value)
    })
    setSearchParams(next)
  }

  const showSupplierList = () => {
    const next = {}
    if (supplierSearch) next.q = supplierSearch
    if (supplierAddressSearch) next.address = supplierAddressSearch
    if (supplierRelationshipFilter !== "ALL") {
      next.relation = supplierRelationshipFilter
    }
    setSearchParams(next)
  }
  const showRelationshipList = resultValue => {
    const next = { view: "relationships" }
    if (relationshipSearch) next.rq = relationshipSearch
    if (relationshipStatusFilter !== "ALL") {
      next.rstatus = relationshipStatusFilter
    }
    if (resultValue) next.result = resultValue
    setSearchParams(next)
  }

  const handleLink = async () => {
    if (!supplier) return
    setSubmitting(true)
    setError("")
    try {
      await SupplierRelationshipService.linkSupplier(supplier.id)
      const updated = await SupplierRelationshipService.getSupplier(supplier.id)
      setSupplier(updated)
      setSearchParams({ supplier: supplier.id, result: "linked" })
    } catch (requestError) {
      setError(requestError.message || "Không thể thiết lập liên kết.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlink = async () => {
    if (!relationship) return
    setSubmitting(true)
    setError("")
    try {
      await SupplierRelationshipService.unlinkRelationship(relationship.id)
      const updatedList = await SupplierRelationshipService.getRelationships()
      setRelationships(updatedList)
      showRelationshipList("unlinked")
    } catch (requestError) {
      setError(requestError.message || "Không thể hủy liên kết.")
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccess = () => updateParams({ result: null })

  const renderContent = () => {
    if (relationshipId) {
      return (
        <RelationshipDetail
          relationship={relationship}
          loading={loading}
          onBack={() => showRelationshipList()}
          onUnlink={() => updateParams({ action: "unlink" })}
          onViewDocument={id => updateParams({ document: id })}
        />
      )
    }

    if (supplierId) {
      return (
        <SupplierDetail
          supplier={supplier}
          loading={loading}
          onBack={showSupplierList}
          onLink={() => updateParams({ action: "link" })}
          onViewDocument={id => updateParams({ document: id })}
          onViewRelationships={() => showRelationshipList()}
        />
      )
    }

    return (
      <>
        <WorkspaceHeader
          activeView={activeView}
          onChangeView={view =>
            view === "relationships" ? showRelationshipList() : showSupplierList()
          }
        />
        {activeView === "relationships" ? (
          <RelationshipList
            relationships={relationships}
            loading={loading}
            search={relationshipSearch}
            status={relationshipStatusFilter}
            onSearchChange={value => updateParams({ rq: value || null })}
            onStatusChange={value =>
              updateParams({ rstatus: value === "ALL" ? null : value })
            }
            onViewDetail={id =>
              updateParams({ view: "relationships", relationship: id, result: null })
            }
          />
        ) : (
          <SupplierList
            suppliers={suppliers}
            loading={loading}
            search={supplierSearch}
            addressSearch={supplierAddressSearch}
            relationshipFilter={supplierRelationshipFilter}
            onSearchChange={value => updateParams({ q: value || null })}
            onAddressSearchChange={value => updateParams({ address: value || null })}
            onRelationshipFilterChange={value =>
              updateParams({ relation: value === "ALL" ? null : value })
            }
            onClearFilters={() =>
              updateParams({ q: null, address: null, relation: null })
            }
            onViewDetail={id => updateParams({ supplier: id, result: null })}
          />
        )}
      </>
    )
  }

  return (
    <div className="supplier-relationships-page">
      {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
      {renderContent()}

      <DocumentPreviewDialog
        open={Boolean(documentId && selectedDocument)}
        document={selectedDocument}
        supplierName={selectedSupplier?.name || ""}
        onClose={() => updateParams({ document: null })}
        onDownload={() =>
          setLocalMessage("Tải xuống đang được mô phỏng; chưa có tệp backend để tải.")
        }
      />

      <ConfirmRelationshipDialog
        open={action === "link" && Boolean(supplier)}
        mode="link"
        school={SupplierRelationshipService.currentSchool}
        supplier={supplier}
        submitting={submitting}
        onCancel={() => updateParams({ action: null })}
        onConfirm={handleLink}
      />

      <ConfirmRelationshipDialog
        open={action === "unlink" && Boolean(relationship)}
        mode="unlink"
        school={relationship?.school}
        supplier={relationship?.supplier}
        submitting={submitting}
        onCancel={() => updateParams({ action: null })}
        onConfirm={handleUnlink}
      />

      <Snackbar
        open={Boolean(result)}
        autoHideDuration={5000}
        onClose={closeSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" variant="outlined" onClose={closeSuccess}>
          {result === "linked"
            ? "Đã liên kết nhà cung cấp thành công."
            : "Đã hủy liên kết thành công."}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(localMessage)}
        autoHideDuration={3600}
        onClose={() => setLocalMessage("")}
        message={localMessage}
      />
    </div>
  )
}

export default SupplierRelationships
