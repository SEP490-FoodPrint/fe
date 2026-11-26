import http from "src/services/01_axios"

const PUBLIC_LOCATIONS_URL = "/schools/public/locations"

let cachedLocations = null
let inflightPromise = null

const sortByNameVi = (a, b) =>
  String(a?.name || "").localeCompare(String(b?.name || ""), "vi", {
    sensitivity: "base",
  })

function buildLocationIndex(rawItems) {
  const items = Array.isArray(rawItems)
    ? rawItems
        .filter(item => item && typeof item === "object" && item.id)
        .map(item => ({
          id: String(item.id),
          code: item.code ? String(item.code) : "",
          name: item.name ? String(item.name) : "",
          type: item.type ? String(item.type) : "",
          level: Number(item.level),
          parentId: item.parentId ? String(item.parentId) : null,
        }))
    : []

  const provinces = items
    .filter(item => item.level === 1)
    .sort(sortByNameVi)

  const wardsByProvince = new Map()
  const wardById = new Map()

  for (const item of items) {
    if (item.level !== 2) continue
    wardById.set(item.id, item)
    if (!item.parentId) continue
    const list = wardsByProvince.get(item.parentId)
    if (list) {
      list.push(item)
    } else {
      wardsByProvince.set(item.parentId, [item])
    }
  }

  for (const [provinceId, wards] of wardsByProvince.entries()) {
    wards.sort(sortByNameVi)
    wardsByProvince.set(provinceId, wards)
  }

  return {
    items,
    provinces,
    wardsByProvince,
    wardById,
  }
}

export function clearPublicLocationsCache() {
  cachedLocations = null
  inflightPromise = null
}

/**
 * Fetches and caches public administrative locations (province level=1 -> ward level=2).
 * Supports AbortSignal per caller without cancelling shared cache loads for other consumers.
 */
export async function getPublicLocations(signal, { force = false } = {}) {
  if (!force && cachedLocations) {
    return cachedLocations
  }

  if (force) {
    cachedLocations = null
    inflightPromise = null
  }

  if (!inflightPromise) {
    inflightPromise = http
      .get(PUBLIC_LOCATIONS_URL, {
        skipAuthRedirect: true,
        notifyOnError: false,
      })
      .then(response => {
        const raw = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : response?.data?.items || []
        const indexed = buildLocationIndex(raw)
        cachedLocations = indexed
        return indexed
      })
      .finally(() => {
        inflightPromise = null
      })
  }

  if (!signal) {
    return inflightPromise
  }

  if (signal.aborted) {
    const abortErr = new DOMException("The operation was aborted.", "AbortError")
    throw abortErr
  }

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      reject(new DOMException("The operation was aborted.", "AbortError"))
    }
    signal.addEventListener("abort", onAbort, { once: true })
    inflightPromise.then(
      result => {
        signal.removeEventListener("abort", onAbort)
        resolve(result)
      },
      error => {
        signal.removeEventListener("abort", onAbort)
        reject(error)
      },
    )
  })
}

export default {
  getPublicLocations,
  clearPublicLocationsCache,
}
