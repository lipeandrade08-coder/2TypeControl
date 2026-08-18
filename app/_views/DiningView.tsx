"use client";

import { useState } from "react";
import type { Table, Waiter } from "../_types";
import { formatMoney, playSound } from "../_lib/utils";
import { PanelHeader } from "../_components/PanelHeader";

export function DiningView({
  tables,
  waiters,
  selected,
  onSelect,
  onAddItem,
  onClose,
  onNotify,
  onUpdateTable,
  onAddTable,
  onRemoveTable,
  onWaitersUpdate,
  onOpenReserve,
  onOpenQr,
}: {
  tables: Table[];
  waiters: Waiter[];
  selected: Table;
  onSelect: (number: number) => void;
  onAddItem: () => void;
  onClose: () => void;
  onNotify: (message: string) => void;
  onUpdateTable: (t: Table) => void;
  onAddTable: (area: "salao" | "varanda") => void;
  onRemoveTable: (num: number) => void;
  onWaitersUpdate: (w: Waiter[]) => void;
  onOpenReserve: (tableNum: number) => void;
  onOpenQr: (tableNum: number) => void;
}) {
  const [activeArea, setActiveArea] = useState("Salão principal");
  const [isEditingMap, setIsEditingMap] = useState(false);
  const [draggingTable, setDraggingTable] = useState<number | null>(null);
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [editingTableNumber, setEditingTableNumber] = useState<number | null>(null);
  const [assignWaiterTable, setAssignWaiterTable] = useState<number | null>(null);
  const [newWaiterName, setNewWaiterName] = useState("");
  const [newWaiterColor, setNewWaiterColor] = useState("purple");

  const currentAreaKey = activeArea === "Varanda" ? "varanda" : "salao";
  const floorTables = tables.filter((t) => (t.area || "salao") === currentAreaKey);

  const getOccupancyText = (status: string) => {
    if (status === "Livre") return "Livre";
    if (status === "Reservada") return "Reservada";
    if (status === "Conta") return "Fechando conta";
    return "Há 45 min";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditingMap || draggingTable === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const table = floorTables.find((t) => t.number === draggingTable);
    if (table) onUpdateTable({ ...table, x, y });
  };

  const handlePointerUp = () => {
    if (draggingTable !== null) { setDraggingTable(null); onNotify("Posição salva."); }
  };

  const handleAddWaiter = () => {
    if (!newWaiterName.trim()) return;
    const initials = newWaiterName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    onWaitersUpdate([...waiters, { id: `w${Date.now()}`, name: newWaiterName, initials, color: newWaiterColor }]);
    setNewWaiterName("");
    onNotify("Garçom adicionado.");
  };

  const selectedWaiter = waiters.find((w) => w.id === selected.waiterId);

  return (
    <div className="page-content dining-layout">
      {/* MAPA */}
      <section className="floor-panel panel">
        <div className="section-toolbar compact">
          <div className="filter-tabs">
            <button className={activeArea === "Salão principal" ? "active" : ""} onClick={() => { setActiveArea("Salão principal"); playSound("pop"); }} type="button">Salão principal</button>
            <button className={activeArea === "Varanda" ? "active" : ""} onClick={() => { setActiveArea("Varanda"); playSound("pop"); onNotify("Mapa da Varanda carregado."); }} type="button">Varanda</button>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {isEditingMap ? (
              <>
                <button className="ghost-button" type="button" onClick={() => { playSound("pop"); onAddTable(currentAreaKey); }}>+ Nova Mesa</button>
                <button className="primary-button" type="button" onClick={() => { setIsEditingMap(false); onNotify("Edições salvas."); }}>Salvar Mapa</button>
              </>
            ) : (
              <>
                <button className="ghost-button" type="button" onClick={() => setShowWaiterModal(true)}>Gerenciar Equipe</button>
                <button className="ghost-button" type="button" onClick={() => setIsEditingMap(true)}>Editar mapa</button>
              </>
            )}
          </div>
        </div>

        <div className="floor-info">
          <span><strong>{floorTables.filter((t) => t.status === "Livre").length}</strong> livres</span>
          <span><strong>{floorTables.filter((t) => t.status === "Ocupada").length}</strong> ocupadas</span>
          <span><strong>{floorTables.filter((t) => t.status === "Conta").length}</strong> pediu conta</span>
          <span><strong>{floorTables.filter((t) => t.status === "Reservada").length}</strong> reservadas</span>
        </div>

        <div className={`floor-map ${isEditingMap ? "editing" : ""}`} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          <div className="bar-counter">BAR / BALCÃO</div>
          {floorTables.map((table) => {
            const waiter = waiters.find((w) => w.id === table.waiterId);
            return (
              <button
                className={`floor-table ${table.status.toLowerCase()} ${selected.number === table.number ? "selected" : ""}`}
                type="button"
                key={table.number}
                style={{ left: `${table.x}%`, top: `${table.y}%`, width: `${table.width}px`, height: `${table.height}px`, transform: "translate(-50%, -50%)", position: "absolute" }}
                onPointerDown={(e) => {
                  if (isEditingMap) { e.currentTarget.setPointerCapture(e.pointerId); setDraggingTable(table.number); }
                }}
                onClick={() => {
                  if (isEditingMap && draggingTable === null) setEditingTableNumber(table.number);
                  else if (!isEditingMap) { playSound("pop"); onSelect(table.number); }
                }}
              >
                {waiter && !isEditingMap && (
                  <span style={{ position: "absolute", top: "-8px", right: "-8px", background: `var(--${waiter.color})`, color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "grid", placeItems: "center", fontSize: "8px", fontWeight: "bold" }}>{waiter.initials}</span>
                )}
                <span>M{String(table.number).padStart(2, "0")}</span>
                <small>{table.status === "Reservada" ? table.time : table.status === "Livre" ? `${table.seats} lugares` : getOccupancyText(table.status)}</small>
                {table.status === "Reservada" && table.reservedFor && !isEditingMap && (
                  <b style={{ fontSize: 9, color: "var(--purple)", display: "block", marginTop: 2 }}>{table.reservedFor}</b>
                )}
                {table.guests > 0 && <b>{table.guests} pessoas</b>}
                {isEditingMap && (
                  <div className="edit-overlay" style={{ position: "absolute", inset: 0, background: "var(--orange-soft)", borderRadius: "inherit", zIndex: 20, display: "grid", placeItems: "center", opacity: draggingTable === table.number ? 1 : 0.4 }}>
                    <span style={{ color: "var(--ink)", fontSize: "16px" }}>{draggingTable === table.number ? "✋" : "✏️"}</span>
                  </div>
                )}
              </button>
            );
          })}
          <div className="kitchen-marker">COZINHA</div>
        </div>
      </section>

      {/* COMANDA */}
      <aside className="table-check panel">
        <header>
          <div>
            <p className="eyebrow">COMANDA ABERTA</p>
            <h2>Mesa {String(selected.number).padStart(2, "0")}</h2>
            <span>{selected.guests || selected.seats} pessoas • {selected.status === "Livre" ? "mesa livre" : "em andamento"}</span>
          </div>
          <button type="button">•••</button>
        </header>

        <div className="waiter-row" style={{ position: "relative" }}>
          {selectedWaiter ? (
            <>
              <span className={`avatar ${selectedWaiter.color}`}>{selectedWaiter.initials}</span>
              <span><small>Garçom responsável</small><strong>{selectedWaiter.name}</strong></span>
            </>
          ) : (
            <>
              <span className="avatar" style={{ background: "transparent", border: "1px dashed #666" }}>?</span>
              <span><small>Nenhum responsável</small><strong>Não atribuído</strong></span>
            </>
          )}
          <button type="button" onClick={() => setAssignWaiterTable(assignWaiterTable === selected.number ? null : selected.number)}>Trocar</button>

          {assignWaiterTable === selected.number && (
            <div className="dropdown-menu" style={{ position: "absolute", top: "100%", right: "20px", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "8px", zIndex: 100, width: "200px", boxShadow: "0 10px 40px var(--black-50)" }}>
              {waiters.map((w) => (
                <button key={w.id} type="button" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px", background: "transparent", border: "0", cursor: "pointer", borderRadius: "6px", textAlign: "left", color: "var(--ink)" }}
                  onClick={() => { onUpdateTable({ ...selected, waiterId: w.id }); setAssignWaiterTable(null); onNotify(`${w.name} atribuído à Mesa ${selected.number}`); }}>
                  <span className={`avatar ${w.color}`} style={{ width: "24px", height: "24px", fontSize: "9px" }}>{w.initials}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600 }}>{w.name}</span>
                </button>
              ))}
              <div style={{ height: "1px", background: "var(--line)", margin: "8px 0" }} />
              <button type="button" style={{ width: "100%", padding: "8px", background: "transparent", border: "0", color: "var(--muted)", cursor: "pointer", fontSize: "10px", textAlign: "left" }}
                onClick={() => { onUpdateTable({ ...selected, waiterId: undefined }); setAssignWaiterTable(null); }}>
                Remover atribuição
              </button>
            </div>
          )}
        </div>

        <div className="check-items">
          {selected.items.length > 0 ? selected.items.map((item, index) => (
            <div className="check-item" key={`${item.name}-${index}`}>
              <b>{item.quantity}×</b>
              <span>
                <strong>{item.name}</strong>
                {item.options && item.options.length > 0 && <small>{item.options.join(", ")}</small>}
                {item.observations && <small style={{ color: "var(--orange)" }}>Obs: {item.observations}</small>}
              </span>
              <strong>{formatMoney(item.price * item.quantity)}</strong>
            </div>
          )) : (
            <div className="empty-check">
              <span>◇</span>
              <strong>Nenhum item lançado</strong>
              <small>Adicione o primeiro item desta mesa.</small>
            </div>
          )}
        </div>

        <button className="add-item-button" type="button" onClick={() => { playSound("pop"); onAddItem(); }}>＋ Adicionar item</button>

        {selected.status === "Livre" && (
          <button type="button" className="ghost-button wide" style={{ margin: "0 24px 12px", width: "calc(100% - 48px)" }} onClick={() => onOpenReserve(selected.number)}>
            📅 Reservar Esta Mesa
          </button>
        )}

        <div className="check-total">
          <span><small>Subtotal</small><strong>{formatMoney(selected.total)}</strong></span>
          <span><small>Serviço (10%)</small><strong>{formatMoney(selected.total * 0.1)}</strong></span>
          <div><span>Total da mesa</span><strong>{formatMoney(selected.total * 1.1)}</strong></div>
        </div>

        <div className="check-actions">
          <button className="ghost-button" type="button" onClick={() => onOpenQr(selected.number)}>📱 QR da Mesa</button>
          <button className="primary-button" type="button" disabled={selected.total === 0} onClick={() => { playSound("pop"); onClose(); }}>Cobrar</button>
        </div>
      </aside>

      {/* MODAL EQUIPE */}
      {showWaiterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: "420px" }}>
            <div className="modal-header">
              <h2>Gestão de Equipe (Garçons)</h2>
              <button className="close-button" type="button" onClick={() => setShowWaiterModal(false)}>×</button>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {waiters.map((w) => (
                  <div key={w.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--surface)", padding: "10px", borderRadius: "8px" }}>
                    <span className={`avatar ${w.color}`}>{w.initials}</span>
                    <span style={{ flex: 1, fontSize: "14px", fontWeight: "600" }}>{w.name}</span>
                    <button type="button" style={{ border: 0, background: "transparent", color: "var(--orange)", cursor: "pointer", fontSize: "12px" }}
                      onClick={() => { onWaitersUpdate(waiters.filter((wa) => wa.id !== w.id)); onNotify("Garçom removido."); }}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px", border: "1px dashed var(--line)", borderRadius: "10px" }}>
                <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--muted)" }}>Adicionar novo</h3>
                <input type="text" className="modal-input" placeholder="Nome completo" value={newWaiterName} onChange={(e) => setNewWaiterName(e.target.value)} style={{ marginBottom: "12px" }} />
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  {["purple", "orange", "mint", "coral", "blue"].map((color) => (
                    <button key={color} type="button" style={{ width: "24px", height: "24px", borderRadius: "50%", background: `var(--${color})`, border: newWaiterColor === color ? "2px solid white" : "2px solid transparent", cursor: "pointer" }} onClick={() => setNewWaiterColor(color)} />
                  ))}
                </div>
                <button type="button" className="primary-button wide" onClick={handleAddWaiter} disabled={!newWaiterName.trim()}>Salvar Garçom</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR MESA */}
      {editingTableNumber !== null && (() => {
        const t = tables.find((tb) => tb.number === editingTableNumber);
        if (!t) return null;
        return (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: "380px" }}>
              <div className="modal-header">
                <h2>Editar Mesa {editingTableNumber}</h2>
                <button className="close-button" type="button" onClick={() => setEditingTableNumber(null)}>×</button>
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Lugares (Cadeiras)</label>
                  <input type="number" className="modal-input" value={t.seats} onChange={(e) => onUpdateTable({ ...t, seats: parseInt(e.target.value) || 2 })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Largura (Visual)</label>
                    <input type="number" className="modal-input" value={t.width} onChange={(e) => onUpdateTable({ ...t, width: parseInt(e.target.value) || 104 })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>Altura (Visual)</label>
                    <input type="number" className="modal-input" value={t.height} onChange={(e) => onUpdateTable({ ...t, height: parseInt(e.target.value) || 76 })} />
                  </div>
                </div>
                <button type="button" className="ghost-button wide" style={{ color: "var(--orange)", borderColor: "var(--orange-soft)", marginTop: "10px" }}
                  onClick={() => { onRemoveTable(t.number); setEditingTableNumber(null); onNotify("Mesa removida com sucesso."); }}>
                  Apagar Mesa
                </button>
                <button type="button" className="primary-button wide" onClick={() => setEditingTableNumber(null)}>Concluir</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
