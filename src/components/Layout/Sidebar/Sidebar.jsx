import React, { useContext, useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Collapse, Drawer, IconButton, Tooltip, useMediaQuery } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { StoreContext } from "src/contexts"
import { ORG_LABELS } from "src/constants/roles"
import { hasPermission, getDefaultRedirectByUser, getDefaultRedirectByOrg } from "src/lib/utils"
import { MenuItemSchool, MenuItemSupplier, MenuItemSystem } from "src/router/MenuItem"
import ROUTER from "src/router/ROUTER"
import BrandLogo from "src/components/Common/BrandLogo"
import styles from "./Sidebar.module.scss"

function Sidebar({ type, iconOnly = false, mobile = false, open = false, onClose }) {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user
  const location = useLocation()
  const orgType = type || user?.orgType
  const portalLabel = ORG_LABELS[orgType] || "FoodPrint"
  const organizationLabel = orgType === "SCHOOL" && user?.orgName ? user.orgName : portalLabel
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const menuItems = useMemo(() => {
    const items = orgType === "SYSTEM" ? MenuItemSystem()
      : orgType === "SUPPLIER" ? MenuItemSupplier() : MenuItemSchool()
    if (!user?.role) return []
    return items.flatMap(item => {
      if (item.children) {
        const children = item.children.filter(child => hasPermission(child.roles, user.role))
        return children.length ? [{ ...item, children }] : []
      }
      return hasPermission(item.roles, user.role) ? [item] : []
    })
  }, [orgType, user?.role])
  const configurationItem = menuItems.find(item => item.key === "SCHOOL_CONFIGURATION")
  const configurationActive = Boolean(configurationItem?.children.some(item =>
    location.pathname === item.key || location.pathname.startsWith(`${item.key}/`),
  ))
  const [configurationOpen, setConfigurationOpen] = useState(configurationActive)

  useEffect(() => {
    if (configurationActive) setConfigurationOpen(true)
  }, [configurationActive])

  const renderLink = item => {
    const tooltipTitle = item.label + (item.badge ? ` (${item.badge})` : "")
    const link = (
      <NavLink
        key={item.key}
        to={item.key}
        end={
          item.end !== undefined
            ? item.end
            : (
                item.key === ROUTER.SCHOOL_KITCHEN_COOKING ||
                item.key === ROUTER.SCHOOL_HEALTH_OVERVIEW ||
                item.key === ROUTER.SCHOOL_OVERVIEW ||
                item.key === ROUTER.SUPPLIER_OVERVIEW ||
                item.key === ROUTER.SCHOOL_INGREDIENT_OVERVIEW
              )
        }
        onClick={mobile ? onClose : undefined}
        aria-label={tooltipTitle}
        className={({ isActive }) => [styles.navItem, item.nested && styles.nestedNavItem, isActive && styles.isActive].filter(Boolean).join(" ")}
      >
        <span className={styles.navIcon}>{item.icon}</span>
        {!iconOnly && <span className={styles.navLabel}>{item.label}</span>}
        {!iconOnly && item.badge && <span className={styles.navBadge}>{item.badge}</span>}
      </NavLink>
    )

    return iconOnly ? (
      <Tooltip key={item.key} title={tooltipTitle} placement="right" arrow>
        <span className={styles.tooltipLink}>{link}</span>
      </Tooltip>
    ) : link
  }

  const renderGroup = item => {
    const toggle = (
      <button
        type="button"
        aria-label={item.label}
        aria-expanded={configurationOpen}
        aria-controls="school-configuration-submenu"
        onClick={() => setConfigurationOpen(open => !open)}
        className={[styles.navItem, styles.navGroupToggle, configurationActive && styles.groupContainsActive].filter(Boolean).join(" ")}
      >
        <span className={styles.navIcon}>{item.icon}</span>
        {!iconOnly && <span className={styles.navLabel}>{item.label}</span>}
        {!iconOnly && (
          <KeyboardArrowDownIcon
            className={[styles.groupArrow, configurationOpen && styles.groupArrowOpen].filter(Boolean).join(" ")}
            aria-hidden="true"
          />
        )}
      </button>
    )

    return (
      <div className={styles.navGroup} key={item.key}>
        {iconOnly ? (
          <Tooltip title={item.label} placement="right" arrow>
            <span className={styles.tooltipLink}>{toggle}</span>
          </Tooltip>
        ) : toggle}
        <Collapse in={configurationOpen} timeout={reducedMotion ? 0 : "auto"}>
          <div id="school-configuration-submenu" className={styles.navChildren}>
            {item.children.map(child => renderLink({ ...child, nested: true }))}
          </div>
        </Collapse>
      </div>
    )
  }

  const content = (
    <aside className={[styles.sidebar, iconOnly && styles.iconOnly, mobile && styles.isMobile].filter(Boolean).join(" ")} aria-label={organizationLabel}>
      {mobile ? (
        <>
          <div className={styles.drawerHeading}>
            <span>FoodPrint</span>
            <IconButton onClick={onClose} aria-label="Đóng điều hướng" autoFocus><CloseIcon /></IconButton>
          </div>
          <p className={styles.portalLabel}>{organizationLabel}</p>
        </>
      ) : (
        <Link to={user ? getDefaultRedirectByUser(user) : getDefaultRedirectByOrg(orgType)} className={styles.brandLink} aria-label={"FoodPrint — " + organizationLabel}>
          <BrandLogo theme="light" variant="dashboard" iconOnly={iconOnly} subtitle={organizationLabel} />
        </Link>
      )}
      <nav className={styles.navList} aria-label="Menu chức năng">
        {menuItems.map(item => item.children ? renderGroup(item) : renderLink(item))}
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
