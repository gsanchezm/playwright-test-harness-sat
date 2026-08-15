# TEST_PLAN.md

## 1. Scope

- UI URL: https://omnipizza-frontend.onrender.com/
- API URL: https://omnipizza-backend.onrender.com
- Domain summary: OmniPizza is a pizza ordering platform ("QA Platform API" per its own root response). Flow: login -> browse/customize pizza catalog -> cart -> checkout (multi-market: address, contact, payment, tip) -> order history. It exposes a deliberate test-persona system (standard/locked/problem/glitch/error/a11y/security users) and multi-country pricing (MX, US, CH, JP, SA), making it purpose-built as an E2E/QA target.

## 2. Discovered UI map

| Route | Purpose | Stable roles/labels/testids | Notes |
|---|---|---|---|
| `/` (login) | Sign in with username/password or "Quick Login" persona buttons | textbox placeholder `standard_user`, textbox placeholder `••••••••`, button "Show password", button "Sign In", buttons "standard_user"/"locked_out_user"/"problem_user"/"performance_glitch_user"/"error_user"/"a11y_glitch_user"/"security_glitch_user", country flag buttons "Select US/MX/CH/JP/SA" | No `data-testid` observed; relies on accessible name/placeholder. Sign-in for `standard_user` took ~8s in manual testing (cold start or simulated latency) before redirecting to `/catalog` |
| `/catalog` | Browse pizza catalog, filter by category, search, customize + add to cart | link "Catalog"/"Checkout"/"Profile", button "Logout", textbox placeholder "Search your favorite pizza...", buttons "All Pizza"/"Popular"/"Veggie Delight"/"Meat Lovers"/"Sides & Drinks", button `Add to cart: <PizzaName>` per card, "Customize Pizza" modal (button "Close", size buttons "Small"/"Medium (+$3.00)"/"Large (+$4.00)"/"Family (+$5.00)", topping toggle buttons, button "Add to Cart"), sidebar "Your Order" cart summary (qty +/- controls, Subtotal/Delivery Fee/Total, button "Checkout Now") | RISK: in manual exploration, opening the customize modal for "Four Cheese" and clicking "Add to Cart" added "Margherita" to the cart instead — possible stale-selection bug worth a dedicated regression case. Some topping thumbnails ("Shredded chicken", "Sardines") rendered as broken images (100x100 placeholder) |
| `/checkout` | Delivery address, contact info, payment method, tip, place order | headings "1 DELIVERY ADDRESS"/"2 CONTACT INFO"/"3 PAYMENT METHOD", textboxes "Street & House Number", "Zip Code", "Full Name", "Phone", radio "Credit Card"/"Cash"/"PayPal", card sub-fields "Cardholder Name"/"Card Number"/"Expiry (MM/YY)"/"CVV" (Credit Card only), tip buttons "0%"/"5%"/"10%"/"15%", order summary (Subtotal/Tax/Delivery Fee/Tip/Total), button "Place Order" | Required fields differ per market per API evidence (see API map). Fields pre-filled with sample data on load — unclear if real default or stale demo state; treat as unknown until confirmed |
| `/profile` | View/edit personal info, delete account | heading "Personal Information", textboxes "Full Name"/"Phone"/"Address"/"Birthday" (date), textarea "Delivery Notes", button "Save Changes", button "Cancel", link/button "Delete Account" | Profile header shows a static-looking name/avatar ("Alexander Sterling", "Premium Member", "Joined March 2023") distinct from the logged-in `standard_user` — unconfirmed whether this is seeded demo data or a bug |
| Shared nav | Top bar present on all authenticated routes | `MenuPage`: links "Catalog"/"Checkout"/"Profile", cart-count badge on "Checkout", button "Logout", account label showing current username | Confirmed shared component -> `MenuPage` needed |

## 3. Discovered API map

Base: `https://omnipizza-backend.onrender.com`. Source for all rows below: `GET /api/openapi.json` (confirmed) plus live probes (confirmed) noted per row.

| Endpoint | Method | Auth | Expected status/body (confirmed or inferred) | Evidence |
|---|---|---|---|---|
| `/` | GET | none | 200 `{"message":"OmniPizza QA Platform API","version":"1.0.0","docs":"/api/docs","health":"/health"}` | probe |
| `/health` | GET | none | 200 `{"status":"healthy","timestamp":...,"environment":"production"}` | probe |
| `/api/docs`, `/api/openapi.json`, `/api/redoc` | GET | none | 200, OpenAPI/Swagger UI + schema | probe |
| `/api/auth/login` | POST | none | Body `{username, password}`. 200 `{access_token, token_type, username, behavior}` for `standard_user`/`pizza123`. 401 invalid creds, 403 locked out, 422 validation. Documented test users: `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `a11y_glitch_user`, `security_glitch_user` (all password `pizza123`) | openapi + probe (login confirmed 200 with JWT) |
| `/api/auth/users` | GET | inference (likely bearer) | not probed | openapi only |
| `/api/auth/profile` | GET | bearer | not probed | openapi only |
| `/api/users/me/profile` | GET, PATCH | bearer | not probed | openapi only |
| `/api/countries` | GET | none | 200, array of `{code, currency, currency_symbol, required_fields, optional_fields, tip_field, tip_mode, tip_percentages, tax_rate, delivery_fee, languages, decimal_places}` for MX/US/CH/JP/SA | probe (confirmed full body) |
| `/api/pizzas` | GET | bearer required; header `X-Country-Code` (required, else 400) + optional `X-Language` | 200 `{"pizzas":[{id, name, description, price, base_price, currency, currency_symbol, image, category}, ...]}`; 401 missing/invalid bearer; 400 missing/invalid X-Country-Code | probe (confirmed 200 with `US` header + token), openapi for error cases |
| `/api/store/market` | POST | bearer (inference) | sets session market | openapi only |
| `/api/cart` | POST | bearer | seed/replace session cart (test setup helper), per-login-session via JWT `sid` claim, not per-username/market | openapi only |
| `/api/cart` | GET | bearer; header `X-Country-Code` required | 200 `CartResponse`; 400 missing/invalid country header; 401 missing/invalid bearer | openapi only |
| `/api/cart/items/{item_id}` | PUT, DELETE | bearer (inference) | update/remove single cart line | openapi only |
| `/api/session` | GET | bearer | 200 `TestSessionStateResponse`; 401 | openapi only |
| `/api/session/reset` | POST | bearer (inference) | reset test session state | openapi only |
| `/api/checkout` | POST | bearer | 200 `OrderSummary`; 400 missing market-required field (MX: `colonia`, US: `zip_code` 5-digit, CH: `plz`, JP: `prefectura`, SA: `district`); tip fields per market (`propina`/`tip`/`trinkgeld`/`chip`/`baksheesh`); 401; 500 "random chaos error (error_user/security_glitch_user)"; 422 | openapi (detailed description) |
| `/api/orders` | GET | bearer | 200 order history (schema untyped `{}` in spec); 401 | openapi only |
| `/api/orders/{order_id}` | GET, PATCH | bearer (inference) | single order fetch/update | openapi only |
| `/api/debug/latency-spike`, `/api/debug/cpu-load`, `/api/debug/metrics`, `/api/debug/info` | GET | inference | test/chaos-injection utility endpoints, not app-facing features | openapi only, out of scope for functional coverage |

## 4. Proposed slices

| Slice folder | Class prefix | Reason | Expected files later | UI/API/Both |
|---|---|---|---|---|
| `auth` | `Auth` | Login is the sole entry point; multiple documented personas drive both happy-path and negative flows | `auth.page.ts`, `auth.service.ts`, `auth.flow.ts`, `auth.spec.ts`, `auth.api.spec.ts`, `src/shared/data/auth.json` | Both |
| `catalog` | `Catalog` | Primary browse/search/customize/add-to-cart journey, confirmed via UI and `/api/pizzas` | `catalog.page.ts`, `catalog.service.ts`, `catalog.flow.ts`, `catalog.factory.ts` (pizza customization builder), `catalog.spec.ts`, `catalog.api.spec.ts`, `src/shared/data/catalog.json` | Both |
| `cart` | `Cart` | Cart is a distinct, addressable resource (`/api/cart`, `/api/cart/items/{id}`) with its own UI panel and update/remove actions | `cart.page.ts`, `cart.service.ts`, `cart.flow.ts`, `cart.spec.ts`, `cart.api.spec.ts` | Both |
| `checkout` | `Checkout` | Multi-step, multi-market form with confirmed per-country required fields and confirmed `/api/checkout` contract | `checkout.page.ts`, `checkout.service.ts`, `checkout.flow.ts`, `checkout.spec.ts`, `checkout.api.spec.ts`, `src/shared/data/checkout.json` (per-market required-field matrix) | Both |
| `orders` | `Orders` | Order history/detail confirmed in API map; UI surface not yet located (no visible "Orders" nav link) | `orders.service.ts`, `orders.api.spec.ts` | API only until a UI entry point is confirmed |
| `profile` | `Profile` | Discovered profile UI (personal info form, delete account); `/api/users/me/profile` GET/PATCH confirmed in spec | `profile.page.ts`, `profile.service.ts`, `profile.flow.ts`, `profile.spec.ts`, `profile.api.spec.ts` | Both |

Shared: `src/shared/MenuPage.ts` for the top nav (Catalog/Checkout/Profile/Logout), used by every slice's flow.

## 5. Test matrix

| ID | Layer | Slice | Priority | Scenario | Preconditions | Expected result | Data-driven | Files expected later | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| T01 | ui | auth | smoke | Standard user logs in via form and lands on catalog | none | Redirect to `/catalog`, nav shows username | no | `auth.page.ts`, `auth.flow.ts`, `auth.spec.ts` | UI probe |
| T02 | ui | auth | smoke | Quick-login persona buttons authenticate correctly | none | Each persona reaches `/catalog` (or documented failure) | yes (`auth.json`: persona x expected outcome) | same as T01 | UI probe |
| T03 | ui | auth | regression | `locked_out_user` is blocked with a visible error | none | Login blocked, error message shown | no | `auth.spec.ts` | inference from API 403 description |
| T04 | api | auth | smoke | `POST /api/auth/login` returns JWT for standard_user | none | 200, `access_token` present, `token_type=bearer` | no | `auth.service.ts`, `auth.api.spec.ts` | probe (confirmed) |
| T05 | api | auth | regression | `POST /api/auth/login` with bad credentials | valid endpoint | 401 | no | `auth.api.spec.ts` | inference (documented in spec) |
| T06 | api | auth | regression | `POST /api/auth/login` for `locked_out_user` | none | 403 | no | `auth.api.spec.ts` | inference (documented in spec) |
| T07 | ui | catalog | smoke | Catalog lists pizzas with name/description/price | logged in | Cards render for each confirmed pizza | no | `catalog.page.ts`, `catalog.spec.ts` | UI probe |
| T08 | ui | catalog | regression | Category filter buttons narrow the list | logged in | Only matching-category cards shown | yes (`catalog.json`: category x expected pizzas) | `catalog.spec.ts` | UI probe |
| T09 | ui | catalog | smoke | Add a pizza to cart via customize modal updates cart badge/summary | logged in | Cart badge count +1, sidebar shows correct pizza/price | no | `catalog.flow.ts`, `catalog.spec.ts` | UI probe |
| T10 | ui | catalog | regression | Customize-modal "Add to Cart" adds the pizza that was opened, not a different one | logged in | Cart line matches the pizza whose modal was opened | no | `catalog.spec.ts` | UI probe (bug observed: Four Cheese modal added Margherita) |
| T11 | api | catalog | smoke | `GET /api/pizzas` with valid bearer + `X-Country-Code` returns catalog | valid token | 200, `pizzas[]` with id/name/price/currency | no | `catalog.service.ts`, `catalog.api.spec.ts` | probe (confirmed) |
| T12 | api | catalog | regression | `GET /api/pizzas` without `X-Country-Code` | valid token | 400 | no | `catalog.api.spec.ts` | inference (documented in spec) |
| T13 | api | catalog | regression | `GET /api/pizzas` without bearer token | none | 401 | no | `catalog.api.spec.ts` | inference (documented in spec) |
| T14 | ui | cart | smoke | Cart quantity +/- updates subtotal/total | item in cart | Totals recalculate correctly | no | `cart.page.ts`, `cart.spec.ts` | UI probe |
| T15 | api | cart | smoke | `GET /api/cart` with valid bearer + country header returns current cart | valid token, seeded cart | 200, `CartResponse` shape | no | `cart.service.ts`, `cart.api.spec.ts` | inference (schema in spec, not body-probed) |
| T16 | api | cart | regression | `DELETE /api/cart/items/{item_id}` removes a line | valid token, seeded cart | 200/204, item no longer in `GET /api/cart` | no | `cart.api.spec.ts` | inference (documented in spec) |
| T17 | ui | checkout | smoke | Complete checkout with Credit Card for US market | items in cart | Order placed, confirmation shown | no | `checkout.page.ts`, `checkout.flow.ts`, `checkout.spec.ts` | UI probe |
| T18 | ui | checkout | regression | Missing market-required field blocks checkout | items in cart | Inline validation error, no order created | yes (`checkout.json`: market x required field) | `checkout.spec.ts` | API-confirmed per-market required fields, UI validation not yet observed |
| T19 | api | checkout | smoke | `POST /api/checkout` succeeds with all required US fields | valid token, seeded cart | 200 `OrderSummary` | no | `checkout.service.ts`, `checkout.api.spec.ts` | inference (schema/description in spec) |
| T20 | api | checkout | regression | `POST /api/checkout` missing market-required field | valid token, seeded cart | 400 | yes (`checkout.json`: market x required field) | `checkout.api.spec.ts` | inference (documented in spec) |
| T21 | api | orders | regression | `GET /api/orders` returns order history for current user | valid token | 200 | no | `orders.service.ts`, `orders.api.spec.ts` | inference (schema untyped in spec) |
| T22 | ui | profile | regression | Save Changes persists edited personal info | logged in, on `/profile` | Field values persist after reload | no | `profile.page.ts`, `profile.spec.ts` | UI probe |
| T23 | api | profile | regression | `GET /api/users/me/profile` returns current user profile | valid token | 200 | no | `profile.service.ts`, `profile.api.spec.ts` | inference (schema in spec) |

## 6. Slice order

1. `auth` — smallest stable smoke path (login is the gate to everything else).
2. `catalog` — highest-value flow (browse + add to cart), builds on auth.
3. `cart` — depends on catalog, small and stable once catalog exists.
4. `checkout` — highest business value, most complex (multi-market), depends on cart.
5. `profile` — independent of the purchase flow, moderate value.
6. `orders` — API-only for now; add once an order exists via checkout and any UI entry point is confirmed.

## 7. Blocked or unknown

- No visible "Orders" link/page in the UI nav; `/api/orders*` is confirmed via OpenAPI only — UI coverage for order history is blocked until a UI entry point is found (checked `/catalog`, `/checkout`, `/profile` nav; none link to orders).
- `/api/auth/users`, `/api/auth/profile`, `/api/users/me/profile`, `/api/store/market`, `/api/cart` (POST seed), `/api/cart/items/{item_id}`, `/api/session`, `/api/session/reset`, `/api/orders/{order_id}` are confirmed to exist (OpenAPI) but their live request/response bodies were not probed — treat as inference until exercised by tests.
- Whether the pre-filled checkout/profile demo data (e.g., "Alexander Sterling", "123 Luxury Avenue") is real default data or a display bug is unconfirmed.
- The Four Cheese-vs-Margherita add-to-cart mismatch (see T10) is unconfirmed as a reproducible bug vs. a one-off manual-testing mistake; needs a dedicated automated repro.
- Broken topping thumbnail images ("Shredded chicken", "Sardines") are unconfirmed as app bugs vs. missing test fixtures; not yet in the test matrix beyond the UI-map note.
- `/api/debug/*` endpoints are chaos/test-injection utilities; intentionally out of scope for functional test coverage.
- Full behavior differences for `problem_user`, `performance_glitch_user`, `error_user`, `a11y_glitch_user`, `security_glitch_user` are documented in the login endpoint description but not yet individually verified in the UI; only referenced generically in T02.
