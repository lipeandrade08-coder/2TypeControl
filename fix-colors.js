const fs = require('fs');
const glob = require('glob'); // Not available by default, use fs.readdirSync recursively
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.css') || file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app');

// We will introduce CSS variables for opacities
// rgba(255,255,255, 0.x) -> var(--white-x)
// #fff or white -> var(--ink) (where appropriate, but wait: color: white is better mapped to var(--ink), except for explicit buttons.
// Let's just do rgba(255, 255, 255, x) -> var(--glass-x)
// rgba(255,255,255,.x) -> var(--glass-x)

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace rgba(255,255,255,0.xx) and rgba(255,255,255,.xx)
  content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.(\d+)\s*\)/g, (match, p1) => {
    // p1 could be '03', '5', '05', etc.
    let opacity = p1.length === 1 ? p1 + '0' : p1; // .5 -> 50, .05 -> 05
    if (opacity.length > 2) opacity = opacity.substring(0,2);
    return `var(--glass-${opacity})`;
  });

  // Replace rgba(0,0,0,0.xx)
  content = content.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\.(\d+)\s*\)/g, (match, p1) => {
    let opacity = p1.length === 1 ? p1 + '0' : p1; 
    if (opacity.length > 2) opacity = opacity.substring(0,2);
    return `var(--black-${opacity})`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}
