// Intruders caught this session: the jar's label shows it, `kill intruder` adds one.

export function caught(add = 0) {
  let n = 1;
  try {
    n = Number(sessionStorage.getItem('intruders-caught') ?? '1') + add;
    sessionStorage.setItem('intruders-caught', String(n));
  } catch {
    n += add;
  }
  document.querySelectorAll('[data-jar-count]').forEach((el) => (el.textContent = String(n)));
  return n;
}
