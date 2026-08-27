const fs = require('fs');
const path = require('path');

const testImages = [
  '/images/dst/view-at-the-top-burj-khalifa-at-the-top-1.webp',
  '/images/dst/desert-safari-luxury-red-dunes-evening-desert-safari-at-arabian-heritage-desert-camp-drummer-shows.jpg',
  '/images/dst/lotus-royale-dhow-cruise-lotusroyalenewyearsevemegayachttripindubai.jpg',
  '/images/dst/museum-of-the-future-museum-of-the-future-dubai.webp',
  '/images/dst/ain-dubai-ain-dubai-the-worlds-largest-observation-wheel-1-scaled.jpeg',
  '/images/dst/ferrari-world-lead-ferrari-world-yas-island-abu-dhabi-2.jpg',
  '/images/dst/atlantis-aqua-water-park-aquaventure-waterpark-at-atlantis-the-palm.webp',
  '/images/dst/fountain-show-lake-ride-dubai-fountain-lake-ride-is-it-worth-it-best-viewing-spots-prices-1200x900.webp',
  '/images/dst/view-at-the-top-burj-khalifa-burjkhalifa-9c1aa166-bef6-4229-9f0c-ac043044e605.webp',
  '/images/dst/view-at-the-top-burj-khalifa-at-the-top-burj-khalifa-the-lounge-5-1024x768.jpg',
  '/images/dst/view-at-the-top-burj-khalifa-burj-foot-shot-original-print2-1-2000x1335.jpg',
];

let allExist = true;
testImages.forEach(img => {
  const full = path.join('public', img.replace(/^\//, ''));
  const exists = fs.existsSync(full);
  console.log(`${img} -> ${exists ? 'EXISTS' : 'FAILED'}`);
  if (!exists) allExist = false;
});

console.log('All exist:', allExist);
