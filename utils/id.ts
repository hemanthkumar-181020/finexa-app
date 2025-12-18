export function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}
