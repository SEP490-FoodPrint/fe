import React from "react"
import styles from "./HowItWorks.module.scss"

const steps = [
  { title: "Tìm trường học", desc: "Sử dụng thanh tìm kiếm hoặc danh sách trường học để lựa chọn cơ sở bạn muốn theo dõi." },
  { title: "Truy cập trang trường", desc: "Khám phá thông tin bếp ăn bán trú và những thông tin nhà trường công khai." },
  { title: "Khám phá thực đơn", desc: "Xem thực đơn theo ngày, tuần và thông tin nguồn gốc nguyên liệu." },
]
export default function HowItWorks() {
  return <section id="how-it-works" className={styles.section}><div className={styles.container}>
    <div className={styles.heading}><h2>Thông tin bữa ăn trong tầm tay.</h2><p>Phụ huynh và nhà trường có thể tìm và theo dõi thông tin bữa ăn học đường.</p></div>
    <ol className={styles.steps}>{steps.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.desc}</p></li>)}</ol>
  </div></section>
}
