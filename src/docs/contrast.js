export function resolveRgb(value) {
  const el = document.createElement('span')
  el.style.color = value
  el.style.display = 'none'
  document.body.appendChild(el)
  const computed = getComputedStyle(el).color
  el.remove()
  const m = computed.match(/[\d.]+/g)
  return m ? m.slice(0, 3).map(Number) : [0, 0, 0]
}

export function toHex([r, g, b]) {
  return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
}

function channel(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

export function grade(ratio, large = false) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (large && ratio >= 3) return 'AA grande'
  return 'No pasa'
}
