export function getCurrentMonth(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function daysUntilMonthEnd(): number {
  const now = new Date()
  const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  return Math.max(0, last.getUTCDate() - now.getUTCDate())
}

export const COUNTRY_NAMES: Record<string, string> = {
  US: 'США',
  RU: 'Россия',
  DE: 'Германия',
  JP: 'Япония',
  BR: 'Бразилия',
  GB: 'Великобритания',
  FR: 'Франция',
  KR: 'Корея',
  IN: 'Индия',
  AU: 'Австралия',
  CA: 'Канада',
  IT: 'Италия',
  ES: 'Испания',
  NL: 'Нидерланды',
  SE: 'Швеция',
  PL: 'Польша',
  UA: 'Украина',
  TR: 'Турция',
  MX: 'Мексика',
  AR: 'Аргентина',
}

export const COUNTRY_CODES = Object.keys(COUNTRY_NAMES)

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code
}

export function getFlagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('')
}

export function enrichCountryRanking<T extends { country_code: string }>(
  row: T,
): T & { country_name: string } {
  return { ...row, country_name: getCountryName(row.country_code) }
}
