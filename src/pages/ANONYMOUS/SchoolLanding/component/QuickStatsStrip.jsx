import React from "react";
import { Eye, ShieldCheck, Utensils } from "lucide-react";
import styles from "./QuickStatsStrip.module.scss";

const HIGHLIGHT_ITEMS = [
  {
    id: "nutrition",
    icon: Utensils,
    title: "Bữa ăn an toàn",
    description:
      "Thiết kế khoa học, đạt chuẩn vệ sinh an toàn thực phẩm theo quy chuẩn của ngành giáo dục và y tế.",
  },
  {
    id: "transparency",
    icon: Eye,
    title: "Minh bạch công khai",
    description:
      "Cập nhật chi tiết các món ăn và nguồn gốc thực phẩm trước mỗi tuần học cho phụ huynh tiện tra cứu và theo dõi.",
  },
  {
    id: "monitoring",
    icon: ShieldCheck,
    title: "Giám sát định kỳ",
    description:
      "Phối hợp thường xuyên cùng Ban đại diện CMHS và Trạm Y tế phường trong mọi khâu tiếp phẩm và lưu mẫu thức ăn 24h.",
  },
];

function QuickStatsStrip() {
  return (
    <section className={styles.stripSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {HIGHLIGHT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.iconBox}>
                  <Icon size={24} />
                </div>
                <div className={styles.content}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default QuickStatsStrip;