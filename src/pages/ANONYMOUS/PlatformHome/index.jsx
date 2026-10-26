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
        if (isMounted && res?.data) {
          setSchools(res.data)
        }
      } catch {
        // Handled in SchoolService fallback
      }
    }

    fetchSchools()

    return () => {
      isMounted = false
    }
  }, [])

  // Tìm kiếm trường học tức thì theo tên, địa chỉ, quận hoặc mã
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools

    const query = searchQuery.toLowerCase().trim()
    return schools.filter(
      item =>
        item.name.toLowerCase().includes(query) ||
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

      {/* 3. Phần Giá trị Cốt lõi của FoodPrint */}
      <AboutFeatures />

      {/* 4. Phần 3 bước quy trình hoạt động */}
      <HowItWorks />

      {/* 5. Khối CTA Kêu gọi tham gia */}
      <RegisterCta />
    </div>
  )
}

export default PlatformHome
