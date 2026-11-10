import React, { useEffect, useMemo, useState } from "react"
import SchoolService from "src/services/SchoolService"
import { filterPublicSchools, getPublicSchoolItems } from "src/utils/publicSchool"
import HeroBanner from "./component/HeroBanner"
import SchoolDiscovery from "./component/SchoolDiscovery"
import AboutFeatures from "./component/AboutFeatures"
import HowItWorks from "./component/HowItWorks"
import RegisterCta from "./component/RegisterCta"
import "./style.scss"

function PlatformHome() {
  const [schools, setSchools] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  // Tải một lần danh sách trường giới thiệu. Tìm kiếm bên dưới dùng lại danh sách này.
  useEffect(() => {
    let isMounted = true

    const fetchSchools = async () => {
      try {
        const res = await SchoolService.getPublicSchools({ limit: 6, page: 1 })
        if (isMounted) {
          setSchools(getPublicSchoolItems(res).slice(0, 6))
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

  // Lọc ngay khi người dùng nhập vào ô tìm kiếm của SchoolDiscovery.
  const filteredSchools = useMemo(
    () => filterPublicSchools(schools, searchQuery),
    [schools, searchQuery],
  )

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

      {/* 4. Các bước tra cứu thực đơn */}
      <HowItWorks />

      {/* 5. Khối Kêu gọi Đăng ký Onboarding */}
      <RegisterCta />
    </div>
  )
}

export default PlatformHome
