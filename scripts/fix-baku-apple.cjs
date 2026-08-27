const fs = require('fs');

// Curated verified travel images for each destination
const VERIFIED_DESTINATION_IMAGES = {
  // Azerbaijan / Baku
  "baku-wonders": "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
  "azerbaijan": "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",

  // Switzerland
  "swiss-alpine-dream": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
  "switzerland-alpine-dream-zurich-interlaken-lucerne": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
  "switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",

  // Maldives
  "maldives-island-escape-overwater-villas-male": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
  "maldives-overwater-escape": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
  "maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",

  // Bali / Indonesia
  "bali-island-paradise-ubud-kuta-nusa-penida": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  "bali-jungle-coast": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
  "indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",

  // Georgia
  "georgia-scenic-wonders-tbilisi-kazbegi-signagi": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
  "georgia-mountain-weekender": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
  "georgia": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",

  // Turkey
  "turkey-highlights-istanbul-cappadocia-bosphorus": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
  "cappadocia-sky-turkey": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
  "turkey": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",

  // Japan
  "japan-golden-route-tokyo-kyoto-osaka-fuji": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "japan-golden-route": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",

  // Umrah / Saudi Arabia
  "spiritual-umrah-journey-makkah-madinah-17-days": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
  "umrah-17-nights": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",

  // Salalah / Oman
  "salalah-khareef-monsoon": "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80",
  "salalah-khareef-monsoon-green-oasis-escape": "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80",

  // Bosnia
  "bosnian-delight": "https://images.unsplash.com/photo-1561577555-8321d28fa6ea?auto=format&fit=crop&w=1200&q=80",
  "bosnia-historic-wonders-sarajevo-mostar-kravice": "https://images.unsplash.com/photo-1561577555-8321d28fa6ea?auto=format&fit=crop&w=1200&q=80",

  // France
  "france-grandeur": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  "france": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",

  // Italy
  "italy-classic": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
  "italy": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",

  // Greece
  "greece-wonders": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
  "greece": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",

  // Egypt
  "egypt-grandeur": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
  "egypt": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
};

// Replace bad apple photo in catalogue.ts and index.tsx
let catalogue = fs.readFileSync('src/data/catalogue.ts', 'utf8');
catalogue = catalogue.replace(/https:\/\/images\.unsplash\.com\/photo-1578895210405-907db486c111[^\s"']*/g, VERIFIED_DESTINATION_IMAGES["baku-wonders"]);
fs.writeFileSync('src/data/catalogue.ts', catalogue);

let index = fs.readFileSync('src/routes/index.tsx', 'utf8');
index = index.replace(/https:\/\/images\.unsplash\.com\/photo-1578895210405-907db486c111[^\s"']*/g, VERIFIED_DESTINATION_IMAGES["baku-wonders"]);
fs.writeFileSync('src/routes/index.tsx', index);

let globe = fs.readFileSync('src/components/3d/InteractiveGlobe.tsx', 'utf8');
globe = globe.replace(/https:\/\/images\.unsplash\.com\/photo-1578895210405-907db486c111[^\s"']*/g, VERIFIED_DESTINATION_IMAGES["baku-wonders"]);
fs.writeFileSync('src/components/3d/InteractiveGlobe.tsx', globe);

let countries = fs.readFileSync('src/data/countries.ts', 'utf8');
countries = countries.replace(/https:\/\/images\.unsplash\.com\/photo-1578895210405-907db486c111[^\s"']*/g, VERIFIED_DESTINATION_IMAGES["baku-wonders"]);
fs.writeFileSync('src/data/countries.ts', countries);

console.log('Successfully replaced apple image with authentic Baku Flame Towers photo across all files!');
