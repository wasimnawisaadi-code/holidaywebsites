import { BRAND, credentials, offices, serviceLines, waLink } from "./catalogue-brand";
export { BRAND, credentials, offices, serviceLines, waLink };
export type { Office } from "./catalogue-brand";

export type TravelStyle =
  | "Family"
  | "Honeymoon"
  | "Romantic"
  | "Luxury"
  | "Adventure"
  | "Beach"
  | "City Escape"
  | "Cultural"
  | "Historical"
  | "Nature"
  | "Mountain"
  | "Safari"
  | "Theme Park"
  | "Shopping"
  | "Northern Lights"
  | "Cruises"
  | "Weekend Escape"
  | "Budget Friendly";

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

export const packages: HolidayPackage[] = [
  {
    "slug": "baku-wonders",
    "title": "Baku Wonders & Gabala Alpine Mountain Escape",
    "destination": "Baku · Old City · Gobustan · Gabala",
    "country": "Azerbaijan",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": [
      "Weekend Escape",
      "Family",
      "Cultural"
    ],
    "priceStatus": "from",
    "priceFrom": 1899,
    "image": "/images/destinations/azerbaijan-baku.jpg",
    "intro": "Just 3 hours from Dubai: futuristic architecture meets ancient UNESCO Silk Road stone walls, Caspian Sea promenades, and alpine cable cars.",
    "story": "Explore the UNESCO-listed Icherisheher Old City, marvel at the illuminated Flame Towers, and take a day trip to Gabala's snow-capped mountains and Tufandag cable car.",
    "highlights": [
      "Guided tour of Icherisheher Old Town, Maiden Tower & Shirvanshahs Palace",
      "Heydar Aliyev Center architectural masterpiece by Zaha Hadid",
      "Full-day scenic excursion to Gabala with Tufandag Mountain Cable Car",
      "Gobustan prehistoric petroglyphs and active mud volcanoes",
      "Baku Ferris Wheel and Caspian Sea Boulevard evening promenade walk",
      "4-star central hotel with daily Azerbaijani breakfast buffet",
      "Fast 3-day online eVisa document handling for UAE residents"
    ],
    "route": [
      "Baku",
      "Highland Park",
      "Icherisheher",
      "Gabala",
      "Gobustan"
    ],
    "featured": true,
    "seasonal": "Seasonal Special",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Direct 3-hour flight from Dubai DXB to Heydar...",
        "summary": "Check into your hotel, freshen up, and take a leisurely orientation walk along Nizami Stre",
        "activities": [
          "Direct 3-hour flight from Dubai DXB to Heydar Aliyev International Airport in Baku. VIP meet-and-greet at arrivals and private transfer to your central 4-star hotel.",
          "Check into your hotel, freshen up, and take a leisurely orientation walk along Nizami Street (Torgovaya), Baku's bustling pedestrian shopping boulevard.",
          "Head to Highland Park (Dagustu Park) for panoramic sunset views over Baku Bay and the illuminated Flame Towers LED light show."
        ],
        "meals": "No meals (flight arrival)",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Guided walking tour of Icherisheher (Old City...",
        "summary": "Visit the world-renowned Heydar Aliyev Center for photo opportunities of its flowing curve",
        "activities": [
          "Guided walking tour of Icherisheher (Old City), visiting the 12th-century Maiden Tower, Palace of the Shirvanshahs, and ancient stone caravanserais.",
          "Visit the world-renowned Heydar Aliyev Center for photo opportunities of its flowing curved architecture, followed by a walk along Baku Seaside Boulevard.",
          "Traditional Azerbaijani dinner at a historic Old City restaurant featuring saj, dolma, and live traditional mugam folk music."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Depart on a full-day guided excursion to Gaba...",
        "summary": "Ride all 4 lines of the Tufandag Mountain Cable Car up to 1,920 meters for breathtaking Ca",
        "activities": [
          "Depart on a full-day guided excursion to Gabala in the Caucasus Mountains, passing scenic pine valleys and Nohur Lake.",
          "Ride all 4 lines of the Tufandag Mountain Cable Car up to 1,920 meters for breathtaking Caucasian panoramas; visit 7 Beauties Waterfall.",
          "Return to Baku in the evening; free time for shopping at Park Bulvar or 28 Mall on the Caspian waterfront."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Excursion to Gobustan National Park to explor...",
        "summary": "Visit Ateshgah Fire Temple and Yanar Dag (Burning Mountain natural gas flame) before priva",
        "activities": [
          "Excursion to Gobustan National Park to explore 40,000-year-old prehistoric rock carvings and the active bubbling mud volcanoes.",
          "Visit Ateshgah Fire Temple and Yanar Dag (Burning Mountain natural gas flame) before private transfer to Baku International Airport.",
          "Board your direct flight back to Dubai International Airport (DXB)."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
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
    "exclusions": [
      "International flights Dubai–Baku–Dubai (available at special agent rates)",
      "Lunch and dinner meals not specified in the itinerary",
      "Personal expenses, room service, laundry, and telephone calls",
      "Optional adventure activities at Gabala Shooting Club",
      "Comprehensive travel insurance"
    ]
  },
  {
    "slug": "salalah-khareef-monsoon",
    "title": "Salalah Khareef Misty Green Mountains by Luxury Bus & Flight",
    "destination": "Salalah · Wadi Darbat · Ayn Athum · Mughsail Beach · Haffa Souq",
    "country": "Oman",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": [
      "Weekend Escape",
      "Adventure",
      "Family"
    ],
    "priceStatus": "from",
    "priceFrom": 1299,
    "image": "/images/destinations/oman-salalah.jpg",
    "intro": "Experience the legendary Arabian monsoon: emerald green mountains, flowing waterfalls, and cool 22°C misty mountain breezes in southern Oman.",
    "story": "Witness the miracle of the Khareef season where the desert transforms into a lush green tropical paradise with cascading waterfalls and dramatic coastal blowholes.",
    "highlights": [
      "Wadi Darbat emerald lakes, natural springs, and cascading waterfalls",
      "Mughsail Beach and natural marine blowholes blasting sea spray 30m high",
      "Jabal Samhan mountain summit viewpoint above the cloud layer",
      "Ayn Razat and Ayn Athum lush rainforest seasonal waterfalls",
      "Haffa Souq authentic Frankincense market and coconut fruit stalls",
      "Choice of Luxury Express VIP Bus from Dubai or direct flight package",
      "3-star to 5-star hotel options with daily breakfast"
    ],
    "route": [
      "Dubai",
      "Haffa",
      "Wadi Darbat",
      "Mughsail",
      "Ayn Athum"
    ],
    "featured": true,
    "seasonal": "Seasonal Special",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Depart Dubai early morning aboard our luxury ...",
        "summary": "Scenic arrival into the misty green hills of Salalah. Check into your hotel and refresh.",
        "activities": [
          "Depart Dubai early morning aboard our luxury air-conditioned executive coach (or fly direct DXB–SLL on flydubai/SalamAir). Smooth border crossing into Oman.",
          "Scenic arrival into the misty green hills of Salalah. Check into your hotel and refresh.",
          "Visit Haffa Beach coconut and tropical banana fruit stalls; sip fresh tender coconut water and explore the traditional Frankincense souq."
        ],
        "meals": "Dinner included on bus package",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Guided excursion to eastern Dhofar: visit the...",
        "summary": "Drive up the mountain pass to Mirbat and Taqah Castle; witness the dramatic view from Taqa",
        "activities": [
          "Guided excursion to eastern Dhofar: visit the breathtaking Wadi Darbat with emerald-green lagoons, boat rides, and cascading waterfalls.",
          "Drive up the mountain pass to Mirbat and Taqah Castle; witness the dramatic view from Taqah plateau overlooking the Arabian Sea.",
          "Relax at Ayn Razat natural spring gardens surrounded by lush lotus flowers and mountain hills."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Tour western Salalah: travel along the dramat...",
        "summary": "Ascend the zig-zag mountain road of Sarfait towards the Yemen border with panoramic views ",
        "activities": [
          "Tour western Salalah: travel along the dramatic coastal highway to Mughsail Beach and witness the natural Marneef Cave and water blowholes.",
          "Ascend the zig-zag mountain road of Sarfait towards the Yemen border with panoramic views over the misty Indian Ocean cliffs.",
          "Traditional Omani barbecue dinner featuring local camel meat (Mudhbi) cooked on hot desert stones."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Visit Sultan Qaboos Grand Mosque in Salalah a...",
        "summary": "Board return executive coach or transfer to Salalah Airport for flight back to Dubai.",
        "activities": [
          "Visit Sultan Qaboos Grand Mosque in Salalah and Ayn Athum seasonal waterfall for final photography.",
          "Board return executive coach or transfer to Salalah Airport for flight back to Dubai.",
          "Arrive back in Dubai DXB with unforgettable green monsoon memories."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "3 Nights hotel accommodation in central Salalah",
      "Daily breakfast buffet at the hotel",
      "Roundtrip transportation from Dubai by Luxury Executive Bus or Flight",
      "Full-day guided tours to East and West Salalah in 4x4 / touring coach",
      "Wadi Darbat boat ride and nature park entry tickets",
      "Mughsail Beach blowholes & Marneef Cave excursion",
      "Experienced bilingual Omani tour leader throughout the trip",
      "Oman visa documentation support for UAE residents"
    ],
    "exclusions": [
      "Oman tourist visa fee",
      "Lunch meals during sightseeing stops",
      "Personal shopping and frankincense purchases",
      "Travel insurance"
    ]
  },
  {
    "slug": "umrah-17-nights",
    "title": "17 Nights Umrah Spiritual Journey - Makkah & Madinah (3★/4★/5★)",
    "destination": "Makkah Al Mukarramah · Madinah Al Munawwarah",
    "country": "Saudi Arabia",
    "region": "International",
    "days": 18,
    "nights": 17,
    "styles": [
      "Cultural",
      "Family",
      "Luxury"
    ],
    "priceStatus": "from",
    "priceFrom": 3499,
    "image": "/images/destinations/umrah-clock-tower.jpg",
    "intro": "Complete spiritual fulfillment: 10 nights in Makkah near Masjid Al Haram and 7 nights in Madinah near the Prophet's Mosque with Haramain High-Speed Train.",
    "story": "Perform Umrah with complete peace of mind. Our dedicated religious guides handle your visa, luxury hotel bookings steps from the Haram, Ziyarat tours, and 24/7 ground assistance.",
    "highlights": [
      "10 Nights in Makkah within walking distance of Masjid Al Haram",
      "7 Nights in Madinah close to Al Masjid An Nabawi",
      "Saudi Umrah Visa processing with medical insurance included",
      "Haramain High-Speed Bullet Train tickets between Makkah and Madinah",
      "Comprehensive Ziyarat historical tours in both Holy Cities",
      "Dedicated bilingual religious guides for Umrah performance",
      "VIP private or luxury bus transfers from Dubai / Jeddah / Madinah"
    ],
    "route": [
      "Jeddah",
      "Makkah Al Mukarramah",
      "Madinah Al Munawwarah"
    ],
    "featured": true,
    "seasonal": "Seasonal Special",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Depart Dubai on direct flight to Jeddah King ...",
        "summary": "VIP airport reception and private transfer to your hotel in Makkah Al Mukarramah. Check in",
        "activities": [
          "Depart Dubai on direct flight to Jeddah King Abdulaziz International Airport (or executive luxury Umrah coach). Enter Ihram with guidance.",
          "VIP airport reception and private transfer to your hotel in Makkah Al Mukarramah. Check in and rest.",
          "Perform your first Umrah (Tawaf, Sa'i between Safa & Marwah, and Halq/Taqseer) escorted by our experienced Mutawwif guide."
        ],
        "meals": "No meals (travel day)",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Fajr prayers at Masjid Al Haram, followed by ...",
        "summary": "Spiritual lecture on the virtues of Tawaf and Quran recitation in the Haram.",
        "activities": [
          "Fajr prayers at Masjid Al Haram, followed by breakfast and rest.",
          "Spiritual lecture on the virtues of Tawaf and Quran recitation in the Haram.",
          "Maghrib and Isha prayers at the Kaaba, followed by free time for personal worship."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Makkah Ziyarat Tour: visit Jabal Al Noor (Cav...",
        "summary": "Return to Masjid Al Haram for Dhuhr and Asr prayers.",
        "activities": [
          "Makkah Ziyarat Tour: visit Jabal Al Noor (Cave of Hira), Jabal Thawr, Mina, Muzdalifah, and Mount Arafat (Jabal Al Rahmah).",
          "Return to Masjid Al Haram for Dhuhr and Asr prayers.",
          "Evening worship and voluntary Tawaf under the illuminated minarets."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 11,
        "title": "Day 11 — Perform Farewell Tawaf (Tawaf Al-Wada) in Mak...",
        "summary": "Ride the 300 km/h Haramain High-Speed Bullet Train through the desert to the illuminated c",
        "activities": [
          "Perform Farewell Tawaf (Tawaf Al-Wada) in Makkah, hotel checkout, and transfer to Makkah Haramain Train Station.",
          "Ride the 300 km/h Haramain High-Speed Bullet Train through the desert to the illuminated city of Madinah Al Munawwarah (2 hours).",
          "Check into Madinah hotel, offer first Salam at Al Masjid An Nabawi, and pray in the blessed Prophet's Mosque."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 18,
        "title": "Day 18 — Final prayers and Salam at Al Masjid An Nabaw...",
        "summary": "Board direct flight back to Dubai International Airport (DXB).",
        "activities": [
          "Final prayers and Salam at Al Masjid An Nabawi, hotel check-out, and private transfer to Prince Mohammad Bin Abdulaziz Airport in Madinah.",
          "Board direct flight back to Dubai International Airport (DXB).",
          "Arrive in Dubai spiritually rejuvenated with your blessed Umrah fulfilled."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "10 Nights hotel accommodation in Makkah Al Mukarramah",
      "7 Nights hotel accommodation in Madinah Al Munawwarah",
      "Saudi Umrah electronic visa with mandatory COVID/medical insurance",
      "Haramain High Speed Bullet Train ticket between Makkah & Madinah",
      "Comprehensive guided Ziyarat historical tours in Makkah and Madinah",
      "Experienced religious scholar / Mutawwif to guide Umrah rituals",
      "Zamzam water can (5 Liters) provided per pilgrim at airport departure",
      "24/7 on-ground assistance from our permanent Jeddah & Madinah offices"
    ],
    "exclusions": [
      "International flights (can be bundled with flydubai, Saudia, or Emirates)",
      "Lunch and dinner meals",
      "Personal expenses, laundry, and international roaming"
    ]
  },
  {
    "slug": "bosnian-delight",
    "title": "Bosnian Delight: Sarajevo, Mostar & Kravice Waterfalls",
    "destination": "Sarajevo · Mostar · Konjic · Blagaj · Kravice Falls",
    "country": "Bosnia and Herzegovina",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Cultural",
      "Family",
      "Adventure"
    ],
    "priceStatus": "from",
    "priceFrom": 2899,
    "image": "/images/destinations/bosnia-mostar.jpg",
    "intro": "Turquoise rivers, Ottoman stone bridges, lush green valleys, and emerald waterfalls in the heart of the Balkans — just 5 hours from Dubai.",
    "story": "Explore Sarajevo's historic Baščaršija bazaar, watch daring divers leap from Mostar's UNESCO Old Bridge, and relax at the majestic Kravice Waterfalls.",
    "highlights": [
      "Guided walking tour of Sarajevo's Ottoman Baščaršija Old Town",
      "UNESCO-listed Old Bridge (Stari Most) of Mostar with riverfront dining",
      "Kravice Waterfalls nature park with boat rides and swimming",
      "Blagaj Tekke 600-year-old Dervish monastery at the Buna river cave spring",
      "Vrelo Bosne natural spring park and Konjic historic stone bridge",
      "4-star mountain and river view hotels with daily breakfast",
      "Direct flight support and visa guidance for UAE residents"
    ],
    "route": [
      "Sarajevo",
      "Konjic",
      "Mostar",
      "Blagaj",
      "Kravice"
    ],
    "featured": true,
    "seasonal": "Seasonal Special",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Fly direct from Dubai (DXB) to Sarajevo Inter...",
        "summary": "Transfer to your 4★ central Sarajevo hotel, check in, and enjoy a traditional Bosnian coff",
        "activities": [
          "Fly direct from Dubai (DXB) to Sarajevo International Airport (SJJ). Meet private English-speaking chauffeur at arrivals.",
          "Transfer to your 4★ central Sarajevo hotel, check in, and enjoy a traditional Bosnian coffee in the Baščaršija square.",
          "Take a scenic ride on the Sarajevo Cable Car up to Mount Trebević for sunset views over the entire city."
        ],
        "meals": "No meals (arrival day)",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Guided tour of Sarajevo: Latin Bridge, Gazi H...",
        "summary": "Visit Vrelo Bosne, the lush natural springs of the River Bosna, with horse-drawn carriage ",
        "activities": [
          "Guided tour of Sarajevo: Latin Bridge, Gazi Husrev-beg Mosque, Sahat Kula Clock Tower, and the Tunnel of Hope museum.",
          "Visit Vrelo Bosne, the lush natural springs of the River Bosna, with horse-drawn carriage rides along tree-lined avenues.",
          "Traditional Bosnian dinner featuring authentic Ćevapi and Burek pastries in the Old Town."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Scenic drive through the Neretva river canyon...",
        "summary": "Continue to Jablanica for famous spit-roasted lamb by the river before driving to sunny Mo",
        "activities": [
          "Scenic drive through the Neretva river canyon to Konjic; visit the 6-arch Ottoman Stone Bridge and Tito's subterranean nuclear bunker.",
          "Continue to Jablanica for famous spit-roasted lamb by the river before driving to sunny Mostar.",
          "Check into Mostar hotel and stroll the cobblestone lanes of Kujundžiluk bazaar as the Old Bridge illuminates at night."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Tour Mostar's UNESCO-listed Old Bridge (Stari...",
        "summary": "Visit Blagaj Tekke, the 600-year-old Dervish monastery built into a 200m vertical cliff at",
        "activities": [
          "Tour Mostar's UNESCO-listed Old Bridge (Stari Most), Koski Mehmed Pasha Mosque, and Turkish House (Kajtaz).",
          "Visit Blagaj Tekke, the 600-year-old Dervish monastery built into a 200m vertical cliff at the source of the emerald Buna River.",
          "Dine on fresh Buna river trout at a cliffside waterside restaurant."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Full-day trip to Kravice Waterfalls — a 120-m...",
        "summary": "Swim in the emerald pools, take a wooden boat tour under the falls, and visit the medieval",
        "activities": [
          "Full-day trip to Kravice Waterfalls — a 120-meter wide natural amphitheater of 25m cascading waterfalls surrounded by lush greenery.",
          "Swim in the emerald pools, take a wooden boat tour under the falls, and visit the medieval fortified stone village of Počitelj.",
          "Return to Sarajevo for your final evening in Bosnia."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Breakfast, free time for souvenir copper shop...",
        "summary": "Board direct return flight to Dubai DXB.",
        "activities": [
          "Breakfast, free time for souvenir copper shopping in Baščaršija, and private transfer to Sarajevo Airport.",
          "Board direct return flight to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "5 Nights accommodation in central 4★ hotels (Sarajevo & Mostar)",
      "Daily international and Bosnian breakfast buffet",
      "Private roundtrip airport transfers in luxury Mercedes vehicle",
      "Full private vehicle and driver for all intercity tours",
      "Entrance tickets to Kravice Waterfalls, Blagaj Tekke, and Tunnel of Hope",
      "Professional English / Arabic speaking certified local tour guide",
      "Schengen / Bosnia visa assistance for UAE residents"
    ],
    "exclusions": [
      "International flights Dubai–Sarajevo–Dubai",
      "Lunch and dinner meals not specified",
      "Personal expenses and tips for drivers/guides",
      "Travel insurance"
    ]
  },
  {
    "slug": "swiss-alpine-dream",
    "title": "Swiss Alpine Dream & Panoramic Rail",
    "destination": "Zurich · Lucerne · Interlaken · Jungfraujoch",
    "country": "Switzerland",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "Luxury",
      "Family",
      "Honeymoon"
    ],
    "priceStatus": "from",
    "priceFrom": 5499,
    "image": "/images/destinations/swiss-matterhorn.jpg",
    "intro": "Seven days across turquoise lakes, glacier peaks and postcard villages, travelling on Switzerland's world-famous scenic rail network.",
    "story": "Wake up to lake mist in Lucerne, ascend above the clouds to Jungfraujoch (Top of Europe), and watch the Alps glide past panoramic train windows.",
    "highlights": [
      "Jungfraujoch — Top of Europe cogwheel railway",
      "Mount Titlis Rotair revolving cable car & Cliff Walk",
      "GoldenPass panoramic scenic train journey",
      "Sunset catamaran cruise on Lake Lucerne",
      "4-star central hotels with daily Swiss breakfast",
      "Schengen visa document support from Dubai"
    ],
    "route": [
      "Zurich",
      "Lucerne",
      "Interlaken",
      "Jungfraujoch",
      "Geneva"
    ],
    "featured": true,
    "seasonal": "European Summer & Winter Classic",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Land in Zurich from Dubai, meet private chauf...",
        "summary": "Check into 4★/5★ hotel, relax, and take a stroll along the Limmat river promenade.",
        "activities": [
          "Land in Zurich from Dubai, meet private chauffeur at arrivals for VIP transfer to central hotel.",
          "Check into 4★/5★ hotel, relax, and take a stroll along the Limmat river promenade.",
          "Welcome Swiss dinner in historic Altstadt (Old Town)."
        ],
        "meals": "No meals",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Scenic train to Lucerne, walk the 14th-centur...",
        "summary": "Explore cobblestone alleys and board a luxury catamaran cruise on Lake Lucerne.",
        "activities": [
          "Scenic train to Lucerne, walk the 14th-century wooden Chapel Bridge and Lion Monument.",
          "Explore cobblestone alleys and board a luxury catamaran cruise on Lake Lucerne.",
          "Lakefront dining overlooking Mount Pilatus."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Ascend Mount Titlis aboard the world's first ...",
        "summary": "Walk across the Titlis Cliff Walk and explore the Glacier Ice Cave.",
        "activities": [
          "Ascend Mount Titlis aboard the world's first revolving Rotair cable car through alpine clouds.",
          "Walk across the Titlis Cliff Walk and explore the Glacier Ice Cave.",
          "Return to Lucerne for a relaxed fondue evening."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Board the GoldenPass panoramic train toward I...",
        "summary": "Stroll the Höheweg promenade with views of the Jungfrau massif.",
        "activities": [
          "Board the GoldenPass panoramic train toward Interlaken between Lakes Thun and Brienz.",
          "Stroll the Höheweg promenade with views of the Jungfrau massif.",
          "Traditional Swiss chalet dinner in Interlaken."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Board the famous Eiger Express and cogwheel t...",
        "summary": "Visit the Ice Palace, Sphinx Observatory, and Alpine Sensation exhibition.",
        "activities": [
          "Board the famous Eiger Express and cogwheel train to Jungfraujoch — Top of Europe (3,454m).",
          "Visit the Ice Palace, Sphinx Observatory, and Alpine Sensation exhibition.",
          "Descend past Lauterbrunnen waterfalls back to Interlaken."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Scenic train ride to Geneva along Lake Geneva...",
        "summary": "Guided tour of Geneva: Jet d'Eau, Flower Clock, and United Nations headquarters.",
        "activities": [
          "Scenic train ride to Geneva along Lake Geneva with views of Lavaux terraced vineyards.",
          "Guided tour of Geneva: Jet d'Eau, Flower Clock, and United Nations headquarters.",
          "Gourmet farewell dinner along the lakefront."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 7,
        "title": "Day 7 — Enjoy Swiss breakfast, hotel check-out assist...",
        "summary": "Board direct Emirates / Swiss flight back to Dubai International Airport.",
        "activities": [
          "Enjoy Swiss breakfast, hotel check-out assistance, and private transfer to Geneva Airport.",
          "Board direct Emirates / Swiss flight back to Dubai International Airport.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "6 Nights accommodation in handpicked 4★ & 5★ Swiss hotels",
      "Daily Swiss buffet breakfast",
      "First-Class Swiss Travel Pass with unlimited train, boat, and bus travel",
      "Jungfraujoch Top of Europe cogwheel railway ticket",
      "Mount Titlis Rotair revolving cable car & Cliff Walk ticket",
      "Lake Lucerne panoramic catamaran cruise",
      "Roundtrip airport transfers by private vehicle",
      "Full Schengen visa documentation support"
    ],
    "exclusions": [
      "International flights Dubai–Zurich / Geneva–Dubai",
      "Lunch and dinner meals not specified",
      "Optional adventure activities (paragliding, helicopter tours)",
      "Travel insurance"
    ]
  },
  {
    "slug": "maldives-overwater-escape",
    "title": "Maldives Luxury Overwater Lagoon Villa",
    "destination": "North Malé Atoll · Private Island",
    "country": "Maldives",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": [
      "Honeymoon",
      "Luxury",
      "Beach"
    ],
    "priceStatus": "from",
    "priceFrom": 4499,
    "image": "/images/destinations/hero-maldives.jpg",
    "intro": "The definitive tropical honeymoon: private overwater villa with direct ocean staircase, house reef snorkeling, and seaplane transfers.",
    "story": "Four hours direct from Dubai lands you in an overwater villa over crystal lagoons. Snorkel with sea turtles and dine under the stars on a private sandbank.",
    "highlights": [
      "5-star private overwater villa with direct lagoon access",
      "Roundtrip scenic speedboat or seaplane transfers from Malé",
      "Sunset dolphin cruise and sandbank private picnic",
      "Complimentary snorkeling gear and non-motorized water sports",
      "Half board dining (daily breakfast and gourmet dinner)",
      "Free 30-day visa on arrival for UAE residents"
    ],
    "route": [
      "Dubai DXB",
      "Malé Velana",
      "Private Resort Island"
    ],
    "featured": true,
    "seasonal": "Year-Round Island Romance",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive at Malé Velana Airport, met by resort ...",
        "summary": "Check into private Overwater Villa with glass floor panels and direct sea ladder.",
        "activities": [
          "Arrive at Malé Velana Airport, met by resort host, board scenic seaplane/speedboat to resort island.",
          "Check into private Overwater Villa with glass floor panels and direct sea ladder.",
          "Sunset champagne cocktail on your private sun deck."
        ],
        "meals": "Dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Floating champagne breakfast served in your p...",
        "summary": "Guided house-reef snorkeling safari spotting manta rays and coral gardens.",
        "activities": [
          "Floating champagne breakfast served in your private villa infinity pool.",
          "Guided house-reef snorkeling safari spotting manta rays and coral gardens.",
          "Gourmet seafood buffet at the overwater pavilion."
        ],
        "meals": "Breakfast & Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Leisure morning on white-sand beach; complime...",
        "summary": "Couples relaxing aromatherapy massage at the overwater glass-floor spa.",
        "activities": [
          "Leisure morning on white-sand beach; complimentary paddleboarding and kayaking.",
          "Couples relaxing aromatherapy massage at the overwater glass-floor spa.",
          "Sunset dolphin watching cruise with champagne and canapés."
        ],
        "meals": "Breakfast & Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Speedboat excursion to a secluded private san...",
        "summary": "Private gourmet sandbank picnic lunch and swimming in untouched turquoise water.",
        "activities": [
          "Speedboat excursion to a secluded private sandbank in the open ocean.",
          "Private gourmet sandbank picnic lunch and swimming in untouched turquoise water.",
          "Candlelit 4-course dinner set directly on the beach under the stars."
        ],
        "meals": "Breakfast & Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Final breakfast overlooking the lagoon, souve...",
        "summary": "Seaplane transfer back to Malé for your direct evening flight to Dubai.",
        "activities": [
          "Final breakfast overlooking the lagoon, souvenir shopping at resort boutique.",
          "Seaplane transfer back to Malé for your direct evening flight to Dubai.",
          "Arrive back in Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "4 Nights in a 5★ Luxury Overwater Lagoon Villa",
      "Half Board Meal Plan (Daily international breakfast & 3-course dinner)",
      "Roundtrip scenic seaplane or executive speedboat transfers from Malé",
      "Sunset dolphin watching boat cruise",
      "Private sandbank excursion with setup",
      "Complimentary snorkeling equipment and sea kayaks",
      "Free 30-day tourist visa on arrival"
    ],
    "exclusions": [
      "International flights Dubai–Malé–Dubai",
      "Alcoholic beverages and motorized watersports",
      "Personal spa treatments and scuba diving courses",
      "Travel insurance"
    ]
  },
  {
    "slug": "georgia-mountain-weekender",
    "title": "Georgia Caucasus Mountains & Tbilisi Heritage",
    "destination": "Tbilisi · Kazbegi · Ananuri · Gudauri",
    "country": "Georgia",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": [
      "Adventure",
      "Weekend Escape",
      "Cultural"
    ],
    "priceStatus": "from",
    "priceFrom": 1899,
    "image": "/images/destinations/georgia-tbilisi.jpg",
    "intro": "Just 3.5 hours from Dubai: sulfur bathhouses, cobblestone alleys, and 4x4 mountain drives to the iconic Gergeti Trinity Church.",
    "story": "Drive the Georgian Military Highway past turquoise reservoirs and snow-dusted Caucasus peaks before enjoying authentic khinkali and Georgian wine cellars.",
    "highlights": [
      "Tbilisi Old Town walking tour and Narikala cable car",
      "4x4 Land Cruiser climb to Gergeti Trinity Church beneath Mount Kazbek",
      "Scenic stops at Ananuri Fortress and Gudauri Friendship Monument",
      "Traditional Georgian supra dinner with folk music",
      "4-star boutique hotel stay with daily breakfast",
      "Visa-free entry for UAE residents"
    ],
    "route": [
      "Tbilisi",
      "Ananuri",
      "Gudauri",
      "Stepantsminda Kazbegi"
    ],
    "featured": true,
    "seasonal": "Short-Haul Mountain Favorite",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Direct 3.5h flight from Dubai to Tbilisi, mee...",
        "summary": "Stroll along Rustaveli Avenue and ride the aerial cable car up to Narikala Fortress.",
        "activities": [
          "Direct 3.5h flight from Dubai to Tbilisi, meet private driver for transfer to Old Town hotel.",
          "Stroll along Rustaveli Avenue and ride the aerial cable car up to Narikala Fortress.",
          "Explore the Abanotubani sulfur bath district and enjoy traditional Khachapuri dinner."
        ],
        "meals": "No meals",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Guided walking tour through Old Tbilisi's car...",
        "summary": "Excursion to Mtskheta (UNESCO ancient capital) and Jvari Monastery overlooking the river c",
        "activities": [
          "Guided walking tour through Old Tbilisi's carved wooden balconies, Bridge of Peace, and Clock Tower.",
          "Excursion to Mtskheta (UNESCO ancient capital) and Jvari Monastery overlooking the river confluence.",
          "Wine tasting in a historic 300-year-old underground cellar."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Drive the Georgian Military Highway into the ...",
        "summary": "Gudauri Friendship Monument viewpoint; switch into 4x4 Land Cruisers to climb to Gergeti T",
        "activities": [
          "Drive the Georgian Military Highway into the high Caucasus, stopping at Ananuri Fortress.",
          "Gudauri Friendship Monument viewpoint; switch into 4x4 Land Cruisers to climb to Gergeti Trinity Church (2,170m).",
          "Traditional Georgian supra feast with live folk singing in Kazbegi."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Leisure morning for mountain photography and ...",
        "summary": "Private transfer to Tbilisi International Airport for evening flight back to Dubai.",
        "activities": [
          "Leisure morning for mountain photography and souvenir shopping at Dry Bridge flea market.",
          "Private transfer to Tbilisi International Airport for evening flight back to Dubai.",
          "Arrive in Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "3 Nights in a central 4★ boutique hotel in Tbilisi",
      "Daily breakfast buffet",
      "Private vehicle and chauffeur for all airport and sightseeing transfers",
      "4x4 Land Cruiser transfer to Gergeti Trinity Church in Kazbegi",
      "Narikala Fortress aerial cable car tickets",
      "Professional English / Arabic speaking tour guide",
      "100% Visa-free entry for UAE residency holders"
    ],
    "exclusions": [
      "International flights Dubai–Tbilisi–Dubai",
      "Meals not specified in the itinerary",
      "Sulfur bath entrance fees",
      "Travel insurance"
    ]
  },
  {
    "slug": "cappadocia-sky-turkey",
    "title": "Turkey Magic: Istanbul Bosphorus & Cappadocia Balloons",
    "destination": "Istanbul · Bosphorus · Cappadocia · Göreme",
    "country": "Turkey",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": [
      "Cultural",
      "Honeymoon",
      "Adventure"
    ],
    "priceStatus": "from",
    "priceFrom": 2699,
    "image": "/images/destinations/turkey-balloons.jpg",
    "intro": "Imperial Ottoman palaces and sunset Bosphorus cruising in Istanbul, paired with cave hotel suites and sunrise hot air balloons in Cappadocia.",
    "story": "Stand beneath the monumental domes of Hagia Sophia, browse the Grand Bazaar, and take flight in a hot air balloon over fairy chimney valleys.",
    "highlights": [
      "Sunrise hot air balloon flight over Göreme fairy chimneys",
      "Stay in an authentic luxury stone cave hotel in Cappadocia",
      "Guided tour of Hagia Sophia, Blue Mosque & Topkapi Palace",
      "Bosphorus private yacht sunset cruise in Istanbul",
      "Domestic flights Istanbul–Cappadocia return included",
      "Instant Turkish eVisa assistance for UAE residents"
    ],
    "route": [
      "Istanbul",
      "Bosphorus",
      "Kayseri / Nevşehir",
      "Göreme"
    ],
    "featured": true,
    "seasonal": "Spring & Autumn Magic",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Fly direct from Dubai to Istanbul, VIP privat...",
        "summary": "Check in and take an afternoon walk to the Hippodrome and German Fountain.",
        "activities": [
          "Fly direct from Dubai to Istanbul, VIP private airport transfer to Sultanahmet hotel.",
          "Check in and take an afternoon walk to the Hippodrome and German Fountain.",
          "Welcome Turkish dinner with Bosphorus views."
        ],
        "meals": "No meals",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Guided tour inside Hagia Sophia, Blue Mosque,...",
        "summary": "Tour Topkapi Palace and explore the 4,000 shops of the Grand Bazaar and Spice Market.",
        "activities": [
          "Guided tour inside Hagia Sophia, Blue Mosque, and the subterranean Basilica Cistern.",
          "Tour Topkapi Palace and explore the 4,000 shops of the Grand Bazaar and Spice Market.",
          "Private Bosphorus sunset yacht cruise past illuminated Ottoman palaces."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Short domestic flight to Cappadocia, transfer...",
        "summary": "Explore Göreme Open-Air Museum's rock-cut fresco churches and Uchisar Castle viewpoint.",
        "activities": [
          "Short domestic flight to Cappadocia, transfer to authentic luxury Stone Cave Hotel in Göreme.",
          "Explore Göreme Open-Air Museum's rock-cut fresco churches and Uchisar Castle viewpoint.",
          "Sunset quad biking tour through Rose & Love Valleys followed by Turkish pottery kebab dinner."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Pre-dawn pickup for 1-hour Sunrise Hot Air Ba...",
        "summary": "Explore the ancient multi-level Derinkuyu Underground City and Avanos pottery workshop.",
        "activities": [
          "Pre-dawn pickup for 1-hour Sunrise Hot Air Balloon Flight over fairy chimneys with champagne toast.",
          "Explore the ancient multi-level Derinkuyu Underground City and Avanos pottery workshop.",
          "Relax on cave hotel rooftop terrace under illuminated valley night skies."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Turkish breakfast buffet on cave terrace, tra...",
        "summary": "Connect to your return flight to Dubai DXB.",
        "activities": [
          "Turkish breakfast buffet on cave terrace, transfer to airport for domestic flight to Istanbul.",
          "Connect to your return flight to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "2 Nights in central 4★ Sultanahmet hotel (Istanbul)",
      "2 Nights in 5★ Luxury Cave Suite (Cappadocia)",
      "Domestic roundtrip flights Istanbul–Cappadocia–Istanbul",
      "Sunrise Hot Air Balloon Flight with certificate and celebratory toast",
      "Private sunset Bosphorus yacht cruise in Istanbul",
      "Full guided tours with entrance tickets to Hagia Sophia, Topkapi, and Göreme Museum",
      "Private airport transfers throughout Turkey",
      "Turkish eVisa document handling"
    ],
    "exclusions": [
      "International flights Dubai–Istanbul–Dubai",
      "Lunches and dinners not mentioned",
      "Personal shopping and Turkish bath (Hammam) treatments",
      "Travel insurance"
    ]
  },
  {
    "slug": "bali-jungle-coast",
    "title": "Bali Ubud Jungle Villa & Seminyak Sunset Coast",
    "destination": "Ubud · Tegallalang · Nusa Penida · Seminyak",
    "country": "Indonesia",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Honeymoon",
      "Luxury",
      "Beach",
      "Adventure"
    ],
    "priceStatus": "from",
    "priceFrom": 2499,
    "image": "/images/destinations/hero-bali.jpg",
    "intro": "Private pool villas in Ubud's emerald jungle, floating breakfasts, Nusa Penida island speedboat tours, and beach clubs in Seminyak.",
    "story": "Soak in the spiritual charm of Bali: giant jungle swings, sacred monkey forests, clifftop sunsets at Uluwatu, and white sand coral lagoons.",
    "highlights": [
      "3 Nights in a private pool jungle villa in Ubud + 2 nights in Seminyak luxury beach resort",
      "Full-day Nusa Penida speedboat tour (Kelingking T-Rex Beach & Angel's Billabong)",
      "Tegallalang Rice Terrace jungle swing and sacred Tirta Empul water blessing",
      "Uluwatu Clifftop Temple sunset & Kecak Fire Dance performance",
      "Famous Balinese floating breakfast experience served in your private pool",
      "Private chauffeur-driven air-conditioned vehicle throughout the trip",
      "Visa on arrival for UAE residents"
    ],
    "route": [
      "Denpasar",
      "Ubud",
      "Tegallalang",
      "Nusa Penida",
      "Seminyak",
      "Uluwatu"
    ],
    "featured": true,
    "seasonal": "Tropical Island Classic",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive at Ngurah Rai International Airport (D...",
        "summary": "Check into your private luxury pool villa surrounded by tropical palm trees. Welcome tropi",
        "activities": [
          "Arrive at Ngurah Rai International Airport (DPS) in Bali from Dubai. Private VIP flower-garland welcome and transfer to Ubud.",
          "Check into your private luxury pool villa surrounded by tropical palm trees. Welcome tropical fruit drink and rest.",
          "Candlelit Balinese dinner served on the river deck overlooking Ayung River valley."
        ],
        "meals": "Dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Floating breakfast served in your private inf...",
        "summary": "Experience the famous Bali Jungle Swing and visit the sacred monkey forest sanctuary in ce",
        "activities": [
          "Floating breakfast served in your private infinity pool followed by a visit to Tegallalang emerald rice terraces.",
          "Experience the famous Bali Jungle Swing and visit the sacred monkey forest sanctuary in central Ubud.",
          "Stroll Ubud art market and dine at a boutique organic restaurant in the rice fields."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Early morning executive speedboat transfer fr...",
        "summary": "Tour iconic Kelingking Beach (T-Rex cliff), Angel's Billabong natural infinity pool, and B",
        "activities": [
          "Early morning executive speedboat transfer from Sanur Harbour to the breathtaking island of Nusa Penida.",
          "Tour iconic Kelingking Beach (T-Rex cliff), Angel's Billabong natural infinity pool, and Broken Beach; enjoy fresh coconut lunch.",
          "Speedboat return to Bali mainland; transfer to luxury beach hotel in Seminyak."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Relax on Seminyak beach, enjoy poolside caban...",
        "summary": "Scenic coastal drive to Uluwatu Temple perched on a 70-meter limestone cliff above crashin",
        "activities": [
          "Relax on Seminyak beach, enjoy poolside cabana cocktails or optional traditional Balinese massage.",
          "Scenic coastal drive to Uluwatu Temple perched on a 70-meter limestone cliff above crashing ocean waves.",
          "Watch the mesmerizing sunset Kecak Fire Dance followed by a fresh seafood BBQ on the sands of Jimbaran Bay."
        ],
        "meals": "Breakfast & Seafood Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Leisure morning for boutique shopping along S...",
        "summary": "Visit Tanah Lot water temple standing proudly on an offshore sea rock.",
        "activities": [
          "Leisure morning for boutique shopping along Seminyak Square and beach club relaxation at Potato Head or Café del Mar.",
          "Visit Tanah Lot water temple standing proudly on an offshore sea rock.",
          "Farewell cocktail dinner with panoramic ocean sunset views."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Breakfast buffet, hotel check-out assistance,...",
        "summary": "Board Emirates direct flight back to Dubai DXB.",
        "activities": [
          "Breakfast buffet, hotel check-out assistance, and private transfer to Denpasar Airport.",
          "Board Emirates direct flight back to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "3 Nights in a 5★ Private Pool Villa in Ubud",
      "2 Nights in a 5★ Luxury Beach Resort in Seminyak",
      "Daily gourmet breakfast buffet including 1 signature Floating Breakfast",
      "Roundtrip airport and inter-hotel transfers by private air-conditioned vehicle",
      "Full-day Nusa Penida Island tour with roundtrip fast boat tickets and private island driver",
      "Ubud swing tickets and temple entrance fees (Uluwatu, Tanah Lot, Tegallalang)",
      "Jimbaran Bay candlelight fresh seafood dinner on the beach",
      "Dedicated English-speaking private chauffeur/guide throughout"
    ],
    "exclusions": [
      "International flights Dubai–Bali–Dubai",
      "Indonesia visa on arrival",
      "Personal shopping and spa treatments",
      "Travel insurance"
    ]
  },
  {
    "slug": "japan-golden-route",
    "title": "Japan Golden Route: Tokyo Skyline, Mt. Fuji & Kyoto Temples",
    "destination": "Tokyo · Mt. Fuji · Hakone · Kyoto · Osaka",
    "country": "Japan",
    "region": "International",
    "days": 8,
    "nights": 7,
    "styles": [
      "Cultural",
      "Luxury",
      "Family"
    ],
    "priceStatus": "from",
    "priceFrom": 7899,
    "image": "/images/destinations/hero-japan.jpg",
    "intro": "Experience the ultimate Japan journey: neon-lit Tokyo, majestic Mt. Fuji, Shinkansen bullet trains, and Kyoto's thousand vermilion shrines.",
    "story": "From futuristic Shibuya crossings and tea ceremonies to peaceful bamboo groves in Arashiyama and Osaka's vibrant street food stalls.",
    "highlights": [
      "3 Nights Tokyo, 1 Night Hakone Onsen Ryokan, 2 Nights Kyoto, 1 Night Osaka",
      "7-Day Japan Rail (JR) Pass with 320 km/h Shinkansen Bullet Train travel",
      "Mount Fuji 5th Station & Lake Ashi pirate boat cruise with Komagatake cable car",
      "Kyoto tour: Fushimi Inari 10,000 torii gates, Kinkaku-ji Golden Pavilion & Arashiyama Bamboo",
      "Traditional Japanese Onsen hot spring experience with multi-course Kaiseki dinner",
      "Tokyo guided tour: Shibuya Sky, teamLab Planets, Senso-ji Temple & Akihabara",
      "Full Japan tourist visa application support from Dubai"
    ],
    "route": [
      "Tokyo",
      "Mount Fuji",
      "Hakone",
      "Kyoto",
      "Nara",
      "Osaka"
    ],
    "featured": true,
    "seasonal": "Spring Cherry Blossom & Autumn Foliage",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Direct flight from Dubai (DXB) to Tokyo Haned...",
        "summary": "Check into 4★/5★ central hotel (Shinjuku/Ginza), relax, and stroll the illuminated streets",
        "activities": [
          "Direct flight from Dubai (DXB) to Tokyo Haneda/Narita. Meet private English-speaking airport host and transfer to central Tokyo hotel.",
          "Check into 4★/5★ central hotel (Shinjuku/Ginza), relax, and stroll the illuminated streets of Shinjuku.",
          "Welcome Japanese dinner overlooking the neon skyline of Tokyo."
        ],
        "meals": "No meals (arrival day)",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Guided tour of ancient Senso-ji Temple in Asa...",
        "summary": "Visit digital art museum teamLab Planets and cross the famous Shibuya Scramble Crossing; a",
        "activities": [
          "Guided tour of ancient Senso-ji Temple in Asakusa and stroll Nakamise shopping street.",
          "Visit digital art museum teamLab Planets and cross the famous Shibuya Scramble Crossing; ascend Shibuya Sky.",
          "Explore the electronic and anime district of Akihabara."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Depart Tokyo towards Mount Fuji; ascend to Mt...",
        "summary": "Cruise across volcanic Lake Ashi on a pirate ship and ride the Hakone Ropeway cable car ov",
        "activities": [
          "Depart Tokyo towards Mount Fuji; ascend to Mt. Fuji 5th Station (2,300m) for panoramic views.",
          "Cruise across volcanic Lake Ashi on a pirate ship and ride the Hakone Ropeway cable car over active sulfur vents.",
          "Check into traditional luxury Ryokan in Hakone; soak in mineral onsen hot spring baths and enjoy authentic multi-course Kaiseki dinner."
        ],
        "meals": "Breakfast & Kaiseki Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Board the world-famous Shinkansen (Bullet Tra...",
        "summary": "Walk through the thousands of vermilion torii gates at Fushimi Inari Shrine and visit Kiyo",
        "activities": [
          "Board the world-famous Shinkansen (Bullet Train) from Odawara to the ancient imperial capital of Kyoto (2 hours).",
          "Walk through the thousands of vermilion torii gates at Fushimi Inari Shrine and visit Kiyomizu-dera cliffside temple.",
          "Evening walking tour of Gion historic geisha district with traditional wooden machiya houses."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Visit the shimmering Kinkaku-ji (Golden Pavil...",
        "summary": "Wander through the towering Arashiyama Bamboo Grove and cross the historic Togetsukyo Brid",
        "activities": [
          "Visit the shimmering Kinkaku-ji (Golden Pavilion) and meditate in Ryoan-ji Zen rock garden.",
          "Wander through the towering Arashiyama Bamboo Grove and cross the historic Togetsukyo Bridge.",
          "Traditional Japanese green tea ceremony experience with a Kyoto tea master."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Short train excursion to Nara Park; interact ...",
        "summary": "Transfer to dynamic Osaka; check into hotel and visit Osaka Castle park.",
        "activities": [
          "Short train excursion to Nara Park; interact with over 1,000 friendly sacred bowing deer and visit Todai-ji Great Buddha temple.",
          "Transfer to dynamic Osaka; check into hotel and visit Osaka Castle park.",
          "Street food exploration in Dotonbori under the iconic Glico Running Man neon sign."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 7,
        "title": "Day 7 — Free day for shopping in Shinsaibashi or opti...",
        "summary": "Visit Umeda Sky Building Floating Garden Observatory for 360° views over Osaka Bay.",
        "activities": [
          "Free day for shopping in Shinsaibashi or optional day tour to Universal Studios Japan (Super Nintendo World).",
          "Visit Umeda Sky Building Floating Garden Observatory for 360° views over Osaka Bay.",
          "Farewell wagyu beef dinner in Osaka."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 8,
        "title": "Day 8 — Breakfast, hotel check-out, and private trans...",
        "summary": "Board direct return flight to Dubai DXB.",
        "activities": [
          "Breakfast, hotel check-out, and private transfer to Kansai International Airport (KIX) or Tokyo Haneda.",
          "Board direct return flight to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
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
    "exclusions": [
      "International flights Dubai–Tokyo / Osaka–Dubai",
      "Lunch and dinner meals not specified",
      "Travel insurance"
    ]
  },
  {
    "slug": "paris-french-riviera",
    "title": "France Grandeur: Paris Eiffel Tower & French Riviera Glamour",
    "destination": "Paris · Louvre · Versailles · Nice · Monaco · Cannes",
    "country": "France",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "Luxury",
      "Honeymoon",
      "Cultural"
    ],
    "priceStatus": "from",
    "priceFrom": 5299,
    "image": "/images/destinations/france-eiffel.jpg",
    "intro": "Classic European romance: 4 nights exploring Parisian monuments and Seine dinner cruises, followed by 3 days soaking up Côte d'Azur glamour in Nice & Monaco.",
    "story": "Ascend the Eiffel Tower, gaze upon the Mona Lisa at the Louvre, stroll the Champs-Élysées, and ride the high-speed TGV train to the sun-kissed beaches of the French Riviera.",
    "highlights": [
      "Eiffel Tower Level 2 & Summit priority access with Seine champagne cruise",
      "Louvre Museum guided highlights & Palace of Versailles golden hall of mirrors",
      "First-Class TGV High-Speed Train from Paris to Nice along the Mediterranean",
      "Scenic coastal excursion to Monaco Monte Carlo & Cannes Croisette boulevard",
      "4-star boutique hotel in central Paris + 4-star seaside Promenade des Anglais hotel",
      "Complete Schengen visa file preparation and biometric appointment support"
    ],
    "route": [
      "Paris",
      "Versailles",
      "Nice",
      "Monaco Monte Carlo",
      "Cannes"
    ],
    "featured": true,
    "seasonal": "Spring & Summer European Romance",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Fly direct DXB to Paris Charles de Gaulle (CD...",
        "summary": "Check into central 4★ Opera/Louvre boutique hotel, freshen up, and stroll along Boulevard ",
        "activities": [
          "Fly direct DXB to Paris Charles de Gaulle (CDG). Meet private Mercedes chauffeur at arrivals for hotel transfer.",
          "Check into central 4★ Opera/Louvre boutique hotel, freshen up, and stroll along Boulevard Haussmann.",
          "Gourmet French dinner cruise along the River Seine beneath the illuminated bridges."
        ],
        "meals": "Dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Priority Eiffel Tower summit ascent with pano...",
        "summary": "Guided walking tour through the Louvre Museum (Mona Lisa, Venus de Milo) and Tuileries Gar",
        "activities": [
          "Priority Eiffel Tower summit ascent with panoramic vistas over the Parisian rooftops.",
          "Guided walking tour through the Louvre Museum (Mona Lisa, Venus de Milo) and Tuileries Gardens.",
          "Stroll down the Avenue des Champs-Élysées to the illuminated Arc de Triomphe."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Half-day excursion to the Palace of Versaille...",
        "summary": "Explore Montmartre artists' square and the white domes of Sacré-Cœur basilica.",
        "activities": [
          "Half-day excursion to the Palace of Versailles; tour the Hall of Mirrors and royal fountains.",
          "Explore Montmartre artists' square and the white domes of Sacré-Cœur basilica.",
          "Free evening for shopping at Galeries Lafayette rooftop."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Board First-Class TGV High Speed Train from P...",
        "summary": "Check into seaside hotel on the Promenade des Anglais; relax on pebble beaches overlooking",
        "activities": [
          "Board First-Class TGV High Speed Train from Paris Gare de Lyon to Nice-Ville (5 hours).",
          "Check into seaside hotel on the Promenade des Anglais; relax on pebble beaches overlooking Baie des Anges.",
          "Seafood dinner in Old Town Nice (Vieux Nice) with famous Socca and French gelato."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Scenic coastal drive along the Moyenne Cornic...",
        "summary": "Tour the Principality of Monaco, Prince's Palace, Formula 1 Grand Prix circuit, and Monte ",
        "activities": [
          "Scenic coastal drive along the Moyenne Corniche to Èze cliffside medieval village and perfume factory.",
          "Tour the Principality of Monaco, Prince's Palace, Formula 1 Grand Prix circuit, and Monte Carlo Casino square.",
          "Visit Cannes and take photos on the red carpet steps of the Palais des Festivals."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Leisure morning for shopping on Avenue Jean M...",
        "summary": "Explore Castle Hill (Colline du Château) for the iconic postcard view of Nice bay.",
        "activities": [
          "Leisure morning for shopping on Avenue Jean Médecin or beach club relaxation in Nice.",
          "Explore Castle Hill (Colline du Château) for the iconic postcard view of Nice bay.",
          "Farewell Riviera dinner overlooking the Mediterranean sunset."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 7,
        "title": "Day 7 — Breakfast, hotel check-out, and private airpo...",
        "summary": "Board Emirates direct flight back to Dubai DXB.",
        "activities": [
          "Breakfast, hotel check-out, and private airport transfer to Nice Côte d'Azur Airport (NCE).",
          "Board Emirates direct flight back to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
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
    "exclusions": [
      "International flights Dubai–Paris / Nice–Dubai",
      "Lunches and beverages not specified",
      "City tourist taxes (payable directly at hotels, approx. €3/night)",
      "Travel insurance"
    ]
  },
  {
    "slug": "italy-classic-grand-tour",
    "title": "Italy Classic Tour: Rome Colosseum, Florence & Venice Gondola",
    "destination": "Rome · Vatican · Florence · Pisa · Venice · Grand Canal",
    "country": "Italy",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "Cultural",
      "Family",
      "Honeymoon"
    ],
    "priceStatus": "from",
    "priceFrom": 4999,
    "image": "/images/destinations/hero-italy.jpg",
    "intro": "The ultimate Italian masterpiece: 2 nights in imperial Rome, 2 nights in Renaissance Florence & Tuscany, and 2 romantic nights on the canals of Venice.",
    "story": "Toss a coin into the Trevi Fountain, marvel at Michelangelo's Sistine Chapel, gaze at the Leaning Tower of Pisa, and glide down the Grand Canal in a traditional gondola.",
    "highlights": [
      "2 Nights Rome, 2 Nights Florence, 2 Nights Venice in central 4-star hotels",
      "Frecciarossa high-speed bullet train tickets between Rome, Florence & Venice",
      "Colosseum & Roman Forum skip-the-line guided walking tour",
      "Vatican Museums & Sistine Chapel priority entry",
      "Tuscany excursion to Pisa Leaning Tower & Florence Duomo",
      "Private classic Gondola ride with serenade along Venice Grand Canal",
      "Complete Schengen visa documentation support for UAE residents"
    ],
    "route": [
      "Rome",
      "Vatican City",
      "Florence",
      "Pisa",
      "Venice"
    ],
    "featured": true,
    "seasonal": "Year-Round Italian Classic",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Fly direct DXB to Rome Fiumicino (FCO). VIP p...",
        "summary": "Check into 4★ central hotel near Piazza Navona; relax with authentic Italian espresso.",
        "activities": [
          "Fly direct DXB to Rome Fiumicino (FCO). VIP private Mercedes transfer to central Rome hotel.",
          "Check into 4★ central hotel near Piazza Navona; relax with authentic Italian espresso.",
          "Evening walking tour to Trevi Fountain, Spanish Steps, and Pantheon under illuminated night lights."
        ],
        "meals": "No meals",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Skip-the-line guided tour inside the Colosseu...",
        "summary": "Visit Vatican City: St. Peter's Basilica, Vatican Museums, and Michelangelo's Sistine Chap",
        "activities": [
          "Skip-the-line guided tour inside the Colosseum, Roman Forum, and Palatine Hill.",
          "Visit Vatican City: St. Peter's Basilica, Vatican Museums, and Michelangelo's Sistine Chapel ceiling.",
          "Traditional Roman pasta dinner in charming Trastevere cobblestone quarter."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Board the 300 km/h Frecciarossa high-speed bu...",
        "summary": "Guided tour of Florence: Santa Maria del Fiore Duomo, Giotto's Bell Tower, and Ponte Vecch",
        "activities": [
          "Board the 300 km/h Frecciarossa high-speed bullet train from Rome Termini to Florence Santa Maria Novella (1.5 hours).",
          "Guided tour of Florence: Santa Maria del Fiore Duomo, Giotto's Bell Tower, and Ponte Vecchio bridge.",
          "Sunset views over Florence skyline from Piazzale Michelangelo followed by authentic Florentine dining."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Half-day Tuscan excursion to the famous Mirac...",
        "summary": "Visit a traditional Tuscan olive grove and farm for olive oil tasting.",
        "activities": [
          "Half-day Tuscan excursion to the famous Miracle Square to photograph the Leaning Tower of Pisa.",
          "Visit a traditional Tuscan olive grove and farm for olive oil tasting.",
          "Return to Florence for evening gelato and boutique leather shopping in San Lorenzo."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — High-speed Frecciarossa train from Florence t...",
        "summary": "Private water taxi transfer down the Grand Canal to your historic canal-side hotel in Veni",
        "activities": [
          "High-speed Frecciarossa train from Florence to Venice Santa Lucia railway station (2 hours).",
          "Private water taxi transfer down the Grand Canal to your historic canal-side hotel in Venice.",
          "Private traditional Venice Gondola ride through romantic quiet back canals and beneath Bridge of Sighs."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Guided tour of St. Mark's Square (Piazza San ...",
        "summary": "Boat excursion to Murano island for glassblowing demonstration and colorful Burano lace vi",
        "activities": [
          "Guided tour of St. Mark's Square (Piazza San Marco), St. Mark's Basilica, and Doge's Palace.",
          "Boat excursion to Murano island for glassblowing demonstration and colorful Burano lace village.",
          "Farewell Italian seafood dinner along the illuminated Grand Canal."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 7,
        "title": "Day 7 — Breakfast overlooking the canal, hotel check-...",
        "summary": "Board direct Emirates return flight to Dubai DXB.",
        "activities": [
          "Breakfast overlooking the canal, hotel check-out, and private water taxi to Venice Marco Polo Airport (VCE).",
          "Board direct Emirates return flight to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
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
    "exclusions": [
      "International flights Dubai–Rome / Venice–Dubai",
      "Lunches and dinners not specified",
      "Local hotel city tourist taxes (€4-€7/night)",
      "Travel insurance"
    ]
  },
  {
    "slug": "greece-santorini-athens",
    "title": "Greece Wonders: Athens Acropolis & Santorini Caldera Sunset",
    "destination": "Athens · Acropolis · Plaka · Santorini · Oia · Fira",
    "country": "Greece",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Honeymoon",
      "Luxury",
      "Beach",
      "Cultural"
    ],
    "priceStatus": "from",
    "priceFrom": 4699,
    "image": "/images/destinations/greece-oia.jpg",
    "intro": "Whitewashed cliffside villas, cobalt-blue domes, and world-famous Aegean sunsets: 2 nights in historic Athens and 3 romantic nights in Santorini.",
    "story": "Stand before the Parthenon in Athens, board a luxury high-speed ferry across the Aegean Sea, and watch the sunset from your cliffside jacuzzi in Oia.",
    "highlights": [
      "2 Nights central 4★ Athens hotel + 3 Nights 5★ cliffside Caldera resort in Santorini",
      "Skip-the-line Acropolis & Parthenon guided tour with Acropolis Museum",
      "High-speed Blue Star / Seajets executive ferry tickets Athens to Santorini",
      "Sunset Catamaran sailing cruise in Santorini with BBQ dinner & hot springs swim",
      "Oia village sunset walking tour and Red Beach / Black Sand Beach excursion",
      "Roundtrip private Mercedes and luxury minivan airport transfers",
      "Schengen visa application processing support from Dubai"
    ],
    "route": [
      "Athens",
      "Piraeus Port",
      "Santorini Caldera",
      "Oia",
      "Fira"
    ],
    "featured": true,
    "seasonal": "Spring & Summer Island Magic",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Direct flight from Dubai DXB to Athens Intern...",
        "summary": "Check into 4★ boutique hotel near Syntagma Square; stroll through Monastiraki flea market.",
        "activities": [
          "Direct flight from Dubai DXB to Athens International Airport (ATH). Meet private chauffeur and transfer to central Athens hotel.",
          "Check into 4★ boutique hotel near Syntagma Square; stroll through Monastiraki flea market.",
          "Rooftop Greek dinner with illuminated night views of the Parthenon."
        ],
        "meals": "No meals",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Skip-the-line guided walking tour of the Acro...",
        "summary": "Explore the modern Acropolis Museum and wander the charming cobblestone streets of Plaka.",
        "activities": [
          "Skip-the-line guided walking tour of the Acropolis, Parthenon, Temple of Athena Nike, and Theater of Dionysus.",
          "Explore the modern Acropolis Museum and wander the charming cobblestone streets of Plaka.",
          "Traditional Greek taverna evening with souvlaki, Greek salad, and live bouzouki music."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Private transfer to Piraeus Port; board the h...",
        "summary": "Breathtaking arrival into Santorini Athinios Port; private luxury transfer up the cliffsid",
        "activities": [
          "Private transfer to Piraeus Port; board the high-speed Seajets ferry across the Aegean Sea to Santorini (4.5 hours).",
          "Breathtaking arrival into Santorini Athinios Port; private luxury transfer up the cliffside to your 5★ Caldera resort.",
          "Cocktails and private balcony relaxation overlooking the submerged volcanic caldera."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Leisure morning exploring the whitewashed ped...",
        "summary": "Board a 5-hour Sunset Catamaran Cruise: swim in volcanic Nea Kameni hot springs, snorkel a",
        "activities": [
          "Leisure morning exploring the whitewashed pedestrian alleys, blue-domed churches, and boutiques of Fira and Imerovigli.",
          "Board a 5-hour Sunset Catamaran Cruise: swim in volcanic Nea Kameni hot springs, snorkel at Red Beach and White Beach.",
          "Gourmet Greek seafood BBQ and unlimited Greek beverages served on board while watching the sunset from the sea."
        ],
        "meals": "Breakfast & Catamaran BBQ Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Visit the prehistoric Akrotiri archaeological...",
        "summary": "Drive to the northern village of Oia; take postcard photos of the 3 blue domes and windmil",
        "activities": [
          "Visit the prehistoric Akrotiri archaeological site and relax on the volcanic Perissa Black Sand Beach.",
          "Drive to the northern village of Oia; take postcard photos of the 3 blue domes and windmills.",
          "Guaranteed prime terrace seating for the world-famous Oia sunset spectacle."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Greek champagne breakfast overlooking the cal...",
        "summary": "Private transfer to Santorini Airport (JTR) for short flight connection to Dubai.",
        "activities": [
          "Greek champagne breakfast overlooking the caldera, souvenir shopping, and hotel checkout.",
          "Private transfer to Santorini Airport (JTR) for short flight connection to Dubai.",
          "Arrive back in Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "2 Nights in 4★ central Athens hotel (near Plaka / Syntagma)",
      "3 Nights in 5★ Luxury Caldera Cave Suite in Santorini",
      "Daily Greek and American buffet breakfast",
      "High-Speed Ferry tickets Athens to Santorini (Business/Club class)",
      "5-Hour Sunset Catamaran Sailing Cruise with BBQ dinner & drinks",
      "Acropolis & Parthenon skip-the-line guided tour and entrance ticket",
      "Roundtrip private airport and port transfers throughout Greece",
      "Full Schengen visa documentation support from Dubai"
    ],
    "exclusions": [
      "International flights Dubai–Athens / Santorini–Dubai",
      "Lunches and dinners not specified",
      "Greek climate resilience tax (€3-€7/night)",
      "Travel insurance"
    ]
  },
  {
    "slug": "egypt-pharaohs-nile",
    "title": "Egypt Grandeur: Cairo Pyramids & 5-Star Nile Luxury Cruise",
    "destination": "Cairo · Giza Pyramids · Aswan · Kom Ombo · Edfu · Luxor",
    "country": "Egypt",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Cultural",
      "Family",
      "Cruises"
    ],
    "priceStatus": "from",
    "priceFrom": 2799,
    "image": "/images/destinations/egypt-pyramids.jpg",
    "intro": "Step into 5,000 years of living history: Great Pyramids of Giza and Sphinx, followed by a 3-night 5-star full-board Nile River luxury cruise between Aswan and Luxor.",
    "story": "Stand in awe before the Great Pyramid of Khufu, sail the legendary Nile on a 5-star cruise ship, explore the Valley of the Kings, and walk through Karnak Temple.",
    "highlights": [
      "2 Nights in 5★ Cairo hotel with Pyramids view + 3 Nights on 5★ Luxury Nile Cruise Ship",
      "All-inclusive full board meals on the Nile Cruise (breakfast, lunch & dinner daily)",
      "Great Pyramids of Giza, Great Sphinx & Valley Temple guided tour with camel ride",
      "Grand Egyptian Museum (GEM) & Khan El Khalili historic bazaar",
      "Sightseeing in Aswan (High Dam, Philae Temple) & Luxor (Valley of the Kings, Karnak Temple)",
      "Domestic roundtrip flights Cairo–Aswan / Luxor–Cairo included",
      "Visa on arrival for UAE residents"
    ],
    "route": [
      "Cairo",
      "Giza",
      "Aswan",
      "Kom Ombo",
      "Edfu",
      "Luxor"
    ],
    "featured": true,
    "seasonal": "Winter & Spring Heritage Classic",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Direct 3.5h flight DXB to Cairo International...",
        "summary": "Check in and relax by the pool overlooking the Giza plateau.",
        "activities": [
          "Direct 3.5h flight DXB to Cairo International Airport (CAI). VIP airport meet and assistance, private transfer to 5★ Pyramids-view hotel.",
          "Check in and relax by the pool overlooking the Giza plateau.",
          "Sound & Light show at the Giza Pyramids or traditional dinner on the Nile."
        ],
        "meals": "No meals",
        "transport": "Included private transport"
      },
      {
        "day": 2,
        "title": "Day 2 — Guided tour of the Great Pyramids of Giza (Kh...",
        "summary": "Visit the Grand Egyptian Museum (GEM) and National Museum of Egyptian Civilization (NMEC).",
        "activities": [
          "Guided tour of the Great Pyramids of Giza (Khufu, Khafre, Menkaure), the Great Sphinx, and Valley Temple with optional camel ride.",
          "Visit the Grand Egyptian Museum (GEM) and National Museum of Egyptian Civilization (NMEC).",
          "Stroll through the 600-year-old Khan El Khalili market and enjoy Egyptian mint tea at historic El Fishawy cafe."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 3,
        "title": "Day 3 — Domestic flight Cairo to Aswan; board 5★ Luxu...",
        "summary": "Tour the Aswan High Dam, Unfinished Obelisk, and take a motorboat to the island Temple of ",
        "activities": [
          "Domestic flight Cairo to Aswan; board 5★ Luxury Nile Cruise ship and check into outside river-view cabin.",
          "Tour the Aswan High Dam, Unfinished Obelisk, and take a motorboat to the island Temple of Philae.",
          "Felucca sailboat ride around Elephantine Island at sunset; welcome dinner and show on board."
        ],
        "meals": "Breakfast, Lunch & Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Sail to Kom Ombo; guided tour of the unique d...",
        "summary": "Sail through the Nile valley to Edfu; horse-and-carriage ride to the remarkably preserved ",
        "activities": [
          "Sail to Kom Ombo; guided tour of the unique dual Temple of Sobek the crocodile god and Horus.",
          "Sail through the Nile valley to Edfu; horse-and-carriage ride to the remarkably preserved Temple of Horus.",
          "Galabeya costume party and Oriental dinner buffet on board while cruising towards Luxor."
        ],
        "meals": "Breakfast, Lunch & Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Arrive in Luxor: cross to the West Bank to ex...",
        "summary": "Tour the East Bank: monumental Karnak Temple complex and Luxor Temple on the riverfront.",
        "activities": [
          "Arrive in Luxor: cross to the West Bank to explore the Valley of the Kings (royal tombs), Temple of Queen Hatshepsut, and Colossi of Memnon.",
          "Tour the East Bank: monumental Karnak Temple complex and Luxor Temple on the riverfront.",
          "Farewell gala dinner on board the cruise ship."
        ],
        "meals": "Breakfast, Lunch & Dinner",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Optional sunrise Hot Air Balloon flight over ...",
        "summary": "Private transfer to Luxor Airport for domestic flight to Cairo and connection back to Duba",
        "activities": [
          "Optional sunrise Hot Air Balloon flight over Luxor temples; cruise checkout.",
          "Private transfer to Luxor Airport for domestic flight to Cairo and connection back to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      }
    ],
    "inclusions": [
      "2 Nights in 5★ Cairo hotel (e.g. Steigenberger Pyramids / Marriott Mena House)",
      "3 Nights in 5★ Luxury Nile Cruise Ship with outside Nile-view cabin",
      "Full Board meals on Nile cruise (daily breakfast, lunch, afternoon tea & dinner)",
      "Domestic roundtrip flights Cairo–Aswan / Luxor–Cairo",
      "Full sightseeing in Giza, Cairo, Aswan, Kom Ombo, Edfu, and Luxor with certified Egyptologist guide",
      "All entrance tickets to Pyramids, Sphinx, Philae, Edfu, Kom Ombo, Valley of the Kings & Karnak",
      "Roundtrip private airport and dock transfers by air-conditioned coach",
      "Egypt visa assistance for UAE residents"
    ],
    "exclusions": [
      "International flights Dubai–Cairo–Dubai",
      "Optional Abu Simbel temple excursion or Luxor Hot Air Balloon",
      "Entry inside the burial chambers of the Great Pyramid or Tutankhamun tomb",
      "Cruise crew gratuities / tips ($10/day)",
      "Travel insurance"
    ]
  },
  {
    "slug": "kenya-safari-luxury",
    "title": "Kenya Masai Mara Big-5 Safari & Diani Beach Resort",
    "destination": "Nairobi · Masai Mara Game Reserve · Diani Beach",
    "country": "Kenya",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": ["Adventure", "Luxury", "Family"],
    "priceStatus": "from",
    "priceFrom": 4999,
    "image": "/images/destinations/kenya-01.jpg",
    "intro": "Witness the world's most thrilling wildlife spectacle in the Masai Mara, followed by pristine white-sand relaxation on the Indian Ocean coast at Diani Beach.",
    "story": "Track lions, leopards, elephants and cheetahs in custom 4x4 pop-top safari cruisers with expert spotters, stay at luxury tented lodges along the Mara River, and unwind in tropical beach bliss.",
    "highlights": [
      "4 comprehensive Big-Five game drives inside Masai Mara National Reserve",
      "Luxury tented safari lodge accommodation with full board dining",
      "Traditional Maasai village cultural welcome and tribal dance ceremony",
      "Scenic domestic flight transfer directly from Mara airstrip to Diani Beach",
      "2 nights at a 5-star beachfront resort in Diani with turquoise ocean views",
      "All park conservation fees, 4x4 safari cruiser, and professional tracker included",
      "Seamless Kenya eVisa handling and Dubai DXB flight coordination"
    ],
    "route": ["Nairobi", "Masai Mara", "Diani Beach", "Mombasa"],
    "featured": true,
    "seasonal": "Year-Round Safari",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Fly Dubai to Nairobi & Scenic Drive to Masai Mara",
        "summary": "Arrive in Nairobi, meet your private safari guide and travel through the Great Rift Valley to your luxury Mara camp.",
        "activities": [
          "Direct flight from Dubai DXB to Jomo Kenyatta International Airport (NBO) in Nairobi.",
          "Meet your expert safari driver-guide and board your custom 4x4 Land Cruiser.",
          "Descend into the Great Rift Valley with breathtaking panoramic photo stops.",
          "Arrive at your luxury safari lodge in time for a gourmet lunch, followed by an afternoon introductory game drive tracking lions and giraffes."
        ],
        "meals": "Lunch & Dinner included",
        "transport": "4x4 Safari Land Cruiser"
      },
      {
        "day": 2,
        "title": "Day 2 — Full Day Big-5 Safari in Masai Mara Reserve",
        "summary": "Full day deep game drive across the savannah with bush picnic lunch near the hippo pools.",
        "activities": [
          "Early morning game drive at golden hour when predators are most active.",
          "Search for the Big Five: lion, leopard, elephant, buffalo and rhino.",
          "Enjoy a freshly prepared picnic lunch under an acacia tree in the savannah.",
          "Visit the Mara River to view basking crocodiles and resident hippo pods.",
          "Sundowner drinks overlooking the vast plains as the African sun sets."
        ],
        "meals": "Breakfast, Bush Lunch & Dinner",
        "transport": "4x4 Safari Land Cruiser"
      },
      {
        "day": 3,
        "title": "Day 3 — Maasai Village Cultural Visit & Mara Wildlife",
        "summary": "Experience the culture of the Maasai tribe and enjoy an afternoon specialized game drive.",
        "activities": [
          "Morning visit to an authentic Maasai Boma village to learn ancient traditions, beadwork, and jumping rituals.",
          "Relaxed midday swimming pool and spa break at the lodge.",
          "Late afternoon game drive tracking cheetah coalitions and elusive leopards.",
          "Dinner by the roaring boma bonfire under star-studded African skies."
        ],
        "meals": "Breakfast, Lunch & Dinner",
        "transport": "4x4 Safari Land Cruiser"
      },
      {
        "day": 4,
        "title": "Day 4 — Bush Flight to Tropical Diani Beach",
        "summary": "Fly from the savannah directly to the warm turquoise waters of the Indian Ocean.",
        "activities": [
          "Sunrise breakfast overlooking the savannah, then transfer to the bush airstrip.",
          "Scenic flight from Masai Mara to Ukunda Airstrip at Diani Beach.",
          "Private transfer to your 5★ beachfront resort; welcome cocktail and coconut.",
          "Afternoon at leisure swimming in the warm Indian Ocean or lounging under palm trees."
        ],
        "meals": "Breakfast & Dinner included",
        "transport": "Scenic Flight & Private Transfer"
      },
      {
        "day": 5,
        "title": "Day 5 — Diani Beach Leisure & Snorkeling Lagoon Tour",
        "summary": "Relax on Africa's finest white sand beach or embark on a traditional dhow coral reef cruise.",
        "activities": [
          "Full day at leisure on Diani's world-renowned powder-white sands.",
          "Optional glass-bottom boat or traditional wooden dhow ride to Kisite Marine Park for dolphin spotting and coral snorkeling.",
          "Fresh seafood dinner beachfront with live Swahili coastal music."
        ],
        "meals": "Breakfast & Dinner included",
        "transport": "At Resort Leisure"
      },
      {
        "day": 6,
        "title": "Day 6 — Mombasa Departure to Dubai",
        "summary": "Final morning swim and tropical breakfast before transfer to Mombasa airport.",
        "activities": [
          "Morning beach walk and buffet breakfast.",
          "Check out and private transfer to Mombasa Moi International Airport (MBA).",
          "Board direct flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in 5★ luxury safari tented lodge in Masai Mara",
      "2 Nights in 5★ beachfront resort in Diani Beach",
      "Full Board (all meals) during safari and Half Board at Diani Beach",
      "All national reserve conservation & entry fees",
      "Dedicated 4x4 Safari Land Cruiser with pop-up roof & certified naturalist guide",
      "Domestic flight Mara airstrip to Diani (Ukunda)",
      "All private airport and safari transfers",
      "24/7 on-ground concierge support"
    ],
    "exclusions": [
      "International flights Dubai–Nairobi / Mombasa–Dubai",
      "Optional sunrise Hot Air Balloon flight ($450/person)",
      "Premium alcoholic beverages and spa treatments",
      "Driver-guide gratuities",
      "Personal travel insurance"
    ]
  },
  {
    "slug": "thailand-islands-bangkok",
    "title": "Thailand Tropical Odyssey: Phuket, Krabi & Bangkok",
    "destination": "Phuket · Phi Phi Islands · Krabi Four Islands · Bangkok",
    "country": "Thailand",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": ["Beach", "Family", "Honeymoon"],
    "priceStatus": "from",
    "priceFrom": 2799,
    "image": "/images/destinations/thailand-islands-bangkok-01.jpg",
    "intro": "Turquoise lagoons, dramatic limestone sea karst cliffs, luxury island resorts, and the sparkling temples and street food of vibrant Bangkok.",
    "story": "Cruise the Andaman Sea by luxury speedboat to Maya Bay, kayak emerald sea caves in Phang Nga, relax in Krabi's tranquil bays, and shop the world-class megamalls of Bangkok.",
    "highlights": [
      "Luxury speedboat full-day tour to Phi Phi Islands, Maya Bay & Pileh Lagoon",
      "Krabi 4-Islands sunset cruise including Phra Nang Cave Beach & Chicken Island",
      "Bangkok Grand Palace, Wat Pho Reclining Buddha & Chao Phraya River Cruise",
      "3 nights in 5★ Phuket beachfront resort + 2 nights Krabi + 1 night Bangkok",
      "James Bond Island & Phang Nga Bay sea canoeing excursion option",
      "Daily international breakfast buffet and all private inter-city transfers",
      "Instant visa-on-arrival guidance for UAE residents"
    ],
    "route": ["Phuket", "Phi Phi", "Krabi", "Bangkok"],
    "featured": true,
    "seasonal": "Best November – April",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Phuket & Check-in to Beach Resort",
        "summary": "Land in tropical Phuket, private transfer to your 5-star resort in Patong/Kata Beach.",
        "activities": [
          "Direct flight from Dubai DXB to Phuket International Airport (HKT).",
          "VIP private transfer to your 5-star beachfront resort.",
          "Check in, relax by the infinity pool, and enjoy sunset over the Andaman Sea."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Phi Phi Islands & Maya Bay VIP Speedboat Tour",
        "summary": "Full-day premium island hopping tour with snorkeling in crystal clear waters.",
        "activities": [
          "Board luxury speedboat to Phi Phi Don and Phi Phi Leh.",
          "Swim in the emerald waters of iconic Maya Bay (The Beach).",
          "Jump into the stunning Pileh Lagoon natural swimming pool.",
          "Snorkel with colorful tropical fish and reef sharks at Shark Point; beach buffet lunch."
        ],
        "meals": "Breakfast & Island Buffet Lunch",
        "transport": "Speedboat Tour"
      },
      {
        "day": 3,
        "title": "Day 3 — Scenic Transfer to Krabi & Sunset Beach Walk",
        "summary": "Travel by private vehicle or ferry to Krabi's dramatic limestone cliff coastline.",
        "activities": [
          "Scenic transfer from Phuket to Ao Nang / Railay Beach, Krabi.",
          "Check into your Krabi luxury resort nestled beneath soaring karst towers.",
          "Sunset stroll along Ao Nang beach boulevard and vibrant night market."
        ],
        "meals": "Breakfast included",
        "transport": "Private Vehicle Transfer"
      },
      {
        "day": 4,
        "title": "Day 4 — Krabi 4 Islands & Phra Nang Cave Lagoon",
        "summary": "Discover pristine sandbars connecting islands at low tide and holy cave shrines.",
        "activities": [
          "Tour Tup Island, Mor Island, Chicken Island, and Poda Island.",
          "Walk across the magical Talay Waek sandbar dividing two ocean channels.",
          "Visit sacred Princess Cave at Phra Nang Beach and swim in crystal waters."
        ],
        "meals": "Breakfast & Lunch included",
        "transport": "Island Boat Tour"
      },
      {
        "day": 5,
        "title": "Day 5 — Fly to Bangkok & Chao Phraya Dinner Cruise",
        "summary": "Short domestic flight to Thailand's vibrant capital for skyline dining.",
        "activities": [
          "Morning transfer to Krabi Airport; fly to Bangkok (BKK).",
          "Check into central 5-star hotel near Sukhumvit / Siam shopping district.",
          "Evening luxury Chao Phraya Princess Dinner Cruise with illuminated temple views."
        ],
        "meals": "Breakfast & Dinner included",
        "transport": "Domestic Flight & Private Transfer"
      },
      {
        "day": 6,
        "title": "Day 6 — Bangkok Grand Palace & Shopping Extravaganza",
        "summary": "Marvel at golden temples and shop at ICONSIAM, Siam Paragon, and CentralWorld.",
        "activities": [
          "Guided tour of the Royal Grand Palace and the Temple of the Emerald Buddha (Wat Phra Kaew).",
          "Afternoon shopping at ICONSIAM luxury river mall with indoor floating market.",
          "Skyline cocktail lounge experience at rooftop bar overlooking Bangkok."
        ],
        "meals": "Breakfast included",
        "transport": "Private Guided Vehicle"
      },
      {
        "day": 7,
        "title": "Day 7 — Departure from Bangkok to Dubai",
        "summary": "Final Thai massage or souvenir shopping before direct flight home to Dubai.",
        "activities": [
          "Breakfast at hotel; leisure time for last-minute shopping.",
          "Private airport transfer to Suvarnabhumi Airport (BKK).",
          "Fly direct back to Dubai DXB with memorable tropical highlights."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in 5★ Phuket Resort + 2 Nights in 5★ Krabi Resort + 1 Night in 5★ Bangkok Hotel",
      "Daily American and Asian buffet breakfast",
      "Phi Phi Islands full-day speedboat tour with national park fees & lunch",
      "Krabi 4-Islands excursion with snorkeling gear",
      "Bangkok Grand Palace & city highlights tour",
      "Luxury Chao Phraya 5-star dinner cruise",
      "Domestic flight Krabi to Bangkok",
      "All private airport, ferry, and hotel transfers"
    ],
    "exclusions": [
      "International flights Dubai–Phuket / Bangkok–Dubai",
      "Personal shopping expenses and alcoholic beverages",
      "Optional scuba diving certifications",
      "Driver and boat captain tips",
      "Travel insurance"
    ]
  },
  {
    "slug": "uk-scotland-highlands",
    "title": "Great Britain: London Royalty, Edinburgh Castle & Scottish Highlands",
    "destination": "London · Windsor · Edinburgh · Loch Ness · Isle of Skye",
    "country": "United Kingdom",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": ["Cultural", "City Escape", "Family"],
    "priceStatus": "from",
    "priceFrom": 5699,
    "image": "/images/destinations/united-kingdom-01.jpg",
    "intro": "From the iconic landmarks of London and Buckingham Palace to the misty castles, ancient glens, and monster legends of the Scottish Highlands.",
    "story": "Explore the Tower of London and Big Ben, ride the high-speed LNER train to medieval Edinburgh, and drive through Glencoe's dramatic peaks to Loch Ness.",
    "highlights": [
      "Comprehensive London Royal Landmarks tour: Big Ben, Westminster, Tower Bridge",
      "Tower of London entry ticket and viewing of the historic Crown Jewels",
      "First-Class high-speed scenic train from London Kings Cross to Edinburgh",
      "Edinburgh Castle summit tour and Royal Mile historic walking trail",
      "Full-day guided Scottish Highlands excursion: Glencoe, Fort William & Loch Ness",
      "Luxury central 4-star superior hotels throughout",
      "UK Standard Visitor Visa application and documentation support"
    ],
    "route": ["London", "Windsor", "Edinburgh", "Glencoe", "Loch Ness"],
    "featured": true,
    "seasonal": "Spring to Autumn",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in London & West End Exploration",
        "summary": "Touchdown in London Heathrow, private chauffeur transfer to your central hotel.",
        "activities": [
          "Flight from Dubai DXB to London Heathrow (LHR).",
          "Private executive car transfer to central hotel near Covent Garden / Mayfair.",
          "Evening stroll through Piccadilly Circus, Leicester Square, and Covent Garden."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Executive Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — London Royalty, Westminster & Tower of London",
        "summary": "Iconic landmarks day covering Buckingham Palace, Thames cruise, and Crown Jewels.",
        "activities": [
          "Witness Changing of the Guard at Buckingham Palace.",
          "Visit Westminster Abbey, Big Ben, and the Houses of Parliament.",
          "Thames river cruise to the Tower of London to view the royal Crown Jewels."
        ],
        "meals": "Breakfast included",
        "transport": "Private Vehicle & Cruise"
      },
      {
        "day": 3,
        "title": "Day 3 — Windsor Castle & Shopping on Oxford Street",
        "summary": "Morning trip to the world's oldest occupied castle, afternoon luxury shopping.",
        "activities": [
          "Excursion to Royal Windsor Castle, St George's Chapel, and State Apartments.",
          "Afternoon free time for world-class shopping at Harrods, Selfridges, and Regent Street.",
          "Traditional English Afternoon Tea with warm scones and clotted cream."
        ],
        "meals": "Breakfast & Afternoon Tea",
        "transport": "Private Vehicle"
      },
      {
        "day": 4,
        "title": "Day 4 — High-Speed Scenic Train to Edinburgh, Scotland",
        "summary": "Travel north along the east coast to the medieval Scottish capital.",
        "activities": [
          "Board high-speed train from King's Cross to Edinburgh Waverley.",
          "Check into hotel on Princes Street overlooking Edinburgh Castle.",
          "Guided walk along the historic cobbled Royal Mile and Holyroodhouse Palace."
        ],
        "meals": "Breakfast included",
        "transport": "First-Class Rail"
      },
      {
        "day": 5,
        "title": "Day 5 — Edinburgh Castle & Underground Vaults",
        "summary": "Tour Scotland's most famous fortress and learn eerie historic tales.",
        "activities": [
          "Morning tour of Edinburgh Castle perched atop volcanic Castle Rock.",
          "View the Scottish Crown Jewels (Honours of Scotland) and Stone of Destiny.",
          "Afternoon ghost & historic vaults tour beneath the Old Town streets."
        ],
        "meals": "Breakfast included",
        "transport": "Guided Walking Tour"
      },
      {
        "day": 6,
        "title": "Day 6 — Full Day Scottish Highlands & Loch Ness Tour",
        "summary": "Witness Glencoe's epic mountain valleys and cruise Loch Ness.",
        "activities": [
          "Drive past Stirling Castle into the heart of the dramatic Scottish Highlands.",
          "Traverse the haunting mountain pass of Glencoe (featured in James Bond Skyfall).",
          "Arrive at Fort Augustus; embark on a Loch Ness boat cruise scanning for Nessie.",
          "Return to Edinburgh through Cairngorms National Park."
        ],
        "meals": "Breakfast included",
        "transport": "Luxury Touring Coach & Cruise"
      },
      {
        "day": 7,
        "title": "Day 7 — Edinburgh / London Departure to Dubai",
        "summary": "Final Scottish shortbread shopping and private airport transfer for flight home.",
        "activities": [
          "Breakfast and free time for souvenir shopping on George Street.",
          "Private transfer to Edinburgh Airport (EDI) for direct/connected flight to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in central 4★ London hotel + 3 Nights in central 4★ Edinburgh hotel",
      "Daily full English and Scottish breakfast",
      "First-Class high-speed train tickets London to Edinburgh",
      "Tower of London and Edinburgh Castle skip-the-line entrance tickets",
      "Full-day guided Scottish Highlands and Loch Ness excursion with boat cruise",
      "Windsor Castle half-day private excursion",
      "All private airport and station transfers",
      "UK visa document assistance and appointments"
    ],
    "exclusions": [
      "International flights Dubai–London / Edinburgh–Dubai",
      "London West End theater tickets",
      "Lunches and dinners not noted in itinerary",
      "Driver and tour guide tips",
      "Travel insurance"
    ]
  },
  {
    "slug": "vietnam-halong-hanoi",
    "title": "Vietnam Grandeur: Hanoi Old Quarter & 5★ Halong Bay Cruise",
    "destination": "Hanoi · Halong Bay · Ninh Binh · Tam Coc",
    "country": "Vietnam",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": ["Cultural", "Cruises", "Adventure"],
    "priceStatus": "from",
    "priceFrom": 2999,
    "image": "/images/destinations/vietnam-halong-bay.jpg",
    "intro": "Glide past thousands of limestone emerald karsts in Halong Bay aboard a 5-star boutique cruise, and immerse yourself in Hanoi's rich French-colonial culture.",
    "story": "Wake up to morning Tai Chi on Halong Bay's sundeck, kayak through luminous sea grottos, explore Ninh Binh's inland river caves, and savor authentic Vietnamese pho and egg coffee.",
    "highlights": [
      "Overnight 5-Star Luxury Boutique Cruise in Halong Bay & Lan Ha Bay",
      "Private balcony ocean-view suite on board with all gourmet meals",
      "Sea kayaking and bamboo boat excursion through Sung Sot (Surprise) Cave",
      "Full-day excursion to Ninh Binh: Trang An UNESCO grotto boat ride & Bai Dinh Pagoda",
      "Hanoi French Quarter, Hoan Kiem Lake & Old Quarter 36 Guild Streets tour",
      "Traditional Water Puppet Theatre VIP show in Hanoi",
      "Fast 3-day Vietnam eVisa service for UAE passport holders and residents"
    ],
    "route": ["Hanoi", "Halong Bay", "Lan Ha Bay", "Ninh Binh", "Trang An"],
    "featured": true,
    "seasonal": "September – April",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Hanoi & French Quarter Orientation",
        "summary": "Land in Vietnam's millennium-old capital, private transfer to luxury hotel.",
        "activities": [
          "Direct flight from Dubai DXB to Noi Bai International Airport (HAN) in Hanoi.",
          "VIP airport pickup and transfer to 5-star hotel in Hanoi French Quarter.",
          "Evening cyclo (rickshaw) ride around Hoan Kiem Lake and the 36 ancient trade streets."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Hanoi City Heritage & Water Puppet Show",
        "summary": "Explore iconic historical landmarks, temples, and authentic Vietnamese cuisine.",
        "activities": [
          "Visit the Ho Chi Minh Mausoleum complex, One Pillar Pagoda, and Temple of Literature (Vietnam's first university).",
          "Taste authentic Vietnamese Pho noodle soup and famous Hanoi creamy Egg Coffee.",
          "Evening VIP tickets to the traditional Thang Long Water Puppet Theatre."
        ],
        "meals": "Breakfast & Lunch included",
        "transport": "Private Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — Luxury Limousine to Halong Bay & Board 5★ Cruise",
        "summary": "Board your 5-star cruise ship and sail into the heart of the UNESCO World Heritage Bay.",
        "activities": [
          "Executive limousine transfer through the Red River Delta to Halong Bay marina.",
          "Welcome drink and check into your luxury private balcony cabin.",
          "Gourmet Vietnamese multi-course lunch while cruising past limestone formations.",
          "Afternoon kayaking around hidden lagoons and swimming at white-sand Ti Top island beach.",
          "Sunset cocktail party on sundeck followed by 5-course seafood dinner and squid fishing."
        ],
        "meals": "Breakfast, Lunch & Gourmet Dinner",
        "transport": "5-Star Cruise Ship"
      },
      {
        "day": 4,
        "title": "Day 4 — Sunrise Tai Chi, Surprise Cave & Return to Hanoi",
        "summary": "Morning Tai Chi on sundeck, explore gigantic illuminated cave, cruise back to port.",
        "activities": [
          "Sunrise Tai Chi session on the sun deck as morning mist drifts across the karsts.",
          "Guided tour of Sung Sot (Surprise) Cave with massive limestone stalactites.",
          "Brunch buffet served as the ship navigates back through the scenic bay.",
          "Disembark and executive transfer back to Hanoi hotel."
        ],
        "meals": "Breakfast & Brunch on board",
        "transport": "Cruise & Executive Limousine"
      },
      {
        "day": 5,
        "title": "Day 5 — Ninh Binh & Trang An UNESCO Grotto Boat Ride",
        "summary": "Discover 'Halong Bay on Land' with towering limestone peaks rising out of rice paddies.",
        "activities": [
          "Travel to Ninh Binh province; visit monumental Bai Dinh Pagoda complex.",
          "Sampan wooden boat ride rowed by locals through 9 mysterious water caves in Trang An.",
          "Climb to the top of Mua Cave peak for panoramic 360-degree views over Tam Coc valley."
        ],
        "meals": "Breakfast & Local Specialty Lunch",
        "transport": "Private Guided Vehicle & Sampan"
      },
      {
        "day": 6,
        "title": "Day 6 — Souvenir Shopping & Hanoi Departure to Dubai",
        "summary": "Final shopping for silk, coffee, and lacquerware before direct flight home.",
        "activities": [
          "Morning leisure walk and shopping at Dong Xuan market.",
          "Private transfer to Hanoi Noi Bai Airport.",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "4 Nights in 5★ Hanoi hotel + 1 Night in 5★ Luxury Halong Bay Cruise cabin",
      "Full Board meals on cruise (breakfast, lunch, gourmet dinner, brunch)",
      "Daily breakfast at hotel and authentic lunches on day tours",
      "Executive Limousine transfers between Hanoi and Halong Bay",
      "All entrance fees to Halong Bay, caves, temples, and puppet show",
      "Ninh Binh Trang An boat tour with certified English guide",
      "All private airport transfers",
      "Vietnam eVisa processing assistance"
    ],
    "exclusions": [
      "International flights Dubai–Hanoi–Dubai",
      "Beverages and spa treatments on cruise",
      "Gratuities for cruise crew and tour guides",
      "Personal travel insurance"
    ]
  },
  {
    "slug": "austria-vienna-hallstatt",
    "title": "Austria Imperial: Vienna Palaces, Salzburg & Hallstatt Lake",
    "destination": "Vienna · Schönbrunn · Salzburg · Hallstatt Lake",
    "country": "Austria",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": ["Cultural", "Honeymoon", "City Escape"],
    "priceStatus": "from",
    "priceFrom": 4899,
    "image": "/images/destinations/austria-01.jpg",
    "intro": "Imperial Habsburg palaces, Mozart's classical melodies in Salzburg, and the postcard-perfect fairytale alpine village of Hallstatt.",
    "story": "Tour the grand imperial chambers of Schönbrunn Palace, stroll Vienna's historic Ringstrasse, ride scenic trains through the Alps to Salzburg, and gaze at Hallstatt's wooden chalets reflected in crystal waters.",
    "highlights": [
      "Guided tour of imperial Schönbrunn Palace & Gardens in Vienna",
      "St. Stephen's Cathedral, Hofburg Palace & Vienna Opera House city highlights",
      "First-Class Railjet train through alpine valleys from Vienna to Salzburg",
      "Full-day guided excursion to the fairytale lakeside village of Hallstatt",
      "Sound of Music landmarks and Mirabell Gardens tour in Salzburg",
      "Luxury 4-star superior hotels in prime historic city centers",
      "Full Schengen visa documentation and appointment service for UAE travelers"
    ],
    "route": ["Vienna", "Salzburg", "Hallstatt", "Salzkammergut"],
    "featured": true,
    "seasonal": "All Year Round",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Vienna & Ringstrasse Evening Stroll",
        "summary": "Land in Austria's imperial capital, private airport transfer to luxury hotel.",
        "activities": [
          "Direct flight from Dubai DXB to Vienna International Airport (VIE).",
          "Private transfer to your 4★ superior hotel near Stephansplatz.",
          "Evening walk along the grand Ringstrasse boulevard, admiring illuminated neoclassical architecture."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Schönbrunn Imperial Palace & Viennese Coffee Culture",
        "summary": "Explore royal Habsburg history and indulge in famous Sachertorte cake.",
        "activities": [
          "Grand tour of Schönbrunn Palace's opulent imperial staterooms and Gloriette gardens.",
          "Visit St. Stephen's Cathedral and Hofburg Imperial Palace.",
          "Stop at a traditional Viennese café for Melange coffee and original Sacher torte chocolate cake."
        ],
        "meals": "Breakfast included",
        "transport": "Private Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — First-Class Railjet to Mozart's Salzburg",
        "summary": "Scenic high-speed train journey across Austria to the baroque city of Salzburg.",
        "activities": [
          "Board Austrian Railjet train through lush green rolling hills and mountains to Salzburg.",
          "Check into hotel near the historic Old Town.",
          "Walking tour of Mirabell Palace Gardens, Mozart's Birthplace, and Hohensalzburg Fortress."
        ],
        "meals": "Breakfast included",
        "transport": "First-Class Rail"
      },
      {
        "day": 4,
        "title": "Day 4 — Fairytale Hallstatt Lake & Alpine Skywalk",
        "summary": "Excursion to Austria's most picturesque alpine village nestled beside a glacial lake.",
        "activities": [
          "Scenic drive through the Salzkammergut Lake District to Hallstatt.",
          "Take the cable car up to the World Heritage Hallstatt Skywalk for dramatic views 350m above the lake.",
          "Stroll along wooden houses dating back to the 16th century and lakeside promenade.",
          "Return to Salzburg in the evening for an Austrian Mozart concert dinner."
        ],
        "meals": "Breakfast included",
        "transport": "Luxury Touring Coach"
      },
      {
        "day": 5,
        "title": "Day 5 — Salzburg / Vienna Departure to Dubai",
        "summary": "Final morning souvenir shopping for Mozartkugeln chocolates before flight home.",
        "activities": [
          "Breakfast and morning leisure in Salzburg.",
          "Private airport transfer to Salzburg/Vienna airport for flight back to Dubai DXB.",
          "Arrive in Dubai."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "2 Nights in 4★ Vienna hotel + 2 Nights in 4★ Salzburg hotel",
      "Daily gourmet Austrian buffet breakfast",
      "Schönbrunn Palace skip-the-line guided entrance ticket",
      "First-Class Railjet train tickets Vienna to Salzburg",
      "Full-day guided excursion to Hallstatt Lake with Skywalk ticket",
      "All private airport and station transfers",
      "Schengen visa processing assistance"
    ],
    "exclusions": [
      "International flights Dubai–Vienna–Dubai",
      "Lunches and dinners not listed in itinerary",
      "Classical concert tickets (available upon request)",
      "Gratuities for guides and drivers",
      "Travel insurance"
    ]
  },
  {
    "slug": "prague-bohemia-fairytale",
    "title": "Czech Fairytale: Prague Castle, Charles Bridge & Český Krumlov",
    "destination": "Prague · Charles Bridge · Old Town · Český Krumlov",
    "country": "Czech Republic",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": ["Weekend Escape", "Cultural", "City Escape"],
    "priceStatus": "from",
    "priceFrom": 2499,
    "image": "/images/destinations/czech-republic-01.jpg",
    "intro": "The City of a Hundred Spires: gothic towers, romantic cobblestone alleys over Charles Bridge, and UNESCO medieval fairytale castles.",
    "story": "Walk across the 14th-century Charles Bridge, watch the Astronomical Clock strike the hour, tour the colossal Prague Castle complex, and take a day trip to the enchanting medieval town of Český Krumlov.",
    "highlights": [
      "Prague Castle VIP tour including St. Vitus Cathedral & Golden Lane",
      "Old Town Square with the world's oldest functioning Astronomical Clock",
      "Evening romantic Vltava River Dinner Cruise with live jazz music",
      "Full-day guided excursion to UNESCO medieval town of Český Krumlov",
      "4-star luxury boutique hotel in central Prague Old Town",
      "Schengen visa assistance for UAE residents with fast processing"
    ],
    "route": ["Prague", "Charles Bridge", "Old Town", "Český Krumlov"],
    "featured": true,
    "seasonal": "Year-Round Magic",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Prague & Old Town Square Evening",
        "summary": "Land in Prague, private transfer to boutique hotel, evening Astronomical Clock show.",
        "activities": [
          "Direct flight from Dubai DXB to Václav Havel Airport Prague (PRG).",
          "Private transfer to your 4-star boutique hotel in Old Town (Staré Město).",
          "Walk to Old Town Square to watch the historic Astronomical Clock performance and taste warm Trdelník chimney cake."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Prague Castle, Charles Bridge & Vltava Jazz Cruise",
        "summary": "Comprehensive guided tour of the castle, gothic bridge, and river dinner cruise.",
        "activities": [
          "Cross the iconic statue-lined Charles Bridge early before crowds.",
          "Guided exploration of Prague Castle, St. Vitus Cathedral, Old Royal Palace, and fairytale Golden Lane.",
          "Afternoon stroll through charming Malá Strana (Lesser Town) and Wallenstein Garden.",
          "Evening 2-hour Vltava River Dinner Cruise with live music and illuminated castle views."
        ],
        "meals": "Breakfast & Cruise Dinner",
        "transport": "Private Guided Walking Tour & Cruise"
      },
      {
        "day": 3,
        "title": "Day 3 — Full-Day Český Krumlov Medieval Excursion",
        "summary": "Travel to southern Bohemia's UNESCO fairytale river-bend castle town.",
        "activities": [
          "Scenic coach drive through Bohemian countryside to Český Krumlov.",
          "Guided tour of the colossal renaissance castle perched above the curving Vltava river.",
          "Free time for photography, artisan souvenir shopping, and riverside lunch.",
          "Return to Prague in the evening."
        ],
        "meals": "Breakfast included",
        "transport": "Luxury Touring Coach"
      },
      {
        "day": 4,
        "title": "Day 4 — Bohemian Crystal Shopping & Flight to Dubai",
        "summary": "Final morning for crystal souvenirs before airport transfer.",
        "activities": [
          "Breakfast at hotel; shop for famous Bohemian crystal and garnet jewelry on Wenceslas Square.",
          "Private transfer to Prague Airport.",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in 4★ boutique Old Town Prague hotel",
      "Daily European buffet breakfast",
      "Prague Castle skip-the-line circuit ticket with certified guide",
      "Vltava River 2-Hour Evening Dinner Cruise",
      "Full-day guided excursion to Český Krumlov with castle entrance",
      "All private airport transfers",
      "Schengen visa appointment & documentation support"
    ],
    "exclusions": [
      "International flights Dubai–Prague–Dubai",
      "Lunches and dinners not mentioned in itinerary",
      "Optional museum entries",
      "Driver and guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "morocco-marrakech-sahara",
    "title": "Morocco Mystique: Marrakech Souks, Kasbahs & Luxury Sahara Desert Camp",
    "destination": "Marrakech · High Atlas · Ait Ben Haddou · Merzouga Sahara Dunes",
    "country": "Morocco",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": ["Cultural", "Adventure", "Luxury"],
    "priceStatus": "from",
    "priceFrom": 3699,
    "image": "/images/destinations/morocco-marrakech-sahara-01.jpg",
    "intro": "Exotic spice souks of Marrakech, dramatic snow-tipped Atlas mountain passes, ancient mudbrick kasbahs, and a magical night under the Sahara stars.",
    "story": "Wander through Marrakech's Jardin Majorelle, drive the Tizi n'Tichka pass to the Gladiator fortress of Ait Ben Haddou, and ride camels across golden Erg Chebbi dunes to a luxury glamping tent with private bath.",
    "highlights": [
      "2 Nights in traditional luxury Marrakech Riad + 1 Night in Dades Valley + 1 Night VIP Sahara Camp",
      "Sunset camel trek across towering Erg Chebbi dunes in Merzouga",
      "Luxury glamping tent with private bathroom, electricity, and Berber feast",
      "UNESCO World Heritage fortified village of Ait Ben Haddou (Game of Thrones set)",
      "Guided tour of Marrakech: Bahia Palace, Koutoubia Mosque & Jemaa el-Fna square",
      "Traditional Berber drumming by the desert campfire under the Milky Way",
      "Morocco visa guidance for UAE residents"
    ],
    "route": ["Marrakech", "High Atlas", "Ait Ben Haddou", "Dades Valley", "Merzouga Sahara"],
    "featured": true,
    "seasonal": "October – May",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Marrakech & Jemaa el-Fna Square",
        "summary": "Arrive in Marrakech, check into a traditional luxury riad with central courtyard.",
        "activities": [
          "Flight from Dubai DXB to Marrakech Menara Airport (RAK).",
          "VIP private transfer to your luxury Riad in the historic Medina.",
          "Evening stroll in bustling Jemaa el-Fna square filled with musicians, storytellers, and spice stalls."
        ],
        "meals": "Welcome mint tea & Moroccan dinner",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Marrakech Palaces, Majorelle Garden & Souks",
        "summary": "Explore Yves Saint Laurent's garden, opulent palaces, and labyrinthine artisan souks.",
        "activities": [
          "Visit the vibrant cobalt blue Jardin Majorelle and the Berber Culture Museum.",
          "Guided tour of the intricately tiled Bahia Palace and Saadian Tombs.",
          "Shop for authentic leather, argan oil, lamps, and spices in the Medina souks."
        ],
        "meals": "Breakfast included",
        "transport": "Private Guided Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — Cross High Atlas Mountains to Ait Ben Haddou & Dades",
        "summary": "Ascend the 2,260m Tizi n'Tichka pass to ancient cinematic mudbrick fortresses.",
        "activities": [
          "Drive over the spectacular High Atlas Mountains with panoramic summit stops.",
          "Guided exploration of UNESCO Ksar Ait Ben Haddou (filming site of Gladiator & Mummy).",
          "Continue through the Valley of Roses to Dades Valley; stay at charming canyon hotel."
        ],
        "meals": "Breakfast & Traditional Tagine Dinner",
        "transport": "4x4 Private Touring Vehicle"
      },
      {
        "day": 4,
        "title": "Day 4 — Todra Gorge & Sahara Dunes Luxury Glamping",
        "summary": "Walk beneath 300m Todra canyon walls and ride camels into the golden Erg Chebbi dunes.",
        "activities": [
          "Walk through the towering rock canyon of Todra Gorge.",
          "Arrive at Merzouga edge of the Sahara Desert; mount camels for sunset dune trek.",
          "Check into your private luxury desert tent equipped with plush beds and ensuite hot shower.",
          "Gourmet Moroccan dinner and live Berber drum performance around the campfire under star-lit skies."
        ],
        "meals": "Breakfast & Desert Camp Dinner",
        "transport": "4x4 Vehicle & Sunset Camel Trek"
      },
      {
        "day": 5,
        "title": "Day 5 — Sunrise over Sahara & Return to Marrakech",
        "summary": "Watch sunrise over the sea of sand, 4x4 drive back through Ouarzazate to Marrakech.",
        "activities": [
          "Climb the crest of the dunes to witness a glorious golden Sahara sunrise.",
          "Hearty desert breakfast, then 4x4 dune drive back to the main route.",
          "Pass through Ouarzazate (Moroccan Hollywood) on the return scenic journey to Marrakech.",
          "Check into Marrakech hotel for a relaxing hammam spa evening."
        ],
        "meals": "Breakfast included",
        "transport": "4x4 Private Touring Vehicle"
      },
      {
        "day": 6,
        "title": "Day 6 — Departure from Marrakech to Dubai",
        "summary": "Final Moroccan breakfast and private airport transfer for flight home.",
        "activities": [
          "Breakfast at the Riad; leisure time for last-minute souvenir purchases.",
          "Private transfer to Marrakech Airport.",
          "Fly back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in luxury Marrakech Riad + 1 Night in Dades Valley + 1 Night VIP Sahara Camp",
      "Daily breakfast + 3 authentic Moroccan dinners including desert banquet",
      "Private 4x4 air-conditioned vehicle with expert English-speaking driver throughout",
      "Sunset and sunrise camel treks in the Sahara Dunes",
      "Private guided tours of Marrakech and Ait Ben Haddou Kasbah",
      "All entrance fees to monuments and botanical gardens",
      "All private airport and desert transfers"
    ],
    "exclusions": [
      "International flights Dubai–Marrakech–Dubai",
      "Lunches and alcoholic drinks",
      "Traditional Moroccan Hammam spa treatments",
      "Driver and local guide tips",
      "Travel insurance"
    ]
  },
  {
    "slug": "sri-lanka-tea-train-safari",
    "title": "Sri Lanka Serenity: Ella Blue Train, Sigiriya Rock & Yala Safari",
    "destination": "Colombo · Sigiriya · Kandy · Ella Scenic Train · Yala National Park",
    "country": "Sri Lanka",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": ["Adventure", "Family", "Cultural"],
    "priceStatus": "from",
    "priceFrom": 2199,
    "image": "/images/destinations/sri-lanka-nine-arch.jpg",
    "intro": "Climb the ancient Lion Rock fortress of Sigiriya, ride the legendary blue train through misty emerald tea plantations, and track wild leopards in Yala.",
    "story": "Experience the teardrop island's greatest wonders: ancient UNESCO heritage ruins, sacred Buddhist temples in Kandy, Nine Arches Bridge in Ella, and exhilarating open-top jeep safaris tracking elephants and leopards.",
    "highlights": [
      "Climb the 5th-century UNESCO Sigiriya Rock Fortress with ancient frescoes",
      "Ride the world-famous scenic Blue Train from Kandy to Ella through tea plantations",
      "4x4 Jeep Safari in Yala National Park (highest leopard density in the world)",
      "Temple of the Sacred Tooth Relic & Cultural Kandyan Dance Show in Kandy",
      "Nine Arches Bridge & Little Adam's Peak viewpoint hike in Ella",
      "Stay in boutique 4-star and 5-star nature resorts with daily breakfast",
      "Sri Lanka ETA electronic visa processed in 24 hours for UAE travelers"
    ],
    "route": ["Colombo", "Sigiriya", "Kandy", "Nuwara Eliya", "Ella", "Yala"],
    "featured": true,
    "seasonal": "All Year Round",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Colombo & Travel to Sigiriya",
        "summary": "Arrive at Bandaranaike Airport, meet your private chauffeur-guide, travel to cultural triangle.",
        "activities": [
          "Direct 4-hour flight from Dubai DXB to Colombo Bandaranaike Airport (CMB).",
          "Private air-conditioned vehicle pickup and drive to Sigiriya.",
          "Check into your eco-luxury resort surrounded by tropical forest; pool relaxation."
        ],
        "meals": "Dinner included",
        "transport": "Private Chauffeur Car"
      },
      {
        "day": 2,
        "title": "Day 2 — Climb Sigiriya Lion Rock & Dambulla Cave Temple",
        "summary": "Ascend the iconic sky citadel and explore 2,000-year-old painted cave monasteries.",
        "activities": [
          "Early morning climb up Sigiriya Lion Rock Fortress to view the palace ruins and 5th-century frescoes.",
          "Visit Dambulla Golden Cave Temple containing 153 gilded Buddha statues.",
          "Drive to the royal hill capital of Kandy; evening visit to the Temple of the Sacred Tooth Relic."
        ],
        "meals": "Breakfast & Dinner included",
        "transport": "Private Chauffeur Car"
      },
      {
        "day": 3,
        "title": "Day 3 — Legendary Blue Train Ride to Alpine Ella",
        "summary": "Board the world's most scenic train ride winding through tea carpets and mountain viaducts.",
        "activities": [
          "Visit a working Ceylon tea factory and tea plantation in Nuwara Eliya (Little England).",
          "Board the iconic Blue Train from Nanu Oya to Ella, taking in misty valley panoramas.",
          "Walk to the famous colonial Nine Arches Demodara railway bridge."
        ],
        "meals": "Breakfast & Dinner included",
        "transport": "Scenic Hill-Country Rail & Car"
      },
      {
        "day": 4,
        "title": "Day 4 — Ravana Falls & Yala Leopard Jeep Safari",
        "summary": "Descend to the southern coastal wilderness for an adrenaline-filled wildlife safari.",
        "activities": [
          "Visit cascading Ravana Waterfall for photography.",
          "Drive down to Yala National Park and check into your wilderness safari lodge.",
          "Afternoon open-top 4x4 safari tracking leopards, wild elephants, sloth bears, and crocodiles."
        ],
        "meals": "Breakfast & Dinner included",
        "transport": "4x4 Safari Jeep"
      },
      {
        "day": 5,
        "title": "Day 5 — Galle Dutch Fort & Bentota Beach",
        "summary": "Travel along the golden southern coast, explore 17th-century colonial ramparts.",
        "activities": [
          "Drive along the southern coastline; visit UNESCO-listed Galle Dutch Fort with lighthouse and cobblestone boutiques.",
          "Visit a sea turtle conservation hatchery in Kosgoda.",
          "Check into 5-star beachfront resort in Bentota / Colombo for farewell dinner."
        ],
        "meals": "Breakfast & Dinner included",
        "transport": "Private Chauffeur Car"
      },
      {
        "day": 6,
        "title": "Day 6 — Colombo City Tour & Departure to Dubai",
        "summary": "Brief city highlights of Colombo before direct flight back to Dubai.",
        "activities": [
          "Orientation tour of Colombo: Independence Square, Gangaramaya Temple, and Galle Face Green.",
          "Private transfer to Colombo International Airport.",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "5 Nights in handpicked 4★ & 5★ luxury nature and beach resorts",
      "Half Board meals (daily breakfast and multi-course dinners)",
      "Private dedicated air-conditioned car with English-speaking chauffeur-guide",
      "Sigiriya Rock Fortress and Dambulla Cave Temple entrance tickets",
      "Reserved seats on the iconic scenic Blue Train from Kandy to Ella",
      "Private 4x4 open-top safari jeep with wildlife tracker in Yala National Park",
      "All park fees, toll taxes, and private airport transfers",
      "Sri Lanka ETA visa processing assistance"
    ],
    "exclusions": [
      "International flights Dubai–Colombo–Dubai",
      "Lunches and drinks not mentioned",
      "Optional water sports in Bentota",
      "Driver-guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "singapore-malaysia-twins",
    "title": "Singapore & Malaysia: Marina Bay Sands, Sentosa & Kuala Lumpur Skylines",
    "destination": "Singapore · Gardens by the Bay · Sentosa Island · Kuala Lumpur · Batu Caves · Genting Highlands",
    "country": "Singapore",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": ["City Escape", "Family", "Shopping"],
    "priceStatus": "from",
    "priceFrom": 3499,
    "image": "/images/destinations/singapore-01.jpg",
    "intro": "The Lion City meets the Malaysian capital: futuristic Supertrees, Sentosa cable cars, Petronas Twin Towers, and vibrant night food markets.",
    "story": "Experience two world-class Southeast Asian metropolises: gaze at the Avatar-like Gardens by the Bay, ride cable cars over Sentosa Island, cross the border via scenic express coach, and stand before the rainbow steps of Batu Caves.",
    "highlights": [
      "Gardens by the Bay Flower Dome & Cloud Forest Supertree light show",
      "Sentosa Island cable car pass with Universal Studios Singapore option",
      "Executive cross-border coach transfer from Singapore to Kuala Lumpur",
      "Petronas Twin Towers Skybridge & Observation Deck Level 86 tickets",
      "Guided excursion to Rainbow Batu Caves & Genting Highlands Skyway cable car",
      "3 Nights in 4★/5★ Singapore hotel + 2 Nights in 5★ Kuala Lumpur hotel",
      "Daily breakfast and all private airport & attraction transfers"
    ],
    "route": ["Singapore", "Sentosa", "Kuala Lumpur", "Batu Caves", "Genting"],
    "featured": true,
    "seasonal": "All Year Round",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Singapore & Marina Bay Evening Light Show",
        "summary": "Land at award-winning Changi Airport, private transfer to luxury hotel, Spectra water show.",
        "activities": [
          "Direct flight from Dubai DXB to Singapore Changi Airport (SIN).",
          "VIP private transfer to your central 4★/5★ hotel near Orchard / Marina Bay.",
          "Evening walk to Marina Bay Sands to watch the Spectra light & water show and supertree grove."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Gardens by the Bay & Sentosa Island Cable Car",
        "summary": "Futuristic botanical domes, sky bridges, and tropical island entertainment.",
        "activities": [
          "Visit Gardens by the Bay Cloud Forest misty waterfall and Flower Dome.",
          "Board the scenic Singapore Cable Car from Mount Faber to Sentosa Island.",
          "Afternoon at Sentosa: Siloso Beach, S.E.A. Aquarium, and Wings of Time night show."
        ],
        "meals": "Breakfast included",
        "transport": "Private Vehicle & Cable Car"
      },
      {
        "day": 3,
        "title": "Day 3 — Singapore City Heritage & Cross Border to Kuala Lumpur",
        "summary": "Chinatown and Little India highlights, then scenic luxury coach to Malaysia.",
        "activities": [
          "Morning tour of Merlion Park, Chinatown Heritage Centre, and Little India.",
          "Board luxury executive coach for smooth overland journey across the Johor-Singapore Causeway to Kuala Lumpur.",
          "Check into 5★ Kuala Lumpur hotel overlooking the illuminated Petronas Towers."
        ],
        "meals": "Breakfast included",
        "transport": "Executive Coach Transfer"
      },
      {
        "day": 4,
        "title": "Day 4 — Petronas Twin Towers & KL City Exploration",
        "summary": "Ascend the iconic twin towers and sample street gastronomy at Jalan Alor.",
        "activities": [
          "Visit Petronas Twin Towers Skybridge (41st floor) and 86th floor observation deck.",
          "Tour King's Palace (Istana Negara), National Mosque, and Merdeka Independence Square.",
          "Evening culinary walking tour through famous Jalan Alor night food market with satay and durian."
        ],
        "meals": "Breakfast included",
        "transport": "Private Guided Vehicle"
      },
      {
        "day": 5,
        "title": "Day 5 — Batu Caves Rainbow Stairway & Genting Highlands",
        "summary": "Climb the colorful 272 steps at Batu Caves and ride the mountain skyway gondola.",
        "activities": [
          "Visit the monumental golden Lord Murugan statue and 272 colorful steps of Batu Caves.",
          "Drive to Genting Highlands; board the Awana SkyWay glass-floor cable car into cool mountain mist.",
          "Free time at SkyAvenue entertainment complex and indoor theme park."
        ],
        "meals": "Breakfast included",
        "transport": "Luxury Touring Coach & Skyway"
      },
      {
        "day": 6,
        "title": "Day 6 — Shopping at Pavilion KL & Flight to Dubai",
        "summary": "Duty-free luxury shopping at Bukit Bintang before airport transfer.",
        "activities": [
          "Breakfast at hotel; luxury shopping at Pavilion Mall and Suria KLCC.",
          "Private transfer to Kuala Lumpur International Airport (KLIA).",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in central 4★/5★ Singapore hotel + 2 Nights in 5★ Kuala Lumpur hotel",
      "Daily international breakfast buffet",
      "Gardens by the Bay 2-Conservatory entry ticket",
      "Sentosa Island roundtrip cable car ride",
      "Executive cross-border coach Singapore to Kuala Lumpur",
      "Petronas Twin Towers observation deck tickets",
      "Batu Caves and Genting Highlands day excursion with Awana Skyway cable car",
      "All private airport and city transfers"
    ],
    "exclusions": [
      "International flights Dubai–Singapore / KL–Dubai",
      "Universal Studios Singapore theme park admission (optional add-on)",
      "Lunches and dinners not specified",
      "Driver and guide tips",
      "Travel insurance"
    ]
  },
  {
    "slug": "korea-seoul-jeju",
    "title": "South Korea: Dynamic Seoul Palaces, K-Wave & Volcanic Jeju Island",
    "destination": "Seoul · Gyeongbokgung Palace · Nami Island · Jeju Island · Seongsan Ilchulbong",
    "country": "South Korea",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": ["Cultural", "City Escape", "Shopping"],
    "priceStatus": "from",
    "priceFrom": 4699,
    "image": "/images/destinations/south-korea-seoul.jpg",
    "intro": "Royal Joseon Dynasty palaces, Hanbok traditional costume experiences, cutting-edge K-pop shopping in Myeongdong, and the volcanic UNESCO nature of Jeju Island.",
    "story": "Step back in time at Gyeongbokgung Palace, stroll beneath golden ginkgo trees on romantic Nami Island, fly to subtropical Jeju Island to explore volcanic craters and waterfalls, and indulge in sizzling Korean BBQ.",
    "highlights": [
      "Gyeongbokgung Royal Palace tour with traditional Hanbok dress rental experience",
      "Scenic day trip to Nami Island & Petite France cultural village",
      "Domestic roundtrip flights Seoul Gimpo to UNESCO Jeju Island",
      "Jeju Island highlights: Seongsan Sunrise Peak, Manjanggul Lava Tube & Cheonjiyeon Falls",
      "Myeongdong shopping district, Bukchon Hanok Village & N Seoul Tower",
      "4-star superior hotels in central Seoul and oceanfront Jeju Resort",
      "South Korea K-ETA electronic travel authorization support for UAE residents"
    ],
    "route": ["Seoul", "Nami Island", "Jeju Island", "Seogwipo"],
    "featured": true,
    "seasonal": "Spring & Autumn Best",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Seoul & Myeongdong Night Street Food",
        "summary": "Land at Incheon Airport, private transfer to luxury hotel, vibrant street food walk.",
        "activities": [
          "Direct flight from Dubai DXB to Seoul Incheon International Airport (ICN).",
          "VIP private transfer to central hotel in Myeongdong / Insadong.",
          "Evening walk through Myeongdong street market: Korean fried chicken, tteokbokki, and skincare boutiques."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Gyeongbokgung Palace & Bukchon Hanok Village",
        "summary": "Wear authentic Hanbok costumes, explore royal Joseon palaces and traditional wooden alleys.",
        "activities": [
          "Dress in authentic Hanbok costumes and explore Gyeongbokgung Palace, viewing the Royal Guard Changing Ceremony.",
          "Wander through Bukchon Hanok Village's 600-year-old traditional residential alleys.",
          "Cable car ride up Namsan mountain to N Seoul Tower for sunset 360-degree city views.",
          "Authentic Korean BBQ dinner featuring premium Hanwoo beef."
        ],
        "meals": "Breakfast & Korean BBQ Dinner",
        "transport": "Private Guided Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — Scenic Excursion to Nami Island & Garden of Morning Calm",
        "summary": "Ferry to picturesque tree-lined Nami Island and French cultural alpine village.",
        "activities": [
          "Ferry ride to romantic Nami Island, famous for its towering redwood and ginkgo tree avenues.",
          "Visit Petite France cultural village and scenic Garden of Morning Calm botanical park.",
          "Return to Seoul for evening shopping at Dongdaemun Design Plaza (DDP)."
        ],
        "meals": "Breakfast & Lunch included",
        "transport": "Luxury Touring Coach & Ferry"
      },
      {
        "day": 4,
        "title": "Day 4 — Fly to Subtropical Jeju Island & Sunrise Peak",
        "summary": "Short domestic flight to Korea's premier volcanic island and UNESCO wonder.",
        "activities": [
          "Morning transfer to Gimpo Airport; fly to Jeju International Airport (CJU).",
          "Ascend Seongsan Ilchulbong (Sunrise Peak), a dramatic UNESCO volcanic tuff cone rising from the sea.",
          "Watch the famous Jeju Haenyeo (female free-divers) demonstrate ancient harvesting traditions.",
          "Check into 5-star beachfront resort in Seogwipo."
        ],
        "meals": "Breakfast included",
        "transport": "Domestic Flight & Private Vehicle"
      },
      {
        "day": 5,
        "title": "Day 5 — Jeju Waterfalls, Lava Tubes & Green Tea Plantation",
        "summary": "Discover cascading waterfalls, ancient volcanic cave tubes, and Osulloc tea fields.",
        "activities": [
          "Walk through Manjanggul Cave, one of the world's finest natural lava tube systems.",
          "Visit Cheonjiyeon Waterfall and dramatic Jusangjeolli volcanic cliff hexagonal columns.",
          "Taste fresh organic matcha ice cream at Osulloc Green Tea Plantation.",
          "Evening flight back to Seoul Gimpo; check into Incheon/Seoul airport hotel."
        ],
        "meals": "Breakfast & Local Seafood Lunch",
        "transport": "Private Touring Vehicle & Flight"
      },
      {
        "day": 6,
        "title": "Day 6 — Souvenir Shopping & Departure to Dubai",
        "summary": "Final Korean ginseng and confectionery shopping before direct flight home.",
        "activities": [
          "Breakfast at hotel; duty-free shopping at Lotte Department Store.",
          "Private transfer to Incheon International Airport (ICN).",
          "Fly direct back to Dubai DXB with unforgettable memories."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in 4★ central Seoul hotel + 1 Night in 5★ Jeju Resort + 1 Night Seoul hotel",
      "Daily international breakfast buffet",
      "Traditional Hanbok costume rental and palace entrance pass",
      "Nami Island guided excursion with ferry tickets",
      "Roundtrip domestic flights Seoul Gimpo (GMP) to Jeju (CJU)",
      "Full-day guided Jeju Island UNESCO highlights tour",
      "All private airport, hotel, and attraction transfers",
      "South Korea K-ETA electronic travel authorization assistance"
    ],
    "exclusions": [
      "International flights Dubai–Seoul–Dubai",
      "Lunches and dinners not listed in itinerary",
      "Personal shopping and beauty treatments",
      "Guide and chauffeur gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "jordan-petra-deadsea",
    "title": "Jordan Wonders: Ancient Petra Rose City, Wadi Rum Martian Camp & Dead Sea",
    "destination": "Amman · Jerash Roman Ruins · Petra Treasury & Monastery · Wadi Rum Desert · Dead Sea Resort",
    "country": "Jordan",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": ["Cultural", "Adventure", "Luxury"],
    "priceStatus": "from",
    "priceFrom": 3299,
    "image": "/images/destinations/jordan-petra.jpg",
    "intro": "Walk through the mystical Siq canyon into the rose-red stone facades of Petra, sleep in a glass geodesic dome under the starry skies of Wadi Rum, and float effortlessly on the mineral-rich Dead Sea.",
    "story": "Jordan blends biblical antiquity, colossal Roman ruins, and Martian desert landscapes. Begin with the colonnaded avenues of ancient Jerash, behold the 2,000-year-old carved facade of Petra's Al-Khazneh Treasury by candlelight, race across red dunes in a 4x4 Bedouin jeep, and unwind at a 5-star Dead Sea luxury wellness resort.",
    "highlights": [
      "Full-day guided walking tour through the Siq to Petra Treasury & Royal Tombs",
      "Overnight in a luxury Martian Star Dome tent in Wadi Rum with traditional Zarb feast",
      "2-Hour private 4x4 sunset desert safari across Lawrence of Arabia dunes",
      "Float in the ultra-saline mineral waters of the Dead Sea at a private resort beach",
      "Explore the colossal Roman colonnaded streets and amphitheatre of Jerash",
      "4 Nights in luxury 4★ and 5★ heritage and desert dome accommodations",
      "Private dedicated English-speaking chauffeur throughout Jordan",
      "Jordan Pass entry and visa-on-arrival facilitation support"
    ],
    "route": ["Amman", "Jerash", "Petra", "Wadi Rum", "Dead Sea"],
    "featured": true,
    "seasonal": "All Year Round",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Amman & Ancient Roman Jerash",
        "summary": "Land at Queen Alia Airport, visit the Pompeii of the East in Jerash, check into Amman hotel.",
        "activities": [
          "Direct flight from Dubai DXB to Amman Queen Alia International Airport (AMM).",
          "Meet your private driver; excursion north to Jerash to explore Hadrian's Arch, the Oval Plaza, and Cardo Maximus.",
          "Check into 5★ hotel in Amman; welcome dinner featuring authentic Jordanian Mansaf."
        ],
        "meals": "Dinner included",
        "transport": "Private Chauffeur Car"
      },
      {
        "day": 2,
        "title": "Day 2 — Kings' Highway to the Rose-Red City of Petra",
        "summary": "Drive along scenic biblical King's Highway, visit Madaba mosaics and Mount Nebo, arrive in Petra.",
        "activities": [
          "Visit Mount Nebo overlooking the Promised Land and the ancient Byzantine mosaic map in Madaba.",
          "Drive to Wadi Musa; check into luxury resort located right at the gate of Petra.",
          "Optional evening experience: 'Petra by Night' illuminated by over 1,500 candles."
        ],
        "meals": "Breakfast included",
        "transport": "Private Chauffeur Car"
      },
      {
        "day": 3,
        "title": "Day 3 — Petra Exploration & Wadi Rum Star Dome Glamping",
        "summary": "Enter the iconic Siq canyon, stand before the Treasury, and journey to the red sands of Wadi Rum.",
        "activities": [
          "Guided morning exploration of Petra: the Siq gorge, the monumental Treasury (Al-Khazneh), the Amphitheatre, and the Street of Facades.",
          "Afternoon scenic drive to the protected desert of Wadi Rum.",
          "2-Hour 4x4 Bedouin jeep safari to natural rock bridges and red sand dunes.",
          "Check into a luxury Martian Dome camp; traditional underground Zarb BBQ dinner and stargazing."
        ],
        "meals": "Breakfast & Traditional Bedouin Dinner",
        "transport": "Private Vehicle & 4x4 Jeep"
      },
      {
        "day": 4,
        "title": "Day 4 — Wadi Rum Sunrise to the Dead Sea Luxury Resort",
        "summary": "Watch sunrise over red sandstone mountains, descend to the lowest point on Earth, float on the Dead Sea.",
        "activities": [
          "Sunrise camel ride or tea over desert dunes.",
          "Drive down to the Dead Sea, sitting 430 meters below sea level.",
          "Check into 5★ beachfront spa resort; float in the buoyant mineral waters and experience therapeutic Dead Sea mud."
        ],
        "meals": "Breakfast & Resort Dinner",
        "transport": "Private Chauffeur Car"
      },
      {
        "day": 5,
        "title": "Day 5 — Dead Sea Relaxation & Flight to Dubai",
        "summary": "Morning leisure at the spa before airport transfer.",
        "activities": [
          "Breakfast overlooking the serene sea; morning infinity pool and beach access.",
          "Private transfer to Amman Airport (AMM).",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "2 Nights in Amman 5★ Hotel + 1 Night in Petra Resort + 1 Night in Wadi Rum Luxury Star Dome + 1 Night Dead Sea Resort",
      "Daily breakfast, 1 traditional Mansaf dinner, 1 Bedouin Zarb BBQ feast, and 1 Dead Sea dinner",
      "Private dedicated air-conditioned vehicle with professional English-speaking chauffeur",
      "Full-day Petra entrance ticket and local licensed site guide",
      "2-Hour 4x4 Bedouin jeep safari in Wadi Rum",
      "Jerash, Madaba, and Mount Nebo entrance fees",
      "Jordan visa facilitation support on arrival"
    ],
    "exclusions": [
      "International flights Dubai–Amman–Dubai",
      "Lunches and beverages",
      "Petra by Night candlelight ticket (optional add-on)",
      "Driver and site guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "armenia-yerevan-sevan",
    "title": "Armenia Highland Escape: Yerevan Pink City, Garni Temple & Lake Sevan",
    "destination": "Yerevan · Cascade Complex · Garni Pagan Temple · Geghard Monastery · Lake Sevan · Tsaghkadzor",
    "country": "Armenia",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": ["Mountain", "Cultural", "Budget Friendly"],
    "priceStatus": "from",
    "priceFrom": 1899,
    "image": "/images/destinations/armenia-yerevan-ararat.jpg",
    "intro": "The world's first Christian nation: rose-volcanic tuff architecture, cliffside UNESCO monasteries, biblical views of Mount Ararat, and high-altitude azure lakes.",
    "story": "Nestled in the southern Caucasus highlands just 3 hours direct flight from Dubai, Armenia offers crisp alpine air, ancient Greco-Roman and medieval stone architecture, warm Caucasian hospitality, and mouthwatering grilled khorovats cuisine.",
    "highlights": [
      "Panoramic city tour of Yerevan's Pink Tuff stone buildings and Republic Square singing fountains",
      "Visit the 1st-century Greco-Roman Pagan Temple of Garni & Symphony of Stones gorge",
      "Explore UNESCO-listed Geghard cliff-carved cave monastery with live sacred vocal performance",
      "Scenic drive to high-altitude Lake Sevan and the 9th-century Sevanavank peninsula church",
      "Ropeway cable car ride in the alpine mountain resort of Tsaghkadzor",
      "3 Nights in central 4-star Yerevan hotel with daily breakfast buffet",
      "Private vehicle with English-speaking chauffeur-guide throughout"
    ],
    "route": ["Yerevan", "Garni", "Geghard", "Lake Sevan", "Tsaghkadzor"],
    "featured": true,
    "seasonal": "All Year Round",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Yerevan & Cascade Complex Sunset",
        "summary": "Short 3-hour direct flight from Dubai, private transfer to hotel, walking tour of central Yerevan.",
        "activities": [
          "Fly direct from Dubai DXB or Sharjah SHJ to Yerevan Zvartnots Airport (EVN).",
          "VIP private transfer to central 4★ hotel on Northern Avenue.",
          "Evening walk up the Cascade giant limestone stairway for sunset views over Yerevan and Mount Ararat.",
          "Enjoy the musical dancing fountains in Republic Square."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Garni Greco-Roman Temple, Geghard Monastery & Lavash Baking",
        "summary": "Classical colonnades, cliffside medieval caves, and traditional underground clay oven bread baking.",
        "activities": [
          "Drive through picturesque mountain passes to the 1st-century Hellenistic Temple of Garni.",
          "Hike down to the 'Symphony of Stones' basalt columnar cliff formation in the Azat Gorge.",
          "Visit UNESCO Geghard Monastery, partially carved out of adjacent mountain rock.",
          "Masterclass: watch Armenian village women bake traditional paper-thin Lavash bread in a clay tonir oven."
        ],
        "meals": "Breakfast & Traditional Village Lunch",
        "transport": "Private Guided Car"
      },
      {
        "day": 3,
        "title": "Day 3 — Lake Sevan Turquoise Waters & Tsaghkadzor Alpine Ropeway",
        "summary": "Ascend to one of the world's highest freshwater lakes and ride mountain chairlifts.",
        "activities": [
          "Drive to Lake Sevan, known as the 'Emerald of Armenia' at 1,900m altitude.",
          "Climb the peninsula hill to Sevanavank Monastery for breathtaking panoramic views across the lake.",
          "Continue to Tsaghkadzor alpine resort; ride the mountain chairlift up Mount Teghenis.",
          "Sample local Sevan trout and fresh cheese at a lakeside tavern."
        ],
        "meals": "Breakfast included",
        "transport": "Private Touring Vehicle"
      },
      {
        "day": 4,
        "title": "Day 4 — Vernissage Art Souvenir Market & Return to Dubai",
        "summary": "Shop for handmade silver, rugs, and dried fruits before short flight back.",
        "activities": [
          "Morning shopping at the famous Vernissage open-air flea market and GUM food hall for dried peaches and walnuts.",
          "Private transfer to Yerevan Airport (EVN).",
          "Fly direct back to Dubai DXB/SHJ in just 3 hours."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in handpicked 4★ central Yerevan hotel",
      "Daily international breakfast buffet",
      "Private dedicated air-conditioned vehicle with English-speaking chauffeur-guide",
      "Garni Temple and Geghard Monastery entrance tickets",
      "Traditional Armenian Lavash bread masterclass and village lunch",
      "Tsaghkadzor mountain ropeway cable car tickets",
      "All airport and hotel transfers"
    ],
    "exclusions": [
      "International flights Dubai–Yerevan–Dubai",
      "Lunches and dinners not mentioned",
      "Driver-guide tips",
      "Travel insurance"
    ]
  },
  {
    "slug": "kazakhstan-almaty-canyons",
    "title": "Kazakhstan Alpine Discovery: Almaty Mountains, Shymbulak & Charyn Canyon",
    "destination": "Almaty · Kok Tobe · Shymbulak Ski Resort · Medeu Ice Rink · Charyn Canyon Grand Valley",
    "country": "Kazakhstan",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": ["Mountain", "Adventure", "Nature"],
    "priceStatus": "from",
    "priceFrom": 2199,
    "image": "/images/destinations/kazakhstan-charyn.jpg",
    "intro": "The southern capital of the Great Steppe: snow-capped Tian Shan peaks, world-record high-altitude ice rinks, and dramatic red sandstone canyon gorges.",
    "story": "Fly direct from Dubai to Almaty, where modern tree-lined boulevards sit in the immediate shadow of 4,000-meter snow peaks. Ride the gondola to Shymbulak mountain resort, stand on the rim of the 'Grand Canyon of Central Asia' at Charyn, and savor authentic Central Asian shashlik and plov.",
    "highlights": [
      "Ride the cable car to Kok Tobe hill for sunset views across Almaty skyline",
      "Ascend into the snow-capped Zailiyskiy Alatau mountains on the Shymbulak alpine gondola",
      "Visit Medeu, the world's highest Olympic outdoor ice skating stadium at 1,691m",
      "Full-day expedition to Charyn Canyon and the 'Valley of Castles' red rock formations",
      "Explore Panfilov Park, the wooden Zenkov Cathedral (built without nails), and Green Bazaar",
      "3 Nights in 4-star central Almaty hotel with daily breakfast buffet",
      "Visa-free entry for UAE citizens & resident e-Visa support"
    ],
    "route": ["Almaty", "Medeu", "Shymbulak", "Kok Tobe", "Charyn Canyon"],
    "featured": true,
    "seasonal": "All Year Round (Ski Winter, Lush Summer)",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Almaty & Kok Tobe Hill Cable Car",
        "summary": "Direct flight from Dubai, private transfer, cable car to scenic hill overlook.",
        "activities": [
          "Direct flight from Dubai DXB to Almaty International Airport (ALA).",
          "Private transfer to 4★ central hotel.",
          "Board the cable car to Kok Tobe viewpoint: panoramic skyline views, Ferris wheel, and traditional Kazakh dinner."
        ],
        "meals": "Dinner included",
        "transport": "Private Airport Transfer & Cable Car"
      },
      {
        "day": 2,
        "title": "Day 2 — Medeu High-Altitude Gorge & Shymbulak Alpine Resort",
        "summary": "Glacial valleys, world-famous ice speed skating rink, and alpine cable car to 3,200m peak.",
        "activities": [
          "Drive to Medeu gorge and view the colossal Olympic high-altitude sports complex.",
          "Board the 3-stage gondola cable car to Shymbulak Mountain Resort at Talgar Pass (3,200 meters above sea level).",
          "Free time for snow activities (winter) or alpine hiking and mountain coffee (summer).",
          "Return to Almaty; explore pedestrian Arbat street street performers and cafes."
        ],
        "meals": "Breakfast included",
        "transport": "Private Touring Car & Gondola"
      },
      {
        "day": 3,
        "title": "Day 3 — Full-Day Expedition to Charyn Canyon Valley of Castles",
        "summary": "Journey across the steppe to the 80-million-year-old red sandstone canyon gorge.",
        "activities": [
          "Morning drive through scenic Kazakh steppe towards the Chinese border.",
          "Arrive at Charyn Canyon; hike 2 km through the dramatic 'Valley of Castles' between towering red stone spires.",
          "Reach the rushing turquoise Charyn River; picnic lunch in a traditional yurt by the water.",
          "Return to Almaty in the evening."
        ],
        "meals": "Breakfast & Steppe Picnic Lunch",
        "transport": "Private 4x4 / Touring Coach"
      },
      {
        "day": 4,
        "title": "Day 4 — Green Bazaar Gastronomy & Return to Dubai",
        "summary": "Sample dried apples, mountain honey, and horse-meat delicacies before flight.",
        "activities": [
          "Visit the colorful Green Bazaar to taste dried mountain fruit, nuts, honey, and local cheese.",
          "Stroll through Panfilov Park and view the pastel-colored Holy Ascension Zenkov Cathedral.",
          "Private transfer to Almaty Airport (ALA) for direct flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in 4★ central Almaty hotel",
      "Daily international breakfast buffet and 1 traditional Kazakh welcome dinner",
      "Private dedicated air-conditioned touring vehicle with English-speaking chauffeur-guide",
      "Medeu and Shymbulak 3-stage gondola cable car roundtrip tickets",
      "Kok Tobe cable car passes",
      "Full-day guided excursion to Charyn Canyon National Park with entrance fees",
      "All private airport and hotel transfers"
    ],
    "exclusions": [
      "International flights Dubai–Almaty–Dubai",
      "Ski equipment rental or mountain snow activities",
      "Lunches and dinners not listed",
      "Driver and guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "uzbekistan-silk-road-samarkand",
    "title": "Uzbekistan Silk Road Splendour: Samarkand Registan, Bukhara & Tashkent",
    "destination": "Tashkent · Samarkand Registan · Gur-e-Amir · Bukhara Old Town · Ark Fortress",
    "country": "Uzbekistan",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": ["Cultural", "Historical", "Luxury"],
    "priceStatus": "from",
    "priceFrom": 2699,
    "image": "/images/destinations/uzbekistan-registan.jpg",
    "intro": "The jewel of Islamic architecture: azure majolica tile mosaics, soaring turquoise domes, Timurid mausoleums, and ancient Silk Road caravanserais.",
    "story": "Walk in the footsteps of Marco Polo, Alexander the Great, and Amir Timur (Tamerlane). Ride the high-speed Afrosiyob bullet train through the Kyzylkum desert, gaze up at the colossal blue-tiled madrasahs of Registan Square, and bargain for hand-woven silk and carpets in the covered trading domes of Bukhara.",
    "highlights": [
      "Stand before the majestic turquoise-domed madrasahs of Registan Square in Samarkand",
      "Visit Gur-e-Amir, the gold-leafed tomb of conqueror Amir Timur",
      "Ride the 250 km/h Afrosiyob high-speed bullet train between Tashkent, Samarkand, and Bukhara",
      "Walking tour of UNESCO-listed Bukhara: Poi Kalyan minaret, Ark Citadel, and Lyabi-Hauz pool",
      "Explore Tashkent's ornate underground metro stations and Chorsu Bazaar",
      "4 Nights in handpicked 4★ boutique Silk Road hotels with traditional courtyards",
      "Private licensed English-speaking Egyptologist/Silk Road specialist guides"
    ],
    "route": ["Tashkent", "Samarkand", "Bukhara"],
    "featured": true,
    "seasonal": "Spring & Autumn Best",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Tashkent & High-Speed Train to Samarkand",
        "summary": "Direct flight from Dubai, private transfer to bullet train, arrive in legendary Samarkand.",
        "activities": [
          "Direct flight from Dubai DXB to Tashkent International Airport (TAS).",
          "Private transfer to Tashkent railway station; board the sleek Afrosiyob high-speed train to Samarkand (2 hours).",
          "Check into boutique hotel near Registan; evening stroll to see the madrasahs lit up under the stars."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer & Bullet Train"
      },
      {
        "day": 2,
        "title": "Day 2 — Samarkand: Registan Square, Gur-e-Amir & Shah-i-Zinda",
        "summary": "Full day discovering the pinnacle of Timurid Islamic architecture and azure necropolises.",
        "activities": [
          "Guided tour of Registan Square: Ulugh Beg, Sher-Dor, and Tilya-Kori Madrasahs.",
          "Visit Gur-e-Amir Mausoleum with its brilliant fluted azure dome and jade headstone.",
          "Walk through the breathtaking Shah-i-Zinda avenue of turquoise-tiled royal tombs.",
          "Visit the monumental Bibi-Khanym Mosque and Siab food bazaar."
        ],
        "meals": "Breakfast & Samarkand Plov Dinner",
        "transport": "Private Guided Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — Bullet Train to Sacred Bukhara & Lyabi-Hauz",
        "summary": "Journey to Central Asia's holiest city with over 140 preserved medieval monuments.",
        "activities": [
          "Board high-speed train to Bukhara (1.5 hours).",
          "Explore the historic heart around Lyabi-Hauz pond shaded by century-old mulberry trees.",
          "Visit the ancient Magok-i-Attari Mosque and covered trading domes for silk scarves and ceramics.",
          "Dinner at a rooftop restaurant overlooking illuminated Kalyan Minaret."
        ],
        "meals": "Breakfast included",
        "transport": "High-Speed Bullet Train"
      },
      {
        "day": 4,
        "title": "Day 4 — Bukhara Ark Citadel & Return Bullet Train to Tashkent",
        "summary": "Explore the massive mudbrick Fortress of the Emirs before returning to the capital.",
        "activities": [
          "Visit the massive 5th-century Ark Citadel, once a city within a city.",
          "Marvel at the Poi Kalyan Complex with its 45m minaret that even Genghis Khan spared.",
          "Visit the unique four-minaret Chor Minor madrasah.",
          "Evening Afrosiyob express train back to Tashkent; check into 4★ luxury hotel."
        ],
        "meals": "Breakfast included",
        "transport": "Private Car & Express Train"
      },
      {
        "day": 5,
        "title": "Day 5 — Tashkent Metro Architecture, Chorsu Bazaar & Flight to Dubai",
        "summary": "Ride the world's most ornate underground metro palaces before afternoon flight.",
        "activities": [
          "Ride the Tashkent Metro, viewing USSR-era chandelier and marble subway stations.",
          "Visit Chorsu Bazaar's massive turquoise dome for spices, saffron, and roasted almonds.",
          "Private transfer to Tashkent Airport (TAS).",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "2 Nights in Samarkand + 1 Night in Bukhara + 1 Night in Tashkent 4★ Boutique Hotels",
      "Daily breakfast buffet and authentic Samarkand Plov dinner",
      "All Afrosiyob high-speed bullet train tickets (Tashkent–Samarkand–Bukhara–Tashkent)",
      "Private dedicated air-conditioned vehicles and English-speaking Silk Road guides",
      "All museum and historic monument entrance tickets",
      "All airport and railway station transfers"
    ],
    "exclusions": [
      "International flights Dubai–Tashkent–Dubai",
      "Lunches and dinners not listed",
      "Camera permits inside certain historic mausoleums",
      "Driver and guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "tanzania-serengeti-zanzibar",
    "title": "Tanzania Safari & Zanzibar Spice Island: Serengeti Wildlife & Nungwi Beach",
    "destination": "Kilimanjaro · Serengeti National Park · Ngorongoro Crater · Zanzibar Stone Town · Nungwi Beach Resort",
    "country": "Tanzania",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": ["Safari", "Beach", "Luxury"],
    "priceStatus": "from",
    "priceFrom": 5499,
    "image": "/images/destinations/tanzania-serengeti.jpg",
    "intro": "The ultimate African bush-and-beach expedition: witness the Great Migration in the Serengeti, descend into the lost world of Ngorongoro, and relax on Zanzibar's white sand lagoons.",
    "story": "Fly direct from Dubai to Tanzania. Embark on private 4x4 pop-top safaris tracking lions, cheetahs, elephants, and rhinos across boundless savannah plains. Then board a scenic bush plane to the exotic spice island of Zanzibar for barefoot luxury, turquoise ocean waters, and fresh lobster barbecue.",
    "highlights": [
      "2 Full days of game drives in the legendary Serengeti National Park tracking the Big 5",
      "Descend 600m into the UNESCO Ngorongoro Crater, the world's largest intact volcanic caldera",
      "Scenic domestic flight from the bush to the tropical island of Zanzibar",
      "2 Nights at 5-star beachfront resort in Nungwi / Kendwa with all-inclusive amenities",
      "Guided walking tour through historic Stone Town alleys and Freddie Mercury House",
      "Private 4x4 safari land cruiser with pop-up roof and certified professional wildlife guide",
      "All national park conservation fees and safari camp full-board meals included"
    ],
    "route": ["Kilimanjaro", "Serengeti", "Ngorongoro", "Zanzibar", "Stone Town"],
    "featured": true,
    "seasonal": "All Year Round (Migration June–Oct)",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Fly from Dubai to Kilimanjaro & Serengeti Plains",
        "summary": "Direct flight, met by private safari ranger, game drive into central Serengeti.",
        "activities": [
          "Fly direct from Dubai DXB to Kilimanjaro Airport (JRO).",
          "Meet your dedicated safari driver-guide; board private 4x4 Land Cruiser with pop-up roof.",
          "Afternoon game drive entering the vast Serengeti savannah.",
          "Check into luxury canvas tented lodge; sundowner drinks around the campfire."
        ],
        "meals": "Lunch & Safari Dinner",
        "transport": "Private 4x4 Safari Land Cruiser"
      },
      {
        "day": 2,
        "title": "Day 2 — Full Day Big-5 Serengeti Game Drive",
        "summary": "Sunrise to sunset tracking prides of lions, leopards in acacia trees, and vast wildebeest herds.",
        "activities": [
          "Early morning sunrise game drive when predators are most active.",
          "Track cheetahs, elephants, giraffes, and hippos around the Seronera River valley.",
          "Bush picnic lunch surrounded by pristine African wilderness.",
          "Return to luxury safari camp for stargazing and multi-course dinner."
        ],
        "meals": "Full Board (Breakfast, Lunch & Dinner)",
        "transport": "4x4 Safari Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — Ngorongoro Volcanic Crater Lost World Safari",
        "summary": "Descend 600 meters into the crater floor teeming with over 25,000 large mammals.",
        "activities": [
          "Descend into Ngorongoro Crater, a natural sanctuary for black rhinos, flamingos, and giant tuskers.",
          "Picnic lunch by the hippo pool.",
          "Drive to Arusha / Kilimanjaro airport; evening scenic flight to Zanzibar Island.",
          "Check into 5★ beachfront resort in Nungwi."
        ],
        "meals": "Breakfast & Crater Picnic Lunch",
        "transport": "4x4 Safari Vehicle & Domestic Flight"
      },
      {
        "day": 4,
        "title": "Day 4 — Zanzibar Turquoise Beach Relaxation & Dhow Sunset Cruise",
        "summary": "Powder-soft white sands, crystal-clear warm waters, and traditional wooden sailing dhow.",
        "activities": [
          "Full day at leisure: swim in coral lagoons, sunbathe on non-tidal Nungwi beach, or indulge in beachfront spa.",
          "Late afternoon board a traditional wooden dhow with white sails for a sunset cruise with tropical fruits."
        ],
        "meals": "Breakfast & Resort Dinner",
        "transport": "Traditional Sailing Dhow"
      },
      {
        "day": 5,
        "title": "Day 5 — Stone Town UNESCO Heritage & Spice Farm Tour",
        "summary": "Carved wooden doors, aromatic clove plantations, and Swahili coastal culture.",
        "activities": [
          "Guided tour of an organic spice farm tasting fresh vanilla, cinnamon, cloves, and nutmeg.",
          "Wander the narrow coral-stone alleys of Stone Town, the Old Fort, and House of Wonders.",
          "Fresh seafood dinner at Forodhani waterfront night market."
        ],
        "meals": "Breakfast & Seafood Dinner",
        "transport": "Private Chauffeur Van"
      },
      {
        "day": 6,
        "title": "Day 6 — Zanzibar to Dubai Direct Flight",
        "summary": "Final morning beach walk before direct flight home.",
        "activities": [
          "Breakfast overlooking the Indian Ocean.",
          "Private transfer to Zanzibar Abeid Amani Karume Airport (ZNZ).",
          "Fly direct back to Dubai DXB on flydubai / Emirates."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "2 Nights in Serengeti Luxury Tented Safari Camp + 1 Night Ngorongoro + 2 Nights 5★ Zanzibar Beachfront Resort",
      "Full Board meals on safari (all breakfasts, gourmet lunches, and 3-course dinners)",
      "Private dedicated 4x4 Safari Land Cruiser with pop-up roof and professional English-speaking wildlife guide",
      "All Serengeti and Ngorongoro National Park and conservation entry fees",
      "Domestic flight from Arusha/Kilimanjaro to Zanzibar Island",
      "Zanzibar sunset dhow cruise and Stone Town spice tour",
      "All private airport, safari, and resort transfers"
    ],
    "exclusions": [
      "International flights Dubai–Kilimanjaro / Zanzibar–Dubai",
      "Hot air balloon safari over Serengeti (optional add-on)",
      "Zanzibar infrastructure tax (approx. $5/night)",
      "Safari driver-guide gratuities ($15-20/day recommended)",
      "Travel insurance"
    ]
  },
  {
    "slug": "seychelles-island-bliss",
    "title": "Seychelles Paradise: Mahé Island, Praslin Vallée de Mai & Anse Source d'Argent",
    "destination": "Mahé · Victoria Botanical Gardens · Praslin Coco de Mer · La Digue Granite Boulders",
    "country": "Seychelles",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": ["Beach", "Luxury", "Honeymoon"],
    "priceStatus": "from",
    "priceFrom": 5899,
    "image": "/images/destinations/seychelles-04.jpg",
    "intro": "The Garden of Eden: sculpted prehistoric pink granite boulders, endemic giant tortoises, Coco de Mer double coconut palms, and crystal-clear turquoise lagoons.",
    "story": "Located just 4.5 hours direct flight from Dubai, the Seychelles archipelago represents the pinnacle of private island luxury. Stay in a 5-star beachfront suite on Mahé, take the Cat Cocos ferry to Praslin's UNESCO jungle, and cycle past giant tortoises to the world's most photographed beach on La Digue.",
    "highlights": [
      "Full-day catamaran excursion to Praslin and La Digue islands",
      "Visit UNESCO-listed Vallée de Mai prehistoric palm forest, home to the rare Coco de Mer",
      "Swim and photograph the iconic sculpted granite boulders of Anse Source d'Argent",
      "Encounter free-roaming Aldabra Giant Tortoises at L'Union Estate",
      "4 Nights in 5-star luxury oceanview beachfront resort on Mahé Island",
      "Daily gourmet champagne breakfast buffet and private chauffeur transfers",
      "Visa-free entry for all nationalities traveling from Dubai"
    ],
    "route": ["Mahé", "Victoria", "Praslin", "La Digue"],
    "featured": true,
    "seasonal": "All Year Round (Warm Tropical)",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Mahé & Oceanfront Resort Check-In",
        "summary": "Direct flight from Dubai, private executive transfer to 5★ resort, tropical sunset.",
        "activities": [
          "Direct flight from Dubai DXB to Seychelles International Airport (SEZ) on Emirates.",
          "VIP private transfer to 5★ luxury beachfront resort (Beau Vallon or Petite Anse).",
          "Welcome tropical cocktail; relax by the infinity pool overlooking the Indian Ocean."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Chauffeur"
      },
      {
        "day": 2,
        "title": "Day 2 — Mahé Island Tour: Victoria Clock Tower & Tea Plantation",
        "summary": "Discover the miniature colonial capital, spice markets, and mountain viewpoints.",
        "activities": [
          "Guided morning tour of Victoria: Sir Selwyn Selwyn-Clarke market and Little Ben Clock Tower.",
          "Drive up the winding Sans Souci mountain road through Morne Seychellois National Park.",
          "Visit the historic Mission Lodge viewpoint and working tea plantation.",
          "Afternoon at leisure on the calm waters of Beau Vallon beach."
        ],
        "meals": "Breakfast included",
        "transport": "Private Guided Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — Catamaran Island Cruise: Praslin & Vallée de Mai",
        "summary": "High-speed catamaran to Praslin, discover the prehistoric Coco de Mer forest.",
        "activities": [
          "Board high-speed Cat Cocos ferry or catamaran to Praslin Island (1 hour).",
          "Walk through the enchanted UNESCO Vallée de Mai forest to see towering palms and rare black parrots.",
          "Visit Anse Lazio, regularly ranked among the top 10 beaches in the world for snorkeling.",
          "Creole buffet lunch with grilled red snapper."
        ],
        "meals": "Breakfast & Creole Beach Buffet",
        "transport": "Catamaran & Island Coach"
      },
      {
        "day": 4,
        "title": "Day 4 — La Digue Island: Bicycle Tour & Anse Source d'Argent",
        "summary": "Step back in time on La Digue; bicycle past vanilla plantations and iconic granite boulders.",
        "activities": [
          "Short ferry to relaxed La Digue Island where bicycles and ox-carts replace cars.",
          "Cycle through L'Union Estate: feed 100-year-old giant tortoises and see traditional coconut oil mills.",
          "Spend the afternoon on the powdery sands of Anse Source d'Argent between massive pink granite rock towers.",
          "Evening catamaran cruise back to Mahé resort."
        ],
        "meals": "Breakfast included",
        "transport": "Ferry & Island Bicycle"
      },
      {
        "day": 5,
        "title": "Day 5 — Creole Souvenirs & Flight Back to Dubai",
        "summary": "Final morning beach dip and tropical fruit breakfast before flight.",
        "activities": [
          "Champagne breakfast overlooking the ocean.",
          "Shop for authentic Takamaka rum and vanilla pods.",
          "Private executive transfer to Seychelles Airport (SEZ).",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "4 Nights in 5★ luxury beachfront oceanview resort on Mahé Island",
      "Daily gourmet international breakfast buffet and 1 Creole beach lunch",
      "Full-day guided Praslin & La Digue island-hopping excursion with ferry and catamaran passes",
      "Vallée de Mai UNESCO National Park entrance tickets",
      "L'Union Estate and Anse Source d'Argent access fees with bicycle hire",
      "Mahé island highlights tour with private vehicle",
      "All private luxury airport and ferry transfers"
    ],
    "exclusions": [
      "International flights Dubai–Seychelles–Dubai",
      "Lunches and dinners not listed",
      "Motorized water sports and scuba diving",
      "Gratuities for guides and drivers",
      "Travel insurance"
    ]
  },
  {
    "slug": "hungary-budapest-danube",
    "title": "Budapest Pearl of the Danube: Thermal Spas, Buda Castle & Parliament Cruise",
    "destination": "Budapest · Buda Castle & Fisherman's Bastion · Széchenyi Thermal Baths · Danube Evening Cruise",
    "country": "Hungary",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": ["City Escape", "Cultural", "Romantic"],
    "priceStatus": "from",
    "priceFrom": 2799,
    "image": "/images/destinations/hungary-01.jpg",
    "intro": "The Queen of the Danube: Neo-Gothic parliament spires glowing on the river, fairytale fairytale turrets at Fisherman's Bastion, and steaming outdoor mineral thermal baths.",
    "story": "Split by the majestic Danube River into historic hilly Buda and vibrant Pest, Budapest is one of Central Europe's most enchanting and affordable royal capitals. Soak in the neo-baroque outdoor pools of Széchenyi, cruise past the illuminated Hungarian Parliament at night, and savor warm chimney cakes and goulash.",
    "highlights": [
      "Illuminated evening sightseeing cruise on the Danube with complimentary glass of champagne",
      "VIP skip-the-line full-day pass to historic Széchenyi Thermal Baths with private cabin",
      "Guided walking tour of Buda Castle District, Matthias Church & Fisherman's Bastion",
      "Visit St. Stephen's Basilica and the Great Market Hall for Hungarian paprika and souvenirs",
      "3 Nights in central 4-star boutique hotel on the Pest side",
      "Daily breakfast buffet and private airport transfers",
      "Schengen visa processing support from our Dubai office"
    ],
    "route": ["Budapest", "Buda Castle", "Danube River", "Széchenyi"],
    "featured": true,
    "seasonal": "All Year Round",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Budapest & Danube Evening Illuminated Cruise",
        "summary": "Direct flight from Dubai, private transfer to hotel, breathtaking night cruise.",
        "activities": [
          "Direct flight from Dubai DXB to Budapest Ferenc Liszt International Airport (BUD).",
          "Private transfer to central 4★ hotel near Váci Street.",
          "Evening 1-hour sightseeing cruise along the Danube River viewing the glowing Hungarian Parliament, Chain Bridge, and Buda Castle."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer & River Boat"
      },
      {
        "day": 2,
        "title": "Day 2 — Buda Castle Hill, Fisherman's Bastion & Matthias Church",
        "summary": "Explore the medieval royal quarter and panoramic viewpoints over the Danube.",
        "activities": [
          "Ride the historic 1870 Castle Hill Funicular up to Buda Castle.",
          "Marvel at the Gothic architecture and colorful diamond-patterned roof of Matthias Church.",
          "Stroll along the fairytale white stone towers of Fisherman's Bastion for panoramic photo opportunities across the entire city.",
          "Traditional Hungarian lunch featuring rich goulash soup and beef stew."
        ],
        "meals": "Breakfast & Hungarian Lunch",
        "transport": "Private Guided Vehicle & Funicular"
      },
      {
        "day": 3,
        "title": "Day 3 — Széchenyi Thermal Baths & Hero's Square",
        "summary": "Relax in Europe's largest medical bath complex fed by natural hot thermal springs.",
        "activities": [
          "Morning visit to Heroes' Square and Vajdahunyad Castle in City Park.",
          "Spend the afternoon soaking in the 18 indoor and outdoor warm thermal pools of Széchenyi Baths.",
          "Evening walk along Andrássy Avenue and coffee with traditional Dobos torte cake."
        ],
        "meals": "Breakfast included",
        "transport": "Private Vehicle"
      },
      {
        "day": 4,
        "title": "Day 4 — Great Market Hall Souvenirs & Flight to Dubai",
        "summary": "Sample chimney cakes and artisan paprika before departure.",
        "activities": [
          "Explore the Great Market Hall, Budapest's largest 3-story indoor market hall.",
          "Shop for Hungarian porcelain, Tokaji sweet wine, and authentic paprika.",
          "Private transfer to Budapest Airport (BUD).",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in central 4★ boutique hotel in Budapest",
      "Daily international breakfast buffet and 1 traditional Hungarian lunch",
      "Danube River evening sightseeing cruise tickets with welcome drink",
      "Széchenyi Thermal Baths full-day pass with private changing cabin",
      "Buda Castle district guided walking tour with Matthias Church entrance",
      "Castle Hill historic funicular ticket",
      "All private airport and hotel transfers"
    ],
    "exclusions": [
      "International flights Dubai–Budapest–Dubai",
      "Lunches and dinners not specified",
      "Personal spa treatments and massages",
      "Driver and guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "australia-sydney-goldcoast",
    "title": "Australia Icons: Sydney Harbour, Blue Mountains & Gold Coast Surfers Paradise",
    "destination": "Sydney · Opera House & Harbour Bridge · Blue Mountains · Gold Coast · Surfers Paradise",
    "country": "Australia",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": ["City Escape", "Beach", "Nature"],
    "priceStatus": "from",
    "priceFrom": 6899,
    "image": "/images/destinations/australia-01.jpg",
    "intro": "The best of Down Under: sail past the Sydney Opera House, gaze at the eucalyptus-hazed Blue Mountains, and soak up sunshine on the golden surf beaches of Queensland.",
    "story": "From the world's most recognizable harbour to ancient rainforests and world-class theme parks, Australia offers an unforgettable luxury journey. Walk the dramatic cliffs of Bondi, meet koalas and kangaroos up close, and enjoy beachfront resort dining on the Gold Coast.",
    "highlights": [
      "Sydney Harbour luxury luncheon cruise with views of the Opera House and Harbour Bridge",
      "Full-day Blue Mountains expedition: Three Sisters rock formation & Scenic World cableway",
      "Koala and kangaroo up-close wildlife sanctuary encounter",
      "Domestic flight from Sydney to the subtropical Gold Coast",
      "3 Nights in 5★ Sydney Harbour hotel + 3 Nights in 5★ Gold Coast oceanfront resort",
      "Surfers Paradise beach, Q1 SkyPoint observation deck pass, and rainforest hinterland tour",
      "Australian Electronic Travel Authority (ETA) visa handling support"
    ],
    "route": ["Sydney", "Bondi", "Blue Mountains", "Gold Coast", "Surfers Paradise"],
    "featured": true,
    "seasonal": "All Year Round (Summer Dec–Feb, Spring Sept–Nov)",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Sydney & Circular Quay Sunset",
        "summary": "Fly from Dubai, private transfer to harbour hotel, stroll along the Opera House promenade.",
        "activities": [
          "Direct flight from Dubai DXB to Sydney Kingsford Smith Airport (SYD) on Emirates.",
          "VIP private transfer to 5★ luxury hotel at Darling Harbour / Circular Quay.",
          "Evening walk around the Sydney Opera House sails and dinner at The Rocks historic precinct."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Chauffeur"
      },
      {
        "day": 2,
        "title": "Day 2 — Sydney Harbour Cruise & Bondi Beach Coastal Walk",
        "summary": "Catamaran cruise on the world's finest natural harbour and famous golden surf beaches.",
        "activities": [
          "Morning catamaran cruise on Sydney Harbour with 2-course seafood lunch.",
          "Private afternoon tour to Bondi Beach; walk the famous cliffside path to Tamarama.",
          "Visit Mrs Macquarie's Chair for the ultimate postcard view of the Opera House and Harbour Bridge together."
        ],
        "meals": "Breakfast & Harbour Lunch",
        "transport": "Private Vehicle & Harbour Catamaran"
      },
      {
        "day": 3,
        "title": "Day 3 — Blue Mountains World Heritage & Wildlife Sanctuary",
        "summary": "Ancient eucalyptus valleys, the Three Sisters rock formation, and cuddly koalas.",
        "activities": [
          "Scenic drive into the UNESCO Blue Mountains National Park.",
          "Visit Scenic World: ride the world's steepest passenger railway down into the rainforest valley and the glass-bottom skyway.",
          "Photograph the iconic Three Sisters at Echo Point.",
          "Stop at Featherdale Wildlife Park to hand-feed kangaroos and take a photo with a koala."
        ],
        "meals": "Breakfast included",
        "transport": "Luxury Touring Coach & Cableway"
      },
      {
        "day": 4,
        "title": "Day 4 — Fly to Queensland's Gold Coast & Surfers Paradise",
        "summary": "Short domestic flight to the sunshine state; check into 5★ beachfront resort.",
        "activities": [
          "Morning transfer to Sydney Airport; fly to Gold Coast Airport (OOL).",
          "Private transfer to luxury 5★ resort in Surfers Paradise / Broadbeach.",
          "Ascend the SkyPoint Observation Deck on the 77th floor of the Q1 skyscraper for 360-degree ocean views."
        ],
        "meals": "Breakfast included",
        "transport": "Domestic Flight & Private Vehicle"
      },
      {
        "day": 5,
        "title": "Day 5 — Tamborine Mountain Rainforest & Glow Worm Caves",
        "summary": "Explore lush subtropical rainforest canopies and boutique mountain galleries.",
        "activities": [
          "Day trip to Mount Tamborine rainforest hinterland.",
          "Walk among the treetops on the Tamborine Rainforest Skywalk.",
          "Visit the underground Glow Worm caves and taste artisan fudge and macadamia honey.",
          "Evening free time along Cavill Avenue in Surfers Paradise."
        ],
        "meals": "Breakfast & Rainforest Lunch",
        "transport": "Private Guided Vehicle"
      },
      {
        "day": 6,
        "title": "Day 6 — Gold Coast Beach Day or Theme Park Adventure",
        "summary": "Relax on miles of golden sandy beach or experience Warner Bros. Movie World.",
        "activities": [
          "Full leisure day: sunbathe, surf, or opt for a day pass to Warner Bros. Movie World or Sea World.",
          "Sunset dinner at Marina Mirage overlooking luxury superyachts."
        ],
        "meals": "Breakfast included",
        "transport": "Free Day"
      },
      {
        "day": 7,
        "title": "Day 7 — Departure from Brisbane / Gold Coast to Dubai",
        "summary": "Final morning Australian coffee before direct flight back to the Emirates.",
        "activities": [
          "Breakfast overlooking the rolling surf.",
          "Private transfer to Brisbane Airport (BNE) or Gold Coast (OOL).",
          "Fly direct back to Dubai DXB on Emirates."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "3 Nights in 5★ Sydney Harbour Hotel + 3 Nights in 5★ Gold Coast Oceanfront Resort",
      "Daily gourmet breakfast buffet and 1 Sydney Harbour luncheon cruise",
      "Full-day Blue Mountains guided tour with Scenic World Unlimited Discovery pass",
      "Featherdale Wildlife Park admission with kangaroo feeding",
      "Domestic flight Sydney (SYD) to Gold Coast (OOL)",
      "SkyPoint Observation Deck Level 77 entrance pass",
      "All private airport, hotel, and touring transfers",
      "Australian ETA visa processing assistance"
    ],
    "exclusions": [
      "International flights Dubai–Sydney / Brisbane–Dubai",
      "Theme park entrance passes (optional add-on)",
      "Lunches and dinners not listed in itinerary",
      "Driver and tour guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "kyrgyzstan-tian-shan-lake",
    "title": "Kyrgyzstan Celestial Mountains: Bishkek, Ala Archa & Issyk-Kul Lake",
    "destination": "Bishkek · Ala Archa National Park · Burana Tower · Issyk-Kul Alpine Lake · Chon-Kemin Valley",
    "country": "Kyrgyzstan",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": ["Mountain", "Nature", "Adventure"],
    "priceStatus": "from",
    "priceFrom": 2299,
    "image": "/images/destinations/kyrgyzstan-03.jpg",
    "intro": "The Switzerland of Central Asia: towering snow peaks, alpine pine forests, nomadic yurt traditions, and the world's second-largest high-altitude saline lake.",
    "story": "Just 4 hours flight from Dubai, Kyrgyzstan is an untouched paradise of soaring 7,000m peaks, glacier-fed alpine rivers, and ancient nomadic heritage. Hike beneath colossal glaciers in Ala Archa, sleep by the turquoise shores of Issyk-Kul Lake, and witness golden eagle hunting demonstrations.",
    "highlights": [
      "Guided hike into the spectacular glacial gorge of Ala Archa National Park",
      "Visit the 10th-century Silk Road Burana Tower and ancient stone warrior petroglyphs",
      "Scenic cruise on the crystal-clear, non-freezing waters of Lake Issyk-Kul",
      "Experience traditional Kyrgyz nomadic hospitality and folklore music show in a yurt",
      "Live Golden Eagle hunting demonstration by traditional Salbuurun hunters",
      "3 Nights in 4-star Bishkek hotel and lakeside Issyk-Kul resort",
      "Visa-free entry for UAE citizens & residents"
    ],
    "route": ["Bishkek", "Ala Archa", "Burana", "Issyk-Kul", "Chon-Kemin"],
    "featured": true,
    "seasonal": "All Year Round (Lush May–Oct, Snow Winter)",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Bishkek & Ala Archa Alpine Canyon",
        "summary": "Fly from Dubai, private transfer, mountain gorge hike beneath snow peaks.",
        "activities": [
          "Direct flight from Dubai DXB to Bishkek Manas International Airport (FRU) on flydubai.",
          "Meet your private guide; drive 40 km into Ala Archa National Park in the Tian Shan range.",
          "Hike along the alpine river towards the Ak-Sai glacier waterfall.",
          "Check into 4★ Bishkek hotel; welcome dinner with traditional Beshbarmak and lagman noodles."
        ],
        "meals": "Dinner included",
        "transport": "Private Guided 4x4 / Vehicle"
      },
      {
        "day": 2,
        "title": "Day 2 — Silk Road Burana Tower to Lake Issyk-Kul",
        "summary": "Ancient minarets on the Silk Road, then journey to the 'Warm Lake' surrounded by mountains.",
        "activities": [
          "Drive east to the 10th-century Burana Tower minaret and field of Balbals (ancient stone statues).",
          "Continue through the dramatic Boom Gorge to Lake Issyk-Kul at 1,600m altitude.",
          "Check into 4★ lakeside resort; enjoy beach walk and breathtaking mountain backdrop across the water."
        ],
        "meals": "Breakfast & Traditional Lunch",
        "transport": "Private Touring Vehicle"
      },
      {
        "day": 3,
        "title": "Day 3 — Issyk-Kul Boat Cruise & Golden Eagle Hunting",
        "summary": "Scenic boat cruise on the deep blue lake, then nomad eagle hunting show.",
        "activities": [
          "Morning 1-hour boat cruise on Lake Issyk-Kul with panoramic views of snow-capped peaks.",
          "Visit the open-air petroglyph museum in Cholpon-Ata dating back to 800 BC.",
          "Witness an authentic demonstration of traditional nomadic Golden Eagle hunting and archery.",
          "Scenic return drive to Bishkek."
        ],
        "meals": "Breakfast & Nomad Lunch",
        "transport": "Private Vehicle & Boat Cruise"
      },
      {
        "day": 4,
        "title": "Day 4 — Osh Bazaar Souvenirs & Flight to Dubai",
        "summary": "Explore central Ala-Too Square and shop for felt carpets and honey before flight.",
        "activities": [
          "Morning walk through Ala-Too Square, Oak Park, and the Philharmonic Hall.",
          "Shop for pure Tian Shan mountain honey, hand-felted Shyrdak rugs, and dried fruit at Osh Bazaar.",
          "Private transfer to Bishkek Airport (FRU) for direct flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "2 Nights in 4★ Bishkek Hotel + 1 Night in Lakeside Issyk-Kul 4★ Resort",
      "Daily breakfast, 1 Kyrgyz welcome dinner, and 2 traditional lunches",
      "Private dedicated 4x4 / touring vehicle with English-speaking mountain guide",
      "Ala Archa National Park entrance and hiking permits",
      "Burana Tower entrance and Issyk-Kul scenic boat cruise",
      "Traditional Golden Eagle hunting masterclass and demonstration",
      "All private airport, lake, and mountain transfers"
    ],
    "exclusions": [
      "International flights Dubai–Bishkek–Dubai",
      "Horse riding fees (optional add-on)",
      "Dinners not listed",
      "Driver and mountain guide gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "hong-kong-disneyland-skyline",
    "title": "Hong Kong Extravaganza: Victoria Peak, Disneyland & Macau Day Excursion",
    "destination": "Hong Kong Island · Victoria Peak Tram · Kowloon · Hong Kong Disneyland · Macau Ruins of St. Paul",
    "country": "Hong Kong",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": ["City Escape", "Family", "Theme Park"],
    "priceStatus": "from",
    "priceFrom": 3899,
    "image": "/images/destinations/hong-kong-skyline.jpg",
    "intro": "The dazzling Fragrant Harbour: futuristic neon skylines, historic double-decker trams, magical World of Frozen at Disneyland, and Portuguese heritage in Macau.",
    "story": "Ride the historic Peak Tram to the highest point on Hong Kong Island, sail aboard the vintage Star Ferry across Victoria Harbour, spend a day of pure magic at Hong Kong Disneyland, and take the high-speed turbojet ferry to Macau to see the UNESCO Ruins of St. Paul's and world-class resort casinos.",
    "highlights": [
      "Peak Tram Sky Pass to Sky Terrace 428 for the ultimate panoramic skyline view",
      "Full-day 1-Day Pass to Hong Kong Disneyland including the new World of Frozen",
      "Full-day guided day excursion to Macau with return TurboJET catamaran tickets",
      "Macau highlights: Ruins of St. Paul's, A-Ma Temple, and The Venetian resort",
      "Traditional dim sum lunch experience featuring Michelin-recommended delicacies",
      "4 Nights in 4★/5★ central hotel in Tsim Sha Tsui or Causeway Bay",
      "All private airport, ferry, and theme park transfers"
    ],
    "route": ["Hong Kong", "Victoria Peak", "Disneyland", "Macau"],
    "featured": true,
    "seasonal": "All Year Round (Best Oct–April)",
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrive in Hong Kong & Symphony of Lights Show",
        "summary": "Direct flight from Dubai, private transfer to hotel, evening harbour light show.",
        "activities": [
          "Direct flight from Dubai DXB to Hong Kong International Airport (HKG) on Emirates/Cathay Pacific.",
          "Private airport transfer to your 4★/5★ hotel in Tsim Sha Tsui / Kowloon.",
          "Evening walk along the Avenue of Stars to watch the world-famous 'A Symphony of Lights' laser show over Victoria Harbour."
        ],
        "meals": "No meals (arrival)",
        "transport": "Private Airport Transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Victoria Peak Tram, Star Ferry & Central Dim Sum",
        "summary": "Ride the historic 1888 Peak Tram, cross the harbour by vintage ferry, and savor dim sum.",
        "activities": [
          "Board the green Peak Tram up to Victoria Peak and Sky Terrace 428 for 360-degree city and harbour vistas.",
          "Authentic Michelin-style dim sum lunch (har gow, siu mai, and barbecue pork buns).",
          "Ride the vintage green-and-white Star Ferry across Victoria Harbour.",
          "Explore Central's Mid-Levels Escalator and vibrant Soho antique shops."
        ],
        "meals": "Breakfast & Dim Sum Lunch",
        "transport": "Peak Tram, Star Ferry & Private Car"
      },
      {
        "day": 3,
        "title": "Day 3 — Hong Kong Disneyland Magical Adventure",
        "summary": "A full day of fantasy rides, Disney character parades, and the Castle fireworks show.",
        "activities": [
          "Private transfer to Hong Kong Disneyland on Lantau Island.",
          "Full day exploring 7 themed lands, including the newly opened World of Frozen (Frozen Ever After ride).",
          "Experience Space Mountain, Mystic Manor, and Iron Man Experience.",
          "Watch the spectacular 'Momentous' nighttime castle projection and fireworks show."
        ],
        "meals": "Breakfast included",
        "transport": "Private Theme Park Transfers"
      },
      {
        "day": 4,
        "title": "Day 4 — Full-Day Macau Day Trip via TurboJET Ferry",
        "summary": "Catamaran across the Pearl River Delta to Portuguese-influenced Macau.",
        "activities": [
          "Board the high-speed TurboJET ferry to Macau (55 minutes).",
          "Guided tour of UNESCO-listed 17th-century Ruins of St. Paul's Cathedral and Senado Square.",
          "Taste warm Portuguese egg tarts (Pastéis de Nata) and pork chop buns.",
          "Visit The Venetian Macao and ride the indoor canals; return to Hong Kong in the evening."
        ],
        "meals": "Breakfast & Portuguese Macanese Lunch",
        "transport": "TurboJET Ferry & Macau Touring Coach"
      },
      {
        "day": 5,
        "title": "Day 5 — Ladies' Market Souvenirs & Departure to Dubai",
        "summary": "Duty-free electronics and fashion shopping before direct flight home.",
        "activities": [
          "Breakfast at hotel; morning shopping at Harbour City or Mong Kok street markets.",
          "Private transfer to Hong Kong Airport (HKG).",
          "Fly direct back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Private Airport Transfer"
      }
    ],
    "inclusions": [
      "4 Nights in 4★/5★ central hotel in Tsim Sha Tsui or Causeway Bay",
      "Daily international breakfast buffet and 1 authentic dim sum luncheon",
      "Peak Tram return pass + Sky Terrace 428 entry ticket",
      "Full 1-Day Hong Kong Disneyland theme park admission ticket",
      "Full-day guided Macau excursion with roundtrip TurboJET ferry tickets and lunch",
      "Star Ferry harbour crossing",
      "All private airport, hotel, and theme park transfers"
    ],
    "exclusions": [
      "International flights Dubai–Hong Kong–Dubai",
      "Dinners not listed in itinerary",
      "Disney Premier Access fast passes (optional)",
      "Guide and chauffeur gratuities",
      "Travel insurance"
    ]
  },
  {
    "slug": "finland-lapland-aurora",
    "title": "Finland Arctic Magic: Lapland Northern Lights, Glass Igloo & Santa Claus Village",
    "destination": "Helsinki · Rovaniemi · Santa Claus Village · Arctic Circle Glass Igloos",
    "country": "Finland",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Northern Lights",
      "Family",
      "Luxury",
      "Adventure"
    ],
    "priceStatus": "from",
    "priceFrom": 6890,
    "image": "/images/destinations/finland-northern-lights.jpg",
    "intro": "Experience the ultimate winter wonderland in Finnish Lapland: chase the dancing Aurora Borealis, sleep under the stars in a heated glass igloo, and meet Santa Claus at the Arctic Circle.",
    "story": "From Helsinki's elegant design quarter to the snow-covered pine forests of Rovaniemi, embark on an unforgettable Arctic expedition featuring husky sledding, reindeer safaris, and nightly Northern Lights hunts.",
    "highlights": [
      "Overnight stay in a luxury heated glass-roof igloo under the Arctic sky",
      "Nightly Northern Lights Aurora Borealis guided chase with pro photographer",
      "VIP meet-and-greet at Santa Claus Village on the official Arctic Circle line",
      "Thrilling husky dog sledding through snow-covered Lappish forests",
      "Traditional reindeer sleigh safari and indigenous Sámi cultural experience",
      "Snowmobile safari across frozen lakes and Arctic wilderness trails",
      "Guided tour of Helsinki Cathedral, Senate Square & Design District"
    ],
    "route": [
      "Helsinki",
      "Rovaniemi",
      "Santa Claus Village",
      "Arctic Glass Resort",
      "Helsinki"
    ],
    "featured": true,
    "seasonal": "Winter Wonderland",
    "isNew": true,
    "inclusions": [
      "5 nights luxury accommodation including 1 night in heated glass igloo",
      "Daily Scandinavian buffet breakfast & 3 gourmet dinners",
      "Domestic flight Helsinki - Rovaniemi round-trip with checked luggage",
      "All thermal Arctic winter clothing, boots and gloves provided for activities",
      "Husky safari (5km), Reindeer sleigh ride, and Snowmobile excursion",
      "Guided Northern Lights chase with warm campfire drinks and snacks",
      "All private airport and inter-activity transfers in heated Mercedes coaches",
      "24/7 dedicated concierge assistance in English and Arabic"
    ],
    "exclusions": [
      "International flights to/from Helsinki DXB/AUH",
      "Schengen visa processing fees",
      "Personal travel insurance",
      "Optional premium excursions not mentioned in the itinerary"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Helsinki & Capital City Highlights",
        "summary": "Arrive at Helsinki Airport, private transfer to luxury downtown hotel, orientation walk.",
        "activities": [
          "Arrive at Helsinki Airport (HEL) from Dubai. Meet your private driver and transfer to your luxury central hotel.",
          "Enjoy a scenic walking tour of Senate Square, the iconic white Helsinki Cathedral, and Market Square by the harbour.",
          "Welcome dinner featuring Nordic cuisine at a celebrated local restaurant."
        ],
        "meals": "Dinner included",
        "transport": "Included private transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Flight to Lapland (Rovaniemi) & Santa Claus Village",
        "summary": "Fly to Rovaniemi, cross the official Arctic Circle, and meet Santa Claus.",
        "activities": [
          "Morning flight from Helsinki to Rovaniemi, the official hometown of Santa Claus.",
          "Check in to your Arctic lodge and receive your thermal suits, boots, and winter gear.",
          "Visit Santa Claus Village: cross the Arctic Circle latitude line, visit Santa's Main Post Office, and meet Santa Claus in person.",
          "Evening Northern Lights Aurora chase by heated minivan to optimal dark-sky spots with hot berry juice by a campfire."
        ],
        "meals": "Breakfast included",
        "transport": "Flight & private transport included"
      },
      {
        "day": 3,
        "title": "Day 3 — Husky Dog Sledding & Snowmobile Arctic Safari",
        "summary": "Mushing your own husky team across snow forests and snowmobiling on frozen lakes.",
        "activities": [
          "Visit an authentic Lappish husky kennel and meet enthusiastic Siberian huskies.",
          "Take the reins to drive your own 2-person dog sled team on a thrilling 5km trail through pristine snowy pine forests.",
          "After lunch, embark on an exhilarating 2-hour guided snowmobile adventure across frozen rivers and snowdrifts.",
          "Relax in a traditional Finnish wood-fired sauna."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Reindeer Sleigh, Sámi Heritage & Glass Igloo Check-in",
        "summary": "Reindeer farm visit, Sámi folklore storytelling, and sleeping in a 360° heated glass igloo.",
        "activities": [
          "Visit a heritage reindeer farm: learn lasso throwing and glide gracefully in a traditional wooden reindeer sleigh.",
          "Warm up inside a Lappish kota tent listening to traditional joik songs and stories from local Sámi herders.",
          "Transfer and check in to your luxury heated Glass Igloo resort.",
          "Watch the Arctic night sky from your warm bed equipped with Aurora alarm notification systems."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Arctic Snowshoe Trek & Return Flight to Helsinki",
        "summary": "Snowshoe nature walk, flight back to Helsinki for shopping and leisure.",
        "activities": [
          "Morning snowshoe trek through silent snow-draped taiga forests with panoramic fell viewpoints.",
          "Transfer to Rovaniemi Airport for your return flight to Helsinki.",
          "Evening at leisure exploring Helsinki's Esplanadi shopping district and Design Quarter."
        ],
        "meals": "Breakfast included",
        "transport": "Flight & private transport included"
      },
      {
        "day": 6,
        "title": "Day 6 — Departure from Helsinki to UAE",
        "summary": "Free morning for souvenir shopping before VIP transfer to airport.",
        "activities": [
          "Leisurely breakfast and last-minute shopping for Finnish design, Fazer chocolates, and Arctic souvenirs.",
          "Private Mercedes transfer to Helsinki Airport for your return flight to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "malaysia-kuala-lumpur-langkawi",
    "title": "Malaysia Enchantment: Kuala Lumpur Twin Towers, Batu Caves & Langkawi Beach Resort",
    "destination": "Kuala Lumpur · Petronas Towers · Batu Caves · Genting · Langkawi Island",
    "country": "Malaysia",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Family",
      "Beach",
      "Shopping",
      "City Escape"
    ],
    "priceStatus": "from",
    "priceFrom": 2850,
    "image": "/images/destinations/malaysia-g01.jpg",
    "intro": "The best of dynamic Southeast Asia: sparkling Petronas Twin Towers, colorful Batu Caves rainbow steps, and tropical beach relaxation on the UNESCO island of Langkawi.",
    "story": "Explore world-class shopping in Bukit Bintang, take the high-altitude cable car up Genting Highlands, and fly to Langkawi for white-sand beaches, mangrove eagle feeding, and luxury island resorts.",
    "highlights": [
      "Access tickets to Petronas Twin Towers Skybridge & 86th floor observation deck",
      "Guided tour of Batu Caves featuring the giant golden Lord Murugan statue",
      "Day excursion to Genting Highlands with Awana SkyWay glass-bottom gondola",
      "3 nights luxury beachside 5-star resort stay in Andaman Sea Langkawi",
      "Langkawi UNESCO Geopark Kilim Geoforest mangrove boat safari & eagle watching",
      "Langkawi SkyCab & breathtaking curved SkyBridge mountain crossing",
      "Duty-free shopping in Bukit Bintang, Pavilion Mall & Langkawi Cenang"
    ],
    "route": [
      "Kuala Lumpur",
      "Batu Caves",
      "Genting Highlands",
      "Langkawi",
      "Kuala Lumpur"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "2 nights 5-star hotel in Kuala Lumpur & 3 nights 5-star beachfront resort in Langkawi",
      "Daily international breakfast buffet",
      "Domestic flights Kuala Lumpur - Langkawi round-trip with 20kg baggage",
      "Petronas Twin Towers & Langkawi SkyBridge entry tickets",
      "Kilim Geoforest private mangrove boat tour with lunch",
      "All private airport, tour and hotel transfers in air-conditioned vehicles",
      "English/Arabic speaking tour guide throughout"
    ],
    "exclusions": [
      "International flights to/from Kuala Lumpur DXB/AUH",
      "Malaysia tourism tax paid directly at hotel check-in",
      "Personal expenses and water sports rentals",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Kuala Lumpur & Bukit Bintang Nightlife",
        "summary": "Arrive at KLIA, private transfer to 5★ central hotel, evening food street tour.",
        "activities": [
          "Arrival at Kuala Lumpur International Airport (KLIA). VIP airport pickup and transfer to your 5-star hotel in central KLCC.",
          "Freshen up and enjoy an evening stroll through Bukit Bintang and Jalan Alor street food market.",
          "Admire the illuminated Petronas Twin Towers and Lake Symphony fountain show."
        ],
        "meals": "No meals (arrival day)",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Petronas Skybridge, Batu Caves & Genting Highlands",
        "summary": "Petronas Towers, colorful Batu Caves, and Awana SkyWay to Genting.",
        "activities": [
          "Ascend the Petronas Twin Towers SkyBridge connecting the dual towers and the 86th floor viewing deck.",
          "Visit the sacred Batu Caves with its 140-foot golden statue and 272 rainbow steps leading into cathedral caverns.",
          "Ride the Awana SkyWay cable car up to Genting Highlands mountain resort for cool breezes and entertainment."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Flight to Tropical Langkawi & Sunset Beach",
        "summary": "Fly to Langkawi Island, check in to beachfront luxury resort, relax by Andaman Sea.",
        "activities": [
          "Transfer to airport for a short 50-minute scenic flight to Langkawi Island.",
          "Check in to your 5-star beachfront resort at Pantai Cenang or Datai Bay.",
          "Spend the afternoon swimming in turquoise waters or relaxing poolside with complimentary tropical mocktails.",
          "Sunset dinner on the beach with fresh grilled seafood."
        ],
        "meals": "Breakfast included",
        "transport": "Domestic flight & private transfer included"
      },
      {
        "day": 4,
        "title": "Day 4 — Kilim Geopark Mangrove Safari & Eagle Watching",
        "summary": "Boat cruise through limestone karst mangroves, bat caves, and Brahminy kite feeding.",
        "activities": [
          "Private boat cruise through the UNESCO Kilim Karst Geoforest Park.",
          "Witness Brahminy kites and white-bellied sea eagles swooping down during feeding sessions.",
          "Explore the prehistoric Bat Cave (Gua Kelawar) and floating fish farm restaurant for lunch.",
          "Stop at secluded Andaman beach coves for swimming."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private boat & road transfer"
      },
      {
        "day": 5,
        "title": "Day 5 — Langkawi SkyCab, Curved SkyBridge & Oriental Village",
        "summary": "Ride the steepest cable car in the world and walk across the curved mountain suspension bridge.",
        "activities": [
          "Ride the Langkawi SkyCab up Mount Machinchang for jaw-dropping 360° views stretching to Thailand.",
          "Walk across the iconic 125-meter curved Langkawi SkyBridge suspended 660 meters above sea level.",
          "Explore Oriental Village 3D Art in Paradise interactive gallery and duty-free boutique shopping."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Langkawi Departure / Return Connection",
        "summary": "Leisurely breakfast, checkout, and private transfer to airport for departure.",
        "activities": [
          "Enjoy a final morning swim in the Andaman Sea and a hearty tropical breakfast.",
          "Private transfer to Langkawi Airport for flight connecting to Kuala Lumpur and homebound flight to UAE."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "nepal-himalayan-escapes",
    "title": "Nepal Himalayan Odyssey: Kathmandu Ancient Temples & Pokhara Annapurna Sunrise",
    "destination": "Kathmandu · Swayambhunath · Pokhara · Sarangkot · Phewa Lake · Nagarkot",
    "country": "Nepal",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Adventure",
      "Cultural",
      "Weekend Escape"
    ],
    "priceStatus": "from",
    "priceFrom": 2490,
    "image": "/images/destinations/nepal-machapuchare.jpg",
    "intro": "Stand in awe before the roof of the world: medieval UNESCO heritage squares in Kathmandu, tranquil boat rides on Pokhara's Phewa Lake, and golden Himalayan sunrise over the Annapurna range.",
    "story": "Discover ancient Buddhist stupas spun with prayer wheels in Kathmandu, then travel to the lakeside haven of Pokhara where snow-capped Machapuchare (Fishtail) reflects on calm mountain waters.",
    "highlights": [
      "Kathmandu Durbar Square, Swayambhunath (Monkey Temple) & Boudhanath Stupa",
      "Scenic mountain drive or short flight to Pokhara surrounded by Annapurna peaks",
      "Dawn sunrise over Annapurna & Dhaulagiri peaks from Sarangkot viewpoint",
      "Private wooden boat cruise on tranquil Phewa Lake with Tal Barahi Island Temple",
      "Visit Davis Falls, Gupteshwor Mahadev sacred cave and Peace Pagoda",
      "Sunrise panoramic Himalayan viewpoint stay in Nagarkot overlooking Mount Everest",
      "Authentic Nepalese Thakali dinner with cultural folk dance performance"
    ],
    "route": [
      "Kathmandu",
      "Boudhanath",
      "Pokhara",
      "Sarangkot",
      "Nagarkot",
      "Kathmandu"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "5 nights 4-star boutique heritage and resort accommodations",
      "Daily breakfast & welcome traditional Nepalese dinner",
      "Scenic domestic flight / luxury private vehicle between Kathmandu & Pokhara",
      "Private boat ride on Phewa Lake",
      "All monument, national park, and UNESCO site entrance fees",
      "Private English-speaking certified mountain and cultural tour guide",
      "All airport and sightseeing transfers in private AC 4WD / luxury van"
    ],
    "exclusions": [
      "International flights DXB-KTM round-trip",
      "Nepal tourist visa (obtainable upon arrival)",
      "Optional Everest Mountain Flight excursion",
      "Personal trekking gear and gratuities"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Kathmandu Valley & Thamel Bazaar",
        "summary": "Arrive at Tribhuvan Airport, private transfer to hotel, explore lively Thamel.",
        "activities": [
          "Arrive at Tribhuvan International Airport in Kathmandu (4h direct flight from UAE). Warm garland welcome and transfer to hotel.",
          "Take an evening walking tour of Thamel's vibrant artisan alleys filled with pashminas, singing bowls, and tea shops.",
          "Enjoy an authentic Nepalese welcome feast featuring momos, dal bhat, and live Himalayan flute music."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Kathmandu UNESCO Wonders: Boudhanath & Swayambhunath",
        "summary": "Visit the massive white dome of Boudhanath Stupa and hilltop Monkey Temple.",
        "activities": [
          "Visit Boudhanath Stupa, one of the world's largest spherical stupas, surrounded by Tibetan monasteries and prayer flags.",
          "Explore the hilltop Swayambhunath (Monkey Temple) with sweeping 360° views across Kathmandu Valley.",
          "Tour Patan Durbar Square, famed for intricate Newari stone and wood carvings and Krishna Mandir temple."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Journey to Pokhara & Phewa Lake Sunset",
        "summary": "Scenic journey to lakeside Pokhara, boat ride on Phewa Lake beneath Machapuchare.",
        "activities": [
          "Travel to Pokhara along scenic river valleys and lush terraced hillsides.",
          "Check in to your lakefront resort with views of Machapuchare (Fishtail Mountain).",
          "Board a private wooden boat on Phewa Lake, visiting the island shrine of Tal Barahi at sunset."
        ],
        "meals": "Breakfast included",
        "transport": "Included private scenic transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Sarangkot Annapurna Sunrise & Pokhara Sights",
        "summary": "Golden dawn over Annapurna I & II, Davis Falls, and World Peace Pagoda.",
        "activities": [
          "Early morning drive to Sarangkot hilltop (1,600m) to witness the sunrise turning the Annapurna, Dhaulagiri, and Machapuchare peaks molten gold.",
          "Return to resort for breakfast, followed by visits to subterranean Davis Falls and Gupteshwor Mahadev Cave.",
          "Ascend to the hilltop World Peace Pagoda (Shanti Stupa) overlooking the entire Pokhara valley and mountain lake."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle"
      },
      {
        "day": 5,
        "title": "Day 5 — Return to Kathmandu & Nagarkot Everest View",
        "summary": "Travel to Nagarkot mountain ridge for panoramic sunset views across the Himalayas.",
        "activities": [
          "Return journey to Kathmandu Valley and continue up to the scenic ridge resort of Nagarkot (2,175m).",
          "Watch the evening sunset paint over 8 Himalayan mountain ranges including glimpses of the Mount Everest horizon on clear days.",
          "Special farewell dinner by a warm fireplace."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Nagarkot Sunrise & Flight to UAE",
        "summary": "Final mountain sunrise, Bhaktapur ancient city tour, transfer to airport.",
        "activities": [
          "Watch dawn break across the snow-capped Himalayan peaks directly from your hotel terrace.",
          "En route to the airport, visit UNESCO Bhaktapur Durbar Square (the City of Devotees) with its 55-window palace and Nyatapola pagoda.",
          "Transfer to Kathmandu Airport for your direct flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "china-dynasties-shanghai",
    "title": "China Grandeur: Beijing Great Wall, Forbidden City & Shanghai Bund Skyline",
    "destination": "Beijing · Great Wall (Mutianyu) · Forbidden City · Summer Palace · Shanghai · The Bund",
    "country": "China",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "Cultural",
      "City Escape",
      "Family"
    ],
    "priceStatus": "from",
    "priceFrom": 4950,
    "image": "/images/destinations/china-01.jpg",
    "intro": "Walk along the legendary Great Wall of China, discover imperial imperial dynasties in Beijing's Forbidden City, and witness futuristic neon skylines in Shanghai.",
    "story": "Journey through 5,000 years of civilization: from the crimson gates of the Imperial Palace and imperial Summer Palace lakes in Beijing to a high-speed bullet train ride into the neon futuristic metropolis of Shanghai.",
    "highlights": [
      "Cable car ascent and toboggan descent on the Great Wall at Mutianyu",
      "VIP guided tour through the 9,999-room UNESCO Forbidden City and Tiananmen Square",
      "Boat cruise along the imperial Kunming Lake at the Summer Palace",
      "300km/h high-speed Bullet Train experience from Beijing to Shanghai",
      "Shanghai Bund historic colonial promenade & Pudong skyscraper observation deck",
      "Evening cruise on the Huangpu River beneath illuminated Shanghai neon towers",
      "Traditional Peking Roast Duck banquet dinner in Beijing"
    ],
    "route": [
      "Beijing",
      "Forbidden City",
      "Mutianyu Great Wall",
      "Bullet Train",
      "Shanghai",
      "The Bund"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "6 nights 5-star international hotel accommodation (3N Beijing, 3N Shanghai)",
      "Daily breakfast buffet and authentic Peking Duck culinary experience",
      "First-Class high-speed G-Train ticket Beijing to Shanghai",
      "Great Wall cable car and entry tickets with private guide",
      "Huangpu River evening cruise ticket in Shanghai",
      "All VIP airport, rail station and touring transfers in private luxury van",
      "English-speaking licensed private guide throughout"
    ],
    "exclusions": [
      "International airfare DXB-PEK / SHA-DXB",
      "China visa processing fees (visa-free 144-hour transit may apply for eligible passports)",
      "Personal shopping and optional acrobatics show tickets",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Beijing Capital",
        "summary": "Arrive in Beijing, private transfer to 5★ luxury hotel in Wangfujing.",
        "activities": [
          "Arrive at Beijing Capital (PEK) or Daxing (PKX) Airport. VIP greeting and transfer to your 5-star hotel in central Beijing.",
          "Evening orientation walk along Wangfujing shopping street and pedestrian night market."
        ],
        "meals": "No meals (arrival day)",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Forbidden City, Tiananmen Square & Temple of Heaven",
        "summary": "Step through imperial gates into the Forbidden City and Temple of Heaven.",
        "activities": [
          "Walk across Tiananmen Square and pass through the Meridian Gate into the Forbidden City (Palace Museum).",
          "Explore the Hall of Supreme Harmony and imperial throne rooms with an expert historian guide.",
          "Visit the Temple of Heaven where Ming and Qing emperors prayed for good harvests.",
          "Indulge in a signature Peking Duck dinner at a historic banquet house."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — The Great Wall of China (Mutianyu Section) & Summer Palace",
        "summary": "Stand atop the Great Wall of China with cable car access and visit Summer Palace.",
        "activities": [
          "Drive to the picturesque Mutianyu section of the Great Wall surrounded by pine forests.",
          "Take the cable car up to the watchtowers and walk along the ancient stone battlements.",
          "Afternoon visit to the Summer Palace: stroll the Long Corridor and cruise Kunming Lake."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — High-Speed Bullet Train to Shanghai & The Bund",
        "summary": "Ride the 350 km/h bullet train to Shanghai, evening walk along The Bund.",
        "activities": [
          "Board the high-speed Fuxing Bullet Train from Beijing to Shanghai in First Class comfort (approx. 4.5 hours).",
          "Arrive in Shanghai and check in to your luxury hotel overlooking the Huangpu River.",
          "Evening stroll along the historic 1920s architecture of The Bund admiring the futuristic Pudong skyline across the water."
        ],
        "meals": "Breakfast included",
        "transport": "High-speed train & private transfer included"
      },
      {
        "day": 5,
        "title": "Day 5 — Yu Garden, Shanghai Tower Observation Deck & River Cruise",
        "summary": "Traditional Yu Garden, tallest skyscraper views, and Huangpu river cruise.",
        "activities": [
          "Visit the classical Ming-dynasty Yu Garden and bustling Old Town bazaar.",
          "Ascend the Shanghai Tower to the world's highest indoor observation deck (Level 118) for sweeping views of the city.",
          "Board an evening VIP luxury boat cruise along the Huangpu River as Shanghai's skyline comes alive with light."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 6,
        "title": "Day 6 — French Concession, Nanjing Road & Xintiandi",
        "summary": "Tree-lined French Concession boutiques, Nanjing Road shopping, and fine dining.",
        "activities": [
          "Stroll through the tree-lined avenues of the historic French Concession and artsy Tianzifang alleys.",
          "Shop world brands along pedestrianized East Nanjing Road.",
          "Farewell dinner at trendy Xintiandi combining Shikumen stone architecture with fine international cuisine."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 7,
        "title": "Day 7 — Shanghai Maglev Experience & Flight to UAE",
        "summary": "Checkout, optional 431 km/h Maglev magnetic train ride to Pudong Airport, flight home.",
        "activities": [
          "Enjoy a leisurely breakfast and hotel checkout.",
          "Private transfer or futuristic 431 km/h Maglev train experience to Shanghai Pudong Airport for return flight to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "south-africa-cape-safari",
    "title": "South Africa Panorama: Cape Town Table Mountain, Cape Peninsula & Big-5 Game Safari",
    "destination": "Cape Town · Table Mountain · Cape of Good Hope · Boulders Beach · Garden Route Safari",
    "country": "South Africa",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "Adventure",
      "Luxury",
      "Family"
    ],
    "priceStatus": "from",
    "priceFrom": 5490,
    "image": "/images/destinations/south-africa-02.jpg",
    "intro": "Experience the ultimate African adventure: ascend Table Mountain, visit playful African penguins at Boulders Beach, and track the legendary Big-5 on luxury private game reserve safaris.",
    "story": "From the dramatic Atlantic coastline of Cape Town and Cape Point to open-top 4x4 safari drives in malaria-free private game reserves, discover South Africa's jaw-dropping wildlife and natural wonders.",
    "highlights": [
      "Rotating cable car ticket to the summit of Table Mountain (New 7 Wonders of Nature)",
      "Cape Peninsula drive via Chapman's Peak to the Cape of Good Hope & Cape Point lighthouse",
      "Walk among wild African penguins on the wooden boardwalks of Boulders Beach",
      "2 nights all-inclusive luxury safari lodge stay with morning and afternoon game drives",
      "Track lions, leopards, elephants, rhinos, and buffalo (The Big 5) in open 4WD vehicles",
      "Victoria & Alfred (V&A) Waterfront harbor cruise and gourmet dining",
      "Kirstenbosch National Botanical Garden treetop canopy walkway"
    ],
    "route": [
      "Cape Town",
      "Table Mountain",
      "Cape Point",
      "Boulders Beach",
      "Game Reserve",
      "Cape Town"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "4 nights 5-star hotel in Cape Town (V&A Waterfront) & 2 nights 5-star luxury Safari Game Lodge",
      "Daily breakfast in Cape Town & all meals (breakfast, lunch, dinner) included at safari lodge",
      "Table Mountain cable car tickets & Cape Point funicular passes",
      "4 guided 4x4 open-vehicle game drives with expert ranger and tracker",
      "All conservation and national park conservation entry fees",
      "All private airport, lodge, and sightseeing transfers in luxury AC vehicle",
      "Dedicated 24/7 concierge support"
    ],
    "exclusions": [
      "International flights to/from Cape Town (CPT)",
      "South Africa visa fees (if applicable for passport)",
      "Optional helicopter flights over Cape Town",
      "Gratuities for safari rangers and trackers"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Cape Town & V&A Waterfront",
        "summary": "Arrive at Cape Town International Airport, private transfer to V&A Waterfront hotel.",
        "activities": [
          "Arrive at Cape Town Airport (CPT). Meet your private chauffeur and transfer to your luxury hotel located on the V&A Waterfront.",
          "Afternoon at leisure exploring the vibrant shops, craft sheds, and harbor seals at the Waterfront.",
          "Sunset dinner overlooking the marina with views of Table Mountain."
        ],
        "meals": "No meals (arrival day)",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Table Mountain Cableway & Historic City Tour",
        "summary": "Ascend Table Mountain summit, visit colorful Bo-Kaap and Company's Garden.",
        "activities": [
          "Take the rotating aerial cable car up Table Mountain for panoramic 360° views of the city, ocean, and Twelve Apostles peaks.",
          "Descend to explore the brightly painted houses and spice heritage of Bo-Kaap (Cape Malay quarter).",
          "Walk through the historic Company's Garden and visit Kirstenbosch Botanical Gardens with its famous Boomslang canopy walkway."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Cape Peninsula, Chapman's Peak & Boulders Penguins",
        "summary": "Drive world's most scenic coastal road to Cape Point and visit African penguins.",
        "activities": [
          "Drive along the dramatic cliffs of Chapman's Peak Drive overlooking Hout Bay.",
          "Visit Cape Point and the Cape of Good Hope nature reserve, where the Atlantic and Indian oceans meet.",
          "Walk along the wooden boardwalks of Boulders Beach to see thousands of wild African penguins waddling on white sand."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Transfer to Private Big-5 Safari Lodge & Afternoon Game Drive",
        "summary": "Travel to luxury private game reserve, check in to safari lodge, afternoon game drive.",
        "activities": [
          "Private scenic transfer to a premier 5-star private game reserve lodge.",
          "Arrive in time for a gourmet bush lunch on the deck overlooking an active watering hole.",
          "Embark on your first open-top 4x4 afternoon game drive with an armed ranger and tracker to find elephants, lions, and giraffes.",
          "Bush sundowners at sunset followed by a traditional boma dinner around a roaring campfire."
        ],
        "meals": "Breakfast, lunch & dinner included",
        "transport": "Included private transport & 4x4 safari"
      },
      {
        "day": 5,
        "title": "Day 5 — Dawn & Twilight Big-5 Game Drives",
        "summary": "Sunrise safari drive, relaxing midday pool time, and afternoon predator tracking.",
        "activities": [
          "Early morning tea/coffee before departing on a sunrise game drive as nocturnal predators are active and plains game graze.",
          "Return to the lodge for a lavish full breakfast buffet and leisurely afternoon at the pool/spa.",
          "Late afternoon game drive tracking rhinos, cheetahs, and buffalo, stopping for scenic sunset drinks in the bush.",
          "Gourmet 4-course dinner under the southern stars."
        ],
        "meals": "Breakfast, lunch & dinner included",
        "transport": "Included 4x4 safari vehicle"
      },
      {
        "day": 6,
        "title": "Day 6 — Morning Bush Safari & Return to Cape Town",
        "summary": "Final morning game drive, scenic transfer back to Cape Town for leisure evening.",
        "activities": [
          "Final dawn game drive for last-chance wildlife sightings and birdwatching.",
          "Hearty breakfast, checkout, and private transfer back to Cape Town.",
          "Evening at leisure for fine dining or shopping at Canal Walk and Waterfront."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transfer"
      },
      {
        "day": 7,
        "title": "Day 7 — Departure from Cape Town to UAE",
        "summary": "Breakfast, checkout, and private transfer to Cape Town Airport for flight home.",
        "activities": [
          "Enjoy a relaxed morning breakfast overlooking Table Bay.",
          "Private Mercedes transfer to Cape Town International Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "brazil-rio-iguazu-wonders",
    "title": "Brazil Vibrance: Rio Christ the Redeemer, Copacabana & Iguazu Giant Falls",
    "destination": "Rio de Janeiro · Corcovado · Sugarloaf Mountain · Copacabana · Iguazu Falls",
    "country": "Brazil",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "Adventure",
      "Beach",
      "Cultural",
      "Luxury"
    ],
    "priceStatus": "from",
    "priceFrom": 6990,
    "image": "/images/destinations/brazil-christ-redeemer.jpg",
    "intro": "Experience the vibrant samba rhythm of Rio de Janeiro, stand at the feet of Christ the Redeemer on Corcovado, and feel the thundering mist of Iguazu Falls.",
    "story": "Soak in the sun on famous Copacabana and Ipanema beaches, ride cable cars up Sugarloaf Mountain, and fly to the tropical rainforest border to witness Iguazu Falls — the world's most immense waterfall system.",
    "highlights": [
      "Cogwheel train ride through Tijuca Forest to Christ the Redeemer atop Corcovado",
      "Two-stage glass cable car ascent up Sugarloaf Mountain at sunset",
      "Stroll along the world-famous mosaic promenades of Copacabana and Ipanema",
      "Fly to Foz do Iguaçu to explore the Brazilian and Argentine sides of Iguazu Falls",
      "Walk the boardwalk into the jaw-dropping Devil's Throat (Garganta del Diablo)",
      "Optional Macuco Safari zodiac boat ride directly beneath thundering waterfall cascades",
      "Traditional Brazilian Rodizio Churrascaria barbecue dinner experience"
    ],
    "route": [
      "Rio de Janeiro",
      "Corcovado",
      "Sugarloaf",
      "Copacabana",
      "Iguazu Falls",
      "Rio de Janeiro"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "4 nights 5-star oceanfront hotel in Rio (Copacabana) & 2 nights 5-star resort in Iguazu Falls",
      "Daily Brazilian buffet breakfast & authentic Churrascaria dinner",
      "Domestic flights Rio de Janeiro - Iguazu Falls round-trip with luggage",
      "Corcovado cogwheel train & Sugarloaf cable car entry passes",
      "Iguazu National Park entrance fees and guided waterfall walks",
      "All private airport, hotel, and sightseeing transfers in luxury AC vehicles",
      "Bilingual English/Portuguese certified tour guide"
    ],
    "exclusions": [
      "International flights to/from Rio de Janeiro DXB/AUH",
      "Brazil visa fees (if applicable for passport)",
      "Optional helicopter flight over Iguazu Falls or Rio",
      "Personal travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Marvelous Rio de Janeiro",
        "summary": "Arrive at Galeão Airport, private transfer to Copacabana beachfront hotel.",
        "activities": [
          "Arrive at Rio de Janeiro International Airport (GIG). Warm greeting by your private guide and transfer to your 5-star beachfront hotel in Copacabana.",
          "Check in, relax, and take a sunset stroll along the famous black-and-white wave patterned promenade.",
          "Enjoy coconut water and Brazilian caipirinhas/mocktails by the beach."
        ],
        "meals": "No meals (arrival day)",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Christ the Redeemer on Corcovado & Tijuca National Park",
        "summary": "Cogwheel train to Christ the Redeemer, Selarón Steps, and Santa Teresa.",
        "activities": [
          "Board the historic Corcovado Cogwheel Train climbing through the lush Tijuca Atlantic Rainforest to the peak of Corcovado Mountain (710m).",
          "Stand before the iconic 38-meter statue of Christ the Redeemer with breathtaking views over Guanabara Bay.",
          "Visit the bohemian neighborhood of Santa Teresa and walk down the colorful tiled Escadaria Selarón (Selarón Steps).",
          "Evening feast at a top Brazilian Churrascaria steakhouse with endless cuts of grilled meat and gourmet salads."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Sugarloaf Mountain Cable Car & Ipanema Beach",
        "summary": "Cable car up Sugarloaf Mountain, Maracanã Stadium photo stop, Ipanema sunset.",
        "activities": [
          "Ride the two-stage glass-walled cable cars up to Morro da Urca and the summit of Sugarloaf Mountain (Pão de Açúcar).",
          "Admire spectacular 360° panoramas of Rio's beaches, mountains, and harbor.",
          "Afternoon at leisure on trendy Ipanema Beach or shopping for Brazilian gemstones in Leblon."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Flight to Iguazu Falls & Brazilian Panoramic Boardwalk",
        "summary": "Fly to Foz do Iguaçu, walk the panoramic Brazilian falls walkway.",
        "activities": [
          "Private transfer to airport and flight to Foz do Iguaçu.",
          "Check in to your luxury rainforest resort near the national park.",
          "Walk the Brazilian side walkways offering sweeping panoramic vistas of 275 individual waterfalls crashing into the canyon.",
          "Walk right out onto the catwalk above the spray of the Floriano and Devil's Throat falls."
        ],
        "meals": "Breakfast included",
        "transport": "Domestic flight & private transfer included"
      },
      {
        "day": 5,
        "title": "Day 5 — Full Day Argentine Side of Iguazu & Devil's Throat",
        "summary": "Cross to Argentine side, ride eco-train, and walk right above Devil's Throat.",
        "activities": [
          "Cross the border for an immersive full-day tour of the Argentine side of Iguazu National Park.",
          "Ride the ecological jungle train to the Upper and Lower circuits, walking through subtropical rainforest filled with toucans and coatis.",
          "Stand on the viewing balcony directly over the mighty Devil's Throat (Garganta del Diablo), feeling the thunderous roar of millions of liters of water per second."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private cross-border transport"
      },
      {
        "day": 6,
        "title": "Day 6 — Parque das Aves Bird Park & Return Flight to Rio",
        "summary": "Walk-in tropical aviaries with toucans and macaws, fly back to Rio.",
        "activities": [
          "Visit the world-renowned Parque das Aves bird sanctuary to walk inside massive aviaries with scarlet macaws, flamingos, and toucans.",
          "Afternoon flight back to Rio de Janeiro.",
          "Enjoy a farewell dinner in Rio's upscale Leblon dining district."
        ],
        "meals": "Breakfast included",
        "transport": "Domestic flight & private transfer included"
      },
      {
        "day": 7,
        "title": "Day 7 — Departure from Rio de Janeiro to UAE",
        "summary": "Last morning beach walk, hotel checkout, and VIP airport transfer.",
        "activities": [
          "Leisurely morning for beachside relaxation and tropical fruit breakfast.",
          "Private transfer to Rio de Janeiro Airport for your return international flight to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "argentina-buenos-aires-patagonia",
    "title": "Argentina Splendour: Buenos Aires Tango, Patagonia Glaciers & Iguazu Falls",
    "destination": "Buenos Aires · La Boca · San Telmo · El Calafate · Perito Moreno Glacier · Iguazu",
    "country": "Argentina",
    "region": "International",
    "days": 8,
    "nights": 7,
    "styles": [
      "Cultural",
      "Adventure",
      "Luxury"
    ],
    "priceStatus": "from",
    "priceFrom": 7490,
    "image": "/images/destinations/argentina-perito-moreno.jpg",
    "intro": "The Paris of South America meets wild Patagonia: passionate tango in Buenos Aires, calving icebergs at Perito Moreno Glacier, and the majesty of Iguazu Waterfalls.",
    "story": "Explore European boulevards and colorful La Boca in Buenos Aires, journey deep into the Patagonian wilderness to walk in front of massive blue ice walls, and experience the thundering spray of Iguazu.",
    "highlights": [
      "VIP Tango show and 3-course Argentine steak & Malbec wine dinner in historic San Telmo",
      "Guided tour of colorful Caminito in La Boca, Plaza de Mayo & Recoleta Cemetery",
      "Full-day excursion to UNESCO Perito Moreno Glacier with catwalks and boat safari",
      "Listen to the thunderous cracking and calving of massive Patagonian ice walls",
      "Fly to Puerto Iguazú for full-day guided tours of the world's widest waterfall network",
      "Walk the catwalk above the mighty Devil's Throat gorge",
      "Luxury 5-star boutique hotels throughout Buenos Aires, Patagonia, and Iguazu"
    ],
    "route": [
      "Buenos Aires",
      "La Boca",
      "El Calafate",
      "Perito Moreno Glacier",
      "Iguazu Falls",
      "Buenos Aires"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "3 nights 5-star hotel in Buenos Aires, 2 nights luxury boutique lodge in El Calafate, 2 nights resort in Iguazu",
      "Daily breakfast buffet & VIP Tango dinner show",
      "All internal domestic flights (Buenos Aires - El Calafate - Iguazu - Buenos Aires) with checked bags",
      "Perito Moreno Glacier catwalk access & Safari Náutico boat tour",
      "All national park conservation passes and entrance tickets",
      "All private transfers and guided excursions in luxury AC Mercedes vehicles",
      "Expert English-speaking private guides throughout"
    ],
    "exclusions": [
      "International flights to/from Buenos Aires (EZE)",
      "Argentina visa fees (if applicable)",
      "Optional glacier mini-trekking ice crampon tour",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Buenos Aires 'Paris of the South'",
        "summary": "Arrive at Ezeiza Airport, private transfer to luxury hotel in Recoleta.",
        "activities": [
          "Arrive at Ezeiza International Airport (EZE). Meet your private driver and transfer to your 5-star hotel in the refined Recoleta district.",
          "Afternoon walking tour around Recoleta, visiting the famous cemetery (resting place of Eva Perón) and French-style boulevards.",
          "Evening welcome dinner at a renowned Argentine Parrilla (steakhouse)."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Buenos Aires City Discovery & Evening Tango Show",
        "summary": "Plaza de Mayo, colorful La Boca, San Telmo, and VIP Tango dinner show.",
        "activities": [
          "Visit Plaza de Mayo, the Casa Rosada (Presidential Palace), and the Metropolitan Cathedral.",
          "Explore the vibrant cobalt and yellow painted tin houses of Caminito in La Boca.",
          "Browse artisan antique stalls in cobblestoned San Telmo.",
          "Evening VIP Tango Show with live orchestra, world-champion dancers, and gourmet dinner."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Flight to Patagonia (El Calafate) & Lake Argentino",
        "summary": "Fly to El Calafate in southern Patagonia, check in to lakeview lodge.",
        "activities": [
          "Transfer to airport for flight south to El Calafate in Santa Cruz, Patagonia.",
          "Check in to your luxury boutique hotel overlooking Lake Argentino.",
          "Visit the Glaciarium Ice Museum to learn about Patagonian ice fields, with a drink in the subterranean Ice Bar."
        ],
        "meals": "Breakfast included",
        "transport": "Domestic flight & private transfer included"
      },
      {
        "day": 4,
        "title": "Day 4 — Perito Moreno Glacier Catwalks & Boat Safari",
        "summary": "Full day at UNESCO Perito Moreno Glacier, boat cruise along 60m ice walls.",
        "activities": [
          "Full-day excursion to Los Glaciares National Park to witness the colossal Perito Moreno Glacier.",
          "Walk along multi-tiered wooden viewing walkways providing breathtaking close-up angles of the 60-meter-high ice face.",
          "Board the Safari Náutico boat cruise to sail right along the southern wall of the glacier, watching massive blocks of ice crash into the lake."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private transport & boat tour"
      },
      {
        "day": 5,
        "title": "Day 5 — Flight from Patagonia to Iguazu Tropical Rainforest",
        "summary": "Fly to subtropical Puerto Iguazú, relax in rainforest eco-resort.",
        "activities": [
          "Morning transfer to El Calafate Airport for flight to Puerto Iguazú via Buenos Aires.",
          "Arrive in the lush subtropical rainforest and check in to your 5-star eco-resort.",
          "Evening at leisure listening to the sounds of the jungle around the pool."
        ],
        "meals": "Breakfast included",
        "transport": "Domestic flights & private transfer included"
      },
      {
        "day": 6,
        "title": "Day 6 — Full Day Argentine Iguazu Falls & Devil's Throat",
        "summary": "Upper and Lower waterfall circuits, Ecological Jungle Train, and Devil's Throat.",
        "activities": [
          "Full-day guided exploration of the Argentine side of Iguazu National Park.",
          "Ride the open-air Ecological Train through the rainforest to the Devil's Throat station.",
          "Walk across the 1.1km footbridge over the river to the edge of Garganta del Diablo to watch the thunderous abyss of water.",
          "Explore the Upper and Lower circuits with spectacular viewpoints of Bossetti, San Martin, and Two Sisters falls."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private transport with guide"
      },
      {
        "day": 7,
        "title": "Day 7 — Brazilian Side Panoramic Tour & Return to Buenos Aires",
        "summary": "Panoramic Brazilian waterfall views, flight back to Buenos Aires.",
        "activities": [
          "Morning half-day tour of the Brazilian side of the falls for the ultimate wide-angle postcard panorama.",
          "Afternoon flight back to Buenos Aires.",
          "Farewell dinner in trendy Puerto Madero overlooking the illuminated docks and Puente de la Mujer."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Domestic flight & private transfer included"
      },
      {
        "day": 8,
        "title": "Day 8 — Departure from Buenos Aires to UAE",
        "summary": "Free morning for leather goods and alfajores shopping, private airport transfer.",
        "activities": [
          "Leisurely morning for shopping in Palermo Soho or visiting Galerías Pacífico.",
          "Private Mercedes transfer to Ezeiza International Airport for your return flight to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "usa-new-york-east-coast",
    "title": "USA East Coast Icons: New York Manhattan Skyline, Central Park & Niagara Falls",
    "destination": "New York City · Times Square · Empire State · Statue of Liberty · Central Park · Niagara Falls",
    "country": "United States of America",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "City Escape",
      "Shopping",
      "Family"
    ],
    "priceStatus": "from",
    "priceFrom": 6450,
    "image": "/images/destinations/united-states-01.jpg",
    "intro": "The definitive American dream holiday: dazzling neon in Times Square, Empire State Building views, Statue of Liberty cruise, Central Park, and the roaring power of Niagara Falls.",
    "story": "Experience the pulse of New York City from luxury Manhattan hotels, cruise past Lady Liberty, stroll Fifth Avenue, and take a quick flight or scenic express to the wonder of Niagara Falls with the Maid of the Mist boat tour.",
    "highlights": [
      "VIP skip-the-line tickets to the 86th & 102nd floor Empire State Building Observatory",
      "Express ferry cruise to Liberty Island (Statue of Liberty) and Ellis Island",
      "Guided walking tour of Central Park, Strawberry Fields & Bethesda Terrace",
      "Times Square, Broadway theater district & Rockefeller Center Top of the Rock",
      "Day excursion to Niagara Falls with the world-famous Maid of the Mist boat tour",
      "Walk along Fifth Avenue luxury shopping and Soho boutique districts",
      "High Line elevated park walk and Hudson Yards Vessel photo stop"
    ],
    "route": [
      "New York City",
      "Manhattan",
      "Statue of Liberty",
      "Niagara Falls",
      "New York City"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "6 nights 4/5-star accommodation in central Manhattan (Midtown/Times Square)",
      "Daily American breakfast buffet",
      "Round-trip flight/express transport for Niagara Falls day excursion",
      "Empire State Building 86th Floor Observatory ticket",
      "Statue of Liberty & Ellis Island ferry ticket",
      "Maid of the Mist boat tour ticket at Niagara Falls",
      "All private airport and touring transfers in luxury AC SUVs/sprinters",
      "English-speaking professional NYC guide"
    ],
    "exclusions": [
      "International flights DXB-JFK / EWR round-trip",
      "US ESTA / B1/B2 tourist visa application fees",
      "Optional Broadway theater show tickets",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in New York City & Times Square",
        "summary": "Arrive at JFK/Newark Airport, private limousine/SUV transfer to Manhattan hotel.",
        "activities": [
          "Arrive at JFK or Newark Airport from Dubai. Meet your private chauffeur for transfer into Midtown Manhattan.",
          "Check into your hotel steps away from Times Square and Fifth Avenue.",
          "Evening walk under the dazzling neon billboards of Times Square and Broadway."
        ],
        "meals": "No meals (arrival day)",
        "transport": "Included private luxury airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Statue of Liberty, Wall Street & 9/11 Memorial",
        "summary": "Ferry to Lady Liberty, Financial District, and World Trade Center.",
        "activities": [
          "Take the morning ferry from Battery Park to Liberty Island for up-close views of the Statue of Liberty.",
          "Visit Ellis Island National Museum of Immigration.",
          "Tour the Financial District: Wall Street, the Charging Bull statue, and the Trinity Church.",
          "Visit the 9/11 Memorial reflection pools and the One World Trade Center Oculus."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport & ferry"
      },
      {
        "day": 3,
        "title": "Day 3 — Central Park, Museum Mile & Empire State Building",
        "summary": "Stroll Central Park, visit Fifth Avenue, and ascend Empire State Building at night.",
        "activities": [
          "Guided morning walking tour of Central Park: Bethesda Fountain, Bow Bridge, and Strawberry Fields.",
          "Stroll down Fifth Avenue past St. Patrick's Cathedral and luxury boutiques.",
          "Ascend to the 86th-floor open-air observatory of the Empire State Building for breathtaking nighttime views of the illuminated Manhattan grid."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Niagara Falls Day Excursion & Maid of the Mist",
        "summary": "Day trip to Niagara Falls, Maid of the Mist boat ride right into Horseshoe Falls spray.",
        "activities": [
          "Early morning departure for your Niagara Falls adventure.",
          "Board the legendary Maid of the Mist boat tour (poncho provided!) right into the heart of the roaring Horseshoe Falls.",
          "Walk along the Cave of the Winds wooden boardwalks feeling the Hurricane Deck mist.",
          "Return to New York City in the evening."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Round-trip excursion transport included"
      },
      {
        "day": 5,
        "title": "Day 5 — High Line, Chelsea Market, Soho & Brooklyn Bridge",
        "summary": "Walk the elevated High Line park, food tasting in Chelsea, and sunset on Brooklyn Bridge.",
        "activities": [
          "Walk the High Line elevated railway park from Hudson Yards to the Meatpacking District.",
          "Gourmet lunch stop inside vibrant Chelsea Market.",
          "Afternoon browsing the cast-iron architecture and designer boutiques of Soho and Greenwich Village.",
          "Sunset walk across the iconic wooden planks of the Brooklyn Bridge with skyline views."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 6,
        "title": "Day 6 — Rockefeller Center, Summit One Vanderbilt & Broadway",
        "summary": "Summit One Vanderbilt immersive mirrors, shopping, and optional evening Broadway show.",
        "activities": [
          "Visit Summit One Vanderbilt for mind-bending mirrored multi-sensory views over Midtown.",
          "Free afternoon for shopping at Macy's Herald Square or Bloomingdale's.",
          "Farewell dinner at a classic New York steakhouse, followed by an optional Broadway musical show."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 7,
        "title": "Day 7 — Departure from New York to UAE",
        "summary": "Morning at leisure, hotel checkout, and private airport transfer.",
        "activities": [
          "Enjoy a classic New York bagel breakfast and morning coffee in Bryant Park.",
          "Private luxury SUV transfer to JFK Airport for your direct flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "serbia-belgrade-balkan-gem",
    "title": "Serbia Balkan Heritage: Belgrade Fortress, Danube River & Novi Sad Petrovaradin",
    "destination": "Belgrade · Kalemegdan Fortress · Knez Mihailova · Saint Sava · Novi Sad · Danube Cruise",
    "country": "Serbia",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": [
      "Cultural",
      "Weekend Escape",
      "City Escape"
    ],
    "priceStatus": "from",
    "priceFrom": 1990,
    "image": "/images/destinations/serbia-kalemegdan.jpg",
    "intro": "Just 5 hours direct from Dubai: explore the majestic Kalemegdan Fortress overlooking the confluence of the Danube and Sava rivers, grand Orthodox temples, and vibrant café culture.",
    "story": "Discover the crossroads of Central Europe and the Balkans in Belgrade: from the colossal Church of Saint Sava and bohemian Skadarlija cobblestone alleys to the Austro-Hungarian fortresses of Novi Sad.",
    "highlights": [
      "Guided tour of Belgrade Fortress (Kalemegdan) overlooking the Danube & Sava confluence",
      "Visit the Church of Saint Sava, one of the world's largest Orthodox churches with gold mosaics",
      "Stroll lively pedestrian Knez Mihailova Street and bohemian Skadarlija quarter",
      "Full-day excursion to Novi Sad and the formidable Petrovaradin Fortress (Gibraltar on the Danube)",
      "Traditional Serbian wine tasting and lunch in historic Sremski Karlovci",
      "Scenic sunset river cruise on the Danube and Sava rivers",
      "Easy online visa / visa-free access for many UAE resident passport categories"
    ],
    "route": [
      "Belgrade",
      "Kalemegdan",
      "Saint Sava",
      "Novi Sad",
      "Petrovaradin",
      "Belgrade"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "4 nights 4/5-star central hotel in Belgrade with daily breakfast buffet",
      "Full-day guided excursion to Novi Sad & Sremski Karlovci with wine tasting",
      "Belgrade Danube & Sava sunset river cruise",
      "Traditional Serbian dinner with live Balkan tamburica music in Skadarlija",
      "All monument entrance fees and museum passes",
      "All private airport, hotel, and sightseeing transfers in AC Mercedes van",
      "English-speaking professional licensed Serbian guide"
    ],
    "exclusions": [
      "International airfare DXB-BEG round-trip",
      "Serbia visa processing fees (if applicable)",
      "Personal expenses and gratuities",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Direct Flight from Dubai to Belgrade & Knez Mihailova",
        "summary": "Arrive at Nikola Tesla Airport, private transfer to 5★ hotel, orientation walk.",
        "activities": [
          "Direct 5-hour flight from Dubai DXB to Belgrade Nikola Tesla Airport (BEG). VIP meet-and-greet and private transfer to your central 5-star hotel.",
          "Check in and take an orientation walk down pedestrian Knez Mihailova Street, lined with cafés, bookstores, and historic 19th-century facades.",
          "Evening welcome dinner at a traditional tavern in the cobblestoned Skadarlija bohemian district with live folk music."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Belgrade Fortress, Saint Sava & Rivers Confluence",
        "summary": "Kalemegdan fortress panoramic views, Saint Sava golden crypt, and Danube cruise.",
        "activities": [
          "Explore the sprawling Kalemegdan Fortress perched on a 125-meter-high cliff where the Sava and Danube rivers meet.",
          "Visit the monumental Church of Saint Sava, admiring its massive dome and 15,000 square meters of gold mosaics in the crypt.",
          "Afternoon relaxing at Ada Ciganlija lake promenade.",
          "Sunset boat cruise along the Danube and Sava rivers with views of Great War Island."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport & boat cruise"
      },
      {
        "day": 3,
        "title": "Day 3 — Day Excursion to Novi Sad & Petrovaradin Fortress",
        "summary": "Austro-Hungarian charm in Novi Sad, Gibraltar on the Danube, and Sremski Karlovci wine.",
        "activities": [
          "Scenic 1-hour drive north through the Vojvodina plains to the Baroque town of Sremski Karlovci for Bermet wine tasting.",
          "Visit the imposing Petrovaradin Fortress overlooking the Danube, famed for its reversed-hand clock tower and underground tunnels.",
          "Stroll through the colorful pedestrian streets and Liberty Square of Novi Sad, the European Capital of Culture."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private transport with guide"
      },
      {
        "day": 4,
        "title": "Day 4 — Royal Palaces, Zemun & Danube Waterfront",
        "summary": "Explore historic Zemun, Gardoš Tower views, and riverside dining.",
        "activities": [
          "Visit the picturesque old town of Zemun on the Danube with its narrow streets and Habsburg architecture.",
          "Climb the Millennium Tower on Gardoš Hill for sweeping views across the red roofs and river.",
          "Enjoy a leisurely afternoon at Galerija Shopping Mall (largest in Southeast Europe) on Belgrade Waterfront.",
          "Farewell dinner on a floating splav restaurant on the Danube."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Departure from Belgrade to UAE",
        "summary": "Morning souvenir shopping, hotel checkout, and private airport transfer.",
        "activities": [
          "Leisurely breakfast and time for last-minute shopping for Serbian honey, artisan ceramics, and delicacies.",
          "Private Mercedes transfer to Nikola Tesla Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "spain-barcelona-madrid-andalusia",
    "title": "Spain Splendours: Barcelona Sagrada Familia, Madrid Royal Palace & Seville Flamenco",
    "destination": "Barcelona · Sagrada Família · Park Güell · Madrid · Royal Palace · Seville",
    "country": "Spain",
    "region": "International",
    "days": 7,
    "nights": 6,
    "styles": [
      "Cultural",
      "City Escape",
      "Family"
    ],
    "priceStatus": "from",
    "priceFrom": 4890,
    "image": "/images/destinations/spain-sagrada-familia.jpg",
    "intro": "Experience the passion of Spain: Antoni Gaudí's breathtaking Sagrada Família in Barcelona, the regal grandeur of Madrid's Royal Palace, and passionate flamenco in Seville.",
    "story": "From the sunny Mediterranean beaches and Gothic Quarter of Barcelona to high-speed rail travel across the plains into imperial Madrid and historic Andalusia.",
    "highlights": [
      "Fast-track skip-the-line tickets to Basílica de la Sagrada Família",
      "Guided stroll through Gaudí's whimsical Park Güell and Casa Batlló",
      "VIP tour of Madrid's 3,000-room Royal Palace and Prado Museum masterpieces",
      "High-speed AVE bullet train between Barcelona, Madrid and Seville",
      "Authentic Andalusian Flamenco show in historic Seville with tapas dinner",
      "Stroll the monumental Plaza de España and Real Alcázar in Seville",
      "5-star central boutique hotel stays with daily Spanish buffet breakfast"
    ],
    "route": [
      "Barcelona",
      "Park Güell",
      "Madrid",
      "Prado",
      "Seville",
      "Barcelona"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "6 nights 4/5-star central hotel accommodation (3N Barcelona, 2N Madrid, 1N Seville)",
      "Daily breakfast buffet & authentic Spanish Tapas welcome dinner",
      "High-speed AVE train tickets Barcelona - Madrid - Seville",
      "Sagrada Família and Park Güell entry tickets with audio guide",
      "All private airport, train station and sightseeing transfers in luxury AC vehicles",
      "Dedicated 24/7 concierge support"
    ],
    "exclusions": [
      "International flights to/from Barcelona DXB/AUH",
      "Schengen visa processing fees",
      "City tourist taxes paid at hotels",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Vibrant Barcelona & Las Ramblas",
        "summary": "Arrive at El Prat Airport, private transfer to 5★ central hotel, Gothic Quarter walk.",
        "activities": [
          "Arrive at Barcelona El Prat Airport (BCN). Meet your private driver and transfer to your luxury hotel near Plaça de Catalunya.",
          "Stroll down famous Las Ramblas and browse fresh fruits and jamón at the vibrant Mercat de la Boqueria.",
          "Evening welcome dinner in the medieval Gothic Quarter with traditional paella and tapas."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Gaudí Masterpieces: Sagrada Família & Park Güell",
        "summary": "Step inside Sagrada Família stone forest of light, and explore Park Güell mosaics.",
        "activities": [
          "Visit Antoni Gaudí's magnum opus, the Basílica de la Sagrada Família, admiring its soaring tree-like columns and stained-glass spectrum.",
          "Explore the colorful mosaic lizards and curved benches of Park Güell overlooking Barcelona city and the Mediterranean Sea.",
          "Pass by Casa Batlló and Casa Milà (La Pedrera) on elegant Passeig de Gràcia."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — High-Speed AVE Train to Royal Madrid & Gran Vía",
        "summary": "Ride the 300km/h AVE bullet train to Madrid, check in, explore Gran Vía and Puerta del Sol.",
        "activities": [
          "Board the high-speed AVE train to Madrid Atocha Station in under 2.5 hours.",
          "Check in to your luxury hotel near Gran Vía.",
          "Stroll through bustling Puerta del Sol, Plaza Mayor, and visit the historic San Miguel gourmet market."
        ],
        "meals": "Breakfast included",
        "transport": "High-speed train & private transfers included"
      },
      {
        "day": 4,
        "title": "Day 4 — Madrid Royal Palace & World-Famous Prado Museum",
        "summary": "Tour the opulent Royal Palace of Madrid and masterworks in the Prado Museum.",
        "activities": [
          "Guided tour of the Royal Palace of Madrid (Palacio Real), exploring the Throne Room, Royal Armoury, and Sabatini Gardens.",
          "Visit the Prado Museum to see legendary masterpieces by Velázquez, Goya, and El Greco.",
          "Afternoon relaxing boat ride or stroll in El Retiro Park's Crystal Palace."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — AVE Train to Seville & Authentic Flamenco Show",
        "summary": "Travel to Andalusian Seville, visit Plaza de España, evening passionate flamenco.",
        "activities": [
          "Morning AVE train journey south into Andalusia to sun-drenched Seville.",
          "Marvel at the grand semi-circular Plaza de España and Maria Luisa Park.",
          "Walk through the whitewashed alleys of the historic Barrio Santa Cruz.",
          "Evening VIP Flamenco performance at a historic tablao with dinner."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "High-speed train & private transfer included"
      },
      {
        "day": 6,
        "title": "Day 6 — Seville Royal Alcázar & Return to Barcelona",
        "summary": "Moorish arches at Real Alcázar, Seville Cathedral, evening AVE train back.",
        "activities": [
          "Tour the UNESCO Real Alcázar palace with its intricate Moorish tiles and lush orange courtyards.",
          "View the Gothic Seville Cathedral and climb the Giralda bell tower for sweeping city views.",
          "Afternoon return AVE train back to Barcelona for your final evening."
        ],
        "meals": "Breakfast included",
        "transport": "Train & private transfers included"
      },
      {
        "day": 7,
        "title": "Day 7 — Departure from Barcelona to UAE",
        "summary": "Breakfast, beach walk or shopping, private transfer to El Prat Airport.",
        "activities": [
          "Leisurely breakfast and time for last-minute shopping along Passeig de Gràcia.",
          "Private Mercedes transfer to Barcelona Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "germany-bavaria-castles-berlin",
    "title": "Germany Fairytale: Bavarian Alps, Neuschwanstein Castle & Berlin Heritage",
    "destination": "Munich · Neuschwanstein Castle · Bavarian Alps · Berlin · Brandenburg Gate",
    "country": "Germany",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Cultural",
      "Adventure",
      "City Escape"
    ],
    "priceStatus": "from",
    "priceFrom": 4990,
    "image": "/images/destinations/germany-neuschwanstein.jpg",
    "intro": "Step into a real-life fairytale: King Ludwig's majestic Neuschwanstein Castle in the Bavarian Alps, Munich's historic Marienplatz, and the iconic landmarks of Berlin.",
    "story": "Explore Bavaria's alpine lakes, tour world-famous BMW Welt in Munich, take an ICE high-speed train to Berlin, and walk through the historic Brandenburg Gate.",
    "highlights": [
      "Guided tour inside Neuschwanstein Fairytale Castle in the Bavarian Alps",
      "Panoramic views from Marienbrücke suspension bridge over Pöllat Gorge",
      "Munich Marienplatz Glockenspiel and historic Nymphenburg Palace",
      "First-Class ICE high-speed train from Munich to Berlin",
      "Berlin historic tour: Brandenburg Gate, Reichstag Dome & Checkpoint Charlie",
      "Cruise on the Spree River past Museum Island",
      "5-star hotel accommodations with daily German breakfast buffet"
    ],
    "route": [
      "Munich",
      "Neuschwanstein",
      "Bavaria",
      "ICE Train",
      "Berlin"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "3 nights in Munich & 2 nights in Berlin at 4/5-star central hotels",
      "Daily German buffet breakfast & Bavarian welcome dinner",
      "First-Class ICE high-speed train ticket Munich - Berlin",
      "Neuschwanstein Castle entry and shuttle bus tickets",
      "All private airport, train station and excursion transfers in luxury Mercedes van",
      "English-speaking licensed professional guide throughout"
    ],
    "exclusions": [
      "International airfare DXB-MUC / BER-DXB",
      "Schengen visa fees",
      "Personal shopping and gratuities",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Munich & Marienplatz",
        "summary": "Arrive at Munich Airport, private transfer to hotel, explore Old Town.",
        "activities": [
          "Arrive at Munich Franz Josef Strauss Airport (MUC). VIP pickup and transfer to your 5-star hotel in central Munich.",
          "Walk through Karlsplatz (Stachus) to Marienplatz and watch the famous mechanical Glockenspiel clock dance.",
          "Welcome dinner featuring Bavarian roast specialities."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Day Excursion to Neuschwanstein Fairytale Castle",
        "summary": "Full day tour to Bavarian Alps and fairytale Neuschwanstein Castle.",
        "activities": [
          "Scenic morning drive through the Bavarian Alps to the village of Hohenschwangau.",
          "Ascend to Neuschwanstein Castle, King Ludwig II's 19th-century Romanesque masterpiece that inspired Disney's Cinderella castle.",
          "Walk onto the Marienbrücke bridge suspended over the gorge for unforgettable photos.",
          "Stop at the serene waters of Lake Alpsee before returning to Munich."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Munich BMW Welt, Nymphenburg Palace & English Garden",
        "summary": "BMW Welt showcase, Nymphenburg Baroque palace, and English Garden.",
        "activities": [
          "Visit BMW Welt and Museum exploring cutting-edge German automotive engineering.",
          "Tour the opulent Baroque halls and sprawling canal gardens of Nymphenburg Palace.",
          "Stroll through the English Garden and watch river surfers on the Eisbach wave."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — High-Speed ICE Train to Berlin & Brandenburg Gate",
        "summary": "300km/h ICE train to Berlin, Brandenburg Gate sunset, Unter den Linden.",
        "activities": [
          "Board the sleek German ICE bullet train slicing north through Thuringia to Berlin Hauptbahnhof (approx. 4 hours).",
          "Check in to your luxury hotel near Potsdamer Platz.",
          "Walk through the neoclassical Brandenburg Gate and down grand Unter den Linden boulevard.",
          "View the glass dome of the Reichstag building at sunset."
        ],
        "meals": "Breakfast included",
        "transport": "ICE train & private transfers included"
      },
      {
        "day": 5,
        "title": "Day 5 — Berlin Wall Memorial, Museum Island & Spree Cruise",
        "summary": "East Side Gallery open-air wall art, Museum Island, and Spree river boat tour.",
        "activities": [
          "Visit the East Side Gallery, a preserved 1.3km section of the Berlin Wall painted with historic murals.",
          "Explore Checkpoint Charlie museum and the poignant Holocaust Memorial.",
          "Take a scenic boat cruise along the River Spree gliding past the UNESCO Museum Island and Berlin Cathedral."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport & boat tour"
      },
      {
        "day": 6,
        "title": "Day 6 — Departure from Berlin to UAE",
        "summary": "Morning shopping at KaDeWe department store, private transfer to Berlin Airport.",
        "activities": [
          "Enjoy a leisurely breakfast and browse Europe's largest luxury department store, KaDeWe.",
          "Private Mercedes transfer to Berlin Brandenburg Airport (BER) for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "netherlands-amsterdam-tulips-windmills",
    "title": "Netherlands Enchantment: Amsterdam Canals, Keukenhof Tulips & Windmills",
    "destination": "Amsterdam · Canal Ring · Keukenhof · Zaanse Schans · Volendam",
    "country": "Netherlands",
    "region": "International",
    "days": 5,
    "nights": 4,
    "styles": [
      "Family",
      "City Escape",
      "Cultural"
    ],
    "priceStatus": "from",
    "priceFrom": 3890,
    "image": "/images/destinations/netherlands-amsterdam.jpg",
    "intro": "Cruise along UNESCO-listed Amsterdam canal rings, cycle past rainbow tulip fields, and taste artisan gouda cheese beside working 18th-century Dutch windmills.",
    "story": "Explore iconic 17th-century gabled canal houses, experience world-famous art at the Rijksmuseum and Van Gogh Museum, and take scenic day trips to Keukenhof Gardens and seaside Volendam.",
    "highlights": [
      "Private luxury glass-topped boat cruise along Amsterdam's UNESCO Canal Ring",
      "Day excursion to Keukenhof Gardens (spring) or Giethoorn 'Venice of the North'",
      "Visit Zaanse Schans historic windmill village, clog maker, and cheese farm",
      "Skip-the-line access to the Rijksmuseum to see Rembrandt's Night Watch",
      "Stroll through the charming Jordaan boutique and café district",
      "Traditional Dutch pancake and stroopwafel tasting workshop",
      "4/5-star central boutique canal hotel stay"
    ],
    "route": [
      "Amsterdam",
      "Canal Ring",
      "Keukenhof",
      "Zaanse Schans",
      "Volendam",
      "Amsterdam"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "4 nights 4/5-star central hotel accommodation in Amsterdam with canal views",
      "Daily Dutch breakfast buffet",
      "Private 1-hour luxury canal boat cruise with refreshments",
      "Keukenhof Gardens entry tickets and private transportation",
      "Zaanse Schans windmill and cheese farm guided tour",
      "All private airport and sightseeing transfers in luxury AC vehicle",
      "English-speaking private guide"
    ],
    "exclusions": [
      "International flights to/from Amsterdam (AMS)",
      "Schengen visa fees",
      "City tourist taxes",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Amsterdam & Canal Cruise",
        "summary": "Arrive at Schiphol Airport, private transfer to hotel, evening private canal cruise.",
        "activities": [
          "Arrive at Amsterdam Schiphol Airport (AMS). Meet your private chauffeur and transfer to your hotel.",
          "Check in and board an exclusive private glass-roof canal boat to glide through the Herengracht and Prinsengracht canals.",
          "Evening welcome dinner at a historic canal-side restaurant."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer & canal cruise"
      },
      {
        "day": 2,
        "title": "Day 2 — Keukenhof Tulip Gardens & Flower Strip",
        "summary": "Witness 7 million blooming tulips, daffodils, and hyacinths at Keukenhof.",
        "activities": [
          "Morning drive through the Bollenstreek (flower bulb region) surrounded by endless strips of vibrant blooms.",
          "Explore the 32-hectare Keukenhof Gardens admiring over 800 varieties of blooming tulips, sculpture gardens, and floral pavilions.",
          "Afternoon bicycle or walking tour through neighboring flower fields."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Zaanse Schans Windmills, Clog Workshop & Volendam",
        "summary": "Historic wooden windmills, artisan cheese tasting, and seaside fishing village.",
        "activities": [
          "Visit Zaanse Schans open-air museum: see functioning 18th-century oil, saw, and dye windmills.",
          "Watch a traditional wooden shoe (clog) making demonstration and sample artisan Dutch gouda cheese.",
          "Continue to the historic fishing harbor of Volendam for fresh seafood and waterfront strolls."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Rijksmuseum, Van Gogh & Jordaan District",
        "summary": "Masterpieces of Dutch Golden Age, Van Gogh Museum, and boutique shopping.",
        "activities": [
          "Guided tour of the Rijksmuseum admiring Rembrandt, Vermeer's 'Milkmaid', and Golden Age treasures.",
          "Visit the neighboring Van Gogh Museum holding the world's largest collection of Vincent's paintings.",
          "Spend the afternoon exploring the art galleries, flower shops, and cozy cafés of the Jordaan district."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Departure from Amsterdam to UAE",
        "summary": "Last-minute souvenir shopping for Dutch chocolates and cheeses, airport transfer.",
        "activities": [
          "Enjoy a classic Dutch breakfast with fresh stroopwafels.",
          "Private transfer to Amsterdam Schiphol Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "portugal-lisbon-sintra-porto",
    "title": "Portugal Coastal Charms: Lisbon Tram 28, Sintra Pena Palace & Porto Douro River",
    "destination": "Lisbon · Alfama · Belém · Sintra · Pena Palace · Porto · Douro River",
    "country": "Portugal",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Cultural",
      "City Escape",
      "Beach"
    ],
    "priceStatus": "from",
    "priceFrom": 4190,
    "image": "/images/destinations/portugal-belem-tower.jpg",
    "intro": "Sun-drenched Atlantic charm: vintage yellow trams clattering up Lisbon's hills, the pastel-colored fantasy of Sintra's Pena Palace, and riverside wine cellars in Porto.",
    "story": "Explore ancient Moorish quarters in Lisbon, taste authentic warm Pastéis de Belém custard tarts, take the Alfa Pendular express train to Porto, and cruise beneath the double-deck iron bridges of the Douro River.",
    "highlights": [
      "Historic Tram 28 ride through the narrow cobblestone alleys of Alfama",
      "Guided tour of Belém Tower, Jerónimos Monastery, and Pastéis de Belém tasting",
      "Excursion to Sintra UNESCO fairy-tale Pena National Palace and Cabo da Roca (Europe's westernmost point)",
      "High-speed Alfa Pendular train from Lisbon to Porto",
      "Six Bridges river cruise along the Douro River in Porto",
      "Stroll the vibrant Ribeira waterfront and visit Livraria Lello bookstore",
      "5-star boutique hotels with daily Portuguese breakfast"
    ],
    "route": [
      "Lisbon",
      "Belém",
      "Sintra",
      "Porto",
      "Douro River",
      "Lisbon"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "3 nights in Lisbon & 2 nights in Porto at 4/5-star central heritage hotels",
      "Daily breakfast buffet & traditional Portuguese Fado dinner show",
      "First-Class Alfa Pendular train tickets Lisbon - Porto - Lisbon",
      "Pena Palace and Park skip-the-line entrance tickets",
      "Douro River 6 Bridges boat cruise ticket in Porto",
      "All private airport, station and excursion transfers in luxury AC vehicle",
      "English-speaking private licensed guide"
    ],
    "exclusions": [
      "International flights to/from Lisbon (LIS)",
      "Schengen visa fees",
      "City tourist taxes",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Sunny Lisbon & Baixa District",
        "summary": "Arrive at Humberto Delgado Airport, private transfer to hotel, orientation walk.",
        "activities": [
          "Arrive at Lisbon Airport (LIS). Private Mercedes pickup and transfer to your luxury hotel in Chiado or Avenida da Liberdade.",
          "Take an orientation stroll through grand Praça do Comércio overlooking the Tagus River.",
          "Enjoy a welcome dinner in the Bairro Alto with fresh Atlantic seafood."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Historic Alfama, Tram 28 & Belém Discoveries",
        "summary": "Ride Tram 28, visit São Jorge Castle, Belém Tower, and Jerónimos Monastery.",
        "activities": [
          "Ride the famous yellow Tram 28 up the winding cobbled hills of Alfama.",
          "Admire panoramic views from the Miradouro de Santa Luzia viewpoint.",
          "Drive to Belém: visit the 16th-century fortress Belém Tower and UNESCO Jerónimos Monastery.",
          "Taste the original warm custard tarts at Fábrica de Pastéis de Belém."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Day Excursion to Sintra Fairytale Palaces & Cascais",
        "summary": "Pena Palace vibrant colors, Quinta da Regaleira mystery wells, and Cabo da Roca cliffs.",
        "activities": [
          "Drive to the forested hills of romantic Sintra to tour the eccentric, colorful Pena National Palace perched high on the mountain.",
          "Explore the mystical initiation wells and secret tunnels of Quinta da Regaleira.",
          "Stand at Cabo da Roca, the westernmost point of continental Europe ('where the land ends and the sea begins').",
          "Scenic seaside drive back via the glamorous beach resort town of Cascais."
        ],
        "meals": "Breakfast & lunch included",
        "transport": "Included private vehicle"
      },
      {
        "day": 4,
        "title": "Day 4 — Express Train to Porto & Historic Ribeira",
        "summary": "Fast train to Porto, check in, walk the Ribeira waterfront and Dom Luís I Bridge.",
        "activities": [
          "Board the comfortable Alfa Pendular express train to Porto São Bento station (famed for its 20,000 blue azulejo tiles).",
          "Check in to your hotel overlooking the Douro River.",
          "Walk across the top deck of the double-decker iron Dom Luís I Bridge engineered by Gustave Eiffel's disciple.",
          "Explore the vibrant UNESCO Ribeira waterfront district."
        ],
        "meals": "Breakfast included",
        "transport": "Express train & private transfers included"
      },
      {
        "day": 5,
        "title": "Day 5 — Douro Six Bridges Cruise & Livraria Lello",
        "summary": "Traditional Rabelo boat cruise on Douro, visit iconic bookstore, return to Lisbon.",
        "activities": [
          "Board a traditional wooden Rabelo boat for a scenic 50-minute Six Bridges Cruise along the Douro River.",
          "Visit the neo-Gothic Livraria Lello, one of the world's most beautiful bookstores that inspired J.K. Rowling.",
          "Afternoon express train back to Lisbon for your farewell evening."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Boat cruise & express train included"
      },
      {
        "day": 6,
        "title": "Day 6 — Departure from Lisbon to UAE",
        "summary": "Morning coffee and shopping, private transfer to Lisbon Airport.",
        "activities": [
          "Enjoy a leisurely breakfast and last-minute shopping for Portuguese cork crafts and ceramics.",
          "Private transfer to Lisbon Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "mauritius-tropical-lagoon-resort",
    "title": "Mauritius Island Bliss: Le Morne Coral Lagoon, Chamarel Seven Earths & Luxury Beach",
    "destination": "Le Morne · Chamarel · Île aux Cerfs · Port Louis · Grand Baie",
    "country": "Mauritius",
    "region": "International",
    "days": 6,
    "nights": 5,
    "styles": [
      "Beach",
      "Honeymoon",
      "Luxury",
      "Family"
    ],
    "priceStatus": "from",
    "priceFrom": 4790,
    "image": "/images/destinations/mauritius-le-morne.jpg",
    "intro": "Crystal turquoise lagoons, powder-white beaches framed by emerald volcanic peaks, and world-renowned 5-star tropical resort hospitality.",
    "story": "Relax in luxury beachfront resorts nestled beneath UNESCO Le Morne Brabant mountain, catamaran across sparkling reefs to Île aux Cerfs, and discover the rainbow sands of Chamarel Seven Coloured Earths.",
    "highlights": [
      "5 nights in a luxury 5-star oceanfront resort with private beach and spa facilities",
      "Full-day luxury catamaran cruise to Île aux Cerfs with snorkeling and barbecue lunch",
      "Excursion to Chamarel: Seven Coloured Earths geological wonder and 100m waterfall",
      "Visit Grand Bassin (Ganga Talao) sacred crater lake and giant Shiva statue",
      "Stroll the giant Victoria Amazonica water lily ponds at SSR Botanical Garden",
      "Glass-bottom boat reef coral and tropical fish viewing",
      "Romantic sunset beachfront candlelight dinner"
    ],
    "route": [
      "Le Morne",
      "Chamarel",
      "Île aux Cerfs",
      "Grand Bassin",
      "Port Louis"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "5 nights 5-star beachfront resort accommodation (Half Board: daily breakfast & gourmet dinner)",
      "Full-day catamaran cruise with open bar, barbecue lunch & snorkeling equipment",
      "Full-day southwest island tour (Chamarel, Waterfalls, Grand Bassin) with guide",
      "All private airport and excursion transfers in luxury AC vehicle",
      "Welcome fruit basket and complimentary non-motorized water sports",
      "24/7 dedicated local representative"
    ],
    "exclusions": [
      "International flights to/from Sir Seewoosagur Ramgoolam Airport (MRU)",
      "Personal spa treatments and premium water sports",
      "Gratuities and travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Arrival in Tropical Paradise Mauritius",
        "summary": "Arrive at MRU Airport, private transfer to 5★ beachfront resort, sunset cocktail.",
        "activities": [
          "Arrive at Sir Seewoosagur Ramgoolam International Airport (MRU). Warm floral garland welcome and private transfer to your 5-star beachfront resort.",
          "Check into your ocean-view suite, unwind on the soft white sands, and watch a golden Indian Ocean sunset.",
          "Lavish welcome dinner buffet featuring French, Creole, and Indian fusion cuisine."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Southwest Scenic Wonders: Chamarel & Sacred Crater Lake",
        "summary": "Seven Coloured Earths, Chamarel Waterfalls, and sacred Grand Bassin.",
        "activities": [
          "Drive into the lush Chamarel mountains to witness the Seven Coloured Earths — dunes of red, brown, violet, and green volcanic sands.",
          "View the dramatic Chamarel Waterfall plunging 100 meters into a lush tropical amphitheater.",
          "Visit the sacred crater lake of Grand Bassin (Ganga Talao) guarded by monumental 108-foot statues of Lord Shiva and Durga.",
          "Enjoy panoramic views over the Black River Gorges nature reserve."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Luxury Catamaran Cruise to Île aux Cerfs",
        "summary": "Sail crystal lagoons, snorkel colorful coral reefs, and beach BBQ on Île aux Cerfs.",
        "activities": [
          "Board a luxury sailing catamaran for a full-day cruise across the turquoise east coast lagoon.",
          "Snorkel over vibrant coral gardens teeming with tropical reef fish (equipment provided).",
          "Enjoy a freshly grilled seafood and chicken BBQ lunch onboard with refreshing drinks.",
          "Drop anchor at paradise island Île aux Cerfs for swimming, sunbathing, and parasailing."
        ],
        "meals": "Breakfast, lunch & dinner included",
        "transport": "Included private transfers & catamaran"
      },
      {
        "day": 4,
        "title": "Day 4 — North Island Discovery: Port Louis & Botanical Gardens",
        "summary": "Port Louis Caudan Waterfront, Central Market, and giant water lilies.",
        "activities": [
          "Visit the historic capital of Port Louis: stroll the colorful umbrella alley at Le Caudan Waterfront and explore the vibrant Central Market.",
          "Explore the historic Sir Seewoosagur Ramgoolam Botanical Garden in Pamplemousses, famous for giant Amazonian water lilies and 85 varieties of palms.",
          "Stop in lively Grand Baie for boutique shopping and coastal views."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Included private transport"
      },
      {
        "day": 5,
        "title": "Day 5 — Beach Relaxation, Water Sports & Spa Luxury",
        "summary": "Free day for paddleboarding, kayaking, luxury spa, and candlelight beach dinner.",
        "activities": [
          "Spend a relaxing day indulging in complimentary resort water sports: stand-up paddleboarding, kayaking, and glass-bottom boat coral tours.",
          "Optional rejuvenating tropical couples spa treatment.",
          "Romantic 4-course farewell candlelight dinner on the beach under the southern stars."
        ],
        "meals": "Breakfast & dinner included",
        "transport": "Resort stay"
      },
      {
        "day": 6,
        "title": "Day 6 — Departure from Mauritius to UAE",
        "summary": "Final morning beach swim, resort checkout, and private airport transfer.",
        "activities": [
          "Enjoy a relaxed tropical breakfast overlooking the turquoise lagoon.",
          "Private luxury transfer to Mauritius Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "qatar-doha-luxury-stopover",
    "title": "Qatar Cultural Splendour: Doha Corniche Skyline, Souq Waqif & Katara Village",
    "destination": "Doha · West Bay · Corniche · Souq Waqif · Museum of Islamic Art · Katara",
    "country": "Qatar",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": [
      "Weekend Escape",
      "Luxury",
      "Shopping",
      "Cultural"
    ],
    "priceStatus": "from",
    "priceFrom": 1690,
    "image": "/images/destinations/qatar-doha-skyline.jpg",
    "intro": "Just 1 hour flight from Dubai: dazzling futuristic architecture along West Bay, fragrant spice alleys in Souq Waqif, and world-class cultural museums by the Arabian Gulf.",
    "story": "Experience the ultimate luxury Arabian city break: take a sunset wooden dhow cruise along the Corniche, explore the I.M. Pei-designed Museum of Islamic Art, and dine at the Pearl-Qatar marina.",
    "highlights": [
      "Traditional illuminated wooden Dhow cruise along Doha Corniche with skyline views",
      "Guided tour of Souq Waqif: Falcon Souq, spice alleys, and artisan craft shops",
      "Visit the iconic Museum of Islamic Art and National Museum of Qatar (Desert Rose)",
      "Explore Katara Cultural Village amphitheater and Blue Mosque",
      "Stroll the luxury yachts and Mediterranean plazas of The Pearl-Qatar",
      "5-star hotel in central West Bay / Doha with daily breakfast buffet",
      "Fast 1-hour direct flights from Dubai DXB / Abu Dhabi AUH"
    ],
    "route": [
      "Doha",
      "Corniche",
      "Souq Waqif",
      "Katara",
      "The Pearl"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "3 nights 5-star hotel accommodation in central Doha",
      "Daily international breakfast buffet",
      "Private Doha Corniche sunset dhow cruise",
      "Half-day guided city highlights tour with museum admissions",
      "All private airport and sightseeing transfers in luxury AC vehicle",
      "Dedicated 24/7 concierge assistance"
    ],
    "exclusions": [
      "International flights to/from Doha (DOH)",
      "Optional desert dune bashing safari",
      "Personal expenses and travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — 1-Hour Flight from Dubai to Doha & Souq Waqif",
        "summary": "Arrive at Hamad Airport, private transfer to 5★ hotel, evening Souq Waqif walk.",
        "activities": [
          "Short 1-hour direct flight from Dubai DXB to Hamad International Airport in Doha. VIP meet-and-greet and private transfer to your 5-star hotel.",
          "Check in and head to the lively alleys of Souq Waqif to see the Falcon Souq, camel pens, and spice merchants.",
          "Traditional Arabian dinner featuring authentic Qatari machboos and karak tea."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Cultural Marvels: Museum of Islamic Art & Katara Village",
        "summary": "I.M. Pei Museum of Islamic Art, National Museum, and Katara amphitheater.",
        "activities": [
          "Visit the architectural masterpiece Museum of Islamic Art (MIA) standing gracefully on its own island.",
          "Tour the National Museum of Qatar designed by Jean Nouvel inspired by the natural desert rose crystal.",
          "Explore Katara Cultural Village: visit the gilded amphitheater, art galleries, and waterfront promenade."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — The Pearl-Qatar & Sunset Corniche Dhow Cruise",
        "summary": "The Pearl-Qatar luxury marina, Lusail boulevard, and evening dhow cruise.",
        "activities": [
          "Visit The Pearl-Qatar, a man-made island featuring Mediterranean-style marinas, luxury boutiques, and Venetian canals at Qanat Quartier.",
          "View the futuristic architecture of Lusail and the iconic Katara Towers.",
          "Board a traditional wooden Dhow for a private sunset cruise along Doha Bay with panoramic views of the illuminated West Bay skyline."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport & boat cruise"
      },
      {
        "day": 4,
        "title": "Day 4 — Departure from Doha to UAE",
        "summary": "Morning shopping at Place Vendôme Mall, transfer to Hamad Airport.",
        "activities": [
          "Enjoy a leisurely breakfast and shop at the Parisian-inspired Place Vendôme luxury mall in Lusail.",
          "Private transfer to Hamad International Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  },
  {
    "slug": "bahrain-pearl-heritage-escape",
    "title": "Bahrain Pearl Island: Manama Bay, UNESCO Qal'at Fort & Heritage Souqs",
    "destination": "Manama · Qal'at al-Bahrain · Bab Al Bahrain · Al Fateh Mosque · Muharraq",
    "country": "Bahrain",
    "region": "International",
    "days": 4,
    "nights": 3,
    "styles": [
      "Weekend Escape",
      "Cultural",
      "City Escape"
    ],
    "priceStatus": "from",
    "priceFrom": 1490,
    "image": "/images/destinations/bahrain-manama-skyline.jpg",
    "intro": "Just 1 hour flight from UAE: explore ancient Dilmun civilizations, UNESCO Portuguese forts overlooking turquoise seas, and vibrant pearl souqs in the Kingdom of Bahrain.",
    "story": "Discover the island of two seas: tour the grand Al Fateh Mosque, walk along the battlements of Qal'at al-Bahrain fort at sunset, and taste authentic warm Bahraini halwa in historic Muharraq.",
    "highlights": [
      "Guided tour of UNESCO World Heritage Qal'at al-Bahrain (Bahrain Fort)",
      "Visit the magnificent Al Fateh Grand Mosque with its giant fiberglass dome",
      "Stroll through Bab Al Bahrain gateway into the bustling spice and gold souq",
      "Walk the UNESCO Pearling Path in historic Muharraq and traditional windtower houses",
      "View the twin towers of Bahrain World Trade Center with wind turbines",
      "5-star hotel stay in central Manama / Bahrain Bay with daily breakfast buffet",
      "Short 1-hour flight from Dubai DXB / Abu Dhabi AUH"
    ],
    "route": [
      "Manama",
      "Bahrain Fort",
      "Bab Al Bahrain",
      "Muharraq",
      "Manama Bay"
    ],
    "featured": true,
    "isNew": true,
    "inclusions": [
      "3 nights 5-star hotel accommodation in central Manama / Seef district",
      "Daily international buffet breakfast",
      "Full-day guided historical island tour with museum admissions",
      "Bahraini halwa and Arabic coffee tasting in Muharraq",
      "All private airport, hotel, and sightseeing transfers in luxury AC vehicle",
      "English-speaking professional local tour guide"
    ],
    "exclusions": [
      "International flights to/from Bahrain (BAH)",
      "Personal expenses and optional water sports",
      "Travel insurance"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1 — Flight from Dubai to Manama & Bab Al Bahrain",
        "summary": "Arrive at Bahrain Airport, private transfer to 5★ hotel, explore Manama Souq.",
        "activities": [
          "Direct 1-hour flight from Dubai DXB to Bahrain International Airport (BAH). VIP meet-and-greet and private transfer to your 5-star hotel.",
          "Check in and walk through the historic Bab Al Bahrain archway into the vibrant alleys of Manama Souq.",
          "Evening welcome dinner featuring authentic Bahraini machboos and fresh Gulf grilled fish."
        ],
        "meals": "Dinner included",
        "transport": "Included private airport transfer"
      },
      {
        "day": 2,
        "title": "Day 2 — Ancient Qal'at al-Bahrain Fort & Al Fateh Grand Mosque",
        "summary": "Dilmun ancient capital, UNESCO fort on the sea, and Al Fateh Mosque.",
        "activities": [
          "Visit the monumental Al Fateh Grand Mosque, admiring its marble floors and world's largest fiberglass dome.",
          "Tour the Bahrain National Museum showcasing 5,000 years of ancient Dilmun civilization artifacts.",
          "Explore the UNESCO World Heritage site Qal'at al-Bahrain (Bahrain Fort) perched right on the seashore at sunset."
        ],
        "meals": "Breakfast included",
        "transport": "Included private vehicle with guide"
      },
      {
        "day": 3,
        "title": "Day 3 — Muharraq Pearling Path, Windtowers & Bahrain Bay",
        "summary": "UNESCO Pearling Path heritage houses, traditional halwa factory, and Bahrain Bay skyline.",
        "activities": [
          "Walk through the historic alleyways of Muharraq, exploring preserved 19th-century pearl merchant houses like Beit Sheikh Isa bin Ali.",
          "Visit a traditional Bahraini Halwa factory to watch master sweetmakers and sample warm halwa with cardamom coffee.",
          "Evening at leisure admiring the illuminated Bahrain World Trade Center and The Avenues waterfront promenade."
        ],
        "meals": "Breakfast included",
        "transport": "Included private transport"
      },
      {
        "day": 4,
        "title": "Day 4 — Departure from Bahrain to UAE",
        "summary": "Leisurely breakfast, checkout, and private transfer to airport for flight home.",
        "activities": [
          "Enjoy a relaxed morning breakfast overlooking Manama Bay.",
          "Private luxury transfer to Bahrain International Airport for your flight back to Dubai DXB."
        ],
        "meals": "Breakfast included",
        "transport": "Included private airport transfer"
      }
    ]
  }
];

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
  { slug: "desert-safari-evening", title: "Evening Red Dunes Desert Safari & BBQ", emirate: "Dubai", category: "Desert", duration: "Half Day", audience: ["Families", "Groups", "Couples"], priceStatus: "from", priceFrom: 165, wasPrice: 220, badge: "Must Try", instantConfirm: true, image: "/images/inbound/desert-safari-premium-red-dune-evening-desert-shows-and-dinner-at-heritage-village/img-1.avif", overview: "Dune drive, camel ride, henna, 7 live shows and a 5-star BBQ dinner under desert stars.", featured: true },
  { slug: "burj-khalifa-levels", title: "Burj Khalifa: At The Top (Levels 124 & 125)", emirate: "Dubai", category: "Attraction", duration: "1–2 Hours", audience: ["Families", "Couples", "Adults"], priceStatus: "from", priceFrom: 179, wasPrice: 210, badge: "Must Try", instantConfirm: true, image: "/images/inbound/view-at-the-top-burj-khalifa/img-1.webp", overview: "Observation decks on levels 124 & 125, with panoramic fountain show views below.", featured: true },
  { slug: "private-yacht-marina", title: "Private Luxury Yacht Charter Dubai Marina", emirate: "Dubai", category: "Luxury", duration: "2–4 Hours", audience: ["Couples", "Groups"], priceStatus: "from", priceFrom: 380, badge: "Popular", instantConfirm: true, image: "/images/inbound/xclusive-sharing-and-private-yacht-tours/img-1.webp", overview: "Private charter along Marina, Ain Dubai and the Palm coastline with captain and crew.", featured: true },
  { slug: "lotus-mega-yacht", title: "Lotus Mega Yacht 5-Star Dinner Cruise", emirate: "Dubai", category: "Cruise", duration: "2–4 Hours", audience: ["Families", "Couples"], priceStatus: "from", priceFrom: 249, badge: "Must Try", instantConfirm: true, image: "/images/inbound/lotus-royale-dhow-cruise/img-1.webp", overview: "240ft superyacht with onboard pool, live DJ, and 5-star international buffet dinner." },
  { slug: "hot-air-balloon-desert", title: "Desert Hot Air Balloon Sunrise & Falconry", emirate: "Dubai", category: "Adventure", duration: "Half Day", audience: ["Adults", "Couples"], priceStatus: "from", priceFrom: 990, badge: "Must Try", instantConfirm: true, image: "/images/inbound/dubai-hot-air/img-1.webp", overview: "Pre-dawn flight 4,000ft over dunes, in-flight falconry show and gourmet desert breakfast." },
  { slug: "aquaventure-waterpark", title: "Atlantis Aquaventure Waterpark World", emirate: "Dubai", category: "Theme Park", duration: "Full Day", audience: ["Families", "Children"], priceStatus: "from", priceFrom: 325, badge: "Must Try", instantConfirm: true, image: "/images/inbound/atlantis-aqua-water-park/img-1.webp", overview: "105 record-breaking waterslides, private white sand beach and marine habitats." },
  { slug: "museum-of-the-future", title: "Museum of The Future Entry Ticket", emirate: "Dubai", category: "Attraction", duration: "2–4 Hours", audience: ["Adults", "Families"], priceStatus: "from", priceFrom: 159, badge: "Must Try", instantConfirm: true, image: "/images/inbound/museum-of-the-future/img-1.jpg", overview: "Journey 50 years into the future inside the world's most beautiful building." },
  { slug: "global-village", title: "Global Village Dubai Season Entry Ticket", emirate: "Dubai", category: "Attraction", duration: "Half Day", audience: ["Families", "Children", "Groups"], priceStatus: "from", priceFrom: 25, badge: "Best Value", instantConfirm: true, image: "/images/inbound/global-village/img-1.webp", overview: "90+ country pavilions, street food, live cultural shows and carnival rides." },
  { slug: "the-view-palm", title: "The View at The Palm (Level 52)", emirate: "Dubai", category: "Attraction", duration: "1–2 Hours", audience: ["Families", "Couples"], priceStatus: "from", priceFrom: 105, wasPrice: 125, badge: "Must Try", instantConfirm: true, image: "/images/inbound/view-at-the-top-of-the-palm/img-1.jpg", overview: "360° views of Palm Jumeirah from Level 52, 240m above the island." },
  { slug: "ski-dubai-snow-park", title: "Ski Dubai Snow Park & Slope", emirate: "Dubai", category: "Theme Park", duration: "2–4 Hours", audience: ["Families", "Children"], priceStatus: "from", priceFrom: 220, badge: "Popular", instantConfirm: true, image: "/images/inbound/ski-dubai/img-1.jpg", overview: "Real snow all year: toboggan runs, penguin encounters and full winter gear included." },
  { slug: "img-worlds", title: "IMG Worlds of Adventure Mega Indoor Park", emirate: "Dubai", category: "Theme Park", duration: "Full Day", audience: ["Families", "Children", "Groups"], priceStatus: "from", priceFrom: 245, wasPrice: 345, badge: "Must Try", instantConfirm: true, image: "/images/inbound/img-world-of-adventure/img-1.jpg", overview: "World's largest indoor theme park — Marvel, Cartoon Network and Velociraptor coaster." },
  { slug: "ferrari-world", title: "Ferrari World Abu Dhabi (Yas Island)", emirate: "Abu Dhabi", category: "Theme Park", duration: "Full Day", audience: ["Families", "Groups", "Adults"], priceStatus: "from", priceFrom: 345, badge: "Must Try", instantConfirm: true, image: "/images/inbound/ferrari-world/img-1.webp", overview: "Formula Rossa 240km/h fastest rollercoaster, Flying Aces and 40 Ferrari rides." },
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
  "Romantic",
  "Family",
  "Luxury",
  "Adventure",
  "Beach",
  "City Escape",
  "Shopping",
  "Cultural",
  "Historical",
  "Nature",
  "Mountain",
  "Safari",
  "Theme Park",
  "Northern Lights",
  "Cruises",
  "Weekend Escape",
  "Budget Friendly"
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

/**
 * Price split into its eyebrow and its amount.
 *
 * Cards render a small "Per person from" label above a large figure. Using
 * `priceLabel` for the figure duplicated the word — "PER PERSON FROM" sitting
 * directly above "From AED 3,499". This returns the two halves separately so a
 * card can label the row once and print the bare amount underneath.
 */
export function priceParts(p: { priceStatus: PriceStatus; priceFrom?: number }): {
  eyebrow: string;
  amount: string;
} {
  return p.priceStatus === "from" && p.priceFrom
    ? { eyebrow: "Per person from", amount: "AED " + p.priceFrom.toLocaleString() }
    : { eyebrow: "Tailored quote", amount: "Price on request" };
}
