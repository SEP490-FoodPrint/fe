import React from "react"
import { Button } from "@mui/material"
import PropTypes from "prop-types"
import SvgIcon from "src/components/SvgIcon"

const ButtonCustom = ({
  children,
  iconName,
  antMode = true,
  variant = "contained",
  color = "primary",
  sx,
  ...rest
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      sx={{ textTransform: "none", ...sx }}
      {...rest}
    >
      <div className="d-flex-center">
        {iconName && (
          <SvgIcon
            antMode={!antMode ? "" : "colorTextLightSolid"}
            name={iconName}
            className="mr-8"
          />
        )}
        <span>{children}</span>
      </div>
    </Button>
  )
}

ButtonCustom.propTypes = {
  iconName: PropTypes.string,
  children: PropTypes.node,
}

ButtonCustom.defaultProps = {
  iconName: "",
}

export default ButtonCustom
