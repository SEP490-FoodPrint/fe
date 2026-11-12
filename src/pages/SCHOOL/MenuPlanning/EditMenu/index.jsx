import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"

/**
 * Điều hướng tự động về màn chi tiết thực đơn và bật trực tiếp popup chỉnh sửa.
 * Màn chỉnh sửa riêng đã được bỏ theo yêu cầu để người dùng thao tác trực tiếp trên popup.
 */
export default function EditMenu() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", id), {
        replace: true,
        state: { autoOpenEdit: true },
      })
    } else {
      navigate(ROUTER.SCHOOL_MENU_PLANNING, { replace: true })
    }
  }, [id, navigate])

  return null
}
