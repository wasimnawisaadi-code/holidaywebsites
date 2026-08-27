import fs from 'fs';

const packages16 = [
  {
    slug: "baku-wonders",
    title: "Baku Wonders & Gabala Alpine Mountain Escape",
    destination: "Baku · Old City · Gobustan · Gabala",
    country: "Azerbaijan",
    region: "International",
    days: 4,
    nights: 3,
    styles: ["Weekend Escape", "Family", "Cultural"],
    priceStatus: "from",
    priceFrom: 1899,
    image: "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80",
    intro: "Just 3 hours from Dubai: futuristic architecture meets ancient UNESCO Silk Road stone walls, Caspian Sea promenades, and alpine cable cars.",
    story: "Explore the UNESCO-listed Icherisheher Old City, marvel at the illuminated Flame Towers, and take a day trip to Gabala's snow-capped mountains and Tufandag cable car.",
    highlights: [
      "Guided tour of Icherisheher Old Town, Maiden Tower & Shirvanshahs Palace",
      "Heydar Aliyev Center architectural masterpiece by Zaha Hadid",
      "Full-day scenic excursion to Gabala with Tufandag Mountain Cable Car",
      "Gobustan prehistoric petroglyphs and active mud volcanoes",
      "Baku Ferris Wheel and Caspian Sea Boulevard evening promenade walk",
      "4-star central hotel with daily Azerbaijani breakfast buffet",
      "Fast 3-day online eVisa document handling for UAE residents"
    ],
    route: ["Baku", "Highland Park", "Icherisheher", "Gabala", "Gobustan"],
    featured: true,
    seasonal: "Seasonal Special",
    gallery: [
      "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Fly out of Dubai into the dazzling land of fire on the shores of the Caspian Sea. Azerbaijan seamlessly blends millennia-old Silk Road caravanserais with futuristic fluid architecture designed by Zaha Hadid. This popular 4-day itinerary gives you the best of both worlds: two nights immersing yourself in the cobblestone charm of Baku's UNESCO-listed Old City and its glowing Flame Towers, followed by a scenic mountain drive into the lush Caucasian alpine valleys of Gabala. Ride the Tufandag Mountain cable car above pine forests, witness mysterious prehistoric rock art and bubbling mud volcanoes at Gobustan, and savor authentic grilled kebabs and plov in historic teahouses.",
    dayBlocks: [
      { day: 1, morning: "Direct 3-hour flight from Dubai DXB to Heydar Aliyev International Airport in Baku. VIP meet-and-greet at arrivals and private transfer to your central 4-star hotel.", afternoon: "Check into your hotel, freshen up, and take a leisurely orientation walk along Nizami Street (Torgovaya), Baku's bustling pedestrian shopping boulevard.", evening: "Head to Highland Park (Dagustu Park) for panoramic sunset views over Baku Bay and the illuminated Flame Towers LED light show.", overnight: "Overnight at 4★ Central Hotel, Baku", meals: "No meals (flight arrival)" },
      { day: 2, morning: "Guided walking tour of Icherisheher (Old City), visiting the 12th-century Maiden Tower, Palace of the Shirvanshahs, and ancient stone caravanserais.", afternoon: "Visit the world-renowned Heydar Aliyev Center for photo opportunities of its flowing curved architecture, followed by a walk along Baku Seaside Boulevard.", evening: "Traditional Azerbaijani dinner at a historic Old City restaurant featuring saj, dolma, and live traditional mugam folk music.", overnight: "Overnight at 4★ Central Hotel, Baku", meals: "Breakfast included" },
      { day: 3, morning: "Depart on a full-day guided excursion to Gabala in the Caucasus Mountains, passing scenic pine valleys and Nohur Lake.", afternoon: "Ride all 4 lines of the Tufandag Mountain Cable Car up to 1,920 meters for breathtaking Caucasian panoramas; visit 7 Beauties Waterfall.", evening: "Return to Baku in the evening; free time for shopping at Park Bulvar or 28 Mall on the Caspian waterfront.", overnight: "Overnight at 4★ Central Hotel, Baku", meals: "Breakfast included" },
      { day: 4, morning: "Excursion to Gobustan National Park to explore 40,000-year-old prehistoric rock carvings and the active bubbling mud volcanoes.", afternoon: "Visit Ateshgah Fire Temple and Yanar Dag (Burning Mountain natural gas flame) before private transfer to Baku International Airport.", evening: "Board your direct flight back to Dubai International Airport (DXB).", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "3 Nights accommodation in a handpicked 4★ central Baku hotel",
      "Daily Azerbaijani and continental buffet breakfast",
      "Roundtrip airport transfers by private air-conditioned vehicle",
      "Full-day guided Gabala mountain excursion with Tufandag cable car tickets",
      "Baku city tour and Gobustan & Fire Mountain guided tour",
      "Professional English / Arabic speaking certified guide throughout",
      "All national park and museum entrance fees as per itinerary",
      "24/7 dedicated travel support desk from our Dubai headquarters",
      "Full electronic visa (eVisa) processing assistance for UAE residents"
    ],
    exclusions: [
      "International flights Dubai–Baku–Dubai (available at special agent rates)",
      "Lunch and dinner meals not specified in the itinerary",
      "Personal expenses, room service, laundry, and telephone calls",
      "Optional adventure activities at Gabala Shooting Club",
      "Comprehensive travel insurance"
    ],
    accommodation: {
      category: "4-Star Superior Central Hotel (e.g. Winter Park Hotel / Central Park Hotel)",
      roomType: "Deluxe City View Room with King or Twin Beds",
      mealPlan: "Daily Breakfast Buffet",
      note: "5-Star luxury upgrade to Four Seasons Baku or Fairmont Flame Towers available upon request."
    },
    transportation: [
      "Private air-conditioned Mercedes vehicle throughout the itinerary",
      "All airport and hotel transfers included",
      "Tufandag Mountain Cable Car multi-level passes included"
    ],
    importantInfo: [
      { title: "Visa Requirements", body: "UAE residents with valid residency obtain easy ASAN online eVisa within 3 business days, or visa on arrival depending on national passport." },
      { title: "Passport Validity", body: "Passports must be valid for at least 6 months beyond the date of entry into Azerbaijan." }
    ],
    faqs: [
      { q: "How long is the flight from Dubai to Baku?", a: "Direct flights on flydubai, Azerbaijan Airlines, and Emirates take only 2 hours and 55 minutes from Dubai (DXB)." },
      { q: "Is Azerbaijan suitable for families with children?", a: "Yes, Baku is exceptionally safe, clean, and pedestrian-friendly with Ferris wheels, cable cars, and open parks." },
      { q: "Do UAE residents need a visa for Azerbaijan?", a: "Most GCC and UAE residents can get a fast online eVisa or visa on arrival; our team handles the application for you." }
    ]
  },
  {
    slug: "salalah-khareef-monsoon",
    title: "Salalah Khareef Misty Green Mountains by Luxury Bus & Flight",
    destination: "Salalah · Wadi Darbat · Ayn Athum · Mughsail Beach · Haffa Souq",
    country: "Oman",
    region: "International",
    days: 4,
    nights: 3,
    styles: ["Weekend Escape", "Adventure", "Family"],
    priceStatus: "from",
    priceFrom: 1299,
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    intro: "Experience the legendary Arabian monsoon: emerald green mountains, flowing waterfalls, and cool 22°C misty mountain breezes in southern Oman.",
    story: "Witness the miracle of the Khareef season where the desert transforms into a lush green tropical paradise with cascading waterfalls and dramatic coastal blowholes.",
    highlights: [
      "Wadi Darbat emerald lakes, natural springs, and cascading waterfalls",
      "Mughsail Beach and natural marine blowholes blasting sea spray 30m high",
      "Jabal Samhan mountain summit viewpoint above the cloud layer",
      "Ayn Razat and Ayn Athum lush rainforest seasonal waterfalls",
      "Haffa Souq authentic Frankincense market and coconut fruit stalls",
      "Choice of Luxury Express VIP Bus from Dubai or direct flight package",
      "3-star to 5-star hotel options with daily breakfast"
    ],
    route: ["Dubai", "Haffa", "Wadi Darbat", "Mughsail", "Ayn Athum"],
    featured: true,
    seasonal: "Seasonal Special",
    gallery: [
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Every summer between July and September, an extraordinary natural phenomenon transforms the southern Dhofar region of Oman into a lush, mist-shrouded green wonderland known as Khareef. While the rest of the Arabian Gulf experiences peak summer heat, Salalah enjoys crisp 22°C temperatures, gentle drizzle, flowing freshwater wadis, and roaming camel herds grazing on emerald green mountain pastures. This signature 4-day package departs directly from Dubai—available via luxury sleeper-coach bus or direct 1.5-hour flight—taking you to the cascading waterfalls of Wadi Darbat, the dramatic rock blowholes of Mughsail, the highest peaks of Jabal Samhan, and the aromatic frankincense souqs of historic Salalah.",
    dayBlocks: [
      { day: 1, morning: "Depart Dubai early morning aboard our luxury air-conditioned executive coach (or fly direct DXB–SLL on flydubai/SalamAir). Smooth border crossing into Oman.", afternoon: "Scenic arrival into the misty green hills of Salalah. Check into your hotel and refresh.", evening: "Visit Haffa Beach coconut and tropical banana fruit stalls; sip fresh tender coconut water and explore the traditional Frankincense souq.", overnight: "Overnight in Salalah City Hotel", meals: "Dinner included on bus package" },
      { day: 2, morning: "Guided excursion to eastern Dhofar: visit the breathtaking Wadi Darbat with emerald-green lagoons, boat rides, and cascading waterfalls.", afternoon: "Drive up the mountain pass to Mirbat and Taqah Castle; witness the dramatic view from Taqah plateau overlooking the Arabian Sea.", evening: "Relax at Ayn Razat natural spring gardens surrounded by lush lotus flowers and mountain hills.", overnight: "Overnight in Salalah City Hotel", meals: "Breakfast included" },
      { day: 3, morning: "Tour western Salalah: travel along the dramatic coastal highway to Mughsail Beach and witness the natural Marneef Cave and water blowholes.", afternoon: "Ascend the zig-zag mountain road of Sarfait towards the Yemen border with panoramic views over the misty Indian Ocean cliffs.", evening: "Traditional Omani barbecue dinner featuring local camel meat (Mudhbi) cooked on hot desert stones.", overnight: "Overnight in Salalah City Hotel", meals: "Breakfast included" },
      { day: 4, morning: "Visit Sultan Qaboos Grand Mosque in Salalah and Ayn Athum seasonal waterfall for final photography.", afternoon: "Board return executive coach or transfer to Salalah Airport for flight back to Dubai.", evening: "Arrive back in Dubai DXB with unforgettable green monsoon memories.", overnight: "Arrival home", meals: "Breakfast included" }
    ],
    inclusions: [
      "3 Nights hotel accommodation in central Salalah",
      "Daily breakfast buffet at the hotel",
      "Roundtrip transportation from Dubai by Luxury Executive Bus or Flight",
      "Full-day guided tours to East and West Salalah in 4x4 / touring coach",
      "Wadi Darbat boat ride and nature park entry tickets",
      "Mughsail Beach blowholes & Marneef Cave excursion",
      "Experienced bilingual Omani tour leader throughout the trip",
      "Oman visa documentation support for UAE residents"
    ],
    exclusions: [
      "Oman tourist visa fee",
      "Lunch meals during sightseeing stops",
      "Personal shopping and frankincense purchases",
      "Travel insurance"
    ],
    accommodation: {
      category: "3★ / 4★ City Hotel or 5★ Beach Resort (e.g. Millennium Resort Salalah)",
      roomType: "Standard or Mountain View Deluxe Double Room",
      mealPlan: "Daily Breakfast",
      note: "Family suite and 2-bedroom interconnected apartment options available."
    },
    transportation: [
      "Luxury long-haul executive coach with reclining seats, USB charging, and AC",
      "Optional flight upgrade on flydubai / SalamAir (1 hour 45 mins)",
      "4x4 / Coach transport for all mountain and wadi excursions in Salalah"
    ],
    importantInfo: [
      { title: "Oman Entry Rules", body: "UAE residents with approved professional designations receive GCC resident visa on arrival or online e-Visa for OMR 5 (AED 48)." },
      { title: "Khareef Season Dates", body: "The Khareef monsoon season runs from late June through early September annually, with peak lush greenery in July and August." }
    ],
    faqs: [
      { q: "How long is the bus journey from Dubai to Salalah?", a: "The executive coach takes approximately 12–14 hours with regular rest stops at food courts, fuel plazas, and border immigration." },
      { q: "Can we book the flight package instead of the bus?", a: "Yes, we offer daily flight packages with flydubai and SalamAir taking just 1 hour 45 minutes direct." }
    ]
  },
  {
    slug: "umrah-17-nights",
    title: "17 Nights Umrah Spiritual Journey - Makkah & Madinah (3★/4★/5★)",
    destination: "Makkah Al Mukarramah · Madinah Al Munawwarah",
    country: "Saudi Arabia",
    region: "International",
    days: 18,
    nights: 17,
    styles: ["Cultural", "Family", "Luxury"],
    priceStatus: "from",
    priceFrom: 3499,
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
    intro: "Complete spiritual fulfillment: 10 nights in Makkah near Masjid Al Haram and 7 nights in Madinah near the Prophet's Mosque with Haramain High-Speed Train.",
    story: "Perform Umrah with complete peace of mind. Our dedicated religious guides handle your visa, luxury hotel bookings steps from the Haram, Ziyarat tours, and 24/7 ground assistance.",
    highlights: [
      "10 Nights in Makkah within walking distance of Masjid Al Haram",
      "7 Nights in Madinah close to Al Masjid An Nabawi",
      "Saudi Umrah Visa processing with medical insurance included",
      "Haramain High-Speed Bullet Train tickets between Makkah and Madinah",
      "Comprehensive Ziyarat historical tours in both Holy Cities",
      "Dedicated bilingual religious guides for Umrah performance",
      "VIP private or luxury bus transfers from Dubai / Jeddah / Madinah"
    ],
    route: ["Jeddah", "Makkah Al Mukarramah", "Madinah Al Munawwarah"],
    featured: true,
    seasonal: "Seasonal Special",
    gallery: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Nawi Saadi Travel & Tourism has arranged blessed Umrah journeys for over 15 years with accredited Saudi Ministry of Hajj & Umrah licensing and dedicated offices in Jeddah and Kabul. This comprehensive 17-night pilgrimage package is meticulously organized to give you abundant time for worship, prayer in the Holy Mosques, Tahajjud, and reflection without rushing. Spend 10 spiritual nights in Makkah performing Umrah and Tawaf, followed by 7 serene nights in Madinah paying respects at the Rawdah of Prophet Muhammad (PBUH). Travel seamlessly between the holy cities aboard the state-of-the-art Haramain High-Speed bullet train, and visit historical Islamic heritage sites with knowledgeable scholars.",
    dayBlocks: [
      { day: 1, morning: "Depart Dubai on direct flight to Jeddah King Abdulaziz International Airport (or executive luxury Umrah coach). Enter Ihram with guidance.", afternoon: "VIP airport reception and private transfer to your hotel in Makkah Al Mukarramah. Check in and rest.", evening: "Perform your first Umrah (Tawaf, Sa'i between Safa & Marwah, and Halq/Taqseer) escorted by our experienced Mutawwif guide.", overnight: "Overnight at Makkah Hotel near Haram", meals: "No meals (travel day)" },
      { day: 2, morning: "Fajr prayers at Masjid Al Haram, followed by breakfast and rest.", afternoon: "Spiritual lecture on the virtues of Tawaf and Quran recitation in the Haram.", evening: "Maghrib and Isha prayers at the Kaaba, followed by free time for personal worship.", overnight: "Overnight at Makkah Hotel near Haram", meals: "Breakfast included" },
      { day: 3, morning: "Makkah Ziyarat Tour: visit Jabal Al Noor (Cave of Hira), Jabal Thawr, Mina, Muzdalifah, and Mount Arafat (Jabal Al Rahmah).", afternoon: "Return to Masjid Al Haram for Dhuhr and Asr prayers.", evening: "Evening worship and voluntary Tawaf under the illuminated minarets.", overnight: "Overnight at Makkah Hotel near Haram", meals: "Breakfast included" },
      { day: 11, morning: "Perform Farewell Tawaf (Tawaf Al-Wada) in Makkah, hotel checkout, and transfer to Makkah Haramain Train Station.", afternoon: "Ride the 300 km/h Haramain High-Speed Bullet Train through the desert to the illuminated city of Madinah Al Munawwarah (2 hours).", evening: "Check into Madinah hotel, offer first Salam at Al Masjid An Nabawi, and pray in the blessed Prophet's Mosque.", overnight: "Overnight at Madinah Hotel near Haram", meals: "Breakfast included" },
      { day: 18, morning: "Final prayers and Salam at Al Masjid An Nabawi, hotel check-out, and private transfer to Prince Mohammad Bin Abdulaziz Airport in Madinah.", afternoon: "Board direct flight back to Dubai International Airport (DXB).", evening: "Arrive in Dubai spiritually rejuvenated with your blessed Umrah fulfilled.", overnight: "Arrival home", meals: "Breakfast included" }
    ],
    inclusions: [
      "10 Nights hotel accommodation in Makkah Al Mukarramah",
      "7 Nights hotel accommodation in Madinah Al Munawwarah",
      "Saudi Umrah electronic visa with mandatory COVID/medical insurance",
      "Haramain High Speed Bullet Train ticket between Makkah & Madinah",
      "Comprehensive guided Ziyarat historical tours in Makkah and Madinah",
      "Experienced religious scholar / Mutawwif to guide Umrah rituals",
      "Zamzam water can (5 Liters) provided per pilgrim at airport departure",
      "24/7 on-ground assistance from our permanent Jeddah & Madinah offices"
    ],
    exclusions: [
      "International flights (can be bundled with flydubai, Saudia, or Emirates)",
      "Lunch and dinner meals",
      "Personal expenses, laundry, and international roaming"
    ],
    accommodation: {
      category: "Choice of 3★ Economy (500m), 4★ Superior (200m), or 5★ Clock Tower Luxury (Front Row)",
      roomType: "Double, Triple, or Quad Sharing Rooms with En-suite Bathrooms",
      mealPlan: "Daily Breakfast Buffet",
      note: "5★ packages include Swissôtel, Pullman Zamzam, or Fairmont Clock Tower with direct Haram courtyard elevators."
    },
    transportation: [
      "Private VIP GMC Yukon / luxury touring coach transfers",
      "Haramain High-Speed Train Business or Economy class tickets",
      "Private touring vehicle for Makkah & Madinah Ziyarat excursions"
    ],
    importantInfo: [
      { title: "Nusuk App Permits", body: "We register and issue your official Rawdah Sharif prayer permit via the Saudi Nusuk platform." },
      { title: "Visa Documentation", body: "Only passport copy and white-background photo required for 1-year multiple entry Saudi tourist/Umrah visa." }
    ],
    faqs: [
      { q: "Is the Haramain bullet train included?", a: "Yes, our package includes the 300 km/h Haramain high-speed train connecting Makkah and Madinah in just 2 hours." },
      { q: "Can women perform Umrah without a Mahram?", a: "Yes, under current Saudi regulations, women of all ages can travel for Umrah without a Mahram." }
    ]
  },
  {
    slug: "bosnian-delight",
    title: "Bosnian Delight: Sarajevo, Mostar & Kravice Waterfalls",
    destination: "Sarajevo · Mostar · Konjic · Blagaj · Kravice Falls",
    country: "Bosnia and Herzegovina",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Cultural", "Family", "Adventure"],
    priceStatus: "from",
    priceFrom: 2899,
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
    intro: "Turquoise rivers, Ottoman stone bridges, lush green valleys, and emerald waterfalls in the heart of the Balkans — just 5 hours from Dubai.",
    story: "Explore Sarajevo's historic Baščaršija bazaar, watch daring divers leap from Mostar's UNESCO Old Bridge, and relax at the majestic Kravice Waterfalls.",
    highlights: [
      "Guided walking tour of Sarajevo's Ottoman Baščaršija Old Town",
      "UNESCO-listed Old Bridge (Stari Most) of Mostar with riverfront dining",
      "Kravice Waterfalls nature park with boat rides and swimming",
      "Blagaj Tekke 600-year-old Dervish monastery at the Buna river cave spring",
      "Vrelo Bosne natural spring park and Konjic historic stone bridge",
      "4-star mountain and river view hotels with daily breakfast",
      "Direct flight support and visa guidance for UAE residents"
    ],
    route: ["Sarajevo", "Konjic", "Mostar", "Blagaj", "Kravice"],
    featured: true,
    seasonal: "Seasonal Special",
    gallery: [
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Bosnia and Herzegovina is one of Europe's most enchanting and budget-friendly treasures. Nestled amidst the Dinaric Alps, it features crystal-clear emerald rivers, dramatic limestone canyons, cascading waterfalls, and a rich cultural fusion where East meets West. This signature 6-day journey from Dubai takes you through the cobblestone alleys and copper bazaars of Sarajevo, across the legendary Ottoman stone bridge of Mostar, to the serene 16th-century cliffside Dervish monastery of Blagaj, and the breathtaking turquoise cascades of Kravice Waterfalls.",
    dayBlocks: [
      { day: 1, morning: "Fly direct from Dubai (DXB) to Sarajevo International Airport (SJJ). Meet private English-speaking chauffeur at arrivals.", afternoon: "Transfer to your 4★ central Sarajevo hotel, check in, and enjoy a traditional Bosnian coffee in the Baščaršija square.", evening: "Take a scenic ride on the Sarajevo Cable Car up to Mount Trebević for sunset views over the entire city.", overnight: "Overnight in Sarajevo", meals: "No meals (arrival day)" },
      { day: 2, morning: "Guided tour of Sarajevo: Latin Bridge, Gazi Husrev-beg Mosque, Sahat Kula Clock Tower, and the Tunnel of Hope museum.", afternoon: "Visit Vrelo Bosne, the lush natural springs of the River Bosna, with horse-drawn carriage rides along tree-lined avenues.", evening: "Traditional Bosnian dinner featuring authentic Ćevapi and Burek pastries in the Old Town.", overnight: "Overnight in Sarajevo", meals: "Breakfast included" },
      { day: 3, morning: "Scenic drive through the Neretva river canyon to Konjic; visit the 6-arch Ottoman Stone Bridge and Tito's subterranean nuclear bunker.", afternoon: "Continue to Jablanica for famous spit-roasted lamb by the river before driving to sunny Mostar.", evening: "Check into Mostar hotel and stroll the cobblestone lanes of Kujundžiluk bazaar as the Old Bridge illuminates at night.", overnight: "Overnight in Mostar", meals: "Breakfast included" },
      { day: 4, morning: "Tour Mostar's UNESCO-listed Old Bridge (Stari Most), Koski Mehmed Pasha Mosque, and Turkish House (Kajtaz).", afternoon: "Visit Blagaj Tekke, the 600-year-old Dervish monastery built into a 200m vertical cliff at the source of the emerald Buna River.", evening: "Dine on fresh Buna river trout at a cliffside waterside restaurant.", overnight: "Overnight in Mostar", meals: "Breakfast included" },
      { day: 5, morning: "Full-day trip to Kravice Waterfalls — a 120-meter wide natural amphitheater of 25m cascading waterfalls surrounded by lush greenery.", afternoon: "Swim in the emerald pools, take a wooden boat tour under the falls, and visit the medieval fortified stone village of Počitelj.", evening: "Return to Sarajevo for your final evening in Bosnia.", overnight: "Overnight in Sarajevo", meals: "Breakfast included" },
      { day: 6, morning: "Breakfast, free time for souvenir copper shopping in Baščaršija, and private transfer to Sarajevo Airport.", afternoon: "Board direct return flight to Dubai DXB.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "5 Nights accommodation in central 4★ hotels (Sarajevo & Mostar)",
      "Daily international and Bosnian breakfast buffet",
      "Private roundtrip airport transfers in luxury Mercedes vehicle",
      "Full private vehicle and driver for all intercity tours",
      "Entrance tickets to Kravice Waterfalls, Blagaj Tekke, and Tunnel of Hope",
      "Professional English / Arabic speaking certified local tour guide",
      "Schengen / Bosnia visa assistance for UAE residents"
    ],
    exclusions: [
      "International flights Dubai–Sarajevo–Dubai",
      "Lunch and dinner meals not specified",
      "Personal expenses and tips for drivers/guides",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Boutique Hotels (e.g. Hotel Europe Sarajevo & Hotel Mepas Mostar)",
      roomType: "Superior City View Double Room",
      mealPlan: "Daily Breakfast Buffet",
      note: "5★ luxury upgrade to Swissôtel Sarajevo available upon request."
    },
    transportation: [
      "Private Mercedes V-Class / Sprinter with dedicated English-speaking driver",
      "Sarajevo Cable Car tickets included",
      "All fuel, highway tolls, and parking fees covered"
    ],
    importantInfo: [
      { title: "Visa Requirements", body: "UAE nationals and holders of valid multiple-entry Schengen, UK, or USA visas enter Bosnia 100% visa-free for 30 days." },
      { title: "Halal Destination", body: "Bosnia is one of Europe's premier Halal destinations with Halal-certified food everywhere and prayer facilities in every city." }
    ],
    faqs: [
      { q: "How long is the flight from Dubai to Sarajevo?", a: "Direct flights on flydubai take approximately 5 hours and 30 minutes from Dubai (DXB)." },
      { q: "Is Bosnia safe for family travel?", a: "Bosnia is remarkably safe, family-friendly, and hospitable with pristine nature and very low crime rates." }
    ]
  },
  {
    slug: "swiss-alpine-dream",
    title: "Swiss Alpine Dream & Panoramic Rail",
    destination: "Zurich · Lucerne · Interlaken · Jungfraujoch",
    country: "Switzerland",
    region: "International",
    days: 7,
    nights: 6,
    styles: ["Luxury", "Family", "Honeymoon"],
    priceStatus: "from",
    priceFrom: 5499,
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    intro: "Seven days across turquoise lakes, glacier peaks and postcard villages, travelling on Switzerland's world-famous scenic rail network.",
    story: "Wake up to lake mist in Lucerne, ascend above the clouds to Jungfraujoch (Top of Europe), and watch the Alps glide past panoramic train windows.",
    highlights: [
      "Jungfraujoch — Top of Europe cogwheel railway",
      "Mount Titlis Rotair revolving cable car & Cliff Walk",
      "GoldenPass panoramic scenic train journey",
      "Sunset catamaran cruise on Lake Lucerne",
      "4-star central hotels with daily Swiss breakfast",
      "Schengen visa document support from Dubai"
    ],
    route: ["Zurich", "Lucerne", "Interlaken", "Jungfraujoch", "Geneva"],
    featured: true,
    seasonal: "European Summer & Winter Classic",
    gallery: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Fly out of Dubai into a week that trades desert horizons for glacier peaks and lakeside villages. This is a gently paced journey built around Switzerland's rail network, so there is no self-driving and very little waiting around, just panoramic windows, cable cars and postcard towns strung together with ease. It suits couples on a honeymoon, families wanting a first taste of snow, and anyone who prefers scenery to sightseeing checklists. Days open with breakfast by a lake and close with sunset over the Alps, punctuated by two headline excursions, Jungfraujoch and Mount Titlis.",
    dayBlocks: [
      { day: 1, morning: "Land in Zurich from Dubai, meet private chauffeur at arrivals for VIP transfer to central hotel.", afternoon: "Check into 4★/5★ hotel, relax, and take a stroll along the Limmat river promenade.", evening: "Welcome Swiss dinner in historic Altstadt (Old Town).", overnight: "Overnight in Zurich", meals: "No meals" },
      { day: 2, morning: "Scenic train to Lucerne, walk the 14th-century wooden Chapel Bridge and Lion Monument.", afternoon: "Explore cobblestone alleys and board a luxury catamaran cruise on Lake Lucerne.", evening: "Lakefront dining overlooking Mount Pilatus.", overnight: "Overnight in Lucerne", meals: "Breakfast included" },
      { day: 3, morning: "Ascend Mount Titlis aboard the world's first revolving Rotair cable car through alpine clouds.", afternoon: "Walk across the Titlis Cliff Walk and explore the Glacier Ice Cave.", evening: "Return to Lucerne for a relaxed fondue evening.", overnight: "Overnight in Lucerne", meals: "Breakfast included" },
      { day: 4, morning: "Board the GoldenPass panoramic train toward Interlaken between Lakes Thun and Brienz.", afternoon: "Stroll the Höheweg promenade with views of the Jungfrau massif.", evening: "Traditional Swiss chalet dinner in Interlaken.", overnight: "Overnight in Interlaken", meals: "Breakfast included" },
      { day: 5, morning: "Board the famous Eiger Express and cogwheel train to Jungfraujoch — Top of Europe (3,454m).", afternoon: "Visit the Ice Palace, Sphinx Observatory, and Alpine Sensation exhibition.", evening: "Descend past Lauterbrunnen waterfalls back to Interlaken.", overnight: "Overnight in Interlaken", meals: "Breakfast included" },
      { day: 6, morning: "Scenic train ride to Geneva along Lake Geneva with views of Lavaux terraced vineyards.", afternoon: "Guided tour of Geneva: Jet d'Eau, Flower Clock, and United Nations headquarters.", evening: "Gourmet farewell dinner along the lakefront.", overnight: "Overnight in Geneva", meals: "Breakfast included" },
      { day: 7, morning: "Enjoy Swiss breakfast, hotel check-out assistance, and private transfer to Geneva Airport.", afternoon: "Board direct Emirates / Swiss flight back to Dubai International Airport.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "6 Nights accommodation in handpicked 4★ & 5★ Swiss hotels",
      "Daily Swiss buffet breakfast",
      "First-Class Swiss Travel Pass with unlimited train, boat, and bus travel",
      "Jungfraujoch Top of Europe cogwheel railway ticket",
      "Mount Titlis Rotair revolving cable car & Cliff Walk ticket",
      "Lake Lucerne panoramic catamaran cruise",
      "Roundtrip airport transfers by private vehicle",
      "Full Schengen visa documentation support"
    ],
    exclusions: [
      "International flights Dubai–Zurich / Geneva–Dubai",
      "Lunch and dinner meals not specified",
      "Optional adventure activities (paragliding, helicopter tours)",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Superior & 5★ Palace Hotels (Zurich, Lucerne, Interlaken, Geneva)",
      roomType: "Double / Twin Mountain View Deluxe Room",
      mealPlan: "Daily Swiss Buffet Breakfast",
      note: "Lake-view upgrades and private chalet options available upon booking."
    },
    transportation: [
      "Roundtrip private Mercedes airport transfers (Zurich & Geneva)",
      "First-Class Swiss Travel Pass with unlimited train, boat, and bus travel",
      "Jungfraujoch cogwheel train & Mount Titlis Rotair cable car tickets"
    ],
    importantInfo: [
      { title: "Schengen Visa", body: "Schengen visa required for UAE residents (unless visa-exempt passport). We provide confirmed hotel vouchers, flight itinerary, and full appointment assistance." }
    ],
    faqs: [
      { q: "Are train seats reserved?", a: "Yes, panoramic express trains (GoldenPass) have confirmed first-class seat reservations included." },
      { q: "Can we extend nights in Interlaken or Zermatt?", a: "Yes, customized extensions to Zermatt (Matterhorn) or Montreux can be added seamlessly." }
    ]
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
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
    intro: "The definitive tropical honeymoon: private overwater villa with direct ocean staircase, house reef snorkeling, and seaplane transfers.",
    story: "Four hours direct from Dubai lands you in an overwater villa over crystal lagoons. Snorkel with sea turtles and dine under the stars on a private sandbank.",
    highlights: [
      "5-star private overwater villa with direct lagoon access",
      "Roundtrip scenic speedboat or seaplane transfers from Malé",
      "Sunset dolphin cruise and sandbank private picnic",
      "Complimentary snorkeling gear and non-motorized water sports",
      "Half board dining (daily breakfast and gourmet dinner)",
      "Free 30-day visa on arrival for UAE residents"
    ],
    route: ["Dubai DXB", "Malé Velana", "Private Resort Island"],
    featured: true,
    seasonal: "Year-Round Island Romance",
    gallery: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "A four-hour direct hop from Dubai lands you in an overwater paradise ringed by azure lagoons. Designed for honeymooners and couples seeking ultimate privacy, this escape features luxury overwater villas with direct ocean access, house reef snorkeling with sea turtles, and private sunset sandbank dining.",
    dayBlocks: [
      { day: 1, morning: "Arrive at Malé Velana Airport, met by resort host, board scenic seaplane/speedboat to resort island.", afternoon: "Check into private Overwater Villa with glass floor panels and direct sea ladder.", evening: "Sunset champagne cocktail on your private sun deck.", overnight: "Overnight in Private Overwater Villa", meals: "Dinner included" },
      { day: 2, morning: "Floating champagne breakfast served in your private villa infinity pool.", afternoon: "Guided house-reef snorkeling safari spotting manta rays and coral gardens.", evening: "Gourmet seafood buffet at the overwater pavilion.", overnight: "Overnight in Private Overwater Villa", meals: "Breakfast & Dinner" },
      { day: 3, morning: "Leisure morning on white-sand beach; complimentary paddleboarding and kayaking.", afternoon: "Couples relaxing aromatherapy massage at the overwater glass-floor spa.", evening: "Sunset dolphin watching cruise with champagne and canapés.", overnight: "Overnight in Private Overwater Villa", meals: "Breakfast & Dinner" },
      { day: 4, morning: "Speedboat excursion to a secluded private sandbank in the open ocean.", afternoon: "Private gourmet sandbank picnic lunch and swimming in untouched turquoise water.", evening: "Candlelit 4-course dinner set directly on the beach under the stars.", overnight: "Overnight in Private Overwater Villa", meals: "Breakfast & Dinner" },
      { day: 5, morning: "Final breakfast overlooking the lagoon, souvenir shopping at resort boutique.", afternoon: "Seaplane transfer back to Malé for your direct evening flight to Dubai.", evening: "Arrive back in Dubai DXB.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "4 Nights in a 5★ Luxury Overwater Lagoon Villa",
      "Half Board Meal Plan (Daily international breakfast & 3-course dinner)",
      "Roundtrip scenic seaplane or executive speedboat transfers from Malé",
      "Sunset dolphin watching boat cruise",
      "Private sandbank excursion with setup",
      "Complimentary snorkeling equipment and sea kayaks",
      "Free 30-day tourist visa on arrival"
    ],
    exclusions: [
      "International flights Dubai–Malé–Dubai",
      "Alcoholic beverages and motorized watersports",
      "Personal spa treatments and scuba diving courses",
      "Travel insurance"
    ],
    accommodation: {
      category: "5★ Luxury Private Island Resort (e.g. Adaaran Prestige / Centara Grand / Sheraton Full Moon)",
      roomType: "Overwater Pool Villa with direct ocean staircase",
      mealPlan: "Half Board (Breakfast & Dinner)",
      note: "All-Inclusive Premium package upgrade available on request."
    },
    transportation: [
      "Roundtrip seaplane or speedboat transfers Malé Airport to Resort",
      "Private boat for dolphin cruise and sandbank picnic"
    ],
    importantInfo: [
      { title: "Free Visa on Arrival", body: "Maldives grants a free 30-day visa on arrival to all nationalities with valid passport and confirmed resort booking." }
    ],
    faqs: [
      { q: "Is seaplane transfer better than speedboat?", a: "Seaplanes provide breathtaking aerial views of the coral atolls and are used for resorts further from Malé." },
      { q: "Can we upgrade to an All-Inclusive package?", a: "Yes, All-Inclusive Dine-Around packages with unlimited drinks and afternoon tea can be added." }
    ]
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
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
    intro: "Just 3.5 hours from Dubai: sulfur bathhouses, cobblestone alleys, and 4x4 mountain drives to the iconic Gergeti Trinity Church.",
    story: "Drive the Georgian Military Highway past turquoise reservoirs and snow-dusted Caucasus peaks before enjoying authentic khinkali and Georgian wine cellars.",
    highlights: [
      "Tbilisi Old Town walking tour and Narikala cable car",
      "4x4 Land Cruiser climb to Gergeti Trinity Church beneath Mount Kazbek",
      "Scenic stops at Ananuri Fortress and Gudauri Friendship Monument",
      "Traditional Georgian supra dinner with folk music",
      "4-star boutique hotel stay with daily breakfast",
      "Visa-free entry for UAE residents"
    ],
    route: ["Tbilisi", "Ananuri", "Gudauri", "Stepantsminda Kazbegi"],
    featured: true,
    seasonal: "Short-Haul Mountain Favorite",
    gallery: [
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "The favorite short-haul mountain getaway from Dubai: 4 days of cobblestone Tbilisi heritage, thermal sulfur baths, Georgian wine cellars, and a 4x4 mountain ascent along the Georgian Military Highway to Gergeti Trinity Church beneath Mount Kazbek.",
    dayBlocks: [
      { day: 1, morning: "Direct 3.5h flight from Dubai to Tbilisi, meet private driver for transfer to Old Town hotel.", afternoon: "Stroll along Rustaveli Avenue and ride the aerial cable car up to Narikala Fortress.", evening: "Explore the Abanotubani sulfur bath district and enjoy traditional Khachapuri dinner.", overnight: "Overnight in Tbilisi", meals: "No meals" },
      { day: 2, morning: "Guided walking tour through Old Tbilisi's carved wooden balconies, Bridge of Peace, and Clock Tower.", afternoon: "Excursion to Mtskheta (UNESCO ancient capital) and Jvari Monastery overlooking the river confluence.", evening: "Wine tasting in a historic 300-year-old underground cellar.", overnight: "Overnight in Tbilisi", meals: "Breakfast included" },
      { day: 3, morning: "Drive the Georgian Military Highway into the high Caucasus, stopping at Ananuri Fortress.", afternoon: "Gudauri Friendship Monument viewpoint; switch into 4x4 Land Cruisers to climb to Gergeti Trinity Church (2,170m).", evening: "Traditional Georgian supra feast with live folk singing in Kazbegi.", overnight: "Overnight in Kazbegi / Tbilisi", meals: "Breakfast included" },
      { day: 4, morning: "Leisure morning for mountain photography and souvenir shopping at Dry Bridge flea market.", afternoon: "Private transfer to Tbilisi International Airport for evening flight back to Dubai.", evening: "Arrive in Dubai DXB.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "3 Nights in a central 4★ boutique hotel in Tbilisi",
      "Daily breakfast buffet",
      "Private vehicle and chauffeur for all airport and sightseeing transfers",
      "4x4 Land Cruiser transfer to Gergeti Trinity Church in Kazbegi",
      "Narikala Fortress aerial cable car tickets",
      "Professional English / Arabic speaking tour guide",
      "100% Visa-free entry for UAE residency holders"
    ],
    exclusions: [
      "International flights Dubai–Tbilisi–Dubai",
      "Meals not specified in the itinerary",
      "Sulfur bath entrance fees",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Boutique Hotel in Old Tbilisi & Mountain Lodge in Kazbegi",
      roomType: "Deluxe Double Room with Balcony",
      mealPlan: "Daily Breakfast & 1 Traditional Supra Dinner",
      note: "Rooms feature stunning views of Narikala Fortress or Caucasus peaks."
    },
    transportation: [
      "Private Mercedes vehicle with English-speaking driver throughout",
      "4x4 Land Cruiser transfer to Gergeti Church"
    ],
    importantInfo: [
      { title: "Visa-Free for UAE Residents", body: "UAE residents with valid residency visa enter Georgia 100% visa-free on arrival for 90 days." }
    ],
    faqs: [
      { q: "Is the drive to Kazbegi safe?", a: "Yes, the Georgian Military Highway is fully paved and escorted by experienced mountain drivers." }
    ]
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
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
    intro: "Imperial Ottoman palaces and sunset Bosphorus cruising in Istanbul, paired with cave hotel suites and sunrise hot air balloons in Cappadocia.",
    story: "Stand beneath the monumental domes of Hagia Sophia, browse the Grand Bazaar, and take flight in a hot air balloon over fairy chimney valleys.",
    highlights: [
      "Sunrise hot air balloon flight over Göreme fairy chimneys",
      "Stay in an authentic luxury stone cave hotel in Cappadocia",
      "Guided tour of Hagia Sophia, Blue Mosque & Topkapi Palace",
      "Bosphorus private yacht sunset cruise in Istanbul",
      "Domestic flights Istanbul–Cappadocia return included",
      "Instant Turkish eVisa assistance for UAE residents"
    ],
    route: ["Istanbul", "Bosphorus", "Kayseri / Nevşehir", "Göreme"],
    featured: true,
    seasonal: "Spring & Autumn Magic",
    gallery: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "A dreamlike combination of imperial Byzantine and Ottoman grandeur in Istanbul with the surreal volcanic landscapes, luxury cave suites, and sunrise hot air balloon flights in Cappadocia.",
    dayBlocks: [
      { day: 1, morning: "Fly direct from Dubai to Istanbul, VIP private airport transfer to Sultanahmet hotel.", afternoon: "Check in and take an afternoon walk to the Hippodrome and German Fountain.", evening: "Welcome Turkish dinner with Bosphorus views.", overnight: "Overnight in Istanbul", meals: "No meals" },
      { day: 2, morning: "Guided tour inside Hagia Sophia, Blue Mosque, and the subterranean Basilica Cistern.", afternoon: "Tour Topkapi Palace and explore the 4,000 shops of the Grand Bazaar and Spice Market.", evening: "Private Bosphorus sunset yacht cruise past illuminated Ottoman palaces.", overnight: "Overnight in Istanbul", meals: "Breakfast included" },
      { day: 3, morning: "Short domestic flight to Cappadocia, transfer to authentic luxury Stone Cave Hotel in Göreme.", afternoon: "Explore Göreme Open-Air Museum's rock-cut fresco churches and Uchisar Castle viewpoint.", evening: "Sunset quad biking tour through Rose & Love Valleys followed by Turkish pottery kebab dinner.", overnight: "Overnight in Cappadocia Cave Hotel", meals: "Breakfast included" },
      { day: 4, morning: "Pre-dawn pickup for 1-hour Sunrise Hot Air Balloon Flight over fairy chimneys with champagne toast.", afternoon: "Explore the ancient multi-level Derinkuyu Underground City and Avanos pottery workshop.", evening: "Relax on cave hotel rooftop terrace under illuminated valley night skies.", overnight: "Overnight in Cappadocia Cave Hotel", meals: "Breakfast included" },
      { day: 5, morning: "Turkish breakfast buffet on cave terrace, transfer to airport for domestic flight to Istanbul.", afternoon: "Connect to your return flight to Dubai DXB.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "2 Nights in central 4★ Sultanahmet hotel (Istanbul)",
      "2 Nights in 5★ Luxury Cave Suite (Cappadocia)",
      "Domestic roundtrip flights Istanbul–Cappadocia–Istanbul",
      "Sunrise Hot Air Balloon Flight with certificate and celebratory toast",
      "Private sunset Bosphorus yacht cruise in Istanbul",
      "Full guided tours with entrance tickets to Hagia Sophia, Topkapi, and Göreme Museum",
      "Private airport transfers throughout Turkey",
      "Turkish eVisa document handling"
    ],
    exclusions: [
      "International flights Dubai–Istanbul–Dubai",
      "Lunches and dinners not mentioned",
      "Personal shopping and Turkish bath (Hammam) treatments",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Boutique Hotel in Istanbul + 5★ Luxury Cave Suite in Cappadocia",
      roomType: "Deluxe Old Town Room & Stone-Carved Cave Suite with Jacuzzi",
      mealPlan: "Daily Turkish Breakfast Buffet",
      note: "Cave hotels feature modern luxury heating/AC and private terraces."
    },
    transportation: [
      "Domestic flights Istanbul–Cappadocia return included",
      "Private airport transfers and guided touring vehicles",
      "Hot air balloon flight transfers"
    ],
    importantInfo: [
      { title: "Turkish eVisa", body: "Easy 3-minute online eVisa available for UAE residents and passport holders." }
    ],
    faqs: [
      { q: "What happens if ballooning is cancelled due to wind?", a: "We schedule flights on day 4 with a backup slot on day 5 morning, with full refund if weather prevents takeoff." }
    ]
  },
  {
    slug: "bali-jungle-coast",
    title: "Bali Ubud Jungle Villa & Seminyak Sunset Coast",
    destination: "Ubud · Tegallalang · Nusa Penida · Seminyak",
    country: "Indonesia",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Honeymoon", "Luxury", "Beach", "Adventure"],
    priceStatus: "from",
    priceFrom: 2499,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    intro: "Private pool villas in Ubud's emerald jungle, floating breakfasts, Nusa Penida island speedboat tours, and beach clubs in Seminyak.",
    story: "Soak in the spiritual charm of Bali: giant jungle swings, sacred monkey forests, clifftop sunsets at Uluwatu, and white sand coral lagoons.",
    highlights: [
      "3 Nights in a private pool jungle villa in Ubud + 2 nights in Seminyak luxury beach resort",
      "Full-day Nusa Penida speedboat tour (Kelingking T-Rex Beach & Angel's Billabong)",
      "Tegallalang Rice Terrace jungle swing and sacred Tirta Empul water blessing",
      "Uluwatu Clifftop Temple sunset & Kecak Fire Dance performance",
      "Famous Balinese floating breakfast experience served in your private pool",
      "Private chauffeur-driven air-conditioned vehicle throughout the trip",
      "Visa on arrival for UAE residents"
    ],
    route: ["Denpasar", "Ubud", "Tegallalang", "Nusa Penida", "Seminyak", "Uluwatu"],
    featured: true,
    seasonal: "Tropical Island Classic",
    gallery: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Bali remains one of the world's most romantic and rejuvenating island escapes. Direct flights from Dubai take you into a lush tropical sanctuary where mist rises over emerald rice terraces, ancient stone temples sit beside sacred rivers, and vibrant beach sunsets paint the Indian Ocean. This signature 6-day itinerary splits your stay between a private luxury pool villa nestled in Ubud's rainforest and an oceanfront lifestyle resort in chic Seminyak, including a full-day speedboat excursion to Nusa Penida's iconic T-Rex cliff.",
    dayBlocks: [
      { day: 1, morning: "Arrive at Ngurah Rai International Airport (DPS) in Bali from Dubai. Private VIP flower-garland welcome and transfer to Ubud.", afternoon: "Check into your private luxury pool villa surrounded by tropical palm trees. Welcome tropical fruit drink and rest.", evening: "Candlelit Balinese dinner served on the river deck overlooking Ayung River valley.", overnight: "Overnight in Private Pool Villa, Ubud", meals: "Dinner included" },
      { day: 2, morning: "Floating breakfast served in your private infinity pool followed by a visit to Tegallalang emerald rice terraces.", afternoon: "Experience the famous Bali Jungle Swing and visit the sacred monkey forest sanctuary in central Ubud.", evening: "Stroll Ubud art market and dine at a boutique organic restaurant in the rice fields.", overnight: "Overnight in Private Pool Villa, Ubud", meals: "Breakfast included" },
      { day: 3, morning: "Early morning executive speedboat transfer from Sanur Harbour to the breathtaking island of Nusa Penida.", afternoon: "Tour iconic Kelingking Beach (T-Rex cliff), Angel's Billabong natural infinity pool, and Broken Beach; enjoy fresh coconut lunch.", evening: "Speedboat return to Bali mainland; transfer to luxury beach hotel in Seminyak.", overnight: "Overnight in 5★ Beach Resort, Seminyak", meals: "Breakfast included" },
      { day: 4, morning: "Relax on Seminyak beach, enjoy poolside cabana cocktails or optional traditional Balinese massage.", afternoon: "Scenic coastal drive to Uluwatu Temple perched on a 70-meter limestone cliff above crashing ocean waves.", evening: "Watch the mesmerizing sunset Kecak Fire Dance followed by a fresh seafood BBQ on the sands of Jimbaran Bay.", overnight: "Overnight in 5★ Beach Resort, Seminyak", meals: "Breakfast & Seafood Dinner" },
      { day: 5, morning: "Leisure morning for boutique shopping along Seminyak Square and beach club relaxation at Potato Head or Café del Mar.", afternoon: "Visit Tanah Lot water temple standing proudly on an offshore sea rock.", evening: "Farewell cocktail dinner with panoramic ocean sunset views.", overnight: "Overnight in 5★ Beach Resort, Seminyak", meals: "Breakfast included" },
      { day: 6, morning: "Breakfast buffet, hotel check-out assistance, and private transfer to Denpasar Airport.", afternoon: "Board Emirates direct flight back to Dubai DXB.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "3 Nights in a 5★ Private Pool Villa in Ubud",
      "2 Nights in a 5★ Luxury Beach Resort in Seminyak",
      "Daily gourmet breakfast buffet including 1 signature Floating Breakfast",
      "Roundtrip airport and inter-hotel transfers by private air-conditioned vehicle",
      "Full-day Nusa Penida Island tour with roundtrip fast boat tickets and private island driver",
      "Ubud swing tickets and temple entrance fees (Uluwatu, Tanah Lot, Tegallalang)",
      "Jimbaran Bay candlelight fresh seafood dinner on the beach",
      "Dedicated English-speaking private chauffeur/guide throughout"
    ],
    exclusions: [
      "International flights Dubai–Bali–Dubai",
      "Indonesia visa on arrival",
      "Personal shopping and spa treatments",
      "Travel insurance"
    ],
    accommodation: {
      category: "5★ Luxury Pool Villa in Ubud + 5★ Beach Resort in Seminyak",
      roomType: "1-Bedroom Private Pool Villa & Deluxe Ocean View Room",
      mealPlan: "Daily Breakfast & 2 Dinners",
      note: "Honeymoon setup with flower bath and complimentary cake included for couples."
    },
    transportation: [
      "Private air-conditioned Toyota Alphard / Innova with dedicated driver",
      "Roundtrip fast boat to Nusa Penida Island included"
    ],
    importantInfo: [
      { title: "Visa on Arrival", body: "UAE residents obtain fast 30-day Visa on Arrival (e-VOA) online or at Denpasar airport for USD 35." }
    ],
    faqs: [
      { q: "Is the floating breakfast included?", a: "Yes, our package includes a complimentary signature floating breakfast served in your private villa pool." }
    ]
  },
  {
    slug: "japan-golden-route",
    title: "Japan Golden Route: Tokyo Skyline, Mt. Fuji & Kyoto Temples",
    destination: "Tokyo · Mt. Fuji · Hakone · Kyoto · Osaka",
    country: "Japan",
    region: "International",
    days: 8,
    nights: 7,
    styles: ["Cultural", "Luxury", "Family"],
    priceStatus: "from",
    priceFrom: 7899,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    intro: "Experience the ultimate Japan journey: neon-lit Tokyo, majestic Mt. Fuji, Shinkansen bullet trains, and Kyoto's thousand vermilion shrines.",
    story: "From futuristic Shibuya crossings and tea ceremonies to peaceful bamboo groves in Arashiyama and Osaka's vibrant street food stalls.",
    highlights: [
      "3 Nights Tokyo, 1 Night Hakone Onsen Ryokan, 2 Nights Kyoto, 1 Night Osaka",
      "7-Day Japan Rail (JR) Pass with 320 km/h Shinkansen Bullet Train travel",
      "Mount Fuji 5th Station & Lake Ashi pirate boat cruise with Komagatake cable car",
      "Kyoto tour: Fushimi Inari 10,000 torii gates, Kinkaku-ji Golden Pavilion & Arashiyama Bamboo",
      "Traditional Japanese Onsen hot spring experience with multi-course Kaiseki dinner",
      "Tokyo guided tour: Shibuya Sky, teamLab Planets, Senso-ji Temple & Akihabara",
      "Full Japan tourist visa application support from Dubai"
    ],
    route: ["Tokyo", "Mount Fuji", "Hakone", "Kyoto", "Nara", "Osaka"],
    featured: true,
    seasonal: "Spring Cherry Blossom & Autumn Foliage",
    gallery: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Japan is a captivating blend of cutting-edge ultra-modern innovation and ancient spiritual heritage. Fly direct from Dubai to Tokyo and journey along the legendary Golden Route across the main island of Honshu. Ride the 320 km/h Shinkansen bullet train past snow-capped Mount Fuji, soak in therapeutic volcanic Onsen hot springs in Hakone, walk through Kyoto's 10,000 crimson Torii gates at Fushimi Inari, feed sacred bowing deer in Nara, and feast on sizzling takoyaki in Osaka's neon Dotonbori district.",
    dayBlocks: [
      { day: 1, morning: "Direct flight from Dubai (DXB) to Tokyo Haneda/Narita. Meet private English-speaking airport host and transfer to central Tokyo hotel.", afternoon: "Check into 4★/5★ central hotel (Shinjuku/Ginza), relax, and stroll the illuminated streets of Shinjuku.", evening: "Welcome Japanese dinner overlooking the neon skyline of Tokyo.", overnight: "Overnight in Central Tokyo Hotel", meals: "No meals (arrival day)" },
      { day: 2, morning: "Guided tour of ancient Senso-ji Temple in Asakusa and stroll Nakamise shopping street.", afternoon: "Visit digital art museum teamLab Planets and cross the famous Shibuya Scramble Crossing; ascend Shibuya Sky.", evening: "Explore the electronic and anime district of Akihabara.", overnight: "Overnight in Central Tokyo Hotel", meals: "Breakfast included" },
      { day: 3, morning: "Depart Tokyo towards Mount Fuji; ascend to Mt. Fuji 5th Station (2,300m) for panoramic views.", afternoon: "Cruise across volcanic Lake Ashi on a pirate ship and ride the Hakone Ropeway cable car over active sulfur vents.", evening: "Check into traditional luxury Ryokan in Hakone; soak in mineral onsen hot spring baths and enjoy authentic multi-course Kaiseki dinner.", overnight: "Overnight in Luxury Onsen Ryokan, Hakone", meals: "Breakfast & Kaiseki Dinner" },
      { day: 4, morning: "Board the world-famous Shinkansen (Bullet Train) from Odawara to the ancient imperial capital of Kyoto (2 hours).", afternoon: "Walk through the thousands of vermilion torii gates at Fushimi Inari Shrine and visit Kiyomizu-dera cliffside temple.", evening: "Evening walking tour of Gion historic geisha district with traditional wooden machiya houses.", overnight: "Overnight in Central Kyoto Hotel", meals: "Breakfast included" },
      { day: 5, morning: "Visit the shimmering Kinkaku-ji (Golden Pavilion) and meditate in Ryoan-ji Zen rock garden.", afternoon: "Wander through the towering Arashiyama Bamboo Grove and cross the historic Togetsukyo Bridge.", evening: "Traditional Japanese green tea ceremony experience with a Kyoto tea master.", overnight: "Overnight in Central Kyoto Hotel", meals: "Breakfast included" },
      { day: 6, morning: "Short train excursion to Nara Park; interact with over 1,000 friendly sacred bowing deer and visit Todai-ji Great Buddha temple.", afternoon: "Transfer to dynamic Osaka; check into hotel and visit Osaka Castle park.", evening: "Street food exploration in Dotonbori under the iconic Glico Running Man neon sign.", overnight: "Overnight in Osaka Hotel", meals: "Breakfast included" },
      { day: 7, morning: "Free day for shopping in Shinsaibashi or optional day tour to Universal Studios Japan (Super Nintendo World).", afternoon: "Visit Umeda Sky Building Floating Garden Observatory for 360° views over Osaka Bay.", evening: "Farewell wagyu beef dinner in Osaka.", overnight: "Overnight in Osaka Hotel", meals: "Breakfast included" },
      { day: 8, morning: "Breakfast, hotel check-out, and private transfer to Kansai International Airport (KIX) or Tokyo Haneda.", afternoon: "Board direct return flight to Dubai DXB.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "3 Nights in central 4★/5★ Tokyo hotel (Shinjuku / Ginza)",
      "1 Night in luxury Hakone Onsen Ryokan with private hot spring bath",
      "2 Nights in central 4★ Kyoto hotel",
      "1 Night in central 4★ Osaka hotel",
      "Daily Japanese & international breakfast buffet",
      "1 Gourmet Traditional Multi-Course Kaiseki Dinner in Hakone",
      "7-Day Japan Rail (JR) Pass covering all Shinkansen Bullet Trains and JR lines",
      "Guided Mt. Fuji 5th Station excursion with Lake Ashi pirate boat cruise and ropeway",
      "Full-day guided tours in Tokyo and Kyoto with licensed English-speaking guides",
      "Complete Japan eVisa/embassy application document processing from Dubai"
    ],
    exclusions: [
      "International flights Dubai–Tokyo / Osaka–Dubai",
      "Lunch and dinner meals not specified",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Superior City Hotels & 5★ Traditional Onsen Ryokan",
      roomType: "Deluxe Twin / King Room & Japanese Tatami Suite with Hot Spring Bath",
      mealPlan: "Daily Breakfast & 1 Kaiseki Feast",
      note: "Hotels are located steps from JR bullet train stations for maximum convenience."
    },
    transportation: [
      "7-Day Ordinary or Green-Car (First Class) Japan Rail Pass included",
      "Private airport transfers on arrival and departure"
    ],
    importantInfo: [
      { title: "Japan eVisa for UAE", body: "UAE residents with approved nationalities can obtain single-entry Japan tourist eVisa online within 5 business days." }
    ],
    faqs: [
      { q: "Is the Shinkansen bullet train included?", a: "Yes, your 7-Day Japan Rail Pass gives you unlimited rides on Shinkansen bullet trains connecting Tokyo, Mt. Fuji, Kyoto, and Osaka." }
    ]
  },
  {
    slug: "paris-french-riviera",
    title: "France Grandeur: Paris Eiffel Tower & French Riviera Glamour",
    destination: "Paris · Louvre · Versailles · Nice · Monaco · Cannes",
    country: "France",
    region: "International",
    days: 7,
    nights: 6,
    styles: ["Luxury", "Honeymoon", "Cultural"],
    priceStatus: "from",
    priceFrom: 5299,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    intro: "Classic European romance: 4 nights exploring Parisian monuments and Seine dinner cruises, followed by 3 days soaking up Côte d'Azur glamour in Nice & Monaco.",
    story: "Ascend the Eiffel Tower, gaze upon the Mona Lisa at the Louvre, stroll the Champs-Élysées, and ride the high-speed TGV train to the sun-kissed beaches of the French Riviera.",
    highlights: [
      "Eiffel Tower Level 2 & Summit priority access with Seine champagne cruise",
      "Louvre Museum guided highlights & Palace of Versailles golden hall of mirrors",
      "First-Class TGV High-Speed Train from Paris to Nice along the Mediterranean",
      "Scenic coastal excursion to Monaco Monte Carlo & Cannes Croisette boulevard",
      "4-star boutique hotel in central Paris + 4-star seaside Promenade des Anglais hotel",
      "Complete Schengen visa file preparation and biometric appointment support"
    ],
    route: ["Paris", "Versailles", "Nice", "Monaco Monte Carlo", "Cannes"],
    featured: true,
    seasonal: "Spring & Summer European Romance",
    gallery: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Experience the quintessential European journey that pairs the iconic art, fashion, and culinary heritage of Paris with the turquoise waters and celebrity glamour of the French Riviera. This 7-day vacation starts with 4 nights in central Paris, featuring guided access to the Eiffel Tower, Louvre, and the opulent Palace of Versailles, followed by an exhilarating 320 km/h TGV train ride down to the Mediterranean coast for 2 nights overlooking the azure bay of Nice and the prince's palace in Monaco.",
    dayBlocks: [
      { day: 1, morning: "Fly direct DXB to Paris Charles de Gaulle (CDG). Meet private Mercedes chauffeur at arrivals for hotel transfer.", afternoon: "Check into central 4★ Opera/Louvre boutique hotel, freshen up, and stroll along Boulevard Haussmann.", evening: "Gourmet French dinner cruise along the River Seine beneath the illuminated bridges.", overnight: "Overnight in Central Paris", meals: "Dinner included" },
      { day: 2, morning: "Priority Eiffel Tower summit ascent with panoramic vistas over the Parisian rooftops.", afternoon: "Guided walking tour through the Louvre Museum (Mona Lisa, Venus de Milo) and Tuileries Gardens.", evening: "Stroll down the Avenue des Champs-Élysées to the illuminated Arc de Triomphe.", overnight: "Overnight in Central Paris", meals: "Breakfast included" },
      { day: 3, morning: "Half-day excursion to the Palace of Versailles; tour the Hall of Mirrors and royal fountains.", afternoon: "Explore Montmartre artists' square and the white domes of Sacré-Cœur basilica.", evening: "Free evening for shopping at Galeries Lafayette rooftop.", overnight: "Overnight in Central Paris", meals: "Breakfast included" },
      { day: 4, morning: "Board First-Class TGV High Speed Train from Paris Gare de Lyon to Nice-Ville (5 hours).", afternoon: "Check into seaside hotel on the Promenade des Anglais; relax on pebble beaches overlooking Baie des Anges.", evening: "Seafood dinner in Old Town Nice (Vieux Nice) with famous Socca and French gelato.", overnight: "Overnight in Nice", meals: "Breakfast included" },
      { day: 5, morning: "Scenic coastal drive along the Moyenne Corniche to Èze cliffside medieval village and perfume factory.", afternoon: "Tour the Principality of Monaco, Prince's Palace, Formula 1 Grand Prix circuit, and Monte Carlo Casino square.", evening: "Visit Cannes and take photos on the red carpet steps of the Palais des Festivals.", overnight: "Overnight in Nice", meals: "Breakfast included" },
      { day: 6, morning: "Leisure morning for shopping on Avenue Jean Médecin or beach club relaxation in Nice.", afternoon: "Explore Castle Hill (Colline du Château) for the iconic postcard view of Nice bay.", evening: "Farewell Riviera dinner overlooking the Mediterranean sunset.", overnight: "Overnight in Nice", meals: "Breakfast included" },
      { day: 7, morning: "Breakfast, hotel check-out, and private airport transfer to Nice Côte d'Azur Airport (NCE).", afternoon: "Board Emirates direct flight back to Dubai DXB.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "4 Nights in 4★ central Paris boutique hotel",
      "2 Nights in 4★ seaside Nice hotel on Promenade des Anglais",
      "Daily French buffet breakfast",
      "First-Class TGV High-Speed Train ticket Paris to Nice",
      "Eiffel Tower Level 2 & Summit priority access ticket",
      "Seine River dinner cruise with 3-course French dining",
      "Full-day guided Monaco, Monte Carlo, Èze & Cannes excursion",
      "Roundtrip private Mercedes airport and train transfers",
      "Schengen visa appointment scheduling and document verification"
    ],
    exclusions: [
      "International flights Dubai–Paris / Nice–Dubai",
      "Lunches and beverages not specified",
      "City tourist taxes (payable directly at hotels, approx. €3/night)",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Superior Boutique Hotels (Paris Opera/Louvre & Nice Promenade)",
      roomType: "Classic Double / Twin Room with En-suite Marble Bathroom",
      mealPlan: "Daily French Breakfast & 1 Gourmet Seine Dinner",
      note: "5★ luxury upgrade to Le Meurice Paris or Hotel Negresco Nice available upon request."
    },
    transportation: [
      "Private Mercedes airport & hotel transfers in Paris and Nice",
      "First-Class TGV High-Speed train tickets",
      "Private touring vehicle for French Riviera & Monaco tour"
    ],
    importantInfo: [
      { title: "Schengen Visa", body: "Schengen visa required for UAE residents. We provide confirmed flight itinerary, hotel vouchers, and appointment booking." }
    ],
    faqs: [
      { q: "Is the TGV train journey scenic?", a: "Yes, the train travels through picturesque Burgundy vineyards, Provence countryside, and along the Mediterranean coastline." }
    ]
  },
  {
    slug: "italy-classic-grand-tour",
    title: "Italy Classic Tour: Rome Colosseum, Florence & Venice Gondola",
    destination: "Rome · Vatican · Florence · Pisa · Venice · Grand Canal",
    country: "Italy",
    region: "International",
    days: 7,
    nights: 6,
    styles: ["Cultural", "Family", "Honeymoon"],
    priceStatus: "from",
    priceFrom: 4999,
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    intro: "The ultimate Italian masterpiece: 2 nights in imperial Rome, 2 nights in Renaissance Florence & Tuscany, and 2 romantic nights on the canals of Venice.",
    story: "Toss a coin into the Trevi Fountain, marvel at Michelangelo's Sistine Chapel, gaze at the Leaning Tower of Pisa, and glide down the Grand Canal in a traditional gondola.",
    highlights: [
      "2 Nights Rome, 2 Nights Florence, 2 Nights Venice in central 4-star hotels",
      "Frecciarossa high-speed bullet train tickets between Rome, Florence & Venice",
      "Colosseum & Roman Forum skip-the-line guided walking tour",
      "Vatican Museums & Sistine Chapel priority entry",
      "Tuscany excursion to Pisa Leaning Tower & Florence Duomo",
      "Private classic Gondola ride with serenade along Venice Grand Canal",
      "Complete Schengen visa documentation support for UAE residents"
    ],
    route: ["Rome", "Vatican City", "Florence", "Pisa", "Venice"],
    featured: true,
    seasonal: "Year-Round Italian Classic",
    gallery: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Italy is an open-air museum of unmatched art, architecture, and gastronomy. Fly direct from Dubai to Rome and embark on a seamless first-class rail journey linking three of the world's most storied cities: Rome, the eternal imperial capital; Florence, the cradle of the Renaissance; and Venice, the floating jewel of the Adriatic Sea. Experience skip-the-line access to the Colosseum and Vatican, savor authentic Neapolitan pizza and handmade gelato, and enjoy private gondola rides through Venice's historic waterways.",
    dayBlocks: [
      { day: 1, morning: "Fly direct DXB to Rome Fiumicino (FCO). VIP private Mercedes transfer to central Rome hotel.", afternoon: "Check into 4★ central hotel near Piazza Navona; relax with authentic Italian espresso.", evening: "Evening walking tour to Trevi Fountain, Spanish Steps, and Pantheon under illuminated night lights.", overnight: "Overnight in Rome", meals: "No meals" },
      { day: 2, morning: "Skip-the-line guided tour inside the Colosseum, Roman Forum, and Palatine Hill.", afternoon: "Visit Vatican City: St. Peter's Basilica, Vatican Museums, and Michelangelo's Sistine Chapel ceiling.", evening: "Traditional Roman pasta dinner in charming Trastevere cobblestone quarter.", overnight: "Overnight in Rome", meals: "Breakfast included" },
      { day: 3, morning: "Board the 300 km/h Frecciarossa high-speed bullet train from Rome Termini to Florence Santa Maria Novella (1.5 hours).", afternoon: "Guided tour of Florence: Santa Maria del Fiore Duomo, Giotto's Bell Tower, and Ponte Vecchio bridge.", evening: "Sunset views over Florence skyline from Piazzale Michelangelo followed by authentic Florentine dining.", overnight: "Overnight in Florence", meals: "Breakfast included" },
      { day: 4, morning: "Half-day Tuscan excursion to the famous Miracle Square to photograph the Leaning Tower of Pisa.", afternoon: "Visit a traditional Tuscan olive grove and farm for olive oil tasting.", evening: "Return to Florence for evening gelato and boutique leather shopping in San Lorenzo.", overnight: "Overnight in Florence", meals: "Breakfast included" },
      { day: 5, morning: "High-speed Frecciarossa train from Florence to Venice Santa Lucia railway station (2 hours).", afternoon: "Private water taxi transfer down the Grand Canal to your historic canal-side hotel in Venice.", evening: "Private traditional Venice Gondola ride through romantic quiet back canals and beneath Bridge of Sighs.", overnight: "Overnight in Venice", meals: "Breakfast included" },
      { day: 6, morning: "Guided tour of St. Mark's Square (Piazza San Marco), St. Mark's Basilica, and Doge's Palace.", afternoon: "Boat excursion to Murano island for glassblowing demonstration and colorful Burano lace village.", evening: "Farewell Italian seafood dinner along the illuminated Grand Canal.", overnight: "Overnight in Venice", meals: "Breakfast included" },
      { day: 7, morning: "Breakfast overlooking the canal, hotel check-out, and private water taxi to Venice Marco Polo Airport (VCE).", afternoon: "Board direct Emirates return flight to Dubai DXB.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "2 Nights in central 4★ Rome hotel (near Spanish Steps / Termini)",
      "2 Nights in central 4★ Florence hotel",
      "2 Nights in historic 4★ Venice canal-side hotel",
      "Daily Italian buffet breakfast",
      "Frecciarossa high-speed train tickets (Rome–Florence–Venice)",
      "Colosseum, Roman Forum & Palatine Hill skip-the-line tickets",
      "Vatican Museums & Sistine Chapel priority access",
      "Private 30-minute classic Venice Gondola ride",
      "Private Venice water taxi airport transfers",
      "Complete Schengen visa documentation support"
    ],
    exclusions: [
      "International flights Dubai–Rome / Venice–Dubai",
      "Lunches and dinners not specified",
      "Local hotel city tourist taxes (€4-€7/night)",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Boutique Historic Hotels (Rome, Florence, Venice)",
      roomType: "Superior Double / Twin Room with Italian decor",
      mealPlan: "Daily Italian Breakfast Buffet",
      note: "Venice rooms offer direct canal or courtyard views."
    },
    transportation: [
      "Frecciarossa high-speed bullet trains (First or Standard class)",
      "Private Mercedes airport transfers in Rome",
      "Private luxury Venetian water taxi in Venice"
    ],
    importantInfo: [
      { title: "Schengen Visa", body: "Schengen visa required for UAE residents. We provide confirmed flight itinerary, hotel vouchers, and appointment booking." }
    ],
    faqs: [
      { q: "Is the Venice water taxi included?", a: "Yes, our package includes a private luxury wooden water taxi from Venice train station and to Marco Polo Airport." }
    ]
  },
  {
    slug: "greece-santorini-athens",
    title: "Greece Wonders: Athens Acropolis & Santorini Caldera Sunset",
    destination: "Athens · Acropolis · Plaka · Santorini · Oia · Fira",
    country: "Greece",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Honeymoon", "Luxury", "Beach", "Cultural"],
    priceStatus: "from",
    priceFrom: 4699,
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    intro: "Whitewashed cliffside villas, cobalt-blue domes, and world-famous Aegean sunsets: 2 nights in historic Athens and 3 romantic nights in Santorini.",
    story: "Stand before the Parthenon in Athens, board a luxury high-speed ferry across the Aegean Sea, and watch the sunset from your cliffside jacuzzi in Oia.",
    highlights: [
      "2 Nights central 4★ Athens hotel + 3 Nights 5★ cliffside Caldera resort in Santorini",
      "Skip-the-line Acropolis & Parthenon guided tour with Acropolis Museum",
      "High-speed Blue Star / Seajets executive ferry tickets Athens to Santorini",
      "Sunset Catamaran sailing cruise in Santorini with BBQ dinner & hot springs swim",
      "Oia village sunset walking tour and Red Beach / Black Sand Beach excursion",
      "Roundtrip private Mercedes and luxury minivan airport transfers",
      "Schengen visa application processing support from Dubai"
    ],
    route: ["Athens", "Piraeus Port", "Santorini Caldera", "Oia", "Fira"],
    featured: true,
    seasonal: "Spring & Summer Island Magic",
    gallery: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Greece is the timeless meeting point of Western civilization and sublime Mediterranean beauty. This signature 6-day package from Dubai takes you to the legendary ruins of ancient Athens—visiting the Acropolis, Parthenon, and the neoclassical alleys of Plaka—before cruising across the azure Aegean Sea to the volcanic island of Santorini. Stay in a luxury cliffside resort perched on the caldera rim, sail past volcanic hot springs on a private catamaran, and witness the world's most celebrated golden sunset in Oia.",
    dayBlocks: [
      { day: 1, morning: "Direct flight from Dubai DXB to Athens International Airport (ATH). Meet private chauffeur and transfer to central Athens hotel.", afternoon: "Check into 4★ boutique hotel near Syntagma Square; stroll through Monastiraki flea market.", evening: "Rooftop Greek dinner with illuminated night views of the Parthenon.", overnight: "Overnight in Athens", meals: "No meals" },
      { day: 2, morning: "Skip-the-line guided walking tour of the Acropolis, Parthenon, Temple of Athena Nike, and Theater of Dionysus.", afternoon: "Explore the modern Acropolis Museum and wander the charming cobblestone streets of Plaka.", evening: "Traditional Greek taverna evening with souvlaki, Greek salad, and live bouzouki music.", overnight: "Overnight in Athens", meals: "Breakfast included" },
      { day: 3, morning: "Private transfer to Piraeus Port; board the high-speed Seajets ferry across the Aegean Sea to Santorini (4.5 hours).", afternoon: "Breathtaking arrival into Santorini Athinios Port; private luxury transfer up the cliffside to your 5★ Caldera resort.", evening: "Cocktails and private balcony relaxation overlooking the submerged volcanic caldera.", overnight: "Overnight in 5★ Santorini Caldera Resort", meals: "Breakfast included" },
      { day: 4, morning: "Leisure morning exploring the whitewashed pedestrian alleys, blue-domed churches, and boutiques of Fira and Imerovigli.", afternoon: "Board a 5-hour Sunset Catamaran Cruise: swim in volcanic Nea Kameni hot springs, snorkel at Red Beach and White Beach.", evening: "Gourmet Greek seafood BBQ and unlimited Greek beverages served on board while watching the sunset from the sea.", overnight: "Overnight in 5★ Santorini Caldera Resort", meals: "Breakfast & Catamaran BBQ Dinner" },
      { day: 5, morning: "Visit the prehistoric Akrotiri archaeological site and relax on the volcanic Perissa Black Sand Beach.", afternoon: "Drive to the northern village of Oia; take postcard photos of the 3 blue domes and windmills.", evening: "Guaranteed prime terrace seating for the world-famous Oia sunset spectacle.", overnight: "Overnight in 5★ Santorini Caldera Resort", meals: "Breakfast included" },
      { day: 6, morning: "Greek champagne breakfast overlooking the caldera, souvenir shopping, and hotel checkout.", afternoon: "Private transfer to Santorini Airport (JTR) for short flight connection to Dubai.", evening: "Arrive back in Dubai DXB.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "2 Nights in 4★ central Athens hotel (near Plaka / Syntagma)",
      "3 Nights in 5★ Luxury Caldera Cave Suite in Santorini",
      "Daily Greek and American buffet breakfast",
      "High-Speed Ferry tickets Athens to Santorini (Business/Club class)",
      "5-Hour Sunset Catamaran Sailing Cruise with BBQ dinner & drinks",
      "Acropolis & Parthenon skip-the-line guided tour and entrance ticket",
      "Roundtrip private airport and port transfers throughout Greece",
      "Full Schengen visa documentation support from Dubai"
    ],
    exclusions: [
      "International flights Dubai–Athens / Santorini–Dubai",
      "Lunches and dinners not specified",
      "Greek climate resilience tax (€3-€7/night)",
      "Travel insurance"
    ],
    accommodation: {
      category: "4★ Boutique Hotel in Athens + 5★ Luxury Caldera Cave Suite in Santorini",
      roomType: "Deluxe City Room & Caldera View Suite with Outdoor Jacuzzi",
      mealPlan: "Daily Breakfast & 1 Catamaran Dinner",
      note: "Santorini suites feature panoramic caldera views and private sun terraces."
    },
    transportation: [
      "High-speed luxury ferry tickets Athens to Santorini",
      "Private Mercedes minivan transfers for all port and airport journeys"
    ],
    importantInfo: [
      { title: "Schengen Visa", body: "Schengen visa required for UAE residents. We provide confirmed flight itinerary, hotel vouchers, and appointment booking." }
    ],
    faqs: [
      { q: "Is the catamaran cruise in Santorini included?", a: "Yes, a 5-hour luxury catamaran sunset sailing cruise with fresh BBQ meal, snorkeling gear, and drinks is included." }
    ]
  },
  {
    slug: "egypt-pharaohs-nile",
    title: "Egypt Grandeur: Cairo Pyramids & 5-Star Nile Luxury Cruise",
    destination: "Cairo · Giza Pyramids · Aswan · Kom Ombo · Edfu · Luxor",
    country: "Egypt",
    region: "International",
    days: 6,
    nights: 5,
    styles: ["Cultural", "Family", "Cruises"],
    priceStatus: "from",
    priceFrom: 2799,
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
    intro: "Step into 5,000 years of living history: Great Pyramids of Giza and Sphinx, followed by a 3-night 5-star full-board Nile River luxury cruise between Aswan and Luxor.",
    story: "Stand in awe before the Great Pyramid of Khufu, sail the legendary Nile on a 5-star cruise ship, explore the Valley of the Kings, and walk through Karnak Temple.",
    highlights: [
      "2 Nights in 5★ Cairo hotel with Pyramids view + 3 Nights on 5★ Luxury Nile Cruise Ship",
      "All-inclusive full board meals on the Nile Cruise (breakfast, lunch & dinner daily)",
      "Great Pyramids of Giza, Great Sphinx & Valley Temple guided tour with camel ride",
      "Grand Egyptian Museum (GEM) & Khan El Khalili historic bazaar",
      "Sightseeing in Aswan (High Dam, Philae Temple) & Luxor (Valley of the Kings, Karnak Temple)",
      "Domestic roundtrip flights Cairo–Aswan / Luxor–Cairo included",
      "Visa on arrival for UAE residents"
    ],
    route: ["Cairo", "Giza", "Aswan", "Kom Ombo", "Edfu", "Luxor"],
    featured: true,
    seasonal: "Winter & Spring Heritage Classic",
    gallery: [
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "Egypt is the cradle of ancient civilization. Fly just 3.5 hours from Dubai to Cairo and experience the monumental wonders of the Pharaohs. Begin with 2 nights in Cairo marveling at the Pyramids of Giza, the Great Sphinx, and the treasures of Tutankhamun, before flying south to Aswan to board a 5-star luxury Nile cruiser. Sail past date-palm riverbanks and ancient sandstone temples to Kom Ombo, Edfu, and the awe-inspiring tombs of the Valley of the Kings and Karnak Temple in Luxor.",
    dayBlocks: [
      { day: 1, morning: "Direct 3.5h flight DXB to Cairo International Airport (CAI). VIP airport meet and assistance, private transfer to 5★ Pyramids-view hotel.", afternoon: "Check in and relax by the pool overlooking the Giza plateau.", evening: "Sound & Light show at the Giza Pyramids or traditional dinner on the Nile.", overnight: "Overnight in 5★ Cairo Hotel", meals: "No meals" },
      { day: 2, morning: "Guided tour of the Great Pyramids of Giza (Khufu, Khafre, Menkaure), the Great Sphinx, and Valley Temple with optional camel ride.", afternoon: "Visit the Grand Egyptian Museum (GEM) and National Museum of Egyptian Civilization (NMEC).", evening: "Stroll through the 600-year-old Khan El Khalili market and enjoy Egyptian mint tea at historic El Fishawy cafe.", overnight: "Overnight in 5★ Cairo Hotel", meals: "Breakfast included" },
      { day: 3, morning: "Domestic flight Cairo to Aswan; board 5★ Luxury Nile Cruise ship and check into outside river-view cabin.", afternoon: "Tour the Aswan High Dam, Unfinished Obelisk, and take a motorboat to the island Temple of Philae.", evening: "Felucca sailboat ride around Elephantine Island at sunset; welcome dinner and show on board.", overnight: "Overnight on 5★ Luxury Nile Cruiser", meals: "Breakfast, Lunch & Dinner" },
      { day: 4, morning: "Sail to Kom Ombo; guided tour of the unique dual Temple of Sobek the crocodile god and Horus.", afternoon: "Sail through the Nile valley to Edfu; horse-and-carriage ride to the remarkably preserved Temple of Horus.", evening: "Galabeya costume party and Oriental dinner buffet on board while cruising towards Luxor.", overnight: "Overnight on 5★ Luxury Nile Cruiser", meals: "Breakfast, Lunch & Dinner" },
      { day: 5, morning: "Arrive in Luxor: cross to the West Bank to explore the Valley of the Kings (royal tombs), Temple of Queen Hatshepsut, and Colossi of Memnon.", afternoon: "Tour the East Bank: monumental Karnak Temple complex and Luxor Temple on the riverfront.", evening: "Farewell gala dinner on board the cruise ship.", overnight: "Overnight on 5★ Luxury Nile Cruiser", meals: "Breakfast, Lunch & Dinner" },
      { day: 6, morning: "Optional sunrise Hot Air Balloon flight over Luxor temples; cruise checkout.", afternoon: "Private transfer to Luxor Airport for domestic flight to Cairo and connection back to Dubai DXB.", evening: "Arrive in Dubai.", overnight: "Departure flight home", meals: "Breakfast included" }
    ],
    inclusions: [
      "2 Nights in 5★ Cairo hotel (e.g. Steigenberger Pyramids / Marriott Mena House)",
      "3 Nights in 5★ Luxury Nile Cruise Ship with outside Nile-view cabin",
      "Full Board meals on Nile cruise (daily breakfast, lunch, afternoon tea & dinner)",
      "Domestic roundtrip flights Cairo–Aswan / Luxor–Cairo",
      "Full sightseeing in Giza, Cairo, Aswan, Kom Ombo, Edfu, and Luxor with certified Egyptologist guide",
      "All entrance tickets to Pyramids, Sphinx, Philae, Edfu, Kom Ombo, Valley of the Kings & Karnak",
      "Roundtrip private airport and dock transfers by air-conditioned coach",
      "Egypt visa assistance for UAE residents"
    ],
    exclusions: [
      "International flights Dubai–Cairo–Dubai",
      "Optional Abu Simbel temple excursion or Luxor Hot Air Balloon",
      "Entry inside the burial chambers of the Great Pyramid or Tutankhamun tomb",
      "Cruise crew gratuities / tips ($10/day)",
      "Travel insurance"
    ],
    accommodation: {
      category: "5★ Luxury Hotels & 5★ Premier Nile Cruise Ship (e.g. M/S Nile Goddess / Blue Shadow)",
      roomType: "Pyramid View Deluxe Room & Nile View Outside Cabin",
      mealPlan: "Daily Breakfast in Cairo + Full Board on Cruise",
      note: "Cruise ships feature swimming pool sundecks, fine dining restaurants, and evening lounge entertainment."
    },
    transportation: [
      "Domestic flights Cairo–Aswan and Luxor–Cairo included",
      "Private touring coaches and motorboats for island temples"
    ],
    importantInfo: [
      { title: "Visa on Arrival", body: "UAE residents with valid residency obtain visa on arrival at Cairo airport for USD 25." }
    ],
    faqs: [
      { q: "Is the Nile cruise safe and comfortable?", a: "Yes, 5-star Nile cruise ships offer hotel-standard luxury en-suite cabins, swimming pools, full AC, and international cuisine." }
    ]
  }
];

const packagesFormatted = packages16.map(p => ({
  slug: p.slug,
  title: p.title,
  destination: p.destination,
  country: p.country,
  region: p.region,
  days: p.days,
  nights: p.nights,
  styles: p.styles,
  priceStatus: p.priceStatus,
  priceFrom: p.priceFrom,
  image: p.image,
  intro: p.intro,
  story: p.story,
  highlights: p.highlights,
  route: p.route,
  featured: p.featured,
  seasonal: p.seasonal,
  itinerary: p.dayBlocks.map(d => ({
    day: d.day,
    title: "Day " + d.day + " — " + d.morning.slice(0, 45) + "...",
    summary: d.afternoon.slice(0, 90),
    activities: [d.morning, d.afternoon, d.evening],
    meals: d.meals,
    transport: "Included private transport"
  })),
  inclusions: p.inclusions,
  exclusions: p.exclusions
}));

const catalogueCode = `import { BRAND, credentials, offices, serviceLines, waLink } from "./catalogue-brand";
export { BRAND, credentials, offices, serviceLines, waLink };
export type { Office } from "./catalogue-brand";

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

export const packages: HolidayPackage[] = ${JSON.stringify(packagesFormatted, null, 2)};

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
  return p.priceStatus === "from" && p.priceFrom ? "From AED " + p.priceFrom.toLocaleString() : "Price on Request";
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

fs.writeFileSync('src/data/catalogue.ts', catalogueCode);

// Write package details split across details-a and details-b
const detailsMap = {};
packages16.forEach(p => {
  detailsMap[p.slug] = {
    overview: p.overview,
    gallery: p.gallery,
    dayBlocks: p.dayBlocks,
    inclusions: p.inclusions,
    exclusions: p.exclusions,
    accommodation: p.accommodation,
    transportation: p.transportation,
    importantInfo: p.importantInfo,
    faqs: p.faqs
  };
});

const half = Math.ceil(packages16.length / 2);
const detailsA = {};
const detailsB = {};

packages16.forEach((p, idx) => {
  if (idx < half) {
    detailsA[p.slug] = detailsMap[p.slug];
  } else {
    detailsB[p.slug] = detailsMap[p.slug];
  }
});

const codeA = `import type { PackageDetail } from "./package-detail-types";\n\nexport const packageDetailsA: Record<string, PackageDetail> = ${JSON.stringify(detailsA, null, 2)};\n`;
const codeB = `import type { PackageDetail } from "./package-detail-types";\n\nexport const packageDetailsB: Record<string, PackageDetail> = ${JSON.stringify(detailsB, null, 2)};\n`;

fs.writeFileSync('src/data/package-details-a.ts', codeA);
fs.writeFileSync('src/data/package-details-b.ts', codeB);

console.log('Saved all 14 comprehensive packages successfully!');
