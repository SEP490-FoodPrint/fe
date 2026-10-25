import React, { useContext, useMemo } from "react"
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { useLocation, useNavigate, Outlet } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { hasPermission } from "src/lib/utils"
import { MenuItemSchool, MenuItemSupplier, MenuItemSystem } from "src/router/MenuItem"
import TopHeader from "./Header/components/TopHeader"
import RoleSwitcher from "src/components/Common/RoleSwitcher"

const MainLayout = ({ type }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  // Xác định danh sách menu thô dựa theo phân hệ
  const rawMenuItems = useMemo(() => {
    const org = type || user?.orgType
    switch (org) {
      case "SYSTEM":
        return MenuItemSystem()
      case "SUPPLIER":
        return MenuItemSupplier()
      case "SCHOOL":
      default:
        return MenuItemSchool()
    }
  }, [type, user?.orgType])

  // Lọc menu động dựa theo user.role hiện tại (hasPermission)
  const filteredMenuItems = useMemo(() => {
    if (!user?.role) return []

    const filterTree = (items) => {
      return items
        .filter((item) => hasPermission(item.roles, user.role))
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: filterTree(item.children),
            }
          }
          return item
        })
    }

    return filterTree(rawMenuItems)
  }, [rawMenuItems, user?.role])

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header cố định */}
      <TopHeader />

      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar Menu lọc theo Role */}
        <Box
          component="aside"
          sx={{
            width: 260,
            flexShrink: 0,
            bgcolor: "#ffffff",
            borderRight: "1px solid var(--border-default, #dce5e0)",
            overflowY: "auto",
            height: "calc(100vh - 64px)",
            position: "sticky",
            top: 64,
            left: 0,
            p: 1.5,
          }}
        >
          <List component="nav" disablePadding>
            {filteredMenuItems.map((item) => {
              const isSelected = location.pathname === item.key
              return (
                <ListItemButton
                  key={item.key}
                  selected={isSelected}
                  onClick={() => navigate(item.key)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1,
                    px: 1.5,
                    color: isSelected ? "primary.main" : "text.primary",
                    bgcolor: isSelected ? "var(--green-50, #e8f5f1) !important" : "transparent",
                    "&:hover": {
                      bgcolor: isSelected ? "var(--green-50, #e8f5f1)" : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {item.icon && (
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isSelected ? "primary.main" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              )
            })}
          </List>
        </Box>

        {/* Vùng nội dung màn hình */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            bgcolor: "var(--bg-page, #f8faf9)",
            minHeight: "calc(100vh - 64px)",
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Widget đổi role nhanh để test */}
      <RoleSwitcher />
    </Box>
  )
}

export default MainLayout
