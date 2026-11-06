import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./RegisterCta.module.scss"
export default function RegisterCta() {
  return <section id="register" className={styles.section}><div className={styles.container}>
    <div><h2>Đồng hành cùng FoodPrint.</h2><p>Đăng ký tham gia để quản lý thực đơn, kiểm thực nguyên liệu và chia sẻ thông tin bữa ăn học đường.</p></div>
    <div className={styles.links}><Link to={`${ROUTER.REGISTER}?type=SCHOOL`}>Đăng ký trường học <ArrowRight size={20} /></Link><Link to={`${ROUTER.REGISTER}?type=SUPPLIER`}>Đăng ký nhà cung cấp <ArrowRight size={20} /></Link></div>
  </div></section>
}
