import React from "react"
import PropTypes from "prop-types"
import { Box, Tabs, Tab } from "@mui/material"
import { BookOpen, ShoppingCart, Truck } from "lucide-react"
import styles from "./OrderTabViews.module.scss"

export default function OrderTabViews({ activeTab, onTabChange, catalogCount = 0 }) {
  return (
    <Box className={styles.tabsContainer}>
      <Tabs
        value={activeTab}
        onChange={(_, val) => onTabChange(val)}
        className={styles.tabs}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab
          value="catalog"
          icon={<BookOpen size={18} />}
          iconPosition="start"
          label={
            <Box className={styles.tabLabel}>
              <span>Danh mục nguyên liệu (Catalog)</span>
              <span className={styles.tabBadgeActive}>{catalogCount}</span>
            </Box>
          }
          className={styles.tabItem}
        />
        <Tab
          value="orders"
          icon={<ShoppingCart size={18} />}
          iconPosition="start"
          label={
            <Box className={styles.tabLabel}>
              <span>Đơn đặt hàng (Yêu cầu mua)</span>
            </Box>
          }
          className={styles.tabItem}
        />
        <Tab
          value="deliveries"
          icon={<Truck size={18} />}
          iconPosition="start"
          label={
            <Box className={styles.tabLabel}>
              <span>Phiếu giao nhận & Nhập hàng</span>
            </Box>
          }
          className={styles.tabItem}
        />
      </Tabs>
    </Box>
  )
}

OrderTabViews.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  catalogCount: PropTypes.number,
}
