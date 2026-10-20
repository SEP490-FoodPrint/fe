import React, { useContext, useState } from "react"
import { Button, Drawer, Tag, Space, Card, Typography, Tooltip } from "antd"
import { SwapOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { MOCK_ACCOUNTS, ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import { getDefaultRedirectByOrg } from "src/lib/utils"

const { Text } = Typography

function RoleSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  const isLoginContext = loginStore?.isLoginContext
  const setIsLoginContext = loginStore?.setIsLoginContext
  const user = userStore?.user
  const setUser = userStore?.setUser

  if (!isLoginContext) return null

  const handleSwitch = (roleCode) => {
    const { user: newUser } = AuthService.mockLoginByRole(roleCode)
    setIsLoginContext(true)
    setUser(newUser)
    setOpen(false)
    // Chuyển hướng về trang chủ của portal tương ứng
    navigate(getDefaultRedirectByOrg(newUser.orgType))
  }

  return (
    <>
      <Tooltip title="Đổi vai trò nhanh (Test phân quyền)">
        <Button
          type="primary"
          shape="round"
          icon={<SwapOutlined />}
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(22, 119, 255, 0.4)",
            height: 42,
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          Đổi Vai Trò ({ROLE_LABELS[user?.role]?.split("(")[0]?.trim() || user?.role})
        </Button>
      </Tooltip>

      <Drawer
        title="⚡ Chuyển Đổi Nhanh Giữa 9 Vai Trò"
        placement="right"
        width={380}
        onClose={() => setOpen(false)}
        open={open}
      >
        <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
          Chọn một vai trò bất kỳ để chuyển đổi tức thì. Menu Sidebar và quyền truy cập sẽ tự động thay đổi theo:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_ACCOUNTS.map((acc) => {
            const isCurrent = acc.role === user?.role
            return (
              <Card
                key={acc.userId}
                size="small"
                hoverable
                onClick={() => handleSwitch(acc.role)}
                style={{
                  cursor: "pointer",
                  borderColor: isCurrent ? "#1677ff" : "#f0f0f0",
                  background: isCurrent ? "#e6f4ff" : "#fff",
                }}
              >
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text strong>{acc.fullName}</Text>
                  {isCurrent && <Tag color="blue">Đang chọn</Tag>}
                </Space>
                <div style={{ marginTop: 4 }}>
                  <Tag color={acc.orgType === "SYSTEM" ? "purple" : acc.orgType === "SUPPLIER" ? "green" : "blue"}>
                    {acc.orgType}
                  </Tag>
                  <span style={{ fontSize: 13, color: "#555" }}>{ROLE_LABELS[acc.role]}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </Drawer>
    </>
  )
}

export default RoleSwitcher
