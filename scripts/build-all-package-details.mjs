import fs from "fs";

const detailsA = {
  "swiss-alpine-dream": {
    overview:
      "Fly out of Dubai into a week that trades desert horizons for glacier peaks and lakeside villages. This is a gently paced journey built around Switzerland's rail network, so there is no self-driving and very little waiting around, just panoramic windows, cable cars and postcard towns strung together with ease. It suits couples on a honeymoon, families wanting a first taste of snow, and anyone who prefers scenery to sightseeing checklists. Days open with breakfast by a lake and close with sunset over the Alps, punctuated by two headline excursions, Jungfraujoch and Mount Titlis.",
    gallery: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Land in Zurich from Dubai, meet private chauffeur at arrivals for VIP transfer to central hotel.",
        afternoon:
          "Check into 4★/5★ hotel, relax, and take a stroll along the Limmat river promenade.",
        evening: "Welcome Swiss dinner in historic Altstadt (Old Town).",
        overnight: "Overnight in Zurich",
      },
      {
        day: 2,
        morning:
          "Scenic train to Lucerne, walk the 14th-century wooden Chapel Bridge and Lion Monument.",
        afternoon:
          "Explore cobblestone alleys and board a luxury catamaran cruise on Lake Lucerne.",
        evening: "Lakefront dining overlooking Mount Pilatus.",
        overnight: "Overnight in Lucerne",
      },
      {
        day: 3,
        morning:
          "Ascend Mount Titlis aboard the world's first revolving Rotair cable car through alpine clouds.",
        afternoon:
          "Walk across the Titlis Cliff Walk (Europe's highest suspension bridge) and explore the Glacier Ice Cave.",
        evening: "Return to Lucerne for a relaxed fondue evening.",
        overnight: "Overnight in Lucerne",
      },
      {
        day: 4,
        morning:
          "Board the GoldenPass panoramic train toward Interlaken between Lakes Thun and Brienz.",
        afternoon:
          "Stroll the Höheweg promenade with views of the Jungfrau massif; optional tandem paragliding.",
        evening: "Traditional Swiss chalet dinner in Interlaken.",
        overnight: "Overnight in Interlaken",
      },
      {
        day: 5,
        morning:
          "Board the famous Eiger Express and cogwheel train to Jungfraujoch — Top of Europe (3,454m).",
        afternoon: "Visit the Ice Palace, Sphinx Observatory, and Alpine Sensation exhibition.",
        evening: "Descend past Lauterbrunnen waterfalls back to Interlaken.",
        overnight: "Overnight in Interlaken",
      },
      {
        day: 6,
        morning:
          "Scenic train ride to Geneva along Lake Geneva with views of Lavaux terraced vineyards.",
        afternoon:
          "Guided tour of Geneva: Jet d'Eau, Flower Clock, and United Nations headquarters.",
        evening: "Gourmet farewell dinner along the lakefront.",
        overnight: "Overnight in Geneva",
      },
      {
        day: 7,
        morning:
          "Enjoy Swiss breakfast, hotel check-out assistance, and private transfer to Geneva Airport.",
        afternoon: "Board direct Emirates / Swiss flight back to Dubai International Airport.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "4★ Superior & 5★ Luxury Palace Hotels (Zurich, Lucerne, Interlaken, Geneva)",
      roomType: "Double / Twin Mountain View Deluxe Room",
      mealPlan: "Daily Swiss Buffet Breakfast",
      note: "Lake-view upgrades and private chalet options available upon booking.",
    },
    transportation: [
      "Roundtrip private Mercedes airport transfers (Zurich & Geneva)",
      "First-Class Swiss Travel Pass with unlimited train, boat, and bus travel",
      "Jungfraujoch cogwheel train & Mount Titlis Rotair cable car tickets",
      "Lake Lucerne panoramic catamaran cruise",
    ],
    importantInfo: [
      {
        title: "Schengen Visa",
        body: "Schengen visa required for UAE residents (unless visa-exempt passport). We provide confirmed hotel vouchers, flight itinerary, and full appointment assistance.",
      },
      {
        title: "Best Time to Travel",
        body: "May to September for green alpine meadows and lakes; December to March for winter snow wonderland and skiing.",
      },
    ],
    faqs: [
      {
        q: "Are train seats reserved?",
        a: "Yes, panoramic express trains (GoldenPass) have confirmed first-class seat reservations included.",
      },
      {
        q: "Can we extend nights in Interlaken or Zermatt?",
        a: "Yes, customized extensions to Zermatt (Matterhorn) or Montreux can be added seamlessly.",
      },
    ],
  },
  "maldives-overwater-escape": {
    overview:
      "A four-hour direct hop from Dubai lands you in an overwater paradise ringed by azure lagoons. Designed for honeymooners and couples seeking ultimate privacy, this escape features luxury overwater villas with direct ocean access, house reef snorkeling with sea turtles, and private sunset sandbank dining.",
    gallery: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Arrive at Malé Velana Airport, met by resort host, board scenic seaplane/speedboat to resort island.",
        afternoon:
          "Check into private Overwater Villa with glass floor panels and direct sea ladder.",
        evening: "Sunset champagne cocktail on your private sun deck.",
        overnight: "Overnight in Private Overwater Villa",
      },
      {
        day: 2,
        morning: "Floating champagne breakfast served in your private villa infinity pool.",
        afternoon: "Guided house-reef snorkeling safari spotting manta rays and coral gardens.",
        evening: "Gourmet seafood buffet at the overwater pavilion.",
        overnight: "Overnight in Private Overwater Villa",
      },
      {
        day: 3,
        morning: "Leisure morning on white-sand beach; complimentary paddleboarding and kayaking.",
        afternoon: "Couples relaxing aromatherapy massage at the overwater glass-floor spa.",
        evening: "Sunset dolphin watching cruise with champagne and canapés.",
        overnight: "Overnight in Private Overwater Villa",
      },
      {
        day: 4,
        morning: "Speedboat excursion to a secluded private sandbank in the open ocean.",
        afternoon:
          "Private gourmet sandbank picnic lunch and swimming in untouched turquoise water.",
        evening: "Candlelit 4-course dinner set directly on the beach under the stars.",
        overnight: "Overnight in Private Overwater Villa",
      },
      {
        day: 5,
        morning: "Final breakfast overlooking the lagoon, souvenir shopping at resort boutique.",
        afternoon: "Seaplane transfer back to Malé for your direct evening flight to Dubai.",
        evening: "Arrive back in Dubai DXB.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "5★ Luxury Private Island Resort",
      roomType: "Overwater Pool Villa with direct lagoon access",
      mealPlan: "Half Board (Daily gourmet breakfast and 3-course dinner)",
      note: "All-Inclusive Premium package with unlimited beverages available.",
    },
    transportation: [
      "Roundtrip scenic seaplane or luxury speedboat transfers",
      "Dolphin cruise & sandbank excursion boats",
    ],
    importantInfo: [
      {
        title: "Free Visa on Arrival",
        body: "Maldives grants a free 30-day visa on arrival to all nationalities with valid passport and confirmed resort booking.",
      },
    ],
    faqs: [
      {
        q: "Is seaplane transfer better than speedboat?",
        a: "Seaplanes provide breathtaking aerial views of the coral atolls and are used for resorts further from Malé.",
      },
    ],
  },
  "bali-jungle-coast": {
    overview:
      "Experience the magic of Bali: 3 nights in an Ubud private pool villa surrounded by jungle ravines and rice paddies, followed by 2 nights of coastal elegance and beach clubs in Seminyak, plus a speedboat adventure to Nusa Penida.",
    gallery: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Arrive at Ngurah Rai Airport (DPS), private transfer to Ubud luxury jungle resort.",
        afternoon:
          "Check into private pool villa and unwind with a complimentary Balinese flower bath.",
        evening: "Dinner overlooking the Campuhan valley.",
        overnight: "Overnight in Ubud",
      },
      {
        day: 2,
        morning: "Visit Tegalalang Rice Terraces and take photos on the famous jungle swings.",
        afternoon:
          "Spiritual cleansing ritual at Tirta Empul Holy Water Temple and coffee tasting at a luwak plantation.",
        evening: "Traditional Balinese Kecak fire dance performance in Ubud village.",
        overnight: "Overnight in Ubud",
      },
      {
        day: 3,
        morning: "Trek through lush forest to Tibumana and Kanto Lampo waterfalls.",
        afternoon: "Explore Ubud Royal Palace and local artisan handicraft markets.",
        evening: "Romantic candlelit dinner by the jungle river.",
        overnight: "Overnight in Ubud",
      },
      {
        day: 4,
        morning:
          "Private transfer from Ubud to coastal Seminyak, stopping at Tanah Lot sea temple.",
        afternoon: "Check into 5★ beachfront resort in Seminyak and lounge by the ocean pool.",
        evening: "Sunset cocktails and dinner at Potato Head or Ku De Ta beach club.",
        overnight: "Overnight in Seminyak",
      },
      {
        day: 5,
        morning:
          "Speedboat across to Nusa Penida island, visit the iconic T-Rex shaped Kelingking Beach cliff.",
        afternoon:
          "Swim at Broken Beach and Angel's Billabong natural infinity pool with fresh seafood lunch.",
        evening: "Return to Seminyak for a farewell beachfront seafood dinner in Jimbaran Bay.",
        overnight: "Overnight in Seminyak",
      },
      {
        day: 6,
        morning: "Leisure morning, optional surfing lesson on Seminyak beach or spa treatment.",
        afternoon: "Private transfer to Denpasar Airport for your return flight to Dubai.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "5★ Private Pool Villa (Ubud) + 5★ Luxury Beachfront Resort (Seminyak)",
      roomType: "1-Bedroom Private Pool Villa & Ocean View Suite",
      mealPlan: "Daily Breakfast & 1 Romantic Dinner",
      note: "Honeymoon decorations and daily afternoon tea included.",
    },
    transportation: [
      "Private air-conditioned SUV with English-speaking driver throughout",
      "Roundtrip fast boat tickets to Nusa Penida",
    ],
    importantInfo: [
      {
        title: "Visa on Arrival",
        body: "Electronic Visa on Arrival (e-VOA) available online or at the airport for AED 125.",
      },
    ],
    faqs: [
      {
        q: "Is the Nusa Penida tour private?",
        a: "Yes, you have your own private driver-guide on Nusa Penida island.",
      },
    ],
  },
  "japan-golden-route": {
    overview:
      "The quintessential Japan itinerary: ride bullet trains between futuristic Tokyo, Mount Fuji scenic lakes, hot-spring Hakone ryokans, and the ancient temple sanctuaries of Kyoto, Nara, and Osaka.",
    gallery: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Arrive in Tokyo (Haneda/Narita), private limousine bus transfer to central Shinjuku hotel.",
        afternoon:
          "Check in, freshen up, and take an orientation walk through the illuminated streets of Shinjuku.",
        evening: "Welcome authentic ramen or teppanyaki dinner in Tokyo.",
        overnight: "Overnight in Tokyo",
      },
      {
        day: 2,
        morning:
          "Visit Tokyo's oldest temple, Senso-ji in Asakusa, and stroll Nakamise shopping street.",
        afternoon:
          "Experience the bustling Shibuya Crossing, Hachiko statue, and Meiji Shrine in Harajuku.",
        evening: "Panoramic night views from Shibuya Sky observation deck.",
        overnight: "Overnight in Tokyo",
      },
      {
        day: 3,
        morning:
          "Free day in Tokyo or optional day trip to Tokyo DisneySea / teamLab Planets digital art museum.",
        afternoon: "Shopping in luxury Ginza or electronic Akihabara district.",
        evening: "Izakaya dining experience in Omoide Yokocho.",
        overnight: "Overnight in Tokyo",
      },
      {
        day: 4,
        morning: "Travel to Hakone, board the Hakone Ropeway over volcanic Owakudani valley.",
        afternoon: "Cruise across Lake Ashi on a pirate ship with stunning views of Mount Fuji.",
        evening:
          "Check into traditional Onsen Ryokan, enjoy multi-course Kaiseki dinner and hot spring baths.",
        overnight: "Overnight in Hakone Ryokan",
      },
      {
        day: 5,
        morning: "Board the world-famous Shinkansen (Bullet Train) reaching 300 km/h to Kyoto.",
        afternoon:
          "Visit Kinkaku-ji (The Golden Pavilion) and stroll the peaceful Zen rock gardens of Ryoan-ji.",
        evening: "Evening walk through historic Gion geisha district.",
        overnight: "Overnight in Kyoto",
      },
      {
        day: 6,
        morning:
          "Walk through thousands of vibrant vermilion Torii gates at Fushimi Inari Taisha Shrine.",
        afternoon:
          "Explore Arashiyama Bamboo Grove, Tenryu-ji Temple, and the Iwatayama Monkey Park.",
        evening: "Traditional Kyoto tea ceremony experience.",
        overnight: "Overnight in Kyoto",
      },
      {
        day: 7,
        morning:
          "Day trip to Nara: bow with sacred free-roaming deer in Nara Park and view Todai-ji Great Buddha.",
        afternoon:
          "Continue to Osaka: visit Osaka Castle and explore the street food paradise of Dotonbori.",
        evening: "Taste authentic Takoyaki and Okonomiyaki in Osaka before returning to Kyoto.",
        overnight: "Overnight in Kyoto",
      },
      {
        day: 8,
        morning:
          "Enjoy Japanese breakfast, express train transfer to Kansai/Tokyo Airport for flight to Dubai.",
        afternoon: "Board Emirates / flydubai direct flight back to DXB.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "4★ Superior City Hotels (Tokyo & Kyoto) + Traditional 5★ Onsen Ryokan (Hakone)",
      roomType: "Deluxe Twin Room & Traditional Tatami Room with Futon",
      mealPlan: "Daily Breakfast & 1 Multi-Course Kaiseki Dinner",
      note: "Pocket WiFi device included throughout the trip.",
    },
    transportation: [
      "7-Day JR Whole Japan Rail Pass (Shinkansen Bullet Trains included)",
      "Hakone Freepass & Lake Ashi cruise",
      "Airport transfers",
    ],
    importantInfo: [
      {
        title: "Japan Visa",
        body: "We prepare all guarantee letters, itinerary schedules, and hotel vouchers required for Japan embassy appointments.",
      },
    ],
    faqs: [
      {
        q: "Is the JR Rail Pass activated on arrival?",
        a: "Yes, our team provides exchange orders with immediate activation at Tokyo airport.",
      },
    ],
  },
};

const detailsB = {
  "georgia-mountain-weekender": {
    overview:
      "The favorite short-haul mountain getaway from Dubai: 4 days of cobblestone Tbilisi heritage, thermal sulfur baths, Georgian wine cellars, and a 4x4 mountain ascent along the Georgian Military Highway to Gergeti Trinity Church beneath Mount Kazbek.",
    gallery: [
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Direct 3.5h flight from Dubai to Tbilisi, meet private driver for transfer to Old Town hotel.",
        afternoon:
          "Stroll along Rustaveli Avenue and ride the aerial cable car up to Narikala Fortress.",
        evening:
          "Explore the Abanotubani sulfur bath district and enjoy traditional Khachapuri dinner.",
        overnight: "Overnight in Tbilisi",
      },
      {
        day: 2,
        morning:
          "Guided walking tour through Old Tbilisi's carved wooden balconies, Bridge of Peace, and Clock Tower.",
        afternoon:
          "Excursion to Mtskheta (UNESCO ancient capital) and Jvari Monastery overlooking the river confluence.",
        evening: "Wine tasting in a historic 300-year-old underground cellar.",
        overnight: "Overnight in Tbilisi",
      },
      {
        day: 3,
        morning:
          "Drive the Georgian Military Highway into the high Caucasus, stopping at Ananuri Fortress.",
        afternoon:
          "Gudauri Friendship Monument viewpoint; switch into 4x4 Land Cruisers to climb to Gergeti Trinity Church (2,170m).",
        evening: "Traditional Georgian supra feast with live folk singing in Kazbegi.",
        overnight: "Overnight in Kazbegi / Tbilisi",
      },
      {
        day: 4,
        morning:
          "Leisure morning for mountain photography and souvenir shopping at Dry Bridge flea market.",
        afternoon:
          "Private transfer to Tbilisi International Airport for evening flight back to Dubai.",
        evening: "Arrive in Dubai DXB.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "4★ Boutique Hotel in Old Tbilisi & Mountain Lodge in Kazbegi",
      roomType: "Deluxe Double Room with Balcony",
      mealPlan: "Daily Breakfast & 1 Traditional Supra Dinner",
      note: "Rooms feature stunning views of Narikala Fortress or Caucasus peaks.",
    },
    transportation: [
      "Private Mercedes vehicle with English-speaking driver throughout",
      "4x4 Land Cruiser transfer to Gergeti Church",
    ],
    importantInfo: [
      {
        title: "Visa-Free for UAE Residents",
        body: "UAE residents with valid residency visa enter Georgia 100% visa-free on arrival for 90 days.",
      },
    ],
    faqs: [
      {
        q: "Is the drive to Kazbegi safe?",
        a: "Yes, the Georgian Military Highway is fully paved and escorted by experienced mountain drivers.",
      },
    ],
  },
  "cappadocia-sky-turkey": {
    overview:
      "A dreamlike combination of imperial Byzantine and Ottoman grandeur in Istanbul with the surreal volcanic landscapes, luxury cave suites, and sunrise hot air balloon flights in Cappadocia.",
    gallery: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Fly direct from Dubai to Istanbul, VIP private airport transfer to Sultanahmet hotel.",
        afternoon: "Check in and take an afternoon walk to the Hippodrome and German Fountain.",
        evening: "Welcome Turkish dinner with Bosphorus views.",
        overnight: "Overnight in Istanbul",
      },
      {
        day: 2,
        morning:
          "Guided tour inside Hagia Sophia, Blue Mosque, and the subterranean Basilica Cistern.",
        afternoon:
          "Tour Topkapi Palace and explore the 4,000 shops of the Grand Bazaar and Spice Market.",
        evening: "Private Bosphorus sunset yacht cruise past illuminated Ottoman palaces.",
        overnight: "Overnight in Istanbul",
      },
      {
        day: 3,
        morning:
          "Short domestic flight to Cappadocia, transfer to authentic luxury Stone Cave Hotel in Göreme.",
        afternoon:
          "Explore Göreme Open-Air Museum's rock-cut fresco churches and Uchisar Castle viewpoint.",
        evening:
          "Sunset quad biking tour through Rose & Love Valleys followed by Turkish pottery kebab dinner.",
        overnight: "Overnight in Cappadocia Cave Hotel",
      },
      {
        day: 4,
        morning:
          "Pre-dawn pickup for 1-hour Sunrise Hot Air Balloon Flight over fairy chimneys with champagne toast.",
        afternoon:
          "Explore the ancient multi-level Derinkuyu Underground City and Avanos pottery workshop.",
        evening: "Relax on cave hotel rooftop terrace under illuminated valley night skies.",
        overnight: "Overnight in Cappadocia Cave Hotel",
      },
      {
        day: 5,
        morning:
          "Turkish breakfast buffet on cave terrace, transfer to airport for domestic flight to Istanbul.",
        afternoon: "Connect to your return flight to Dubai DXB.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "4★ Boutique Hotel in Istanbul + 5★ Luxury Cave Suite in Cappadocia",
      roomType: "Deluxe Old Town Room & Stone-Carved Cave Suite with Jacuzzi",
      mealPlan: "Daily Turkish Breakfast Buffet",
      note: "Cave hotels feature modern luxury heating/AC and private terraces.",
    },
    transportation: [
      "Domestic flights Istanbul–Cappadocia return included",
      "Private airport transfers and guided touring vehicles",
      "Hot air balloon flight transfers",
    ],
    importantInfo: [
      {
        title: "Turkish eVisa",
        body: "Easy 3-minute online eVisa available for UAE residents and passport holders.",
      },
    ],
    faqs: [
      {
        q: "What happens if ballooning is cancelled due to wind?",
        a: "We schedule flights on day 4 with a backup slot on day 5 morning, with full refund if weather prevents takeoff.",
      },
    ],
  },
  "paris-french-riviera": {
    overview:
      "Experience the magic of France: 3 nights of Parisian romance, museums, and Eiffel Tower dining, paired with a high-speed TGV journey to the glamorous Mediterranean coastline of Nice, Cannes, and Monaco Monte Carlo.",
    gallery: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520939817895-060bdef4eb1b?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Arrive at Paris Charles de Gaulle (CDG), private transfer to boutique hotel near Champs-Élysées.",
        afternoon: "Check in and stroll along the Tuileries Garden and Place de la Concorde.",
        evening: "Evening illuminations cruise along the River Seine.",
        overnight: "Overnight in Paris",
      },
      {
        day: 2,
        morning: "Skip-the-line elevator access to Eiffel Tower 2nd Floor & Summit.",
        afternoon: "Explore the Louvre Museum (Mona Lisa, Venus de Milo) and Notre-Dame Cathedral.",
        evening: "Dinner in the bohemian artistic quarter of Montmartre.",
        overnight: "Overnight in Paris",
      },
      {
        day: 3,
        morning: "Half-day excursion to the opulent Palace of Versailles and Hall of Mirrors.",
        afternoon: "Shopping on Boulevard Haussmann (Galeries Lafayette) with rooftop city views.",
        evening: "Free evening to enjoy a French bistro dinner.",
        overnight: "Overnight in Paris",
      },
      {
        day: 4,
        morning: "Board the high-speed TGV train across France to the French Riviera (Nice).",
        afternoon:
          "Arrive in Nice, check into hotel, and walk the iconic Promenade des Anglais along the azure sea.",
        evening: "Seafood dinner in Old Nice (Vieux Nice) flower market square.",
        overnight: "Overnight in Nice",
      },
      {
        day: 5,
        morning:
          "Full-day French Riviera tour: red carpet at Cannes Film Palace and billionaire yachts in Antibes.",
        afternoon: "Visit medieval clifftop village of Eze and Fragonard perfume factory.",
        evening:
          "Monaco & Monte Carlo: view Prince's Palace, Grand Prix circuit, and famous Casino.",
        overnight: "Overnight in Nice",
      },
      {
        day: 6,
        morning: "Day trip to Saint-Tropez by boat or free beach day on the French Riviera.",
        afternoon: "Relax at private beach club or visit Matisse / Chagall art museums.",
        evening: "Farewell Riviera dinner overlooking the Mediterranean.",
        overnight: "Overnight in Nice",
      },
      {
        day: 7,
        morning: "Breakfast, checkout, private transfer to Nice Côte d'Azur Airport.",
        afternoon: "Flight back to Dubai.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "4★ Boutique Hotel (Paris) + 4★ Beachfront Hotel (Nice)",
      roomType: "Superior Double Room",
      mealPlan: "Daily Continental Breakfast",
      note: "Central locations close to metro stations and beachfront promenades.",
    },
    transportation: [
      "First-Class TGV High-Speed Train ticket Paris to Nice",
      "Private airport transfers",
      "Full-day French Riviera guided coach tour",
    ],
    importantInfo: [
      {
        title: "Schengen Visa",
        body: "Full documentation and visa appointment guidance provided from Dubai.",
      },
    ],
    faqs: [
      {
        q: "Can we add Disneyland Paris?",
        a: "Yes, 1-day 2-park Disneyland Paris tickets with RER train transfers can be added on day 3.",
      },
    ],
  },
  "italy-classic-grand-tour": {
    overview:
      "The grand Italian cultural journey: gladiators at the Colosseum in Rome, Michelangelo's David and Chianti vineyards in Florence, and singing gondolas on the Grand Canal of Venice.",
    gallery: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning: "Arrive in Rome Fiumicino, private transfer to central hotel near Spanish Steps.",
        afternoon: "Check in and walk to Trevi Fountain, Pantheon, and Piazza Navona.",
        evening: "Welcome authentic Roman pasta dinner in Trastevere.",
        overnight: "Overnight in Rome",
      },
      {
        day: 2,
        morning: "Skip-the-line VIP guided tour of Colosseum, Roman Forum, and Palatine Hill.",
        afternoon: "Tour Vatican Museums, Sistine Chapel, and St. Peter's Basilica.",
        evening: "Gelato tasting and evening at leisure in Rome.",
        overnight: "Overnight in Rome",
      },
      {
        day: 3,
        morning:
          "Board Frecciarossa high-speed train (1.5 hrs) to Florence, cradle of the Renaissance.",
        afternoon:
          "Guided walk: Florence Duomo, Giotto's Bell Tower, Ponte Vecchio, and Accademia Gallery.",
        evening: "Tuscan steak dinner with Chianti wine.",
        overnight: "Overnight in Florence",
      },
      {
        day: 4,
        morning:
          "Full-day excursion into the Tuscan countryside: medieval Siena and San Gimignano.",
        afternoon: "Wine tasting and lunch at a traditional Chianti vineyard estate.",
        evening: "Sunset views over Florence from Piazzale Michelangelo.",
        overnight: "Overnight in Florence",
      },
      {
        day: 5,
        morning: "High-speed train across the Apennines to floating Venice.",
        afternoon:
          "Private water taxi arrival to hotel, explore St. Mark's Square and Doge's Palace.",
        evening: "Romantic private Gondola ride through Venice's hidden canals.",
        overnight: "Overnight in Venice",
      },
      {
        day: 6,
        morning:
          "Boat trip to colorful island of Burano (lace & bright houses) and Murano (glass blowing).",
        afternoon: "Leisure afternoon for shopping and exploring Venetian bridges.",
        evening: "Seafood dinner along the Grand Canal.",
        overnight: "Overnight in Venice",
      },
      {
        day: 7,
        morning: "Free morning for photography and visiting Rialto Market.",
        afternoon: "Optional high-speed train to Milan or relax in Venice.",
        evening: "Farewell Italian dinner.",
        overnight: "Overnight in Venice",
      },
      {
        day: 8,
        morning: "Breakfast, private water taxi transfer to Venice Marco Polo Airport.",
        afternoon: "Direct flight back to Dubai DXB.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "4★ & 5★ Historic Hotels (Rome, Florence, Venice)",
      roomType: "Superior Double / Twin Room",
      mealPlan: "Daily Italian Breakfast Buffet",
      note: "Venice hotel includes direct private water dock access.",
    },
    transportation: [
      "First-Class Frecciarossa high-speed rail tickets Rome-Florence-Venice",
      "Private airport transfers and Venice water taxis",
      "Skip-the-line museum tickets",
    ],
    importantInfo: [
      {
        title: "City Taxes",
        body: "Italian city tourist taxes (approx €4-€7 per person per night) payable directly at hotel check-out.",
      },
    ],
    faqs: [
      {
        q: "Are museum tickets booked in advance?",
        a: "Yes, timed-entry skip-the-line passes for Colosseum, Vatican, and Accademia are 100% pre-booked.",
      },
    ],
  },
  "greece-santorini-athens": {
    overview:
      "The ultimate Greek romance: explore the ancient Parthenon in Athens before escaping to the blue-domed white villages, volcanic beaches, and infinity pools of Santorini.",
    gallery: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning: "Arrive in Athens from Dubai, private transfer to hotel in Plaka neighborhood.",
        afternoon: "Check in and walk through cobblestone Plaka alleys with Acropolis view.",
        evening: "Welcome Greek dinner with souvlaki and live bouzouki music.",
        overnight: "Overnight in Athens",
      },
      {
        day: 2,
        morning: "Guided tour of the Acropolis, Parthenon, and Acropolis Museum.",
        afternoon: "Syntagma Square, Panathenaic Olympic Stadium, and shopping in Monastiraki.",
        evening: "Sunset drinks overlooking the illuminated Acropolis.",
        overnight: "Overnight in Athens",
      },
      {
        day: 3,
        morning: "High-speed catamaran ferry across the Aegean Sea to Santorini.",
        afternoon:
          "Arrive in Santorini, private transfer to cliffside caldera view hotel in Oia / Fira.",
        evening: "World-famous Oia sunset viewing.",
        overnight: "Overnight in Santorini Caldera Hotel",
      },
      {
        day: 4,
        morning: "Half-day luxury catamaran cruise around the volcanic caldera.",
        afternoon:
          "Swim in the volcanic Hot Springs, Red Beach, and White Beach with onboard BBQ lunch.",
        evening: "Dinner at an overwater cliffside tavern.",
        overnight: "Overnight in Santorini",
      },
      {
        day: 5,
        morning:
          "Explore the traditional inland village of Megalochori and Akrotiri prehistoric ruins.",
        afternoon:
          "Wine tasting at Santo Wines perched on the cliff edge with panoramic caldera views.",
        evening: "Free evening for romantic strolls through Oia.",
        overnight: "Overnight in Santorini",
      },
      {
        day: 6,
        morning:
          "Leisure morning by the infinity pool, beach club day at Perissa Black Sand Beach.",
        afternoon: "Ferry or short domestic flight back to Athens.",
        evening: "Final night in Athens.",
        overnight: "Overnight in Athens",
      },
      {
        day: 7,
        morning: "Breakfast, private airport transfer to Athens Airport.",
        afternoon: "Fly direct to Dubai DXB.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "4★ Hotel in Athens + 5★ Caldera View Hotel in Santorini",
      roomType: "Caldera View Suite with Balcony / Plunge Pool",
      mealPlan: "Daily Greek Breakfast",
      note: "Santorini accommodation guarantees sunset or caldera vistas.",
    },
    transportation: [
      "High-speed SeaJets ferry tickets Athens-Santorini return",
      "Private vehicle transfers on all islands",
      "Catamaran sunset cruise",
    ],
    importantInfo: [{ title: "Schengen Visa", body: "Schengen visa required for UAE residents." }],
    faqs: [
      {
        q: "Can we fly between Athens and Santorini?",
        a: "Yes, 45-minute domestic flights on Olympic Air / Aegean can replace ferries on request.",
      },
    ],
  },
  "egypt-pharaohs-nile": {
    overview:
      "Journey into ancient antiquity: stand before the Great Pyramids and Sphinx in Cairo, then board a luxury 5-star full-board cruise sailing down the Nile between Luxor and Aswan.",
    gallery: [
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566192091743-5966a6079984?auto=format&fit=crop&w=1200&q=80",
    ],
    dayBlocks: [
      {
        day: 1,
        morning:
          "Fly direct from Dubai to Cairo, VIP airport meet & assist, private transfer to 5★ Nile-view hotel.",
        afternoon: "Check in and relax with views over the Nile river.",
        evening: "Sound & Light show at the Pyramids of Giza or dinner cruise on the Nile.",
        overnight: "Overnight in Cairo",
      },
      {
        day: 2,
        morning:
          "Private Egyptologist-guided tour of the Great Pyramids of Giza, Sphinx, and Valley Temple.",
        afternoon:
          "Tour the Grand Egyptian Museum (GEM) and National Museum of Egyptian Civilization (Royal Mummies).",
        evening: "Bustling walk through Khan el-Khalili historic bazaar.",
        overnight: "Overnight in Cairo",
      },
      {
        day: 3,
        morning: "Flight from Cairo to Luxor, board luxury 5★ Nile Cruise Ship (Check-in & Lunch).",
        afternoon:
          "Guided visit to the colossal Karnak Temple and illuminated Luxor Temple on East Bank.",
        evening: "Dinner on board with live oriental show.",
        overnight: "Overnight on 5★ Nile Cruise",
      },
      {
        day: 4,
        morning:
          "Cross to West Bank: Valley of the Kings (King Tut's tomb), Hatshepsut Temple, Colossi of Memnon.",
        afternoon:
          "Cruise sails along the scenic Nile towards Edfu, crossing the historic Esna Lock.",
        evening: "Captain's welcome cocktail and dinner while cruising.",
        overnight: "Overnight on 5★ Nile Cruise",
      },
      {
        day: 5,
        morning: "Horse-drawn carriage to Temple of Horus in Edfu, cruise towards Kom Ombo.",
        afternoon: "Visit the unique dual Temple of Sobek and Haroeris at Kom Ombo, sail to Aswan.",
        evening: "Galabeya party on board.",
        overnight: "Overnight on 5★ Nile Cruise",
      },
      {
        day: 6,
        morning:
          "Visit Aswan High Dam, Philae Temple of Isis on Agilkia island, and ride a traditional Felucca sailboat.",
        afternoon: "Transfer to Aswan Airport for flight to Cairo and connection to Dubai.",
        evening: "Arrive in Dubai.",
        overnight: "—",
      },
    ],
    accommodation: {
      category: "5★ Nile-View Hotel (Cairo) + 5★ Luxury Nile Cruise Ship",
      roomType: "Deluxe Nile View Cabin with French Balcony",
      mealPlan: "Full Board on Cruise (Breakfast, Lunch, Dinner) & Daily Breakfast in Cairo",
      note: "Cruise ship features rooftop swimming pool, sundeck, and fine dining.",
    },
    transportation: [
      "Domestic flights Cairo–Luxor and Aswan–Cairo included",
      "Private air-conditioned touring vehicles",
      "5-star luxury cruise ship",
    ],
    importantInfo: [
      {
        title: "Visa on Arrival",
        body: "UAE residents with valid residency obtain visa on arrival at Cairo airport.",
      },
    ],
    faqs: [
      {
        q: "Is Abu Simbel excursion possible?",
        a: "Yes, optional early morning excursion to Abu Simbel temples can be added on day 6.",
      },
    ],
  },
};

let codeA = `import type { PackageDetail } from "./package-detail-types";\n\nexport const packageDetailsA: Record<string, PackageDetail> = ${JSON.stringify(detailsA, null, 2)};\n`;
let codeB = `import type { PackageDetail } from "./package-detail-types";\n\nexport const packageDetailsB: Record<string, PackageDetail> = ${JSON.stringify(detailsB, null, 2)};\n`;

fs.writeFileSync("src/data/package-details-a.ts", codeA);
fs.writeFileSync("src/data/package-details-b.ts", codeB);
console.log("Saved detailed records across package-details-a.ts and package-details-b.ts!");
