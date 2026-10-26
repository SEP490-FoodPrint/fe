import React from "react"
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Compass,
  ShieldCheck,
} from "lucide-react"
import styles from "./HeroBanner.module.scss"

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAHEW9YXlZAHQ3bu0vjwRsBMBfQdhOiupyqg9vewHQTQ48ksTX0VqpfDghxCHUkV0BLbF2JWEVgKcpNirGRdUw_yW7GZH93P7GsFa9-PgMpsmBDBXMmVi8IXIrJTIW4H5sCt8UPLvFi4jWLB0-fgmDM40vgc7iR-QEQYiAzZZVZH_80vrnTS4jlursh3mjT0E296tiPZ7LQEl95p1ypikBbHi4_twD8Rcj-AdCZV09U-Ys6pdoQyNJTwQ"

function HeroBanner() {
  const scrollToSchools = e => {
    e.preventDefault()
    const target = document.getElementById("schools")
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToAbout = e => {
    e.preventDefault()
    const target = document.getElementById("about")
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroPattern} />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Cột trái: Tiêu đề & Lời gọi hành động */}
          <div className={styles.leftCol}>
            <div className={styles.pillBadge}>
              <span className={styles.pulseDot} />
              <span>Nền tảng quản lý bữa ăn học đường</span>
            </div>

            <h1 className={styles.mainTitle}>
              Minh bạch từng bữa ăn,
              <br />
              <span className={styles.highlightText}>an tâm</span> mỗi ngày
            </h1>

            <p className={styles.subText}>
              FoodPrint kết nối nhà trường, nhà cung cấp và cộng đồng phụ huynh
              trong việc quản lý thực đơn, theo dõi chất lượng bữa ăn và truy
              xuất nguồn gốc thực phẩm học đường an toàn & dinh dưỡng.
            </p>

            <div className={styles.ctaGroup}>
              <a
                href="#schools"
                onClick={scrollToSchools}
                className={styles.primaryCta}
              >
                <Compass size={18} />
                <span>Khám phá trường học</span>
              </a>

              <a
                href="#about"
                onClick={scrollToAbout}
                className={styles.secondaryCta}
              >
                <span>Tìm hiểu FoodPrint</span>
                <ChevronDown size={16} />
              </a>
            </div>

            {/* Chỉ số uy tín */}
            <div className={styles.trustList}>
              <span className={styles.trustItem}>
                <CheckCircle2 size={16} />
                <span>Thông tin rõ ràng</span>
              </span>
              <span className={styles.dividerDot}>·</span>
              <span className={styles.trustItem}>
                <CheckCircle2 size={16} />
                <span>Quy trình minh bạch</span>
              </span>
              <span className={styles.dividerDot}>·</span>
              <span className={styles.trustItem}>
                <CheckCircle2 size={16} />
                <span>Dễ dàng tra cứu</span>
              </span>
            </div>
          </div>

          {/* Cột phải: Hình ảnh khay cơm & 2 Floating Badge */}
          <div className={styles.rightCol}>
            <div className={styles.glowBlob} />

            <div className={styles.imageFrame}>
              <div className={styles.imageInner}>
                <img
                  src={HERO_IMAGE_URL}
                  alt="Khay cơm bán trú học đường Việt Nam đầy đủ dinh dưỡng"
                  loading="lazy"
                />
                <span className={styles.imageTag}>
                  Khẩu phần bán trú tiểu học
                </span>
              </div>

              {/* Floating Badge 1: Thực đơn */}
              <div className={styles.floatingBadgeTop}>
                <div className={styles.badgeIconBox}>
                  <CalendarDays size={20} />
                </div>
                <div className={styles.badgeText}>
                  <span className={styles.badgeTitle}>Thực đơn học đường</span>
                  <span className={styles.badgeDesc}>
                    Cập nhật theo ngày và tuần
                  </span>
                </div>
              </div>

              {/* Floating Badge 2: Nguồn gốc */}
              <div className={styles.floatingBadgeBottom}>
                <div
                  className={styles.badgeIconBox}
                  style={{
                    backgroundColor: "var(--color-success-bg)",
                    color: "var(--color-success)",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.badgeText}>
                  <span className={styles.badgeTitle}>Truy xuất nguồn gốc</span>
                  <span className={styles.badgeDesc}>
                    Nguyên liệu sạch minh bạch
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

export default HeroBanner
