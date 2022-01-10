export function time() {
  const t = process.hrtime()
  return Math.floor(t[0] * 1000 + t[1] / 1000000)
}
