import React from "react"
import { Tooltip, IconButton } from "@mui/material"
import PropTypes from "prop-types"
import SvgIcon from "src/components/SvgIcon"

export default function ButtonCircle(props) {
  const { children, style, iconName, ...rest } = props

  return (
    <Tooltip title={children || ""}>
      <IconButton
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          "&:hover": { backgroundColor: "#f5f5f5" },
          ...style,
        }}
        {...rest}
      >
        <SvgIcon name={iconName} />
      </IconButton>
    </Tooltip>
  )
}

ButtonCircle.propTypes = {
  iconName: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
}

ButtonCircle.defaultProps = {
  iconName: "",
  style: {},
}
