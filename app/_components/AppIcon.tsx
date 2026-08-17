"use client";

export function AppIcon({ name }: { name: string }) {
  switch (name) {
    case "visao-geral": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18V10M10 18V6M16 18v-4M22 18V3" /><path d="M3 21h20" /><path d="M4 10l6-4 6 8 6-11" /></svg>;
    case "pedidos": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 3.5h6M8 9h8M8 13h5M8 17h7" /></svg>;
    case "whatsapp": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4a8 8 0 0 0-7 11.8L4 20l4.4-1.1A8 8 0 1 0 12 4Z" /><path d="M9.1 8.6c.6 2.6 2.7 4.7 5.3 5.4l1.2-1.2M9.1 8.6 8 9.7" /></svg>;
    case "salao": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="6" height="5" rx="1.5" /><rect x="14" y="5" width="6" height="5" rx="1.5" /><rect x="4" y="14" width="6" height="5" rx="1.5" /><rect x="14" y="14" width="6" height="5" rx="1.5" /></svg>;
    case "cardapio": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>;
    case "entregas": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v10H3z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
    case "crm": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="7" r="2.5" /><path d="M3 20c.5-4 2.6-6 5-6s4.5 2 5 6" /><path d="M14 13c3.5 0 5.5 2 6 5" /></svg>;
    case "relatorios": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V5M16 20v-8M22 20V3" /><path d="M3 20h20" /></svg>;
    case "integracoes": return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="8" height="8" rx="2" ry="2" /><rect x="14" y="2" width="8" height="8" rx="2" ry="2" /><path d="M6 14V6h8" /></svg>;
    default: return <span>{name}</span>;
  }
}

export function Icon({ children, name }: { children?: string; name?: string }) {
  return (
    <span className="icon-box" aria-hidden="true">
      <AppIcon name={children || name || ""} />
    </span>
  );
}
