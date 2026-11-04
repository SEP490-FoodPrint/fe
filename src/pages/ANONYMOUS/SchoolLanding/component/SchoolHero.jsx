import React from "react"
import PropTypes from "prop-types"
import {
  CalendarDays,
  CalendarRange,
  Leaf,
  MapPin,
  Users,
} from "lucide-react"
import { NO_DATA_TEXT } from "src/constants/ui"
import styles from "./SchoolHero.module.scss"

const DEFAULT_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida/AEtjO1XlqSmOu0ItBe9yXWYK-HH0qJi-YUY5wHooEUPuGWXQR9Az9oxrFxFlAbWGgthrYAGTCYeuN2u9stYeyQ6l9BEvLlCFe6XqUGhD2rR_nVtbVwEDfzHdKY-4ocKe4fUrG0dvyWEwoNn0dDGDAu1QNLeAGbMR1DQo9YR977O5y6shU5EfdeacFlOyzOgKKrbgYXR07wydVVR3ye4bKSfNMVsdxZ4qiYimYtSrWetrL8HJqtU8DKUgRD8Qohk"

function SchoolHero({ school }) {
  const scrollToDaily = e => {
    e.preventDefault()
    const el = document.getElementById("thuc-don-ngay")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToWeekly = e => {
    e.preventDefault()
    const el = document.getElementById("thuc-don-tuan")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const schoolAddress = school?.address || NO_DATA_TEXT

  const schoolBoardingScale =
    school?.boardingScale ||
    NO_DATA_TEXT

  return (
    <section id="gioi-thieu" className={styles.heroSection}>
      <div className={styles.container}>
        {/* Main Card */}
        <div className={styles.card}>
          <div className={styles.grid}>
            {/* Col Left: Thông tin trường */}
            <div className={styles.leftCol}>
              <div className={styles.titleGroup}>
                <h1 className={styles.schoolTitle}>
                  {school?.name || NO_DATA_TEXT}
                </h1>
                <p className={styles.description}>
                  {school?.description || NO_DATA_TEXT}
                </p>
              </div>

              {/* 2 Metadata Rows: Địa chỉ & Tổng suất ăn bán trú */}
              <div className={styles.metaGrid}>
                <div className={styles.metaCard}>
                  <MapPin size={20} className={styles.metaIcon} />
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Địa chỉ</span>
                    <span className={styles.metaValue} title={schoolAddress}>
                      {schoolAddress}
                    </span>
                  </div>
                </div>

                <div className={styles.metaCard}>
                  <Users size={20} className={styles.metaIcon} />
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Tổng suất ăn bán trú</span>
                    <span className={styles.metaValue} title={schoolBoardingScale}>
                      {schoolBoardingScale}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className={styles.ctaGroup}>
                <a
                  href="#thuc-don-ngay"
                  onClick={scrollToDaily}
                  className={styles.primaryCta}
                >
                  <CalendarDays size={18} />
                  <span>Xem thực đơn hôm nay</span>
                </a>
                <a
                  href="#thuc-don-tuan"
                  onClick={scrollToWeekly}
                  className={styles.secondaryCta}
                >
                  <CalendarRange size={18} />
                  <span>Xem thực đơn tuần này</span>
                </a>
              </div>
            </div>

            {/* Col Right: Khung ảnh khay cơm thực tế */}
            <div className={styles.rightCol}>
              <div className={styles.imageFrame}>
                <img
                  src={school?.coverImageUrl || DEFAULT_HERO_IMAGE}
                  alt={`Khay cơm bán trú học sinh ${school?.name || ""}`}
                  className={styles.heroImg}
                  loading="eager"
                />
                <div className={styles.imageGradientOverlay} />

                <div className={styles.floatingBadges}>
                  <span className={styles.nutritionBadge}>
                    <Leaf size={14} />
                    <span>Khẩu phần bán trú tiêu chuẩn dinh dưỡng</span>
                  </span>
                  <span className={styles.diaryBadge}>
                    Ảnh nhật ký hôm nay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

SchoolHero.propTypes = {
  school: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    description: PropTypes.string,
    boardingScale: PropTypes.string,
    coverImageUrl: PropTypes.string,
  }),
}

export default SchoolHero
