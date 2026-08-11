export function formatCategory(category) {
  if (!category) return "Unknown";
  return category.replace(/_/g, " ");
}

export function formatStatus(status) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ");
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function groupAndCount(items, key) {
  const counts = {};
  items.forEach((item) => {
    const val = item[key] || "unknown";
    counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({
    name: name.replace(/_/g, " "),
    count,
  }));
}
