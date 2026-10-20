import React, { useContext } from "react"
import { Avatar, Button, Dropdown, Space, Tag, Typography } from "antd"
import { LogoutOutlined, UserOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"

const { Text } = Typography

function TopHeader() {
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const user = userStore?.user
  const setUser = userStore?.setUser

  const handleLogout = () => {
    AuthService.logout()
    if (setIsLoginContext) setIsLoginContext(false)
    if (setUser) setUser(null)
    navigate(ROUTER.LOGIN, { replace: true })
  }

  const userMenuItems = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <div><b>{user?.fullName}</b></div>
          <div style={{ fontSize: 12, color: "#888" }}>{user?.orgName}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ]

  let orgColor = "blue"
  if (user?.orgType === "SYSTEM") orgColor = "purple"
  if (user?.orgType === "SUPPLIER") orgColor = "green"

  return (
    <header
      style={{
        height: 64,
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: "bold", color: "#1677ff", cursor: "pointer" }} onClick={() => navigate(ROUTER.DEFAULT)}>
          🥗 FoodPrint
        </div>
        {user?.orgName && (
          <Tag color={orgColor} style={{ fontSize: 13, padding: "2px 10px", borderRadius: 12 }}>
            {user.orgName}
          </Tag>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {user && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: "pointer" }}>
              <Avatar src={user.avatar} icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.2" }}>
                <Text strong style={{ fontSize: 14 }}>{user.fullName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {ROLE_LABELS[user.role]?.split("(")[0]?.trim() || user.role}
                </Text>
              </div>
            </Space>
          </Dropdown>
        )}

        <Button icon={<LogoutOutlined />} type="text" onClick={handleLogout} title="Đăng xuất">
          Thoát
        </Button>
      </div>
    </header>
  )
}

export default TopHeader
