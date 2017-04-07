/**
 * utils.js
 * Various utilities
 */

const LOGGING = true

export const log = (message: string) => {
  if (!LOGGING) return
  console.log(message)
}