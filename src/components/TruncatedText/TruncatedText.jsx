import React, { useRef, useState } from "react"
import PropTypes from "prop-types"
import { Tooltip } from "@mui/material"

const baseStyle = {
  display: "block",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}

/**
 * Hiển thị một dòng, cắt bằng "…" khi quá dài; rê chuột hoặc focus mới hiện đầy đủ
 * (tooltip chỉ mở khi chữ thực sự bị cắt).
 */
export default function TruncatedText({
  children,
  title,
  component: Component = "span",
  className,
  style,
  ...rest
}) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const full =
    title ??
    (typeof children === "string" || typeof children === "number"
      ? String(children)
      : null)

  const show = () => {
    const el = ref.current
    if (el && el.scrollWidth > el.clientWidth + 1) setOpen(true)
  }

  return (
    <Tooltip
      title={full ?? children}
      open={open}
      onClose={() => setOpen(false)}
      disableHoverListener
      disableFocusListener
      disableTouchListener
      placement="top-start"
    >
      <Component
        ref={ref}
        className={className}
        style={{ ...baseStyle, ...style }}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        {...rest}
      >
        {children}
      </Component>
    </Tooltip>
  )
}

TruncatedText.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  component: PropTypes.elementType,
  className: PropTypes.string,
  style: PropTypes.object,
}
