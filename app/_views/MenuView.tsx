"use client";

import { useState } from "react";
import type { MenuItem } from "../_types";
import { formatMoney } from "../_lib/utils";
import { Toggle } from "../_components/Toggle";

export function MenuView({
  menuItems,
  setMenuItems,
  onNotify,
}: {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  onNotify: (message: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ category: "Pizzas", available: true });

  const filteredItems = activeCategory === "Todos" ? menuItems : menuItems.filter((i) => i.category === activeCategory);
  const categories = [
    { name: "Todos", icon: "📋" },
    { name: "Pizzas", icon: "🍕" },
    { name: "Pratos", icon: "🍝" },
    { name: "Massas", icon: "🍜" },
    { name: "Sobremesas", icon: "🍰" },
    { name: "Bebidas", icon: "🥤" },
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    const item: MenuItem = {
      name: newItem.name,
      category: newItem.category || "Pizzas",
      price: Number(newItem.price),
      sold: 0,
      available: newItem.available ?? true,
    };
    setMenuItems([item, ...menuItems]);
    setModalOpen(false);
    setNewItem({ category: "Pizzas", available: true });
    onNotify(`${item.name} adicionado ao cardápio com sucesso!`);
  };

  const toggleAvailability = (name: string) => {
    setMenuItems((current) => current.map((item) => item.name === name ? { ...item, available: !item.available } : item));
  };

  return (
    <div className="page-content">
      <div className="section-toolbar">
        <div className="filter-tabs">
          {categories.map((c) => (
            <button key={c.name} className={activeCategory === c.name ? "active" : ""} type="button" onClick={() => setActiveCategory(c.name)}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
        <button className="primary-button" type="button" onClick={() => setModalOpen(true)}>+ Novo item</button>
      </div>

      <section className="panel menu-table-panel">
        <div className="menu-table-heading">
          <span>ITEM</span><span>CATEGORIA</span><span>PREÇO</span><span>VENDAS HOJE</span><span>DISPONÍVEL</span><span />
        </div>
        {filteredItems.map((item, index) => (
          <div className="menu-table-row" key={item.name}>
            <span className={`food-thumb food-${(index % 6) + 1}`}>{item.name.slice(0, 1)}</span>
            <span>
              <strong>{item.name}</strong>
              <small>Sincronizado no site e WhatsApp</small>
            </span>
            <span>{item.category}</span>
            <strong>{formatMoney(item.price)}</strong>
            <span>{item.sold} unidades</span>
            <Toggle enabled={item.available} onToggle={() => toggleAvailability(item.name)} />
            <button type="button" onClick={() => onNotify(`Opções de: ${item.name}`)}>•••</button>
          </div>
        ))}
      </section>

      {modalOpen && (
        <div className="modal-backdrop">
          <button className="modal-scrim" type="button" aria-label="Fechar" onClick={() => setModalOpen(false)} />
          <section className="fee-modal" role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 400 }}>
            <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setModalOpen(false)}>×</button>
            <p className="eyebrow orange">CARDÁPIO</p>
            <h2>Novo Prato</h2>
            <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24, textAlign: "left" }}>
              <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                <span>Nome do Prato</span>
                <input required placeholder="Ex: Pizza Quatro Queijos" value={newItem.name || ""} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Categoria</span>
                  <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }}>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Pratos">Pratos</option>
                    <option value="Massas">Massas</option>
                    <option value="Sobremesas">Sobremesas</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </label>
                <label className="fee-field" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                  <span>Preço (R$)</span>
                  <input required type="number" step="0.01" min="0" placeholder="0.00" value={newItem.price || ""} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", outline: "none" }} />
                </label>
              </div>
              <label className="fee-field" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input type="checkbox" checked={newItem.available} onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })} />
                <span style={{ fontSize: "14px", color: "var(--ink)" }}>Disponível imediatamente</span>
              </label>
              <button className="primary-button wide" type="submit" style={{ marginTop: 8 }}>Adicionar ao Cardápio</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
