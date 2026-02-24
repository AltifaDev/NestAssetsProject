"use client";

import { useRef, useEffect, useState } from 'react';
import { useTranslations } from "next-intl";
import { gsap } from 'gsap';
import {
  Share2, Heart, Phone, Mail, Calendar, Ruler, Bed, Bath,
  CheckCircle2, MapPin, X, ArrowUp, Shield, Zap, Waves,
  Dumbbell, Eye, Box, MessageSquare, Car, Home, Building2,
  Trees, Wifi, Wind, Flame, Tv, Refrigerator, ChevronRight,
  Clock, Hash, TrendingUp, Star, ExternalLink, Copy, Check,
  ChevronLeft, Maximize2, Layers, SquareParking, Sofa, Droplets,
  Train, Plane, Store, GraduationCap, Stethoscope, ShoppingCart, Loader2
} from 'lucide-react';
import type { Property, NearbyPlace } from '../lib/api-client';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailModal({ property, isOpen, onClose }: PropertyDetailModalProps) {
  const t = useTranslations("detail");

  // ─── Amenity Icon Mapping ────────────────────────────────────────────────────
  const INDOOR_AMENITIES = [
    { key: 'furniture', label: t("amenities.furniture"), icon: Sofa },
    { key: 'air_con', label: t("amenities.air_con"), icon: Wind },
    { key: 'water_heater', label: t("amenities.water_heater"), icon: Droplets },
    { key: 'digital_lock', label: t("amenities.digital_lock"), icon: Shield },
    { key: 'bathtub', label: t("amenities.bathtub"), icon: Waves },
    { key: 'stove', label: t("amenities.stove"), icon: Flame },
    { key: 'tv', label: t("amenities.tv"), icon: Tv },
    { key: 'refrigerator', label: t("amenities.refrigerator"), icon: Refrigerator },
    { key: 'internet', label: t("amenities.internet"), icon: Wifi },
    { key: 'smart_home', label: t("amenities.smart_home"), icon: Zap },
  ];

  const PROJECT_AMENITIES = [
    { key: 'lift', label: t("amenities.lift"), icon: Building2 },
    { key: 'parking_facility', label: t("amenities.parking_facility"), icon: SquareParking },
    { key: 'pool', label: t("amenities.pool"), icon: Waves },
    { key: 'gym', label: t("amenities.gym"), icon: Dumbbell },
    { key: 'cctv', label: t("amenities.cctv"), icon: Eye },
    { key: 'security', label: t("amenities.security"), icon: Shield },
    { key: 'garden', label: t("amenities.garden"), icon: Trees },
    { key: 'storage', label: t("amenities.storage"), icon: Box },
  ];

  // ─── Agent role display names ────────────────────────────────────────────────
  const AGENT_ROLE_LABELS: Record<string, string> = {
    agent: t("agentRoles.agent"),
    senior_agent: t("agentRoles.senior_agent"),
    broker: t("agentRoles.broker"),
    consultant: t("agentRoles.consultant"),
  };

  // ─── Nearby Place Icon Mapping ───────────────────────────────────────────────
  const NEARBY_ICON_MAP: Record<string, any> = {
    train: Train,
    car: Car,
    airport: Plane,
    mall: Store,
    market: ShoppingCart,
    supermarket: ShoppingCart,
    school: GraduationCap,
    university: Building2,
    hospital: Stethoscope,
    clinic: Stethoscope,
  };

  const NEARBY_CATEGORY_COLORS: Record<string, string> = {
    transport: 'bg-blue-100 text-blue-600',
    shop: 'bg-orange-100 text-orange-600',
    edu: 'bg-emerald-100 text-emerald-600',
    hosp: 'bg-rose-100 text-rose-600',
  };

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollBtnRef = useRef<HTMLButtonElement>(null);
  const amenityGridRef = useRef<HTMLDivElement>(null);
  const nearbyGridRef = useRef<HTMLDivElement>(null);

  const [activeAmenityTab, setActiveAmenityTab] = useState<'indoor' | 'project'>('indoor');
  const [activeNearbyTab, setActiveNearbyTab] = useState<'transport' | 'shop' | 'edu' | 'hosp'>('transport');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heartActive, setHeartActive] = useState(false);

  // Lead Form States
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Scroll to top visibility logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (!scrollBtnRef.current) return;
      if (container.scrollTop > 400) {
        gsap.to(scrollBtnRef.current, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.3 });
      } else {
        gsap.to(scrollBtnRef.current, { opacity: 0, y: 10, pointerEvents: 'none', duration: 0.3 });
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!modalRef.current || !contentRef.current || !overlayRef.current) return;
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
      gsap.set(modalRef.current, { visibility: 'visible', opacity: 1, pointerEvents: 'auto', display: 'flex' });
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo(contentRef.current, { y: 30, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      setActiveGalleryIndex(0);
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
      gsap.to(contentRef.current, { y: 20, opacity: 0, scale: 0.98, duration: 0.3 });
      gsap.to(modalRef.current, {
        opacity: 0, duration: 0.3,
        onComplete: () => {
          gsap.set(modalRef.current, { visibility: 'hidden', display: 'none', pointerEvents: 'none' });
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.documentElement.style.overflow = '';
        }
      });
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // GSAP: Amenities tab animation
  useEffect(() => {
    if (!amenityGridRef.current || !isOpen) return;

    // Select all child items in the grid
    const items = amenityGridRef.current.children;
    if (items.length === 0) return;

    gsap.fromTo(items,
      {
        y: 15,
        opacity: 0,
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.04,
        ease: "power2.out",
        overwrite: true
      }
    );
  }, [activeAmenityTab, isOpen]);

  // GSAP: Nearby places tab animation
  useEffect(() => {
    if (!nearbyGridRef.current || !isOpen) return;

    const items = nearbyGridRef.current.children;
    if (items.length === 0) return;

    gsap.fromTo(items,
      {
        x: -10,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
        overwrite: true
      }
    );
  }, [activeNearbyTab, isOpen]);

  if (!property) return null;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatPrice = (val: number) =>
    new Intl.NumberFormat('th-TH').format(val);

  const formatPriceShort = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setSubmittingLead(true);
    try {
      // payload URL needs to be correctly identified (usually window.location.origin in production if same domain, or env var)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const agentId = typeof property.agent === 'object' ? property.agent?.id : property.agent;

      const parsedPropertyId = property.id ? parseInt(property.id.toString(), 10) : null;
      const parsedAgentId = agentId ? parseInt(agentId.toString(), 10) : null;

      const res = await fetch(`${payloadUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message || `I am interested in ${property.title}`,
          property: Number.isNaN(parsedPropertyId) ? null : parsedPropertyId,
          agent: Number.isNaN(parsedAgentId) ? null : parsedAgentId,
          source: 'website',
          status: 'new'
        })
      });

      if (res.ok) {
        setLeadSuccess(true);
        setTimeout(() => {
          setShowContactForm(false);
          setLeadSuccess(false);
          setContactForm({ name: '', phone: '', email: '', message: '' });
        }, 3000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while sending your message.');
    } finally {
      setSubmittingLead(false);
    }
  };

  // Format date from ISO string
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // ─── Gallery Images (Real data only, no hardcoded fallbacks) ───────────
  const galleryImages = [
    property.thumbnail,
    ...(property.images || []),
  ].filter(Boolean) as string[];

  // ─── Amenities from structured data ────────────────────────────────────
  const getIndoorAmenityActive = (key: string): boolean => {
    if (property.indoor_amenities) {
      return !!(property.indoor_amenities as any)[key];
    }
    // Fallback to legacy amenities array
    if (property.amenities && property.amenities.length > 0) {
      return property.amenities.some(a =>
        a.toLowerCase().includes(key.replace('_', ' ')) ||
        a.toLowerCase().includes(key)
      );
    }
    return false;
  };

  const getProjectAmenityActive = (key: string): boolean => {
    if (property.project_amenities) {
      return !!(property.project_amenities as any)[key];
    }
    // Fallback to legacy amenities array
    if (property.amenities && property.amenities.length > 0) {
      return property.amenities.some(a =>
        a.toLowerCase().includes(key.replace('_', ' ')) ||
        a.toLowerCase().includes(key)
      );
    }
    return false;
  };

  // ─── Nearby Places (from database) ─────────────────────────────────────
  const nearbyPlaces: NearbyPlace[] = property.nearby_places || [];
  const filteredNearbyPlaces = nearbyPlaces.filter(p => p.category === activeNearbyTab);

  // Check if any nearby places exist per category
  const hasNearbyCategory = (cat: string) => nearbyPlaces.some(p => p.category === cat);

  // ─── Listing Metadata (Real data) ─────────────────────────────────────
  const listingId = property.id ? property.id.slice(0, 8).toUpperCase() : 'N/A';
  const viewCount = property.view_count || 0;
  const lastUpdated = formatDate(property.updatedAt);

  // ─── Agent data helpers ────────────────────────────────────────────────
  const agentName = property.agent?.name || 'Nest Team';
  const agentRole = property.agent?.role
    ? (AGENT_ROLE_LABELS[property.agent.role] || property.agent.role)
    : 'Real Estate Agent';
  const agentImage = property.agent?.image_url || 'https://zskakdqvjrkwkzzamlkg.supabase.co/storage/v1/object/public/Image/profile-image/ProfileImg.png';
  const agentVerified = property.agent?.verified ?? false;

  // ─── Nearby Place Component ──────────────────────────────────────────
  const NearbyPlaceItem = ({ name, distance, icon: Icon, color }: { name: string, distance: string, icon: any, color: string }) => (
    <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group cursor-default">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-800 truncate">{name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <MapPin size={12} className="text-slate-400" />
          <span className="text-xs font-semibold text-blue-500">{distance}</span>
        </div>
      </div>
    </div>
  );

  // ─── Specs (All from real database fields) ───────────────────────────
  const specs = [
    { label: t("specs.listingId"), value: listingId },
    { label: t("specs.project"), value: property.project_name || '-' },
    { label: t("specs.propertyType"), value: property.propertyType || '-' },
    { label: t("specs.floors"), value: property.floors ? `${property.floors} ${t("specs.unitFloors")}` : '-' },
    { label: t("specs.bedrooms"), value: property.bedrooms ? `${property.bedrooms} ${t("specs.unitRooms")}` : '-' },
    { label: t("specs.bathrooms"), value: property.bathrooms ? `${property.bathrooms} ${t("specs.unitRooms")}` : '-' },
    { label: t("specs.livingArea"), value: property.livingArea ? `${property.livingArea} ${t("specs.unitSqm")}` : property.sqft ? `${property.sqft} ${t("specs.unitSqm")}` : '-' },
    { label: t("specs.landArea"), value: property.landArea ? `${property.landArea} ${t("specs.unitSqwa")}` : '-' },
    { label: t("specs.parking"), value: property.parking != null ? `${property.parking} ${t("specs.unitCars")}` : '-' },
    { label: t("specs.direction"), value: property.direction || '-' },
    { label: t("specs.yearBuilt"), value: property.yearBuilt ? `${property.yearBuilt}` : '-' },
    { label: t("specs.tenure"), value: property.ownership || '-' },
    { label: t("specs.decoration"), value: property.decoration || '-' },
    { label: t("specs.commonFee"), value: property.common_fee ? `฿ ${formatPrice(property.common_fee)} / ${t("specs.unitSqm")}` : '-' },
  ];

  return (
    <div
      ref={modalRef}
      id="nest-fixed-modal-root"
      className="fixed inset-0 z-[1000000] flex items-center justify-center p-0 md:p-4"
      style={{ display: 'none', visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-lg"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Main Container */}
      <div
        ref={contentRef}
        className="pdm-container w-full max-w-[1400px] h-full md:h-[96vh] bg-[var(--bg-primary,#fff)] md:rounded-3xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] relative flex flex-col z-10 overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      >

        {/* ── TOP HEADER BAR ─────────────────────────────────────────────── */}
        <div className="pdm-header flex items-center justify-between border-b border-slate-100 bg-white/98 backdrop-blur-md z-[100] flex-shrink-0 px-4 md:px-8" style={{ minHeight: '56px' }}>
          {/* Left: Close + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0" style={{ marginLeft: '14px' }}>
            <button
              onClick={onClose}
              className="group p-2 -ml-1 text-slate-700 hover:text-slate-900 transition-all active:scale-90 flex items-center justify-center rounded-full hover:bg-slate-100 flex-shrink-0"
              aria-label="Close"
            >
              <X size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center gap-1 text-xs text-slate-400 min-w-0">
              <span className="hover:text-slate-600 cursor-pointer transition-colors">{t("home")}</span>
              <ChevronRight size={12} className="flex-shrink-0" />
              <span className="hover:text-slate-600 cursor-pointer transition-colors">
                {property.listingType === 'sale' ? t("sale") : t("rent")}
              </span>
              <ChevronRight size={12} className="flex-shrink-0" />
              <span className="text-slate-600 font-medium truncate max-w-[200px]">{property.title}</span>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0" style={{ marginLeft: '14px', marginRight: '14px' }}>
            <button
              onClick={() => setHeartActive(!heartActive)}
              className={`pdm-header-btn flex items-center gap-2 border rounded-xl text-xs font-bold transition-all ${heartActive ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Heart size={15} strokeWidth={2.5} className={heartActive ? 'fill-rose-500 text-rose-500' : ''} />
              <span className="hidden sm:inline">{t("save")}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="pdm-header-btn hidden sm:flex items-center gap-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              {copied ? <Check size={15} strokeWidth={2.5} className="text-emerald-500" /> : <Share2 size={15} strokeWidth={2.5} />}
              <span>{copied ? t("copied") : t("share")}</span>
            </button>
            <button
              onClick={() => {
                setShowContactForm(true);
                // Scroll the sidebar card into view if on mobile, or just let it smoothly open
                const formEl = document.querySelector('.pdm-sidebar-card');
                if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="pdm-header-btn-primary flex items-center gap-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all hover:bg-slate-700 active:scale-95"
            >
              <MessageSquare size={15} strokeWidth={2.5} />
              <span>{t("contact")}</span>
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ─────────────────────────────────────────────── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-white scroll-smooth"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          data-lenis-prevent
        >

          {/* ── IMAGE GALLERY ──────────────────────────────────────────────── */}
          <div className="pdm-gallery relative w-full bg-slate-100" style={{ marginBottom: '14px' }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0.5 h-[260px] md:h-[520px]">
              {/* Main Image */}
              <div
                className="md:col-span-8 overflow-hidden relative cursor-pointer group"
                onClick={() => setShowFullGallery(true)}
              >
                {galleryImages[0] ? (
                  <img
                    src={galleryImages[0]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={t("mainImageAlt")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <Home size={48} className="text-slate-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                {/* Listing Badges on main image */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="pdm-badge-sale px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
                    {property.listingType === 'sale' ? t("sale") : t("rent")}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/90 text-slate-700 text-xs font-bold shadow-lg">
                    {property.propertyType}
                  </span>
                </div>
              </div>

              {/* Side Images */}
              <div className="hidden md:flex md:col-span-4 flex-col gap-0.5">
                <div
                  className="h-[50%] overflow-hidden relative cursor-pointer group"
                  onClick={() => { setActiveGalleryIndex(1); setShowFullGallery(true); }}
                >
                  {galleryImages[1] ? (
                    <img
                      src={galleryImages[1]}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={t("galleryImageAlt", { index: 1 })}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Home size={32} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="h-[50%] flex gap-0.5">
                  <div
                    className="w-1/2 overflow-hidden relative cursor-pointer group"
                    onClick={() => { setActiveGalleryIndex(2); setShowFullGallery(true); }}
                  >
                    {galleryImages[2] ? (
                      <img
                        src={galleryImages[2]}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={t("galleryImageAlt", { index: 2 })}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Home size={24} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  {/* +More Photos Button */}
                  <div
                    className="w-1/2 relative bg-slate-200 cursor-pointer group overflow-hidden"
                    onClick={() => setShowFullGallery(true)}
                  >
                    {galleryImages[3] ? (
                      <img
                        src={galleryImages[3]}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={t("galleryImageAlt", { index: 3 })}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-300" />
                    )}
                    {galleryImages.length > 3 && (
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors flex items-center justify-center">
                        <div className="text-center text-white">
                          <Maximize2 size={20} className="mx-auto mb-1" />
                          <span className="text-xs font-bold">{t("viewAllPhotos")}</span>
                          <div className="text-lg font-black">{galleryImages.length} {t("photos")}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
          <div className="pdm-body w-full !max-w-none">
            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start pt-8 pb-16">

              {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
              <div className="flex-1 min-w-0 space-y-0 ">

                {/* ── TITLE SECTION ─────────────────────────────────────────── */}
                <div className="pdm-title-section pb-8 border-b border-slate-100">
                  {/* Metadata Row */}
                  <div
                    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400"
                    style={{ marginBottom: '14px' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Hash size={11} />
                      <span>{t("listingId")}: <strong className="text-slate-600">{listingId}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} />
                      <span>{t("updated")}: <strong className="text-slate-600">{lastUpdated}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye size={11} />
                      <span>{t("views")}: <strong className="text-slate-600">{viewCount.toLocaleString()} {t("times")}</strong></span>
                    </div>
                    {property.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={11} className="fill-amber-400" />
                        <span className="font-bold text-amber-600">{property.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Main Title */}
                  <h1
                    className="pdm-main-title text-slate-900 font-bold leading-tight"
                    style={{ marginBottom: '12px' }}
                  >
                    {property.title}
                  </h1>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-slate-500 text-sm">
                    <MapPin size={16} strokeWidth={2} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{property.address}</span>
                  </div>
                </div>

                {/* ── QUICK STATS BAR ───────────────────────────────────────── */}
                <div className="pdm-stats-bar flex flex-wrap gap-0 border-b border-slate-100">
                  {[
                    { icon: Bed, label: t("specs.bedrooms"), value: property.bedrooms || '-' },
                    { icon: Bath, label: t("specs.bathrooms"), value: property.bathrooms || '-' },
                    { icon: Ruler, label: t("specs.unitSqm"), value: property.livingArea || property.sqft || '-' },
                    { icon: Car, label: t("specs.parking"), value: property.parking != null ? property.parking : '-' },
                    { icon: Layers, label: t("specs.floors"), value: property.floors || '-' },
                  ].map((s, i) => (
                    <div key={i} className="pdm-stat-item flex flex-col items-center justify-center gap-1 border-r border-slate-100 last:border-r-0">
                      <s.icon size={18} strokeWidth={1.8} className="text-blue-500" />
                      <span className="text-lg font-black text-slate-900 leading-none">{s.value}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* ── DESCRIPTION ───────────────────────────────────────────── */}
                <div className="pdm-section">
                  <h2 className="pdm-section-title">{t("description")}</h2>
                  <p className="text-slate-600 text-sm leading-[1.9] whitespace-pre-line">
                    {property.description || t("noDescription")}
                  </p>
                </div>

                {/* ── SPECIFICATIONS TABLE ──────────────────────────────────── */}
                <div className="pdm-section">
                  <h2 className="pdm-section-title">{t("details")}</h2>
                  <div className="pdm-specs-grid grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6 bg-slate-50/50">
                    {specs.map((spec, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-200 pb-2 last:border-0 md:last:border-b md:nth-last-child-2:border-0">
                        <span className="text-slate-500 text-sm font-medium">{spec.label}</span>
                        <span className="text-slate-900 text-sm font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── AMENITIES (TABBED) ────────────────────────────────────── */}
                <div className="pdm-section">
                  <h2 className="pdm-section-title">{t("amenities.title")}</h2>

                  {/* Tabs */}
                  <div
                    className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit"
                    style={{ marginBottom: '28px' }}
                  >
                    <button
                      onClick={() => setActiveAmenityTab('indoor')}
                      className={`pdm-tab ${activeAmenityTab === 'indoor' ? 'pdm-tab--active' : ''}`}
                    >
                      <Home size={14} />
                      {t("amenities.indoor")}
                    </button>
                    <button
                      onClick={() => setActiveAmenityTab('project')}
                      className={`pdm-tab ${activeAmenityTab === 'project' ? 'pdm-tab--active' : ''}`}
                    >
                      <Building2 size={14} />
                      {t("amenities.project")}
                    </button>
                  </div>

                  {/* Amenity Grid */}
                  <div
                    ref={amenityGridRef}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                  >
                    {(activeAmenityTab === 'indoor' ? INDOOR_AMENITIES : PROJECT_AMENITIES).map((item) => {
                      const isActive = activeAmenityTab === 'indoor'
                        ? getIndoorAmenityActive(item.key)
                        : getProjectAmenityActive(item.key);
                      return (
                        <div
                          key={item.key}
                          className={`pdm-amenity-item ${isActive ? 'pdm-amenity-item--active' : 'pdm-amenity-item--inactive'}`}
                        >
                          <item.icon size={20} strokeWidth={1.8} />
                          <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── LOCATION MAP ──────────────────────────────────────────── */}
                <div className="pdm-section">
                  <h2 className="pdm-section-title">{t("location.title")}</h2>
                  <div className="pdm-map-container rounded-2xl overflow-hidden border border-slate-200">
                    <iframe
                      title="Property Location"
                      width="100%"
                      height="280"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${property.lat || 13.7563},${property.lng || 100.5018}&z=15&output=embed`}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                    <MapPin size={14} className="text-blue-400 flex-shrink-0" />
                    <span>{property.address}</span>
                    <a
                      href={`https://www.google.com/maps?q=${property.lat || 13.7563},${property.lng || 100.5018}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium text-xs transition-colors flex-shrink-0"
                    >
                      <ExternalLink size={12} />
                      {t("location.openInGoogleMaps")}
                    </a>
                  </div>
                </div>

                {/* ── NEARBY PLACES (Real data from database) ───────────────── */}
                {nearbyPlaces.length > 0 && (
                  <div className="pdm-section">
                    <h2 className="pdm-section-title">{t("nearby.title")}</h2>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2.5" style={{ marginBottom: '24px' }}>
                      {[
                        { id: 'transport', label: t("nearby.transport"), icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { id: 'shop', label: t("nearby.shop"), icon: Box, color: 'text-orange-500', bg: 'bg-orange-50' },
                        { id: 'edu', label: t("nearby.edu"), icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { id: 'hosp', label: t("nearby.hosp"), icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                      ]
                        .filter(tab => hasNearbyCategory(tab.id))
                        .map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveNearbyTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 border-2 ${activeNearbyTab === tab.id
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-0.5'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                              }`}
                          >
                            <tab.icon size={16} className={activeNearbyTab === tab.id ? 'text-white' : tab.color} />
                            {tab.label}
                          </button>
                        ))}
                    </div>

                    {/* Content Container */}
                    <div
                      ref={nearbyGridRef}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {filteredNearbyPlaces.length > 0 ? (
                        filteredNearbyPlaces.map((place, idx) => {
                          const IconComp = NEARBY_ICON_MAP[place.icon || ''] || MapPin;
                          const colorClass = NEARBY_CATEGORY_COLORS[place.category] || 'bg-slate-100 text-slate-600';
                          return (
                            <NearbyPlaceItem
                              key={place.id || idx}
                              name={place.name}
                              distance={place.distance}
                              icon={IconComp}
                              color={colorClass}
                            />
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center text-sm text-slate-400 py-6">
                          {t("nearby.noNearby", { category: t(`nearby.${activeNearbyTab}`) })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
              <div className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 lg:sticky lg:top-6 flex flex-col" style={{ gap: '32px' }}>

                {/* ── PRICE & CONTACT CARD ──────────────────────────────────── */}
                <div className="pdm-sidebar-card">
                  {/* Price */}
                  <div style={{ marginBottom: '20px' }}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ marginBottom: '4px' }}>
                      {property.listingType === 'sale' ? t("sidebar.salePrice") : t("sidebar.rentPrice")}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-600 leading-none">
                        ฿ {formatPrice(property.price)}
                      </span>
                    </div>
                    {property.livingArea && (
                      <div className="text-xs text-slate-400 mt-2">
                        {t("sidebar.approxPrice", { price: formatPrice(Math.round(property.price / property.livingArea)) })}
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons & Form */}
                  {showContactForm ? (
                    <div className="pdm-contact-form-container">
                      <div className="pdm-contact-form-header">
                        <h4 className="pdm-contact-form-title">{t("form.title")}</h4>
                        <button onClick={() => setShowContactForm(false)} className="pdm-contact-form-close">
                          <X size={16} />
                        </button>
                      </div>

                      {leadSuccess ? (
                        <div className="flex flex-col items-center justify-center py-6 text-emerald-600 text-center">
                          <CheckCircle2 size={36} className="mb-3" />
                          <h4 className="font-bold text-base">{t("form.successTitle")}</h4>
                          <p className="text-xs text-emerald-600/70 mt-1 leading-relaxed">{t("form.successDesc")}</p>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} className="pdm-contact-form">
                          <input
                            required
                            type="text"
                            placeholder={t("form.namePlaceholder")}
                            value={contactForm.name}
                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                            className="pdm-contact-input"
                          />
                          <input
                            required
                            type="tel"
                            placeholder={t("form.phonePlaceholder")}
                            value={contactForm.phone}
                            onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                            className="pdm-contact-input"
                          />
                          <input
                            type="email"
                            placeholder={t("form.emailPlaceholder")}
                            value={contactForm.email}
                            onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                            className="pdm-contact-input"
                          />
                          <textarea
                            placeholder={t("form.messagePlaceholder")}
                            value={contactForm.message}
                            onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                            rows={3}
                            className="pdm-contact-textarea"
                          />
                          <button
                            type="submit"
                            disabled={submittingLead}
                            className="pdm-contact-submit"
                          >
                            {submittingLead ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span>{t("form.sendingButton")}</span>
                              </div>
                            ) : (
                              t("form.submitButton")
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col" style={{ gap: '12px', marginBottom: '24px' }}>
                      <a
                        href={`tel:${property.agent?.phone || ''}`}
                        className="pdm-cta-primary w-full flex items-center justify-center gap-2.5"
                      >
                        <Phone size={17} strokeWidth={2.5} />
                        <span>{t("contact")}</span>
                        {property.agent?.phone && (
                          <span className="opacity-80 text-xs">{property.agent.phone}</span>
                        )}
                      </a>
                      <button
                        onClick={() => setShowContactForm(true)}
                        className="pdm-cta-secondary w-full flex items-center justify-center gap-2.5"
                      >
                        <MessageSquare size={17} strokeWidth={2.5} />
                        <span>{t("message")}</span>
                      </button>
                      {property.agent?.lineId && (
                        <a
                          href={`https://line.me/ti/p/${property.agent.lineId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdm-cta-line w-full flex items-center justify-center gap-2.5"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                          </svg>
                          <span>{t("contactLine")}</span>
                        </a>
                      )}
                      <a
                        href={`mailto:${property.agent?.email || ''}`}
                        className="pdm-cta-email w-full flex items-center justify-center gap-2.5"
                      >
                        <Mail size={17} strokeWidth={2.5} />
                        <span>{t("sendEmail")}</span>
                      </a>
                    </div>
                  )}

                  <div className="h-px bg-slate-100" style={{ marginBottom: '20px' }} />

                  {/* Agent Profile */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 ring-2 ring-slate-100">
                      <img
                        src={agentImage}
                        className="w-full h-full object-cover"
                        alt="Agent"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {agentName}
                        </span>
                        {agentVerified && (
                          <span className="pdm-verified-badge">
                            <CheckCircle2 size={10} />
                            {t("verified")}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{agentRole}</span>
                    </div>
                  </div>
                </div>

                {/* ── PRICE SUMMARY CARD ────────────────────────────────────── */}
                <div className="pdm-sidebar-card">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2" style={{ marginBottom: '16px' }}>
                    <TrendingUp size={15} className="text-blue-500" />
                    {t("sidebar.priceSummary")}
                  </h3>
                  <div className="flex flex-col" style={{ gap: '16px' }}>
                    {[
                      { label: t('sidebar.listingPrice'), value: `฿ ${formatPrice(property.price)}` },
                      { label: t('sidebar.pricePerSqm'), value: property.livingArea ? `฿ ${formatPrice(Math.round(property.price / property.livingArea))}` : '-' },
                      { label: t('sidebar.pricePerSqwa'), value: property.landArea ? `฿ ${formatPrice(Math.round(property.price / property.landArea))}` : '-' },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-bold text-slate-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── SCHEDULE TOUR CARD ────────────────────────────────────── */}
                <div className="pdm-sidebar-card bg-slate-900 text-white">
                  <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{t("sidebar.scheduleTour")}</div>
                      <div className="text-xs text-white/60">{t("sidebar.pickDateTime")}</div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors active:scale-95">
                    {t("sidebar.bookTour")}
                  </button>
                </div>

                {/* Report Listing */}
                <div className="flex justify-center mt-4">
                  <button className="text-xs text-slate-400 hover:text-slate-600 underline flex items-center gap-1">
                    <Shield size={10} />
                    {t("sidebar.reportListing")}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLL TO TOP BUTTON ───────────────────────────────────────────── */}
        <button
          ref={scrollBtnRef}
          onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
          style={{ opacity: 0, pointerEvents: 'none', transform: 'translateY(10px)' }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── FULL GALLERY LIGHTBOX ─────────────────────────────────────────────── */}
      {showFullGallery && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[2000000] bg-black/95 flex flex-col" onClick={() => setShowFullGallery(false)}>
          <div className="flex items-center justify-between p-4 text-white" onClick={e => e.stopPropagation()}>
            <span className="text-sm font-medium opacity-70">{activeGalleryIndex + 1} / {galleryImages.length}</span>
            <button onClick={() => setShowFullGallery(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActiveGalleryIndex(i => Math.max(0, i - 1))}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <img
              src={galleryImages[activeGalleryIndex]}
              className="max-h-full max-w-full object-contain rounded-xl"
              alt={t("galleryImageAlt", { index: activeGalleryIndex + 1 })}
            />
            <button
              onClick={() => setActiveGalleryIndex(i => Math.min(galleryImages.length - 1, i + 1))}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          {/* Thumbnails */}
          <div className="flex gap-2 p-4 overflow-x-auto justify-center" onClick={e => e.stopPropagation()}>
            {galleryImages.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveGalleryIndex(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-all ${i === activeGalleryIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-80'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STYLES ──────────────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        #nest-fixed-modal-root { overscroll-behavior: contain !important; }
        #nest-fixed-modal-root * { box-sizing: border-box !important; }

        /* Header buttons */
        .pdm-header-btn {
          padding: 7px 14px;
          height: 36px;
          white-space: nowrap;
        }
        .pdm-header-btn-primary {
          padding: 7px 16px;
          height: 36px;
          white-space: nowrap;
        }

        /* Gallery */
        .pdm-gallery { flex-shrink: 0; }

        /* Badge */
        .pdm-badge-sale {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        /* Stats Bar */
        .pdm-stats-bar {
          padding: 20px 0;
          margin-bottom: 0;
        }
        .pdm-stat-item {
          flex: 1;
          min-width: 60px;
          padding: 12px 8px;
        }

        /* Section */
        .pdm-section {
          padding-top: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid #f1f5f9;
        }
        .pdm-section:last-child { border-bottom: none; }
        .pdm-section-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }

        /* Title */
        .pdm-title-section { padding-top: 0; }
        .pdm-main-title {
          font-size: clamp(1.2rem, 2.5vw, 1.6rem);
          font-weight: 800;
          line-height: 1.3;
          color: #0f172a;
        }

        /* Specs Grid */
        .pdm-specs-grid {
          border-radius: 16px;
        }

        /* Tabs */
        .pdm-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #64748b;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .pdm-tab:hover { color: #334155; }
        .pdm-tab--active {
          background: white;
          color: #1e40af;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }

        /* Amenity Items */
        .pdm-amenity-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 8px;
          border-radius: 14px;
          border: 1.5px solid transparent;
          transition: all 0.2s;
          cursor: default;
        }
        .pdm-amenity-item--active {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }
        .pdm-amenity-item--inactive {
          background: #f8fafc;
          border-color: #f1f5f9;
          color: #cbd5e1;
        }

        /* Map */
        .pdm-map-container { background: #f1f5f9; }

        /* Nearby */
        .pdm-nearby-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        /* Contact Form */
        .pdm-contact-form-container {
          background-color: #f8fafc !important;
          padding: 20px !important;
          border-radius: 14px !important;
          border: 1px solid #e2e8f0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          margin-bottom: 24px !important;
        }
        .pdm-contact-form-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          margin-bottom: 4px !important;
        }
        .pdm-contact-form-title {
          font-weight: 700 !important;
          color: #1e293b !important;
          font-size: 0.875rem !important;
          margin: 0 !important;
        }
        .pdm-contact-form-close {
          color: #94a3b8 !important;
          background: none !important;
          border: none !important;
          padding: 4px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: color 0.2s !important;
        }
        .pdm-contact-form-close:hover {
          color: #475569 !important;
        }
        .pdm-contact-form {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          margin: 0 !important;
        }
        .pdm-contact-input {
          width: 100% !important;
          font-size: 0.875rem !important;
          padding: 12px 14px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important; /* Force moderate roundness over pill */
          background-color: #ffffff !important;
          color: #0f172a !important;
          outline: none !important;
          transition: all 0.2s !important;
          min-height: 44px !important;
          height: auto !important;
          line-height: normal !important;
          box-sizing: border-box !important;
          margin: 0 !important;
        }
        .pdm-contact-input::placeholder {
          color: #94a3b8 !important;
        }
        .pdm-contact-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
        }
        .pdm-contact-textarea {
          width: 100% !important;
          font-size: 0.875rem !important;
          padding: 14px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important; /* Force moderate roundness over pill */
          background-color: #ffffff !important;
          color: #0f172a !important;
          outline: none !important;
          transition: all 0.2s !important;
          min-height: 100px !important;
          resize: none !important;
          line-height: 1.5 !important;
          box-sizing: border-box !important;
          margin: 0 !important;
        }
        .pdm-contact-textarea::placeholder {
          color: #94a3b8 !important;
        }
        .pdm-contact-textarea:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
        }
        .pdm-contact-submit {
          width: 100% !important;
          background-color: #2563eb !important;
          color: white !important;
          font-weight: 700 !important;
          font-size: 0.875rem !important;
          padding: 14px 20px !important;
          border-radius: 10px !important; /* Force moderate roundness over pill */
          border: none !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 8px !important;
          min-height: 48px !important;
          margin-top: 4px !important;
          box-sizing: border-box !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15) !important;
        }
        .pdm-contact-submit:hover:not(:disabled) {
          background-color: #1d4ed8 !important;
          transform: translateY(-1px) !important;
        }
        .pdm-contact-submit:disabled {
          opacity: 0.7 !important;
          cursor: not-allowed !important;
        }

        /* Sidebar */
        .pdm-sidebar-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        /* CTA Buttons */
        .pdm-cta-primary {
          padding: 16px 20px;
          background: #1d4ed8;
          color: white;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.9rem;
          transition: all 0.2s;
          text-decoration: none;
          display: flex;
        }
        .pdm-cta-primary:hover { background: #1e40af; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(29,78,216,0.3); }
        .pdm-cta-primary:active { transform: scale(0.98); }

        .pdm-cta-secondary {
          padding: 14px 20px;
          background: white;
          color: #0f172a;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s;
          cursor: pointer;
        }
        .pdm-cta-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

        .pdm-cta-line {
          padding: 14px 20px;
          background: #06c755;
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          text-decoration: none;
          display: flex;
        }
        .pdm-cta-line:hover { background: #05b34b; }

        .pdm-cta-email {
          padding: 14px 20px;
          background: white;
          color: #475569;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s;
          text-decoration: none;
          display: flex;
        }
        .pdm-cta-email:hover { background: #f8fafc; }

        /* Verified Badge */
        .pdm-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Body padding */
        .pdm-body {
          padding-left: 24px;
          padding-right: 12px;
        }
        @media (min-width: 768px) {
          .pdm-body {
            padding-left: 48px;
            padding-right: 24px;
          }
        }
        @media (min-width: 1024px) {
          .pdm-body {
            padding-left: 80px;
            padding-right: 48px;
          }
        }
        @media (min-width: 1400px) {
          .pdm-body {
            padding-left: 100px;
            padding-right: 40px;
          }
        }
 
        @media (max-width: 768px) {
          .pdm-stat-item { padding: 10px 4px; }
          .pdm-section { padding-top: 24px; padding-bottom: 24px; }
          .pdm-sidebar-card { padding: 24px 20px; }
        }
 
        .pdm-sidebar-card {
           padding-top: 36px;
           padding-bottom: 36px;
        }
      `}} />
    </div>
  );
}
