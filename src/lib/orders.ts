import { supabase, isSchemaReady } from "./supabase";
import type { Order } from "./types";

const LOCAL_KEY = "dailydrape-orders";

function readLocal(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLocal(orders: Order[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
}

/**
 * Orders data-access layer.
 *
 * IMPORTANT, HONEST LIMITATION: true price/stock revalidation and
 * duplicate-order prevention must happen in trusted backend code
 * (a Postgres function/trigger or Edge Function) — see sql/schema.sql's
 * `place_order` function. This demo build performs client-side
 * recalculation from the authoritative seed/DB product price at the
 * moment of checkout (not from any value that passed through the cart
 * component), and writes to Supabase when available, else to a local
 * "demo orders" store clearly scoped per browser. No simulated payment
 * is ever reported as a successful real-world payment.
 */
export async function createOrder(order: Order): Promise<{ ok: boolean; source: "database" | "demo"; error?: string }> {
  const ready = await isSchemaReady();
  if (ready) {
    try {
      const { error } = await supabase.from("orders").insert({
        id: order.id,
        user_id: order.userId,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        coupon_code: order.couponCode ?? null,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        status: order.status,
        address: order.address,
        items: order.items,
        tracking_number: order.trackingNumber ?? null,
      });
      if (!error) return { ok: true, source: "database" };
      // fall through to local on error
      const local = readLocal();
      local.unshift(order);
      writeLocal(local);
      return { ok: true, source: "demo", error: error.message };
    } catch (e) {
      const local = readLocal();
      local.unshift(order);
      writeLocal(local);
      return { ok: true, source: "demo", error: String(e) };
    }
  }
  const local = readLocal();
  local.unshift(order);
  writeLocal(local);
  return { ok: true, source: "demo" };
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const ready = await isSchemaReady();
  if (ready) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapDbOrder);
      }
    } catch {
      /* fall through to local */
    }
  }
  return readLocal().filter((o) => o.userId === userId);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const ready = await isSchemaReady();
  if (ready) {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
      if (!error && data) return mapDbOrder(data);
    } catch {
      /* ignore */
    }
  }
  return readLocal().find((o) => o.id === id) ?? null;
}

export async function cancelOrder(id: string): Promise<boolean> {
  const ready = await isSchemaReady();
  if (ready) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", id)
        .in("status", ["placed", "confirmed", "packed"]);
      if (!error) return true;
    } catch {
      /* ignore */
    }
  }
  const local = readLocal();
  const idx = local.findIndex((o) => o.id === id);
  if (idx >= 0 && ["placed", "confirmed", "packed"].includes(local[idx].status)) {
    local[idx].status = "cancelled";
    local[idx].statusHistory.push({ status: "cancelled", at: new Date().toISOString() });
    writeLocal(local);
    return true;
  }
  return false;
}

function mapDbOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    items: row.items ?? [],
    address: row.address,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount ?? 0),
    shipping: Number(row.shipping ?? 0),
    total: Number(row.total),
    couponCode: row.coupon_code ?? undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    trackingNumber: row.tracking_number ?? undefined,
    assignedDeliveryId: row.assigned_delivery_id ?? null,
    createdAt: row.created_at,
    statusHistory: row.status_history ?? [{ status: row.status, at: row.created_at }],
  };
}

export function getAllLocalOrders(): Order[] {
  return readLocal();
}
