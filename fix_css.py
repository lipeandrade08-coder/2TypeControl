import re

with open('app/globals.css', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i < 150: # Don't touch the top part which we already curated
        new_lines.append(line)
        continue
    
    # Backgrounds
    line = line.replace('background: white;', 'background: var(--panel);')
    line = re.sub(r'background: #[fFeE][0-9a-fA-F]{5};', 'background: rgba(255,255,255,0.03);', line)
    line = re.sub(r'background: rgba\(255, *255, *255, *0\.[34568]\);', 'background: rgba(255, 255, 255, 0.05);', line)
    
    # Borders
    line = re.sub(r'border(-[a-z]+)?: 1px solid #[a-fA-F0-9]{6};', r'border\1: 1px solid var(--line);', line)
    
    # Text colors
    line = re.sub(r'color: #[789aA][0-9a-fA-F]{5};', 'color: var(--muted);', line)
    line = re.sub(r'color: var\(--ink\);', 'color: white;', line)
    
    new_lines.append(line)

with open('app/globals.css', 'w') as f:
    f.writelines(new_lines)
