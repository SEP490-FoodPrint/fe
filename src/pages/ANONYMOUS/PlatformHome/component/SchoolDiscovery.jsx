import React, { useCallback, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Search, SearchX } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import "swiper/css"
import ROUTER from "src/router/ROUTER"
import SchoolCard from "./SchoolCard"
import styles from "./SchoolDiscovery.module.scss"

function SchoolDiscovery({ schools = [], searchQuery = "", onSearchChange }) {
  const track = useRef(null)
  const [swiper, setSwiper] = useState(null)
  const [scrollState, setScrollState] = useState({ overflow: false, previous: false, next: false })
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)
  const updateScrollState = useCallback(instance => {
    if (!instance || instance.destroyed) return
    setScrollState({ overflow: !instance.isLocked, previous: !instance.isBeginning, next: !instance.isEnd })
  }, [])

  useEffect(() => {
    if (!swiper || swiper.destroyed) return
    swiper.slideTo(0, 0)
    swiper.update()
    updateScrollState(swiper)
  }, [swiper, schools, searchQuery, updateScrollState])

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    const updateMotion = () => setReducedMotion(media?.matches ?? false)
    const updateVisibility = () => setPageVisible(!document.hidden)
    media?.addEventListener?.("change", updateMotion)
    document.addEventListener("visibilitychange", updateVisibility)
    return () => {
      media?.removeEventListener?.("change", updateMotion)
      document.removeEventListener("visibilitychange", updateVisibility)
    }
  }, [])

  useEffect(() => {
    const element = track.current
    if (!element) return
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [schools])

  useEffect(() => {
    if (!swiper || swiper.destroyed) return
    if (scrollState.overflow && !hovered && !focused && visible && pageVisible && !reducedMotion) swiper.autoplay.start()
    else swiper.autoplay.stop()
    return () => { if (!swiper.destroyed) swiper.autoplay.stop() }
  }, [swiper, scrollState.overflow, hovered, focused, visible, pageVisible, reducedMotion])
  const handleSubmit = e => {
    e.preventDefault()
  }

  return (
    <section id="schools" className={styles.section}>
      <div className={styles.container}>
        {/* Tiêu đề & Giới thiệu khu vực */}
        <div className={styles.headerArea}>
          <span className={styles.sectionBadge}>Mạng lưới giáo dục</span>
          <h2 className={styles.sectionTitle}>
            Khám phá các trường học trên FoodPrint
          </h2>
          
        </div>

        {schools.length > 0 ? <div ref={track}
          onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true) }}
          onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false) }}
          onFocus={() => setFocused(true)}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
        >
          <Swiper id="school-carousel" className={styles.schoolsGrid} modules={[Autoplay]} slidesPerView={1} spaceBetween={16} breakpoints={{ 701: { slidesPerView: 2 }, 851: { slidesPerView: 3 } }} rewind watchOverflow autoplay={{ delay: 5000, disableOnInteraction: false }} speed={reducedMotion ? 0 : 400} onSwiper={instance => { instance.autoplay.stop(); setSwiper(instance); updateScrollState(instance) }} onSlideChange={updateScrollState} onResize={updateScrollState} onLock={updateScrollState} onUnlock={updateScrollState} role="region" aria-label="Danh sách trường học">
            {schools.slice(0, 6).map(school => (
              <SwiperSlide key={school.id}><SchoolCard school={school} /></SwiperSlide>
            ))}
          </Swiper>
          {scrollState.overflow && <div className={styles.carouselControls}>
            <button type="button" onClick={() => swiper?.slidePrev()} disabled={!scrollState.previous} aria-label="Xem trường trước" aria-controls="school-carousel"><ArrowLeft size={19} aria-hidden="true" /></button>
            <button type="button" onClick={() => swiper?.slideNext()} disabled={!scrollState.next} aria-label="Xem trường tiếp theo" aria-controls="school-carousel"><ArrowRight size={19} aria-hidden="true" /></button>
          </div>}
        </div> : (
            <div className={styles.emptyState}>
              <SearchX size={48} color="var(--text-muted)" />
              <div className={styles.emptyTitle}>
                {searchQuery
                  ? "Không tìm thấy trường học phù hợp"
                  : "Chưa có dữ liệu trường học"}
              </div>
              <p>
                {searchQuery ? (
                  <>
                    Không có kết quả nào khớp với từ khóa "{searchQuery}". Vui
                    lòng thử tìm kiếm với tên quận hoặc tên trường khác.
                  </>
                ) : (
                  <>
                    Hiện tại hệ thống chưa có dữ liệu trường học nào được công
                    khai trên nền tảng.
                  </>
                )}
              </p>
            </div>
          )}

        {/* Nút điều hướng xem toàn bộ trường học */}
        <div className={styles.viewAllWrapper}>
          <Link to={ROUTER.SCHOOL_LIST} className={styles.viewAllBtn}>
            <span>Xem tất cả</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

SchoolDiscovery.propTypes = {
  schools: PropTypes.array.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
}

export default SchoolDiscovery
