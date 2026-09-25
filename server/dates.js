// All "which day is it" questions are answered by the server's local clock,
// so a laptop and an iPad on the same wifi always agree.
// Set FAKE_TODAY=2026-10-01 in .env to try out other days.

export function today() {
  if (process.env.FAKE_TODAY) return process.env.FAKE_TODAY;
  return toDateString(new Date());
}

export function toDateString(d) {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(dateString, n) {
  const [y, m, d] = dateString.split("-").map(Number);
  return toDateString(new Date(y, m - 1, d + n));
}

// Monday of the week containing dateString (weeks run Monday to Sunday).
export function weekStart(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay(); // 0 = Sunday
  return addDays(dateString, day === 0 ? -6 : 1 - day);
}

export const weekDates = start => Array.from({ length: 7 }, (_, i) => addDays(start, i));

// Count consecutive days ending today (or yesterday, if today isn't done yet)
// for which isDone(date) is true. Days before resetDate never count.
export function dayStreak(isDone, resetDate = null) {
  let day = today();
  if (!isDone(day)) day = addDays(day, -1);
  let streak = 0;
  while (isDone(day) && (!resetDate || day >= resetDate)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}
