import React from "react"
import { ArrowRight } from "lucide-react"
import heroImage from "src/assets/images/school-meal-service.png"
import styles from "./HeroBanner.module.scss"

export default function HeroBanner() {
  return <section className={styles.heroSection}>
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Minh bạch từng bữa ăn học đường.</h1>
      <div className={styles.intro}>
        <p>FoodPrint kết nối nhà trường, nhà cung cấp và phụ huynh trong việc quản lý thực đơn, theo dõi chất lượng bữa ăn và truy xuất nguồn gốc thực phẩm học đường.</p>
        <a href="#schools" className={styles.primaryCta}>Khám phá trường học <ArrowRight size={19} aria-hidden="true" /></a>
      </div>
      <figure className={styles.imageFrame}>
        <img src={heroImage} alt="Học sinh nhận suất ăn tại bếp ăn trường học" fetchPriority="high" />
        <figcaption>Thông tin bữa ăn học đường, dễ dàng tra cứu.</figcaption>
      </figure>
    </div>
  </section>
}
