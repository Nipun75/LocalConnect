// Hyperlocal Locations for LocalConnect (Nagpur Landmark Database)

export interface LandmarkLocation {
  name: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  aliases: string[];
}

export const NAGPUR_LANDMARKS: LandmarkLocation[] = [
  {
    name: 'Dharampeth',
    area: 'Dharampeth',
    city: 'Nagpur',
    lat: 21.1442,
    lng: 79.0620,
    aliases: ['dharampeth', 'dharampet', 'west nagpur', 'coffee house square', 'shankar nagar'],
  },
  {
    name: 'Sitabuldi',
    area: 'Sitabuldi',
    city: 'Nagpur',
    lat: 21.1458,
    lng: 79.0832,
    aliases: ['sitabuldi', 'burdi', 'buldi', 'main market', 'variety square', 'eternity mall'],
  },
  {
    name: 'Ramdaspeth',
    area: 'Ramdaspeth',
    city: 'Nagpur',
    lat: 21.1352,
    lng: 79.0718,
    aliases: ['ramdaspeth', 'ramdas peth', 'central bazar road', 'lokmat square'],
  },
  {
    name: 'Sadar',
    area: 'Sadar',
    city: 'Nagpur',
    lat: 21.1610,
    lng: 79.0838,
    aliases: ['sadar', 'sadar bazar', 'residency road', 'chaoni', 'mangalam'],
  },
  {
    name: 'Manish Nagar',
    area: 'Manish Nagar',
    city: 'Nagpur',
    lat: 21.0934,
    lng: 79.0792,
    aliases: ['manish nagar', 'besa road', 'beltarodi', 'somwarpet', 'manish nagar square'],
  },
  {
    name: 'Pratap Nagar',
    area: 'Pratap Nagar',
    city: 'Nagpur',
    lat: 21.1189,
    lng: 79.0558,
    aliases: ['pratap nagar', 'p&t colony', 'swavalambi nagar', 'khamla', 'deonagar'],
  },
  {
    name: 'Laxmi Nagar',
    area: 'Laxmi Nagar',
    city: 'Nagpur',
    lat: 21.1245,
    lng: 79.0645,
    aliases: ['laxmi nagar', 'vnit', 'bajaj nagar', 'abhyankar nagar'],
  },
  {
    name: 'Civil Lines',
    area: 'Civil Lines',
    city: 'Nagpur',
    lat: 21.1560,
    lng: 79.0680,
    aliases: ['civil lines', 'vca stadium', 'high court', 'ladies club'],
  },
  {
    name: 'Wardha Road',
    area: 'Wardha Road',
    city: 'Nagpur',
    lat: 21.0980,
    lng: 79.0650,
    aliases: ['wardha road', 'airport', 'chhatrapati square', 'ujwal nagar', 'somalwada'],
  },
  {
    name: 'Medical Square',
    area: 'Medical Square',
    city: 'Nagpur',
    lat: 21.1302,
    lng: 79.0987,
    aliases: ['medical square', 'rambaug', 'untkhana', 'tukdoji square'],
  }
];

export const DEFAULT_USER_LOCATION: LandmarkLocation = NAGPUR_LANDMARKS[0]; // Dharampeth

// Haversine Distance in Kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

// Find closest landmark or match name
export function resolveLocationFromQuery(query: string): LandmarkLocation {
  const lower = query.toLowerCase();
  for (const landmark of NAGPUR_LANDMARKS) {
    if (landmark.aliases.some((alias) => lower.includes(alias))) {
      return landmark;
    }
  }
  return DEFAULT_USER_LOCATION;
}
