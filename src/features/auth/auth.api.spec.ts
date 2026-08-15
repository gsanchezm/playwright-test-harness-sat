import { test, expect } from '../../shared/fixtures'

test.describe('Auth API', () => {
  test('POST /api/auth/login returns a bearer token for standard_user @smoke', async ({ authService }) => {
    const response = await authService.login({ username: 'standard_user', password: 'pizza123' })

    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      access_token: expect.any(String),
      token_type: 'bearer',
      username: 'standard_user',
    })
  })

  test('POST /api/auth/login rejects invalid credentials with 401', async ({ authService }) => {
    const response = await authService.login({ username: 'standard_user', password: 'wrong-password' })

    expect(response.status()).toBe(401)
  })

  test('POST /api/auth/login blocks locked_out_user with 403', async ({ authService }) => {
    const response = await authService.login({ username: 'locked_out_user', password: 'pizza123' })

    expect(response.status()).toBe(403)
  })
})
