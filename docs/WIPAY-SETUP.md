# WiPay Payment Gateway Setup for Westbridge

Westbridge uses **WiPay** for all subscription payments. WiPay is a Caribbean-focused payment gateway supporting USD, GYD, TTD, JMD, BBD, and XCD currencies.

## 1. Get your merchant credentials

1. Apply for a WiPay merchant account at [wipayfinancial.com](https://wipayfinancial.com).
2. Once approved, you will receive:
   - **Account Number** — your WiPay merchant identifier
   - **API Key** — your API authentication key
3. WiPay provides country-specific endpoints and a sandbox for testing:
   - Sandbox: `https://sandbox.wipayfinancial.com`
   - Guyana: `https://gy.wipayfinancial.com`
   - Trinidad & Tobago: `https://tt.wipayfinancial.com`
   - Jamaica: `https://jm.wipayfinancial.com`
   - Barbados: `https://bb.wipayfinancial.com`

Add credentials to the backend `.env`:

```env
WIPAY_ACCOUNT_NUMBER="your-wipay-account-number"
WIPAY_API_KEY="your-wipay-api-key"
WIPAY_TEST_MODE="true"   # Set to "false" for production
```

## 2. How the payment flow works

1. Customer selects a plan and signs up on the frontend.
2. The backend creates an account (status: `pending`) and calls the WiPay API to create a payment session.
3. The backend returns a redirect URL for the WiPay **Hosted Checkout Page**.
4. The customer is redirected to WiPay's secure payment page to enter card details.
5. After payment, WiPay redirects the browser to the backend webhook: `GET /api/webhooks/wipay`.
6. The backend verifies the result, activates the account (status: `active`), and redirects the browser to the frontend with `?payment=success` or `?payment=failed`.

## 3. Configure the webhook / return URL

WiPay redirects the customer's browser back to your **return URL** after payment. The backend sets this URL when creating the payment session.

- **Production:** `https://<your-domain>/api/webhooks/wipay`
- **Local testing:** use a tunnel (e.g. ngrok) and set `FRONTEND_URL` to the tunnel URL.

## 4. Supported currencies

WiPay natively supports Caribbean currencies:

| Code | Currency                 |
| ---- | ------------------------ |
| USD  | US Dollar                |
| GYD  | Guyanese Dollar          |
| TTD  | Trinidad & Tobago Dollar |
| JMD  | Jamaican Dollar          |
| BBD  | Barbadian Dollar         |
| XCD  | East Caribbean Dollar    |

The default currency is set per account in the database (`currency` field, default: `GYD`).

## 5. Testing

Use the sandbox environment (`WIPAY_TEST_MODE="true"`) with WiPay's test card numbers:

- **Approved:** `4111 1111 1111 1111` (any future expiry, any CVV)
- **Declined:** `4000 0000 0000 0002`

## 6. Going live

1. Complete WiPay's go-live verification.
2. Set `WIPAY_TEST_MODE="false"` in production environment.
3. Update `WIPAY_ACCOUNT_NUMBER` and `WIPAY_API_KEY` with production credentials.
4. Ensure the webhook return URL is reachable and using HTTPS.

## 7. Database

Signup creates an **Account** in PostgreSQL. After payment confirmation, the webhook activates the account and stores:

- `payment_transaction_id` — WiPay transaction identifier
- `payment_order_id` — WiPay order ID (for reconciliation)
