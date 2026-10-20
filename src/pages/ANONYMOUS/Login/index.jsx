import React, { useContext, useState } from "react"
import { Button, Card, Col, Divider, Form, Input, Row, Typography, message, Tag, Space, Alert } from "antd"
import { LockOutlined, UserOutlined, ArrowRightOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { MOCK_ACCOUNTS, ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import { getDefaultRedirectByOrg } from "src/lib/utils"

const { Title, Text, Paragraph } = Typography

function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { loginStore, userStore, routerBeforeStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const setUser = userStore?.setUser
  const routerBeforeLogin = routerBeforeStore?.routerBeforeLogin
  const setRouterBeforeLogin = routerBeforeStore?.setRouterBeforeLogin

  // Xử lý sau khi đăng nhập thành công
  const handleLoginSuccess = (user) => {
    setIsLoginContext(true)
    setUser(user)
    message.success(`Đăng nhập thành công với vai trò: ${ROLE_LABELS[user.role] || user.role}`)

    // Chuyển hướng
    const targetUrl = routerBeforeLogin || getDefaultRedirectByOrg(user.orgType)
    if (setRouterBeforeLogin) setRouterBeforeLogin("")
    navigate(targetUrl, { replace: true })
  }

  // Đăng nhập qua Form
  const onFinish = async (values) => {
    try {
      setLoading(true)
      const res = await AuthService.login(values)
      if (res?.isOk) {
        handleLoginSuccess(res.Object.User)
      } else {
        message.error(res?.message || "Đăng nhập thất bại")
      }
    } finally {
      setLoading(false)
    }
  }

  // Đăng nhập nhanh 1 chạm bằng mock role
  const handleQuickLogin = (roleCode) => {
    const { user } = AuthService.mockLoginByRole(roleCode)
    handleLoginSuccess(user)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Title level={2} style={{ color: "#1677ff", marginBottom: 8 }}>
            🥗 FOODPRINT - NỀN TẢNG QUẢN LÝ SUẤT ĂN HỌC ĐƯỜNG
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Hệ thống Quản lý và Truy xuất Nguồn gốc Bữa ăn An toàn & Dinh dưỡng
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Cột trái: Form đăng nhập chuẩn */}
          <Col xs={24} md={10}>
            <Card title="Đăng nhập tài khoản" style={{ borderRadius: 8, height: "100%" }}>
              <Alert
                description="Bạn có thể đăng nhập bằng tài khoản thật hoặc click chọn nhanh 1 trong 9 vai trò ở khung bên phải để test quyền."
                type="info"
                showIcon
                style={{ marginBottom: 20 }}
              />

              <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Ví dụ: school_teacher" size="large" />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu bất kỳ" size="large" />
                </Form.Item>

                <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ marginTop: 8 }}>
                  Đăng nhập
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Cột phải: Bộ test nhanh 9 Roles */}
          <Col xs={24} md={14}>
            <Card
              title={
                <Space>
                  <span>⚡ Đăng nhập Nhanh để Test Phân Quyền</span>
                  <Tag color="orange">1 Account = 1 Role</Tag>
                </Space>
              }
              style={{ borderRadius: 8 }}
            >
              <Paragraph type="secondary">
                Click vào bất kỳ tài khoản nào bên dưới để hệ thống tự động gán <code>user.role</code> và chuyển hướng vào Portal tương ứng:
              </Paragraph>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MOCK_ACCOUNTS.map((acc) => {
                  let tagColor = "blue"
                  if (acc.orgType === "SYSTEM") tagColor = "purple"
                  if (acc.orgType === "SUPPLIER") tagColor = "green"

                  return (
                    <Card
                      key={acc.userId}
                      size="small"
                      hoverable
                      onClick={() => handleQuickLogin(acc.role)}
                      style={{ cursor: "pointer", borderLeft: `4px solid ${acc.orgType === "SYSTEM" ? "#722ed1" : acc.orgType === "SUPPLIER" ? "#52c41a" : "#1677ff"}` }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Space>
                            <Tag color={tagColor}>{acc.orgType}</Tag>
                            <b>{acc.fullName}</b>
                          </Space>
                          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                            Vai trò: <span style={{ color: "#1677ff", fontWeight: 500 }}>{ROLE_LABELS[acc.role]}</span>
                          </div>
                        </Col>
                        <Col>
                          <Button size="small" type="link" icon={<ArrowRightOutlined />}>
                            Vào thử
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  )
                })}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default LoginPage
