const fs = require('fs');
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

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace rgba(255,255,255,0.xx) and rgba(255,255,255,.xx)
  content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.(\d+)\s*\)/g, (match, p1) => {
    let opacity = p1.length === 1 ? p1 + '0' : p1;
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
    console.log('Fixed rgba in', file);
  }
}
