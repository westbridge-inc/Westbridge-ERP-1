# Paddle Payment Gateway Setup for Westbridge

Westbridge uses **Paddle** for all subscription payments. Paddle provides an overlay checkout that opens on top of your site -- no redirects required.

## 1. Get your Paddle credentials

1. Sign up for a Paddle account at [paddle.com](https://www.paddle.com).
2. Once approved, you will receive:
   - **Client-side token** -- used to initialize Paddle.js in the browser
   - **API key** -- used for server-side API calls (webhooks, subscription management)
3. Paddle provides a sandbox environment for testing:
   - Sandbox dashboard: `https://sandbox-vendors.paddle.com`
   - Production dashboard: `https://vendors.paddle.com`

## 2. Create products and prices

1. In the Paddle dashboard, create a **Product** for each plan (Solo, Starter, Business, Enterprise).
2. Under each product, create a **Price** with the desired billing interval and amount.
3. Copy the **Price ID** (e.g. `pri_01abc123...`) for each plan.

Add credentials to the frontend `.env.local`:

```env
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="your-paddle-client-token"
NEXT_PUBLIC_PADDLE_SANDBOX="true"       # Set to "false" for production
NEXT_PUBLIC_PADDLE_PRICE_SOLO="pri_..."
NEXT_PUBLIC_PADDLE_PRICE_STARTER="pri_..."
NEXT_PUBLIC_PADDLE_PRICE_BUSINESS="pri_..."
NEXT_PUBLIC_PADDLE_PRICE_ENTERPRISE="pri_..."
```

Add the API key to the backend `.env`:

```env
PADDLE_API_KEY="your-paddle-api-key"
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX="true"                   # Set to "false" for production
```

## 3. How the payment flow works

1. Customer selects a plan and signs up on the frontend.
2. The backend creates an account (status: `pending`) and returns the `accountId`.
3. The frontend opens the Paddle **overlay checkout** with the selected price ID, customer email, and account ID.
4. The customer enters payment details directly in the overlay -- no redirect.
5. On successful payment, Paddle redirects the browser to `?payment=success`.
6. Paddle sends a webhook (`subscription.created`) to the backend.
7. The backend verifies the webhook signature, activates the account (status: `active`), and stores the subscription details.

## 4. Configure the webhook

In the Paddle dashboard under **Developer > Notifications**:

1. Add a new webhook endpoint:
   - **Production:** `https://<your-domain>/api/webhooks/paddle`
   - **Local testing:** use a tunnel (e.g. ngrok) and point to `http://localhost:4000/api/webhooks/paddle`
2. Subscribe to these events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.past_due`
   - `transaction.completed`
   - `transaction.payment_failed`
3. Copy the **Webhook Secret** and add it as `PADDLE_WEBHOOK_SECRET` in the backend `.env`.

## 5. Testing

Use the sandbox environment (`NEXT_PUBLIC_PADDLE_SANDBOX="true"`) with Paddle's test card numbers:

- **Approved:** `4242 4242 4242 4242` (any future expiry, any CVV)
- **3DS challenge:** `4000 0000 0000 3220`
- **Declined:** `4000 0000 0000 0002`

See [Paddle testing docs](https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-cards) for the full list.

## 6. Going live

1. Complete Paddle's domain verification.
2. Set `NEXT_PUBLIC_PADDLE_SANDBOX="false"` and `PADDLE_SANDBOX="false"` in production.
3. Update all environment variables with production credentials and price IDs.
4. Ensure the webhook endpoint is reachable and using HTTPS.

## 7. Database

Signup creates an **Account** in PostgreSQL. After the webhook confirms payment, the backend activates the account and stores:

- `paddle_subscription_id` -- Paddle subscription identifier
- `paddle_customer_id` -- Paddle customer ID
- `payment_status` -- current payment status (active, past_due, canceled)
