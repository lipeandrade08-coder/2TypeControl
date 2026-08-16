with open('app/globals.css', 'r') as f:
    css = f.read()

css = css.replace('.money-input input { min-width: 0; flex: 1; border: 0; outline: 0; text-align: right; font-size: 17px; font-weight: 800; }', 
                  '.money-input input { min-width: 0; flex: 1; border: 0; outline: 0; text-align: right; font-size: 17px; font-weight: 800; background: transparent; color: var(--ink); }')

with open('app/globals.css', 'w') as f:
    f.write(css)

print("Input CSS fixed")
