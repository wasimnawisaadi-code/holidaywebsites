import fs from "fs";

const packagesList = [
  {
    slug: "swiss-alpine-dream",
    title: "Swiss Alpine Dream & Panoramic Rail",
    destination: "Zurich · Lucerne · Interlaken · Jungfrau",
    country: "Switzerland",
    region: "International",
    days: 7,
    nights: 6,
    styles: ["Luxury", "Family", "Honeymoon"],
    priceStatus: "from",
    priceFrom: 5499,
    image:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Seven days across turquoise lakes, glacier peaks and postcard villages, travelling on Switzerland's world-famous scenic rail network.",
    story:
      "Wake up to lake mist in Lucerne, ascend above the clouds to Jungfraujoch (Top of Europe), and watch the Alps glide past panoramic train windows.",
    highlights: [
      "Jungfraujoch — Top of Europe cogwheel railway",
      "Mount Titlis Rotair revolving cable car & Cliff Walk",
      "GoldenPass panoramic scenic train journey",
      "Sunset catamaran cruise on Lake Lucerne",
      "4-star central hotels with daily Swiss breakfast",
      "Schengen visa document support from Dubai",
    ],
    route: ["Zurich", "Lucerne", "Interlaken", "Jungfraujoch", "Geneva"],
    featured: true,
    seasonal: "Spring / Summer Peak",
  },
  {
    slug: "maldives-overwater-escape",
    title: "Maldives Luxury Overwater Lagoon Villa",
    destination: "North Malé Atoll · Private Island",
    country: "Maldives",
    region: "International",
    days: 5,
    nights: 4,
    styles: ["Honeymoon", "Luxury", "Beach"],
    priceStatus: "from",
    priceFrom: 4499,
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
    intro:
      "The definitive tropical honeymoon: private overwater villa with direct ocean staircase, house reef snorkeling, and seaplane transfers.",
    story:
      "Four hours direct from Dubai lands you in an overwater villa over crystal lagoons. Snorkel with sea turtles and dine under the stars on a private sandbank.",
    highlights: [
      "5-star private overwater villa with direct lagoon access",
      "Roundtrip scenic speedboat or seaplane transfers from Malé",
      "Sunset dolphin cruise and sandbank private picnic",
      "Complimentary snorkeling gear and non-motorized water sports",
      "Half board dining (daily breakfast and gourmet dinner)",
      "Free 30-day visa on arrival for UAE residents",
    ],
    route: ["Dubai DXB", "Malé Velana", "Private Resort Island"],
    featured: true,
    seasonal: "Year-Round Island Escape",
  },
  {
    slug: "bali-jungle-coast",
    title: "Bali Ubud Jungle Villa & Seminyak Coast",
    destination: "Ubud · Tegalalang · Seminyak · Nusa Penida",
    country: "Indonesia",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Honeymoon", "Adventure", "Beach"],
    priceStatus: "from",
    priceFrom: 2999,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Two sides of Bali in one seamless journey: private pool villa amidst Ubud's rainforest terraces, followed by beachfront luxury in Seminyak.",
    story:
      "Explore holy water temples, hidden jungle waterfalls, and take a private speedboat to Nusa Penida's breathtaking Kelingking cliff before seaside sunset dining.",
    highlights: [
      "3 nights private pool villa in Ubud + 2 nights beachfront hotel Seminyak",
      "Guided tour of Tegalalang Rice Terraces and Tirta Empul water temple",
      "Full-day Nusa Penida island speedboat excursion",
      "Tanah Lot sunset sea temple visit",
      "Private air-conditioned car and driver throughout",
      "Visa on arrival for most nationalities",
    ],
    route: ["Denpasar", "Ubud", "Kintamani", "Seminyak", "Nusa Penida"],
    featured: true,
    seasonal: "Dry Season Highlight",
  },
  {
    slug: "japan-golden-route",
    title: "Japan Golden Route: Tokyo, Mt. Fuji & Kyoto",
    destination: "Tokyo · Hakone · Kyoto · Nara · Osaka",
    country: "Japan",
    region: "International",
    days: 8,
    nights: 7,
    styles: ["Cultural", "Family", "Luxury"],
    priceStatus: "from",
    priceFrom: 6499,
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Experience futuristic neon streets, Shinkansen bullet trains, sacred shrines, and geisha districts across Tokyo, Mount Fuji, and Kyoto.",
    story:
      "Marvel at Shibuya Crossing, cruise Lake Ashi beneath Mount Fuji, soak in a traditional Hakone hot spring, and walk through thousands of red Torii gates.",
    highlights: [
      "Shinkansen bullet train rides between Tokyo, Hakone & Kyoto",
      "Mount Fuji 5th Station & Lake Ashi scenic cruise",
      "Traditional Ryokan onsen hot spring bath experience with dinner",
      "Kyoto Fushimi Inari Shrine, Kinkaku-ji & Arashiyama Bamboo Grove",
      "Day trip to Nara Deer Park and Osaka Dotonbori",
      "Japan tourist visa processing support",
    ],
    route: ["Tokyo", "Mount Fuji", "Hakone", "Kyoto", "Nara", "Osaka"],
    featured: true,
    seasonal: "Cherry Blossom & Autumn",
  },
  {
    slug: "georgia-mountain-weekender",
    title: "Georgia Caucasus Mountains & Tbilisi Heritage",
    destination: "Tbilisi · Kazbegi · Ananuri · Gudauri",
    country: "Georgia",
    region: "International",
    days: 4,
    nights: 3,
    styles: ["Adventure", "Weekend Escape", "Cultural"],
    priceStatus: "from",
    priceFrom: 1899,
    image:
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Just 3.5 hours from Dubai: sulfur bathhouses, cobblestone alleys, and 4x4 mountain drives to the iconic Gergeti Trinity Church.",
    story:
      "Drive the Georgian Military Highway past turquoise reservoirs and snow-dusted Caucasus peaks before enjoying authentic khinkali and Georgian wine cellars.",
    highlights: [
      "Tbilisi Old Town walking tour and Narikala cable car",
      "4x4 Land Cruiser climb to Gergeti Trinity Church beneath Mount Kazbek",
      "Scenic stops at Ananuri Fortress and Gudauri Friendship Monument",
      "Traditional Georgian supra dinner with folk music",
      "4-star boutique hotel stay with daily breakfast",
      "Visa-free entry for UAE residents",
    ],
    route: ["Tbilisi", "Ananuri", "Gudauri", "Stepantsminda Kazbegi"],
    featured: true,
    seasonal: "Popular Short Break",
  },
  {
    slug: "cappadocia-sky-turkey",
    title: "Turkey Magic: Istanbul Bosphorus & Cappadocia Balloons",
    destination: "Istanbul · Bosphorus · Cappadocia · Göreme",
    country: "Turkey",
    region: "International",
    days: 5,
    nights: 4,
    styles: ["Cultural", "Honeymoon", "Adventure"],
    priceStatus: "from",
    priceFrom: 2699,
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Imperial Ottoman palaces and sunset Bosphorus cruising in Istanbul, paired with cave hotel suites and sunrise hot air balloons in Cappadocia.",
    story:
      "Stand beneath the monumental domes of Hagia Sophia, browse the Grand Bazaar, and take flight in a hot air balloon over fairy chimney valleys.",
    highlights: [
      "Sunrise hot air balloon flight over Göreme fairy chimneys",
      "Stay in an authentic luxury stone cave hotel in Cappadocia",
      "Guided tour of Hagia Sophia, Blue Mosque & Topkapi Palace",
      "Bosphorus private yacht sunset cruise in Istanbul",
      "Domestic flights Istanbul–Cappadocia return included",
      "Instant Turkish eVisa assistance",
    ],
    route: ["Istanbul", "Bosphorus", "Kayseri / Nevşehir", "Göreme"],
    featured: true,
    seasonal: "Spring / Autumn Special",
  },
  {
    slug: "paris-french-riviera",
    title: "Paris City of Lights & French Riviera Glamour",
    destination: "Paris · Versailles · Nice · Cannes · Monaco",
    country: "France",
    region: "International",
    days: 7,
    nights: 6,
    styles: ["Luxury", "Honeymoon", "Shopping"],
    priceStatus: "from",
    priceFrom: 4799,
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Combine Parisian romance and world-class museums with the sun-drenched coastal glamour of Nice, Cannes, and Monte Carlo.",
    story:
      "Ascend the Eiffel Tower, cruise down the River Seine at twilight, and board the high-speed TGV train down to the sapphire waters of the Côte d'Azur.",
    highlights: [
      "Eiffel Tower summit access & Seine illuminations cruise",
      "Guided Palace of Versailles Hall of Mirrors excursion",
      "TGV high-speed train transfer from Paris to Nice",
      "Full-day French Riviera tour to Cannes, Antibes & Monaco Monte Carlo",
      "4-star luxury boutique accommodation throughout",
      "Schengen visa processing guidance",
    ],
    route: ["Paris", "Versailles", "Nice", "Cannes", "Monaco"],
    featured: false,
    seasonal: "Summer Luxury",
  },
  {
    slug: "italy-classic-grand-tour",
    title: "Italy Grand Tour: Rome, Florence & Venice",
    destination: "Rome · Vatican · Florence · Tuscany · Venice",
    country: "Italy",
    region: "International",
    days: 8,
    nights: 7,
    styles: ["Cultural", "Honeymoon", "Luxury"],
    priceStatus: "from",
    priceFrom: 4999,
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    intro:
      "The definitive Italian odyssey connecting ancient gladiators in Rome, Renaissance masterpieces in Florence, and singing gondoliers in Venice.",
    story:
      "Explore the Colosseum and Sistine Chapel, taste handmade pasta in Tuscany, and glide along the Grand Canal on a private wooden gondola.",
    highlights: [
      "Skip-the-line VIP Colosseum, Roman Forum & Vatican Museums tickets",
      "High-speed Frecciarossa trains connecting Rome, Florence & Venice",
      "Guided Florence walking tour with Accademia Gallery (Michelangelo's David)",
      "Traditional Venetian Gondola ride through romantic canals",
      "Tuscan Chianti winery day trip with olive oil tasting",
      "Schengen visa document handling",
    ],
    route: ["Rome", "Vatican City", "Florence", "Siena / Chianti", "Venice"],
    featured: true,
    seasonal: "Spring & Autumn Classic",
  },
  {
    slug: "greece-santorini-athens",
    title: "Greece Wonders: Athens Acropolis & Santorini Caldera",
    destination: "Athens · Acropolis · Mykonos · Santorini",
    country: "Greece",
    region: "International",
    days: 7,
    nights: 6,
    styles: ["Honeymoon", "Beach", "Cultural"],
    priceStatus: "from",
    priceFrom: 4899,
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Ancient Hellenic history meets whitewashed cliffside villages and world-famous Aegean sunsets overlooking the volcanic caldera.",
    story:
      "Walk among marble columns of the Parthenon in Athens before boarding a high-speed catamaran to the blue-domed churches and infinity pools of Oia, Santorini.",
    highlights: [
      "Skip-the-line Acropolis & Parthenon guided tour in Athens",
      "High-speed ferry tickets between Athens and Santorini",
      "3 nights cliffside caldera view hotel in Santorini with infinity pool",
      "Santorini sunset catamaran cruise with BBQ dinner and Greek wine",
      "Volcanic red and black sand beach tour",
      "Schengen visa support from Dubai",
    ],
    route: ["Athens", "Piraeus Port", "Santorini Oia & Fira"],
    featured: true,
    seasonal: "Summer Island Romance",
  },
  {
    slug: "egypt-pharaohs-nile",
    title: "Egypt Grandeur: Cairo Pyramids & 5-Star Nile Cruise",
    destination: "Cairo · Giza · Luxor · Edfu · Kom Ombo · Aswan",
    country: "Egypt",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Cultural", "Family", "Cruises"],
    priceStatus: "from",
    priceFrom: 2499,
    image:
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Step 4,500 years back in time. Stand before the Great Pyramids and Sphinx, followed by a luxury 5-star river cruise down the storied Nile.",
    story:
      "Discover King Tutankhamun's golden treasures, sail between ancient temples of Karnak, Luxor, and Valley of the Kings, and ride traditional felucca sailboats in Aswan.",
    highlights: [
      "Private Egyptologist-guided tour of the Pyramids of Giza & Great Sphinx",
      "Grand Egyptian Museum & Khan el-Khalili bazaar in Cairo",
      "3 nights aboard a 5-star luxury full-board Nile Cruise ship",
      "Valley of the Kings, Karnak Temple, and Temple of Philae tours",
      "Domestic flights Cairo–Luxor and Aswan–Cairo included",
      "Visa on arrival for UAE residents",
    ],
    route: ["Cairo", "Giza", "Luxor", "Edfu", "Kom Ombo", "Aswan"],
    featured: true,
    seasonal: "Winter Sun Explorer",
  },
  {
    slug: "thailand-islands-city",
    title: "Thailand Explorer: Bangkok Buzz & Phuket / Krabi Islands",
    destination: "Bangkok · Grand Palace · Phuket · Phi Phi Islands",
    country: "Thailand",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Beach", "Family", "Adventure"],
    priceStatus: "from",
    priceFrom: 2499,
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
    intro:
      "The ultimate tropical combo: bustling night markets and grand gold temples in Bangkok, followed by emerald island waters and limestone karst bays.",
    story:
      "Tour the Grand Palace and Wat Arun by Chao Phraya riverboat, then hop a short flight to Phuket for a luxury speedboat tour around Phi Phi and Maya Bay.",
    highlights: [
      "Guided Bangkok city tour (Grand Palace, Wat Pho & Wat Arun)",
      "Full-day Phi Phi Islands & Maya Bay luxury speedboat tour with lunch",
      "Domestic flight Bangkok–Phuket return included",
      "Beachfront 4-star resort stay in Phuket with swimming pool",
      "Private airport transfers throughout",
      "Visa on arrival for UAE residents",
    ],
    route: ["Bangkok", "Chao Phraya", "Phuket", "Phi Phi Islands"],
    featured: false,
    seasonal: "Winter Sun & Beach",
  },
  {
    slug: "singapore-sentosa-escape",
    title: "Singapore Futuristic City & Sentosa Island",
    destination: "Singapore · Marina Bay · Sentosa · Gardens by the Bay",
    country: "Singapore",
    region: "International",
    days: 5,
    nights: 4,
    styles: ["Family", "City Escape", "Shopping"],
    priceStatus: "from",
    priceFrom: 3299,
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    intro:
      "A clean, ultra-futuristic metropolis built for families and shoppers: towering Supertree Groves, Cloud Forest waterfalls, and world-class Sentosa theme parks.",
    story:
      "Gaze from the Marina Bay Sands SkyPark, watch the nightly Supertree light and sound show, and spend a thrill-packed day at Universal Studios Singapore.",
    highlights: [
      "Gardens by the Bay Flower Dome & Cloud Forest tickets",
      "Universal Studios Singapore 1-day pass on Sentosa Island",
      "Marina Bay Sands SkyPark Observation Deck ticket",
      "Night Safari tram ride with wild animal presentations",
      "Central 4-star hotel stay with daily breakfast",
      "Fast Singapore eVisa processing",
    ],
    route: ["Singapore Changi", "Marina Bay", "Sentosa Island", "Orchard Road"],
    featured: false,
    seasonal: "Family Holiday Favorite",
  },
  {
    slug: "baku-fire-flame-azerbaijan",
    title: "Baku Flame Towers & Gabala Alpine Mountain Escape",
    destination: "Baku · Old City · Gobustan · Gabala",
    country: "Azerbaijan",
    region: "International",
    days: 4,
    nights: 3,
    styles: ["Weekend Escape", "Family", "Cultural"],
    priceStatus: "from",
    priceFrom: 1899,
    image:
      "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Just 3 hours from Dubai: futuristic architecture meets ancient UNESCO Silk Road stone walls, Caspian Sea promenades, and alpine cable cars.",
    story:
      "Explore the UNESCO-listed Icherisheher Old City, marvel at the illuminated Flame Towers, and take a day trip to Gabala's snow-capped mountains and Tufandag cable car.",
    highlights: [
      "Guided tour of Icherisheher, Maiden Tower & Shirvanshahs Palace",
      "Heydar Aliyev Center architectural marvel by Zaha Hadid",
      "Day excursion to Gabala with Tufandag mountain cable car ride",
      "Gobustan prehistoric petroglyphs and bubbling mud volcanoes",
      "4-star hotel in central Baku with daily breakfast",
      "Easy 3-day online eVisa",
    ],
    route: ["Baku", "Gobustan", "Gabala", "Caspian Boulevard"],
    featured: false,
    seasonal: "Weekend Getaway",
  },
  {
    slug: "finland-lapland-aurora",
    title: "Lapland Arctic Aurora, Glass Igloos & Husky Safari",
    destination: "Rovaniemi · Santa Claus Village · Arctic Circle",
    country: "Finland",
    region: "International",
    days: 5,
    nights: 4,
    styles: ["Northern Lights", "Luxury", "Adventure"],
    priceStatus: "from",
    priceFrom: 7499,
    image:
      "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
    intro:
      "The ultimate winter fairy tale: sleep beneath heated glass igloos watching the Northern Lights dance across the Arctic night sky.",
    story:
      "Drive your own team of eager Alaskan huskies through snow-dusted pine forests, cross the Arctic Circle to meet Santa Claus, and chase the aurora borealis on snowmobiles.",
    highlights: [
      "2 nights in a luxury heated Glass Igloo with 360° sky views",
      "Guided Northern Lights snowmobile chase with campfire snacks",
      "10km husky dog sledding safari through Arctic forests",
      "Reindeer sleigh ride and meeting Santa Claus at his official village",
      "Full thermal snowsuits, boots, and winter gear included",
      "Schengen visa processing support",
    ],
    route: ["Helsinki", "Rovaniemi", "Arctic Treehouse / Igloo Resort"],
    featured: true,
    seasonal: "Winter Aurora Special (Nov - Mar)",
  },
  {
    slug: "kenya-masai-mara-safari",
    title: "Kenya Masai Mara Big Five Safari & Hot Air Balloon",
    destination: "Nairobi · Great Rift Valley · Masai Mara National Reserve",
    country: "Kenya",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Adventure", "Luxury", "Family"],
    priceStatus: "from",
    priceFrom: 7499,
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Witness the greatest wildlife spectacle on earth. Track lions, leopards, elephants, and rhinos across the golden plains of the Masai Mara.",
    story:
      "Embark on sunrise game drives in a customized 4x4 pop-up safari Land Cruiser, float above the savanna in a hot air balloon, and stay in luxury tented camps.",
    highlights: [
      "3 nights in a luxury 5-star safari tented camp inside Masai Mara",
      "Daily unlimited 4x4 pop-up roof game drives with certified wildlife guide",
      "Sunrise hot air balloon flight over the Mara with champagne bush breakfast",
      "Traditional Maasai warrior village cultural visit",
      "All national park conservation fees and full-board meals included",
      "Instant Kenya electronic travel authorization (eTA)",
    ],
    route: ["Nairobi", "Great Rift Valley Viewpoint", "Masai Mara Reserve"],
    featured: true,
    seasonal: "Great Migration (July - Oct)",
  },
  {
    slug: "ras-al-khaimah-staycation",
    title: "Ras Al Khaimah 5-Star Beach & Jebel Jais Mountain",
    destination: "Al Marjan Island · Jebel Jais Peak",
    country: "United Arab Emirates",
    region: "UAE",
    days: 3,
    nights: 2,
    styles: ["Beach", "Adventure", "Family"],
    priceStatus: "from",
    priceFrom: 1299,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    intro:
      "The perfect weekend staycation just 90 minutes from Dubai: private beach relaxation on Al Marjan Island and the high peaks of Jebel Jais.",
    story:
      "Lounge by the sea, dine on fresh seafood, and drive up the spectacular switchbacks to Jebel Jais viewing deck and the world's longest zipline.",
    highlights: [
      "2 nights 5-star beachfront resort stay on Al Marjan Island",
      "Private roundtrip luxury car transfers from Dubai",
      "Jebel Jais mountain summit excursion and sunset viewing deck",
      "Complimentary resort watersports access and infinity pools",
      "Daily gourmet buffet breakfast included",
      "No visa needed for UAE residents",
    ],
    route: ["Dubai", "Al Marjan Island RAK", "Jebel Jais Summit"],
    featured: false,
    seasonal: "Dubai Staycation",
  },
];

// Generate updated catalogue.ts keeping all types and helpers
let catalogueCode = `import maldives from "@/assets/dest-maldives.jpg";
import switzerland from "@/assets/dest-switzerland.jpg";
import bali from "@/assets/dest-bali.jpg";
import japan from "@/assets/dest-japan.jpg";
import georgia from "@/assets/dest-georgia.jpg";
import turkey from "@/assets/dest-turkey.jpg";
import thailand from "@/assets/dest-thailand.jpg";
import desert from "@/assets/dubai-desert.jpg";
import marina from "@/assets/dubai-marina.jpg";
import skyline from "@/assets/hero-dubai.jpg";
import waterpark from "@/assets/uae-waterpark.jpg";
import mosque from "@/assets/uae-mosque.jpg";
import snow from "@/assets/uae-snow.jpg";
import market from "@/assets/uae-market.jpg";

export const BRAND = {
  name: "Nawi Saadi Travel & Tourism",
  short: "Nawi Saadi",
  legal: "Nawi Saadi Travel & Tourism (Saadi Group of Companies)",
  whatsapp: "971561228069",
  email: "info@nawisaadi.com",
  phone: "+971 56 122 8069",
  city: "Deira, Dubai, United Arab Emirates",
  founded: 2009,
  chairman: "Mr. Shafiqullah Zazai",
  flightsSite: "https://www.nsttrip.com/",
  mainSite: "https://www.nawisaadi.com/",
};

export const credentials = [
  {
    code: "IATA",
    title: "IATA Accredited Agency",
    body: "Accredited by the International Air Transport Association, so tickets are issued to full international standards.",
  },
  {
    code: "GSA",
    title: "flydubai GSA — Afghanistan",
    body: "Appointed General Sales Agent for flydubai in Afghanistan, including passenger services at Kabul International Airport.",
  },
  {
    code: "DTCM",
    title: "Dubai DTCM Approved",
    body: "Approved by Dubai's Department of Tourism and Commerce Marketing for inbound tourism and travel services.",
  },
  {
    code: "2009",
    title: "Established 2009",
    body: "Over 15 years arranging flights, visas, Umrah, corporate travel and holidays across Afghanistan, the UAE and Saudi Arabia.",
  },
  {
    code: "50+",
    title: "50+ Travel Professionals",
    body: "A dedicated in-house team handling ticketing, visas, groups, aviation support and 24/7 traveller assistance.",
  },
  {
    code: "3",
    title: "Offices in 3 Countries",
    body: "Kabul (Afghanistan), Dubai (UAE) and Jeddah (Saudi Arabia) — plus dedicated airport service desks.",
  },
] as const;

export type Office = {
  city: string;
  country: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
};

export const offices: Office[] = [
  {
    city: "Dubai",
    country: "United Arab Emirates",
    phone: "+971 56 122 8069",
    email: "info@nawisaadi.com",
    address: "Millenium Building, Naif Road, Deira, Dubai, UAE",
    note: "Holidays, UAE tours & visa desk",
  },
  {
    city: "Kabul",
    country: "Afghanistan",
    phone: "+93 79 820 3051",
    email: "infokbl@nawisaadi.com",
    address: "Khost Tower, Jade Maiwand Road, Kabul, Afghanistan",
    note: "Head office — established 2009",
  },
  {
    city: "Kabul Airport Office",
    country: "Afghanistan",
    phone: "+93 78 081 6873",
    email: "infokbl@nawisaadi.com",
    address: "Kabul International Airport, Departure Terminal",
    note: "Airport assistance & ground handling",
  },
  {
    city: "flydubai Airport Office",
    country: "Afghanistan",
    phone: "+93 78 747 0006",
    email: "infokbl@nawisaadi.com",
    address: "Passenger Services, Kabul International — Departure Terminal",
    note: "flydubai GSA passenger services",
  },
  {
    city: "Jeddah",
    country: "Saudi Arabia",
    phone: "+966 55 990 54 20",
    email: "info@nawisaadi.com",
    address: "Jeddah, Kingdom of Saudi Arabia",
    note: "Hajj & Umrah operations",
  },
];

export const serviceLines = [
  { title: "Flight Booking & Air Ticketing", body: "International and domestic tickets on flydubai, Emirates, Turkish Airlines, Qatar Airways, Saudia and more." },
  { title: "Visa Assistance", body: "UAE tourist visas, transit visas and international visa consultancy with document support." },
  { title: "Holiday Packages", body: "Curated international holidays and UAE getaways with hotels, transfers and experiences included." },
  { title: "UAE Tours & Attractions", body: "Desert safaris, Burj Khalifa, theme parks, cruises and city tours — many under AED 100." },
  { title: "Hajj & Umrah", body: "Umrah packages from 7 to 17 nights with 3★ to 5★ hotels, visas and ground transport." },
  { title: "Corporate & Group Travel", body: "Managed business travel, MICE, delegations and NGO travel with dedicated account handling." },
  { title: "Hotel Booking", body: "Worldwide accommodation at negotiated contracted rates." },
  { title: "Transfers & Car Rental", body: "Airport transfers, chauffeur services and vehicle rental across the UAE." },
  { title: "Aviation & Ground Handling", body: "Airport assistance, ground handling coordination and passenger services." },
  { title: "Overflight & Landing Permits", body: "Overflight clearances, landing permits and aviation support services." },
  { title: "Cargo & Air Freight", body: "International logistics, air freight and cargo handling." },
  { title: "Customized Tours", body: "Bespoke itineraries built around your dates, budget and travel style." },
];

export function waLink(message: string) {
  return \`https://wa.me/\${BRAND.whatsapp}?text=\${encodeURIComponent(message)}\`;
}

export type TravelStyle =
  | "Family"
  | "Honeymoon"
  | "Luxury"
  | "Adventure"
  | "Beach"
  | "City Escape"
  | "Cultural"
  | "Shopping"
  | "Northern Lights"
  | "Cruises"
  | "Weekend Escape";

export type PriceStatus = "from" | "on-request";

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  activities: string[];
  meals: string;
  transport: string;
};

export type HolidayPackage = {
  slug: string;
  title: string;
  destination: string;
  country: string;
  region: "International" | "UAE";
  days: number;
  nights: number;
  styles: TravelStyle[];
  priceStatus: PriceStatus;
  priceFrom?: number;
  image: string;
  intro: string;
  story: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  route: string[];
  featured?: boolean;
  seasonal?: string;
  isNew?: boolean;
};

export const packages: HolidayPackage[] = ${JSON.stringify(
  packagesList.map((p) => ({
    ...p,
    itinerary: [
      {
        day: 1,
        title: `Arrival in ${p.destination.split("·")[0].trim()}`,
        summary: "VIP arrival transfer and check-in to your luxury hotel.",
        activities: ["Airport meet & greet", "Private hotel transfer", "Evening orientation walk"],
        meals: "No meals",
        transport: "Private transfer",
      },
      {
        day: 2,
        title: `Highlights & Cultural Excursion`,
        summary: "Guided full-day excursion exploring headline landmarks and photo viewpoints.",
        activities: [
          "Guided sightseeing",
          "Entry tickets to key monuments",
          "Traditional lunch break",
        ],
        meals: "Breakfast",
        transport: "Private vehicle",
      },
      {
        day: 3,
        title: `Signature Scenic Tour`,
        summary: "Unforgettable excursion to natural wonders and panoramic vistas.",
        activities: [
          "Scenic mountain/lake/ocean tour",
          "Local cultural experience",
          "Sunset viewpoint stop",
        ],
        meals: "Breakfast",
        transport: "Sightseeing coach / boat",
      },
      {
        day: 4,
        title: `Leisure & Bespoke Exploration`,
        summary: "Free day for shopping, spa, photography, or optional adventure add-ons.",
        activities: ["Free time for shopping", "Optional activities available on request"],
        meals: "Breakfast",
        transport: "Self-paced",
      },
      {
        day: p.days,
        title: "Farewell & Return Flight",
        summary:
          "Final gourmet breakfast, hotel check-out, and private transfer to airport for DXB flight.",
        activities: ["Hotel checkout", "Private airport transfer", "Departure flight"],
        meals: "Breakfast",
        transport: "Private transfer",
      },
    ],
    inclusions: [
      `${p.nights} Nights accommodation in handpicked 4★ & 5★ luxury hotels`,
      "Daily international buffet breakfast",
      "Round-trip airport transfers by private vehicle",
      "Guided sightseeing tours and entrance fees as per itinerary",
      "English-speaking professional local guides",
      "24/7 dedicated WhatsApp support from Dubai travel desk",
      "Visa document preparation & processing guidance",
    ],
    exclusions: [
      "International flight tickets from Dubai (available at special agent rates)",
      "Personal expenses, laundry, and telephone charges",
      "Optional adventure tours not mentioned in inclusions",
      "Travel insurance (can be added on request)",
    ],
  })),
  null,
  2,
)};

export type ExperienceCategory =
  | "Adventure"
  | "Family"
  | "Luxury"
  | "Cruise"
  | "Attraction"
  | "Theme Park"
  | "Water Park"
  | "Water Sports"
  | "Culture"
  | "Desert"
  | "Sightseeing"
  | "Combo Deal"
  | "Dining"
  | "Shows"
  | "Wellness"
  | "Shopping";

export type Experience = {
  slug: string;
  title: string;
  emirate: "Dubai" | "Abu Dhabi" | "Sharjah" | "Ras Al Khaimah" | "Fujairah" | "Ajman" | "Al Ain" | "Hatta";
  category: ExperienceCategory;
  duration: "<1 Hour" | "1–2 Hours" | "2–4 Hours" | "Half Day" | "Full Day";
  audience: ("Adults" | "Children" | "Families" | "Couples" | "Groups")[];
  priceStatus: PriceStatus;
  priceFrom?: number;
  wasPrice?: number;
  badge?: "Must Try" | "Popular" | "Best Value" | "New";
  instantConfirm?: boolean;
  image: string;
  overview: string;
  featured?: boolean;
};

export const experiences: Experience[] = [
  { slug: "desert-safari-evening", title: "Evening Red Dunes Desert Safari & BBQ", emirate: "Dubai", category: "Desert", duration: "Half Day", audience: ["Families", "Groups", "Couples"], priceStatus: "from", priceFrom: 165, wasPrice: 220, badge: "Must Try", instantConfirm: true, image: "/images/inbound/desert-safari-premium-red-dune-evening-desert-shows-and-dinner-at-heritage-village/img-1.jpg", overview: "Dune drive, camel ride, henna, 7 live shows and a 5-star BBQ dinner under desert stars.", featured: true },
  { slug: "burj-khalifa-levels", title: "Burj Khalifa: At The Top (Levels 124 & 125)", emirate: "Dubai", category: "Attraction", duration: "1–2 Hours", audience: ["Families", "Couples", "Adults"], priceStatus: "from", priceFrom: 179, wasPrice: 210, badge: "Must Try", instantConfirm: true, image: "/images/inbound/view-at-the-top-burj-khalifa/img-1.jpg", overview: "Observation decks on levels 124 & 125, with panoramic fountain show views below.", featured: true },
  { slug: "private-yacht-marina", title: "Private Luxury Yacht Charter Dubai Marina", emirate: "Dubai", category: "Luxury", duration: "2–4 Hours", audience: ["Couples", "Groups"], priceStatus: "from", priceFrom: 380, badge: "Popular", instantConfirm: true, image: "/images/inbound/xclusive-sharing-and-private-yacht-tours/img-1.jpg", overview: "Private charter along Marina, Ain Dubai and the Palm coastline with captain and crew.", featured: true },
  { slug: "lotus-mega-yacht", title: "Lotus Mega Yacht 5-Star Dinner Cruise", emirate: "Dubai", category: "Cruise", duration: "2–4 Hours", audience: ["Families", "Couples"], priceStatus: "from", priceFrom: 249, badge: "Must Try", instantConfirm: true, image: "/images/inbound/lotus-royale-dhow-cruise/img-1.jpg", overview: "240ft superyacht with onboard pool, live DJ, and 5-star international buffet dinner." },
  { slug: "hot-air-balloon-desert", title: "Desert Hot Air Balloon Sunrise & Falconry", emirate: "Dubai", category: "Adventure", duration: "Half Day", audience: ["Adults", "Couples"], priceStatus: "from", priceFrom: 990, badge: "Must Try", instantConfirm: true, image: "/images/inbound/dubai-hot-air/img-1.jpg", overview: "Pre-dawn flight 4,000ft over dunes, in-flight falconry show and gourmet desert breakfast." },
  { slug: "aquaventure-waterpark", title: "Atlantis Aquaventure Waterpark World", emirate: "Dubai", category: "Theme Park", duration: "Full Day", audience: ["Families", "Children"], priceStatus: "from", priceFrom: 325, badge: "Must Try", instantConfirm: true, image: "/images/inbound/atlantis-aqua-water-park/img-1.webp", overview: "105 record-breaking waterslides, private white sand beach and marine habitats." },
  { slug: "museum-of-the-future", title: "Museum of The Future Entry Ticket", emirate: "Dubai", category: "Attraction", duration: "2–4 Hours", audience: ["Adults", "Families"], priceStatus: "from", priceFrom: 159, badge: "Must Try", instantConfirm: true, image: "/images/inbound/museum-of-the-future/img-1.jpg", overview: "Journey 50 years into the future inside the world's most beautiful building." },
  { slug: "global-village", title: "Global Village Dubai Season Entry Ticket", emirate: "Dubai", category: "Attraction", duration: "Half Day", audience: ["Families", "Children", "Groups"], priceStatus: "from", priceFrom: 25, badge: "Best Value", instantConfirm: true, image: "/images/inbound/global-village/img-1.jpg", overview: "90+ country pavilions, street food, live cultural shows and carnival rides." },
  { slug: "dubai-fountain-lake-ride", title: "Dubai Fountain Show & Lake Abra Ride", emirate: "Dubai", category: "Attraction", duration: "<1 Hour", audience: ["Couples", "Families"], priceStatus: "from", priceFrom: 68, badge: "Popular", instantConfirm: true, image: "/images/inbound/fountain-show-lake-ride/img-1.jpg", overview: "Watch the dancing fountain show from a traditional abra on Burj Lake." },
  { slug: "dubai-frame", title: "The Dubai Frame & Glass Sky Bridge", emirate: "Dubai", category: "Attraction", duration: "1–2 Hours", audience: ["Families", "Children"], priceStatus: "from", priceFrom: 55, badge: "Best Value", instantConfirm: true, image: "/images/inbound/dubai-frame/img-1.jpg", overview: "Old Dubai on one side, new Dubai on the other, luminous glass walkway in between." },
  { slug: "the-view-palm", title: "The View at The Palm (Level 52)", emirate: "Dubai", category: "Attraction", duration: "1–2 Hours", audience: ["Families", "Couples"], priceStatus: "from", priceFrom: 105, wasPrice: 125, badge: "Must Try", instantConfirm: true, image: "/images/inbound/view-at-the-top-of-the-palm/img-1.jpg", overview: "360° views of Palm Jumeirah from Level 52, 240m above the island." },
  { slug: "ski-dubai-snow-park", title: "Ski Dubai Snow Park & Slope", emirate: "Dubai", category: "Theme Park", duration: "2–4 Hours", audience: ["Families", "Children"], priceStatus: "from", priceFrom: 220, badge: "Popular", instantConfirm: true, image: "/images/inbound/ski-dubai/img-1.jpg", overview: "Real snow all year: toboggan runs, penguin encounters and full winter gear included." },
  { slug: "img-worlds", title: "IMG Worlds of Adventure Mega Indoor Park", emirate: "Dubai", category: "Theme Park", duration: "Full Day", audience: ["Families", "Children", "Groups"], priceStatus: "from", priceFrom: 245, wasPrice: 345, badge: "Must Try", instantConfirm: true, image: "/images/inbound/img-world-of-adventure/img-1.jpg", overview: "World's largest indoor theme park — Marvel, Cartoon Network and Velociraptor coaster." },
  { slug: "ferrari-world", title: "Ferrari World Abu Dhabi (Yas Island)", emirate: "Abu Dhabi", category: "Theme Park", duration: "Full Day", audience: ["Families", "Groups", "Adults"], priceStatus: "from", priceFrom: 345, badge: "Must Try", instantConfirm: true, image: "/images/inbound/ferrari-world/img-1.jpg", overview: "Formula Rossa 240km/h fastest rollercoaster, Flying Aces and 40 Ferrari rides." },
  { slug: "louvre-abu-dhabi", title: "Louvre Abu Dhabi Universal Museum", emirate: "Abu Dhabi", category: "Culture", duration: "2–4 Hours", audience: ["Adults", "Families"], priceStatus: "from", priceFrom: 65, badge: "Popular", instantConfirm: true, image: "/images/inbound/louvre-museum-abu-dhabi/img-1.jpg", overview: "Jean Nouvel's rain-of-light floating dome and 12 world-class galleries." }
];

export const emirates = [
  { name: "Dubai", blurb: "Skyline, desert and everything between.", top: "34%", left: "40%" },
  { name: "Abu Dhabi", blurb: "Culture, capital icons and island resorts.", top: "62%", left: "22%" },
  { name: "Sharjah", blurb: "Museums, heritage and the Blue Souk.", top: "27%", left: "47%" },
  { name: "Ajman", blurb: "Quiet beaches minutes from the city.", top: "22%", left: "52%" },
  { name: "Ras Al Khaimah", blurb: "Mountains, ziplines and coastline.", top: "10%", left: "63%" },
  { name: "Fujairah", blurb: "East-coast diving and Hajar peaks.", top: "26%", left: "76%" },
  { name: "Al Ain", blurb: "Oasis city and Jebel Hafeet.", top: "70%", left: "50%" },
  { name: "Hatta", blurb: "Dam kayaking and mountain trails.", top: "46%", left: "62%" },
] as const;

export const travelStyles: TravelStyle[] = [
  "Honeymoon",
  "Family",
  "Luxury",
  "Adventure",
  "Beach",
  "City Escape",
  "Shopping",
  "Cultural",
  "Northern Lights",
  "Cruises",
  "Weekend Escape"
];

export function priceLabel(p: { priceStatus: PriceStatus; priceFrom?: number }) {
  return p.priceStatus === "from" && p.priceFrom ? \`From AED \${p.priceFrom.toLocaleString()}\` : "Price on Request";
}

export const experienceCategories: ExperienceCategory[] = [
  "Attraction",
  "Theme Park",
  "Water Park",
  "Desert",
  "Adventure",
  "Cruise",
  "Water Sports",
  "Sightseeing",
  "Culture",
  "Combo Deal",
  "Family",
  "Luxury",
  "Dining",
  "Shows",
  "Wellness",
  "Shopping",
];

export function discountPct(e: { priceFrom?: number; wasPrice?: number }) {
  if (!e.priceFrom || !e.wasPrice || e.wasPrice <= e.priceFrom) return null;
  return Math.round(((e.wasPrice - e.priceFrom) / e.wasPrice) * 100);
}

export const under100 = experiences
  .filter((e) => e.priceStatus === "from" && (e.priceFrom ?? Infinity) < 100)
  .sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
`;

fs.writeFileSync("src/data/catalogue.ts", catalogueCode);
console.log("Saved updated catalogue.ts with 16 comprehensive packages & rich experiences!");
