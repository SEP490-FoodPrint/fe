import React, { useEffect, useState, useCallback, useRef } from "react";
import { SearchX, AlertCircle, RefreshCw } from "lucide-react";
import SchoolService from "src/services/SchoolService";
import SchoolCard from "src/pages/ANONYMOUS/PlatformHome/component/SchoolCard";
import SchoolFilterBar from "./component/SchoolFilterBar";
import SchoolPagination from "./component/SchoolPagination";
import styles from "./SchoolList.module.scss";

const LIMIT_PER_PAGE = 12;

function SchoolList() {
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasNext: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchDebounceRef = useRef(null);
  const topAnchorRef = useRef(null);

  // 1. Tải danh mục địa giới hành chính từ Backend
  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const res = await SchoolService.getPublicLocations();
        if (isMounted) {
          const locList = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];
          setLocations(locList);
        }
      } catch (err) {
        console.warn("Không thể tải danh mục locations từ Backend:", err);
      }
    };

    fetchLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Hàm gọi API lấy danh sách trường học theo trang & bộ lọc
  const fetchSchools = useCallback(
    async (pageToLoad = 1, currentSearch = searchQuery, city = selectedCity, district = selectedDistrict) => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page: pageToLoad,
          limit: LIMIT_PER_PAGE,
        };

        if (currentSearch.trim()) params.search = currentSearch.trim();
        if (city) params.city = city;
        if (district) params.district = district;

        const res = await SchoolService.getPublicSchools(params);
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : [];

        setSchools(items);

        if (res?.pagination) {
          setPagination({
            page: res.pagination.page || pageToLoad,
            limit: res.pagination.limit || LIMIT_PER_PAGE,
            total: res.pagination.total ?? items.length,
            totalPages: res.pagination.totalPages || Math.ceil((res.pagination.total || items.length) / LIMIT_PER_PAGE) || 1,
            hasNext: Boolean(res.pagination.hasNext),
          });
        } else {
          setPagination((prev) => ({
            ...prev,
            page: pageToLoad,
            total: items.length,
            totalPages: Math.ceil(items.length / LIMIT_PER_PAGE) || 1,
            hasNext: false,
          }));
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách trường học:", err);
        setError("Không thể tải dữ liệu trường học từ hệ thống. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedCity, selectedDistrict]
  );

  // 3. Tự động tải lại khi đổi City, District hoặc Page
  useEffect(() => {
    fetchSchools(pagination.page, searchQuery, selectedCity, selectedDistrict);
  }, [pagination.page, selectedCity, selectedDistrict]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Xử lý tìm kiếm từ khóa có debounce 350ms
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchSchools(1, query, selectedCity, selectedDistrict);
    }, 350);
  };

  // 5. Xử lý đổi Thành phố
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedDistrict("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 6. Xử lý đổi Quận/Huyện/Phường
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 7. Xử lý đổi trang (Pagination)
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.page) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    if (topAnchorRef.current) {
      topAnchorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 8. Đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedDistrict("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSchools(1, "", "", "");
  };

  return (
    <div className={styles.pageWrapper} ref={topAnchorRef}>
      <div className={styles.container}>
        {/* Header Giới thiệu trang danh sách trường */}
        <header className={styles.pageHeader}>
          <div className={styles.headerBadge}>
            <span className={styles.pulseDot} />
            <span>Mạng lưới giáo dục</span>
          </div>
          <h1 className={styles.pageTitle}>
            Danh sách trường học trên FoodPrint
          </h1>
          <p className={styles.pageSubtitle}>
            Khám phá thông tin các cơ sở giáo dục ứng dụng hệ thống quản lý
            suất ăn bán trú, dinh dưỡng cân bằng và minh bạch thực đơn học đường.
          </p>
        </header>

        {/* Thanh tìm kiếm & Bộ lọc địa điểm 2 cấp */}
        <SchoolFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          selectedDistrict={selectedDistrict}
          onDistrictChange={handleDistrictChange}
          locations={locations}
          onReset={handleResetFilters}
          isLoading={loading}
        />

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className={styles.errorNotice} role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => fetchSchools(pagination.page, searchQuery, selectedCity, selectedDistrict)}
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Vùng hiển thị Lưới 4 cột x 3 hàng = 12 trường */}
        <main className={styles.contentArea}>
          {loading ? (
            /* Skeleton Loading Grid */
            <div className={styles.schoolsGrid}>
              {Array.from({ length: LIMIT_PER_PAGE }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className={styles.cardSkeleton}>
                  <div className={styles.skeletonTop}>
                    <div className={styles.skeletonAvatar} />
                    <div className={styles.skeletonBadge} />
                  </div>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonAddress} />
                  <div className={styles.skeletonFooter} />
                </div>
              ))}
            </div>
          ) : schools.length > 0 ? (
            /* Lưới danh sách các trường học */
            <div className={styles.schoolsGrid}>
              {schools.map((school) => (
                <SchoolCard key={school.id || school.code} school={school} />
              ))}
            </div>
          ) : (
            /* Trạng thái không tìm thấy trường */
            <div className={styles.emptyState}>
              <div className={styles.emptyIconBox}>
                <SearchX size={44} />
              </div>
              <h2 className={styles.emptyTitle}>
                Không tìm thấy trường học phù hợp
              </h2>
              <p className={styles.emptyDescription}>
                {searchQuery || selectedCity || selectedDistrict ? (
                  <>
                    Không có cơ sở giáo dục nào khớp với các tiêu chí tìm kiếm
                    đã chọn. Vui lòng thử tìm với từ khóa khác hoặc thay đổi bộ
                    lọc địa điểm.
                  </>
                ) : (
                  <>Hiện tại chưa có dữ liệu trường học nào được công khai.</>
                )}
              </p>
              {(searchQuery || selectedCity || selectedDistrict) && (
                <button
                  type="button"
                  className={styles.resetFilterBtn}
                  onClick={handleResetFilters}
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          )}
        </main>

        {/* Thanh Phân Trang chuẩn theo Backend */}
        {!loading && schools.length > 0 && (
          <SchoolPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default SchoolList;
