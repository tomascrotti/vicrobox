/**
 * Centralized link-builder for service cards. Today every service
 * links to the quote form. The day `/servicios/[slug]` exists, change
 * ONLY this function — ServiceCard and the carousel never need to change.
 */
export function buildServiceHref(_slug: string): string {
  return '#cta'
}
