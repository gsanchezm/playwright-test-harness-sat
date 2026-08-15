import dotenv from 'dotenv'
import path from 'node:path'

// Resuelve .env relativo a este archivo (no a process.cwd()), para que
// funcione sin importar desde qué directorio se invoque el test runner.
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = Object.freeze({
  baseUrl: requireEnv('BASE_URL'),
  apiUrl: requireEnv('API_URL'),
})
