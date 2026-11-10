import React, { useEffect, useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import FoodPrintLoading from "./FoodPrintLoading"

/**
 * RouteTransitionLoader - Tự động kích hoạt hiệu ứng loading FoodPrint khi chuyển trang
 * và tự động biến mất khi trang tải xong.
 */
export default function RouteTransitionLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Không hiện loading khi khởi tạo lần đầu tiên (đã có Suspense / DefaultAction xử lý)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 280)

    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  if (!loading) return null

  return <FoodPrintLoading fullscreen background="cream" />
}
