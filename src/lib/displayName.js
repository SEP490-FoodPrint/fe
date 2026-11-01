// Seed markers identify fixtures in storage; business screens show the name.
export const displayName = value => typeof value === "string"
  ? value.replace(/^\s*\[TEST\]\s*/i, "")
  : value
