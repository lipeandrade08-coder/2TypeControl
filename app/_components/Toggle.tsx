"use client";

export function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={enabled ? "Desativar" : "Ativar"}
      aria-pressed={enabled}
      className={`toggle ${enabled ? "enabled" : ""}`}
      onClick={onToggle}
    >
      <i />
    </button>
  );
}
