import { test, expect } from '../../shared/fixtures'

test.describe('Catalog API', () => {
  test('GET /api/pizzas returns the catalog for a valid bearer token @smoke', async ({ authService, catalogService }) => {
    const login = await authService.login({ username: 'standard_user', password: 'pizza123' })
    const { access_token: token } = await login.json()

    const response = await catalogService.getPizzas(token, 'US')

    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.pizzas.length).toBeGreaterThan(0)
    expect(body.pizzas[0]).toMatchObject({
      id: expect.anything(),
      name: expect.any(String),
      price: expect.any(Number),
    })
  })

  test('GET /api/pizzas without X-Country-Code returns 400', async ({ authService, catalogService }) => {
    const login = await authService.login({ username: 'standard_user', password: 'pizza123' })
    const { access_token: token } = await login.json()

    const response = await catalogService.getPizzas(token, null)

    expect(response.status()).toBe(400)
  })

  test('GET /api/pizzas without a bearer token returns 403', async ({ catalogService }) => {
    const response = await catalogService.getPizzas(null, 'US')

    expect(response.status()).toBe(403)
  })
})
