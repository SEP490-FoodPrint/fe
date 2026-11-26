import http from "src/services/01_axios"
import {
  buildEvidenceBody,
  evidenceRequestConfig,
} from "src/components/EvidenceFiles/evidenceFiles"
import { normalizeTicketFields } from "src/components/ComplaintThread/ticketHelpers"

const BASE_URL = "/authority-complaints"

function encodeId(id) {
  return encodeURIComponent(String(id ?? "").trim())
}

const AuthorityComplaintService = {
  async list(params = {}, signal) {
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
    const response = await http.get(`${BASE_URL}/${encodeId(id)}`, {
      signal,
      notifyOnError: false,
    })
    return normalizeTicketFields(response?.data ?? response)
  },

  async escalate({ mealComplaintId, reason, files }) {
    const payload = { mealComplaintId }
    const trimmed = String(reason ?? "").trim()
    if (trimmed) {
      payload.reason = trimmed
    }
    const body = buildEvidenceBody(payload, files)
    const response = await http.post(
      BASE_URL,
      body,
      evidenceRequestConfig(body, { notifyOnError: false }),
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async accept(id) {
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/accept`,
      {},
      { notifyOnError: false },
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async comment(id, content, files) {
    const body = buildEvidenceBody(
      { content: String(content ?? "").trim() },
      files,
    )
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/comments`,
      body,
      evidenceRequestConfig(body, { notifyOnError: false }),
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async resolve(id, content, files) {
    const body = buildEvidenceBody(
      { content: String(content ?? "").trim() },
      files,
    )
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/resolve`,
      body,
      evidenceRequestConfig(body, { notifyOnError: false }),
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async satisfy(id) {
    const response = await http.post(
      `${BASE_URL}/${encodeId(id)}/satisfy`,
      {},
      { notifyOnError: false },
    )
    return normalizeTicketFields(response?.data ?? response)
  },

  async reopen(id, reason) {
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
