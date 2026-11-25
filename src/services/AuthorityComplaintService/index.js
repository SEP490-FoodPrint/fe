import http from "src/services/01_axios"
import { USE_NEW_FEATURES_MOCK } from "src/lib/config"
import { mockAuthorityComplaints } from "src/services/mockNewFeatures"
import { normalizeTicketFields } from "src/components/ComplaintThread/ticketHelpers"

const BASE_URL = "/authority-complaints"

function encodeId(id) {
  return encodeURIComponent(String(id ?? "").trim())
}

const AuthorityComplaintService = {
  async list(params = {}, signal) {
    if (USE_NEW_FEATURES_MOCK) {
      const res = await mockAuthorityComplaints.list(params)
      return { ...res, items: res.items.map(normalizeTicketFields) }
    }
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      ),
    )
    const response = await http.get(BASE_URL, {
      params: cleanParams,
      signal,
      notifyOnError: false,
    })
    const payload = response?.data ?? response ?? {}
    const items = Array.isArray(payload.items)
      ? payload.items.map(normalizeTicketFields)
      : []
    const rawPagination = payload.pagination || {}
    return {
      items,
      pagination: {
        page: Number(rawPagination.page) || Number(cleanParams.page) || 1,
        limit: Number(rawPagination.limit) || Number(cleanParams.limit) || 20,
        hasNext: Boolean(rawPagination.hasNext),
      },
    }
  },

  async detail(id, signal) {
    if (USE_NEW_FEATURES_MOCK) {
      return normalizeTicketFields(await mockAuthorityComplaints.detail(id))
    }
    const response = await http.get(`${BASE_URL}/${encodeId(id)}`, {
      signal,
      notifyOnError: false,
    })
    return normalizeTicketFields(response?.data ?? response)
  },

  async escalate({ mealComplaintId, reason }) {
    if (USE_NEW_FEATURES_MOCK) {
      return normalizeTicketFields(
        await mockAuthorityComplaints.escalate({ mealComplaintId, reason }),
      )
    }
    const payload = { mealComplaintId }
    const trimmed = String(reason ?? "").trim()
    if (trimmed) {
      payload.reason = trimmed
    }
    const response = await http.post(BASE_URL, payload, {
      notifyOnError: false,
    })
    return normalizeTicketFields(response?.data ?? response)
  },

  async accept(id) {
    if (USE_NEW_FEATURES_MOCK) {
      return normalizeTicketFields(await mockAuthorityComplaints.accept(id))
    }
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/accept`,
      {},
      { notifyOnError: false },
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async comment(id, content) {
    if (USE_NEW_FEATURES_MOCK) {
      return normalizeTicketFields(
        await mockAuthorityComplaints.comment(id, content),
      )
    }
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/comments`,
      { content: String(content ?? "").trim() },
      { notifyOnError: false },
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async resolve(id, content) {
    if (USE_NEW_FEATURES_MOCK) {
      return normalizeTicketFields(
        await mockAuthorityComplaints.resolve(id, content),
      )
    }
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/resolve`,
      { content: String(content ?? "").trim() },
      { notifyOnError: false },
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async satisfy(id) {
    if (USE_NEW_FEATURES_MOCK) {
      return normalizeTicketFields(await mockAuthorityComplaints.satisfy(id))
    }
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/satisfy`,
      {},
      { notifyOnError: false },
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async reopen(id, reason) {
    if (USE_NEW_FEATURES_MOCK) {
      return normalizeTicketFields(
        await mockAuthorityComplaints.reopen(id, reason),
      )
    }
    const trimmed = String(reason ?? "").trim()
    const payload = trimmed ? { reason: trimmed } : {}
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/reopen`,
      payload,
      { notifyOnError: false },
    )
    return normalizeTicketFields(response?.data ?? response)
  },
}

export default AuthorityComplaintService
