import React, { useEffect, useState } from "react"
import { Alert } from "@mui/material"
import { useSearchParams } from "react-router-dom"
import SupplierRelationshipService from "src/services/SupplierRelationshipService"
import RelationshipList from "./component/RelationshipList"
import SupplierList from "./component/SupplierList"
import WorkspaceHeader from "./component/WorkspaceHeader"
import "./style.scss"

function SupplierRelationships() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [suppliers, setSuppliers] = useState([])
  const [relationships, setRelationships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const activeView = searchParams.get("view") === "relationships"
    ? "relationships"
    : "suppliers"
  const supplierSearch = searchParams.get("q") || ""
  const relationshipSearch = searchParams.get("rq") || ""
  const relationshipStatusFilter = searchParams.get("rstatus") || "ALL"

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const [supplierRows, relationshipRows] = await Promise.all([
          SupplierRelationshipService.getSuppliers(),
          SupplierRelationshipService.getRelationships(),
        ])
        if (mounted) {
          setSuppliers(supplierRows)
          setRelationships(relationshipRows)
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError?.response?.data?.message ||
              "Không thể tải dữ liệu nhà cung cấp.",
          )
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const updateParams = updates => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") next.delete(key)
      else next.set(key, value)
    })
    setSearchParams(next)
  }

  const changeView = view => {
    setSearchParams(view === "relationships" ? { view } : {})
  }

  return (
    <div className="supplier-relationships-page">
      {error && <Alert severity="error">{error}</Alert>}
      <WorkspaceHeader activeView={activeView} onChangeView={changeView} />

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
        />
      ) : (
        <SupplierList
          suppliers={suppliers}
          loading={loading}
          search={supplierSearch}
          onSearchChange={value => updateParams({ q: value || null })}
          onClearFilters={() => updateParams({ q: null })}
        />
      )}
    </div>
  )
}

export default SupplierRelationships
