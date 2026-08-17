with open('app/globals.css', 'r') as f:
    css = f.read()

if ".no-sidebar" not in css:
    css += "\n.main-content.no-sidebar { margin-left: 0; padding-top: 10px; }\n"
    with open('app/globals.css', 'w') as f:
        f.write(css)

