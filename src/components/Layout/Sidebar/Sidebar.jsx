import React, { useContext, useMemo } from "react"
import PropTypes from "prop-types"
import { Link, NavLink } from "react-router-dom"
import { Drawer, IconButton, Tooltip, useMediaQuery } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { StoreContext } from "src/contexts"
import { ORG_LABELS } from "src/constants/roles"
import { hasPermission, getDefaultRedirectByOrg } from "src/lib/utils"
import { MenuItemSchool, MenuItemSupplier, MenuItemSystem } from "src/router/MenuItem"
import BrandLogo from "src/components/Common/BrandLogo"
import styles from "./Sidebar.module.scss"

function Sidebar({ type, iconOnly = false, mobile = false, open = false, onClose }) {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user
  const orgType = type || user?.orgType
  const portalLabel = ORG_LABELS[orgType] || "FoodPrint"
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const menuItems = useMemo(() => {
    const items = orgType === "SYSTEM" ? MenuItemSystem()
      : orgType === "SUPPLIER" ? MenuItemSupplier() : MenuItemSchool()
    return user?.role ? items.filter(item => hasPermission(item.roles, user.role)) : []
  }, [orgType, user?.role])

  const content = (
    <aside className={[styles.sidebar, iconOnly && styles.iconOnly, mobile && styles.isMobile].filter(Boolean).join(" ")} aria-label={portalLabel}>
      {mobile ? <>
        <div className={styles.drawerHeading}>
          <span>FoodPrint</span>
          <IconButton onClick={onClose} aria-label="Đóng điều hướng" autoFocus><CloseIcon /></IconButton>
        </div>
        <p className={styles.portalLabel}>{portalLabel}</p>
      </> : <Link to={getDefaultRedirectByOrg(orgType)} className={styles.brandLink} aria-label={"FoodPrint — " + portalLabel}>
        <BrandLogo theme="light" variant="dashboard" iconOnly={iconOnly} subtitle={portalLabel} />
      </Link>}
      <nav className={styles.navList} aria-label="Menu chức năng">
        {menuItems.map(item => {
          const link = (
            <NavLink
              key={item.key}
              to={item.key}
              onClick={mobile ? onClose : undefined}
              aria-label={item.label}
              className={({ isActive }) => [styles.navItem, isActive && styles.isActive].filter(Boolean).join(" ")}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!iconOnly && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          )
          return iconOnly ? <Tooltip key={item.key} title={item.label} placement="right" arrow><span className={styles.tooltipLink}>{link}</span></Tooltip> : link
        })}
      </nav>
    </aside>
  )

  if (mobile) return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      transitionDuration={reducedMotion ? 0 : undefined}
      className={styles.drawer}
      slotProps={{
        paper: { id: "dashboard-mobile-navigation", role: "dialog", "aria-modal": true, "aria-label": "Điều hướng chính" },
        backdrop: { className: styles.backdrop },
      }}
    >
      {content}
    </Drawer>
  )
  return content
}

Sidebar.propTypes = {
  type: PropTypes.string,
  iconOnly: PropTypes.bool,
  mobile: PropTypes.bool,
  open: PropTypes.bool,
  onClose: PropTypes.func,
}

export default Sidebar
