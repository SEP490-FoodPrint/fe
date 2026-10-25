import React from "react"
import { useTheme } from "@mui/material/styles"
import PropTypes from "prop-types"
import styled, { css } from "styled-components"
import listSVGIcon from "./icons"

const SvgIconStyle = styled.span`
  svg path {
    ${props =>
      props.$inputColor &&
      css`
        fill: ${props.$inputColor};
      `}
  }
`

export default function SvgIcon(props) {
  const theme = useTheme()
  const { name, className, antMode, ...rest } = props
  const iconElement = listSVGIcon[name]

  if (!iconElement) return null

  let fillColor = undefined
  if (antMode === "colorTextLightSolid") {
    fillColor = "#ffffff"
  } else if (antMode && theme?.palette?.[antMode]?.main) {
    fillColor = theme.palette[antMode].main
  }

  return (
    <SvgIconStyle
      $inputColor={fillColor}
      className={`d-flex align-item-center justify-content-center ${className}`}
      {...rest}
    >
      {iconElement}
    </SvgIconStyle>
  )
}

SvgIcon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  antMode: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
}

SvgIcon.defaultProps = {
  className: "",
  onClick: null,
  antMode: false,
}
