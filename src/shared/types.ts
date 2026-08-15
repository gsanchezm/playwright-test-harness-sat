// Tipos genéricos reutilizables entre features.
// Se amplía a medida que se descubren entidades reales en TEST_PLAN.md.

export interface ApiErrorResponse {
  status: number
  message: string
}

export interface AuthPersonaCase {
  persona: string
  outcome: 'success' | 'blocked'
  errorMessage?: string
}
