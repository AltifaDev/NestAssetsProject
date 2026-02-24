"use client";

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from "next-intl";
import { gsap } from 'gsap';
import type { GeoJSONFeatureCollection, Property } from '../lib/api-client';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: GeoJSONFeatureCollection | null;
  isLoading: boolean;
}

// Helper: Format price for map pins (e.g. 1.2M, 500k)
function formatPriceLabel(price: number): string {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'k';
  }
  return price.toString();
}

import PropertyDetailModal from './PropertyDetailModal';

export default function SearchResultsModal({
  isOpen,
  onClose,
  searchResults,
  isLoading,
}: SearchResultsModalProps) {
  const t = useTranslations("results");
  const tSpecs = useTranslations("detail.specs");
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  console.log('🔄 SearchResultsModal state:', { isOpen, selectedProperty: selectedProperty?.title });

  // Dynamic import for Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const searchResultsRef = useRef(searchResults);
  useEffect(() => {
    searchResultsRef.current = searchResults;
  }, [searchResults]);

  // Safe property extraction with null checks
  const properties = searchResults?.features?.map(f => f.properties) || [];
  const hasResults = properties.length > 0;

  console.log('🎨 Render - isOpen:', isOpen, 'isLoading:', isLoading, 'properties:', properties.length);

  // Load Leaflet
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Add Leaflet CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((leaflet) => {
      const L = leaflet.default;

      // Fix marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      setIsMapReady(true);
      (window as any).L = L;
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current || mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    console.log('🗺️ Initializing map...');

    mapRef.current = L.map(mapContainerRef.current, {
      center: [13.7563, 100.5018], // Bangkok center
      zoom: 12,
      zoomControl: false,
    });

    // Add zoom control
    L.control.zoom({ position: 'topleft' }).addTo(mapRef.current);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Use ResizeObserver for robust layout handling
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        // Debounce invalidateSize to avoid excessive calls
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize({ pan: false });
          }
        }, 50);
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Multiple delayed fixes for map rendering
    const delays = [100, 300, 600, 1000];
    delays.forEach(delay => {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize({ pan: false });
        }
      }, delay);
    });

    console.log('✅ Map initialized');

    // Handle popup clicks
    mapRef.current.on('popupopen', (e: any) => {
      const container = e.popup.getElement();
      const preview = container.querySelector('.map-popup-preview');
      if (preview) {
        preview.onclick = () => {
          const propertyId = preview.getAttribute('data-id');
          const feature = searchResultsRef.current?.features.find(f => f.properties.id === propertyId);
          if (feature) {
            setSelectedProperty(feature.properties);
          }
        };
      }
    });

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        console.log('🗑️ Cleaning up map');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMapReady]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // If no results, just show empty map
    if (!searchResults || !searchResults.features || searchResults.features.length === 0) {
      console.log('📍 No markers to display');
      return;
    }

    const features = searchResults.features;
    console.log('📍 Adding', features.length, 'markers to map');

    // Add custom price markers
    features.forEach((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      const priceLabel = formatPriceLabel(props.price);

      // Create Custom DivIcon
      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="marker-pin">${priceLabel}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 34], // Bottom center anchor
        popupAnchor: [0, -34]
      });

      const marker = L.marker([lat, lng], { icon: icon })
        .bindPopup(`
          <div class="map-popup-preview" data-id="${props.id}">
            <div class="popup-image-container">
              <img 
                src="${props.thumbnail || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'}" 
                alt="${props.title}" 
                onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'"
              />
            </div>
            <div class="popup-info">
              <h3 class="popup-title">${props.title}</h3>
              <div class="popup-price">฿${props.price.toLocaleString()}</div>
            </div>
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-property-popup'
        });

      marker.on('click', () => {
        console.log('📍 Marker clicked:', props.id, props.title);
        setActivePropertyId(props.id);

        // Highlight in list
        const card = document.getElementById(`property-card-${props.id}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('highlight');
          setTimeout(() => card.classList.remove('highlight'), 2000);
        }
      });

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    // Fit bounds only if container is visible to avoid Leaflet error on 0x0 map
    if (mapContainerRef.current && mapContainerRef.current.clientWidth > 0) {
      const bounds = L.latLngBounds(
        features.map((f: any) => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [searchResults, isMapReady]);

  // Open/Close animations
  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      const panel = contentRef.current;
      gsap.set(panel, { display: 'flex', visibility: 'visible', pointerEvents: 'auto' });
      gsap.fromTo(panel, { y: '100%' }, {
        y: '0%', duration: 0.6, ease: 'power3.out',
        onComplete: () => {
          if (!mapRef.current) return;

          // Force multiple invalidateSize calls with increasing delays
          const invalidateTimes = [0, 100, 300, 600, 1000];
          invalidateTimes.forEach(delay => {
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.invalidateSize({ pan: false });
              }
            }, delay);
          });

          // Refit bounds after map is fully rendered
          setTimeout(() => {
            const L = (window as any).L;
            const features = searchResultsRef.current?.features;
            if (L && mapRef.current && features && features.length > 0) {
              const bounds = L.latLngBounds(
                features.map((f: any) => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
              );
              mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: false });
            }
          }, 1200);
        }
      });
    } else {
      const panel = contentRef.current;
      gsap.to(panel, {
        y: '100%',
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(panel, {
            display: 'none',
            visibility: 'hidden',
            pointerEvents: 'none'
          });
          console.log('✅ Panel closed successfully');
        }
      });
    }
  }, [isOpen]);

  // Minimize/Maximize animation
  const toggleMinimize = () => {
    if (!contentRef.current) return;

    if (isMinimized) {
      // Maximize
      gsap.to(contentRef.current, {
        height: '85vh',
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          // Invalidate map size after maximize animation
          if (mapRef.current) {
            setTimeout(() => mapRef.current?.invalidateSize({ pan: false }), 100);
            setTimeout(() => mapRef.current?.invalidateSize({ pan: false }), 300);
          }
        }
      });
    } else {
      // Minimize
      gsap.to(contentRef.current, {
        height: '80px',
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    setIsMinimized(!isMinimized);
  };

  return (
    <>
      <div ref={contentRef} className={`search-panel ${isOpen ? 'open' : ''} ${selectedProperty ? 'hidden' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <div className="header-left">
            <h2>{t("headerTitle")}</h2>
            <span className="result-count">
              {isLoading ? t("searching") : t("found", { count: properties.length })}
            </span>
          </div>

          <div className="header-actions">
            <button className="icon-btn" onClick={toggleMinimize} title={isMinimized ? t('maximize') : t('minimize')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMinimized ? (
                  <polyline points="18 15 12 9 6 15"></polyline>
                ) : (
                  <polyline points="6 9 12 15 18 9"></polyline>
                )}
              </svg>
            </button>

            <button className="icon-btn close-btn" onClick={onClose} title={t('close')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Split View Content */}
        <div className="panel-body">
          {/* Left Side: Map */}
          <div className="map-column">
            <div ref={mapContainerRef} className="map-view" />

            {/* Draw Button Overlay removed as requested */}

            {isLoading && (
              <div className="map-overlay-message load-overlay">
                <div className="spinner"></div>
                <p>{t("searching")}</p>
              </div>
            )}
          </div>

          {/* Right Side: List */}
          {!isMinimized && (
            <div className="list-column" data-lenis-prevent>
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>{t("loadingList")}</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <h3>{t("noPropertiesFound")}</h3>
                  <p>{t("adjustFilters")}</p>
                </div>
              ) : (
                <div className="properties-grid">
                  {properties.map((property: Property) => (
                    <div
                      key={property.id}
                      id={`property-card-${property.id}`}
                      className={`property-card ${activePropertyId === property.id ? 'active' : ''}`}
                      onClick={() => {
                        console.log('🖱️ Property card clicked:', property.id, property.title);
                        setActivePropertyId(property.id);
                        if (mapRef.current) {
                          mapRef.current.flyTo([property.lat, property.lng], 15);
                        }
                        setSelectedProperty(property);
                        console.log('✅ Selected property set:', property);
                      }}
                    >
                      <div className="card-image-wrapper">
                        <img
                          src={property.thumbnail || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'}
                          alt={property.title}
                          className="property-image"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        <div className="card-overlay-top">
                          <button className="favorite-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                          </button>
                        </div>
                        <div className="card-overlay-bottom">
                          <span className="status-badge">{property.listingType === 'sale' ? t("forSale") : t("forRent")}</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="card-price">฿ {property.price.toLocaleString()}</div>
                        <h3 className="card-title">{property.title}</h3>
                        <p className="card-location">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          {property.address}
                        </p>

                        <div className="card-divider"></div>

                        <div className="card-stats">
                          {property.bedrooms > 0 && (
                            <span className="stat-item" title={tSpecs("bedrooms")}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                              {property.bedrooms}
                            </span>
                          )}
                          {property.bathrooms > 0 && (
                            <span className="stat-item" title={tSpecs("bathrooms")}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.12 0l-.88.88a1.5 1.5 0 0 0 0 2.12l2.5 2.5"></path><path d="m21.21 15.89-1.42 1.42a3 3 0 0 0-4.24 0l-5.66 5.66a3 3 0 0 1-4.24-4.24l5.66-5.66a3 3 0 0 0 0-4.24l1.42-1.42a3 3 0 0 1 4.24 0l4.24 4.24a3 3 0 0 1 0 4.24Z"></path></svg>
                              {property.bathrooms}
                            </span>
                          )}
                          {property.livingArea && (
                            <span className="stat-item" title={tSpecs("livingArea")}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4 8 4v14"></path><path d="M4 10h16"></path></svg>
                              {property.livingArea.toLocaleString()} {t("sqm")}
                            </span>
                          )}
                        </div>

                        <div className="card-footer">
                          <label className="compare-check">
                            <input type="checkbox" />
                            <span>{t("shareCompare")}</span>
                          </label>
                          <div className="agent-logo" title={property.agent?.name || 'Nest Team'}>
                            {property.agent?.image_url ? (
                              <img
                                src={property.agent.image_url}
                                alt={property.agent.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + property.agent?.name;
                                }}
                              />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" /></svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
        /* Global & Reset */
        .search-panel {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 85vh;
          background: white;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -10px 60px rgba(0, 0, 0, 0.3);
          display: none;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          visibility: hidden;
          pointer-events: none;
        }

        .search-panel.hidden {
          display: none !important;
        }
        
        /* Header */
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
          flex-shrink: 0;
          height: 70px;
        }

        .header-left h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .result-count {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .icon-btn:hover { background: #e2e8f0; color: #1e293b; }
        .close-btn:hover { background: #fee2e2; color: #ef4444; }

        /* Split View Layout */
        .panel-body {
          display: flex;
          flex: 1;
          height: calc(100% - 70px);
          overflow: hidden;
        }

        .map-column {
          flex: 1;
          position: relative;
          height: 100%;
          min-width: 0; /* Fix flex overflow */
          display: flex;
          flex-direction: column;
        }

        .map-view { 
          width: 100%; 
          height: 100%; 
          flex: 1;
          position: relative;
        }

        .list-column {
          width: 450px; /* Fixed width sidebar for list */
          height: 100%;
          overflow-y: auto;
          background: #f8fafc;
          border-left: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        /* Marker Styles */
        .custom-map-marker {
          background: none; 
          border: none;
        }
        
        .marker-pin {
          background-color: #ef4444; 
          color: white;
          padding: 4px 8px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 13px;
          text-align: center;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          border: 2px solid white;
          position: relative;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .marker-pin:hover, .marker-pin.active {
          transform: scale(1.1);
          background-color: #dc2626;
          z-index: 999;
        }
        
        /* Triangle indicator for pin */
        .marker-pin::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px 5px 0;
          border-style: solid;
          border-color: white transparent transparent;
        }
        .marker-pin::before {
          content: '';
          position: absolute;
          bottom: -2px; /* Inner color triangle */
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px 4px 0;
          border-style: solid;
          border-color: #ef4444 transparent transparent;
          z-index: 1;
        }
        .marker-pin:hover::before { border-color: #dc2626 transparent transparent; }

        /* Custom Popup Styles */
        .custom-property-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .custom-property-popup .leaflet-popup-content {
          margin: 0;
          width: 240px !important;
        }
        .custom-property-popup .leaflet-popup-tip-container {
          display: none;
        }
        .map-popup-preview {
          cursor: pointer;
          background: white;
          transition: all 0.2s;
        }
        .map-popup-preview:hover {
          background: #f8fafc;
        }
        .popup-image-container {
          width: 100%;
          height: 140px;
          overflow: hidden;
        }
        .popup-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .popup-info {
          padding: 12px 16px;
        }
        .popup-title {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .popup-price {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #2563eb;
        }
        .custom-property-popup .leaflet-popup-close-button {
          top: 8px;
          right: 8px;
          color: white;
          background: rgba(0,0,0,0.4);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 16px;
          transition: background 0.2s;
          border: none;
        }
        .custom-property-popup .leaflet-popup-close-button:hover {
          background: rgba(0,0,0,0.6);
          color: white;
        }

        /* Listing Grid */
        .properties-grid {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Property Card Design */
        .property-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .property-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          border-color: #cbd5e1;
        }
        .property-card.active, .property-card.highlight {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .card-image-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .property-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .property-card:hover .property-image {
          transform: scale(1.05);
        }

        .card-overlay-top {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
        }
        .favorite-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }
        .favorite-btn:hover { color: #ef4444; background: white; }

        .card-overlay-bottom {
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          gap: 8px;
        }
        .status-badge {
          background: #2563eb;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-content {
          padding: 1rem;
        }
        
        .card-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.25rem;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-location {
          font-size: 0.875rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 0.75rem;
        }
        .card-location svg { color: #94a3b8; }

        .card-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.5rem 0;
        }

        .card-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
          color: #475569;
          font-weight: 500;
        }
        .stat-item svg { color: #94a3b8; width: 14px; height: 14px; }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.5rem;
        }

        .compare-check {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #64748b;
          cursor: pointer;
        }
        .compare-check input { cursor: pointer; }

        .agent-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dbeafe;
        }

        /* Loading & Empty States */
        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          text-align: center;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #f1f5f9;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .map-overlay-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255,255,255,0.9);
          padding: 1rem 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .draw-btn-overlay {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 400; /* Above map tiles, below some controls */
        }
        
        .draw-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .draw-btn:hover { transform: scale(1.05); }
        .close-draw { margin-left: 8px; font-size: 1.1rem; opacity: 0.8; }
        .close-draw:hover { opacity: 1; }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .panel-body { flex-direction: column; }
          .map-column { height: 50%; }
          .list-column { width: 100%; height: 50%; border-left: none; border-top: 1px solid #e2e8f0; }
        }
      `}</style>
      </div>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
}
