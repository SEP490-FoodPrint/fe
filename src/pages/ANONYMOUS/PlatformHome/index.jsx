import React, { useEffect, useMemo, useState } from "react"
import SchoolService from "src/services/SchoolService"
import HeroBanner from "./component/HeroBanner"
import SchoolDiscovery from "./component/SchoolDiscovery"
import AboutFeatures from "./component/AboutFeatures"
import HowItWorks from "./component/HowItWorks"
import RegisterCta from "./component/RegisterCta"
import "./style.scss"

function PlatformHome() {
  const [schools, setSchools] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let isMounted = true

    const fetchSchools = async () => {
      try {
        const res = await SchoolService.getPublicSchools()
        if (isMounted) {
          const schoolList = Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.data?.items) ? res.data.items : [])
          setSchools(schoolList)
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách trường tại PlatformHome:", err)
      }
    }

    fetchSchools()

    return () => {
      isMounted = false
    }
  }, [])

  // Tìm kiếm trường học tức thì theo tên, địa chỉ, quận hoặc mã
  const filteredSchools = useMemo(() => {
    if (!Array.isArray(schools)) return []
    if (!searchQuery.trim()) return schools

    const query = searchQuery.toLowerCase().trim()
    return schools.filter(
      item =>
        item.name?.toLowerCase().includes(query) ||
        item.address?.toLowerCase().includes(query) ||
        item.district?.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query),
    )
  }, [schools, searchQuery])

  return (
    <div className="platform-home-wrapper">
      {/* 1. Phần Hero Banner & Khay cơm bán trú */}
      <HeroBanner />

      {/* 2. Phần Khám phá Mạng lưới Trường học & Tìm kiếm */}
      <SchoolDiscovery
        schools={filteredSchools}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. Phần Tính năng Nổi bật */}
      <AboutFeatures />

      {/* 4. Quy trình Vận hành 4 bước */}
      <HowItWorks />

      {/* 5. Khối Kêu gọi Đăng ký Onboarding */}
      <RegisterCta />
    </div>
  )
}

export default PlatformHome
