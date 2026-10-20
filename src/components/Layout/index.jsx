import React, { useContext, useMemo } from "react"
import { Layout, Menu } from "antd"
import { useLocation, useNavigate, Outlet } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { hasPermission } from "src/lib/utils"
import { MenuItemSchool, MenuItemSupplier, MenuItemSystem } from "src/router/MenuItem"
import TopHeader from "./Header/components/TopHeader"
import RoleSwitcher from "src/components/Common/RoleSwitcher"

const { Sider, Content } = Layout

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

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header cố định */}
      <TopHeader />

      <Layout>
        {/* Sidebar Menu lọc theo Role */}
        <Sider
          width={260}
          style={{
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
            overflow: "auto",
            height: "calc(100vh - 64px)",
            position: "sticky",
            top: 64,
            left: 0,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: "100%", borderRight: 0, paddingTop: 8 }}
            items={filteredMenuItems}
            onClick={handleMenuClick}
          />
        </Sider>

        {/* Vùng nội dung màn hình */}
        <Content style={{ padding: "20px 24px", background: "#f5f7fa", minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Widget đổi role nhanh để test */}
      <RoleSwitcher />
    </Layout>
  )
}

export default MainLayout
