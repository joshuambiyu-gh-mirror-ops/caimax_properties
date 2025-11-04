export const townCoordinates: { [key: string]: { longitude: number; latitude: number; zoom: number } } = {
  'Nairobi': { longitude: 36.8172, latitude: -1.2864, zoom: 11 },
  'Karen': { longitude: 36.7062, latitude: -1.3192, zoom: 13 },
  'Westlands': { longitude: 36.8089, latitude: -1.2697, zoom: 13 },
  'Kilimani': { longitude: 36.7885, latitude: -1.2907, zoom: 14 },
  'Syokimau': { longitude: 36.9183, latitude: -1.3594, zoom: 13 },
  'Ruiru': { longitude: 36.9577, latitude: -1.1452, zoom: 13 },
  'Machakos': { longitude: 37.2635, latitude: -1.5177, zoom: 13 }
};

export const findLocationCoordinates = (location: string, listings: any[]) => {
  // First check predefined coordinates
  const predefined = townCoordinates[location];
  if (predefined) return predefined;

  // If not found, try to find first listing matching the location
  const matchingListing = listings.find(l => 
    l.location?.toLowerCase().includes(location.toLowerCase()) &&
    typeof l.longitude === 'number' &&
    typeof l.latitude === 'number'
  );

  if (matchingListing) {
    return {
      longitude: matchingListing.longitude,
      latitude: matchingListing.latitude,
      zoom: 13 // Default zoom for dynamic locations
    };
  }

  // Default to Nairobi if nothing found
  return townCoordinates['Nairobi'];
};