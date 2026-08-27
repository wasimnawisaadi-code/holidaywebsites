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
    note: "Head office — established 2009. Airport assistance and flydubai GSA passenger services at Kabul International, Departure Terminal.",
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
    body: "Desert safaris, Burj Khalifa, theme parks, cruises and city tours — many under AED 100.",
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
