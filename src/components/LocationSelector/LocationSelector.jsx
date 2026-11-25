import React, { useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Autocomplete, Button, CircularProgress, TextField } from "@mui/material"
import { getPublicLocations } from "./LocationService"
import styles from "./LocationSelector.module.scss"

// So khớp không dấu, kể cả "đ/Đ" (NFD không tách được chữ này): "da nang" khớp "Đà Nẵng"
const foldVietnamese = text =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()

const filterByName = (options, { inputValue }) => {
  const query = foldVietnamese(inputValue)
  if (!query) return options
  return options.filter(option => foldVietnamese(option?.name).includes(query))
}

export default function LocationSelector({
  id = "locationId",
  value = "",
  onChange,
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  compact = false,
  allowClear = false,
  provinceLabel = "Tỉnh / Thành phố",
  wardLabel = "Phường / Xã",
  className = "",
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [selectedProvinceId, setSelectedProvinceId] = useState("")

  const internalProvinceChangeRef = useRef(false)
  const prevValueRef = useRef(value)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError("")

    getPublicLocations(controller.signal, { force: retryCount > 0 })
      .then(result => {
        if (!controller.signal.aborted) {
          setData(result)
        }
      })
      .catch(err => {
        if (controller.signal.aborted || err?.name === "AbortError") return
        setLoadError(
          err?.message || "Không thể tải danh mục địa giới hành chính.",
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [retryCount])

  // Auto-resolve initial or externally-updated ward value -> parent province
  useEffect(() => {
    const normalizedValue = value ? String(value) : ""
    const prevValue = prevValueRef.current ? String(prevValueRef.current) : ""
    prevValueRef.current = normalizedValue

    if (normalizedValue && data?.wardById) {
      const matchedWard = data.wardById.get(normalizedValue)
      if (matchedWard?.parentId) {
        setSelectedProvinceId(matchedWard.parentId)
      }
      return
    }

    if (!normalizedValue && prevValue) {
      if (internalProvinceChangeRef.current) {
        internalProvinceChangeRef.current = false
      } else {
        setSelectedProvinceId("")
      }
    }
  }, [value, data])

  const provinces = useMemo(() => data?.provinces || [], [data])

  const selectedProvince = useMemo(() => {
    if (!selectedProvinceId) return null
    return provinces.find(item => item.id === selectedProvinceId) || null
  }, [provinces, selectedProvinceId])

  const wards = useMemo(() => {
    if (!selectedProvinceId || !data?.wardsByProvince) return []
    return data.wardsByProvince.get(selectedProvinceId) || []
  }, [data, selectedProvinceId])

  const selectedWard = useMemo(() => {
    if (!value || !data?.wardById) return null
    const ward = data.wardById.get(String(value))
    if (!ward) return null
    if (selectedProvinceId && ward.parentId !== selectedProvinceId) return null
    return ward
  }, [value, data, selectedProvinceId])

  const handleProvinceChange = (_, nextProvince) => {
    const nextProvinceId = nextProvince?.id || ""
    setSelectedProvinceId(nextProvinceId)

    if (value) {
      internalProvinceChangeRef.current = true
      onChange?.("", null)
    } else {
      onChange?.("", null)
    }
  }

  const handleWardChange = (_, nextWard) => {
    if (!nextWard) {
      onChange?.("", null)
      return
    }
    if (nextWard.level !== 2) return
    onChange?.(nextWard.id, nextWard)
  }

  // Giá trị đã lưu không còn trong danh mục công khai (phường/xã ngừng hoạt động hoặc sai)
  const isStaleValue = Boolean(
    value && data?.wardById && !data.wardById.has(String(value)),
  )

  const errorMessage = typeof error === "string" ? error : ""
  const hasError = Boolean(error)
  const provinceInputId = `${id}-province`
  const wardInputId = id

  return (
    <div
      className={`${styles.wrapper} ${compact ? styles.compact : ""} ${className}`}
    >
      {loadError ? (
        <div className={styles.loadErrorBar} role="alert">
          <span>{loadError}</span>
          <Button
            type="button"
            variant="outlined"
            size="small"
            className={styles.retryButton}
            onClick={() => setRetryCount(c => c + 1)}
          >
            Thử lại
          </Button>
        </div>
      ) : null}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor={provinceInputId} className={styles.label}>
            {provinceLabel}
            {required ? <span className={styles.required}>*</span> : null}
          </label>
          <Autocomplete
            id={provinceInputId}
            className={styles.autocomplete}
            options={provinces}
            value={selectedProvince}
            onChange={handleProvinceChange}
            filterOptions={filterByName}
            getOptionLabel={option => option?.name || ""}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            disabled={disabled || loading || Boolean(loadError)}
            loading={loading}
            disableClearable={!allowClear}
            clearOnEscape={allowClear}
            size="small"
            noOptionsText="Không tìm thấy tỉnh/thành phố"
            loadingText="Đang tải danh mục..."
            renderInput={params => (
              <TextField
                {...params}
                placeholder={
                  loading
                    ? "Đang tải..."
                    : allowClear
                      ? "Tất cả tỉnh / thành phố"
                      : "Chọn tỉnh / thành phố"
                }
                error={hasError && !selectedProvince}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.slotProps?.input?.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={wardInputId} className={styles.label}>
            {wardLabel}
            {required ? <span className={styles.required}>*</span> : null}
          </label>
          <Autocomplete
            id={wardInputId}
            className={styles.autocomplete}
            options={wards}
            value={selectedWard}
            onChange={handleWardChange}
            filterOptions={filterByName}
            getOptionLabel={option => option?.name || ""}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            disabled={
              disabled || loading || Boolean(loadError) || !selectedProvinceId
            }
            loading={loading}
            disableClearable={!allowClear}
            clearOnEscape={allowClear}
            size="small"
            noOptionsText={
              selectedProvinceId
                ? "Không tìm thấy phường/xã"
                : "Vui lòng chọn tỉnh/thành phố trước"
            }
            loadingText="Đang tải danh mục..."
            renderInput={params => (
              <TextField
                {...params}
                placeholder={
                  !selectedProvinceId
                    ? allowClear
                      ? "Chọn tỉnh/thành trước"
                      : "Chọn tỉnh/thành phố trước"
                    : allowClear
                      ? "Tất cả phường / xã"
                      : "Chọn phường / xã"
                }
                error={hasError}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.slotProps?.input?.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </div>
      </div>

      {errorMessage ? (
        <p className={styles.errorText} role="alert">
          {errorMessage}
        </p>
      ) : isStaleValue ? (
        <p className={styles.errorText} role="alert">
          Phường/xã đã lưu không còn hoạt động. Vui lòng chọn lại.
        </p>
      ) : helperText ? (
        <p className={styles.helperText}>{helperText}</p>
      ) : null}
    </div>
  )
}

LocationSelector.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  helperText: PropTypes.string,
  compact: PropTypes.bool,
  allowClear: PropTypes.bool,
  provinceLabel: PropTypes.string,
  wardLabel: PropTypes.string,
  className: PropTypes.string,
}
