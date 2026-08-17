"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic demonstration credentials matching the requested roles
    if (email === "admin@2type.com" && password === "admin123") {
      router.push("/admin");
    } else if (email === "balcao@2type.com" && password === "balcao123") {
      router.push("/balcao");
    } else if (email === "garcom@2type.com" && password === "garcom123") {
      router.push("/garcom");
    } else if (email === "cozinha@2type.com" && password === "cozinha123") {
      router.push("/cozinha");
    } else if (email === "entregador@2type.com" && password === "entregador123") {
      router.push("/entregador");
    } else {
      setError("E-mail ou senha incorretos.");
    }
  };

  const quickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--canvas)", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px", animation: "fadeSlideUp 0.6s ease-out both" }}>
        
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img 
            src="/logopng.png" 
            alt="2Type Control Logo" 
            className="main-logo"
            style={{ width: "180px", margin: "0 auto" }} 
          />
        </div>

        {/* Login Box */}
        <div className="panel" style={{ padding: "40px 30px" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "8px", textAlign: "center", fontWeight: 700 }}>Acesso ao Sistema</h1>
          <p style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center", marginBottom: "32px" }}>Entre com suas credenciais para continuar.</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--muted)", marginBottom: "8px" }}>E-MAIL</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input" 
                placeholder="ex: admin@2type.com" 
                required 
              />
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--muted)", marginBottom: "8px" }}>SENHA</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modal-input" 
                placeholder="••••••••" 
                required 
              />
            </div>

            {error && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255, 23, 68, 0.1)", color: "var(--red)", fontSize: "12px", marginBottom: "24px", textAlign: "center", fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button type="submit" className="primary-button" style={{ width: "100%", height: "48px", fontSize: "15px" }}>
              Entrar na Operação
            </button>
          </form>
        </div>

        {/* Demo Helper Area */}
        <div style={{ marginTop: "32px" }}>
          <p style={{ textAlign: "center", fontSize: "11px", color: "var(--muted)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>Acessos de Demonstração</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button onClick={() => quickLogin("admin@2type.com", "admin123")} style={{ padding: "10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", color: "var(--ink)" }}>👑 Administrador</button>
            <button onClick={() => quickLogin("balcao@2type.com", "balcao123")} style={{ padding: "10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", color: "var(--ink)" }}>🛎️ Balcão / Caixa</button>
            <button onClick={() => quickLogin("garcom@2type.com", "garcom123")} style={{ padding: "10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", color: "var(--ink)" }}>📱 Garçom</button>
            <button onClick={() => quickLogin("cozinha@2type.com", "cozinha123")} style={{ padding: "10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", color: "var(--ink)" }}>🍳 Cozinha</button>
            <button onClick={() => quickLogin("entregador@2type.com", "entregador123")} style={{ padding: "10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "12px", cursor: "pointer", color: "var(--ink)", gridColumn: "span 2" }}>🛵 Entregador</button>
          </div>
        </div>

      </div>
    </div>
  );
}
