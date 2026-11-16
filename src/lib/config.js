export const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK === "true" ||
  import.meta.env.VITE_USE_MOCKDATA === "true" ||
  import.meta.env.USE_MOCKDATA === "true";
