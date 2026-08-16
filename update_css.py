import re

with open('app/globals.css', 'r') as f:
    css = f.read()

# 1. Update button transitions and hover effects
css = css.replace('button { color: inherit; }', 'button { color: inherit; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }')

# 2. Add global animation keyframes and utility classes at the bottom
animations = """
/* ===================== */
/*   2TYPE ANIMATIONS    */
/* ===================== */

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes logoGlow {
  0% { filter: drop-shadow(0 0 5px var(--purple-glow)); }
  50% { filter: drop-shadow(0 0 15px rgba(110, 48, 235, 0.5)); }
  100% { filter: drop-shadow(0 0 5px var(--purple-glow)); }
}

/* Staggered entrance for main content */
.metric-card, .panel, .table-check, .delivery-row, .checkout-list-item {
  animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.metric-card:nth-child(1) { animation-delay: 0.05s; }
.metric-card:nth-child(2) { animation-delay: 0.1s; }
.metric-card:nth-child(3) { animation-delay: 0.15s; }
.metric-card:nth-child(4) { animation-delay: 0.2s; }

.panel:nth-child(1) { animation-delay: 0.1s; }
.panel:nth-child(2) { animation-delay: 0.2s; }
.panel:nth-child(3) { animation-delay: 0.3s; }

/* Modals */
.modal-overlay, .modal-backdrop {
  animation: fadeSlideUp 0.3s ease-out both;
}
.modal-content, .fee-modal {
  animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Button & Nav Interactions */
.primary-button:hover, .ghost-button:hover, .add-item-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--purple-glow);
}
.primary-button:active, .ghost-button:active, .add-item-button:active, .nav-item:active {
  transform: translateY(1px) scale(0.98);
}
.nav-item:hover {
  transform: translateX(4px);
}

/* Main Logo Destaque */
.brand {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0 30px !important;
  transition: transform 0.3s ease;
}
.main-logo {
  width: 100%;
  max-width: 160px;
  height: auto;
  filter: drop-shadow(0 4px 12px var(--purple-glow));
  animation: logoGlow 4s infinite alternate;
  transition: transform 0.3s ease;
}
.brand:hover .main-logo {
  transform: scale(1.05);
}

/* Table map items stagger */
.floor-table {
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
"""

if "/* 2TYPE ANIMATIONS */" not in css:
    css += animations

with open('app/globals.css', 'w') as f:
    f.write(css)

print("CSS animations updated")
