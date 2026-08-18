"use client";

import { useState, useEffect, useRef } from "react";
import type { AppRole } from "../_types";

type UserRow = { id: number; name: string; email: string; role: string; created_at: string };

const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  admin:      { label: "Administrador", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", icon: "👑" },
  balcao:     { label: "Balcão / Caixa", color: "#3b82f6", bg: "rgba(59,130,246,0.15)", icon: "🛎️" },
  cozinha:    { label: "Cozinha",        color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  icon: "👨‍🍳" },
  entregador: { label: "Entregador",     color: "#10b981", bg: "rgba(16,185,129,0.15)", icon: "🛵" },
};

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<"store" | "users">("store");
  const [savedAnim, setSavedAnim] = useState(false);

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("balcao");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { fetchSettings(); fetchUsers(); }, []);

  // Helper: adiciona o token de sessão ao header Authorization
  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("2type-token") : null;
    return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/settings", { headers: getAuthHeaders() });
      const data = await res.json() as Record<string, string>;
      setSettings(data);
    } catch (e) { console.error(e); }
    setLoadingSettings(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users", { headers: getAuthHeaders() });
      const data = await res.json() as UserRow[];
      setUsers(data);
    } catch (e) { console.error(e); }
    setLoadingUsers(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      setSavedAnim(true);
      setTimeout(() => setSavedAnim(false), 2200);
    } catch (e) { alert("Erro ao salvar."); }
    setSavingSettings(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole }),
      });
      if (res.ok) {
        setShowNewUser(false);
        setNewUserName(""); setNewUserEmail(""); setNewUserPassword("");
        fetchUsers();
      }
    } catch (e) { alert("Erro ao criar usuário."); }
    setCreatingUser(false);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Remover este usuário?")) return;
    setDeletingId(id);
    try {
      const headers = getAuthHeaders();
      await fetch(`/api/users?id=${id}`, { method: "DELETE", headers });
      fetchUsers();
    } catch (e) { alert("Erro ao remover usuário."); }
    setDeletingId(null);
  };

  const updateSetting = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <>
      <style>{`
        @keyframes sv-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sv-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        @keyframes sv-shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
        @keyframes sv-saved {
          0%   { opacity: 0; transform: scale(0.7) translateY(6px); }
          40%  { opacity: 1; transform: scale(1.08) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sv-row-in {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes sv-form-in {
          from { opacity: 0; transform: translateY(-10px) scaleY(0.95); }
          to   { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes sv-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .sv-wrap { padding: 40px 40px 60px; max-width: 940px; margin: 0 auto; animation: sv-fadein 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        /* ─── Page Header ─── */
        .sv-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; gap: 20px; }
        .sv-header-text h1 { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px; background: linear-gradient(135deg, var(--ink) 0%, var(--muted) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .sv-header-text p  { font-size: 14px; color: var(--muted); margin: 0; }
        .sv-header-badge { display: flex; align-items: center; gap: 6px; background: var(--purple-soft); color: var(--purple); border: 1px solid rgba(139,92,246,0.25); padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; white-space: nowrap; }

        /* ─── Tabs ─── */
        .sv-tabs { display: flex; gap: 8px; margin-bottom: 28px; padding: 6px; background: var(--forest); border: 1px solid var(--line); border-radius: 16px; width: fit-content; }
        .sv-tab { display: flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: 11px; border: none; background: transparent; color: var(--muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); user-select: none; white-space: nowrap; }
        .sv-tab:hover { color: var(--ink); background: var(--surface-hover); }
        .sv-tab.active { background: linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 100%); color: var(--purple); border: 1px solid rgba(139,92,246,0.3); box-shadow: 0 4px 20px rgba(139,92,246,0.15), inset 0 1px 0 var(--glass-08); }
        .sv-tab-icon { font-size: 16px; line-height: 1; }
        .sv-tab-count { background: var(--purple-glow); color: var(--purple); border-radius: 99px; padding: 2px 7px; font-size: 11px; font-weight: 800; }

        /* ─── Card ─── */
        .sv-card { background: var(--panel); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; }
        .sv-card-header { padding: 24px 28px 20px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 14px; }
        .sv-card-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 22px; flex-shrink: 0; }
        .sv-card-title { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
        .sv-card-desc  { font-size: 13px; color: var(--muted); margin: 0; }
        .sv-card-body  { padding: 28px; }

        /* ─── Setting Row ─── */
        .sv-setting-grid { display: grid; gap: 16px; }
        .sv-setting-row { background: var(--forest); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; transition: border-color 0.2s, box-shadow 0.2s; }
        .sv-setting-row:hover { border-color: rgba(139,92,246,0.3); }
        .sv-setting-icon { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; }
        .sv-setting-info { flex: 1; min-width: 0; }
        .sv-setting-label { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
        .sv-setting-hint  { font-size: 12px; color: var(--muted); }

        /* ─── Number Input ─── */
        .sv-number-wrap { display: flex; align-items: center; gap: 0; background: var(--canvas); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
        .sv-number-wrap:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        .sv-number-btn { width: 36px; height: 36px; display: grid; place-items: center; background: transparent; border: none; color: var(--muted); cursor: pointer; font-size: 18px; font-weight: 700; transition: color 0.15s, background 0.15s; flex-shrink: 0; }
        .sv-number-btn:hover { color: var(--purple); background: var(--surface-hover); }
        .sv-number-input { width: 56px; text-align: center; background: transparent; border: none; color: var(--ink); font-size: 15px; font-weight: 700; padding: 0; outline: none; }

        /* ─── Toggle Switch ─── */
        .sv-toggle-wrap { position: relative; width: 46px; height: 26px; flex-shrink: 0; cursor: pointer; }
        .sv-toggle-wrap input { opacity: 0; width: 0; height: 0; position: absolute; }
        .sv-toggle-track { position: absolute; inset: 0; border-radius: 99px; background: var(--line); transition: background 0.3s; border: 1px solid transparent; }
        .sv-toggle-wrap input:checked + .sv-toggle-track { background: var(--purple); border-color: var(--purple); box-shadow: 0 0 12px rgba(139,92,246,0.5); }
        .sv-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; box-shadow: 0 1px 4px var(--black-35); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .sv-toggle-wrap input:checked ~ .sv-toggle-thumb { transform: translateX(20px); }

        /* ─── Save Button ─── */
        .sv-save-btn { position: relative; display: inline-flex; align-items: center; gap: 10px; padding: 14px 32px; background: linear-gradient(135deg, var(--purple) 0%, #6d28d9 100%); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 8px 24px rgba(139,92,246,0.35); overflow: hidden; }
        .sv-save-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, var(--glass-20) 0%, transparent 60%); pointer-events: none; }
        .sv-save-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(139,92,246,0.45); }
        .sv-save-btn:active { transform: translateY(0); }
        .sv-save-btn.saved { background: linear-gradient(135deg, var(--green) 0%, #059669 100%); box-shadow: 0 8px 24px rgba(16,185,129,0.4); animation: sv-pulse-ring 0.6s ease-out; }
        .sv-save-btn.loading { pointer-events: none; opacity: 0.8; }
        .sv-spinner { width: 16px; height: 16px; border: 2px solid var(--glass-30); border-top-color: white; border-radius: 50%; animation: sv-spin 0.7s linear infinite; }
        .sv-saved-badge { animation: sv-saved 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

        /* ─── Users ─── */
        .sv-users-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
        .sv-users-count { font-size: 13px; color: var(--muted); }
        .sv-add-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--purple); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.25s; box-shadow: 0 4px 16px rgba(139,92,246,0.3); }
        .sv-add-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(139,92,246,0.4); }
        .sv-add-btn.cancel { background: var(--forest); color: var(--muted); box-shadow: none; border: 1px solid var(--line); }
        .sv-add-btn.cancel:hover { color: var(--ink); }

        /* ─── New User Form ─── */
        .sv-new-user-form { background: var(--forest); border: 1px solid rgba(139,92,246,0.25); border-radius: 16px; padding: 24px; margin-bottom: 20px; animation: sv-form-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .sv-form-title { font-size: 14px; font-weight: 700; margin: 0 0 20px; display: flex; align-items: center; gap: 8px; }
        .sv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .sv-field { display: flex; flex-direction: column; gap: 6px; }
        .sv-field label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; }
        .sv-input { background: var(--canvas); border: 1px solid var(--line); border-radius: 8px; color: var(--ink); padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
        .sv-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        .sv-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        .sv-form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
        .sv-form-cancel { background: transparent; color: var(--muted); border: 1px solid var(--line); padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .sv-form-cancel:hover { color: var(--ink); border-color: var(--muted); }
        .sv-form-submit { background: linear-gradient(135deg, var(--purple) 0%, #6d28d9 100%); color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(139,92,246,0.3); display: flex; align-items: center; gap: 8px; }
        .sv-form-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(139,92,246,0.4); }

        /* ─── User Table ─── */
        .sv-user-table { width: 100%; border-collapse: collapse; }
        .sv-user-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--line); }
        .sv-user-row { border-bottom: 1px solid var(--line); transition: background 0.15s; animation: sv-row-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .sv-user-row:last-child { border-bottom: none; }
        .sv-user-row:hover { background: var(--surface); }
        .sv-user-row td { padding: 14px; vertical-align: middle; }
        .sv-user-avatar { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
        .sv-user-info { display: flex; align-items: center; gap: 12px; }
        .sv-user-name { font-size: 14px; font-weight: 600; }
        .sv-user-email { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .sv-role-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .sv-del-btn { background: transparent; border: 1px solid transparent; color: var(--muted); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .sv-del-btn:hover { background: var(--red-soft); color: var(--red); border-color: rgba(239,68,68,0.25); }
        .sv-del-btn.deleting { opacity: 0.5; pointer-events: none; }
        .sv-empty { text-align: center; padding: 48px 20px; color: var(--muted); }
        .sv-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .sv-empty p { font-size: 14px; margin: 0; }

        /* ─── Settings footer ─── */
        .sv-store-footer { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--line); display: flex; align-items: center; gap: 16px; }
        .sv-saved-text { font-size: 13px; color: var(--green); display: flex; align-items: center; gap: 6px; }
      `}</style>

      <div className="sv-wrap">
        {/* Header */}
        <div className="sv-header">
          <div className="sv-header-text">
            <h1>Configurações</h1>
            <p>Controle total sobre a loja e os níveis de acesso do sistema.</p>
          </div>
          <div className="sv-header-badge">
            ⚙️ &nbsp;Admin Only
          </div>
        </div>

        {/* Tabs */}
        <div className="sv-tabs" role="tablist">
          <button
            id="tab-loja"
            role="tab"
            aria-selected={activeTab === "store"}
            className={`sv-tab${activeTab === "store" ? " active" : ""}`}
            onClick={() => setActiveTab("store")}
          >
            <span className="sv-tab-icon">🏪</span> Loja
          </button>
          <button
            id="tab-acessos"
            role="tab"
            aria-selected={activeTab === "users"}
            className={`sv-tab${activeTab === "users" ? " active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <span className="sv-tab-icon">👥</span> Acessos
            {users.length > 0 && <span className="sv-tab-count">{users.length}</span>}
          </button>
        </div>

        {/* ── LOJA TAB ─────────────────────────────── */}
        {activeTab === "store" && (
          <div className="sv-card">
            <div className="sv-card-header">
              <div className="sv-card-icon" style={{ background: "rgba(139,92,246,0.12)" }}>🏪</div>
              <div>
                <p className="sv-card-title">Parâmetros da Loja</p>
                <p className="sv-card-desc">Configure as regras operacionais do seu estabelecimento.</p>
              </div>
            </div>
            <div className="sv-card-body">
              {loadingSettings ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "20px 0", color: "var(--muted)" }}>
                  <div className="sv-spinner" style={{ borderTopColor: "var(--purple)", borderColor: "var(--line)" }} />
                  Carregando configurações...
                </div>
              ) : (
                <div className="sv-setting-grid">

                  {/* Mesas */}
                  <div className="sv-setting-row">
                    <div className="sv-setting-icon" style={{ background: "rgba(59,130,246,0.12)" }}>🪑</div>
                    <div className="sv-setting-info">
                      <div className="sv-setting-label">Quantidade de Mesas</div>
                      <div className="sv-setting-hint">Total de mesas disponíveis no salão.</div>
                    </div>
                    <div className="sv-number-wrap">
                      <button className="sv-number-btn" aria-label="Diminuir"
                        onClick={() => updateSetting("num_tables", String(Math.max(1, parseInt(settings.num_tables || "20") - 1)))}>−</button>
                      <input className="sv-number-input" type="number" min={1} max={200}
                        value={settings.num_tables ?? "20"}
                        onChange={(e) => updateSetting("num_tables", e.target.value)} />
                      <button className="sv-number-btn" aria-label="Aumentar"
                        onClick={() => updateSetting("num_tables", String(Math.min(200, parseInt(settings.num_tables || "20") + 1)))}>+</button>
                    </div>
                  </div>

                  {/* Entregas */}
                  <div className="sv-setting-row">
                    <div className="sv-setting-icon" style={{ background: "rgba(16,185,129,0.12)" }}>🛵</div>
                    <div className="sv-setting-info">
                      <div className="sv-setting-label">Módulo de Entregas</div>
                      <div className="sv-setting-hint">Ativa o controle de delivery e rastreamento de entregadores.</div>
                    </div>
                    <label className="sv-toggle-wrap" aria-label="Ativar entregas">
                      <input type="checkbox"
                        checked={settings.delivery_active === "true"}
                        onChange={(e) => updateSetting("delivery_active", e.target.checked ? "true" : "false")} />
                      <div className="sv-toggle-track" />
                      <div className="sv-toggle-thumb" />
                    </label>
                  </div>

                  {/* Taxa de Serviço */}
                  <div className="sv-setting-row">
                    <div className="sv-setting-icon" style={{ background: "rgba(245,158,11,0.12)" }}>💳</div>
                    <div className="sv-setting-info">
                      <div className="sv-setting-label">Taxa de Serviço (10%)</div>
                      <div className="sv-setting-hint">Adiciona automaticamente 10% ao total dos pedidos.</div>
                    </div>
                    <label className="sv-toggle-wrap" aria-label="Cobrar taxa de serviço">
                      <input type="checkbox"
                        checked={settings.service_fee_active === "true"}
                        onChange={(e) => updateSetting("service_fee_active", e.target.checked ? "true" : "false")} />
                      <div className="sv-toggle-track" />
                      <div className="sv-toggle-thumb" />
                    </label>
                  </div>

                </div>
              )}

              <div className="sv-store-footer">
                <button
                  id="btn-salvar-config"
                  className={`sv-save-btn${savingSettings ? " loading" : ""}${savedAnim ? " saved" : ""}`}
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings
                    ? <><div className="sv-spinner" /> Salvando...</>
                    : savedAnim
                    ? <span className="sv-saved-badge">✅ Salvo!</span>
                    : <>💾 Salvar Configurações</>}
                </button>
                {savedAnim && (
                  <div className="sv-saved-text sv-saved-badge">
                    <span>✔</span> Configurações aplicadas com sucesso!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ACESSOS TAB ──────────────────────────── */}
        {activeTab === "users" && (
          <div className="sv-card">
            <div className="sv-card-header">
              <div className="sv-card-icon" style={{ background: "rgba(16,185,129,0.12)" }}>👥</div>
              <div>
                <p className="sv-card-title">Gerenciar Acessos</p>
                <p className="sv-card-desc">Crie, edite e remova usuários. Controle quem vê o quê.</p>
              </div>
            </div>
            <div className="sv-card-body">
              <div className="sv-users-toolbar">
                <p className="sv-users-count">
                  {loadingUsers ? "Carregando..." : `${users.length} usuário${users.length !== 1 ? "s" : ""} cadastrado${users.length !== 1 ? "s" : ""}`}
                </p>
                <button
                  id="btn-novo-usuario"
                  className={`sv-add-btn${showNewUser ? " cancel" : ""}`}
                  onClick={() => setShowNewUser(v => !v)}
                >
                  {showNewUser ? "✕ Cancelar" : "+ Novo Usuário"}
                </button>
              </div>

              {showNewUser && (
                <form ref={formRef} className="sv-new-user-form" onSubmit={handleCreateUser}>
                  <div className="sv-form-title">
                    <span>✨</span> Novo Usuário
                  </div>
                  <div className="sv-form-grid">
                    <div className="sv-field">
                      <label>Nome completo</label>
                      <input required className="sv-input" type="text" placeholder="Ex: João Silva"
                        value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                    </div>
                    <div className="sv-field">
                      <label>E-mail</label>
                      <input required className="sv-input" type="email" placeholder="joao@loja.com"
                        value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                    </div>
                    <div className="sv-field">
                      <label>Senha de acesso</label>
                      <input required className="sv-input" type="text" placeholder="Defina uma senha"
                        value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                    </div>
                    <div className="sv-field">
                      <label>Nível de Acesso</label>
                      <select className="sv-input sv-select" value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as AppRole)}>
                        {Object.entries(ROLE_META).map(([k, v]) => (
                          <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="sv-form-actions">
                    <button type="button" className="sv-form-cancel" onClick={() => setShowNewUser(false)}>Cancelar</button>
                    <button type="submit" className="sv-form-submit" disabled={creatingUser}>
                      {creatingUser ? <><div className="sv-spinner" style={{ width: 14, height: 14 }} /> Criando...</> : "✓ Criar Usuário"}
                    </button>
                  </div>
                </form>
              )}

              {loadingUsers ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "20px 0", color: "var(--muted)" }}>
                  <div className="sv-spinner" style={{ borderTopColor: "var(--purple)", borderColor: "var(--line)" }} />
                  Carregando usuários...
                </div>
              ) : users.length === 0 ? (
                <div className="sv-empty">
                  <div className="sv-empty-icon">🔐</div>
                  <p>Nenhum usuário no banco de dados.</p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>Clique em <strong>+ Novo Usuário</strong> para começar.</p>
                </div>
              ) : (
                <table className="sv-user-table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Nível</th>
                      <th style={{ textAlign: "right" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const meta = ROLE_META[u.role] ?? { label: u.role, color: "var(--muted)", bg: "var(--surface)", icon: "👤" };
                      return (
                        <tr key={u.id} className="sv-user-row" style={{ animationDelay: `${i * 50}ms` }}>
                          <td>
                            <div className="sv-user-info">
                              <div className="sv-user-avatar" style={{ background: meta.bg, color: meta.color }}>
                                {meta.icon}
                              </div>
                              <div>
                                <div className="sv-user-name">{u.name}</div>
                                <div className="sv-user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="sv-role-badge" style={{ background: meta.bg, color: meta.color }}>
                              {meta.icon} {meta.label}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className={`sv-del-btn${deletingId === u.id ? " deleting" : ""}`}
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              {deletingId === u.id
                                ? <><div className="sv-spinner" style={{ width: 12, height: 12, borderTopColor: "var(--red)", borderColor: "var(--line)" }} /> Removendo</>
                                : <>🗑 Remover</>}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
