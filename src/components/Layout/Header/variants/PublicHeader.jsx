import React, { useContext, useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  Search,
} from "lucide-react"
import { StoreContext } from "src/contexts"
import { getDefaultRedirectByOrg } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import BrandLogo from "src/components/Common/BrandLogo"
import { MOCK_SCHOOLS } from "src/services/SchoolService"
import BaseHeader from "../BaseHeader"
import styles from "./PublicHeader.module.scss"

function PublicHeader() {
  const location = useLocation()
  const { loginStore, userStore } = useContext(StoreContext)
  const isLoginContext = loginStore?.isLoginContext
  const user = userStore?.user

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownSearch, setDropdownSearch] = useState("")
  const dropdownRef = useRef(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredSchools = MOCK_SCHOOLS.filter(
    s =>
      s.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
      s.district.toLowerCase().includes(dropdownSearch.toLowerCase()),
  )

  const leftSlot = (
    <Link to={ROUTER.DEFAULT} style={{ textDecoration: "none" }}>
      <BrandLogo theme="light" />
    </Link>
  )

  const centerSlot = (
    <nav className={styles.navBar} aria-label="Main navigation">
      <Link
        to={ROUTER.DEFAULT}
        className={`${styles.navItem} ${location.pathname === ROUTER.DEFAULT ? styles.isActive : ""}`}
      >
        Trang chủ
      </Link>

      <a href="#about" className={styles.navItem}>
        Giới thiệu
      </a>

      {/* Dropdown tìm kiếm trường học nhanh */}
      <div className={styles.dropdownContainer} ref={dropdownRef}>
        <button
          type="button"
          className={`${styles.dropdownBtn} ${isDropdownOpen ? styles.isOpen : ""}`}
          onClick={() => setIsDropdownOpen(prev => !prev)}
        >
          <span>Khám phá trường học</span>
          <ChevronDown
            size={16}
            style={{
              transform: isDropdownOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {isDropdownOpen && (
          <div className={styles.dropdownPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Tìm kiếm trường học</span>
              <span className={styles.panelBadge}>Hà Nội & Lân cận</span>
            </div>

            <div className={styles.panelSearch}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Nhập tên trường hoặc quận..."
                value={dropdownSearch}
                onChange={e => setDropdownSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.schoolList}>
              {filteredSchools.slice(0, 5).map(school => (
                <Link
                  key={school.id}
                  to={`/school/${school.code}`}
                  onClick={() => setIsDropdownOpen(false)}
                  className={styles.schoolItem}
                >
                  <div className={styles.itemLeft}>
                    <div className={styles.itemAvatar}>
                      {school.short_name || school.code?.slice(0, 2)}
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemSchoolName}>
                        {school.name}
                      </span>
                      <span className={styles.itemAddress}>
                        {school.district}, {school.city}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className={styles.itemArrow} />
                </Link>
              ))}
            </div>

            <div className={styles.panelFooter}>
              <a
                href="#schools"
                onClick={() => setIsDropdownOpen(false)}
                className={styles.viewAllLink}
              >
                <span>Xem tất cả danh sách trường</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}
      </div>

      <a href="#how-it-works" className={styles.navItem}>
        Cách hoạt động
      </a>
    </nav>
  )

  const rightSlot = (
    <div className={styles.actionsWrap}>
      {isLoginContext && user ? (
        <Link
          to={getDefaultRedirectByOrg(user.orgType)}
          className={styles.dashboardBtn}
        >
          <LayoutDashboard size={16} />
          <span>Vào Bảng điều khiển</span>
        </Link>
      ) : (
        <>
          <Link to={ROUTER.LOGIN} className={styles.loginBtn}>
            <LogIn size={15} />
            <span>Đăng nhập</span>
          </Link>

          <Link to={ROUTER.LOGIN} className={styles.registerBtn}>
            <span>Đăng ký tham gia</span>
          </Link>
        </>
      )}
    </div>
  )

  return (
    <BaseHeader
      leftSlot={leftSlot}
      centerSlot={centerSlot}
      rightSlot={rightSlot}
      variant="contained"
    />
  )
}

export default PublicHeader
