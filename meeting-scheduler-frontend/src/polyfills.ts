// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer'

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
  window.global = window.global || window
}

// Make Buffer available in global scope
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer
  globalThis.global = globalThis.global || globalThis
}

export { Buffer }

