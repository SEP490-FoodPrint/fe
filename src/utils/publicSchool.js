export function getPublicSchoolItems(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
}

export function filterPublicSchools(schools, searchQuery) {
  if (!Array.isArray(schools)) return [];

  const query = searchQuery.trim().toLowerCase();
  if (!query) return schools;

  return schools.filter(
    school =>
      school.name?.toLowerCase().includes(query) ||
      school.address?.toLowerCase().includes(query) ||
      school.district?.toLowerCase().includes(query) ||
      school.code?.toLowerCase().includes(query),
  );
}
