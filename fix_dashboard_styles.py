with open('app/restaurant-dashboard.tsx', 'r') as f:
    code = f.read()

# Replace hardcoded backgrounds
code = code.replace('"rgba(255,255,255,0.03)"', '"var(--surface)"')
code = code.replace('"rgba(255,255,255,0.04)"', '"var(--surface)"')
code = code.replace('"rgba(255,255,255,0.05)"', '"var(--surface)"')
code = code.replace('"rgba(255,255,255,0.1)"', '"var(--surface-hover)"')
code = code.replace('"rgba(255,255,255,0.2)"', '"var(--line)"')
code = code.replace('"rgba(255,255,255,0.8)"', '"var(--muted)"')
code = code.replace('"rgba(0,0,0,0.05)"', '"var(--line)"')
code = code.replace('"rgba(0,0,0,0.2)"', '"var(--surface-hover)"')

# Purple softs
code = code.replace('"rgba(139,92,246,0.05)"', '"var(--purple-soft)"')
code = code.replace('"rgba(139,92,246,0.06)"', '"var(--purple-soft)"')
code = code.replace('"rgba(139,92,246,0.08)"', '"var(--purple-soft)"')
code = code.replace('"rgba(139,92,246,0.1)"', '"var(--purple-soft)"')
code = code.replace('"rgba(139,92,246,0.15)"', '"var(--purple-soft)"')
code = code.replace('"rgba(139,92,246,0.2)"', '"var(--purple-soft)"')

# Orange softs
code = code.replace('"rgba(229,109,53,0.3)"', '"var(--orange-soft)"')

# Specific string fixing
code = code.replace("borderTop: \"1px solid rgba(0,0,0,0.05)\"", "borderTop: \"1px solid var(--line)\"")

with open('app/restaurant-dashboard.tsx', 'w') as f:
    f.write(code)

print("Dashboard inline styles fixed")
