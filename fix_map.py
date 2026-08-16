import re

with open("app/restaurant-dashboard.tsx", "r") as f:
    content = f.read()

new_telemetry_map = """const CITIES = [
  { name: "Guaratinguetá, SP", lat: -22.8167, lng: -45.1925 },
  { name: "São Paulo, SP", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro, RJ", lat: -22.9068, lng: -43.1729 },
  { name: "Curitiba, PR", lat: -25.4284, lng: -49.2733 },
];

function TelemetryMap() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let mounted = true;
    import('leaflet').then((LModule) => {
      if (!mounted) return;
      const L = LModule.default || LModule;
      
      if (!leafletMapRef.current) {
        // Initialize map
        leafletMapRef.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([selectedCity.lat, selectedCity.lng], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(leafletMapRef.current);
      } else {
        leafletMapRef.current.setView([selectedCity.lat, selectedCity.lng], 13);
      }

      const map = leafletMapRef.current;
      
      // Clear existing layers (except tileLayer)
      map.eachLayer((layer: any) => {
        if (!layer._url) map.removeLayer(layer);
      });

      // Draw Range Rings (2km, 5km, 8km)
      [2000, 5000, 8000].forEach(radius => {
        L.circle([selectedCity.lat, selectedCity.lng], {
          radius,
          color: 'var(--purple)',
          weight: 1.5,
          fill: false,
          dashArray: '4 6',
          opacity: 0.4
        }).addTo(map);
      });

      const offsets = [
        { latOff: 0, lngOff: 0, intensity: 1, type: "center" },
        { latOff: 0.01, lngOff: 0.02, intensity: 0.8, type: "hotspot" },
        { latOff: -0.015, lngOff: -0.01, intensity: 0.6, type: "hotspot" },
        { latOff: 0.02, lngOff: -0.015, intensity: 0.9, type: "hotspot" },
        { latOff: -0.005, lngOff: 0.03, intensity: 0.5, type: "hotspot" },
        { latOff: 0.005, lngOff: -0.025, intensity: 0.7, type: "hotspot" },
        { latOff: -0.02, lngOff: 0.01, intensity: 0.4, type: "hotspot" },
        { latOff: 0.015, lngOff: 0.005, intensity: 0.6, type: "hotspot" },
        { latOff: 0.012, lngOff: 0.015, intensity: 1, type: "active" },
        { latOff: -0.008, lngOff: -0.012, intensity: 1, type: "active" },
        { latOff: -0.018, lngOff: 0.022, intensity: 1, type: "active" },
      ];

      offsets.forEach((pt, i) => {
        let html = '';
        if (pt.type === "center") {
          html = `<div style="position:relative; width:0; height:0;">
            <svg viewBox="0 0 100 100" width="800" height="800" style="position:absolute; top:-400px; left:-400px; pointer-events:none;">
              <g class="radar-sweep-container" style="transform-origin: 50% 50%">
                <path d="M50 50 L50 5 A45 45 0 0 1 95 50 Z" fill="var(--purple)" opacity="0.15" />
              </g>
            </svg>
            <svg viewBox="0 0 100 100" width="40" height="40" style="position:absolute; top:-20px; left:-20px;">
              <circle cx="50" cy="50" r="15" fill="var(--purple)" opacity="0.4" class="pulse-slow" />
              <circle cx="50" cy="50" r="6" fill="var(--purple)" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="var(--purple)" stroke-width="1.5" class="ping" />
            </svg>
          </div>`;
        } else if (pt.type === "hotspot") {
          const size = pt.intensity * 60;
          html = `<div style="position:relative; width:0; height:0;">
            <svg viewBox="0 0 100 100" width="${size}" height="${size}" style="position:absolute; top:-${size/2}px; left:-${size/2}px;">
              <circle cx="50" cy="50" r="30" fill="var(--orange)" opacity="0.3" class="pulse-random" style="animation-delay: ${(i % 5) * 0.5}s" />
              <circle cx="50" cy="50" r="5" fill="var(--orange)" opacity="0.9" />
            </svg>
          </div>`;
        } else if (pt.type === "active") {
          html = `<div style="position:relative; width:0; height:0;">
            <svg viewBox="0 0 100 100" width="30" height="30" style="position:absolute; top:-15px; left:-15px;">
              <circle cx="50" cy="50" r="15" fill="var(--green)" opacity="0.5" class="pulse-fast" />
              <circle cx="50" cy="50" r="6" fill="var(--green)" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="var(--green)" stroke-width="1.5" class="ping" style="animation-delay: ${(i % 3) * 0.3}s" />
            </svg>
          </div>`;
        }

        const icon = L.divIcon({
          html,
          className: 'custom-leaflet-icon',
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        L.marker([selectedCity.lat + pt.latOff, selectedCity.lng + pt.lngOff], { icon }).addTo(map);
      });

    });

    return () => { mounted = false; };
  }, [selectedCity]);

  return (
    <div className="telemetry-map-container panel">
      <div className="telemetry-header">
        <div className="telemetry-title">
          <span className="live-indicator"></span>
          <div>
            <strong>Telemetria & Alcance</strong>
            <small>Mapa de calor de entregas e entregadores ativos</small>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            className="city-select"
            value={selectedCity.name}
            onChange={(e) => {
              const city = CITIES.find(c => c.name === e.target.value);
              if (city) setSelectedCity(city);
            }}
          >
            {CITIES.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
          <div className="telemetry-legend">
            <span><span className="legend-dot hotspot"></span> Alta demanda</span>
            <span><span className="legend-dot active"></span> Em rota</span>
          </div>
        </div>
      </div>
      <div className="telemetry-map">
        <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0a0a0f' }}></div>
      </div>
    </div>
  );
}"""

content = re.sub(
    r"function TelemetryMap\(\) \{.*?(?=function DeliveryView)",
    new_telemetry_map + "\n\n",
    content,
    flags=re.DOTALL
)

with open("app/restaurant-dashboard.tsx", "w") as f:
    f.write(content)
