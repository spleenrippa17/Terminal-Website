export function getStardate(date: Date = new Date()): string {
  const futureDate = new Date(date);
  futureDate.setFullYear(date.getFullYear() + 277);
  const month = String(futureDate.getMonth() + 1).padStart(2, "0");
  const day = String(futureDate.getDate()).padStart(2, "0");
  return `${futureDate.getFullYear()}.${month}.${day}`;
}
