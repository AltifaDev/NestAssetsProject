// API Client for Property Search
// Connects to NestJS backend (which connects to Supabase)
// Schema based on Payload CMS generated tables

import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export { API_BASE_URL };
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Formats a media URL by prepending the API base URL if needed.
 */
const formatMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;

  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

export interface SearchFilters {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: string;
  bathrooms?: string;
  propertyType?: string;
  listingType?: 'sale' | 'rent';
  livingAreaMin?: number;
  livingAreaMax?: number;
  pet_friendly?: boolean;
}

// Re-export specific interfaces for Frontend usage
export interface NearbyPlace {
  id?: string;
  name: string;
  distance: string;
  category: 'transport' | 'shop' | 'edu' | 'hosp';
  icon?: string;
}

export interface IndoorAmenities {
  furniture?: boolean;
  air_con?: boolean;
  water_heater?: boolean;
  digital_lock?: boolean;
  bathtub?: boolean;
  stove?: boolean;
  tv?: boolean;
  refrigerator?: boolean;
  internet?: boolean;
  smart_home?: boolean;
}

export interface ProjectAmenities {
  lift?: boolean;
  parking_facility?: boolean;
  pool?: boolean;
  gym?: boolean;
  cctv?: boolean;
  security?: boolean;
  garden?: boolean;
  storage?: boolean;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  livingArea?: number;
  landArea?: number;
  sqft?: number; // legacy alias
  yearBuilt?: number;
  propertyType: string;
  listingType: 'sale' | 'rent' | string;
  thumbnail: string;
  images?: string[];

  // Location
  lng: number;
  lat: number;
  distanceKm?: number;
  location?: {
    lat?: number;
    lng?: number;
    province?: string;
    district?: string;
    sub_district?: string;
    postcode?: string;
  };

  rating?: number;
  isSuperhost?: boolean;

  agent?: {
    id?: string;
    name: string;
    role: string;
    image_url: string;
    phone?: string;
    email?: string;
    lineId?: string;
    verified?: boolean;
  };

  // Specs
  floors?: number;
  parking?: number;
  project_name?: string;
  direction?: string;
  ownership?: string;
  common_fee?: number;
  decoration?: string;
  view_count?: number;
  updatedAt?: string;
  createdAt?: string;

  featured?: boolean;
  pet_friendly?: boolean;
  video_url?: string;

  // Structured amenities
  indoor_amenities?: IndoorAmenities;
  project_amenities?: ProjectAmenities;

  // Legacy / Fallback
  amenities?: string[];

  // Nearby places
  nearby_places?: NearbyPlace[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: Property;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  bbox?: [number, number, number, number];
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Try to recover token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit & { skipLogout?: boolean } = {}): Promise<T> {
    const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${base}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && !options.skipLogout && typeof window !== 'undefined') {
        // Handle unauthorized (token expired)
        this.logout();
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }
      return await response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.error('🌐 Network error: Backend at', this.baseURL, 'is unreachable.');
      }
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const data: any = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.access_token) {
      this.token = data.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
    }
    return data;
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      // ตรวจสอบ role ก่อน logout เพื่อ redirect ไปหน้าที่ถูกต้อง
      const user = this.getUser();
      const isAdmin = user?.role === 'admin';

      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Redirect ไปหน้า login ที่เหมาะสม
      window.location.href = isAdmin ? '/admin/login' : '/agent/login';
    }
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  async getProfile() {
    try {
      const data = await this.request<any>('/api/auth/profile');
      if (data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(data));
        }
        return data;
      }
    } catch (error) {
      console.warn('Failed to fetch user profile', error);
    }
    return this.getUser();
  }

  // Property methods
  async getProperties() {
    try {
      const response = await this.request<any>('/api/properties', { skipLogout: true });
      const properties = Array.isArray(response) ? response : (response?.data || []);
      return { docs: properties };
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      return { docs: [] };
    }
  }

  async createProperty(data: any) {
    return this.request('/api/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id: string, data: any) {
    return this.request(`/api/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/api/properties/${id}`, {
      method: 'DELETE',
    });
  }

  async incrementViewCount(id: string) {
    try {
      await this.request(`/api/properties/${id}/increment-views`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Failed to increment view count:', error);
    }
  }

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const url = `${base}/api/media/upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.message || `Upload failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    return await response.json();
  }

  // Geocode address to coordinates
  async geocode(address: string): Promise<GeocodeResult[]> {
    return this.request<GeocodeResult[]>(`/api/geocode?address=${encodeURIComponent(address)}`);
  }

  // Search properties with filters
  async searchProperties(filters: SearchFilters): Promise<GeoJSONFeatureCollection> {
    let properties: any[] = [];

    try {
      // Primary: Call the NestJS backend
      const response = await this.request<any>('/api/properties', { skipLogout: true });
      properties = Array.isArray(response) ? response : (response?.data || []);
      console.log('📡 API Client - properties from backend:', properties?.length);
    } catch (err) {
      console.warn('⚠️ Backend unreachable, falling back to direct Supabase query');

      // Secondary: Fallback to direct Supabase query
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent:agents (
            *,
            photo:media ( url )
          ),
          images:properties_images (
            image:media ( url ),
            tag,
            caption
          ),
          thumbnail:media ( url ),
          nearby_places:properties_nearby_places ( * )
        `)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Supabase fallback failed:', error);
        throw err; // Re-throw original backend error if fallback also fails
      }

      properties = data || [];
      console.log('✅ Supabase fallback successful:', properties.length, 'properties found');
    }

    // Perform client-side filtering to match the filters from SearchTool
    let filteredProperties = properties || [];

    if (filters.listingType) {
      filteredProperties = filteredProperties.filter((p: any) => p.listing_type === filters.listingType);
    }

    if (filters.propertyType) {
      const types = filters.propertyType.split(',').map(t => t.trim().toLowerCase());
      filteredProperties = filteredProperties.filter((p: any) => types.includes(p.property_type?.toLowerCase()));
    }

    if (filters.priceMin) {
      filteredProperties = filteredProperties.filter((p: any) => p.price >= (filters.priceMin || 0));
    }

    if (filters.priceMax) {
      filteredProperties = filteredProperties.filter((p: any) => p.price <= (filters.priceMax || Infinity));
    }

    if (filters.bedrooms && filters.bedrooms !== 'any') {
      if (filters.bedrooms === '4+') {
        filteredProperties = filteredProperties.filter((p: any) => (p.bedrooms || 0) >= 4);
      } else {
        filteredProperties = filteredProperties.filter((p: any) => (p.bedrooms || 0) === parseInt(filters.bedrooms as string));
      }
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filteredProperties = filteredProperties.filter((p: any) =>
        p.title?.toLowerCase().includes(loc) ||
        p.address?.toLowerCase().includes(loc) ||
        p.project_name?.toLowerCase().includes(loc)
      );
    }

    // Transform to GeoJSON
    const features: GeoJSONFeature[] = filteredProperties.map((prop: any) => {
      // Coordinates
      const lat = prop.lat ?? prop.location_lat ?? 13.7563;
      const lng = prop.lng ?? prop.location_lng ?? 100.5018;

      // Agent
      const agentData = prop.agent ? {
        id: prop.agent.id?.toString(),
        name: prop.agent.name,
        role: prop.agent.role || 'Agent',
        image_url: formatMediaUrl(prop.agent.photo?.url),
        phone: prop.agent.phone,
        email: prop.agent.email,
        lineId: prop.agent.lineId,
        verified: prop.agent.verified
      } : undefined;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          id: prop.id?.toString(),
          title: prop.title,
          description: prop.description || '',
          address: prop.address || '',
          price: prop.price || 0,
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          livingArea: prop.living_area || 0,
          landArea: prop.land_area || 0,
          sqft: prop.living_area || 0,
          yearBuilt: prop.year_built,
          floors: prop.floors,
          parking: prop.parking,
          propertyType: prop.property_type || 'Unknown',
          listingType: prop.listing_type || 'sale',
          thumbnail: formatMediaUrl(prop.thumbnail?.url),
          images: (prop.images || []).map((img: any) => formatMediaUrl(img.image?.url)).filter(Boolean),
          lng: lng,
          lat: lat,
          location: prop.location,
          project_name: prop.project_name,
          direction: prop.direction,
          ownership: prop.ownership,
          common_fee: prop.common_fee,
          decoration: prop.decoration,
          view_count: prop.view_count || 0,
          updatedAt: prop.updated_at,
          createdAt: prop.created_at,
          featured: prop.featured,
          pet_friendly: prop.pet_friendly || false,
          indoor_amenities: prop.indoor_amenities || {},
          project_amenities: prop.project_amenities || {},
          nearby_places: (prop.nearby_places || []).map((np: any) => ({
            id: np.id,
            name: np.name,
            distance: np.distance,
            category: np.category,
            icon: np.icon
          })),
          agent: agentData
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }

  // Get nearby properties (radius search)
  async getNearbyProperties(lat: number, lng: number, radius: number = 5): Promise<Property[]> {
    return [];
  }

  // Get property details by ID
  async getProperty(id: string): Promise<Property | null> {
    const prop = await this.request<any>(`/api/properties/${id}`, { skipLogout: true });
    if (!prop) return null;

    const lat = prop.lat ?? prop.location_lat ?? 13.7563;
    const lng = prop.lng ?? prop.location_lng ?? 100.5018;

    const agentData = prop.agent ? {
      id: prop.agent.id?.toString(),
      name: prop.agent.name,
      role: prop.agent.role || 'Agent',
      image_url: formatMediaUrl(prop.agent.photo?.url),
      phone: prop.agent.phone,
      email: prop.agent.email,
      lineId: prop.agent.lineId,
      verified: prop.agent.verified
    } : undefined;

    return {
      id: prop.id?.toString(),
      title: prop.title,
      description: prop.description || '',
      address: prop.address || '',
      price: prop.price || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      livingArea: prop.living_area || 0,
      sqft: prop.living_area || 0,
      landArea: prop.land_area || 0,
      yearBuilt: prop.year_built,
      floors: prop.floors,
      parking: prop.parking,
      propertyType: prop.property_type || 'Unknown',
      listingType: prop.listing_type || 'sale',
      thumbnail: formatMediaUrl(prop.thumbnail?.url),
      images: (prop.images || []).map((img: any) => formatMediaUrl(img.image?.url)).filter(Boolean),
      lng: lng,
      lat: lat,
      location: prop.location,
      project_name: prop.project_name,
      direction: prop.direction,
      ownership: prop.ownership,
      common_fee: prop.common_fee,
      decoration: prop.decoration,
      view_count: prop.view_count || 0,
      updatedAt: prop.updated_at,
      createdAt: prop.created_at,
      featured: prop.featured,
      indoor_amenities: prop.indoor_amenities || {},
      project_amenities: prop.project_amenities || {},
      nearby_places: (prop.nearby_places || []).map((np: any) => ({
        id: np.id,
        name: np.name,
        distance: np.distance,
        category: np.category,
        icon: np.icon
      })),
      agent: agentData
    };
  }

  // Get featured properties
  async getFeaturedProperties(): Promise<Property[]> {
    // Use backend for consistency if possible, but keep featured as specialized call
    const response = await this.request<any>('/api/properties', { skipLogout: true });
    const properties = Array.isArray(response) ? response : (response?.data || []);
    return properties.filter((p: any) => p.featured).slice(0, 6).map((prop: any) => ({
      id: prop.id.toString(),
      title: prop.title,
      price: prop.price,
      address: prop.address,
      thumbnail: formatMediaUrl(prop.thumbnail?.url),
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      livingArea: prop.living_area || 0,
      propertyType: prop.property_type || 'Unknown',
      listingType: prop.listing_type || 'sale',
      lat: prop.lat ?? 13.7563,
      lng: prop.lng ?? 100.5018,
    } as Property));
  }
}

export const apiClient = new APIClient();
export default APIClient;
