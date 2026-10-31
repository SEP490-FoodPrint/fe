import React from "react"
import { Link } from "react-router-dom"
import BrandLogo from "src/components/Common/BrandLogo"
import ROUTER from "src/router/ROUTER"
import styles from "./AuthHeader.module.scss"

export default function AuthHeader() {
  return <Link to={ROUTER.DEFAULT} className={styles.brand} aria-label="FoodPrint · Về trang chủ">
    <BrandLogo variant="auth" subtitle="An toàn từ nguồn · An tâm từng bữa" />
  </Link>
}
