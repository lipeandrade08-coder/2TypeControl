import re

with open('app/globals.css', 'r') as f:
    css = f.read()

integration_css = """
/* Integration Card */
.integration-card {
  width: 100%;
  display: grid;
  grid-template-columns: 32px 1fr;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--purple-soft);
  border: 1px solid var(--purple-glow);
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.integration-card:hover {
  background: rgba(110, 48, 235, 0.15);
  border-color: rgba(110, 48, 235, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--purple-glow);
}
.integration-icon {
  width: 32px;
  height: 32px;
  background: var(--purple);
  color: white;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 2px 8px var(--purple-glow);
}
.integration-card span:nth-child(2) strong {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}
.integration-card span:nth-child(2) small {
  display: block;
  font-size: 10px;
  color: var(--muted);
  margin-top: 2px;
}
.integration-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0,0,0,0.1);
}
.integration-progress i {
  display: block;
  height: 100%;
  width: 75%; /* 3 out of 4 */
  background: linear-gradient(90deg, var(--purple), #b388ff);
  border-radius: 0 2px 2px 0;
}
"""

css += integration_css

with open('app/globals.css', 'w') as f:
    f.write(css)

print("Integration card CSS appended")
