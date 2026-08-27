import fs from "fs";

const packages = [
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
    image:
      "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Just 3 hours from Dubai: futuristic architecture meets ancient UNESCO Silk Road stone walls, Caspian Sea promenades, and alpine cable cars.",
    story:
      "Explore the UNESCO-listed Icherisheher Old City, marvel at the illuminated Flame Towers, and take a day trip to Gabala's snow-capped mountains and Tufandag cable car.",
    highlights: [
      "Guided tour of Icherisheher Old Town, Maiden Tower & Shirvanshahs Palace",
      "Heydar Aliyev Center architectural masterpiece by Zaha Hadid",
      "Full-day scenic excursion to Gabala with Tufandag Mountain Cable Car",
      "Gobustan prehistoric petroglyphs and bubbling mud volcanoes",
      "Baku Ferris Wheel and Caspian Sea Boulevard promenade walk",
      "4-star central hotel with daily Azerbaijani breakfast buffet",
      "Fast 3-day online eVisa document handling",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1578895210405-907db486c111?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    ],
    overview:
      "Fly out of Dubai into the dazzling land of fire on the shores of the Caspian Sea. Azerbaijan seamlessly blends millennia-old Silk Road caravanserais with futuristic fluid architecture designed by Zaha Hadid. This popular 4-day itinerary gives you the best of both worlds: two nights immersing yourself in the cobblestone charm of Baku's UNESCO-listed Old City and its glowing Flame Towers, followed by a scenic mountain drive into the lush Caucasian alpine valleys of Gabala. Ride the Tufandag Mountain cable car above pine forests, witness mysterious prehistoric rock art and bubbling mud volcanoes at Gobustan, and savor authentic grilled kebabs and plov in historic teahouses.",
    dayBlocks: [
      {
        day: 1,
        morning:
          "Direct 3-hour flight from Dubai DXB to Heydar Aliyev International Airport in Baku. VIP meet-and-greet at arrivals and private transfer to your central 4-star hotel.",
        afternoon:
          "Check into your hotel, freshen up, and take a leisurely orientation walk along Nizami Street (Torgovaya), Baku's bustling pedestrian shopping boulevard.",
        evening:
          "Head to Highland Park (Dagustu Park) for panoramic sunset views over Baku Bay and the illuminated Flame Towers LED light show.",
        overnight: "Overnight at 4★ Central Hotel, Baku",
        meals: "No meals (flight arrival)",
      },
      {
        day: 2,
        morning:
          "Guided walking tour of Icherisheher (Old City), visiting the 12th-century Maiden Tower, Palace of the Shirvanshahs, and ancient stone caravanserais.",
        afternoon:
          "Visit the world-renowned Heydar Aliyev Center for photo opportunities of its flowing curved architecture, followed by a walk along Baku Seaside Boulevard.",
        evening:
          "Traditional Azerbaijani dinner at a historic Old City restaurant featuring saj, dolma, and live traditional mugam folk music.",
        overnight: "Overnight at 4★ Central Hotel, Baku",
        meals: "Breakfast included",
      },
      {
        day: 3,
        morning:
          "Depart on a full-day guided excursion to Gabala in the Caucasus Mountains, passing scenic pine valleys and Nohur Lake.",
        afternoon:
          "Ride all 4 lines of the Tufandag Mountain Cable Car up to 1,920 meters for breathtaking Caucasian panoramas; visit 7 Beauties Waterfall.",
        evening:
          "Return to Baku in the evening; free time for shopping at Park Bulvar or 28 Mall on the Caspian waterfront.",
        overnight: "Overnight at 4★ Central Hotel, Baku",
        meals: "Breakfast included",
      },
      {
        day: 4,
        morning:
          "Excursion to Gobustan National Park to explore 40,000-year-old prehistoric rock carvings and the active bubbling mud volcanoes.",
        afternoon:
          "Visit Ateshgah Fire Temple and Yanar Dag (Burning Mountain natural gas flame) before private transfer to Baku International Airport.",
        evening: "Board your direct flight back to Dubai International Airport (DXB).",
        overnight: "Departure flight home",
        meals: "Breakfast included",
      },
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
      "Full electronic visa (eVisa) processing assistance for UAE residents",
    ],
    exclusions: [
      "International flights Dubai–Baku–Dubai (available at special agent rates)",
      "Lunch and dinner meals not specified in the itinerary",
      "Personal expenses, room service, laundry, and telephone calls",
      "Optional adventure activities at Gabala Shooting Club",
      "Comprehensive travel insurance (recommended, available on request)",
    ],
    accommodation: {
      category: "4-Star Superior Central Hotel (e.g. Winter Park Hotel / Central Park Hotel)",
      roomType: "Deluxe City View Room with King or Twin Beds",
      mealPlan: "Daily Breakfast Buffet",
      note: "5-Star luxury upgrade to Four Seasons Baku or Fairmont Flame Towers available upon request.",
    },
    transportation: [
      "Private air-conditioned Mercedes Vito / Sprinter throughout the itinerary",
      "All airport and hotel transfers included",
      "Tufandag Mountain Cable Car multi-level passes included",
    ],
    importantInfo: [
      {
        title: "Visa Requirements",
        body: "UAE residents with valid residency obtain easy ASAN online eVisa within 3 business days, or visa on arrival depending on national passport.",
      },
      {
        title: "Passport Validity",
        body: "Passports must be valid for at least 6 months beyond the date of entry into Azerbaijan.",
      },
      {
        title: "Currency & Payments",
        body: "Local currency is Azerbaijani Manat (AZN). Credit cards are widely accepted across Baku, while cash is handy for local mountain markets.",
      },
      {
        title: "Seasonality & Weather",
        body: "Spring (April–June) and Autumn (September–November) offer pleasant 20°C sightseeing weather. Winter brings snow to Gabala ski resort.",
      },
      {
        title: "Cancellation Policy",
        body: "Flexible cancellation up to 7 days prior to departure with nominal administrative charges.",
      },
    ],
    faqs: [
      {
        q: "How long is the flight from Dubai to Baku?",
        a: "Direct flights on flydubai, Azerbaijan Airlines, and Emirates take only 2 hours and 55 minutes from Dubai (DXB).",
      },
      {
        q: "Is Azerbaijan suitable for families with children?",
        a: "Yes, Baku is exceptionally safe, clean, and pedestrian-friendly with Ferris wheels, cable cars, and open parks that children love.",
      },
      {
        q: "Do UAE residents need a visa for Azerbaijan?",
        a: "Most GCC and UAE residents can get a fast online eVisa or visa on arrival; our team handles the application for you.",
      },
      {
        q: "Can we extend the trip to include Sheki or Shahdag?",
        a: "Yes, we can customize your itinerary to include 2 nights in the Silk Road city of Sheki or Shahdag Mountain Resort.",
      },
      {
        q: "What is the food like in Azerbaijan?",
        a: "Azerbaijani cuisine is 100% Halal and world-famous for skewered kebabs, saffron plov, fresh Caspian fish, and warm tandoor flatbreads.",
      },
    ],
    route: ["Baku", "Highland Park", "Icherisheher", "Gabala", "Gobustan"],
    featured: true,
    seasonal: "Trending Spring/Summer Special",
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
    image:
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Experience the legendary Arabian monsoon: emerald green mountains, flowing waterfalls, and cool 22°C misty mountain breezes in southern Oman.",
    story:
      "Witness the miracle of the Khareef season where the desert transforms into a lush green tropical paradise with cascading waterfalls and dramatic coastal blowholes.",
    highlights: [
      "Wadi Darbat emerald lakes, natural springs, and cascading waterfalls",
      "Mughsail Beach and natural marine blowholes blasting sea spray 30m high",
      "Jabal Samhan mountain summit viewpoint above the cloud layer",
      "Ayn Razat and Ayn Athum lush rainforest seasonal waterfalls",
      "Haffa Souq authentic Frankincense market and coconut fruit stalls",
      "Choice of Luxury Express VIP Bus from Dubai or direct flight package",
      "3-star to 5-star hotel options with daily breakfast",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    ],
    overview:
      "Every summer between July and September, an extraordinary natural phenomenon transforms the southern Dhofar region of Oman into a lush, mist-shrouded green wonderland known as Khareef. While the rest of the Arabian Gulf experiences peak summer heat, Salalah enjoys crisp 22°C temperatures, gentle drizzle, flowing freshwater wadis, and roaming camel herds grazing on emerald green mountain pastures. This signature 4-day package departs directly from Dubai—available via luxury sleeper-coach bus or direct 1.5-hour flight—taking you to the cascading waterfalls of Wadi Darbat, the dramatic rock blowholes of Mughsail, the highest peaks of Jabal Samhan, and the aromatic frankincense souqs of historic Salalah.",
    dayBlocks: [
      {
        day: 1,
        morning:
          "Depart Dubai early morning aboard our luxury air-conditioned executive coach (or fly direct DXB–SLL on flydubai/SalamAir). Smooth border crossing into Oman.",
        afternoon:
          "Scenic arrival into the misty green hills of Salalah. Check into your hotel and refresh.",
        evening:
          "Visit Haffa Beach coconut and tropical banana fruit stalls; sip fresh tender coconut water and explore the traditional Frankincense souq.",
        overnight: "Overnight in Salalah City Hotel",
        meals: "Dinner included on bus package",
      },
      {
        day: 2,
        morning:
          "Guided excursion to eastern Dhofar: visit the breathtaking Wadi Darbat with emerald-green lagoons, boat rides, and cascading waterfalls.",
        afternoon:
          "Drive up the mountain pass to Mirbat and Taqah Castle; witness the dramatic view from Taqah plateau overlooking the Arabian Sea.",
        evening:
          "Relax at Ayn Razat natural spring gardens surrounded by lush lotus flowers and mountain hills.",
        overnight: "Overnight in Salalah City Hotel",
        meals: "Breakfast included",
      },
      {
        day: 3,
        morning:
          "Tour western Salalah: travel along the dramatic coastal highway to Mughsail Beach and witness the natural Marneef Cave and water blowholes.",
        afternoon:
          "Ascend the zig-zag mountain road of Sarfait towards the Yemen border with panoramic views over the misty Indian Ocean cliffs.",
        evening:
          "Traditional Omani barbecue dinner featuring local camel meat (Mudhbi) cooked on hot desert stones.",
        overnight: "Overnight in Salalah City Hotel",
        meals: "Breakfast included",
      },
      {
        day: 4,
        morning:
          "Visit Sultan Qaboos Grand Mosque in Salalah and Ayn Athum seasonal waterfall for final photography.",
        afternoon:
          "Board return executive coach or transfer to Salalah Airport for flight back to Dubai.",
        evening: "Arrive back in Dubai DXB with unforgettable green monsoon memories.",
        overnight: "Arrival home",
        meals: "Breakfast included",
      },
    ],
    inclusions: [
      "3 Nights hotel accommodation in central Salalah",
      "Daily breakfast buffet at the hotel",
      "Roundtrip transportation from Dubai by Luxury Executive Bus or Flight",
      "Full-day guided tours to East and West Salalah in 4x4 / touring coach",
      "Wadi Darbat boat ride and nature park entry tickets",
      "Mughsail Beach blowholes & Marneef Cave excursion",
      "Experienced bilingual Omani tour leader throughout the trip",
      "Oman visa documentation support for UAE residents",
    ],
    exclusions: [
      "Oman tourist visa fee (payable at border or online for non-GCC nationals)",
      "Lunch meals during sightseeing stops",
      "Personal shopping and frankincense purchases",
      "Travel and medical insurance",
    ],
    accommodation: {
      category: "3★ / 4★ City Hotel or 5★ Beach Resort (e.g. Millennium Resort Salalah)",
      roomType: "Standard or Mountain View Deluxe Double Room",
      mealPlan: "Daily Breakfast",
      note: "Family suite and 2-bedroom interconnected apartment options available.",
    },
    transportation: [
      "Luxury long-haul executive coach with reclining seats, USB charging, and AC",
      "Optional flight upgrade on flydubai / SalamAir (1 hour 45 mins)",
      "4x4 / Coach transport for all mountain and wadi excursions in Salalah",
    ],
    importantInfo: [
      {
        title: "Oman Entry Rules",
        body: "UAE residents with approved professional designations receive GCC resident visa on arrival or online e-Visa for OMR 5 (AED 48).",
      },
      {
        title: "Emirates ID & Passport",
        body: "Original passport with minimum 6 months validity and Emirates ID required for border crossing.",
      },
      {
        title: "Khareef Season Dates",
        body: "The Khareef monsoon season runs from late June through early September annually, with peak lush greenery in July and August.",
      },
      {
        title: "Clothing Advice",
        body: "Light waterproof jackets and comfortable walking shoes recommended due to frequent mist and damp wadi trails.",
      },
    ],
    faqs: [
      {
        q: "How long is the bus journey from Dubai to Salalah?",
        a: "The executive coach takes approximately 12–14 hours with regular rest stops at food courts, fuel plazas, and border immigration.",
      },
      {
        q: "Can we book the flight package instead of the bus?",
        a: "Yes, we offer daily flight packages with flydubai and SalamAir taking just 1 hour 45 minutes direct.",
      },
      {
        q: "Is Salalah really green during summer?",
        a: "Yes! Dhofar catches the Indian Ocean monsoon, creating genuine rainforest conditions with waterfalls while the rest of the GCC is hot.",
      },
      {
        q: "Is this tour suitable for families with infants?",
        a: "The flight package is ideal for families with young children, while the bus package is popular with adults, couples, and teenagers.",
      },
      {
        q: "What should we buy in Salalah?",
        a: "Salalah is the world capital of royal Hojari Frankincense, natural perfumes, fresh mountain honey, and local Omani Halwa.",
      },
    ],
    route: ["Dubai", "Haffa", "Wadi Darbat", "Mughsail", "Ayn Athum"],
    featured: true,
    seasonal: "Monsoon Khareef Special (July - Sept)",
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
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Complete spiritual fulfillment: 10 nights in Makkah near Masjid Al Haram and 7 nights in Madinah near the Prophet's Mosque with Haramain High-Speed Train.",
    story:
      "Perform Umrah with complete peace of mind. Our dedicated religious guides handle your visa, luxury hotel bookings steps from the Haram, Ziyarat tours, and 24/7 ground assistance.",
    highlights: [
      "10 Nights in Makkah within walking distance of Masjid Al Haram",
      "7 Nights in Madinah close to Al Masjid An Nabawi",
      "Saudi Umrah Visa processing with medical insurance included",
      "Haramain High-Speed Bullet Train tickets between Makkah and Madinah",
      "Comprehensive Ziyarat historical tours in both Holy Cities",
      "Dedicated bilingual religious guides for Umrah performance",
      "VIP private or luxury bus transfers from Dubai / Jeddah / Madinah",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    ],
    overview:
      "Nawi Saadi Travel & Tourism has arranged blessed Umrah journeys for over 15 years with accredited Saudi Ministry of Hajj & Umrah licensing and dedicated offices in Jeddah and Kabul. This comprehensive 17-night pilgrimage package is meticulously organized to give you abundant time for worship, prayer in the Holy Mosques, Tahajjud, and reflection without rushing. Spend 10 spiritual nights in Makkah performing Umrah and Tawaf, followed by 7 serene nights in Madinah paying respects at the Rawdah of Prophet Muhammad (PBUH). Travel seamlessly between the holy cities aboard the state-of-the-art Haramain High-Speed bullet train, and visit historical Islamic heritage sites with knowledgeable scholars.",
    dayBlocks: [
      {
        day: 1,
        morning:
          "Depart Dubai on direct flight to Jeddah King Abdulaziz International Airport (or executive luxury Umrah coach). Enter Ihram with guidance.",
        afternoon:
          "VIP airport reception and private transfer to your hotel in Makkah Al Mukarramah. Check in and rest.",
        evening:
          "Perform your first Umrah (Tawaf, Sa'i between Safa & Marwah, and Halq/Taqseer) escorted by our experienced Mutawwif guide.",
        overnight: "Overnight at Makkah Hotel near Haram",
        meals: "No meals (travel day)",
      },
      {
        day: 2,
        morning: "Fajr prayers at Masjid Al Haram, followed by breakfast and rest.",
        afternoon: "Spiritual lecture on the virtues of Tawaf and Quran recitation in the Haram.",
        evening:
          "Maghrib and Isha prayers at the Kaaba, followed by free time for personal worship.",
        overnight: "Overnight at Makkah Hotel near Haram",
        meals: "Breakfast included",
      },
      {
        day: 3,
        morning:
          "Makkah Ziyarat Tour: visit Jabal Al Noor (Cave of Hira), Jabal Thawr, Mina, Muzdalifah, and Mount Arafat (Jabal Al Rahmah).",
        afternoon: "Return to Masjid Al Haram for Dhuhr and Asr prayers.",
        evening: "Evening worship and voluntary Tawaf under the illuminated minarets.",
        overnight: "Overnight at Makkah Hotel near Haram",
        meals: "Breakfast included",
      },
      {
        day: 4,
        morning: "Day of devotional worship, Quran recitation, and Tahajjud at the Holy Mosque.",
        afternoon: "Visit the Clock Tower Museum or Kiswah Factory (subject to permissions).",
        evening: "Dinner and fellowship with your fellow pilgrims.",
        overnight: "Overnight at Makkah Hotel near Haram",
        meals: "Breakfast included",
      },
      {
        day: 11,
        morning:
          "Perform Farewell Tawaf (Tawaf Al-Wada) in Makkah, hotel checkout, and transfer to Makkah Haramain Train Station.",
        afternoon:
          "Ride the 300 km/h Haramain High-Speed Bullet Train through the desert to the illuminated city of Madinah Al Munawwarah (2 hours).",
        evening:
          "Check into Madinah hotel, offer first Salam at Al Masjid An Nabawi, and pray in the blessed Prophet's Mosque.",
        overnight: "Overnight at Madinah Hotel near Haram",
        meals: "Breakfast included",
      },
      {
        day: 12,
        morning:
          "Madinah Historical Ziyarat: visit Masjid Quba (first mosque of Islam), Mount Uhud & Martyrs Cemetery, Masjid Al Qiblatayn, and the Seven Mosques (Khandaq).",
        afternoon:
          "Dhuhr and Asr prayers in the Prophet's Mosque courtyard under the giant retractable umbrellas.",
        evening: "Visit the Madinah Date Market to sample authentic Ajwa and Medjool dates.",
        overnight: "Overnight at Madinah Hotel near Haram",
        meals: "Breakfast included",
      },
      {
        day: 18,
        morning:
          "Final prayers and Salam at Al Masjid An Nabawi, hotel check-out, and private transfer to Prince Mohammad Bin Abdulaziz Airport in Madinah.",
        afternoon: "Board direct flight back to Dubai International Airport (DXB).",
        evening: "Arrive in Dubai spiritually rejuvenated with your blessed Umrah fulfilled.",
        overnight: "Arrival home",
        meals: "Breakfast included",
      },
    ],
    inclusions: [
      "10 Nights hotel accommodation in Makkah Al Mukarramah",
      "7 Nights hotel accommodation in Madinah Al Munawwarah",
      "Saudi Umrah electronic visa with mandatory COVID/medical insurance",
      "Haramain High Speed Bullet Train ticket between Makkah & Madinah",
      "Comprehensive guided Ziyarat historical tours in Makkah and Madinah",
      "Experienced religious scholar / Mutawwif to guide Umrah rituals",
      "Zamzam water can (5 Liters) provided per pilgrim at airport departure",
      "24/7 on-ground assistance from our permanent Jeddah & Madinah offices",
    ],
    exclusions: [
      "International flights (can be bundled with flydubai, Saudia, or Emirates)",
      "Lunch and dinner meals (unless half-board/full-board package selected)",
      "Personal expenses, laundry, and international roaming",
    ],
    accommodation: {
      category:
        "Choice of 3★ Economy (500m), 4★ Superior (200m), or 5★ Clock Tower Luxury (Front Row)",
      roomType: "Double, Triple, or Quad Sharing Rooms with En-suite Bathrooms",
      mealPlan: "Daily Breakfast Buffet",
      note: "5★ packages include Swissôtel, Pullman Zamzam, or Fairmont Clock Tower with direct Haram courtyard elevators.",
    },
    transportation: [
      "Private VIP GMC Yukon / luxury touring coach transfers",
      "Haramain High-Speed Train Business or Economy class tickets",
      "Private touring vehicle for Makkah & Madinah Ziyarat excursions",
    ],
    importantInfo: [
      {
        title: "Nusuk App Permits",
        body: "We register and issue your official Rawdah Sharif prayer permit via the Saudi Nusuk platform.",
      },
      {
        title: "Vaccination & Health",
        body: "Meningitis vaccination and valid health record recommended prior to departure.",
      },
      {
        title: "Visa Documentation",
        body: "Only passport copy and white-background photo required for 1-year multiple entry Saudi tourist/Umrah visa.",
      },
    ],
    faqs: [
      {
        q: "Is the Haramain bullet train included?",
        a: "Yes, our package includes the 300 km/h Haramain high-speed train connecting Makkah and Madinah in just 2 hours.",
      },
      {
        q: "Can women perform Umrah without a Mahram?",
        a: "Yes, under current Saudi regulations, women of all ages can travel for Umrah without a Mahram.",
      },
      {
        q: "How close are the hotels to the Holy Mosques?",
        a: "3★ hotels are 350-500m away, 4★ hotels are 150-250m, and 5★ hotels are located directly on the Haram courtyard.",
      },
      {
        q: "Do you assist with Nusuk permits for Rawdah Sharif?",
        a: "Yes, our operations team guarantees advance scheduling of your official Rawdah Sharif visiting slot on Nusuk.",
      },
      {
        q: "Can we customize the number of days in Makkah and Madinah?",
        a: "Yes, we arrange 7-night, 10-night, 14-night, and 21-night packages tailored to your schedule.",
      },
    ],
    route: ["Jeddah", "Makkah Al Mukarramah", "Madinah Al Munawwarah"],
    featured: true,
    seasonal: "Year-Round Spiritual Special",
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
    image:
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
    intro:
      "Turquoise rivers, Ottoman stone bridges, lush green valleys, and emerald waterfalls in the heart of the Balkans — just 5 hours from Dubai.",
    story:
      "Explore Sarajevo's historic Baščaršija bazaar, watch daring divers leap from Mostar's UNESCO Old Bridge, and relax at the majestic Kravice Waterfalls.",
    highlights: [
      "Guided walking tour of Sarajevo's Ottoman Baščaršija Old Town",
      "UNESCO-listed Old Bridge (Stari Most) of Mostar with riverfront dining",
      "Kravice Waterfalls nature park with boat rides and swimming",
      "Blagaj Tekke 600-year-old Dervish monastery at the Buna river cave spring",
      "Vrelo Bosne natural spring park and Konjic historic stone bridge",
      "4-star mountain and river view hotels with daily breakfast",
      "Direct flight support and visa guidance for UAE residents",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    ],
    overview:
      "Bosnia and Herzegovina is one of Europe's most enchanting and budget-friendly treasures. Nestled amidst the Dinaric Alps, it features crystal-clear emerald rivers, dramatic limestone canyons, cascading waterfalls, and a rich cultural fusion where East meets West. This signature 6-day journey from Dubai takes you through the cobblestone alleys and copper bazaars of Sarajevo, across the legendary Ottoman stone bridge of Mostar, to the serene 16th-century cliffside Dervish monastery of Blagaj, and the breathtaking turquoise cascades of Kravice Waterfalls.",
    dayBlocks: [
      {
        day: 1,
        morning:
          "Fly direct from Dubai (DXB) to Sarajevo International Airport (SJJ). Meet private English-speaking chauffeur at arrivals.",
        afternoon:
          "Transfer to your 4★ central Sarajevo hotel, check in, and enjoy a traditional Bosnian coffee in the Baščaršija square.",
        evening:
          "Take a scenic ride on the Sarajevo Cable Car up to Mount Trebević for sunset views over the entire city.",
        overnight: "Overnight in Sarajevo",
        meals: "No meals (arrival day)",
      },
      {
        day: 2,
        morning:
          "Guided tour of Sarajevo: Latin Bridge (site of 1914 event), Gazi Husrev-beg Mosque, Sahat Kula Clock Tower, and the Tunnel of Hope museum.",
        afternoon:
          "Visit Vrelo Bosne, the lush natural springs of the River Bosna, with horse-drawn carriage rides along tree-lined avenues.",
        evening:
          "Traditional Bosnian dinner featuring authentic Ćevapi and Burek pastries in the Old Town.",
        overnight: "Overnight in Sarajevo",
        meals: "Breakfast included",
      },
      {
        day: 3,
        morning:
          "Scenic drive through the Neretva river canyon to Konjic; visit the 6-arch Ottoman Stone Bridge and Tito's subterranean nuclear bunker.",
        afternoon:
          "Continue to Jablanica for famous spit-roasted lamb by the river before driving to sunny Mostar.",
        evening:
          "Check into Mostar hotel and stroll the cobblestone lanes of Kujundžiluk bazaar as the Old Bridge illuminates at night.",
        overnight: "Overnight in Mostar",
        meals: "Breakfast included",
      },
      {
        day: 4,
        morning:
          "Tour Mostar's UNESCO-listed Old Bridge (Stari Most), Koski Mehmed Pasha Mosque, and Turkish House (Kajtaz).",
        afternoon:
          "Visit Blagaj Tekke, the 600-year-old Dervish monastery built into a 200m vertical cliff at the source of the emerald Buna River.",
        evening: "Dine on fresh Buna river trout at a cliffside waterside restaurant.",
        overnight: "Overnight in Mostar",
        meals: "Breakfast included",
      },
      {
        day: 5,
        morning:
          "Full-day trip to Kravice Waterfalls — a 120-meter wide natural amphitheater of 25m cascading waterfalls surrounded by lush greenery.",
        afternoon:
          "Swim in the emerald pools, take a wooden boat tour under the falls, and visit the medieval fortified stone village of Počitelj.",
        evening: "Return to Sarajevo for your final evening in Bosnia.",
        overnight: "Overnight in Sarajevo",
        meals: "Breakfast included",
      },
      {
        day: 6,
        morning:
          "Breakfast, free time for souvenir copper shopping in Baščaršija, and private transfer to Sarajevo Airport.",
        afternoon: "Board direct return flight to Dubai DXB.",
        evening: "Arrive in Dubai.",
        overnight: "Departure flight home",
        meals: "Breakfast included",
      },
    ],
    inclusions: [
      "5 Nights accommodation in central 4★ hotels (Sarajevo & Mostar)",
      "Daily international and Bosnian breakfast buffet",
      "Private roundtrip airport transfers in luxury Mercedes vehicle",
      "Full private vehicle and driver for all intercity tours (Sarajevo, Mostar, Konjic, Blagaj, Kravice)",
      "Entrance tickets to Kravice Waterfalls, Blagaj Tekke, and Tunnel of Hope",
      "Professional English / Arabic speaking certified local tour guide",
      "Schengen / Bosnia visa assistance for UAE residents",
    ],
    exclusions: [
      "International flights Dubai–Sarajevo–Dubai",
      "Lunch and dinner meals not specified",
      "Personal expenses and tips for drivers/guides",
      "Travel insurance",
    ],
    accommodation: {
      category: "4★ Boutique Hotels (e.g. Hotel Europe Sarajevo & Hotel Mepas Mostar)",
      roomType: "Superior City View Double Room",
      mealPlan: "Daily Breakfast Buffet",
      note: "5★ luxury upgrade to Swissôtel Sarajevo available upon request.",
    },
    transportation: [
      "Private Mercedes V-Class / Sprinter with dedicated English-speaking driver",
      "Sarajevo Cable Car tickets included",
      "All fuel, highway tolls, and parking fees covered",
    ],
    importantInfo: [
      {
        title: "Visa Requirements",
        body: "UAE nationals and holders of valid multiple-entry Schengen, UK, or USA visas enter Bosnia 100% visa-free for 30 days.",
      },
      {
        title: "Halal Destination",
        body: "Bosnia is one of Europe's premier Halal destinations with Halal-certified food everywhere and prayer facilities in every city.",
      },
      {
        title: "Currency",
        body: "Bosnian Convertible Mark (BAM). 1 BAM ≈ 2 AED. Euros are also widely accepted.",
      },
    ],
    faqs: [
      {
        q: "How long is the flight from Dubai to Sarajevo?",
        a: "Direct flights on flydubai take approximately 5 hours and 30 minutes from Dubai (DXB).",
      },
      {
        q: "Is Bosnia safe for family travel?",
        a: "Bosnia is remarkably safe, family-friendly, and hospitable with pristine nature and very low crime rates.",
      },
      {
        q: "What is the weather like in Bosnia?",
        a: "Summers (June–August) are warm and sunny (25–28°C), perfect for waterfalls, while winters offer snow and skiing on Olympic mountains.",
      },
      {
        q: "Can UAE residents enter with a Schengen visa?",
        a: "Yes, UAE residents holding valid multiple-entry Schengen, US, or UK visas can enter Bosnia visa-free.",
      },
      {
        q: "Is the food Halal?",
        a: "Yes, almost all traditional Bosnian restaurants serve 100% Halal meat, delicious pastries, and fresh mountain trout.",
      },
    ],
    route: ["Sarajevo", "Konjic", "Mostar", "Blagaj", "Kravice"],
    featured: true,
    seasonal: "Summer & Autumn Balkan Favorite",
  },
];

console.log("Building all packages and details with strict 10-point structure...");
