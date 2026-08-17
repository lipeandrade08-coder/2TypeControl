"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay for nice motion effect
    setTimeout(() => {
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
        setLoading(false);
      }
    }, 600);
  };

  const quickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-bg {
          min-height: 100vh;
          background: #050507;
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: 20px;
        }
        .blob-1 {
          position: absolute;
          top: -10%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
          border-radius: 50%;
          animation: blob 15s infinite alternate;
          pointer-events: none;
        }
        .blob-2 {
          position: absolute;
          bottom: -20%; right: -10%;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          animation: blob 20s infinite alternate-reverse;
          pointer-events: none;
        }
        .blob-3 {
          position: absolute;
          top: 30%; left: 40%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: blob 18s infinite alternate;
          pointer-events: none;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          padding: 48px 40px;
          position: relative;
          z-index: 10;
          animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glass-input {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          background: rgba(0, 0, 0, 0.4);
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3), inset 0 0 8px rgba(139, 92, 246, 0.1);
          outline: none;
        }
        .glass-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .demo-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 1;
        }
        
        /* Subtle inner gradient */
        .demo-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: -1;
        }

        /* Sweeping light effect */
        .demo-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -150%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transform: skewX(-20deg);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: -1;
        }

        .demo-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(139, 92, 246, 0.4);
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.25),
                      0 0 12px 0 rgba(139, 92, 246, 0.1) inset;
        }
        
        .demo-btn:hover::before {
          left: 150%;
        }

        .demo-btn:hover::after {
          opacity: 1;
        }

        .primary-button-login {
          width: 100%;
          height: 52px;
          font-size: 15px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(76, 29, 149, 0.8) 100%);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4), inset 0 0 10px rgba(139, 92, 246, 0.2);
          z-index: 1;
        }

        .primary-button-login::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-20deg);
          transition: all 0.6s ease;
          z-index: -1;
        }

        .primary-button-login:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(76, 29, 149, 1) 100%);
          box-shadow: 0 15px 30px -5px rgba(139, 92, 246, 0.6), inset 0 0 15px rgba(139, 92, 246, 0.4);
          transform: translateY(-2px);
          border-color: rgba(167, 139, 250, 0.6);
        }

        .primary-button-login:hover::before {
          left: 150%;
        }
        
        .logo-container {
          animation: float 6s ease-in-out infinite;
        }
      `}} />

      <div className="login-bg">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />

        <div style={{ width: "100%", maxWidth: "440px", zIndex: 10 }}>
          
          <div className="logo-container" style={{ textAlign: "center", marginBottom: "40px" }}>
            <img 
              src="/logopng.png" 
              alt="2Type Control Logo" 
              style={{ width: "180px", margin: "0 auto", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }} 
            />
          </div>

          <div className="glass-panel">
            <h1 style={{ fontSize: "28px", marginBottom: "8px", textAlign: "center", fontWeight: 800, letterSpacing: "-0.5px", background: "linear-gradient(to right, #fff, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Acesso ao Sistema
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", textAlign: "center", marginBottom: "36px" }}>
              Entre com suas credenciais corporativas.
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>E-mail corporativo</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="modal-input glass-input" 
                  placeholder="admin@2type.com" 
                  required 
                  style={{ height: "52px", fontSize: "15px" }}
                />
              </div>
              
              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Senha de acesso</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="modal-input glass-input" 
                  placeholder="••••••••" 
                  required 
                  style={{ height: "52px", fontSize: "15px" }}
                />
              </div>

              {error && (
                <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", fontSize: "13px", marginBottom: "24px", textAlign: "center", fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="primary-button-login" 
                style={{ 
                  opacity: loading ? 0.7 : 1,
                  transform: loading ? "scale(0.98)" : "translateY(0)"
                }}
                disabled={loading}
              >
                {loading ? "Autenticando..." : "Entrar na Operação"}
              </button>
            </form>
          </div>

          <div style={{ marginTop: "40px", animation: "fadeSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards", animationDelay: "0.2s", opacity: 0 }}>
            <p style={{ textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 800 }}>
              Acessos de Demonstração
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button type="button" onClick={() => quickLogin("admin@2type.com", "admin123")} className="demo-btn" style={{ padding: "12px", fontSize: "12px", cursor: "pointer" }}>👑 Administrador</button>
              <button type="button" onClick={() => quickLogin("balcao@2type.com", "balcao123")} className="demo-btn" style={{ padding: "12px", fontSize: "12px", cursor: "pointer" }}>🛎️ Balcão / Caixa</button>
              <button type="button" onClick={() => quickLogin("garcom@2type.com", "garcom123")} className="demo-btn" style={{ padding: "12px", fontSize: "12px", cursor: "pointer" }}>📱 Garçom</button>
              <button type="button" onClick={() => quickLogin("cozinha@2type.com", "cozinha123")} className="demo-btn" style={{ padding: "12px", fontSize: "12px", cursor: "pointer" }}>🍳 Cozinha</button>
              <button type="button" onClick={() => quickLogin("entregador@2type.com", "entregador123")} className="demo-btn" style={{ padding: "12px", fontSize: "12px", cursor: "pointer", gridColumn: "span 2" }}>🛵 Entregador</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
