"use client";

import type { OrderStatus } from "../_types";

export function StatusBadge({ status, pending }: { status: OrderStatus; pending?: boolean }) {
  return (
    <span className={`status-badge ${pending ? "pending" : status.toLowerCase().replace(" ", "-")}`}>
      <i />{pending ? "Falta taxa" : status}
    </span>
  );
}
