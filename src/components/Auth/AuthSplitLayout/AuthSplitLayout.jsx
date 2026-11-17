import React from "react"
import { Link } from "react-router-dom"
import BrandLogo from "src/components/Common/BrandLogo"
import ROUTER from "src/router/ROUTER"
import showcaseImg from "src/assets/images/login-showcase.png"
import styles from "./AuthSplitLayout.module.scss"

export default function AuthSplitLayout({ children, cardMaxWidth = 480 }) {
  return (
    <div className={styles.splitPage}>
      {/* Ambient background decoration */}
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowBottom} aria-hidden="true" />

      {/* LEFT COLUMN: Showcase Image with Overlay Text */}
      <div className={styles.leftCol}>
        <img
          src={showcaseImg}
          alt="Suất ăn học đường an toàn - Hệ thống quản lý và truy xuất nguồn gốc FoodPrint"
          className={styles.bgShowcaseImg}
          loading="eager"
        />

        {/* Soft readable gradient scrim */}
        <div className={styles.leftColOverlay} aria-hidden="true" />

        {/* Text Content overlaid on top of image */}
        <div className={styles.leftColContent}>
          {/* Top: Brand Logo */}
          <div className={styles.logoWrapper}>
            <Link to={ROUTER.DEFAULT} className={styles.brandLink} title="FoodPrint - Trang chủ">
              <BrandLogo theme="light" />
            </Link>
          </div>

          {/* Center: Headline & Subtitle */}
          <div className={styles.heroCenter}>
            <h1 className={styles.heroTitle}>
              Suất ăn học đường<br />
              <span className={styles.highlightText}>
                an toàn
                <svg className={styles.brushCurve} viewBox="0 0 160 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9C45 3 115 2 157 7" stroke="var(--color-primary, #0A8066)" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>{" "}
              và minh bạch
            </h1>

            <p className={styles.heroDescription}>
              Hệ thống quản lí và Truy xuất nguồn gốc suất ăn học đường.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Balanced Centered Form Card Area */}
      <div className={styles.rightCol}>
        <div className={styles.cardContainer} style={{ maxWidth: cardMaxWidth }}>
          {children}
        </div>
      </div>
    </div>
  )
}
