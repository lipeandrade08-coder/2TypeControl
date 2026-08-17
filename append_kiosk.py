with open('app/globals.css', 'r') as f:
    css = f.read()

if ".full-kiosk" not in css:
    css += "\n.main-content.no-sidebar.full-kiosk { margin-left: 0; padding: 0; height: 100vh; overflow: hidden; }\n"
    css += ".main-content.no-sidebar.full-kiosk .page-content { padding: 10px; height: 100%; overflow-y: auto; }\n"
    with open('app/globals.css', 'w') as f:
        f.write(css)

