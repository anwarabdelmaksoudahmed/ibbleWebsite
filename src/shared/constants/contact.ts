/** Public company contact details shown on `/contact`. */
export const CONTACT_INFO = {
  email: 'info@ibbil.com',
  /** Display + dial format (E.164). */
  phone: '+966115138351',
  /** Google Maps query for the office location (lazy iframe embed). */
  mapQuery: 'Riyadh, Al Sulaymaniyah, Engineer Musaed Al-Anqari Street',
} as const

export const CONTACT_MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(CONTACT_INFO.mapQuery)}&z=16&output=embed`

export const CONTACT_MAP_EXTERNAL_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.mapQuery)}`
