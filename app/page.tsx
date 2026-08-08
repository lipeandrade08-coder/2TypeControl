import type { Metadata } from "next";
import { RestaurantDashboard } from "./restaurant-dashboard";

export const metadata: Metadata = {
  title: "2Type Control — Central do restaurante",
  description:
    "Pedidos, WhatsApp, entregas e mesas em uma única central de operação.",
};

export default function Home() {
  return <RestaurantDashboard />;
}
