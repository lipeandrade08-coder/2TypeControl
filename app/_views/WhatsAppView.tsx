"use client";

import { useState, useRef } from "react";
import type { Conversation } from "../_types";
import { initialConversations } from "../_data/mock-data";
import { playSound } from "../_lib/utils";
import { Toggle } from "../_components/Toggle";
import { StatusBadge } from "../_components/StatusBadge";

export function WhatsAppView({
  aiEnabled,
  onToggleAi,
  onNotify,
}: {
  aiEnabled: boolean;
  onToggleAi: () => void;
  onNotify: (message: string) => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeChatId, setActiveChatId] = useState("c1");
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setConversations((current) => current.map((c) => c.id === id ? { ...c, unread: 0 } : c));
    setMessage("");
    playSound("pop");
  };

  const send = () => {
    if (!message.trim()) return;
    setConversations((current) => current.map((c) => {
      if (c.id === activeChatId) return { ...c, history: [...c.history, { side: "operator" as const, text: message.trim(), time: "agora" }] };
      return c;
    }));
    setMessage("");
    playSound("pop");
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const useSuggestion = () => {
    if (activeChat.suggestion) {
      setMessage(activeChat.suggestion);
      playSound("pop");
      onNotify("Sugestão da IA carregada. Pode editar e enviar.");
    }
  };

  return (
    <div className="page-content whatsapp-workspace">
      {/* Conversation List */}
      <section className="conversation-list panel glass-card">
        <div className="conversation-heading">
          <div>
            <h2>Conversas</h2>
            <span>{conversations.reduce((acc, c) => acc + c.unread, 0)} aguardando</span>
          </div>
          <button type="button">⌕</button>
        </div>
        {conversations.map((conversation) => (
          <button
            className={`conversation-item ${activeChatId === conversation.id ? "active" : ""}`}
            key={conversation.id}
            type="button"
            onClick={() => selectChat(conversation.id)}
          >
            <span className={`avatar ${conversation.isVip ? "coral" : ""}`}>{conversation.initials}</span>
            <span>
              <strong>{conversation.name}</strong>
              <small>{conversation.history[conversation.history.length - 1]?.text}</small>
            </span>
            <span>
              <time>{conversation.time}</time>
              {conversation.unread > 0 && <b>{conversation.unread}</b>}
            </span>
          </button>
        ))}
      </section>

      {/* Chat Panel */}
      <section className="chat-panel panel glass-card">
        <header className="chat-header">
          <span className={`avatar ${activeChat.isVip ? "coral" : ""}`}>{activeChat.initials}</span>
          <span>
            <strong>{activeChat.name}</strong>
            <small><i /> WhatsApp • cliente ativo</small>
          </span>
          <button type="button">•••</button>
        </header>
        <div className="chat-body">
          <div className="date-divider"><span>Hoje</span></div>
          {activeChat.history.map((item, index) => (
            <div key={index} className={`bubble ${item.side}`}>
              <span>{item.side === "ai" && "✦ "}{item.text}</span>
              <small>{item.time}{item.side !== "customer" && <span className="check-read">✓✓</span>}</small>
            </div>
          ))}
          {aiEnabled && activeChat.unread > 0 && (
            <div className="ai-thinking"><span>✦</span> A IA está acompanhando esta conversa</div>
          )}
          <div ref={scrollRef} />
        </div>
        <div className="composer">
          <button type="button" aria-label="Adicionar anexo" onClick={() => onNotify("Menu de anexos aberto")}>＋</button>
          <input
            aria-label={`Mensagem para ${activeChat.name}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Digite uma mensagem..."
          />
          <button className="send-button" type="button" aria-label="Enviar mensagem" onClick={send}>➜</button>
        </div>
      </section>

      {/* AI Copilot */}
      <aside className="chat-insights panel glass-card">
        <div className="insights-header">
          <span className="spark">✦</span>
          <span><strong>Copiloto IA</strong><small>Contexto da conversa</small></span>
          <Toggle enabled={aiEnabled} onToggle={onToggleAi} />
        </div>
        <div className="customer-summary">
          <span className={`avatar large ${activeChat.isVip ? "coral" : ""}`}>{activeChat.initials}</span>
          <h3>{activeChat.name}</h3>
          <p>{activeChat.isVip ? "7 pedidos • ticket médio R$ 73,40" : "1 pedido • cliente novo"}</p>
        </div>

        {activeChatId === "c1" && (
          <div className="insight-block">
            <small>PEDIDO ATUAL</small>
            <div className="linked-order">
              <span><strong>#1046</strong><small>Saiu para entrega às 10:36</small></span>
              <StatusBadge status="Saiu" />
            </div>
          </div>
        )}

        <div className="insight-block">
          <small>RESUMO DA IA</small>
          <p>{activeChat.suggestion ? "O cliente fez uma pergunta. Sugiro uma resposta educada e rápida." : "Conversa resolvida ou aguardando cliente."}</p>
        </div>

        {activeChat.suggestion && (
          <div className="insight-block">
            <small>PRÓXIMA AÇÃO</small>
            <button className="suggestion" type="button" onClick={useSuggestion}>
              <span>✦</span>
              <p>{activeChat.suggestion}</p>
              <b>Usar resposta →</b>
            </button>
          </div>
        )}

        <button className="ghost-button wide" type="button" onClick={() => onNotify("Atendimento assumido pelo operador.")}>
          Assumir atendimento
        </button>
      </aside>
    </div>
  );
}
