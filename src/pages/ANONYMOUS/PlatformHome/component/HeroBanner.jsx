import React from "react"
import { ArrowRight } from "lucide-react"
import heroImage from "src/assets/images/school-meal-service.png"
import styles from "./HeroBanner.module.scss"

export default function HeroBanner() {
  const handleScrollToSchools = e => {
    const target = document.getElementById("schools")
    if (target) {
      e.preventDefault()
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroGrid}>
          <div className={styles.copyCol}>
            <h1 className={styles.mainTitle}>
              Minh bạch từng bữa ăn học đường.
            </h1>

            <p className={styles.leadText}>
              FoodPrint kết nối nhà trường, nhà cung cấp và phụ huynh trong việc
              quản lý thực đơn, theo dõi chất lượng bữa ăn và truy xuất nguồn
              gốc thực phẩm học đường.
            </p>

            <div className={styles.ctaRow}>
              <a
                href="#schools"
                onClick={handleScrollToSchools}
                className={styles.primaryCta}
              >
                <span>Khám phá trường học</span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className={styles.visualCol}>
            <figure className={styles.imageCard}>
              <div className={styles.imageFrame}>
                <img
                  src={heroImage}
                  alt="Học sinh nhận suất ăn tại bếp ăn trường học"
                  fetchPriority="high"
                />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}




