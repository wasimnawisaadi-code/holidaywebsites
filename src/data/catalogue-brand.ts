export const BRAND = {
  name: "Nawi Saadi Travel & Tourism",
  short: "Nawi Saadi",
  legal: "Nawi Saadi Travel & Tourism (Saadi Group of Companies)",
  whatsapp: "971561228069",
  email: "nawisaadiholidays@gmail.com",
  phone: "+971 56 122 8069",
  city: "Deira, Dubai, United Arab Emirates",
  founded: 2009,
  chairman: "Mr. Shafiqullah Zazai",
  flightsSite: "https://www.nsttrip.com/",
  mainSite: "https://www.nawisaadiholidays.com/",
  // The parent company site. This holidays site is one division of it — the
  // parent carries flights, visa services, cargo, overflight permits and
  // corporate travel, and is the Afghanistan-facing brand. Declared here so
  // the relationship can be stated in the structured data and linked in the
  // footer rather than left for a search engine to guess at.
  parentSite: "https://www.nawisaadi.com/",
  /**
   * Official social profiles.
   *
   * These are not decoration. Search engines use them to confirm that a
   * website and a set of social accounts are the same organisation — the
   * agency's `sameAs` list is the single strongest signal for that — and a
   * customer deciding whether a travel agency is real will look for them
   * before they will fill in a form.
   */
  social: {
    instagram: "https://www.instagram.com/nawisaadi.travelandtourism.llc/",
    facebook: "https://www.facebook.com/nsttrip2022/",
    tiktok: "https://www.tiktok.com/@nawisaadi_llc",
  },
  // Build credit shown in the footer. The number is the developer's own
  // WhatsApp, deliberately separate from the agency line above so a customer
  // enquiry never lands there.
  developer: { name: "Mhd Wasim", whatsapp: "971565919456" },
};

export const credentials = [
  {
    code: "IATA",
    title: "IATA Accredited Agency",
    body: "Accredited by the International Air Transport Association, so tickets are issued to full international standards.",
  },
  {
    code: "GSA",
    title: "flydubai GSA for Afghanistan",
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
    body: "Kabul (Afghanistan), Dubai (UAE) and Jeddah (Saudi Arabia), plus dedicated airport service desks.",
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
    email: "nawisaadiholidays@gmail.com",
    address: "Millenium Building, Naif Road, Deira, Dubai, UAE",
    note: "Holidays, UAE tours & visa desk",
  },
  {
    city: "Kabul",
    country: "Afghanistan",
    phone: "+93 79 820 3051",
    email: "infokbl@nawisaadi.com",
    address: "Khost Tower, Jade Maiwand Road, Kabul, Afghanistan",
    note: "Head office, established 2009. Airport assistance and flydubai GSA passenger services at Kabul International, Departure Terminal.",
  },
  {
    city: "Jeddah",
    country: "Saudi Arabia",
    phone: "+966 55 990 54 20",
    email: "nawisaadiholidays@gmail.com",
    address: "Jeddah, Kingdom of Saudi Arabia",
    note: "Hajj & Umrah operations",
  },
];

export const serviceLines = [
  {
    title: "Flight Booking & Air Ticketing",
    body: "International and domestic tickets on flydubai, Emirates, Turkish Airlines, Qatar Airways, Saudia and more.",
  },
  {
    title: "Visa Assistance",
    body: "UAE tourist visas, transit visas and international visa consultancy with document support.",
  },
  {
    title: "Holiday Packages",
    body: "Curated international holidays and UAE getaways with hotels, transfers and experiences included.",
  },
  {
    title: "UAE Tours & Attractions",
    body: "Desert safaris, Burj Khalifa, theme parks, cruises and city tours, many under AED 100.",
  },
  {
    title: "Hajj & Umrah",
    body: "Umrah packages from 7 to 17 nights with 3★ to 5★ hotels, visas and ground transport.",
  },
  {
    title: "Corporate & Group Travel",
    body: "Managed business travel, MICE, delegations and NGO travel with dedicated account handling.",
  },
  { title: "Hotel Booking", body: "Worldwide accommodation at negotiated contracted rates." },
  {
    title: "Transfers & Car Rental",
    body: "Airport transfers, chauffeur services and vehicle rental across the UAE.",
  },
  {
    title: "Aviation & Ground Handling",
    body: "Airport assistance, ground handling coordination and passenger services.",
  },
  {
    title: "Overflight & Landing Permits",
    body: "Overflight clearances, landing permits and aviation support services.",
  },
  {
    title: "Cargo & Air Freight",
    body: "International logistics, air freight and cargo handling.",
  },
  {
    title: "Customized Tours",
    body: "Bespoke itineraries built around your dates, budget and travel style.",
  },
];

export function waLink(message: string) {
  return "https://wa.me/" + BRAND.whatsapp + "?text=" + encodeURIComponent(message);
}
