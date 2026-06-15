import numericMap from './iso3166-numeric.json'

/** GeoJSON features without numeric ISO id (disputed / de facto regions). */
const GEO_NAME_TO_ALPHA2: Record<string, string> = {
  Kosovo: 'XK',
  Somaliland: 'XS',
  'N. Cyprus': 'XC',
}

export function numericToAlpha2(numericId: string | number | undefined): string | null {
  if (numericId == null || numericId === '') return null
  const key = String(numericId).padStart(3, '0')
  return (numericMap as Record<string, string>)[key] ?? null
}

export function resolveCountryCode(geo: {
  id?: string
  properties?: { name?: string; iso_a2?: string }
}): string | null {
  if (geo.properties?.iso_a2 && geo.properties.iso_a2 !== '-99') {
    return geo.properties.iso_a2.toUpperCase()
  }

  const fromNumeric = numericToAlpha2(geo.id)
  if (fromNumeric) return fromNumeric

  const name = geo.properties?.name
  if (name && GEO_NAME_TO_ALPHA2[name]) return GEO_NAME_TO_ALPHA2[name]

  return null
}
