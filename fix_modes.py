with open('app/restaurant-dashboard.tsx', 'r') as f:
    content = f.read()

# Replace if (kdsMode) with if (role === "cozinha" || kdsMode)
if "if (kdsMode) {" in content:
    content = content.replace("if (kdsMode) {", "if (role === \"cozinha\" || kdsMode) {")

# Replace onExit={() => setKdsMode(false)} with onExit={() => role === "cozinha" ? (window.location.href="/") : setKdsMode(false)}
if "onExit={() => setKdsMode(false)}" in content:
    content = content.replace("onExit={() => setKdsMode(false)}", "onExit={() => role === \"cozinha\" ? (window.location.href=\"/\") : setKdsMode(false)}")


# Replace if (waiterMode) with if (role === "garcom" || waiterMode)
if "if (waiterMode) {" in content:
    content = content.replace("if (waiterMode) {", "if (role === \"garcom\" || waiterMode) {")

# Replace onExit={() => setWaiterMode(false)} with onExit={() => role === "garcom" ? (window.location.href=\"/\") : setWaiterMode(false)}
if "onExit={() => setWaiterMode(false)}" in content:
    content = content.replace("onExit={() => setWaiterMode(false)}", "onExit={() => role === \"garcom\" ? (window.location.href=\"/\") : setWaiterMode(false)}")

with open('app/restaurant-dashboard.tsx', 'w') as f:
    f.write(content)

print("Fixed modes")
