import { useEffect, useState } from "react"
import MenuService from "./index"

export default function useMenuRevisionReview(menuId, enabled) {
  const [request, setRequest] = useState({ menuId: null, review: null, loading: false, error: "" })
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!enabled || !menuId) return
    let active = true
    setRequest({ menuId, review: null, loading: true, error: "" })
    MenuService.getLatestRevisionReview(menuId)
      .then((review) => {
        if (active) setRequest({ menuId, review, loading: false, error: "" })
      })
      .catch((error) => {
        if (active) setRequest({ menuId, review: null, loading: false, error: error.message || "Không tải được lý do yêu cầu chỉnh sửa." })
      })
    return () => { active = false }
  }, [menuId, enabled, retry])

  const current = enabled && request.menuId === menuId
    ? request
    : { review: null, loading: Boolean(enabled && menuId), error: "" }
  return { ...current, retry: () => setRetry((value) => value + 1) }
}
