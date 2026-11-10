import React from "react"
import styles from "./AboutFeatures.module.scss"

// Nội dung giới thiệu nền tảng được khai báo tĩnh để hiển thị trước khi có dữ liệu trường.
const features = [
  { title: "Thực đơn rõ ràng", desc: "Theo dõi thực đơn bán trú theo ngày và tuần, giúp phụ huynh và học sinh dễ dàng tra cứu." },
  { title: "Thông tin nguồn gốc", desc: "Theo dõi nguồn gốc nguyên liệu và các chứng nhận an toàn do nhà cung cấp cung cấp." },
  { title: "Kết nối các bên", desc: "Kết nối nhà trường, nhà cung cấp và phụ huynh trong việc theo dõi bữa ăn học đường." },
]
export default function AboutFeatures() {
  return <section id="about" className={styles.section}><div className={styles.container}>
    <div className={styles.intro}><h2>Thông tin bữa ăn, rõ ràng hơn mỗi ngày.</h2><p>FoodPrint kết nối dữ liệu thực đơn, nguyên liệu và quy trình kiểm thực để các bên cùng theo dõi.</p></div>
    <div className={styles.features}>{features.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.desc}</p></article>)}</div>
  </div></section>
}
