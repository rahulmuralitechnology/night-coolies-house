const rupee = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatRent = value => (value ? `₹${rupee.format(value)}` : '—');
export const formatKm = value => value.toFixed(1);
export const formatCount = value => rupee.format(value);

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}
