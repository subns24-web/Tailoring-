# Tailoring Order Chatbot

A simple web application with a chat assistant that answers questions about your
e-commerce orders — status, tracking, delivery dates, items, payments and refunds.
Built with Node.js + Express and the Anthropic Claude API (tool use).

## How it works

- `public/index.html` — chat UI served by Express.
- `server.js` — `/api/chat` endpoint. Claude is given three tools
  (`list_orders`, `get_order`, `track_order`) and calls them to look up real
  order data before answering. It never invents order details.
- `data/orders.json` — sample order database for the store. Edit this file
  freely (the server re-reads it on every request), or replace the `loadStore()`
  function in `server.js` with calls to your real e-commerce API
  (Shopify, WooCommerce, custom backend, etc.).

## Run it

```bash
npm install
cp .env.example .env   # then put your Anthropic API key in .env
npm start
```

Open http://localhost:3000 and ask things like:

- "Where is my order?"
- "Show all my orders"
- "When will ORD-1002 be delivered?"
- "Did I get my refund for ORD-1004?"

## Connecting your real store

Replace the three functions in `server.js` (`listOrders`, `getOrder`,
`trackOrder`) with calls to your store's API. The tool schemas and the chat
loop don't need to change.
