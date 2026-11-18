export const apiMealTraceability = "/meal-traceability";

export const apiPublicSchoolClasses = (schoolCode) =>
  `/meal-traceability/public/schools/${encodeURIComponent(schoolCode)}/classes`;
