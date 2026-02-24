"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchModalWrapper from "@/components/SearchModalWrapper";
import FeatureGrid from "@/components/FeatureGrid";
import CustomerSection from "@/components/CustomerSection";
import VisitorsSection from "@/components/VisitorsSection";
import PropertyHub from "@/components/PropertyHub";
import LatestProjects from "@/components/LatestProjects";
import PopularLocations from "@/components/PopularLocations";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import BusinessCarousel from "@/components/BusinessCarousel";
import GSAPAnimations from "@/components/GSAPAnimations";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-500">
      <GSAPAnimations />
      <Navbar />

      {/* Search Result Panel (Portal) */}
      <SearchModalWrapper />

      <Hero />

      <BusinessCarousel />

      <div className="py-20">
        <FeatureGrid />
      </div>

      <div style={{ marginTop: '150px' }}>
        <CustomerSection />
      </div>

      <div style={{ marginTop: '150px' }}>
        <VisitorsSection />
      </div>

      <div style={{ marginTop: '150px' }}>
        <PropertyHub />
      </div>

      <div style={{ marginTop: '100px' }}>
        <LatestProjects />
      </div>

      <div style={{ marginTop: '100px' }}>
        <PopularLocations />
      </div>

      <div style={{ marginTop: '150px' }}>
        <FinalCTA />
      </div>

      <div style={{ marginTop: '150px' }}>
        <Footer />
      </div>
    </main>
  );
}
