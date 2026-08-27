export type CountryRegion = "Europe" | "Asia" | "Africa" | "Eurasia" | "Australia" | "America";

export type Country = {
  gallery?: string[];
  slug: string;
  name: string;
  region: CountryRegion;
  image: string;
  tagline: string;
  blurb: string;
  nights: string;
  fromAed?: number;
  highlights: string[];
  bestTime: string;
  visa: string;
  isNew?: boolean;
};

const c = (x: Country) => x;

export const countries: Country[] = [
  // Europe
  c({
    slug: "switzerland",
    gallery: [
          "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Switzerland",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    tagline: "Alps, lakes and panoramic trains",
    blurb:
      "Glacier peaks, lakeside towns and the world's most scenic rail routes — the classic first trip to Europe from Dubai.",
    nights: "6–9 nights",
    fromAed: 5499,
    highlights: [
      "Jungfraujoch — Top of Europe",
      "Lake Lucerne cruise",
      "Glacier Express",
      "Interlaken & Grindelwald"
    ],
    bestTime: "May – September",
    visa: "Schengen visa — we assist end to end",
  }),
  c({
    slug: "france",
    gallery: [
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "France",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    tagline: "Paris, Riviera and vineyard country",
    blurb:
      "Boulevards, museums and long lunches, with easy add-ons to Nice, Disneyland Paris and the Loire Valley.",
    nights: "5–8 nights",
    fromAed: 4799,
    highlights: [
      "Eiffel Tower summit",
      "Louvre & Seine cruise",
      "Disneyland Paris",
      "French Riviera day trips"
    ],
    bestTime: "April – October",
    visa: "Schengen visa — we assist end to end",
  }),
  c({
    slug: "italy",
    gallery: [
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Italy",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    tagline: "Rome, Venice and the Amalfi coast",
    blurb:
      "Ancient Rome, canal mornings in Venice and coastline that looks unreal in every photograph.",
    nights: "6–9 nights",
    fromAed: 4999,
    highlights: [
      "Colosseum & Vatican",
      "Venice gondola",
      "Florence & Tuscany",
      "Amalfi coast drive"
    ],
    bestTime: "April – June, September – October",
    visa: "Schengen visa — we assist end to end",
  }),
  c({
    slug: "united-kingdom",
    gallery: [
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "United Kingdom",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    tagline: "London, Scotland and the countryside",
    blurb: "Museums, West End nights and green hills a train ride away.",
    nights: "5–8 nights",
    fromAed: 5299,
    highlights: [
      "London Eye & Thames",
      "Warner Bros Studio Tour",
      "Edinburgh Castle",
      "Lake District"
    ],
    bestTime: "May – September",
    visa: "UK visa — full documentation support",
  }),
  c({
    slug: "finland",
    gallery: [
          "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Finland",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
    tagline: "Northern lights and glass igloos",
    blurb: "Lapland in winter: aurora hunting, husky sledding and Santa's own village.",
    nights: "4–6 nights",
    fromAed: 7499,
    highlights: [
      "Aurora borealis hunt",
      "Glass igloo stay",
      "Husky & reindeer safari",
      "Santa Claus Village"
    ],
    bestTime: "December – March",
    visa: "Schengen visa — we assist end to end",
    isNew: true,
  }),
  c({
    slug: "czech-republic",
    gallery: [
          "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Czech Republic",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80",
    tagline: "Prague's fairytale old town",
    blurb: "Cobbled lanes, castle views and one of Europe's best value city breaks.",
    nights: "4–6 nights",
    fromAed: 3499,
    highlights: ["Prague Castle", "Charles Bridge", "Old Town Square", "Cesky Krumlov day trip"],
    bestTime: "April – October",
    visa: "Schengen visa — we assist end to end",
  }),
  c({
    slug: "austria",
    gallery: [
          "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Austria",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    tagline: "Vienna palaces and alpine lakes",
    blurb: "Imperial Vienna paired with Hallstatt and Salzburg's mountain scenery.",
    nights: "5–7 nights",
    fromAed: 4299,
    highlights: [
      "Schönbrunn Palace",
      "Hallstatt lake village",
      "Salzburg old town",
      "Swarovski Crystal Worlds"
    ],
    bestTime: "May – September",
    visa: "Schengen visa — we assist end to end",
  }),
  c({
    slug: "hungary",
    gallery: [
          "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Hungary",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80",
    tagline: "Budapest, thermal baths, Danube nights",
    blurb: "The Danube lit up at night and thermal spas that make winter worth it.",
    nights: "4–5 nights",
    fromAed: 3299,
    highlights: [
      "Danube dinner cruise",
      "Széchenyi thermal bath",
      "Buda Castle",
      "Parliament building"
    ],
    bestTime: "March – October",
    visa: "Schengen visa — we assist end to end",
  }),
  c({
    slug: "greece",
    gallery: [
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Greece",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    tagline: "Athens ruins and island blue",
    blurb: "Acropolis mornings, Santorini sunsets and ferries between whitewashed islands.",
    nights: "6–8 nights",
    fromAed: 4899,
    highlights: [
      "Acropolis of Athens",
      "Santorini caldera sunset",
      "Mykonos beaches",
      "Island-hopping ferries"
    ],
    bestTime: "May – October",
    visa: "Schengen visa — we assist end to end",
  }),
  c({
    slug: "serbia",
    gallery: [
          "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Serbia",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    tagline: "Belgrade nightlife, fortresses and Danube dining",
    blurb: "Bohemian cobblestone quarters, historic fortresses, and scenic riverside dining in Southeast Europe.",
    nights: "4–6 nights",
    fromAed: 2499,
    highlights: [
      "Belgrade Fortress (Kalemegdan)",
      "Saint Sava Temple",
      "Novi Sad & Petrovaradin Citadel",
      "Danube River sunset cruise"
    ],
    bestTime: "May – September",
    visa: "Visa-free / Schengen / eVisa support",
    isNew: true,
  }),

  // Asia
  c({
    slug: "japan",
    gallery: [
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Japan",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    tagline: "Neon cities and quiet temples",
    blurb:
      "Bullet trains between Tokyo's neon and Kyoto's temple gardens — cherry blossom or autumn colour.",
    nights: "6–9 nights",
    fromAed: 6499,
    highlights: [
      "Tokyo & Shibuya",
      "Mount Fuji day trip",
      "Kyoto temples & geisha district",
      "Shinkansen bullet train"
    ],
    bestTime: "March – April, October – November",
    visa: "Japan visa — we handle the paperwork",
  }),
  c({
    slug: "indonesia",
    gallery: [
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Indonesia (Bali)",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    tagline: "Bali rice terraces and island escapes",
    blurb: "Villas over the jungle, temple mornings and boat days to Nusa Penida.",
    nights: "5–8 nights",
    fromAed: 2999,
    highlights: [
      "Ubud rice terraces",
      "Nusa Penida boat day",
      "Uluwatu sunset temple",
      "Private pool villas"
    ],
    bestTime: "April – October",
    visa: "Visa on arrival",
  }),
  c({
    slug: "singapore",
    gallery: [
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Singapore",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    tagline: "Family city break, done perfectly",
    blurb: "Gardens by the Bay, Sentosa theme parks and a skyline built for photographs.",
    nights: "4–5 nights",
    fromAed: 3299,
    highlights: [
      "Universal Studios Sentosa",
      "Gardens by the Bay",
      "Marina Bay Sands SkyPark",
      "Singapore Zoo & Night Safari"
    ],
    bestTime: "Year round",
    visa: "Singapore visa — quick processing",
  }),
  c({
    slug: "malaysia",
    gallery: [
          "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Malaysia",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80",
    tagline: "Kuala Lumpur and Langkawi",
    blurb: "City towers, rainforest cable cars and cheap island time.",
    nights: "5–7 nights",
    fromAed: 2699,
    highlights: ["Petronas Towers", "Batu Caves", "Langkawi Sky Bridge", "Genting Highlands"],
    bestTime: "December – April",
    visa: "Visa-free / eVisa depending on passport",
  }),
  c({
    slug: "thailand",
    gallery: [
          "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Thailand",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
    tagline: "Bangkok buzz, island calm",
    blurb: "Street food nights in Bangkok then longtail boats around Krabi and Phuket.",
    nights: "5–8 nights",
    fromAed: 2499,
    highlights: [
      "Phi Phi islands",
      "James Bond Island",
      "Bangkok grand palace",
      "Phuket beach resorts"
    ],
    bestTime: "November – April",
    visa: "Visa on arrival for most passports",
  }),
  c({
    slug: "maldives",
    gallery: [
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Maldives",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
    tagline: "Overwater villas, four hours away",
    blurb: "The honeymoon standard: lagoon villas, house reefs and seaplane transfers.",
    nights: "4–6 nights",
    fromAed: 4499,
    highlights: [
      "Overwater villa stay",
      "House reef snorkelling",
      "Sunset dolphin cruise",
      "Private sandbank dinner"
    ],
    bestTime: "November – April",
    visa: "Free visa on arrival",
    isNew: true,
  }),
  c({
    slug: "sri-lanka",
    gallery: [
          "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Sri Lanka",
    region: "Asia",
    image:
      "/images/destinations/sri-lanka-nine-arch.jpg",
    tagline: "Tea hills, safari and surf",
    blurb: "Short flight, big variety — hill country trains, leopard safaris and southern beaches.",
    nights: "5–7 nights",
    fromAed: 2399,
    highlights: ["Ella train ride", "Yala safari", "Sigiriya rock", "Galle Fort"],
    bestTime: "December – April",
    visa: "ETA — issued online",
  }),
  c({
    slug: "vietnam",
    gallery: [
          "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Vietnam",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    tagline: "Ha Long Bay and lantern towns",
    blurb: "Limestone bays, Hoi An lanterns and some of Asia's best food.",
    nights: "6–9 nights",
    fromAed: 3299,
    highlights: ["Ha Long Bay cruise", "Hoi An old town", "Cu Chi tunnels", "Mekong Delta"],
    bestTime: "October – April",
    visa: "eVisa",
  }),
  c({
    slug: "nepal",
    gallery: [
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Nepal",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    tagline: "Himalayas, temples & Annapurna peaks",
    blurb: "Snow-capped Himalayan peaks, ancient pagoda squares in Kathmandu, and serene Pokhara lakeside walks.",
    nights: "5–8 nights",
    fromAed: 1899,
    highlights: ["Kathmandu Durbar Square", "Pokhara Phewa Lake", "Mount Everest Mountain Flight", "Swayambhunath Monkey Temple"],
    bestTime: "October – April",
    visa: "Visa on Arrival for UAE residents",
  }),
  c({
    slug: "china",
    gallery: [
          "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "China",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80",
    tagline: "Great Wall, Forbidden City & Shanghai skyline",
    blurb: "Imperial wonders, the ancient Silk Road, and the high-tech neon skylines of Shanghai and Beijing.",
    nights: "7–10 nights",
    fromAed: 5299,
    highlights: ["Great Wall of China at Mutianyu", "Forbidden City & Summer Palace", "Shanghai Bund & Oriental Pearl", "Terracotta Warriors in Xi'an"],
    bestTime: "April – May, September – October",
    visa: "China Tourist Visa — full handling",
  }),
  c({
    slug: "south-korea",
    gallery: [
          "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "South Korea",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80",
    tagline: "Seoul palaces, K-Culture & Jeju Island",
    blurb: "Centuries-old royal palaces standing beside futuristic K-Pop streets, gourmet street food markets, and scenic Jeju Island.",
    nights: "6–9 nights",
    fromAed: 4999,
    highlights: ["Gyeongbokgung Palace & Hanbok experience", "N Seoul Tower & Myeongdong", "Nami Island day excursion", "Jeju Island waterfalls & volcanic peaks"],
    bestTime: "March – May, September – November",
    visa: "K-ETA / Tourist Visa",
  }),
  c({
    slug: "kyrgyzstan",
    gallery: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Kyrgyzstan",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=80",
    tagline: "Tian Shan mountains & Issyk-Kul alpine lakes",
    blurb: "Untouched alpine landscapes, nomadic yurt camps, and crystal blue mountain lakes just 4 hours from Dubai.",
    nights: "4–6 nights",
    fromAed: 2299,
    highlights: ["Issyk-Kul Lake alpine resort", "Ala Archa National Park", "Bishkek Ala-Too Square", "Chon-Kemin Valley horseback riding"],
    bestTime: "May – September",
    visa: "Visa-free / eVisa for UAE residents",
  }),
  c({
    slug: "hong-kong",
    gallery: [
          "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Hong Kong",
    region: "Asia",
    image:
      "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80",
    tagline: "Victoria Harbour, skyline & Disneyland",
    blurb: "Dramatic Victoria Peak vistas, world-class Dim Sum dining, and iconic Star Ferry rides across Victoria Harbour.",
    nights: "4–6 nights",
    fromAed: 3999,
    highlights: ["Victoria Peak Tram & Sky Terrace", "Star Ferry & Symphony of Lights", "Hong Kong Disneyland", "Tian Tan Big Buddha & Ngong Ping 360"],
    bestTime: "October – December",
    visa: "Pre-arrival Registration / Visa-free",
  }),

  // Africa
  c({
    slug: "morocco",
    gallery: [
          "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Morocco",
    region: "Africa",
    image:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80",
    tagline: "Souks, riads and Sahara camps",
    blurb: "Marrakech medinas, Atlas passes and a night under desert stars.",
    nights: "6–8 nights",
    fromAed: 3999,
    highlights: [
      "Marrakech souks",
      "Sahara desert camp",
      "Atlas mountains",
      "Chefchaouen blue city"
    ],
    bestTime: "October – April",
    visa: "Visa-free for many nationalities",
  }),
  c({
    slug: "kenya",
    gallery: [
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Kenya",
    region: "Africa",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    tagline: "Masai Mara safari classic",
    blurb: "Big Five mornings, balloon safaris and Mara sunsets.",
    nights: "5–8 nights",
    fromAed: 7499,
    highlights: [
      "Masai Mara Big Five",
      "Hot air balloon safari",
      "Lake Nakuru flamingos",
      "Amboseli & Kilimanjaro views"
    ],
    bestTime: "July – October",
    visa: "eTA",
  }),
  c({
    slug: "egypt",
    gallery: [
          "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Egypt",
    region: "Africa",
    image:
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
    tagline: "Pyramids and Nile cruises",
    blurb: "Giza at sunrise, Luxor temples and a slow Nile cruise between them.",
    nights: "5–8 nights",
    fromAed: 3299,
    highlights: [
      "Pyramids of Giza",
      "Nile cruise Luxor–Aswan",
      "Valley of the Kings",
      "Egyptian Museum"
    ],
    bestTime: "October – April",
    visa: "Visa on arrival for UAE residents",
  }),
  c({
    slug: "tanzania",
    gallery: [
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Tanzania",
    region: "Africa",
    image:
      "/images/destinations/tanzania-serengeti.jpg",
    tagline: "Serengeti Migration, Ngorongoro & Zanzibar",
    blurb: "Witness the Great Wildebeest Migration on the endless plains of the Serengeti, followed by white sand beaches in Zanzibar.",
    nights: "6–9 nights",
    fromAed: 5899,
    highlights: ["Serengeti National Park Big Five Safari", "Ngorongoro Crater caldera game drive", "Zanzibar spice tours & Stone Town", "Mount Kilimanjaro viewpoint"],
    bestTime: "June – October, December – March",
    visa: "eVisa / Visa on Arrival",
  }),
  c({
    slug: "south-africa",
    gallery: [
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "South Africa",
    region: "Africa",
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    tagline: "Cape Town, Table Mountain & Kruger Safari",
    blurb: "Table Mountain cable cars, penguins at Boulders Beach, and thrilling Big Five game drives in Kruger.",
    nights: "7–10 nights",
    fromAed: 5699,
    highlights: ["Table Mountain & Cape Point", "Kruger National Park luxury safari", "Boulders Beach African penguin colony", "Stellenbosch vineyard scenery"],
    bestTime: "November – April",
    visa: "Tourist Visa support",
  }),
  c({
    slug: "seychelles",
    gallery: [
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Seychelles",
    region: "Africa",
    image:
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80",
    tagline: "Granite boulders, turquoise lagoons & giant tortoises",
    blurb: "Powder-soft white beaches, iconic granite boulders at Anse Source d'Argent, and pristine coral reefs in the Indian Ocean.",
    nights: "4–7 nights",
    fromAed: 4899,
    highlights: ["Anse Source d'Argent on La Digue", "Vallée de Mai UNESCO prehistoric palm forest", "Curieuse Island giant tortoises", "Private catamaran island hopping"],
    bestTime: "April – May, October – November",
    visa: "Visa-free for all nationalities (Travel Auth)",
    isNew: true,
  }),

  // Eurasia
  c({
    slug: "turkey",
    gallery: [
          "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Turkey",
    region: "Eurasia",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
    tagline: "Istanbul and Cappadocia balloons",
    blurb: "Two continents, one city — plus sunrise balloons over fairy chimneys.",
    nights: "5–8 nights",
    fromAed: 2899,
    highlights: [
      "Hagia Sophia & Blue Mosque",
      "Bosphorus dinner cruise",
      "Cappadocia balloon ride",
      "Pamukkale terraces"
    ],
    bestTime: "April – June, September – November",
    visa: "eVisa / visa-free for UAE residents",
  }),
  c({
    slug: "georgia",
    gallery: [
          "/images/destinations/georgia-tbilisi.jpg",
          "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Georgia",
    region: "Eurasia",
    image:
      "/images/destinations/georgia-tbilisi.jpg",
    tagline: "Caucasus mountains and wine valleys",
    blurb: "Tbilisi's sulphur baths, Kazbegi peaks and the world's oldest wine region.",
    nights: "4–6 nights",
    fromAed: 1599,
    highlights: [
      "Tbilisi old town",
      "Kazbegi & Gergeti church",
      "Kakheti wine tasting",
      "Gudauri snow"
    ],
    bestTime: "April – October",
    visa: "Visa-free for UAE residents",
  }),
  c({
    slug: "azerbaijan",
    gallery: [
          "/images/destinations/azerbaijan-baku.jpg",
          "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Azerbaijan",
    region: "Eurasia",
    image:
      "/images/destinations/azerbaijan-baku.jpg",
    tagline: "Baku's flame towers, three hours away",
    blurb: "Old city walls and modern architecture — the easiest short break from Dubai.",
    nights: "3–5 nights",
    fromAed: 1899,
    highlights: [
      "Flame Towers",
      "Old City (Icherisheher)",
      "Gobustan mud volcanoes",
      "Gabala day trip"
    ],
    bestTime: "April – June, September – November",
    visa: "eVisa in 3 working days",
  }),
  c({
    slug: "armenia",
    gallery: [
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Armenia",
    region: "Eurasia",
    image:
      "/images/destinations/armenia-yerevan-ararat.jpg",
    tagline: "Monasteries and mountain roads",
    blurb: "Ancient monasteries, Lake Sevan and a very short flight from Dubai.",
    nights: "4–5 nights",
    fromAed: 1799,
    highlights: ["Yerevan Cascade", "Geghard Monastery", "Lake Sevan", "Garni Temple"],
    bestTime: "May – October",
    visa: "Visa-free / eVisa",
  }),
  c({
    slug: "kazakhstan",
    gallery: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Kazakhstan",
    region: "Eurasia",
    image:
      "/images/destinations/kazakhstan-charyn.jpg",
    tagline: "Almaty apple city, Charyn Canyon & Shymbulak",
    blurb: "Shymbulak ski resort, emerald Big Almaty Lake, and the dramatic red sandstone cliffs of Charyn Canyon.",
    nights: "4–6 nights",
    fromAed: 2199,
    highlights: ["Shymbulak Mountain Resort cable car", "Charyn Canyon Grand Canyon of Asia", "Medeu highest ice skating rink", "Panfilov Park & Zenkov Cathedral"],
    bestTime: "May – October (Skiing: Dec – March)",
    visa: "Visa-free for UAE residents",
  }),
  c({
    slug: "jordan",
    gallery: [
          "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Jordan",
    region: "Eurasia",
    image:
      "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=1200&q=80",
    tagline: "Petra Rose City, Wadi Rum & Dead Sea",
    blurb: "Walk through the Siq into the rose-red Treasury of Petra, glamp under Martian stars in Wadi Rum, and float in the Dead Sea.",
    nights: "4–6 nights",
    fromAed: 3299,
    highlights: ["Petra UNESCO Treasury & Monastery", "Wadi Rum 4x4 Jeep safari & bedouin camp", "Dead Sea mineral mud bath", "Amman Citadel & Roman Theatre"],
    bestTime: "March – May, September – November",
    visa: "Visa on Arrival / Jordan Pass",
  }),
  c({
    slug: "uzbekistan",
    gallery: [
          "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Uzbekistan",
    region: "Eurasia",
    image:
      "/images/destinations/uzbekistan-registan.jpg",
    tagline: "Samarkand, Bukhara & Silk Road Turquoise Domes",
    blurb: "Towering turquoise minarets, mosaic madrasahs, and Silk Road trading domes in ancient Samarkand and Bukhara.",
    nights: "5–7 nights",
    fromAed: 2799,
    highlights: ["Registan Square in Samarkand", "Bukhara Ark Fortress & Kalyan Minaret", "Shah-i-Zinda necropolis avenue", "Afrosiyob High-Speed Bullet Train"],
    bestTime: "March – May, September – November",
    visa: "eVisa / Visa-free for UAE residents",
  }),

  // Australia
  c({
    slug: "australia",
    gallery: [
          "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Australia",
    region: "Australia",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    tagline: "Sydney Opera House, Great Barrier Reef & Melbourne",
    blurb: "Sail Sydney Harbour, dive the world's largest coral reef, and explore the coastal beauty of Melbourne's Great Ocean Road.",
    nights: "8–12 nights",
    fromAed: 6999,
    highlights: ["Sydney Opera House & Harbour Bridge", "Great Barrier Reef snorkeling excursion", "Melbourne Great Ocean Road & 12 Apostles", "Blue Mountains Scenic World"],
    bestTime: "September – November, March – May",
    visa: "Australian Tourist Visa (eVisitor/ETA)",
  }),

  // America
  c({
    slug: "united-states",
    gallery: [
          "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "United States of America",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80",
    tagline: "New York, California, Las Vegas & Orlando",
    blurb: "Times Square energy, Hollywood glamour, Grand Canyon scale, and Florida theme park thrills planned from Dubai.",
    nights: "8–14 nights",
    fromAed: 7499,
    highlights: ["Statue of Liberty & Manhattan skyline", "Grand Canyon National Park helicopter tour", "Universal Studios & Walt Disney World", "Golden Gate Bridge & California coast"],
    bestTime: "Year-round depending on region",
    visa: "US B1/B2 Tourist Visa assistance",
  }),
  c({
    slug: "argentina",
    gallery: [
          "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Argentina",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80",
    tagline: "Buenos Aires tango, Iguazú Falls & Patagonia",
    blurb: "Passionate tango shows in Buenos Aires, thunderous Iguazú Falls, and glacier trekking in Patagonia.",
    nights: "8–12 nights",
    fromAed: 7999,
    highlights: ["Iguazú Falls Devil's Throat walkway", "Buenos Aires San Telmo & La Boca", "Perito Moreno Glacier boat cruise", "Mendoza Andes wine valley"],
    bestTime: "October – April",
    visa: "Tourist Visa / ETA",
  }),
  c({
    slug: "brazil",
    gallery: [
          "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
    ],
    name: "Brazil",
    region: "America",
    image:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    tagline: "Rio Christ Redeemer, Copacabana & Amazon",
    blurb: "Christ the Redeemer overlooking Guanabara Bay, golden sands of Copacabana, and rainforest adventures.",
    nights: "8–12 nights",
    fromAed: 7899,
    highlights: ["Christ the Redeemer & Sugarloaf Mountain", "Copacabana & Ipanema beaches", "Iguaçu Falls Brazilian side", "Amazon Rainforest river cruise"],
    bestTime: "December – March, June – September",
    visa: "Tourist Visa support",
  })
];

export const countryRegions: CountryRegion[] = [
  "Europe",
  "Asia",
  "Africa",
  "Eurasia",
  "Australia",
  "America"
];

export function countriesByRegion(region: CountryRegion) {
  return countries.filter((x) => x.region === region);
}

export function findCountry(slug: string) {
  return countries.find((x) => x.slug === slug);
}
