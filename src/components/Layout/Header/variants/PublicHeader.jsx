import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  LogIn,
  Search,
} from "lucide-react";
import { StoreContext } from "src/contexts";
import ROUTER from "src/router/ROUTER";
import BrandLogo from "src/components/Common/BrandLogo";
import { NO_DATA_TEXT } from "src/constants/ui";
import SchoolService from "src/services/SchoolService";
import BaseHeader from "../BaseHeader";
import styles from "./PublicHeader.module.scss";
import PublicAccountMenu from "src/components/Common/PublicAccountMenu";

function PublicHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginStore, userStore } = useContext(StoreContext);
  const isLoginContext = loginStore?.isLoginContext;
  const user = userStore?.user;

  const [schools, setSchools] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [activeNav, setActiveNav] = useState("home");
  const dropdownRef = useRef(null);

  // Theo dõi active navigation item trên trang chủ (theo hash hoặc scroll)
  useEffect(() => {
    if (location.pathname !== ROUTER.DEFAULT) {
      if (location.pathname.startsWith(ROUTER.SCHOOL_LIST)) {
        setActiveNav("schools");
      } else {
        setActiveNav("");
      }
      return;
    }

    // Kiểm tra hash ban đầu khi vào trang chủ
    const initialHash = window.location.hash.replace("#", "");
    if (["about", "schools", "how-it-works"].includes(initialHash)) {
      setActiveNav(initialHash);
    } else {
      setActiveNav("home");
    }

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const scrollY = window.scrollY;
        if (scrollY < 180) {
          setActiveNav("home");
          return;
        }

        const sections = [
          { id: "schools", el: document.getElementById("schools") },
          { id: "about", el: document.getElementById("about") },
          { id: "how-it-works", el: document.getElementById("how-it-works") },
        ];

        const scrollPos = scrollY + 140;
        let current = "home";

        for (const s of sections) {
          if (s.el) {
            const top = s.el.offsetTop;
            const height = s.el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              current = s.id;
              break;
            } else if (scrollPos >= top) {
              current = s.id;
            }
          }
        }
        setActiveNav(current);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Điều hướng hoặc cuộn mượt đến section khi người dùng click
  const handleNavClick = (sectionId, e) => {
    if (e && location.pathname === ROUTER.DEFAULT) {
      e.preventDefault();
    }
    setActiveNav(sectionId);

    if (location.pathname === ROUTER.DEFAULT) {
      if (sectionId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(null, "", `#${sectionId}`);
        }
      }
    } else {
      navigate(sectionId === "home" ? ROUTER.DEFAULT : `${ROUTER.DEFAULT}#${sectionId}`);
    }
  };

  // Nạp danh sách trường học từ API /schools/public
  useEffect(() => {
    let isMounted = true;
    const fetchSchools = async () => {
      try {
        const res = await SchoolService.getPublicSchools();
        if (isMounted) {
          const schoolList = Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.data?.items) ? res.data.items : []);
          setSchools(schoolList);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách trường ở header:", err);
      }
    };
    fetchSchools();
    return () => {
      isMounted = false;
    };
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSchools = useMemo(() => {
    const query = dropdownSearch.toLowerCase().trim();
    if (!query) return schools;
    return schools.filter(
      (s) =>
        s.name?.toLowerCase().includes(query) ||
        s.district?.toLowerCase().includes(query) ||
        s.address?.toLowerCase().includes(query) ||
        s.code?.toLowerCase().includes(query),
    );
  }, [schools, dropdownSearch]);

  const leftSlot = (
    <Link
      to={ROUTER.DEFAULT}
      className={styles.brandLink}
      onClick={(e) => handleNavClick("home", e)}
      title="FoodPrint - Trang chủ"
    >
      <BrandLogo theme="light" subtitle="" />
    </Link>
  );

  const centerSlot = (
    <nav className={styles.navBar} aria-label="Main navigation">
      <Link
        to={ROUTER.DEFAULT}
        className={`${styles.navItem} ${activeNav === "home" ? styles.isActive : ""}`}
        onClick={(e) => handleNavClick("home", e)}
      >
        Trang chủ
      </Link>

      <a
        href={`${ROUTER.DEFAULT}#about`}
        className={`${styles.navItem} ${activeNav === "about" ? styles.isActive : ""}`}
        onClick={(e) => handleNavClick("about", e)}
      >
        Giới thiệu
      </a>

      {/* Dropdown tìm kiếm trường học nhanh */}
      <div className={styles.dropdownContainer} ref={dropdownRef}>
        <button
          type="button"
          className={`${styles.dropdownBtn} ${
            activeNav === "schools" || isDropdownOpen ? styles.isActive : ""
          } ${isDropdownOpen ? styles.isOpen : ""}`}
          onClick={(e) => {
            setIsDropdownOpen((prev) => !prev);
            handleNavClick("schools", e);
          }}
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
            </div>

            <div className={styles.panelSearch}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Nhập tên trường hoặc quận..."
                value={dropdownSearch}
                onChange={(e) => setDropdownSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.schoolList}>
              {filteredSchools.slice(0, 5).map((school) => (
                <Link
                  key={school.id}
                  to={`/school/${school.code}`}
                  onClick={() => setIsDropdownOpen(false)}
                  className={styles.schoolItem}
                >
                  <div className={styles.itemLeft}>
                    <div className={styles.itemAvatar}>
                      {school.shortName || school.short_name || school.code?.slice(0, 2) || "TH"}
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemSchoolName}>
                        {school.name}
                      </span>
                      <span className={styles.itemAddress}>
                        {school.district
                          ? `${school.district}, ${school.city || NO_DATA_TEXT}`
                          : school.address || NO_DATA_TEXT}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className={styles.itemArrow} />
                </Link>
              ))}
            </div>

            <div className={styles.panelFooter}>
              <Link
                to={ROUTER.SCHOOL_LIST}
                onClick={() => setIsDropdownOpen(false)}
                className={styles.viewAllLink}
              >
                <span>Xem tất cả danh sách trường</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      <a
        href={`${ROUTER.DEFAULT}#how-it-works`}
        className={`${styles.navItem} ${activeNav === "how-it-works" ? styles.isActive : ""}`}
        onClick={(e) => handleNavClick("how-it-works", e)}
      >
        Cách hoạt động
      </a>
    </nav>
  );

  const rightSlot = (
    <div className={styles.actionsWrap}>
      {isLoginContext && user ? (
        <PublicAccountMenu />
      ) : (
        <>
          <Link to={ROUTER.LOGIN} className={styles.loginBtn}>
            <LogIn size={15} />
            <span>Đăng nhập</span>
          </Link>

          <Link to={ROUTER.REGISTER} className={styles.registerBtn}>
            <span>Đăng ký</span>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <BaseHeader
      leftSlot={leftSlot}
      centerSlot={centerSlot}
      rightSlot={rightSlot}
      variant="contained"
    />
  );
}

export default PublicHeader;
