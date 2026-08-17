import re

with open('app/restaurant-dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add Role type
role_type = """
export type AppRole = "admin" | "balcao" | "garcom" | "cozinha";
"""

if "export type AppRole" not in content:
    content = content.replace('type View =', role_type + '\ntype View =')

# 2. Add prop to RestaurantDashboard
content = content.replace('export function RestaurantDashboard() {', 'export function RestaurantDashboard({ role = "admin" }: { role?: AppRole }) {')

# 3. Filter navigation inside component
nav_const_replacement = """
  // Navigation filtered by role
  const filteredNavigation = useMemo(() => {
    if (role === "admin") return navigation;
    if (role === "balcao") return navigation.filter(n => ["Visão geral", "Pedidos", "WhatsApp", "Salão", "Entregas"].includes(n.label));
    if (role === "garcom") return navigation.filter(n => ["Salão", "Cardápio"].includes(n.label));
    if (role === "cozinha") return navigation.filter(n => ["Pedidos", "Cardápio"].includes(n.label));
    return navigation;
  }, [role]);

  // Default view based on role
  const defaultView = useMemo(() => {
    if (role === "garcom") return "Salão";
    if (role === "cozinha") return "Pedidos";
    return "Visão geral";
  }, [role]);

  const [activeView, setActiveView] = useState<View>(defaultView);
"""

# Replace the useState for activeView
if "const [activeView, setActiveView] = useState<View>(" in content:
    content = re.sub(r'const \[activeView, setActiveView\] = useState<View>\(.*?\);', nav_const_replacement, content, count=1)

# Replace navigation.map with filteredNavigation.map
content = content.replace('navigation.map((item, idx)', 'filteredNavigation.map((item, idx)')

# 4. Hide sidebar for garcom and cozinha
sidebar_hidden_logic = """
      {!(role === "garcom" || role === "cozinha") && (
        <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
"""
# Find the start of the aside and wrap it
if '<aside className={`sidebar' in content and '{!(role === "garcom"' not in content:
    content = content.replace('<aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>', sidebar_hidden_logic)
    content = content.replace('</aside>', '</aside>\n      )}')

# 5. Add a class to main-content to remove margin if sidebar is hidden
content = content.replace('<main className="main-content">', '<main className={`main-content ${(role === "garcom" || role === "cozinha") ? "no-sidebar" : ""}`}>')

# 6. Change User Card based on role
content = content.replace('<span><strong>Rafael Santos</strong><small>Administrador</small></span>', 
                          '<span><strong>{role === "admin" ? "Rafael Santos" : role === "balcao" ? "Caixa Central" : role === "garcom" ? "Garçom" : "Cozinha"}</strong><small>{role === "admin" ? "Administrador" : role === "balcao" ? "Balconista" : role === "garcom" ? "Atendimento" : "Produção"}</small></span>')

with open('app/restaurant-dashboard.tsx', 'w') as f:
    f.write(content)

print("Dashboard refactored for roles")
