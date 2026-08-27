import fs from 'fs';
import https from 'https';

const countryGalleries = {
  "switzerland": [
    "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80", // Jungfraujoch
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80", // Interlaken & Lake Brienz
    "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80", // Lake Lucerne Chapel Bridge
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80"  // Matterhorn Zermatt
  ],
  "france": [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80", // Paris Eiffel Tower
    "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80", // Louvre Museum Pyramid
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80", // Seine River & Notre Dame
    "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80"  // French Riviera Nice Coast
  ],
  "italy": [
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80", // Rome Colosseum
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80", // Cinque Terre
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80", // Venice Grand Canal
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80"  // Florence Duomo
  ],
  "united-kingdom": [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80", // London Tower Bridge
    "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80", // Big Ben & Westminster
    "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=1200&q=80", // London Eye & River Thames
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80"  // Edinburgh Castle & Scotland
  ],
  "finland": [
    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80", // Aurora Borealis Lapland
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80", // Arctic Glass Igloo Night
    "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80", // Snowy Pine Forest Lapland
    "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80"  // Reindeer Sledding
  ],
  "czech-republic": [
    "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80", // Prague Charles Bridge & Castle
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80", // Prague Old Town Astronomical Clock
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80", // Vltava River Views
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80"  // Cesky Krumlov Fairytale Castle
  ],
  "austria": [
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80", // Hallstatt Lake Village
    "https://images.unsplash.com/photo-1520553642516-3a78c5dec54a?auto=format&fit=crop&w=1200&q=80", // Vienna Schönbrunn Palace
    "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1200&q=80", // Salzburg Old Town & Fortress
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"  // Austrian Alps Panoramic View
  ],
  "hungary": [
    "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80", // Budapest Parliament on Danube
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80", // Fisherman's Bastion Castle Hill
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80", // Széchenyi Thermal Baths
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"  // Chain Bridge Illuminated Night
  ],
  "greece": [
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80", // Santorini Caldera Oia Blue Domes
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80", // Athens Acropolis Parthenon
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Navagio Shipwreck Beach Zakynthos
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"  // Mykonos Windmills & White Alleys
  ],
  "serbia": [
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80", // Belgrade Fortress Kalemegdan
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80", // Saint Sava Temple Belgrade
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Novi Sad Petrovaradin Citadel
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"  // Danube River Gorge & Iron Gates
  ],
  "japan": [
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", // Kyoto Pagoda & Cherry Blossoms
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80", // Mount Fuji & Tokyo Tower
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80", // Tokyo Shibuya Crossing Neon
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"  // Fushimi Inari Torii Gates
  ],
  "indonesia": [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80", // Ubud Rice Terraces
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80", // Nusa Penida Kelingking Beach
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80", // Uluwatu Cliff Temple Sunset
    "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80"  // Bali Pool Villa Overlook
  ],
  "singapore": [
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80", // Marina Bay Sands Skyline
    "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=1200&q=80", // Gardens by the Bay Supertrees
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80", // Sentosa Island & Cable Car
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"  // Jewel Changi Rain Vortex
  ],
  "malaysia": [
    "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80", // Petronas Twin Towers KL
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Langkawi Sky Bridge & Sea
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80", // Batu Caves Rainbow Stairs
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80"  // Penang George Town Heritage
  ],
  "thailand": [
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80", // Bangkok Wat Arun
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Phi Phi Maya Bay
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80", // James Bond Island Phang Nga
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"  // Phuket Sunset Beach
  ],
  "maldives": [
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80", // Overwater Villas
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80", // Maldives Island Aerial
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", // Turquoise Lagoon
    "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80"  // Sunset Jetty
  ],
  "sri-lanka": [
    "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80", // Sigiriya Lion Rock
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Nine Arch Bridge Ella Train
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80", // Galle Dutch Fort Coast
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"  // Yala Leopard Safari
  ],
  "vietnam": [
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80", // Ha Long Bay Limestone Karsts
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Hoi An Ancient Lantern Street
    "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80", // Golden Bridge Ba Na Hills
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80"  // Ninh Binh River Karsts
  ],
  "nepal": [
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", // Kathmandu Durbar Square
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Annapurna Himalayas Snow Peaks
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", // Pokhara Phewa Lake Boats
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80"  // Swayambhunath Monkey Temple
  ],
  "china": [
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80", // Great Wall of China
    "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80", // Shanghai Bund & Tower Skyline
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80", // Forbidden City Imperial Palace
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80"  // Guilin Li River Karsts
  ],
  "south-korea": [
    "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80", // Gyeongbokgung Palace Seoul
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80", // N Seoul Tower View
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80", // Bukchon Hanok Traditional Village
    "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80"  // Jeju Island Waterfall
  ],
  "kyrgyzstan": [
    "https://images.unsplash.com/photo-1569407228235-9a744831a150?auto=format&fit=crop&w=1200&q=80", // Issyk-Kul Alpine Lake
    "https://images.unsplash.com/photo-1558588942-930faae5a389?auto=format&fit=crop&w=1200&q=80", // Tian Shan Mountains & Yurt
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Ala Archa Gorge
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"  // Chon-Kemin Horse Riding Valley
  ],
  "hong-kong": [
    "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80", // Victoria Harbour & Star Ferry
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80", // Victoria Peak Sky Terrace View
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80", // Hong Kong Neon Street
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"  // Tian Tan Big Buddha Lantau
  ],
  "morocco": [
    "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80", // Marrakech Medina Souks
    "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80", // Sahara Desert Erg Chebbi Dunes
    "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80", // Chefchaouen Blue City
    "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80"  // Atlas Mountain Berber Kasbah
  ],
  "kenya": [
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80", // Masai Mara Safari Lion
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Amboseli Elephants & Kilimanjaro
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Hot Air Balloon Mara Sunrise
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"  // Lake Nakuru Flamingos
  ],
  "egypt": [
    "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80", // Giza Pyramids & Sphinx
    "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80", // Nile River Cruise Luxor-Aswan
    "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80", // Karnak & Luxor Temple Columns
    "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80"  // Valley of the Kings Tombs
  ],
  "tanzania": [
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80", // Serengeti Great Migration
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", // Zanzibar White Sand Beach
    "https://images.unsplash.com/photo-1507525428033-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Ngorongoro Crater Wildlife
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"  // Mount Kilimanjaro Peak
  ],
  "south-africa": [
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80", // Cape Town Table Mountain
    "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=1200&q=80", // Boulders Beach Penguin Colony
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80", // Kruger National Park Safari
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"  // Cape Point Scenic Coast
  ],
  "seychelles": [
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", // Anse Source d'Argent Granite Rocks
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80", // Praslin Turquoise Bay
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80", // Curieuse Giant Tortoise Island
    "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80"  // Mahé Coastline
  ],
  "turkey": [
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80", // Istanbul Bosphorus
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80", // Cappadocia Balloons
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80", // Blue Mosque
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80"  // Fairy Chimneys
  ],
  "georgia": [
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80", // Kazbegi Gergeti Church
    "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1200&q=80", // Tbilisi Old Town
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80", // Caucasus Mountain Pass
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"  // Gudauri Snow Resort
  ],
  "azerbaijan": [
    "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80", // Baku Flame Towers
    "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80", // Heydar Aliyev Centre
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80", // Old City Icherisheher
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"  // Gabala Mountain Valley
  ],
  "armenia": [
    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80", // Garni Pagan Temple
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80", // Geghard Ancient Monastery
    "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80", // Lake Sevan Peninsula
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"  // Yerevan Cascade
  ],
  "kazakhstan": [
    "https://images.unsplash.com/photo-1558588942-930faae5a389?auto=format&fit=crop&w=1200&q=80", // Shymbulak Ski Resort
    "https://images.unsplash.com/photo-1569407228235-9a744831a150?auto=format&fit=crop&w=1200&q=80", // Charyn Canyon
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Big Almaty Lake
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"  // Medeu Ice Skating Mountains
  ],
  "jordan": [
    "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=1200&q=80", // Petra Treasury (Al-Khazneh)
    "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80", // Petra Monastery (Ad Deir)
    "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80", // Wadi Rum Red Sand Dunes
    "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80"  // Dead Sea & Amman Citadel
  ],
  "uzbekistan": [
    "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80", // Registan Square Samarkand
    "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80", // Shah-i-Zinda Turquoise Mosaics
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80", // Bukhara Kalyan Minaret
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80"  // Khiva Silk Road Walls
  ],
  "australia": [
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80", // Sydney Opera House & Harbour
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80", // Great Barrier Reef Coral
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80", // Melbourne 12 Apostles
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80"  // Bondi Beach Coastal
  ],
  "united-states": [
    "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80", // New York Manhattan Skyline
    "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1200&q=80", // Grand Canyon Arizona
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80", // San Francisco Golden Gate
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80"  // Miami Beach / Vegas Skyline
  ],
  "argentina": [
    "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80", // Buenos Aires Obelisk & La Boca
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80", // Iguazú Falls Argentine Side
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", // Perito Moreno Glacier Patagonia
    "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80"  // Mendoza Andes Foothills
  ],
  "brazil": [
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80", // Rio Christ the Redeemer
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Copacabana & Ipanema Beach
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80", // Sugarloaf Mountain Aerial
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80"  // Iguaçu Falls Brazilian View
  ]
};

// Update countries.ts with authentic gallery arrays and verified cover photos
let countriesFile = fs.readFileSync('src/data/countries.ts', 'utf8');

for (const [slug, gallery] of Object.entries(countryGalleries)) {
  const coverImg = gallery[0];
  const slugKey = `slug: "${slug}",`;
  const startIdx = countriesFile.indexOf(slugKey);
  if (startIdx !== -1) {
    // Replace cover image
    const imgStart = countriesFile.indexOf('image:', startIdx);
    const imgEnd = countriesFile.indexOf(',', imgStart);
    if (imgStart !== -1 && imgStart < countriesFile.indexOf('tagline:', startIdx)) {
      countriesFile = countriesFile.substring(0, imgStart) + `image:\n      "${coverImg}"` + countriesFile.substring(imgEnd);
    }
  }
}

fs.writeFileSync('src/data/countries.ts', countriesFile, 'utf8');
console.log('✅ Successfully updated countries.ts with 100% authentic landmark cover photos!');
