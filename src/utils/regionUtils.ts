import { Loader } from '@googlemaps/js-api-loader';

// Interface for region with geometry data
export interface RegionWithGeometry {
  name: string;
  place_id?: string;
  bounds?: google.maps.LatLngBounds;
  viewport?: google.maps.LatLngBounds;
}

// Cache for geocoded regions to avoid redundant API calls
const geocodeCache: Record<string, Promise<RegionWithGeometry> | undefined> = {};

// Initialize Google Maps loader
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places", "geometry"]
});

/**
 * Geocode a region to get its boundaries
 */
export const geocodeRegion = async (region: { name: string; place_id?: string }): Promise<RegionWithGeometry> => {
  const cacheKey = region.place_id || region.name;
  
  // Return cached result if available
  if (cacheKey in geocodeCache && geocodeCache[cacheKey] !== undefined) {
    return geocodeCache[cacheKey]!;
  }
  
  // Create a promise for this geocoding operation and cache it
  geocodeCache[cacheKey] = (async () => {
    try {
      // Load Google Maps API
      await loader.load();
      const geocoder = new google.maps.Geocoder();
      
      // Prepare request parameters
      const request: google.maps.GeocoderRequest = region.place_id 
        ? { placeId: region.place_id }
        : { address: region.name, region: 'il' }; // Limit to Israel
      
      // Execute geocoding
      const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode(request, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve({ results });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
      
      const result = response.results[0];
      
      return {
        ...region,
        bounds: result.geometry.bounds || undefined,
        viewport: result.geometry.viewport || undefined
      };
    } catch (error) {
      console.error(`Error geocoding region ${region.name}:`, error);
      // Return original region if geocoding fails
      return region;
    }
  })();
  
  return geocodeCache[cacheKey];
};

/**
 * Check if regionA is contained within regionB
 */
export const isRegionContainedIn = async (
  regionA: { name: string; place_id?: string },
  regionB: { name: string; place_id?: string }
): Promise<boolean> => {
  try {
    // If regions have the same name, they're the same region
    if (regionA.name === regionB.name) return true;
    
    // Geocode both regions to get their boundaries
    const [geoRegionA, geoRegionB] = await Promise.all([
      geocodeRegion(regionA),
      geocodeRegion(regionB)
    ]);
    
    // If either region doesn't have geometry data, we can't determine containment
    if (!geoRegionA.viewport || !geoRegionB.viewport) return false;
    
    // Check if regionA is contained within regionB
    // We'll use the viewport for this check
    const viewportA = geoRegionA.viewport;
    const viewportB = geoRegionB.viewport;
    
    // Get the corners of viewport A
    const northEastA = viewportA.getNorthEast();
    const southWestA = viewportA.getSouthWest();
    
    // Check if all corners of A are contained in B
    return viewportB.contains(northEastA) && viewportB.contains(southWestA);
  } catch (error) {
    console.error('Error checking region containment:', error);
    return false;
  }
};

/**
 * Check if a region matches any region in a list, considering containment
 */
export const matchesAnyRegion = async (
  region: { name: string; place_id?: string },
  regionList: Array<{ name: string; place_id?: string }>
): Promise<boolean> => {
  // Direct match by name
  if (regionList.some(r => r.name === region.name)) return true;
  
  // Check containment relationships
  for (const listRegion of regionList) {
    // Check if the region contains any region in the list
    if (await isRegionContainedIn(region, listRegion)) return true;
    
    // Check if any region in the list contains this region
    if (await isRegionContainedIn(listRegion, region)) return true;
  }
  
  return false;
}; 