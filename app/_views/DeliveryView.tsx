"use client";

import { useState, useRef, useEffect } from "react";
import type { Order } from "../_types";
import { formatMoney } from "../_lib/utils";
import { PanelHeader } from "../_components/PanelHeader";

const CITIES = [
  { name: "Guaratinguetá, SP", lat: -22.8167, lng: -45.1925 },
  { name: "São Paulo, SP", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro, RJ", lat: -22.9068, lng: -43.1729 },
  { name: "Curitiba, PR", lat: -25.4284, lng: -49.2733 },
];

function TelemetryMap() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    let mounted = true;

    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css" as string),
    ]).then(([LModule]) => {
      if (!mounted || !mapRef.current) return;
      const L = (LModule as { default?: typeof import("leaflet") }).default || LModule;

      if (!leafletMapRef.current) {
        leafletMapRef.current = (L as typeof import("leaflet")).map(mapRef.current!, { zoomControl: false, attributionControl: false }).setView([selectedCity.lat, selectedCity.lng], 13);
        (L as typeof import("leaflet")).tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(leafletMapRef.current as import("leaflet").Map);
      } else {
        (leafletMapRef.current as import("leaflet").Map).setView([selectedCity.lat, selectedCity.lng], 13);
      }

      const map = leafletMapRef.current as import("leaflet").Map;
      map.eachLayer((layer: import("leaflet").Layer) => { if (!(layer as { _url?: string })._url) map.removeLayer(layer); });

      [2000, 5000, 8000].forEach((radius) => {
        (L as typeof import("leaflet")).circle([selectedCity.lat, selectedCity.lng], { radius, color: "var(--purple)", weight: 1.5, fill: false, dashArray: "4 6", opacity: 0.4 }).addTo(map);
      });

      const offsets = [
        { latOff: 0, lngOff: 0, type: "center" },
        { latOff: 0.01, lngOff: 0.02, intensity: 0.8, type: "hotspot" },
        { latOff: -0.015, lngOff: -0.01, intensity: 0.6, type: "hotspot" },
        { latOff: 0.02, lngOff: -0.015, intensity: 1.2, type: "hotspot" },
        { latOff: 0.012, lngOff: 0.015, intensity: 1, type: "active", driver: "Carlos M.", eta: "8 min" },
        { latOff: -0.008, lngOff: -0.012, intensity: 1, type: "active", driver: "Diego R.", eta: "18 min" },
        { latOff: -0.018, lngOff: 0.022, intensity: 1, type: "active", driver: "André L.", eta: "24 min" },
      ] as { latOff: number; lngOff: number; intensity?: number; type: string; driver?: string; eta?: string }[];

      offsets.forEach((pt, i) => {
        let html = "";
        if (pt.type === "center") {
          html = `<div style="position:relative;width:0;height:0;"><svg viewBox="0 0 100 100" width="40" height="40" style="position:absolute;top:-20px;left:-20px;"><circle cx="50" cy="50" r="15" fill="var(--purple)" opacity="0.4" class="pulse-slow"/><circle cx="50" cy="50" r="6" fill="var(--purple)"/><circle cx="50" cy="50" r="30" fill="none" stroke="var(--purple)" stroke-width="1.5" class="ping"/></svg></div>`;
        } else if (pt.type === "hotspot") {
          const size = (pt.intensity ?? 1) * 80;
          html = `<div style="position:relative;width:0;height:0;"><svg viewBox="0 0 100 100" width="${size}" height="${size}" style="position:absolute;top:-${size / 2}px;left:-${size / 2}px;mix-blend-mode:screen;filter:blur(4px);"><defs><radialGradient id="heat-${i}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="var(--orange)" stop-opacity="0.8"/><stop offset="100%" stop-color="rgba(255,0,0,0)" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#heat-${i})"/></svg></div>`;
        } else if (pt.type === "active") {
          html = `<div style="position:relative;width:0;height:0;cursor:pointer;"><svg viewBox="0 0 100 100" width="48" height="48" style="position:absolute;top:-24px;left:-24px;"><circle cx="50" cy="50" r="15" fill="var(--green)" opacity="0.2" class="pulse-fast"/><circle cx="50" cy="50" r="8" fill="var(--panel)" stroke="var(--green)" stroke-width="2.5"/><circle cx="50" cy="50" r="3" fill="var(--green)"/></svg><div style="position:absolute;top:-38px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid rgba(0,230,118,0.4);color:var(--ink);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 4px 12px var(--black-50);">🛵 ${pt.driver} · ${pt.eta}</div></div>`;
        }
        const icon = (L as typeof import("leaflet")).divIcon({ html, className: "custom-leaflet-icon", iconSize: [0, 0], iconAnchor: [0, 0] });
        (L as typeof import("leaflet")).marker([selectedCity.lat + pt.latOff, selectedCity.lng + pt.lngOff], { icon }).addTo(map);
      });
    });

    return () => { mounted = false; };
  }, [selectedCity]);

  return (
    <div className="telemetry-map-container panel">
      <div className="telemetry-header">
        <div className="telemetry-title">
          <span className="live-indicator" />
          <div>
            <strong>Telemetria &amp; Alcance</strong>
            <small>Mapa de calor de entregas e entregadores ativos</small>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <select className="city-select" value={selectedCity.name} onChange={(e) => { const city = CITIES.find((c) => c.name === e.target.value); if (city) setSelectedCity(city); }}>
            {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <div className="telemetry-legend">
            <span><span className="legend-dot hotspot" />Alta demanda</span>
            <span><span className="legend-dot active" />Em rota</span>
          </div>
        </div>
      </div>
      <div className="telemetry-map">
        <div ref={mapRef} style={{ width: "100%", height: "100%", background: "#0a0a0f" }} />
      </div>
    </div>
  );
}

export function DeliveryView({
  orders,
  pendingFee,
  onOpenFee,
  onNotify,
  onAdvance,
}: {
  orders: Order[];
  pendingFee?: Order;
  onOpenFee: () => void;
  onNotify: (message: string) => void;
  onAdvance: (id: number) => void;
}) {
  const [routesConnected, setRoutesConnected] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="page-content">
      {pendingFee && (
        <section className="attention-banner">
          <span className="attention-icon">!</span>
          <div>
            <strong>1 pedido precisa da taxa de entrega</strong>
            <p>Revise a distância e confirme o valor antes de enviar para a cozinha.</p>
          </div>
          <button type="button" onClick={onOpenFee}>Resolver agora <span>→</span></button>
        </section>
      )}

      {showMap && <TelemetryMap />}

      <div className="delivery-grid">
        {orders.filter(o => o.status === "Pronto").length > 0 && (
          <section className="panel live-deliveries" style={{ borderColor: "var(--orange)", gridColumn: "1 / -1" }}>
            <PanelHeader
              title="Aguardando Despacho"
              subtitle={`${orders.filter(o => o.status === "Pronto").length} pedido(s) pronto(s) para entrega`}
            />
            {orders.filter(o => o.status === "Pronto").map((delivery) => (
              <article key={delivery.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", background: "var(--orange-soft)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 12, margin: "0 16px 16px" }}>
                <span className="driver-avatar" style={{ background: "var(--orange)", color: "white", width: 44, height: 44, fontSize: 20, flexShrink: 0 }}>📦</span>
                <span style={{ flex: 1 }}>
                  <strong style={{ color: "var(--orange)", fontSize: 15, display: "block", marginBottom: 4 }}>#{delivery.id} • {delivery.customer}</strong>
                  <small style={{ color: "var(--ink)", fontSize: 12 }}>Repasse: {formatMoney(delivery.driverFee || 8.5)}</small>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onAdvance(delivery.id);
                    onNotify(`Pedido #${delivery.id} enviado para os entregadores!`);
                  }}
                  style={{ background: "var(--orange)", color: "white", padding: "12px 20px", borderRadius: 10, border: 0, fontWeight: 800, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}
                >
                  Enviar p/ Entregador
                </button>
              </article>
            ))}
          </section>
        )}

        <section className="panel live-deliveries">
          <PanelHeader
            title="Entregas em andamento"
            subtitle={`${orders.filter(o => o.status === "Saiu").length} pedido(s) em rota`}
            action={showMap ? "Ocultar mapa" : "Ver mapa"}
            onAction={() => setShowMap(!showMap)}
          />
          {orders.filter(o => o.status === "Saiu").length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", background: "var(--surface)", borderRadius: 12, margin: 16 }}>
              Nenhum entregador em rota no momento.
            </div>
          )}
          {orders.filter(o => o.status === "Saiu").map((delivery) => (
            <article className="delivery-row" key={delivery.id}>
              <span className="driver-avatar">➜</span>
              <span>
                <strong>#{delivery.id} • {delivery.customer}</strong>
                <small>{delivery.driver || "Entregador Parceiro"} • a caminho</small>
                <i><b style={{ width: `${Math.min(90, Math.max(10, (delivery.id % 100)))}%` }} /></i>
              </span>
              <span>
                <small>Previsão</small>
                <strong>{(delivery.id % 20) + 10} min</strong>
              </span>
            </article>
          ))}
        </section>

        <section className="panel delivery-rules">
          <PanelHeader title="Regras de entrega" subtitle="Valores usados pela IA e pelo site" action="Editar" onAction={() => onNotify("Configurações de entrega abertas.")} />
          {[
            { range: "Até 2 km", fee: 6.9, time: "20–30 min" },
            { range: "2 a 5 km", fee: 9.9, time: "30–40 min" },
            { range: "5 a 8 km", fee: 14.9, time: "40–55 min" },
          ].map((rule) => (
            <div className="rule-row" key={rule.range}>
              <span className="rule-pin">⌖</span>
              <span><strong>{rule.range}</strong><small>{rule.time}</small></span>
              <strong>{formatMoney(rule.fee)}</strong>
            </div>
          ))}
          <div className="auto-rate">
            <span>✦</span>
            <div>
              <strong>{routesConnected ? "Rotas Conectadas" : "Cálculo automático disponível"}</strong>
              <p>{routesConnected ? "As taxas estão sendo calculadas automaticamente via integração." : "Conecte a geolocalização do site para sugerir a taxa pela distância."}</p>
            </div>
            <button type="button" onClick={() => { setRoutesConnected(true); onNotify(routesConnected ? "Rotas sincronizadas com sucesso." : "Integração de rotas ativada!"); }}>
              {routesConnected ? "Sincronizar" : "Conectar"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
