import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/api-client';
import { Save, Camera, MapPin, ChevronLeft, Building2, Ruler, BedDouble, Bath, Info, X, Star, Upload, Trash2, Image as ImageIcon, Layers, Car, Compass, Home, Plus, Settings, Locate, Armchair, Wind, Droplets, Lock, Flame, Tv, Refrigerator as Fridge, Wifi, Cpu, ArrowUpCircle, Waves, Dumbbell, Shield, Trees, Box, Video } from 'lucide-react';

// Leaflet types (we don't import the library directly to avoid SSR issues)
// We'll use window.L or dynamic import

interface PropertyImage {
    file?: File;
    url: string;
    id?: string; // If already uploaded to Payload
    tag: string;
    isMain: boolean;
}

interface NearbyPlaceInput {
    name: string;
    distance: string;
    category: string;
    icon: string;
}

const DIRECTION_OPTIONS = [
    { value: '', label: 'Select Direction' },
    { value: 'North', label: 'North' },
    { value: 'South', label: 'South' },
    { value: 'East', label: 'East' },
    { value: 'West', label: 'West' },
    { value: 'Northeast', label: 'Northeast' },
    { value: 'Northwest', label: 'Northwest' },
    { value: 'Southeast', label: 'Southeast' },
    { value: 'Southwest', label: 'Southwest' },
];

const OWNERSHIP_OPTIONS = [
    { value: '', label: 'Select Tenure' },
    { value: 'Freehold', label: 'Freehold' },
    { value: 'Leasehold', label: 'Leasehold' },
    { value: 'Co-ownership', label: 'Co-ownership' },
];

const DECORATION_OPTIONS = [
    { value: '', label: 'Select Furnishing' },
    { value: 'Fully Furnished', label: 'Fully Furnished' },
    { value: 'Partially Furnished', label: 'Partially Furnished' },
    { value: 'Unfurnished', label: 'Unfurnished' },
    { value: 'Built-in Only', label: 'Built-in Only' },
];

const NEARBY_CATEGORY_OPTIONS = [
    { value: 'transport', label: 'Transport' },
    { value: 'shop', label: 'Shopping' },
    { value: 'edu', label: 'Education' },
    { value: 'hosp', label: 'Hospital' },
];

const NEARBY_ICON_OPTIONS = [
    { value: 'train', label: 'Train/BTS/MRT' },
    { value: 'car', label: 'Car/Road' },
    { value: 'airport', label: 'Airport' },
    { value: 'mall', label: 'Shopping Mall' },
    { value: 'market', label: 'Market' },
    { value: 'supermarket', label: 'Supermarket' },
    { value: 'school', label: 'School' },
    { value: 'university', label: 'University' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
];

const INDOOR_AMENITY_KEYS = [
    { key: 'furniture', label: 'Furniture', icon: Armchair },
    { key: 'air_con', label: 'Air Conditioning', icon: Wind },
    { key: 'water_heater', label: 'Water Heater', icon: Droplets },
    { key: 'digital_lock', label: 'Digital Door Lock', icon: Lock },
    { key: 'bathtub', label: 'Bathtub', icon: Bath },
    { key: 'stove', label: 'Electric/Gas Stove', icon: Flame },
    { key: 'tv', label: 'Television', icon: Tv },
    { key: 'refrigerator', label: 'Refrigerator', icon: Fridge },
    { key: 'internet', label: 'Internet/WiFi', icon: Wifi },
    { key: 'smart_home', label: 'Smart Home System', icon: Cpu },
];

const PROJECT_AMENITY_KEYS = [
    { key: 'lift', label: 'Elevator/Lift', icon: ArrowUpCircle },
    { key: 'parking_facility', label: 'Parking Facility', icon: Car },
    { key: 'pool', label: 'Swimming Pool', icon: Waves },
    { key: 'gym', label: 'Fitness/Gym', icon: Dumbbell },
    { key: 'cctv', label: 'CCTV', icon: Video },
    { key: 'security', label: '24-Hour Security', icon: Shield },
    { key: 'garden', label: 'Garden/Green Area', icon: Trees },
    { key: 'storage', label: 'Storage Room', icon: Box },
];

const THAI_PROVINCES = [
    "Bangkok", "Amnat Charoen", "Ang Thong", "Bueng Kan", "Buriram", "Chachoengsao", "Chai Nat", "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chonburi", "Chumphon", "Kalasin", "Kamphaeng Phet", "Kanchanaburi", "Khon Kaen", "Krabi", "Lampang", "Lamphun", "Loei", "Lopburi", "Mae Hong Son", "Maha Sarakham", "Mukdahan", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Phanom", "Nakhon Ratchasima", "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lamphu", "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani", "Phang Nga", "Phatthalung", "Phayao", "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok", "Phra Nakhon Si Ayutthaya", "Phrae", "Phuket", "Prachinburi", "Prachuap Khiri Khan", "Ranong", "Ratchaburi", "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Saraburi", "Satun", "Sing Buri", "Sisaket", "Songkhla", "Sukhothai", "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat", "Ubon Ratchathani", "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon"
].sort();

export default function PropertyForm({ initialData }: { initialData?: any }) {
    const [loading, setLoading] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const currentUserMarkerRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial State Structure
    const [formData, setFormData] = useState(() => {
        // Map initial data if editing
        if (initialData) {
            return {
                title: initialData.title || '',
                project_name: initialData.project_name || '',
                price: initialData.price || '',
                listingType: initialData.listingType || 'sale',
                propertyType: initialData.propertyType || 'condo',
                address: initialData.address || '',
                description: initialData.description || '',
                bedrooms: initialData.stats?.bedrooms || 1,
                bathrooms: initialData.stats?.bathrooms || 1,
                sqft: initialData.stats?.livingArea || 35,
                landArea: initialData.stats?.landArea || '',
                floors: initialData.stats?.floors || 1,
                parking: initialData.stats?.parking || 0,
                yearBuilt: initialData.stats?.yearBuilt || '',
                direction: initialData.details?.direction || '',
                ownership: initialData.details?.ownership || '',
                decoration: initialData.details?.decoration || '',
                common_fee: initialData.details?.common_fee || '',
                location: initialData.location || {
                    lat: 13.7563,
                    lng: 100.5018,
                    province: '',
                    district: '',
                    sub_district: '',
                    postcode: ''
                },
                images: [] as PropertyImage[],
                indoor_amenities: initialData.indoor_amenities || {} as Record<string, boolean>,
                project_amenities: initialData.project_amenities || {} as Record<string, boolean>,
                nearby_places: (initialData.nearby_places || []) as NearbyPlaceInput[],
            };
        }
        return {
            title: '',
            project_name: '',
            price: '',
            listingType: 'sale',
            propertyType: 'condo',
            address: '',
            description: '',
            bedrooms: 1,
            bathrooms: 1,
            sqft: 35,
            landArea: '',
            floors: 1,
            parking: 0,
            yearBuilt: '',
            direction: '',
            ownership: '',
            decoration: '',
            common_fee: '',
            location: {
                lat: 13.7563,
                lng: 100.5018,
                province: '',
                district: '',
                sub_district: '',
                postcode: ''
            },
            images: [] as PropertyImage[],
            indoor_amenities: {} as Record<string, boolean>,
            project_amenities: {} as Record<string, boolean>,
            nearby_places: [] as NearbyPlaceInput[],
        };
    });

    // Load initial images if editing
    useEffect(() => {
        if (initialData?.images && initialData.images.length > 0) {
            const loadedImages: PropertyImage[] = initialData.images.map((imgItem: any) => ({
                id: typeof imgItem.image === 'object' ? imgItem.image.id : imgItem.image,
                url: typeof imgItem.image === 'object' ? imgItem.image.url : '', // Logic for URL construction
                tag: imgItem.tag || 'other',
                isMain: initialData.thumbnail?.id === (typeof imgItem.image === 'object' ? imgItem.image.id : imgItem.image)
            }));

            // If thumbnail exists but not in images array (legacy data), add it
            if (initialData.thumbnail && !loadedImages.some(img => img.isMain)) {
                const thumbId = typeof initialData.thumbnail === 'object' ? initialData.thumbnail.id : initialData.thumbnail;
                const thumbUrl = typeof initialData.thumbnail === 'object' ? initialData.thumbnail.url : '';
                loadedImages.unshift({
                    id: thumbId,
                    url: thumbUrl,
                    tag: 'exterior', // Default
                    isMain: true
                });
            }

            setFormData(prev => ({ ...prev, images: loadedImages }));
        }
    }, [initialData]);


    // Load Leaflet dynamically
    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window === 'undefined') return;

            // Check if Leaflet CSS is already added
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Add Pulse Animation CSS
            if (!document.getElementById('map-pulse-css')) {
                const style = document.createElement('style');
                style.id = 'map-pulse-css';
                style.innerHTML = `
                    @keyframes map-pulse {
                        0% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.5); opacity: 0.3; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                    .current-user-pulse {
                        position: relative;
                        width: 12px;
                        height: 12px;
                        background: #007AFF;
                        border: 2px solid white;
                        border-radius: 50%;
                    }
                    .current-user-pulse::after {
                        content: '';
                        position: absolute;
                        top: -2px;
                        left: -2px;
                        width: 12px;
                        height: 12px;
                        background: #007AFF;
                        border-radius: 50%;
                        animation: map-pulse 2s infinite;
                        z-index: -1;
                    }
                `;
                document.head.appendChild(style);
            }

            // Dynamic import
            // @ts-ignore
            if (!window.L) {
                // @ts-ignore
                const L = await import('leaflet');
                // @ts-ignore
                window.L = L.default || L;
            }
            setLeafletLoaded(true);
        };

        loadLeaflet();
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!leafletLoaded || !mapContainerRef.current) return;
        // @ts-ignore
        const L = window.L;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView(
                [formData.location.lat, formData.location.lng],
                13
            );

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
            }).addTo(map);

            const icon = L.divIcon({
                className: 'custom-map-marker',
                html: `<svg width="100%" height="100%" viewBox="0 0 384 512" version="1.1" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">
                    <path fill="#EA4335" d="M384 192c0 87.4-117 243-168.3 307.2c-12.3 15.3-35.1 15.3-47.4 0C117 435 0 279.4 0 192C0 86 86 0 192 0s192 86 192 192z"/>
                    <circle fill="#9F1111" cx="192" cy="192" r="80"/>
                </svg>`,
                iconSize: [28, 37],
                iconAnchor: [14, 37],
                popupAnchor: [0, -37]
            });

            const marker = L.marker(
                [formData.location.lat, formData.location.lng],
                { draggable: true, icon }
            ).addTo(map);

            marker.on('dragend', (e: any) => {
                const latLng = e.target.getLatLng();
                setFormData((prev: any) => ({
                    ...prev,
                    location: { ...prev.location, lat: latLng.lat, lng: latLng.lng }
                }));
            });

            mapInstanceRef.current = map;
            markerRef.current = marker;

            // Fix map sizing
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [leafletLoaded]);

    // ── Helper: clamp coordinates to valid WGS-84 bounds ──
    const clampCoords = (lat: number, lng: number) => ({
        lat: Math.max(-90, Math.min(90, isNaN(lat) ? 13.7563 : lat)),
        lng: Math.max(-180, Math.min(180, isNaN(lng) ? 100.5018 : lng)),
    });

    // Sync Map with Form Data Changes (e.g. manual input or address parsing)
    useEffect(() => {
        if (!mapInstanceRef.current || !markerRef.current) return;

        const { lat: rawLat, lng: rawLng } = formData.location;
        const { lat, lng } = clampCoords(rawLat, rawLng);

        // If the stored value is out-of-range, snap it back silently
        if (rawLat !== lat || rawLng !== lng) {
            setFormData((prev: any) => ({
                ...prev,
                location: { ...prev.location, lat, lng },
            }));
            return; // the state update will re-trigger this effect with valid values
        }

        const currentPos = markerRef.current.getLatLng();
        // Only update if sufficiently different to prevent loop/jitter
        if (Math.abs(currentPos.lat - lat) > 0.00001 || Math.abs(currentPos.lng - lng) > 0.00001) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
        }
    }, [formData.location]);

    // Auto-detect coordinates from Address field
    useEffect(() => {
        const address = formData.address;
        // Simple regex for "Lat, Lng" format
        // e.g. 12.345, 100.123
        const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        const match = address.match(coordRegex);

        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[3]);

            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                // Update location if different
                if (Math.abs(formData.location.lat - lat) > 0.0001 || Math.abs(formData.location.lng - lng) > 0.0001) {
                    setFormData((prev: any) => ({
                        ...prev,
                        location: { lat, lng }
                    }));
                }
            }
        }
    }, [formData.address]);


    /* ─── Image Handling ─── */

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages: PropertyImage[] = Array.from(e.target.files).map(file => ({
                file,
                url: URL.createObjectURL(file), // Preview URL
                tag: 'other', // Default tag
                isMain: false // Default not main
            }));

            setFormData((prev: any) => {
                const updated = [...prev.images, ...newImages];
                // If no main image exists, make the first one main
                if (!updated.some((img: PropertyImage) => img.isMain) && updated.length > 0) {
                    updated[0].isMain = true;
                }
                return { ...prev, images: updated };
            });
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev: any) => {
            const newImages = [...prev.images];
            const wasMain = newImages[index].isMain;
            newImages.splice(index, 1);
            if (wasMain && newImages.length > 0) {
                newImages[0].isMain = true; // Reassign main to first available
            }
            return { ...prev, images: newImages };
        });
    };

    const setMainImage = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            images: prev.images.map((img: PropertyImage, i: number) => ({
                ...img,
                isMain: i === index
            }))
        }));
    };

    const setImageTag = (index: number, tag: string) => {
        setFormData((prev: any) => ({
            ...prev,
            images: prev.images.map((img: PropertyImage, i: number) => i === index ? { ...img, tag } : img)
        }));
    };

    /* ─── Nearby Places Management ─── */

    const addNearbyPlace = () => {
        setFormData((prev: any) => ({
            ...prev,
            nearby_places: [...prev.nearby_places, { name: '', distance: '', category: 'transport', icon: 'train' }]
        }));
    };

    const removeNearbyPlace = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            nearby_places: prev.nearby_places.filter((_: any, i: number) => i !== index)
        }));
    };

    const updateNearbyPlace = (index: number, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            nearby_places: prev.nearby_places.map((place: any, i: number) =>
                i === index ? { ...place, [field]: value } : place
            )
        }));
    };

    /* ─── Amenity Toggle ─── */

    const toggleIndoorAmenity = (key: string) => {
        setFormData((prev: any) => ({
            ...prev,
            indoor_amenities: {
                ...prev.indoor_amenities,
                [key]: !prev.indoor_amenities[key]
            }
        }));
    };

    const toggleProjectAmenity = (key: string) => {
        setFormData((prev: any) => ({
            ...prev,
            project_amenities: {
                ...prev.project_amenities,
                [key]: !prev.project_amenities[key]
            }
        }));
    };



    /* ─── Map Helpers ─── */

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // @ts-ignore
                const L = window.L;

                // 1. Update the property pin location (primary goal)
                setFormData((prev: any) => ({
                    ...prev,
                    location: { ...prev.location, lat: latitude, lng: longitude }
                }));

                // 2. Add or move the current user's pulsing blue dot
                if (mapInstanceRef.current) {
                    if (currentUserMarkerRef.current) {
                        currentUserMarkerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        const pulseIcon = L.divIcon({
                            className: 'pulse-container',
                            html: '<div class="current-user-pulse"></div>',
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                        });
                        currentUserMarkerRef.current = L.marker([latitude, longitude], { icon: pulseIcon }).addTo(mapInstanceRef.current);
                    }
                    mapInstanceRef.current.setView([latitude, longitude], 16);
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location. Please ensure location services are enabled.');
            }
        );
    };


    /* ─── Submission Logic ─── */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation for required fields
        const errors: string[] = [];
        if (!formData.title.trim()) errors.push('Title');
        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) errors.push('Price');
        if (!formData.propertyType) errors.push('Property Type');

        if (errors.length > 0) {
            alert(`Please fill in the following required fields: ${errors.join(', ')}`);
            return;
        }

        setLoading(true);

        try {
            // 1. Upload new images sequentially
            const processedImages = await Promise.all(formData.images.map(async (img) => {
                if (img.file) {
                    // It's a new file, upload it
                    const uploadRes = await apiClient.uploadMedia(img.file);
                    return {
                        ...img,
                        id: uploadRes.doc.id // Get ID from response
                    };
                }
                return img; // Already existing (has ID)
            }));

            // 2. Prepare payload
            const mainImage = processedImages.find(img => img.isMain) || processedImages[0];

            const submitData = {
                title: formData.title.trim(),
                project_name: formData.project_name || undefined,
                price: parseFloat(formData.price),
                listingType: formData.listingType,
                propertyType: formData.propertyType,
                address: formData.address,
                description: formData.description,
                location: {
                    lat: formData.location.lat,
                    lng: formData.location.lng,
                    province: formData.location.province,
                    district: formData.location.district,
                    sub_district: formData.location.sub_district,
                    postcode: formData.location.postcode,
                },
                stats: {
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    livingArea: formData.sqft,
                    landArea: formData.landArea ? parseFloat(formData.landArea) : undefined,
                    floors: formData.floors,
                    parking: formData.parking,
                    yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
                },
                details: {
                    direction: formData.direction || undefined,
                    ownership: formData.ownership || undefined,
                    decoration: formData.decoration || undefined,
                    common_fee: formData.common_fee ? parseFloat(formData.common_fee) : undefined,
                },
                indoor_amenities: formData.indoor_amenities,
                project_amenities: formData.project_amenities,
                nearby_places: formData.nearby_places.filter((p: NearbyPlaceInput) => p.name.trim()),
                thumbnail: mainImage ? mainImage.id : undefined,
                images: processedImages.map(img => ({
                    image: img.id,
                    tag: img.tag
                }))
            };

            if (initialData?.id) {
                await apiClient.updateProperty(initialData.id, submitData);
            } else {
                await apiClient.createProperty(submitData);
            }
            window.location.href = '/dashboard';
        } catch (error: any) {
            console.error(error);
            const message = error?.message || 'Unable to save property. Please check inputs and try again.';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pf-root">
            {/* Header / Actions */}
            <div className="pf-top-bar">
                <div className="pf-titles">
                    <a href="/dashboard" className="pf-back-link">
                        <ChevronLeft size={14} />
                        <span>Back to Dashboard</span>
                    </a>
                    <h1 className="pf-page-title">{initialData ? 'Edit Property' : 'New Listing'}</h1>
                    <p className="pf-page-sub">* Please fill in information according to international standards.</p>
                </div>
                <div className="pf-actions">
                    <a href="/dashboard" className="pf-btn pf-btn-secondary">Cancel</a>
                    <button onClick={handleSubmit} disabled={loading} className="pf-btn pf-btn-primary">
                        {loading ? <span className="pf-loader"></span> : <Save size={16} />}
                        <span>Save Listing</span>
                    </button>
                </div>
            </div>

            <div className="pf-grid-layout">
                {/* ─── Column 1: Main Info ─── */}
                <div className="pf-col-left">
                    {/* Basic Info */}
                    <div className="pf-card">
                        <div className="pf-card-header">
                            <div className="pf-icon-box primary"><Info size={18} /></div>
                            <h3>Property Foundation</h3>
                        </div>

                        <div className="pf-form-group">
                            <label>Project Name or Title</label>
                            <input
                                type="text"
                                className="pf-input pf-input-lg"
                                placeholder="e.g. Luxury Penthouse in Thonglor"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="pf-form-group">
                            <label>Project / Development Name</label>
                            <input
                                type="text"
                                className="pf-input"
                                placeholder="e.g. Casa Ville Rangsit, The Line Jatujak"
                                value={formData.project_name}
                                onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                            />
                        </div>

                        <div className="pf-row-3">
                            <div className="pf-form-group">
                                <label>Asking Price (THB)</label>
                                <input
                                    type="number"
                                    className="pf-input"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className="pf-form-group">
                                <label>Listing Type</label>
                                <div className="pf-select-wrapper">
                                    <select
                                        className="pf-select"
                                        value={formData.listingType}
                                        onChange={e => setFormData({ ...formData, listingType: e.target.value })}
                                    >
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pf-form-group">
                                <label>Property Type</label>
                                <div className="pf-select-wrapper">
                                    <select
                                        className="pf-select"
                                        value={formData.propertyType}
                                        onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                                    >
                                        <option value="condo">Condominium</option>
                                        <option value="house">Detached House</option>
                                        <option value="townhouse">Townhouse</option>
                                        <option value="villa">Villa</option>
                                        <option value="land">Land</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="apartment">Apartment</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pf-form-group">
                            <label>Detailed Story</label>
                            <textarea
                                className="pf-textarea"
                                rows={6}
                                placeholder="Tell the story and highlights of this property..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="pf-card">
                        <div className="pf-card-header">
                            <div className="pf-icon-box primary"><MapPin size={18} /></div>
                            <h3>Geographical Position</h3>
                        </div>

                        <div className="pf-form-group">
                            <label>Address or Location</label>
                            <textarea
                                className="pf-textarea"
                                rows={2}
                                placeholder="Full address (House number, Street, Village...)"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="pf-structured-address" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div className="pf-form-group">
                                <label>Province</label>
                                <div className="pf-select-wrapper">
                                    <select
                                        className="pf-select"
                                        value={formData.location.province}
                                        onChange={e => setFormData({
                                            ...formData,
                                            location: { ...formData.location, province: e.target.value }
                                        })}
                                    >
                                        <option value="">Select Province</option>
                                        {THAI_PROVINCES.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pf-form-group">
                                <label>District / Area</label>
                                <input
                                    type="text"
                                    className="pf-input"
                                    placeholder="e.g. Watthana, Bang Rak"
                                    value={formData.location.district}
                                    onChange={e => setFormData({
                                        ...formData,
                                        location: { ...formData.location, district: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="pf-form-group">
                                <label>Sub-district / Khwaeng</label>
                                <input
                                    type="text"
                                    className="pf-input"
                                    placeholder="e.g. Thonglor, Silom"
                                    value={formData.location.sub_district}
                                    onChange={e => setFormData({
                                        ...formData,
                                        location: { ...formData.location, sub_district: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="pf-form-group">
                                <label>Postcode</label>
                                <input
                                    type="text"
                                    className="pf-input"
                                    placeholder="e.g. 10110"
                                    value={formData.location.postcode}
                                    onChange={e => setFormData({
                                        ...formData,
                                        location: { ...formData.location, postcode: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="pf-map-section">
                            <div className="pf-map-header">
                                <label>Interactive Map Pin</label>
                                <div className="pf-coords-inputs" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>LAT:</span>
                                        <input
                                            type="number"
                                            className="pf-input pf-input-sm"
                                            style={{ width: '100px', padding: '4px 8px' }}
                                            value={formData.location.lat}
                                            min={-90}
                                            max={90}
                                            step={0.000001}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val)) {
                                                    const clamped = Math.max(-90, Math.min(90, val));
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        location: { ...prev.location, lat: clamped }
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>LNG:</span>
                                        <input
                                            type="number"
                                            className="pf-input pf-input-sm"
                                            style={{ width: '100px', padding: '4px 8px' }}
                                            value={formData.location.lng}
                                            min={-180}
                                            max={180}
                                            step={0.000001}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val)) {
                                                    const clamped = Math.max(-180, Math.min(180, val));
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        location: { ...prev.location, lng: clamped }
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pf-map-wrapper" style={{ position: 'relative' }}>
                                <div className="pf-map-container" ref={mapContainerRef}></div>
                                <button
                                    type="button"
                                    onClick={handleUseCurrentLocation}
                                    style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '10px',
                                        zIndex: 1000,
                                        background: 'white',
                                        border: '2px solid rgba(0,0,0,0.2)',
                                        borderRadius: '4px',
                                        width: '34px',
                                        height: '34px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
                                        color: '#333'
                                    }}
                                    title="Show My Location"
                                >
                                    <Locate size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ─── Additional Details Card ─── */}
                    <div className="pf-card">
                        <div className="pf-card-header">
                            <div className="pf-icon-box primary"><Settings size={18} /></div>
                            <h3>Additional Details</h3>
                        </div>

                        <div className="pf-row-3">
                            <div className="pf-form-group">
                                <label>Facing Direction</label>
                                <div className="pf-select-wrapper">
                                    <select
                                        className="pf-select"
                                        value={formData.direction}
                                        onChange={e => setFormData({ ...formData, direction: e.target.value })}
                                    >
                                        {DIRECTION_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pf-form-group">
                                <label>Tenure / Ownership</label>
                                <div className="pf-select-wrapper">
                                    <select
                                        className="pf-select"
                                        value={formData.ownership}
                                        onChange={e => setFormData({ ...formData, ownership: e.target.value })}
                                    >
                                        {OWNERSHIP_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pf-form-group">
                                <label>Furnishing</label>
                                <div className="pf-select-wrapper">
                                    <select
                                        className="pf-select"
                                        value={formData.decoration}
                                        onChange={e => setFormData({ ...formData, decoration: e.target.value })}
                                    >
                                        {DECORATION_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pf-row-3">
                            <div className="pf-form-group">
                                <label>Common Fee (THB/sq.m.)</label>
                                <input
                                    type="number"
                                    className="pf-input"
                                    placeholder="e.g. 50"
                                    value={formData.common_fee}
                                    onChange={e => setFormData({ ...formData, common_fee: e.target.value })}
                                />
                            </div>
                            <div className="pf-form-group">
                                <label>Year Built</label>
                                <input
                                    type="number"
                                    className="pf-input"
                                    placeholder="e.g. 2020"
                                    value={formData.yearBuilt}
                                    onChange={e => setFormData({ ...formData, yearBuilt: e.target.value })}
                                />
                            </div>
                            <div className="pf-form-group">
                                <label>Land Area (sq.wa.)</label>
                                <input
                                    type="number"
                                    className="pf-input"
                                    placeholder="e.g. 50"
                                    value={formData.landArea}
                                    onChange={e => setFormData({ ...formData, landArea: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ─── Amenities Card ─── */}
                    <div className="pf-card">
                        <div className="pf-card-header">
                            <div className="pf-icon-box primary"><Home size={18} /></div>
                            <h3>Amenities</h3>
                        </div>

                        <div className="pf-amenity-section">
                            <label className="pf-amenity-group-label">Indoor Amenities</label>
                            <div className="pf-amenity-grid">
                                {INDOOR_AMENITY_KEYS.map(item => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={`pf-amenity-chip ${formData.indoor_amenities[item.key] ? 'active' : ''}`}
                                        onClick={() => toggleIndoorAmenity(item.key)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <item.icon size={14} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pf-amenity-section">
                            <label className="pf-amenity-group-label">Project Amenities</label>
                            <div className="pf-amenity-grid">
                                {PROJECT_AMENITY_KEYS.map(item => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={`pf-amenity-chip ${formData.project_amenities[item.key] ? 'active' : ''}`}
                                        onClick={() => toggleProjectAmenity(item.key)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <item.icon size={14} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── Nearby Places Card ─── */}
                    <div className="pf-card">
                        <div className="pf-card-header">
                            <div className="pf-icon-box primary"><MapPin size={18} /></div>
                            <h3>Nearby Places</h3>
                            <button type="button" className="pf-header-add-btn" onClick={addNearbyPlace}>
                                <Plus size={14} /> Add
                            </button>
                        </div>

                        {formData.nearby_places.length === 0 ? (
                            <div className="pf-empty-nearby">
                                <MapPin size={24} style={{ opacity: 0.3 }} />
                                <p>No nearby places added yet. Click "Add" to list nearby BTS, schools, hospitals, etc.</p>
                            </div>
                        ) : (
                            <div className="pf-nearby-list">
                                {formData.nearby_places.map((place: NearbyPlaceInput, idx: number) => (
                                    <div key={idx} className="pf-nearby-item">
                                        <div className="pf-nearby-row">
                                            <input
                                                type="text"
                                                className="pf-input"
                                                placeholder="Place name (e.g. BTS Phrom Phong)"
                                                value={place.name}
                                                onChange={e => updateNearbyPlace(idx, 'name', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="pf-input pf-input-sm"
                                                placeholder="e.g. 2.1 km"
                                                value={place.distance}
                                                onChange={e => updateNearbyPlace(idx, 'distance', e.target.value)}
                                            />
                                            <button type="button" className="pf-del-nearby" onClick={() => removeNearbyPlace(idx)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <div className="pf-nearby-row">
                                            <div className="pf-select-wrapper" style={{ flex: 1 }}>
                                                <select
                                                    className="pf-select pf-select-sm"
                                                    value={place.category}
                                                    onChange={e => updateNearbyPlace(idx, 'category', e.target.value)}
                                                >
                                                    {NEARBY_CATEGORY_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="pf-select-wrapper" style={{ flex: 1 }}>
                                                <select
                                                    className="pf-select pf-select-sm"
                                                    value={place.icon}
                                                    onChange={e => updateNearbyPlace(idx, 'icon', e.target.value)}
                                                >
                                                    {NEARBY_ICON_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Column 2: Side Info ─── */}
                <div className="pf-col-right">
                    <div className="pf-card">
                        <div className="pf-card-header">
                            <div className="pf-icon-box primary"><Building2 size={18} /></div>
                            <h3>Structure & Layout</h3>
                        </div>

                        <div className="pf-structure-list">
                            <div className="pf-counter-item">
                                <div className="pf-counter-icon"><BedDouble size={16} /></div>
                                <div className="pf-counter-info">
                                    <div className="pf-counter-label">Bedrooms</div>
                                    <div className="pf-counter-sub">Sleeping Areas</div>
                                </div>
                                <div className="pf-counter-ctrl">
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, bedrooms: Math.max(0, prev.bedrooms - 1) }))}>-</button>
                                    <span>{formData.bedrooms}</span>
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, bedrooms: prev.bedrooms + 1 }))}>+</button>
                                </div>
                            </div>

                            <div className="pf-counter-item">
                                <div className="pf-counter-icon"><Bath size={16} /></div>
                                <div className="pf-counter-info">
                                    <div className="pf-counter-label">Bathrooms</div>
                                    <div className="pf-counter-sub">Washrooms</div>
                                </div>
                                <div className="pf-counter-ctrl">
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, bathrooms: Math.max(0, prev.bathrooms - 1) }))}>-</button>
                                    <span>{formData.bathrooms}</span>
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, bathrooms: prev.bathrooms + 1 }))}>+</button>
                                </div>
                            </div>

                            <div className="pf-counter-item">
                                <div className="pf-counter-icon"><Layers size={16} /></div>
                                <div className="pf-counter-info">
                                    <div className="pf-counter-label">Floors</div>
                                    <div className="pf-counter-sub">Number of Storeys</div>
                                </div>
                                <div className="pf-counter-ctrl">
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, floors: Math.max(1, prev.floors - 1) }))}>-</button>
                                    <span>{formData.floors}</span>
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, floors: prev.floors + 1 }))}>+</button>
                                </div>
                            </div>

                            <div className="pf-counter-item">
                                <div className="pf-counter-icon"><Car size={16} /></div>
                                <div className="pf-counter-info">
                                    <div className="pf-counter-label">Parking</div>
                                    <div className="pf-counter-sub">Car Spaces</div>
                                </div>
                                <div className="pf-counter-ctrl">
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, parking: Math.max(0, prev.parking - 1) }))}>-</button>
                                    <span>{formData.parking}</span>
                                    <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, parking: prev.parking + 1 }))}>+</button>
                                </div>
                            </div>

                            <div className="pf-input-item">
                                <div className="pf-counter-icon"><Ruler size={16} /></div>
                                <div className="pf-counter-info">
                                    <div className="pf-counter-label">Floor Area</div>
                                    <div className="pf-counter-sub">Usable Space</div>
                                </div>
                                <div className="pf-area-input">
                                    <input
                                        type="number"
                                        value={formData.sqft}
                                        onChange={e => setFormData({ ...formData, sqft: parseInt(e.target.value) || 0 })}
                                    />
                                    <span>SQ.M</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Media in Side Column */}
                    <div className="pf-card">
                        <div className="pf-card-header">
                            <div className="pf-icon-box primary"><Camera size={18} /></div>
                            <h3>Visual Media Gallery</h3>
                            <span className="pf-header-badge">{formData.images.length} Images</span>
                        </div>

                        {/* Step-by-step guide for new users */}
                        <div className="pf-upload-guide">
                            <div className="pf-guide-step">
                                <span className="pf-guide-num">1</span>
                                <span>Click the upload area below to select photos (multiple allowed)</span>
                            </div>
                            <div className="pf-guide-step">
                                <span className="pf-guide-num">2</span>
                                <span>For each photo, select a <strong>Category</strong> (e.g. Exterior, Bedroom)</span>
                            </div>
                            <div className="pf-guide-step">
                                <span className="pf-guide-num">3</span>
                                <span>Click the <Star size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>star icon</strong> on the photo you want as the <strong>Cover Image</strong></span>
                            </div>
                        </div>

                        <div className="pf-gallery-manager">
                            <div
                                className="pf-upload-dashed"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                                <div className="pf-upload-icon-lg">
                                    <Upload size={32} />
                                </div>
                                <div className="pf-upload-instruct">
                                    <h4>Click to Upload Images</h4>
                                    <p>JPG, PNG, WEBP · Select multiple files at once</p>
                                    {formData.images.length === 0 && (
                                        <p className="pf-upload-tip">💡 The first image uploaded will automatically become the Cover Image</p>
                                    )}
                                </div>
                            </div>

                            {formData.images.length > 0 && (
                                <>
                                    <div className="pf-img-legend">
                                        <span className="pf-legend-item">
                                            <span className="pf-legend-dot cover"></span> Cover Image
                                        </span>
                                        <span className="pf-legend-item">
                                            <Star size={11} /> = Set as Cover
                                        </span>
                                        <span className="pf-legend-item">
                                            <X size={11} /> = Remove
                                        </span>
                                    </div>

                                    <div className="pf-image-grid">
                                        {formData.images.map((img: PropertyImage, idx: number) => (
                                            <div key={idx} className={`pf-img-card ${img.isMain ? 'is-main' : ''}`}>
                                                <div className="pf-img-preview">
                                                    <img src={img.url} alt={`Property photo ${idx + 1}`} />
                                                    {img.isMain && <span className="pf-main-badge">⭐ Cover</span>}
                                                    <button
                                                        className="pf-del-btn"
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        title="Remove this image"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <div className="pf-img-controls">
                                                    <div className="pf-img-ctrl-col">
                                                        <label className="pf-tag-label">Category</label>
                                                        <select
                                                            className="pf-tag-select"
                                                            value={img.tag}
                                                            onChange={(e) => setImageTag(idx, e.target.value)}
                                                            title="Select image category"
                                                        >
                                                            <option value="exterior">🏠 Exterior</option>
                                                            <option value="living">🛋️ Living Room</option>
                                                            <option value="bedroom">🛏️ Bedroom</option>
                                                            <option value="kitchen">🍳 Kitchen</option>
                                                            <option value="bathroom">🚿 Bathroom</option>
                                                            <option value="dining">🍽️ Dining</option>
                                                            <option value="facility">🏊 Facility</option>
                                                            <option value="floorplan">📐 Floor Plan</option>
                                                            <option value="view">🌅 View</option>
                                                            <option value="other">📷 Other</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        className={`pf-star-btn ${img.isMain ? 'active' : ''}`}
                                                        type="button"
                                                        onClick={() => setMainImage(idx)}
                                                        title={img.isMain ? "This is the Cover Image" : "Set as Cover Image"}
                                                    >
                                                        <Star size={16} fill={img.isMain ? "currentColor" : "none"} />
                                                        <span className="pf-star-label">{img.isMain ? 'Cover' : 'Cover?'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <style>{`
                /* ─── Global & Layout ─── */
                .pf-root {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding-bottom: 6rem;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .pf-grid-layout {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 1024px) {
                    .pf-grid-layout { grid-template-columns: 1fr; }
                }

                .pf-col-left, .pf-col-right {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }



                /* ─── Top Bar ─── */
                .pf-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .pf-titles { display: flex; flex-direction: column; gap: 0.5rem; }
                .pf-back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.8rem;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    text-decoration: none;
                }
                .pf-back-link:hover { color: var(--text-main, #fff); }
                .pf-page-title {
                    font-size: 2rem;
                    font-weight: 300;
                    color: var(--text-main, #fff);
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }
                .pf-page-sub {
                    font-size: 0.8rem;
                    font-weight: 300;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    font-style: italic;
                    opacity: 0.8;
                }
                .pf-actions { display: flex; gap: 0.75rem; }
                .pf-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    height: 48px;
                    padding: 0 1.5rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                    text-decoration: none;
                }
                .pf-btn-secondary {
                    background: transparent;
                    color: var(--text-muted);
                    border-color: var(--border-medium);
                }
                .pf-btn-secondary:hover {
                    background: var(--bg-card);
                    color: var(--text-main);
                }
                .pf-btn-primary {
                    background: var(--accent-primary, #3b82f6);
                    color: white;
                    box-shadow: 0 4px 12px -2px rgba(59,130,246,0.3);
                }
                .pf-btn-primary:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                /* ─── Card Styles ─── */
                .pf-card {
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 20px;
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .pf-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    border-bottom: 1px solid var(--border-subtle);
                    padding-bottom: 1rem;
                    margin-bottom: 0.5rem;
                    position: relative;
                }
                .pf-icon-box {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pf-icon-box.primary {
                    background: rgba(59,130,246,0.1);
                    color: var(--accent-primary, #3b82f6);
                }
                .pf-card h3 {
                    font-size: 1.125rem;
                    font-weight: 400;
                    color: var(--text-main, #fff);
                }
                .pf-header-badge {
                    margin-left: auto;
                    font-size: 0.7rem;
                    background: var(--bg-glass);
                    padding: 0.2rem 0.6rem;
                    border-radius: 99px;
                    color: var(--text-muted);
                }
                .pf-header-add-btn {
                    margin-left: auto;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: var(--accent-primary, #3b82f6);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pf-header-add-btn:hover { opacity: 0.9; transform: translateY(-1px); }

                /* ─── Forms ─── */
                .pf-form-group { display: flex; flex-direction: column; gap: 0.625rem; }
                .pf-form-group label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-dim);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .pf-input, .pf-textarea, .pf-select {
                    width: 100%;
                    background: var(--bg-glass, rgba(255,255,255,0.03));
                    border: 1px solid var(--border-subtle);
                    border-radius: 12px;
                    padding: 0.875rem 1rem;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    font-weight: 300;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                    font-family: inherit;
                }
                .pf-input-lg { font-size: 1.125rem; padding: 1rem 1.25rem; }
                .pf-input-sm { max-width: 120px; }
                .pf-select-sm { padding: 0.6rem 0.75rem; font-size: 0.85rem; }
                .pf-input:focus, .pf-textarea:focus, .pf-select:focus {
                    border-color: var(--accent-primary);
                    background: var(--bg-card);
                }
                .pf-row-3 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1.25rem;
                }
                @media (max-width: 600px) { .pf-row-3 { grid-template-columns: 1fr; } }
                .pf-select-wrapper { position: relative; }
                
                /* ─── Map ─── */
                .pf-map-section { display: flex; flex-direction: column; gap: 0.75rem; }
                .pf-map-header { display: flex; justify-content: space-between; align-items: center; }
                .pf-map-header label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-dim);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .pf-coords {
                    display: flex;
                    gap: 0.75rem;
                    font-family: monospace;
                    font-size: 0.7rem;
                    color: var(--accent-primary);
                    background: rgba(59,130,246,0.1);
                    padding: 0.2rem 0.6rem;
                    border-radius: 99px;
                }
                .pf-map-container {
                    width: 100%;
                    height: 300px;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid var(--border-subtle);
                    z-index: 10;
                    background: #111;
                }

                /* ─── Structure List ─── */
                .pf-structure-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .pf-counter-item, .pf-input-item {
                    display: flex; align-items: center; gap: 1rem;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border-subtle);
                    border-radius: 14px;
                    background: var(--bg-glass);
                }
                .pf-counter-icon { color: var(--text-muted); }
                .pf-counter-info { flex: 1; }
                .pf-counter-label { font-size: 0.7rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
                .pf-counter-sub { font-size: 0.8rem; color: var(--text-main); }
                .pf-counter-ctrl {
                    display: flex; align-items: center; gap: 0.75rem;
                    background: var(--bg-main); padding: 0.25rem;
                    border-radius: 99px; border: 1px solid var(--border-subtle);
                }
                .pf-counter-ctrl button {
                    width: 28px; height: 28px; border-radius: 50%; border: none;
                    background: var(--bg-card); color: var(--text-main);
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .pf-counter-ctrl button:hover { background: var(--accent-primary); color: white; }
                .pf-counter-ctrl span { min-width: 20px; text-align: center; font-weight: 500; color: var(--text-main); }
                .pf-area-input { display: flex; align-items: baseline; gap: 0.25rem; }
                .pf-area-input input {
                    width: 60px; background: transparent; border: none;
                    text-align: right; font-size: 1.1rem; color: var(--text-main);
                    outline: none; font-weight: 300;
                }
                .pf-area-input span { font-size: 0.7rem; font-weight: 700; color: var(--text-dim); }

                /* ─── Amenity Section ─── */
                .pf-amenity-section { display: flex; flex-direction: column; gap: 0.75rem; }
                .pf-amenity-group-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-dim);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .pf-amenity-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .pf-amenity-chip {
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    border: 1px solid var(--border-subtle);
                    background: var(--bg-glass);
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pf-amenity-chip:hover {
                    border-color: var(--accent-primary);
                    color: var(--text-main);
                }
                .pf-amenity-chip.active {
                    background: rgba(59, 130, 246, 0.15);
                    border-color: var(--accent-primary, #3b82f6);
                    color: var(--accent-primary, #3b82f6);
                    font-weight: 600;
                }

                /* ─── Nearby Places ─── */
                .pf-empty-nearby {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-dim);
                    font-size: 0.85rem;
                }
                .pf-nearby-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .pf-nearby-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 1rem;
                    border: 1px solid var(--border-subtle);
                    border-radius: 14px;
                    background: var(--bg-glass);
                }
                .pf-nearby-row {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .pf-del-nearby {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    border: 1px solid var(--border-subtle);
                    background: transparent;
                    color: var(--text-dim);
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .pf-del-nearby:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* ─── Gallery Manager ─── */
                .pf-gallery-manager {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .pf-upload-dashed {
                    border: 2px dashed var(--border-subtle);
                    border-radius: 16px;
                    padding: 2.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    background: var(--bg-glass);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pf-upload-dashed:hover {
                    border-color: var(--accent-primary);
                    background: rgba(59,130,246,0.05);
                }
                .pf-upload-icon-lg {
                    color: var(--text-muted);
                    background: var(--bg-card);
                    padding: 1rem;
                    border-radius: 50%;
                }
                .pf-upload-instruct { text-align: center; }
                .pf-upload-instruct h4 { color: var(--text-main); font-weight: 600; margin-bottom: 0.25rem; }
                .pf-upload-instruct p { color: var(--text-dim); font-size: 0.8rem; }

                /* Grid */
                .pf-image-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 1rem;
                }

                .pf-img-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.2s;
                }
                .pf-img-card.is-main {
                    border-color: var(--accent-primary);
                    box-shadow: 0 0 0 1px var(--accent-primary);
                }

                .pf-img-preview {
                    position: relative;
                    aspect-ratio: 4/3;
                    background: #000;
                }
                .pf-img-preview img {
                    width: 100%; height: 100%; object-fit: cover;
                }
                .pf-main-badge {
                    position: absolute;
                    top: 0.5rem; left: 0.5rem;
                    background: var(--accent-primary);
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 700;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                .pf-del-btn {
                    position: absolute;
                    top: 0.5rem; right: 0.5rem;
                    width: 24px; height: 24px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none; border-radius: 50%;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                }
                .pf-del-btn:hover { background: #ef4444; }

                .pf-img-controls {
                    padding: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border-top: 1px solid var(--border-subtle);
                }
                .pf-tag-select {
                    flex: 1;
                    padding: 0.3rem 0.5rem;
                    font-size: 0.75rem;
                    background: var(--bg-glass);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-muted);
                    border-radius: 6px;
                }
                .pf-star-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-dim);
                    cursor: pointer;
                    padding: 0.2rem;
                }
                .pf-star-btn:hover, .pf-star-btn.active {
                    color: var(--accent-primary); /* Gold or Primary */
                }
                
                /* Loader */
                .pf-loader {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: pf-spin 0.8s linear infinite;
                }
                @keyframes pf-spin { to { transform: rotate(360deg); } }

                /* ─── Upload Guide Steps ─── */
                .pf-upload-guide {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    background: rgba(59,130,246,0.06);
                    border: 1px solid rgba(59,130,246,0.15);
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    margin-bottom: 0.25rem;
                }
                .pf-guide-step {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    font-size: 0.8rem;
                    color: var(--text-muted, rgba(255,255,255,0.55));
                    line-height: 1.5;
                }
                .pf-guide-step strong { color: var(--text-main); }
                .pf-guide-num {
                    min-width: 20px;
                    height: 20px;
                    background: var(--accent-primary, #3b82f6);
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 700;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                /* ─── Upload Tip ─── */
                .pf-upload-tip {
                    margin-top: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--accent-primary, #3b82f6);
                    opacity: 0.85;
                }

                /* ─── Image Legend ─── */
                .pf-img-legend {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    font-size: 0.72rem;
                    color: var(--text-dim, rgba(255,255,255,0.35));
                    padding: 0.4rem 0;
                    border-bottom: 1px solid var(--border-subtle);
                    margin-bottom: 0.25rem;
                }
                .pf-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }
                .pf-legend-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                }
                .pf-legend-dot.cover {
                    background: var(--accent-primary, #3b82f6);
                    box-shadow: 0 0 0 2px rgba(59,130,246,0.3);
                }

                /* ─── Image Controls Enhanced ─── */
                .pf-img-ctrl-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .pf-tag-label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-dim, rgba(255,255,255,0.3));
                }
                .pf-star-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-dim);
                    cursor: pointer;
                    padding: 0.2rem 0.25rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    flex-shrink: 0;
                }
                .pf-star-label {
                    font-size: 0.55rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    line-height: 1;
                }
                .pf-star-btn:hover, .pf-star-btn.active {
                    color: var(--accent-primary);
                }
            `}</style>
        </div>
    );
}
