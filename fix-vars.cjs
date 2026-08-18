const fs = require('fs');

let css = fs.readFileSync('app/globals.css', 'utf8');

const darkGlass = `
  --glass-01: rgba(255, 255, 255, 0.01);
  --glass-02: rgba(255, 255, 255, 0.02);
  --glass-03: rgba(255, 255, 255, 0.03);
  --glass-04: rgba(255, 255, 255, 0.04);
  --glass-05: rgba(255, 255, 255, 0.05);
  --glass-06: rgba(255, 255, 255, 0.06);
  --glass-08: rgba(255, 255, 255, 0.08);
  --glass-10: rgba(255, 255, 255, 0.1);
  --glass-15: rgba(255, 255, 255, 0.15);
  --glass-20: rgba(255, 255, 255, 0.2);
  --glass-30: rgba(255, 255, 255, 0.3);
  --glass-40: rgba(255, 255, 255, 0.4);
  --glass-50: rgba(255, 255, 255, 0.5);
  --glass-60: rgba(255, 255, 255, 0.6);
  --glass-70: rgba(255, 255, 255, 0.7);
  --glass-75: rgba(255, 255, 255, 0.75);
  --glass-76: rgba(255, 255, 255, 0.76);
  --glass-80: rgba(255, 255, 255, 0.8);
  --glass-90: rgba(255, 255, 255, 0.9);
  --glass-100: rgba(255, 255, 255, 1);
  
  --black-01: rgba(0, 0, 0, 0.01);
  --black-02: rgba(0, 0, 0, 0.02);
  --black-03: rgba(0, 0, 0, 0.03);
  --black-04: rgba(0, 0, 0, 0.04);
  --black-05: rgba(0, 0, 0, 0.05);
  --black-06: rgba(0, 0, 0, 0.06);
  --black-08: rgba(0, 0, 0, 0.08);
  --black-10: rgba(0, 0, 0, 0.1);
  --black-15: rgba(0, 0, 0, 0.15);
  --black-20: rgba(0, 0, 0, 0.2);
  --black-22: rgba(0, 0, 0, 0.22);
  --black-24: rgba(0, 0, 0, 0.24);
  --black-30: rgba(0, 0, 0, 0.3);
  --black-40: rgba(0, 0, 0, 0.4);
  --black-50: rgba(0, 0, 0, 0.5);
  --black-60: rgba(0, 0, 0, 0.6);
  --black-70: rgba(0, 0, 0, 0.7);
  --black-80: rgba(0, 0, 0, 0.8);
  --black-90: rgba(0, 0, 0, 0.9);
  --black-100: rgba(0, 0, 0, 1);
`;

const lightGlass = `
  --glass-01: rgba(0, 0, 0, 0.01);
  --glass-02: rgba(0, 0, 0, 0.02);
  --glass-03: rgba(0, 0, 0, 0.03);
  --glass-04: rgba(0, 0, 0, 0.04);
  --glass-05: rgba(0, 0, 0, 0.05);
  --glass-06: rgba(0, 0, 0, 0.06);
  --glass-08: rgba(0, 0, 0, 0.08);
  --glass-10: rgba(0, 0, 0, 0.1);
  --glass-15: rgba(0, 0, 0, 0.15);
  --glass-20: rgba(0, 0, 0, 0.2);
  --glass-30: rgba(0, 0, 0, 0.3);
  --glass-40: rgba(0, 0, 0, 0.4);
  --glass-50: rgba(0, 0, 0, 0.5);
  --glass-60: rgba(0, 0, 0, 0.6);
  --glass-70: rgba(0, 0, 0, 0.7);
  --glass-75: rgba(0, 0, 0, 0.75);
  --glass-76: rgba(0, 0, 0, 0.76);
  --glass-80: rgba(0, 0, 0, 0.8);
  --glass-90: rgba(0, 0, 0, 0.9);
  --glass-100: rgba(0, 0, 0, 1);

  --black-01: rgba(0, 0, 0, 0.01);
  --black-02: rgba(0, 0, 0, 0.02);
  --black-03: rgba(0, 0, 0, 0.03);
  --black-04: rgba(0, 0, 0, 0.04);
  --black-05: rgba(0, 0, 0, 0.05);
  --black-06: rgba(0, 0, 0, 0.06);
  --black-08: rgba(0, 0, 0, 0.08);
  --black-10: rgba(0, 0, 0, 0.1);
  --black-15: rgba(0, 0, 0, 0.15);
  --black-20: rgba(0, 0, 0, 0.2);
  --black-22: rgba(0, 0, 0, 0.22);
  --black-24: rgba(0, 0, 0, 0.24);
  --black-30: rgba(0, 0, 0, 0.3);
  --black-40: rgba(0, 0, 0, 0.4);
  --black-50: rgba(0, 0, 0, 0.5);
  --black-60: rgba(0, 0, 0, 0.6);
  --black-70: rgba(0, 0, 0, 0.7);
  --black-80: rgba(0, 0, 0, 0.8);
  --black-90: rgba(0, 0, 0, 0.9);
  --black-100: rgba(0, 0, 0, 1);
`;

css = css.replace(/:root\s*\{([\s\S]*?)\}/, (match, inner) => {
  if (inner.includes('--glass-10')) return match; // already inserted
  return `:root {${inner}${darkGlass}}`;
});

css = css.replace(/:root\[data-theme="light"\]\s*\{([\s\S]*?)\}/, (match, inner) => {
  if (inner.includes('--glass-10')) return match; // already inserted
  return `:root[data-theme="light"] {${inner}${lightGlass}}`;
});

css = css.replace(/\.force-dark\s*\{([\s\S]*?)\}/, (match, inner) => {
  if (inner.includes('--glass-10')) return match; // already inserted
  return `.force-dark {${inner}${darkGlass}}`;
});

fs.writeFileSync('app/globals.css', css);
