export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (seconds < 60) return "hace un momento";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} día${days !== 1 ? "s" : ""}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months !== 1 ? "es" : ""}`;

  const years = Math.floor(months / 12);
  return `hace ${years} año${years !== 1 ? "s" : ""}`;
}
