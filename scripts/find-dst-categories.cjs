const fs = require('fs');

const files = fs.readdirSync('public/images/dst');

console.log('Burj Khalifa specific:');
console.log(files.filter(f => f.includes('burj-khalifa') || f.includes('view-at-the-top')));

console.log('Museum of the Future specific:');
console.log(files.filter(f => f.includes('museum-of-the-future')));

console.log('Aya Universe:');
console.log(files.filter(f => f.includes('aya-universe')));

console.log('Ski Dubai:');
console.log(files.filter(f => f.includes('ski-dubai')));

console.log('Sky View Glass Slide:');
console.log(files.filter(f => f.includes('sky-view')));

console.log('Miracle Garden:');
console.log(files.filter(f => f.includes('miracle-garden')));

console.log('Global Village:');
console.log(files.filter(f => f.includes('global-village')));

console.log('Sky Dive:');
console.log(files.filter(f => f.includes('sky-dive')));
