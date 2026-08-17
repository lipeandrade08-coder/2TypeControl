"use client";

export function Metric({
  title,
  value,
  note,
  color,
  icon,
  path,
  onAction,
}: {
  title: string;
  value: string;
  note: string;
  color?: string;
  trend?: string;
  icon: string;
  path?: string;
  onAction?: () => void;
}) {
  const c = color || "purple";
  const p = path || "M0,25 Q10,15 20,22 T40,20 T60,28 T80,24 T100,10";

  return (
    <article className="metric-card">
      <div className="metric-card-header">
        <div className={`metric-icon ${c}`}>{icon}</div>
        <div className="metric-info">
          <span>{title}</span>
          <strong>{value}</strong>
          <small className={c === "purple" || c === "green" ? "up" : ""}>{note}</small>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Detalhes de ${title}`}
        onClick={onAction}
        style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer" }}
      >
        •••
      </button>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${c}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`var(--${c})`} stopOpacity="0.4" />
            <stop offset="100%" stopColor={`var(--${c})`} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${p} L100,35 L0,35 Z`} fill={`url(#grad-${c})`} />
        <path d={p} fill="none" stroke={`var(--${c})`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </article>
  );
}
