import React, { useContext } from "react"
import { Card, Tag, Typography, Breadcrumb, Empty, Space } from "antd"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"

const { Title, Text, Paragraph } = Typography

function ExamplePageStub({ title, description, allowedRoles = [] }) {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  return (
    <div style={{ padding: "8px 0" }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: user?.orgName || user?.orgType || "FoodPrint" },
          { title },
        ]}
      />

      <Card
        title={
          <Space orientation="vertical" size={2} style={{ display: "flex" }}>
            <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
              {title}
            </Title>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: "normal" }}>
              {description}
            </Text>
          </Space>
        }
        extra={
          <Tag color="green" style={{ fontSize: 13, padding: "4px 8px" }}>
            Đã xác thực quyền thành công
          </Tag>
        }
        style={{ borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <div style={{ marginBottom: 20, padding: 12, background: "#f8fafd", borderRadius: 6, border: "1px solid #e6f0ff" }}>
          <Space orientation="vertical" size={6} style={{ display: "flex" }}>
            <Text>
              👤 Người dùng hiện tại: <b>{user?.fullName}</b> (Tài khoản: <code>{user?.username}</code>)
            </Text>
            <Text>
              🏷️ Vai trò đang hoạt động: <Tag color="blue">{ROLE_LABELS[user?.role] || user?.role}</Tag>
            </Text>
            <Text>
              🔒 Các vai trò được phép truy cập màn hình này:{" "}
              {allowedRoles.map(role => (
                <Tag key={role} color={role === user?.role ? "cyan" : "default"}>
                  {ROLE_LABELS[role] || role}
                </Tag>
              ))}
            </Text>
          </Space>
        </div>

        <div style={{ padding: "40px 0" }}>
          <Empty
            description={
              <div style={{ marginTop: 12 }}>
                <Paragraph strong style={{ fontSize: 16, marginBottom: 4 }}>
                  Màn hình mẫu: {title}
                </Paragraph>
                <Text type="secondary">
                  Trang này đã được cấu hình route và phân quyền hoàn chỉnh. Sẵn sàng để xây dựng giao diện chi tiết.
                </Text>
              </div>
            }
          />
        </div>
      </Card>
    </div>
  )
}

export default ExamplePageStub
