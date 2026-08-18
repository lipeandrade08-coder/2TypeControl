"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./landing.css";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page force-dark">
      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="logo">
            <Image src="/2type-control-assets/logos/svg/logo-horizontal-color.svg" alt="2Type Control Logo" width={160} height={40} priority />
          </div>
          <div className="nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#ia">Inteligência Artificial</a>
            <a href="#precos">Planos</a>
          </div>
          <button className="btn-login" onClick={() => router.push("/")}>Entrar no Sistema</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-bg-logo"></div>
        <div className="glow-orb purple-orb"></div>
        <div className="glow-orb orange-orb"></div>
        
        <div className="hero-content">
          <h1 className="animate-fade-in-up delay-1">
            O primeiro sistema que <span>atende seus clientes</span> por você.
          </h1>
          <p className="hero-subtitle animate-fade-in-up delay-2">
            Automatize seu WhatsApp com IA, elimine o caos da cozinha e acompanhe seus motoboys em tempo real. Tudo em um único painel premium.
          </p>
          <div className="hero-actions animate-fade-in-up delay-3">
            <button className="btn-primary glow-effect" onClick={() => router.push("/")}>Agendar Demonstração</button>
            <button className="btn-secondary" onClick={() => document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" })}>Ver Planos</button>
          </div>
        </div>

        {/* Live UI Mockups Instead of Static Image */}
        <div className="hero-ui-art animate-fade-in-up delay-3">
          
          {/* Mock: Dashboard Metric */}
          <div className="art-card metric-art animate-float">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <span>Faturamento Hoje</span>
              <strong>R$ 4.250,00</strong>
            </div>
            <div className="metric-trend">+12.5% em relação a ontem</div>
          </div>

          {/* Mock: KDS Card (Cozinha) */}
          <div className="art-card kds-art float-delay-1">
            <div className="kds-header">
              <span className="kds-id">#1042</span>
              <span className="crm-badge risk">Atrasado</span>
            </div>
            <div className="kds-body">
              <div className="kds-item">
                <strong>1x Pizza Meio a Meio (G)</strong>
                <span className="kds-option">✓ Calabresa / Frango com Catupiry</span>
                <span className="kds-obs">⚠️ OBS: Sem cebola, bem assada</span>
              </div>
            </div>
            <div className="kds-footer">
              <button className="kds-btn">Concluir Preparo</button>
            </div>
          </div>

          {/* Mock: AI WhatsApp Chat */}
          <div className="art-card chat-art float-delay-2">
            <div className="chat-header">
              <div className="chat-avatar" style={{ background: "var(--purple)", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🤖</div>
              <div>
                <strong>Copiloto IA</strong>
                <span>Digitando...</span>
              </div>
            </div>
            <div className="chat-body">
              <div className="msg user">Olá! Qual o tempo de entrega?</div>
              <div className="msg ai typing"><span></span><span></span><span></span></div>
              <div className="msg ai final">Olá! No momento estamos com média de 40 minutos. Quer ver o nosso cardápio? 🍕</div>
            </div>
          </div>

        </div>
      </header>

      {/* App Mockup Showcase Section */}
      <section className="video-showcase-section">
        <div className="video-container animate-fade-in-up delay-3" style={{ background: "var(--panel)", display: "flex", flexDirection: "column" }}>
          <div className="video-browser-bar">
            <i></i><i></i><i></i>
          </div>
          <div style={{ flex: 1, padding: "24px", display: "flex", gap: "24px" }}>
            {/* Sidebar Mock */}
            <div style={{ width: "200px", background: "var(--surface)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ height: "24px", width: "80%", background: "var(--line)", borderRadius: "6px" }}></div>
              <div style={{ height: "16px", width: "100%", background: "var(--line)", borderRadius: "4px", marginTop: "24px" }}></div>
              <div style={{ height: "16px", width: "90%", background: "var(--line)", borderRadius: "4px" }}></div>
              <div style={{ height: "16px", width: "95%", background: "var(--line)", borderRadius: "4px" }}></div>
              <div style={{ height: "16px", width: "80%", background: "var(--purple)", borderRadius: "4px" }}></div>
            </div>
            {/* Main Content Mock */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1, height: "100px", background: "var(--surface)", borderRadius: "12px", borderTop: "3px solid var(--purple)" }}></div>
                <div style={{ flex: 1, height: "100px", background: "var(--surface)", borderRadius: "12px", borderTop: "3px solid var(--orange)" }}></div>
                <div style={{ flex: 1, height: "100px", background: "var(--surface)", borderRadius: "12px", borderTop: "3px solid var(--green)" }}></div>
              </div>
              <div style={{ flex: 1, background: "var(--surface)", borderRadius: "12px", padding: "24px" }}>
                <div style={{ height: "20px", width: "150px", background: "var(--line)", borderRadius: "4px", marginBottom: "24px" }}></div>
                <div style={{ height: "40px", width: "100%", background: "var(--line)", borderRadius: "8px", marginBottom: "12px" }}></div>
                <div style={{ height: "40px", width: "100%", background: "var(--line)", borderRadius: "8px", marginBottom: "12px" }}></div>
                <div style={{ height: "40px", width: "100%", background: "var(--line)", borderRadius: "8px" }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="social-proof-strip">
        <div className="stat-item">
          <h4>+200</h4>
          <p>Restaurantes</p>
        </div>
        <div className="stat-item">
          <h4>R$ 5M+</h4>
          <p>Processados</p>
        </div>
        <div className="stat-item">
          <h4>30%</h4>
          <p>Aumento em Vendas</p>
        </div>
        <div className="stat-item">
          <h4>0</h4>
          <p>Erros de Cozinha</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="features-section">
        <div className="section-header">
          <h2>Tudo que seu restaurante precisa</h2>
          <p>Esqueça os sistemas antigos e travados. Construímos a plataforma do futuro.</p>
        </div>

        <div className="features-grid">
          {/* Feature 1: AI */}
          <div className="feature-card glass-card hover-lift">
            <div className="feature-art ai-art">
              <div className="waveform">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div className="art-badge">🎙️ Áudio Transcrito</div>
            </div>
            <div className="feature-icon purple">🤖</div>
            <h3>WhatsApp com IA</h3>
            <p>Um atendente que não dorme, não folga e atende 50 pessoas simultaneamente sem errar pedidos.</p>
          </div>

          {/* Feature 2: KDS */}
          <div className="feature-card glass-card hover-lift delay-1">
            <div className="feature-art kds-mini-art">
              <div className="mini-ticket">
                <div className="ticket-line"></div>
                <div className="ticket-line short"></div>
              </div>
              <div className="mini-ticket done">
                <div className="ticket-line"></div>
              </div>
            </div>
            <div className="feature-icon orange">🍳</div>
            <h3>KDS (Cozinha Digital)</h3>
            <p>Diga adeus às comandas de papel. Pedidos chegam organizados por tempo de espera direto na tela da cozinha.</p>
          </div>

          {/* Feature 3: Radar */}
          <div className="feature-card glass-card hover-lift delay-2">
            <div className="feature-art radar-art">
              <div className="radar-map"></div>
              <div className="radar-ping"></div>
              <div className="art-badge green">🛵 2.4km</div>
            </div>
            <div className="feature-icon green">🛵</div>
            <h3>Radar de Entregadores</h3>
            <p>Saiba exatamente onde seus motoboys estão e calcule a taxa de entrega automaticamente.</p>
          </div>

          {/* Feature 4: Dashboard */}
          <div className="feature-card glass-card hover-lift delay-3">
            <div className="feature-art chart-art">
              <div className="bar a"></div>
              <div className="bar b"></div>
              <div className="bar c"></div>
              <div className="bar d"></div>
            </div>
            <div className="feature-icon blue">📊</div>
            <h3>Dashboard Financeiro</h3>
            <p>Fluxo de caixa, gestão de despesas e DRE gerados em tempo real com design impecável.</p>
          </div>
        </div>
      </section>

      {/* Vision Showcase (8K Photos) */}
      <section className="vision-section">
        <div className="section-header">
          <h2>Operação de Alto Nível</h2>
          <p>A tecnologia por trás das maiores redes, agora no seu delivery.</p>
        </div>
        <div className="vision-grid">
          <div className="vision-card">
            <div className="vision-img" style={{ background: "linear-gradient(135deg, var(--orange) 0%, var(--purple) 100%)", opacity: 0.15, width: "100%", height: "100%", position: "absolute" }} />
            <div className="vision-overlay">
              <h3>Controle Absoluto</h3>
              <p>Sua cozinha trabalhando em sincronia perfeita, sem erros de produção.</p>
            </div>
          </div>
          <div className="vision-card">
            <div className="vision-img" style={{ background: "linear-gradient(135deg, var(--green) 0%, var(--blue) 100%)", opacity: 0.15, width: "100%", height: "100%", position: "absolute" }} />
            <div className="vision-overlay">
              <h3>Entregas Relâmpago</h3>
              <p>Roteirização inteligente e acompanhamento em tempo real para o cliente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section (New Visual Art) */}
      <section className="integrations-section">
        <div className="section-header">
          <h2>Conectado com tudo que importa</h2>
          <p>O 2TypeControl é o cérebro central da sua operação.</p>
        </div>
        <div className="integration-art">
          <div className="hub-center glow-effect">
            <span className="logo-icon">∞</span>
          </div>
          <div className="connection-line ifood">
            <div className="dot"></div>
            <div className="hub-node">iFood</div>
          </div>
          <div className="connection-line whatsapp">
            <div className="dot"></div>
            <div className="hub-node">WhatsApp</div>
          </div>
          <div className="connection-line kitchen">
            <div className="dot"></div>
            <div className="hub-node">Cozinha</div>
          </div>
        </div>
      </section>

      {/* AI Showcase */}
      <section id="ia" className="ai-showcase-section">
        <div className="ai-split">
          <div className="ai-text">
            <h2>Não perca mais vendas nas <span>Sextas-feiras</span></h2>
            <p>O caos do final de semana não precisa mais ser um problema. A IA do 2TypeControl assume o seu WhatsApp nos momentos de pico.</p>
            <ul className="ai-benefits">
              <li><span className="check">✓</span> Interpreta áudios e pedidos complexos.</li>
              <li><span className="check">✓</span> Calcula taxa de entrega pelo endereço.</li>
              <li><span className="check">✓</span> Oferece PIX copia e cola.</li>
              <li><span className="check">✓</span> Lança direto no painel sem você digitar nada.</li>
            </ul>
          </div>
          <div className="ai-visual">
            <div className="phone-mockup glow-effect">
              <div className="phone-screen">
                <div className="chat-msg user slide-in-right">Quero uma meia calabresa meia frango, manda bem rápido por favor!</div>
                <div className="chat-msg ai typing fade-in-delayed">
                  <span></span><span></span><span></span>
                </div>
                <div className="chat-msg ai final-msg pop-in">
                  Olá! Pedido anotado 🍕. Meia Calabresa / Meia Frango. Vai precisar de refrigerante para acompanhar?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Quem usa, recomenda.</h2>
          <p>O impacto real do 2TypeControl no dia a dia dos nossos parceiros.</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card glass-card hover-lift">
            <div className="stars">★★★★★</div>
            <p>"Depois que colocamos a IA pra responder o WhatsApp nas sextas, nossas vendas aumentaram 35% e ninguém mais reclama da demora."</p>
            <div className="author">
              <div className="author-avatar" style={{ background: "var(--orange)" }}>M</div>
              <div>
                <strong>Marcos Silva</strong>
                <span>Pizzaria do Chef</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card glass-card hover-lift delay-1">
            <div className="stars">★★★★★</div>
            <p>"O KDS mudou a vida da minha cozinha. Acabou aquela gritaria e a perda de comandas de papel. Agora sai tudo no tempo exato."</p>
            <div className="author">
              <div className="author-avatar" style={{ background: "var(--purple)" }}>C</div>
              <div>
                <strong>Carla Souza</strong>
                <span>Hamburgueria BurgerHouse</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card glass-card hover-lift delay-2">
            <div className="stars">★★★★★</div>
            <p>"Saber onde estão os motoboys me poupa de ter que ligar pra eles a cada 5 minutos. O cliente acompanha em tempo real, achei fantástico."</p>
            <div className="author">
              <div className="author-avatar" style={{ background: "var(--green)" }}>R</div>
              <div>
                <strong>Roberto Alves</strong>
                <span>Delivery Express Sushi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="pricing-section">
        <div className="section-header">
          <h2>Planos Simples e Transparentes</h2>
          <p>Escolha o tamanho do poder que você quer dar ao seu negócio.</p>
        </div>

        <div className="pricing-grid">
          {/* Essencial */}
          <div className="price-card glass-card hover-lift">
            <div className="tier-name">Essencial</div>
            <div className="price">R$ 149<span>/mês</span></div>
            <p className="tier-desc">Perfeito para quem está começando e quer se organizar.</p>
            <ul className="features-list">
              <li><span className="list-icon">✦</span> PDV Completo</li>
              <li><span className="list-icon">✦</span> Gestão de Mesas e Comandas</li>
              <li><span className="list-icon">✦</span> KDS (Tela da Cozinha)</li>
              <li><span className="list-icon">✦</span> Relatórios Básicos</li>
            </ul>
            <button className="btn-price outline" onClick={() => router.push("/")}>Assinar Essencial</button>
          </div>

          {/* Profissional */}
          <div className="price-card glass-card popular hover-lift delay-1">
            <div className="popular-badge">Mais Escolhido</div>
            <div className="tier-name orange">Profissional</div>
            <div className="price">R$ 297<span>/mês</span></div>
            <p className="tier-desc">Para deliverys que não podem parar de faturar.</p>
            <ul className="features-list">
              <li><span className="list-icon orange">✦</span> <strong>Tudo do Essencial</strong></li>
              <li><span className="list-icon orange">✦</span> Integração iFood</li>
              <li><span className="list-icon orange">✦</span> Mapa de Entregadores (Radar)</li>
              <li><span className="list-icon orange">✦</span> Cardápio Digital Integrado</li>
              <li><span className="list-icon orange">✦</span> Relatórios Financeiros Avançados</li>
            </ul>
            <button className="btn-price glow-effect" onClick={() => router.push("/")}>Assinar Profissional</button>
          </div>

          {/* Futuro (IA) */}
          <div className="price-card glass-card premium hover-lift delay-2">
            <div className="tier-name purple">Futuro (com IA)</div>
            <div className="price">R$ 497<span>/mês</span></div>
            <p className="tier-desc">O poder máximo. Seu restaurante operando no piloto automático.</p>
            <ul className="features-list">
              <li><span className="list-icon purple">✦</span> <strong>Tudo do Profissional</strong></li>
              <li><span className="list-icon purple">✦</span> Atendente IA WhatsApp 24h</li>
              <li><span className="list-icon purple">✦</span> Reconhecimento de Áudio</li>
              <li><span className="list-icon purple">✦</span> Integração Bancária Automática</li>
              <li><span className="list-icon purple">✦</span> Suporte VIP Prioritário</li>
            </ul>
            <button className="btn-price outline purple" onClick={() => router.push("/")}>Assinar Futuro</button>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Perguntas Frequentes</h2>
          <p>Tire suas dúvidas antes de assinar.</p>
        </div>
        <div className="faq-list">
          <details className="faq-item glass-card">
            <summary>Integra com o iFood?</summary>
            <p>Sim! Todos os seus pedidos do iFood caem diretamente no nosso KDS da cozinha e no painel de Entregas, tudo unificado.</p>
          </details>
          <details className="faq-item glass-card">
            <summary>Como funciona a IA do WhatsApp?</summary>
            <p>Você conecta seu número de WhatsApp ao sistema. A IA lê e ouve os áudios dos clientes, responde com o cardápio e lança o pedido fechado direto na tela da cozinha e do caixa.</p>
          </details>
          <details className="faq-item glass-card">
            <summary>Preciso de equipamentos caros?</summary>
            <p>Não. O 2TypeControl roda na nuvem. Você pode usar qualquer computador, tablet ou celular com acesso à internet que você já possui no seu restaurante.</p>
          </details>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="footer-cta">
        <h2>Pronto para dobrar as vendas do seu restaurante?</h2>
        <p>Junte-se à revolução dos restaurantes inteligentes hoje mesmo.</p>
        <button className="btn-primary glow-effect large" onClick={() => router.push("/")}>Falar com um Consultor</button>
      </footer>

      {/* Floating WhatsApp */}
      <a href="#" className="floating-whatsapp glow-effect" onClick={(e) => { e.preventDefault(); router.push("/"); }}>
        Dúvidas? Fale com a gente
      </a>
    </div>
  );
}
