import React from "react"
import { CalendarCheck, Handshake, ShieldCheck } from "lucide-react"
import styles from "./AboutFeatures.module.scss"

function AboutFeatures() {
  const features = [
    {
      icon: <CalendarCheck size={28} />,
      iconClass: styles.iconGreen,
      title: "Thực đơn rõ ràng",
      desc: "Theo dõi thực đơn bán trú theo ngày và tuần, giúp thông tin bữa ăn được tổ chức khoa học, dễ dàng cho phụ huynh và học sinh tra cứu.",
    },
    {
      icon: <ShieldCheck size={28} />,
      iconClass: styles.iconTeal,
      title: "Thông tin nguồn gốc",
      desc: "Hỗ trợ truy xuất nguồn gốc từng lô nguyên liệu thực phẩm, kiểm soát nghiêm ngặt các chứng nhận an toàn từ nhà cung cấp uy tín.",
    },
    {
      icon: <Handshake size={28} />,
      iconClass: styles.iconAmber,
      title: "Kết nối các bên",
      desc: "Tạo cầu nối chặt chẽ giữa Ban Giám hiệu, Cán bộ Y tế, Bếp trưởng, Giáo viên chủ nhiệm và Ban Phụ huynh trong giám sát bữa ăn.",
    },
  ]

  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerArea}>
          <span className={styles.sectionBadge}>Giá trị cốt lõi</span>
          <h2 className={styles.sectionTitle}>FoodPrint mang đến điều gì?</h2>
          <p className={styles.sectionSubtitle}>
            Một nền tảng toàn diện giúp kết nối dữ liệu thực đơn, nguyên liệu sạch
            và quy trình kiểm thực 3 bước, hướng tới sự minh bạch và an toàn tuyệt
            đối trong môi trường học đường.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((item, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={`${styles.iconBox} ${item.iconClass}`}>
                {item.icon}
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutFeatures
