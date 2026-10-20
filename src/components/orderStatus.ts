import type { OrderStatus } from "../lib/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_ORDER: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export function statusColor(status: OrderStatus): string {
  switch (status) {
    case "delivered":
      return "bg-green-50 text-green-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    case "shipped":
    case "out_for_delivery":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}
