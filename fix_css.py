import re

with open('app/globals.css', 'r') as f:
    css = f.read()

# Replace font variable
css = css.replace('--font-geist-sans', '--font-outfit')

# Add surface variables to :root
root_pattern = re.compile(r'(:root\s*\{[^}]+)(--red-soft:\s*#2e151b;)([^}]+)\}')
def root_repl(m):
    return m.group(1) + m.group(2) + '\n  --surface: rgba(255, 255, 255, 0.04);\n  --surface-hover: rgba(255, 255, 255, 0.08);' + m.group(3) + '}'
css = root_pattern.sub(root_repl, css)

# Add surface variables to :root[data-theme="light"]
light_root_pattern = re.compile(r'(:root\[data-theme="light"\]\s*\{[^}]+)(--red-soft:\s*#ffe4e6;)([^}]+)\}')
def light_root_repl(m):
    return m.group(1) + m.group(2) + '\n  --surface: rgba(0, 0, 0, 0.03);\n  --surface-hover: rgba(0, 0, 0, 0.06);' + m.group(3) + '}'
css = light_root_pattern.sub(light_root_repl, css)

# Replace all hardcoded transparent whites with surface vars
# restaurant-switch, nav-item:hover, address-card, suggestion, etc.
css = css.replace('rgba(255,255,255,.03)', 'var(--surface)')
css = css.replace('rgba(255,255,255,0.03)', 'var(--surface)')
css = css.replace('rgba(255, 255, 255, 0.03)', 'var(--surface)')

css = css.replace('rgba(255,255,255,.05)', 'var(--surface)')
css = css.replace('rgba(255,255,255,0.05)', 'var(--surface)')

css = css.replace('rgba(255,255,255,.06)', 'var(--surface-hover)')
css = css.replace('rgba(255,255,255,0.06)', 'var(--surface-hover)')

# Also in globals.css, the modal backdrop:
# .modal-backdrop { background: rgba(13,28,22,.55); ... } 
# Let's make it adapt to light mode
css = css.replace('rgba(13,28,22,.55)', 'var(--backdrop)')
# Let's add --backdrop to :root and light
css = css.replace('--surface-hover: rgba(255, 255, 255, 0.08);', '--surface-hover: rgba(255, 255, 255, 0.08);\n  --backdrop: rgba(13, 28, 22, 0.55);')
css = css.replace('--surface-hover: rgba(0, 0, 0, 0.06);', '--surface-hover: rgba(0, 0, 0, 0.06);\n  --backdrop: rgba(255, 255, 255, 0.4);')

with open('app/globals.css', 'w') as f:
    f.write(css)

print("CSS Fixed")
