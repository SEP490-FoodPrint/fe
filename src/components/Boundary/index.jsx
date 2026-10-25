import React, { Component } from "react"
import { Box, Typography, Button } from "@mui/material"
import errorImg from "src/assets/images/common-icon/errorPage.png"

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    console.log("error", error)
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.log("error ", error, "info ", info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          textAlign="center"
          p={3}
        >
          <img
            src={errorImg}
            alt="error"
            style={{ maxWidth: 400, width: "100%", marginBottom: 24 }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Có lỗi xảy ra!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Hệ thống xảy ra lỗi, vui lòng tải lại trang để tiếp tục sử dụng!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
