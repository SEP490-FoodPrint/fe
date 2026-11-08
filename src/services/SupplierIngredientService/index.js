import http from "../01_axios"

const BASE_URL = "/ingredients/management"
const encodeId = value => encodeURIComponent(String(value ?? "").trim())

export const DEFAULT_UNITS = [
  "kg",
  "g",
  "lít",
  "ml",
  "hộp",
  "quả",
  "bó",
  "gói",
  "chai",
]

export function formatTimestamp(value) {
  if (!value) return "—"
  if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}$/.test(String(value).trim())) {
    return String(value).trim()
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  const dd = String(parsed.getDate()).padStart(2, "0")
  const mm = String(parsed.getMonth() + 1).padStart(2, "0")
  const yyyy = parsed.getFullYear()
  const hh = String(parsed.getHours()).padStart(2, "0")
  const min = String(parsed.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export function adaptIngredient(raw) {
  if (!raw || typeof raw !== "object") return null

  const categoryObj =
    raw.category && typeof raw.category === "object" ? raw.category : null
  const categoryName =
    categoryObj?.categoryName ||
    (typeof raw.category === "string" ? raw.category : "") ||
    ""
  const categoryId = raw.categoryId ?? categoryObj?.id ?? null
  const coverImage =
    typeof raw.coverImage === "string" && raw.coverImage.trim()
      ? raw.coverImage.trim()
      : null
  const imageDescription = Array.isArray(raw.imageDescription)
    ? raw.imageDescription.filter(
        item => typeof item === "string" && item.trim(),
      )
    : []

  const rawStatus = String(raw.status || "ACTIVE").toUpperCase()
  const status = rawStatus === "INACTIVE" ? "INACTIVE" : "ACTIVE"

  return {
    id: String(raw.id || ""),
    supplierId: raw.supplierId || null,
    name: raw.name || "",
    defaultUnit: raw.defaultUnit || "",
    description: raw.description ?? null,
    categoryId,
    category: categoryObj,
    categoryName: categoryName || "Chưa phân loại",
    coverImage,
    imageDescription,
    status,
    createdAt: formatTimestamp(raw.createdAt),
    updatedAt: formatTimestamp(raw.updatedAt),
    rawCreatedAt: raw.createdAt || null,
    rawUpdatedAt: raw.updatedAt || null,
  }
}

export function adaptCategory(raw) {
  if (!raw || typeof raw !== "object") return null
  return {
    id: String(raw.id || ""),
    categoryName: String(raw.categoryName || "").trim(),
    categoryDescription: raw.categoryDescription ?? null,
  }
}

const SupplierIngredientService = {
  async list({ page = 1, limit = 20 } = {}, signal) {
    const response = await http.get(BASE_URL, {
      params: { page, limit },
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || response || {}
    const rawItems = Array.isArray(payload.items) ? payload.items : []
    const pagination = payload.pagination || {
      page,
      limit,
      hasNext: false,
    }
    return {
      items: rawItems.map(adaptIngredient).filter(Boolean),
      pagination: {
        page: Number(pagination.page) || page,
        limit: Number(pagination.limit) || limit,
        hasNext: Boolean(pagination.hasNext),
        total: Number.isInteger(pagination.total) ? pagination.total : null,
      },
    }
  },

  async listCategories({ page = 1, limit = 100 } = {}, signal) {
    const response = await http.get(`${BASE_URL}/categories`, {
      params: { page, limit },
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || response || {}
    const rawItems = Array.isArray(payload.items) ? payload.items : []
    const pagination = payload.pagination || {
      page,
      limit,
      hasNext: false,
    }
    return {
      items: rawItems
        .map(adaptCategory)
        .filter(item => item && item.id && item.categoryName),
      pagination: {
        page: Number(pagination.page) || page,
        limit: Number(pagination.limit) || limit,
        hasNext: Boolean(pagination.hasNext),
      },
    }
  },

  async getById(ingredientId, signal) {
    const response = await http.get(`${BASE_URL}/${encodeId(ingredientId)}`, {
      signal,
      notifyOnError: false,
    })
    const payload = response?.data || response
    return adaptIngredient(payload)
  },

  async create(input) {
    const body = {
      name: String(input.name ?? "").trim(),
      defaultUnit: String(input.defaultUnit ?? "").trim(),
      description:
        input.description !== undefined &&
        input.description !== null &&
        String(input.description).trim() !== ""
          ? String(input.description).trim()
          : null,
      categoryId: input.categoryId ? String(input.categoryId).trim() : null,
      coverImage:
        input.coverImage && String(input.coverImage).trim()
          ? String(input.coverImage).trim()
          : null,
      imageDescription: Array.isArray(input.imageDescription)
        ? input.imageDescription
            .map(item => String(item ?? "").trim())
            .filter(Boolean)
        : [],
    }

    const response = await http.post(BASE_URL, body, {
      notifyOnError: false,
    })
    return adaptIngredient(response?.data || response)
  },

  async update(ingredientId, input) {
    const body = {}
    if (input.name !== undefined) {
      body.name = String(input.name).trim()
    }
    if (input.defaultUnit !== undefined) {
      body.defaultUnit = String(input.defaultUnit).trim()
    }
    if (input.description !== undefined) {
      body.description =
        input.description !== null && String(input.description).trim() !== ""
          ? String(input.description).trim()
          : null
    }
    if (input.categoryId !== undefined) {
      body.categoryId = input.categoryId ? String(input.categoryId).trim() : null
    }
    if (input.coverImage !== undefined) {
      body.coverImage =
        input.coverImage && String(input.coverImage).trim()
          ? String(input.coverImage).trim()
          : null
    }
    if (input.imageDescription !== undefined) {
      body.imageDescription = Array.isArray(input.imageDescription)
        ? input.imageDescription
            .map(item => String(item ?? "").trim())
            .filter(Boolean)
        : []
    }

    const response = await http.patch(
      `${BASE_URL}/${encodeId(ingredientId)}`,
      body,
      { notifyOnError: false },
    )
    return adaptIngredient(response?.data || response)
  },

  async hide(ingredientId) {
    const response = await http.post(
      `${BASE_URL}/${encodeId(ingredientId)}/hide`,
      {},
      { notifyOnError: false },
    )
    return adaptIngredient(response?.data || response)
  },
}

export default SupplierIngredientService
