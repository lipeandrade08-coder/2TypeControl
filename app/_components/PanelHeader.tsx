"use client";

export function PanelHeader({
  title,
  subtitle,
  action,
  onAction,
  extra,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <header className="panel-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {extra ?? (action && <button type="button" onClick={onAction}>{action} <span>→</span></button>)}
    </header>
  );
}
