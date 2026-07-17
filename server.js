import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(here, "public")));

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

// ---------------------------------------------------------------------------
// Order data source. Reads data/orders.json on every call so you can edit the
// file (or point loadStore at your real e-commerce API) without restarting.
// ---------------------------------------------------------------------------
function loadStore() {
  const raw = fs.readFileSync(path.join(here, "data", "orders.json"), "utf-8");
  return JSON.parse(raw);
}

function listOrders({ status } = {}) {
  const { orders } = loadStore();
  const filtered = status ? orders.filter((o) => o.status === status) : orders;
  // Summary view — keeps tool results small; details come from get_order.
  return filtered.map((o) => ({
    order_id: o.order_id,
    status: o.status,
    total: o.total,
    placed_at: o.placed_at,
    estimated_delivery: o.estimated_delivery ?? null,
    items: o.items.map((i) => `${i.quantity}x ${i.name}`),
  }));
}

function getOrder(orderId) {
  const { orders } = loadStore();
  return orders.find(
    (o) => o.order_id.toLowerCase() === String(orderId).toLowerCase()
  );
}

function trackOrder(orderId) {
  const order = getOrder(orderId);
  if (!order) return null;
  return {
    order_id: order.order_id,
    status: order.status,
    estimated_delivery: order.estimated_delivery ?? null,
    tracking: order.tracking,
    history: order.history,
  };
}

// ---------------------------------------------------------------------------
// Tools Claude can call to look up orders
// ---------------------------------------------------------------------------
const tools = [
  {
    name: "list_orders",
    description:
      "List all of the customer's orders in the store, newest first. Optionally filter by status. Use this when the user asks about their orders in general, or you don't know which order they mean.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: [
            "placed",
            "in_production",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
          ],
          description: "Only return orders with this status",
        },
      },
    },
  },
  {
    name: "get_order",
    description:
      "Get full details of a single order by its order ID (e.g. ORD-1001): items, measurements, payment, totals, refund info.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Order ID such as ORD-1001" },
      },
      required: ["order_id"],
    },
  },
  {
    name: "track_order",
    description:
      "Get shipping/tracking status and the full event history for an order by its order ID. Use this when the user asks where their order is or when it will arrive.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Order ID such as ORD-1001" },
      },
      required: ["order_id"],
    },
  },
];

function runTool(name, input) {
  switch (name) {
    case "list_orders":
      return JSON.stringify(listOrders(input));
    case "get_order": {
      const order = getOrder(input.order_id);
      return order
        ? JSON.stringify(order)
        : `No order found with ID "${input.order_id}". Use list_orders to see valid IDs.`;
    }
    case "track_order": {
      const info = trackOrder(input.order_id);
      return info
        ? JSON.stringify(info)
        : `No order found with ID "${input.order_id}". Use list_orders to see valid IDs.`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

const SYSTEM_PROMPT = `You are the friendly order assistant for ${loadStore().store.name}, an online tailoring store.
You help the customer check their orders: status, tracking, delivery dates, items, measurements, payments, and refunds.

Rules:
- Always look up real data with the tools before answering questions about orders. Never invent order details.
- Amounts are in INR — format them like ₹1,499.
- Be warm and concise. Use short paragraphs or small lists, not long tables.
- If the user asks for something you cannot do (change an address, cancel an order), explain that they should contact support at ${loadStore().store.support_email} or ${loadStore().store.support_phone}.
- If an order ID doesn't exist, say so and show their actual orders.`;

// ---------------------------------------------------------------------------
// Chat endpoint — manual tool-use loop
// ---------------------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  const history = Array.isArray(req.body.messages) ? req.body.messages : [];
  if (history.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return res.status(401).json({
      error:
        "No API key configured. Copy .env.example to .env, set ANTHROPIC_API_KEY, and restart the server.",
    });
  }

  const messages = [...history];
  try {
    for (let turn = 0; turn < 10; turn++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });

      if (response.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: response.content });
        const toolResults = response.content
          .filter((block) => block.type === "tool_use")
          .map((block) => ({
            type: "tool_result",
            tool_use_id: block.id,
            content: runTool(block.name, block.input),
          }));
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      return res.json({ reply: text, messages: [...messages, { role: "assistant", content: text }] });
    }
    return res.status(500).json({ error: "Too many tool calls without a final answer" });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({
        error:
          "Invalid or missing ANTHROPIC_API_KEY. Copy .env.example to .env and set your key.",
      });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Rate limited — please try again in a moment." });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong talking to the assistant." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Order chatbot running at http://localhost:${PORT}`);
});
