import React from "react"
import { ClipboardList, School, Search } from "lucide-react"
import styles from "./HowItWorks.module.scss"

function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <Search size={24} />,
      title: "Tìm trường học",
      desc: "Sử dụng thanh tìm kiếm hoặc danh sách mạng lưới để lựa chọn cơ sở giáo dục bạn muốn theo dõi.",
    },
    {
      step: "02",
      icon: <School size={24} />,
      title: "Truy cập trang trường",
      desc: "Khám phá quy trình bếp ăn bán trú, chứng nhận vệ sinh và tiêu chuẩn an toàn thực phẩm của trường.",
    },
    {
      step: "03",
      icon: <ClipboardList size={24} />,
      title: "Khám phá thực đơn",
      desc: "Xem chi tiết khẩu phần ăn theo từng ngày, tuần, kiểm tra nguồn gốc từng mẻ nguyên liệu được kiểm thực.",
    },
  ]

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerArea}>
          <span className={styles.sectionBadge}>Quy trình đơn giản</span>
          <h2 className={styles.sectionTitle}>
            Dễ dàng tiếp cận thông tin bữa ăn học đường
          </h2>
          <p className={styles.sectionSubtitle}>
            Chỉ với 3 bước đơn giản, phụ huynh và nhà trường có thể kết nối thông
            tin để giám sát dinh dưỡng bữa ăn của con em mỗi ngày.
          </p>
        </div>

        <div className={styles.stepsWrapper}>
          <div className={styles.connectingLine} />

          {steps.map(item => (
            <div key={item.step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{item.step}</div>
              <div className={styles.iconBox}>{item.icon}</div>
              <h3 className={styles.stepTitle}>{item.title}</h3>
              <p className={styles.stepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
