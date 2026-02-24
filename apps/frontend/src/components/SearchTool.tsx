
"use client";

import React, { useEffect } from "react";
import { gsap } from "gsap";
import { useTranslations } from "next-intl";

export default function SearchTool() {
  const t = useTranslations("search");
  useEffect(() => {



    // --- CORE ELEMENTS ---
    const tabs = document.querySelectorAll('.search-tab');
    const indicator = document.getElementById('tabIndicator');
    const toggleBtn = document.getElementById('toggleFiltersBtn');
    const filterPanel = document.getElementById('filterPanel');
    const sectionHeaders = document.querySelectorAll('.section-header');
    const chips = document.querySelectorAll('.chip');
    const subOptions = document.querySelectorAll('.sub-option');
    const searchBtn = document.getElementById('searchBtn');
    const card = document.querySelector('.search-card');
    const tabNav = document.getElementById('tabNav');
    const tabPrevBtn = document.getElementById('tabPrev');
    const tabNextBtn = document.getElementById('tabNext');

    // --- GLOBAL NAVIGATOR DATA (Extended) ---
    const countryData = [
      // Asia & Pacific
      { c: 'Asia', n: 'Thailand', f: '🇹🇭' }, { c: 'Asia', n: 'Singapore', f: '🇸🇬' }, { c: 'Asia', n: 'Japan', f: '🇯🇵' }, { c: 'Asia', n: 'South Korea', f: '🇰🇷' }, { c: 'Asia', n: 'China', f: '🇨🇳' }, { c: 'Asia', n: 'Vietnam', f: '🇻🇳' }, { c: 'Asia', n: 'Malaysia', f: '🇲🇾' }, { c: 'Asia', n: 'Indonesia', f: '🇮🇩' }, { c: 'Asia', n: 'Australia', f: '🇦🇺' }, { c: 'Asia', n: 'New Zealand', f: '🇳🇿' }, { c: 'Asia', n: 'India', f: '🇮🇳' }, { c: 'Asia', n: 'Philippines', f: '🇵🇭' }, { c: 'Asia', n: 'Taiwan', f: '🇹🇼' },
      // Europe
      { c: 'Europe', n: 'United Kingdom', f: '🇬🇧' }, { c: 'Europe', n: 'Germany', f: '🇩🇪' }, { c: 'Europe', n: 'France', f: '🇫🇷' }, { c: 'Europe', n: 'Switzerland', f: '🇨🇭' }, { c: 'Europe', n: 'Italy', f: '🇮🇹' }, { c: 'Europe', n: 'Spain', f: '🇪🇸' }, { c: 'Europe', n: 'Netherlands', f: '🇳🇱' }, { c: 'Europe', n: 'Sweden', f: '🇸🇪' }, { c: 'Europe', n: 'Monaco', f: '🇲🇨' }, { c: 'Europe', n: 'Norway', f: '🇳🇴' }, { c: 'Europe', n: 'Austria', f: '🇦🇹' }, { c: 'Europe', n: 'Portugal', f: '🇵🇹' }, { c: 'Europe', n: 'Greece', f: '🇬🇷' }, { c: 'Europe', n: 'Denmark', f: '🇩🇰' },
      // Americas
      { c: 'Americas', n: 'United States', f: '🇺🇸' }, { c: 'Americas', n: 'Canada', f: '🇨🇦' }, { c: 'Americas', n: 'Mexico', f: '🇲🇽' }, { c: 'Americas', n: 'Brazil', f: '🇧🇷' }, { c: 'Americas', n: 'Argentina', f: '🇦🇷' }, { c: 'Americas', n: 'Colombia', f: '🇨🇴' }, { c: 'Americas', n: 'Chile', f: '🇨🇱' }, { c: 'Americas', n: 'Peru', f: '🇵🇪' }, { c: 'Americas', n: 'Panama', f: '🇵🇦' }, { c: 'Americas', n: 'Costa Rica', f: '🇨🇷' },
      // Middle East
      { c: 'Middle East', n: 'U.A.E', f: '🇦🇪' }, { c: 'Middle East', n: 'Saudi Arabia', f: '🇸🇦' }, { c: 'Middle East', n: 'Qatar', f: '🇶🇦' }, { c: 'Middle East', n: 'Turkey', f: '🇹🇷' }, { c: 'Middle East', n: 'Israel', f: '🇮🇱' }, { c: 'Middle East', n: 'Jordan', f: '🇯🇴' }, { c: 'Middle East', n: 'Kuwait', f: '🇰🇼' }, { c: 'Middle East', n: 'Oman', f: '🇴🇲' },
      // Africa
      { c: 'Africa', n: 'South Africa', f: '🇿🇦' }, { c: 'Africa', n: 'Egypt', f: '🇪🇬' }, { c: 'Africa', n: 'Morocco', f: '🇲🇦' }, { c: 'Africa', n: 'Nigeria', f: '🇳🇬' }, { c: 'Africa', n: 'Kenya', f: '🇰🇪' }, { c: 'Africa', n: 'Mauritius', f: '🇲🇺' }, { c: 'Africa', n: 'Seychelles', f: '🇸🇨' }
    ];

    const currentCountryBtn = document.getElementById('countryBtn');
    const countryModal = document.getElementById('countryModal');
    const closeBtn = document.getElementById('closeCountryModal');
    const resultsGrid = document.getElementById('countryResults');
    const searchInput = document.getElementById('countrySearch') as HTMLInputElement;
    const continentBtns = document.querySelectorAll('.continent-btn');
    const currentCountryName = document.getElementById('currentCountry');
    const currentCountryFlag = document.getElementById('currentFlag');

    // Move modal to body to avoid transform trap from parent components
    if (countryModal) {
      document.body.appendChild(countryModal);
    }

    let activeContinent = 'All';

    // Ease for GSAP
    gsap.registerEase("premium.out", (progress: number) => {
      const p = progress;
      return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    });

    const renderCountries = (filterTerm = '') => {
      if (!resultsGrid) return;
      const term = filterTerm.toLowerCase();
      const items = countryData.filter(item => {
        const matchContinent = activeContinent === 'All' || item.c === activeContinent;
        const matchSearch = item.n.toLowerCase().includes(term);
        return matchContinent && matchSearch;
      });

      resultsGrid.innerHTML = items.map(item => `
          <div class="country-card-premium" data-name="${item.n}" data-flag="${item.f}">
             <span class="c-flag">${item.f}</span>
             <span class="c-name">${item.n}</span>
          </div>
       `).join('');

      // Entrance Animation - faster and smoother
      gsap.from('.country-card-premium', {
        y: 10,
        opacity: 0,
        scale: 0.95,
        stagger: 0.015,
        duration: 0.3,
        ease: "power2.out",
        clearProps: "all"
      });

      // Bind Clicks
      resultsGrid.querySelectorAll('.country-card-premium').forEach(c => {
        c.addEventListener('click', () => {
          const name = c.getAttribute('data-name');
          const flag = c.getAttribute('data-flag');
          if (currentCountryName) currentCountryName.innerText = name || '';
          if (currentCountryFlag) currentCountryFlag.innerText = flag || '';
          closeCountryNavigator();
        });
      });
    };

    const openCountryNavigator = () => {
      if (!countryModal) return;
      countryModal.style.display = 'flex';

      const tl = gsap.timeline();
      tl.fromTo('.country-modal-content',
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
      tl.from('.navigator-sidebar > *', {
        x: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all"
      }, "-=0.2");

      renderCountries();
    };

    const closeCountryNavigator = () => {
      if (!countryModal) return;
      gsap.to('.country-modal-content', {
        y: 20, opacity: 0, scale: 0.98, duration: 0.3, ease: "power2.in",
        onComplete: () => { countryModal.style.display = 'none'; }
      });
    };

    currentCountryBtn?.addEventListener('click', openCountryNavigator);
    closeBtn?.addEventListener('click', closeCountryNavigator);
    countryModal?.addEventListener('click', (e) => { if (e.target === countryModal) closeCountryNavigator(); });

    continentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        continentBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeContinent = btn.getAttribute('data-continent') || 'All';
        renderCountries(searchInput?.value);
      });
    });

    searchInput?.addEventListener('input', (e) => {
      renderCountries((e.target as HTMLInputElement).value);
    });

    // --- REUSABLE UTILS ---
    const updateArrows = () => {
      if (!tabPrevBtn || !tabNextBtn || !tabNav) return;
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        tabPrevBtn.style.display = 'none';
        tabNextBtn.style.display = 'none';
        return;
      }
      const scrollLeft = tabNav.scrollLeft;
      const maxScroll = tabNav.scrollWidth - tabNav.clientWidth;
      tabPrevBtn.style.display = 'flex';
      tabNextBtn.style.display = 'flex';
      tabPrevBtn.classList.toggle('hidden', scrollLeft <= 5);
      tabNextBtn.classList.toggle('hidden', scrollLeft >= maxScroll - 5);
    };

    const moveIndicator = (tab: HTMLElement) => {
      if (!indicator) return;
      gsap.to(indicator, { left: tab.offsetLeft, width: tab.offsetWidth, duration: 0.4, ease: "power2.out", display: "block" });
    };

    const triggerFeedback = () => {
      if (!card) return;
      const el = card as HTMLElement;
      const bar = document.querySelector('.search-main-bar') as HTMLElement;
      gsap.killTweensOf([el, bar]);

      const tl = gsap.timeline();
      tl.to(el, { borderColor: '#60a5fa', boxShadow: '0 0 30px rgba(59,130,246,0.2)', duration: 0.2 })
        .to(el, { borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.04)', duration: 0.8 });

      if (bar) {
        tl.to(bar, { borderColor: '#3b82f6', scale: 1.005, duration: 0.2 }, 0)
          .to(bar, { borderColor: 'rgba(0,0,0,0.08)', scale: 1, duration: 0.8 });
      }
    };

    // --- SHARED POPOVER LOGIC ---
    const closeAllPopovers = () => {
      document.querySelectorAll('.price-popover, .autocomplete-dropdown, .specs-popover').forEach(el => el.classList.remove('show'));
    };

    // --- BEDROOMS ---
    const specsTrigger = document.getElementById('specsDropdownTrigger');
    const specsPopover = document.getElementById('specsPopover');
    const specsValueDisplay = document.getElementById('specsValue');

    specsTrigger?.addEventListener('click', (e) => {
      if ((e.target as Element).closest('#specsPopover')) return;
      const isOpen = specsPopover?.classList.contains('show');
      closeAllPopovers();
      if (!isOpen) {
        specsPopover?.classList.add('show');
        // Premium entrance animation
        gsap.fromTo('.specs-list .spec-option',
          { opacity: 0, x: -15, scale: 0.95 },
          {
            opacity: 1, x: 0, scale: 1,
            stagger: 0.04, duration: 0.5,
            ease: "premium.out" as any,
            clearProps: "all"
          }
        );
      }
    });

    document.querySelectorAll('.spec-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-val');
        if (specsValueDisplay && val) {
          specsValueDisplay.innerText = val === 'Any' ? t("anyBedrooms") : (val === 'Studio' ? t("studio") : t(`${val.toLowerCase()}bed${parseInt(val) > 1 ? 's' : ''}` as any));
        }
        closeAllPopovers();
      });
    });

    // --- LOCATION AUTOCOMPLETE ---
    const locInput = document.getElementById('keyword-search') as HTMLInputElement;
    const locDropdown = document.getElementById('locationAutocomplete');
    const barLoc = document.querySelector('.bar-location') as HTMLElement;
    const barPrice = document.querySelector('.bar-price') as HTMLElement;
    const barSpecs = document.querySelector('.bar-specs') as HTMLElement;

    const mockLocations = [
      { type: 'Provinces', name: 'Bangkok', sub: 'Central' }, { type: 'Provinces', name: 'Phuket', sub: 'Southern' }, { type: 'Districts', name: 'Watthana', sub: 'Bangkok' }, { type: 'Projects', name: '98 Wireless', sub: 'Bangkok' }
    ];

    // Expansion Animation
    locInput?.addEventListener('focus', () => {
      if (window.innerWidth > 900) {
        gsap.to(barLoc, { flex: 3.5, duration: 0.35, ease: "premium.out" as any });
        gsap.to([barPrice, barSpecs], { flex: 0.7, duration: 0.35, ease: "premium.out" as any });
      }
    });

    locInput?.addEventListener('blur', () => {
      if (window.innerWidth > 900 && !locDropdown?.classList.contains('show')) {
        gsap.to(barLoc, { flex: 2.5, duration: 0.35, ease: "premium.out" as any });
        gsap.to([barPrice, barSpecs], { flex: 1.2, duration: 0.35, ease: "premium.out" as any });
      }
    });

    locInput?.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value.toLowerCase();
      if (val.length < 1) { locDropdown?.classList.remove('show'); return; }
      const matches = mockLocations.filter(L => L.name.toLowerCase().includes(val));
      if (matches.length > 0) {
        locDropdown!.innerHTML = matches.map(m => `<div class="ac-item" data-val="${m.name}">${m.name} <span class="item-sub">${m.sub}</span></div>`).join('');
        locDropdown!.classList.add('show');
        locDropdown!.querySelectorAll('.ac-item').forEach(i => i.addEventListener('click', () => {
          locInput.value = i.getAttribute('data-val') || '';
          closeAllPopovers();
          // Reset flex after selection
          if (window.innerWidth > 900) {
            gsap.to(barLoc, { flex: 2.5, duration: 0.35, ease: "premium.out" as any });
            gsap.to([barPrice, barSpecs], { flex: 1.2, duration: 0.35, ease: "premium.out" as any });
          }
        }));
      } else { locDropdown?.classList.remove('show'); }
    });

    // --- PRICE RANGE ---
    const priceTrigger = document.getElementById('priceRangeTrigger');
    const pricePopover = document.getElementById('pricePopover');
    const priceDisplay = document.getElementById('priceRangeDisplay');
    const pMin = document.getElementById('priceMin') as HTMLInputElement;
    const pMax = document.getElementById('priceMax') as HTMLInputElement;

    const updatePriceTxt = () => {
      if (!pMin || !pMax || !priceDisplay) return;
      const minV = pMin.value ? parseInt(pMin.value).toLocaleString() : '0';
      const maxV = pMax.value ? parseInt(pMax.value).toLocaleString() : t("noLimit");
      priceDisplay.innerText = (pMin.value || pMax.value) ? `${minV} - ${maxV}` : t("priceRange");
    };

    priceTrigger?.addEventListener('click', (e) => {
      if ((e.target as Element).closest('#pricePopover')) return;
      const isOpen = pricePopover?.classList.contains('show');
      closeAllPopovers();
      if (!isOpen) pricePopover?.classList.add('show');
    });

    document.querySelectorAll('.preset-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (pMin) pMin.value = b.getAttribute('data-min') || '';
        if (pMax) pMax.value = b.getAttribute('data-max') || '';
        updatePriceTxt();
        closeAllPopovers();
      });
    });

    pMin?.addEventListener('input', updatePriceTxt);
    pMax?.addEventListener('input', updatePriceTxt);

    // --- GLOBAL EVENTS ---
    document.addEventListener('click', (e) => {
      const target = e.target as Node;
      if (!priceTrigger?.contains(target) && !specsTrigger?.contains(target) && !locInput?.contains(target)) {
        closeAllPopovers();
      }
    });

    // --- INITIALIZE ---
    const activeTab = document.querySelector('.search-tab.active') as HTMLElement;
    if (activeTab) setTimeout(() => moveIndicator(activeTab), 300);

    if (tabNav) {
      tabNav.addEventListener('scroll', updateArrows);
      window.addEventListener('resize', updateArrows);
      setTimeout(updateArrows, 100);
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        moveIndicator(tab as HTMLElement);
        triggerFeedback();
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setTimeout(updateArrows, 400);
      });
    });

    subOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        subOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        triggerFeedback();
        gsap.from(opt, { scale: 0.95, duration: 0.2 });
      });
    });

    toggleBtn?.addEventListener('click', () => {
      const isOpen = filterPanel?.classList.toggle('open');
      if (isOpen) gsap.fromTo(filterPanel, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5 });
      else gsap.to(filterPanel, { height: 0, opacity: 0, duration: 0.4 });
    });

    sectionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling as HTMLElement;
        const isOpen = header.classList.toggle('open');
        if (isOpen) {
          body.classList.add('open');
          gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.4 });
        } else {
          gsap.to(body, { height: 0, opacity: 0, duration: 0.3, onComplete: () => body.classList.remove('open') });
        }
      });
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const g = chip.parentElement!;
        g.classList.contains('multi') ? chip.classList.toggle('selected') : (g.querySelectorAll('.chip').forEach(c => c.classList.remove('selected')), chip.classList.add('selected'));
        if (chip.classList.contains('selected')) {
          gsap.from(chip, { scale: 0.9, duration: 0.3, ease: "back.out(3)" });
          triggerFeedback();
        }
      });
    });

    searchBtn?.addEventListener('click', () => {
      // 1. Resolve Property Type from Tabs
      const activeTab = document.querySelector('.search-tab.active')?.getAttribute('data-tab') || 'properties';
      let propertyType = undefined;

      // Map tab ID to DB Category Enum
      switch (activeTab) {
        case 'condos': propertyType = 'condo'; break;
        case 'houses': propertyType = 'house,villa'; break; // Support both
        case 'land': propertyType = 'land'; break;
        case 'commercial': propertyType = 'commercial'; break;
        case 'investment': propertyType = undefined; break; // Show all for now
        default: propertyType = undefined; // 'properties' = all
      }

      // 2. Resolve Listing Type
      const activeMode = document.querySelector('.sub-option.active');
      const listingType = activeMode?.getAttribute('data-mode') === 'rent' ? 'rent' : 'sale';

      // 3. Resolve Price
      const pMinVal = (document.getElementById('priceMin') as HTMLInputElement)?.value;
      const pMaxVal = (document.getElementById('priceMax') as HTMLInputElement)?.value;
      const priceMin = pMinVal ? parseInt(pMinVal) : undefined;
      const priceMax = pMaxVal ? parseInt(pMaxVal) : undefined;

      // 4. Resolve Bedrooms
      // UI text: "Any bedrooms", "Studio", "1 Bedroom", "2 Bedrooms", "4+ Bedrooms"
      const bedText = document.getElementById('specsValue')?.innerText || '';
      let bedrooms = undefined;
      if (bedText === 'Studio') bedrooms = '0';
      else if (bedText.includes('Any')) bedrooms = undefined;
      else if (bedText.includes('+')) bedrooms = '4+';
      else if (parseInt(bedText)) bedrooms = bedText.split(' ')[0];

      // 5. Construct Filter Object
      const filters = {
        location: (document.getElementById('keyword-search') as HTMLInputElement)?.value || '',
        priceMin,
        priceMax,
        bedrooms,
        propertyType,
        listingType
      };

      console.log('🚀 Dispatching Search Event:', filters);

      // Dispatch event for SearchModalWrapper to catch
      window.dispatchEvent(new CustomEvent('openSearchModal', {
        detail: { filters }
      }));

      triggerFeedback();
    });

    // Navigation arrows
    tabPrevBtn?.addEventListener('click', () => tabNav?.scrollBy({ left: -150, behavior: 'smooth' }));
    tabNextBtn?.addEventListener('click', () => tabNav?.scrollBy({ left: 150, behavior: 'smooth' }));
    const handleResize = () => {
      const activeTab = document.querySelector('.search-tab.active') as HTMLElement;
      if (activeTab) moveIndicator(activeTab);
      updateArrows();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up modal from body to prevent persistence on navigation
      if (countryModal && countryModal.parentNode === document.body) {
        document.body.removeChild(countryModal);
      }
    };
  }, []);

  return (
    <>


      <div className="search-tool-wrapper-outer gsap-reveal">

        <div className="search-tabs-container-wrapper">
          <button className="tab-nav-btn tab-prev" id="tabPrev" aria-label="Previous tabs">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="search-tabs-container">
            <div className="search-tabs" id="tabNav">
              <button className="search-tab active" data-tab="properties">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                {t("properties")}
              </button>
              <button className="search-tab" data-tab="condos">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="6" x2="12" y2="6.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line></svg>
                {t("condos")}
              </button>
              <button className="search-tab" data-tab="houses">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                {t("houses")}
              </button>
              <button className="search-tab" data-tab="land">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon></svg>
                {t("land")}
              </button>
              <button className="search-tab" data-tab="commercial">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                {t("commercial")}
              </button>
              <button className="search-tab" data-tab="investment">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                {t("investment")}
              </button>
              <div className="search-tab-indicator" id="tabIndicator"></div>
            </div>
          </div>
          <button className="tab-nav-btn tab-next" id="tabNext" aria-label="Next tabs">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>


        <div className="search-card">
          <div className="search-card-glow"></div>


          <div className="search-sub-options">
            <button className="sub-option active" data-mode="sale">{t("forSale")}</button>
            <button className="sub-option" data-mode="rent">{t("forRent")}</button>
          </div>


          <div className="search-main-bar">

            <div className="bar-section bar-location">
              <button className="country-pill-trigger" id="countryBtn">
                <span className="country-flag" id="currentFlag">🇹🇭</span>
                <span className="country-name" id="currentCountry">{t("country")}</span>
                <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div className="bar-v-divider"></div>
              <div className="location-input-container" id="locationInputGroup">
                <input type="text" id="keyword-search" placeholder={t("cityPlaceholder")} aria-label="Location Search" autoComplete="off" />
                <div className="autocomplete-dropdown" id="locationAutocomplete"></div>
              </div>
            </div>

            <div className="bar-v-divider hide-mobile"></div>


            <div className="bar-section bar-price" id="priceRangeTrigger">
              <div className="field-content">
                <span className="field-label">{t("priceRange")}</span>
                <span className="field-value" id="priceRangeDisplay">{t("anyPrice")}</span>
              </div>
              <svg className="field-chevron" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>


              <div className="price-popover" id="pricePopover">
                <div className="price-popover-inputs">
                  <div className="price-input-group">
                    <label>{t("minPrice")}</label>
                    <input type="number" id="priceMin" placeholder="0" />
                  </div>
                  <div className="price-sep">-</div>
                  <div className="price-input-group">
                    <label>{t("maxPrice")}</label>
                    <input type="number" id="priceMax" placeholder={t("noLimit")} />
                  </div>
                </div>
                <div className="price-presets">
                  <button className="preset-btn" data-min="0" data-max="5000000">{t("under5m")}</button>
                  <button className="preset-btn" data-min="5000000" data-max="10000000">{t("5m10m")}</button>
                  <button className="preset-btn" data-min="10000000" data-max="20000000">{t("10m20m")}</button>
                  <button className="preset-btn" data-min="20000000" data-max="">{t("20mPlus")}</button>
                </div>
              </div>
            </div>

            <div className="bar-v-divider hide-mobile"></div>


            <div className="bar-section bar-specs" id="specsDropdownTrigger">
              <div className="field-content">
                <span className="field-label">{t("bedrooms")}</span>
                <span className="field-value" id="specsValue">{t("anyBedrooms")}</span>
              </div>
              <svg className="field-chevron" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>

              <div className="specs-popover" id="specsPopover">
                <div className="specs-list">
                  <button className="spec-option" data-val="Any">
                    <span className="spec-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></span>
                    <span className="spec-text">{t("anyBedrooms")}</span>
                  </button>
                  <button className="spec-option" data-val="Studio">
                    <span className="spec-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
                    <span className="spec-text">{t("studio")}</span>
                  </button>
                  <button className="spec-option" data-val="1">
                    <span className="spec-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 14h10"></path><path d="M7 18h10"></path><path d="M21 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12"></path></svg></span>
                    <span className="spec-text">{t("1bed")}</span>
                  </button>
                  <button className="spec-option" data-val="2">
                    <span className="spec-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M22 20h2"></path><path d="M8 8V4"></path></svg></span>
                    <span className="spec-text">{t("2beds")}</span>
                  </button>
                  <button className="spec-option" data-val="3">
                    <span className="spec-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20"></path><path d="M2 14h20"></path><path d="M2 8h20"></path><path d="M2 4h20"></path></svg></span>
                    <span className="spec-text">{t("3beds")}</span>
                  </button>
                  <button className="spec-option" data-val="4+">
                    <span className="spec-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg></span>
                    <span className="spec-text">{t("4bedsPlus")}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>


          <div className="add-filter-row">
            <button className="add-filter-btn" id="toggleFiltersBtn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
              {t("advancedFilters")}
              <span className="filter-count" id="filterCount" style={{ display: "none" }}>0</span>
            </button>
          </div>


          <div className="search-btn-wrapper">
            <button className="search-btn-bottom" id="searchBtn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span className="btn-text">{t("search")}</span>
            </button>
          </div>


          <div className="filter-panel" id="filterPanel">
            <div className="filter-panel-inner">

              <div className="filter-section" data-section="physical">
                <button className="section-header" data-toggle="physical">
                  <div className="section-title-group">
                    <div className="section-icon physical-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
                    <span>{t("physicalSpecs")}</span>
                  </div>
                  <svg className="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div className="section-body" id="section-physical">
                  <div className="filter-grid">
                    <div className="filter-group-inner">

                      <label className="filter-label">{t("listingType")}</label>
                      <div className="chip-group" data-filter="listingType">
                        <button className="chip selected" data-value="new">{t("newProjects")}</button>
                        <button className="chip" data-value="resale">{t("resale")}</button>
                      </div>
                    </div>
                    <div className="filter-group-inner">
                      <label className="filter-label">{t("bathrooms")}</label>
                      <div className="chip-group" data-filter="bathrooms">
                        <button className="chip" data-value="any">{t("any")}</button>
                        <button className="chip" data-value="1+">1+</button>
                        <button className="chip" data-value="2+">2+</button>
                        <button className="chip" data-value="3+">3+</button>
                      </div>
                    </div>
                    <div className="filter-group-inner span-2">
                      <label className="filter-label">{t("livingArea")}</label>
                      <div className="range-inputs">
                        <input type="number" placeholder={t("min")} id="livingAreaMin" />
                        <span className="range-sep">—</span>
                        <input type="number" placeholder={t("max")} id="livingAreaMax" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="filter-section" data-section="amenities">
                <button className="section-header" data-toggle="amenities">
                  <div className="section-title-group">
                    <div className="section-icon amenities-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></div>
                    <span>{t("amenitiesLifestyle")}</span>
                  </div>
                  <svg className="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div className="section-body" id="section-amenities">
                  <div className="filter-grid">
                    <div className="filter-group-inner span-2">
                      <label className="filter-label">{t("viewHighlights")}</label>
                      <div className="chip-group multi" data-filter="view">
                        <button className="chip" data-value="sea">{t("seaView")}</button>
                        <button className="chip" data-value="city">{t("cityView")}</button>
                        <button className="chip" data-value="garden">{t("gardenView")}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="filter-actions">
              <button className="btn-reset" id="resetFiltersBtn">{t("resetAll")}</button>
              <button className="btn-apply" id="applyFiltersBtn">{t("applyFilters")}</button>
            </div>
          </div>
        </div>


        <div className="country-modal-overlay" id="countryModal">
          <div className="country-modal-content">
            <button className="close-modal-btn-abs" id="closeCountryModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="navigator-layout">
              <div className="navigator-sidebar">
                <h2 className="sidebar-title">{t("worldRegions")}</h2>
                <div className="continent-list" id="continentNav">
                  <button className="continent-btn active" data-continent="All">{t("allRegions")}</button>
                  <button className="continent-btn" data-continent="Asia">{t("asia")}</button>
                  <button className="continent-btn" data-continent="Europe">{t("europe")}</button>
                  <button className="continent-btn" data-continent="Americas">{t("americas")}</button>
                  <button className="continent-btn" data-continent="Middle East">{t("middleEast")}</button>
                  <button className="continent-btn" data-continent="Africa">{t("africa")}</button>
                </div>
              </div>

              <div className="navigator-main">
                <div className="navigator-header">
                  <div className="search-box-global">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" id="countrySearch" placeholder={t("searchDestination")} />
                  </div>
                </div>

                <div className="country-results-container">
                  <div className="country-grid-premium" id="countryResults">

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>








      <style dangerouslySetInnerHTML={{
        __html: `
  /* ========== WRAPPER ========== */
  .search-tool-wrapper-outer {
    width: 100%;
    max-width: 850px; /* Reduced further for compactness */
    margin: 0 auto;
    font-family: var(--font-sans, 'Inter', sans-serif);
    position: relative;
    z-index: 10;
  }

  /* ========== TABS (Scaled Down) ========== */
  .search-tabs-container-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    margin-bottom: -1px;
    z-index: 20;
    max-width: 850px;
    margin: 0 auto;
  }
  .search-tabs-container {
    display: flex;
    justify-content: center;
    position: relative;
    max-width: calc(100% - 80px); /* Space for arrows if needed */
  }
  .tab-nav-btn {
    display: none; /* Hidden by default on Desktop */
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--search-border, rgba(0,0,0,0.08));
    background: var(--bg-surface, rgba(255,255,255,0.9));
    backdrop-filter: blur(8px);
    color: #3b82f6;
    cursor: pointer;
    z-index: 30;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .tab-nav-btn:hover { background: #fff; transform: scale(1.1); box-shadow: 0 6px 16px rgba(59,130,246,0.15); }
  .tab-nav-btn:active { transform: scale(0.95); }
  .tab-nav-btn.hidden { opacity: 0; pointer-events: none; }
  
  .tab-prev { margin-right: 8px; }
  .tab-next { margin-left: 8px; }
  .search-tabs {
    display: flex;
    background: var(--bg-surface, #fff);
    padding: 3px;
    border-radius: 10px 10px 0 0;
    border: 1px solid var(--search-border, rgba(0,0,0,0.08));
    border-bottom: none;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
  }
  .search-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0.4rem 0.8rem;
    border: none;
    background: transparent;
    color: var(--text-secondary, #64748b);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 2;
    transition: all 0.2s ease;
  }
  .search-tab.active { color: #3b82f6; font-weight: 600; }
  .search-tab-indicator {
    position: absolute;
    bottom: 0px;
    height: 100%;
    background: rgba(59, 130, 246, 0.08);
    border-radius: 6px;
    display: none;
    z-index: 1;
  }
  .search-tab-indicator::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 3px;
    background: #3b82f6;
    border-radius: 3px 3px 0 0;
  }

  /* ========== CARD & INPUTS (Enhanced Pill Design) ========== */
  .search-card {
    background: var(--bg-surface, #fff);
    border: 1px solid var(--search-border, rgba(0,0,0,0.08));
    border-radius: 20px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.04);
    padding: 1rem 1.25rem 2rem; /* Increased bottom padding for button */
    position: relative;
    overflow: visible;
  }

  .search-sub-options { display: flex; gap: 8px; margin-bottom: 1.25rem; justify-content: center; }
  .sub-option {
    padding: 0.4rem 1rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid rgba(0,0,0,0.06);
    background: transparent;
    color: var(--text-secondary, #64748b);
    transition: all 0.25s ease;
  }
  .sub-option.active { 
    border-color: #3b82f6; 
    color: #3b82f6; 
    background: rgba(59,130,246,0.05); 
    box-shadow: inset 0 0 0 1px #3b82f6;
  }

  /* ========== WORLD NAVIGATOR (GSAP POWERED) ========== */
  .country-modal-overlay {
    position: fixed;
    top: 0; left: 0; bottom: 0; right: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  
  .country-modal-content {
    background: var(--bg-surface, #fff);
    border-radius: 28px;
    width: 90%;
    max-width: 1000px;
    height: 80vh;
    box-shadow: 0 50px 100px rgba(0,0,0,0.4);
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    margin: auto;
  }
  
  .navigator-layout { display: flex; width: 100%; height: 100%; }

  /* Sidebar */
  .navigator-sidebar {
    width: 250px;
    background: rgba(59,130,246,0.03);
    border-right: 1px solid rgba(0,0,0,0.05);
    padding: 2.5rem 1.25rem;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-shrink: 0;
  }
  .sidebar-title { 
    font-size: 0.75rem; 
    text-transform: uppercase; 
    letter-spacing: 2px; 
    color: #94a3b8; 
    font-weight: 800; 
    margin-bottom: 2rem; 
    padding-left: 0.8rem;
    opacity: 1;
    visibility: visible;
  }
  .continent-list { 
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
    opacity: 1;
    visibility: visible;
  }
  .continent-btn {
    text-align: left; 
    padding: 0.9rem 1.1rem; 
    border-radius: 12px; 
    border: none; 
    background: transparent;
    color: #64748b; 
    font-size: 0.9rem; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    user-select: none;
    opacity: 1;
    visibility: visible;
  }
  .continent-btn.active { 
    background: #3b82f6; 
    color: #fff; 
    box-shadow: 0 10px 20px rgba(59,130,246,0.2); 
    transform: translateX(5px); 
  }
  .continent-btn:not(.active):hover { 
    background: rgba(59,130,246,0.08); 
    color: #3b82f6; 
  }

  /* Main */
  .navigator-main { flex: 1; display: flex; flex-direction: column; background: #fff; position: relative; overflow: hidden; }
  .navigator-header { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(0,0,0,0.04); }
  .search-box-global {
    display: flex; align-items: center; gap: 12px; background: #f1f5f9; padding: 0.75rem 1.5rem; border-radius: 100px;
    border: 1px solid rgba(0,0,0,0.05); transition: all 0.3s;
  }
  .search-box-global:focus-within { background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
  .search-box-global input { flex: 1; border: none; outline: none; background: transparent; font-size: 1rem; font-weight: 500; color: #1e293b; }
  .search-box-global svg { color: #3b82f6; }

  .country-results-container { flex: 1; overflow-y: auto; padding: 1.5rem 2rem 2.5rem; }
  .country-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
  
  .country-card-premium {
    display: flex; align-items: center; gap: 10px; padding: 0.85rem; border-radius: 14px;
    background: #fcfcfc; border: 1px solid rgba(0,0,0,0.03); cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    user-select: none;
  }
  .country-card-premium:hover {
    background: #fff; border-color: #3b82f6; transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(59,130,246,0.08);
  }
  .country-card-premium * { cursor: pointer; }
  .country-card-premium .c-flag { font-size: 1.4rem; transition: transform 0.3s; }
  .country-card-premium:hover .c-flag { transform: scale(1.1); }
  .country-card-premium .c-name { font-size: 0.85rem; font-weight: 600; color: #334155; }

  .close-modal-btn-abs {
    position: absolute; top: 1.25rem; right: 1.25rem; width: 40px; height: 40px; border-radius: 50%;
    background: rgba(0,0,0,0.03); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: #64748b; z-index: 1000; transition: all 0.3s;
  }
  .close-modal-btn-abs:hover { background: #fee2e2; color: #ef4444; transform: scale(1.1); }

  :root[data-theme="dark"] .navigator-main { background: #0f172a; }
  :root[data-theme="dark"] .navigator-sidebar { background: rgba(15,23,42,0.6); border-color: rgba(255,255,255,0.1); }
  :root[data-theme="dark"] .search-box-global { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); }
  :root[data-theme="dark"] .search-box-global input { color: #f1f5f9; }
  :root[data-theme="dark"] .country-card-premium { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); }
  :root[data-theme="dark"] .country-card-premium .c-name { color: #e2e8f0; }

  @media (max-width: 768px) {
    .country-modal-content { 
      height: 90vh; 
      max-height: none; 
      width: 100%; 
      border-radius: 24px 24px 0 0; 
      position: fixed; 
      bottom: 0; 
      display: flex; 
      flex-direction: column; 
    }
    .navigator-layout { flex-direction: column; height: 100%; }
    .navigator-sidebar { 
      width: 100%; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.05); 
      padding: 1rem; order: 2; 
    }
    .sidebar-title { display: none; }
    .continent-list { flex-direction: row; overflow-x: auto; padding: 0 5px 5px; gap: 8px; scrollbar-width: none; }
    .continent-list::-webkit-scrollbar { display: none; }
    .continent-btn { white-space: nowrap; padding: 0.6rem 1rem; font-size: 0.8rem; background: rgba(0,0,0,0.03); }
    .continent-btn.active { transform: none; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
    
    .navigator-main { order: 1; flex: none; }
    .navigator-header { padding: 1.25rem 1rem; }
    .country-results-container { order: 3; flex: 1; padding: 1rem; }
    .country-grid-premium { grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 8px; }
    .country-card-premium { padding: 0.65rem; border-radius: 12px; }
    .country-card-premium .c-flag { font-size: 1.2rem; }
    .country-card-premium .c-name { font-size: 0.75rem; }
    
    .close-modal-btn-abs { top: 0.75rem; right: 0.75rem; width: 32px; height: 32px; }
  }

  /* ========== UNIFIED MAIN BAR ========== */
  .search-main-bar {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 18px;
    padding: 8px;
    gap: 0;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    position: relative;
    z-index: 10;
  }
  .search-main-bar:hover {
    border-color: rgba(59,130,246,0.2);
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }
  .search-main-bar:focus-within {
    border-color: #3b82f6;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.1), 0 15px 40px rgba(0,0,0,0.06);
  }

  .bar-section {
    display: flex;
    align-items: center;
    padding: 0.5rem 1.25rem;
    cursor: pointer;
    position: relative;
    height: 56px;
    border-radius: 12px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: flex;
  }
  .bar-section:hover:not(:focus-within) { background: #f8fafc; }
  .bar-section:active { transform: scale(0.99); }
  
  .bar-v-divider {
    width: 1px;
    height: 28px;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.06) 20%, rgba(0,0,0,0.06) 80%, transparent);
    margin: 0 6px;
    flex-shrink: 0;
  }

  .bar-location { flex: 2.5; gap: 14px; }
  .bar-price { flex: 1.2; gap: 10px; }
  .bar-specs { flex: 1.2; gap: 10px; }

  /* ========== SEARCH BUTTON AT BOTTOM (NEW DESIGN) ========== */
  .search-btn-wrapper {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    z-index: 9; /* Lower than dropdowns (100) and popovers (1000) - stays behind */
    width: 85%; /* Wider button */
    max-width: 400px;
  }

  .search-btn-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%; /* Full width of wrapper */
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;
    border: none;
    padding: 0.65rem 2rem;
    border-radius: 999px; /* Pill shape */
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }

  .search-btn-bottom:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.45), 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .search-btn-bottom:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  }

  .search-btn-bottom svg {
    flex-shrink: 0;
  }

  .search-btn-bottom .btn-text {
    font-size: 0.9rem;
    letter-spacing: 0.3px;
  }

  .country-pill-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f1f5f9;
    padding: 0.45rem 0.85rem;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.04);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .country-pill-trigger:hover { background: #e2e8f0; transform: translateY(-1px); }
  .country-pill-trigger .country-flag { font-size: 1.25rem; }
  .country-pill-trigger .country-name { font-size: 0.8rem; font-weight: 800; color: #1e293b; }
  .country-pill-trigger .chevron-down { color: #64748b; }

  .location-input-container { flex: 1; position: relative; }
  .location-input-container input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.85rem;
    font-weight: 600;
    color: #1e293b;
    padding: 0;
  }
  .location-input-container input::placeholder { color: #94a3b8; font-weight: 500; }

  .field-content { display: flex; flex-direction: column; text-align: left; min-width: 0; flex: 1; }
  .field-label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .field-value { font-size: 0.85rem; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .field-chevron { color: #cbd5e1; margin-left: auto; }

  .price-popover {
    position: absolute;
    top: calc(100% + 12px);
    left: 0;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    padding: 1.25rem;
    z-index: 1000;
    display: none;
    min-width: 280px;
  }
  .price-popover.show { display: block; animation: floatUp 0.3s ease; }

  @keyframes floatUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* Specs Popover (Bedrooms) */
  .specs-popover {
    position: absolute; 
    top: calc(100% + 12px); 
    left: 0; 
    width: 210px;
    background: #fff; 
    border: 1px solid rgba(0,0,0,0.08); 
    border-radius: 18px;
    box-shadow: 0 15px 40px rgba(0,0,0,0.12); 
    padding: 0.6rem; 
    z-index: 1000;
    display: none;
    overflow: hidden;
  }
  .specs-popover.show { display: block; animation: floatUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }

  .specs-list { display: flex; flex-direction: column; gap: 4px; }
  
  .spec-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  .spec-option:hover {
    background: #f1f5f9;
    padding-left: 1.25rem;
  }
  .spec-option:active { transform: scale(0.98); }
  
  .spec-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59,130,246,0.06);
    color: #3b82f6;
    border-radius: 10px;
    transition: all 0.3s;
  }
  .spec-option:hover .spec-icon {
    background: #3b82f6;
    color: #fff;
    transform: rotate(5deg) scale(1.1);
  }
  
  .spec-text {
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    transition: color 0.2s;
  }
  .spec-option:hover .spec-text { color: #1e293b; }

  :root[data-theme="dark"] .spec-option:hover { background: rgba(59,130,246,0.1); }
  :root[data-theme="dark"] .spec-text { color: #cbd5e1; }
  :root[data-theme="dark"] .spec-option:hover .spec-text { color: #fff; }
  :root[data-theme="dark"] .spec-icon { background: rgba(255,255,255,0.05); color: #94a3b8; }

  .add-filter-row { display: flex; justify-content: flex-start; margin-top: 0.75rem; }
  .add-filter-btn {
    display: flex; align-items: center; gap: 6px;
    background: transparent; border: none; color: #64748b; font-size: 0.8rem;
    font-weight: 700; cursor: pointer; padding: 0.4rem 0.6rem; border-radius: 8px;
    transition: all 0.2s;
  }
  .add-filter-btn:hover { color: #3b82f6; background: rgba(59,130,246,0.05); }

  :root[data-theme="dark"] .search-main-bar { background: #0f172a; border-color: rgba(255,255,255,0.08); }
  :root[data-theme="dark"] .bar-section:hover { background: rgba(255,255,255,0.03); }
  :root[data-theme="dark"] .bar-v-divider { background: rgba(255,255,255,0.1); }
  :root[data-theme="dark"] .country-pill-trigger { background: #1e293b; border-color: rgba(255,255,255,0.05); }
  :root[data-theme="dark"] .country-pill-trigger .country-name,
  :root[data-theme="dark"] .location-input-container input,
  :root[data-theme="dark"] .field-value { color: #f8fafc; }
  :root[data-theme="dark"] .price-popover, :root[data-theme="dark"] .specs-popover { background: #0f172a; border-color: rgba(255,255,255,0.1); }
  :root[data-theme="dark"] .search-btn-bottom {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  :root[data-theme="dark"] .search-btn-bottom:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  @media (max-width: 900px) {
    .search-main-bar { flex-direction: column; padding: 0.5rem; border-radius: 20px; }
    .bar-section { width: 100%; height: auto; padding: 0.75rem 1rem; }
    .bar-v-divider.hide-mobile { display: none; }
    .bar-location { flex-direction: column; align-items: flex-start; gap: 8px; }
    
    .search-btn-wrapper {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
      width: 90%; /* Wider on mobile */
      max-width: 350px;
    }
    
    .search-btn-bottom {
      padding: 0.6rem 2rem;
      font-size: 0.85rem;
    }
  }

  /* ========== ADVANCED FILTER TRIGGER (Original logic) ========== */
  .filter-panel { height: 0; opacity: 0; overflow: hidden; border-top: 1px solid rgba(0,0,0,0.06); margin-top: 0.5rem; }
  .filter-panel.open { height: auto; opacity: 1; }
  .filter-panel-inner { padding: 1rem 0; text-align: left; }
  
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 0.6rem; background: transparent; border: none;
    color: #1e293b; cursor: pointer; font-size: 0.85rem; font-weight: 600;
  }
  .section-title-group { display: flex; align-items: center; gap: 8px; }
  .section-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: rgba(59,130,246,0.06); color: #3b82f6; }
  .section-body { height: 0; overflow: hidden; padding: 0 0.6rem; opacity: 0; }
  .section-body.open { height: auto; opacity: 1; padding-bottom: 1rem; }
  .filter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .filter-group-inner.span-2 { grid-column: span 2; }
  .filter-label { display: block; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
  
  .chip-group { display: flex; flex-wrap: wrap; gap: 5px; }
  .chip {
    padding: 0.3rem 0.75rem; font-size: 0.75rem; font-weight: 500;
    border-radius: 999px; background: #f1f5f9; color: #64748b; cursor: pointer; border: none;
    transition: all 0.2s ease;
  }
  .chip.selected { background: #3b82f6; color: #fff; font-weight: 700; }
  
  .range-inputs { display: flex; align-items: center; gap: 6px; }
  .range-inputs input { flex: 1; padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); font-size: 0.75rem; outline: none; }

  .filter-actions { display: flex; justify-content: space-between; padding: 0.75rem 0; border-top: 1px solid rgba(0,0,0,0.05); }
  .btn-reset { border: none; background: transparent; color: #ef4444; font-weight: 700; font-size: 0.8rem; cursor: pointer; }
  .btn-apply { padding: 0.5rem 1.25rem; border-radius: 8px; border: none; background: #3b82f6; color: #fff; font-weight: 700; font-size: 0.8rem; cursor: pointer; }

  /* ========== DARK MODE ========== */
  :root[data-theme="dark"] .search-tabs, :root[data-theme="dark"] .search-card { background: #0a0f1d; border-color: rgba(255,255,255,0.08); }
  :root[data-theme="dark"] .search-input-row, :root[data-theme="dark"] .field-group { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); }
  :root[data-theme="dark"] .search-input-row input, :root[data-theme="dark"] .field-input, :root[data-theme="dark"] .field-value { color: #f8fafc; }
  :root[data-theme="dark"] .search-tab.active { background: rgba(59,130,246,0.1); }
  :root[data-theme="dark"] .chip { background: rgba(255,255,255,0.05); color: #94a3b8; }
  :root[data-theme="dark"] .range-inputs input { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.1); color: #fff; }
  :root[data-theme="dark"] .section-header { color: #f1f5f9; }

  /* ========== TABLET (max-width: 768px) ========== */
  @media (max-width: 768px) {
    .search-tool-wrapper-outer {
      max-width: 100%;
      padding: 0 16px;
    }

    /* --- Scrollable Tabs (≤768px) --- */
    .search-tabs-container {
      overflow: hidden;
      justify-content: flex-start;
    }
    .search-tabs {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 3px 4px;
      gap: 0;
      border-radius: 8px 8px 0 0;
      white-space: nowrap;
      display: flex;
      width: 100%;
      max-width: 100%;
      mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
    }
    .search-tabs::-webkit-scrollbar {
      display: none;
    }
    .search-tab {
      flex-shrink: 0;
    }

    .search-fields-row {
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .field-specs {
      grid-column: span 1;
    }

    .search-card {
      padding: 1rem 1rem 2rem;
      border-radius: 12px;
    }

    .filter-grid {
      gap: 0.6rem;
    }
  }

  /* ========== MOBILE (max-width: 480px) ========== */
  @media (max-width: 480px) {
    .search-tool-wrapper-outer {
      max-width: 100%;
      padding: 0 12px;
    }

    /* --- Scrollable Tabs --- */
    .search-tabs-container {
      margin-bottom: -1px;
      position: relative;
      overflow: hidden;
      justify-content: flex-start;
    }
    .search-tabs {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; /* Firefox */
      padding: 3px 4px;
      gap: 0;
      border-radius: 8px 8px 0 0;
      white-space: nowrap;
      display: flex;
      width: 100%;
      max-width: 100%;
      /* Fade edges to hint at scrollability */
      mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
    }
    .search-tabs::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }
    .search-tab {
      padding: 0.35rem 0.6rem;
      font-size: 0.68rem;
      gap: 3px;
      flex-shrink: 0;
    }
    .search-tab svg {
      width: 11px;
      height: 11px;
    }

    /* --- Card --- */
    .search-card {
      padding: 0.85rem 0.85rem 2rem;
      border-radius: 10px;
    }

    /* --- Sub Options --- */
    .search-sub-options {
      gap: 5px;
      margin-bottom: 0.7rem;
    }
    .sub-option {
      padding: 0.3rem 0.7rem;
      font-size: 0.7rem;
    }

    /* --- Search Input --- */
    .search-input-row {
      padding: 0.5rem 0.75rem;
      gap: 8px;
      margin-bottom: 0.55rem;
    }
    .search-input-row input {
      font-size: 0.8rem;
    }

    /* --- Fields Stack Vertically --- */
    .search-fields-row {
      grid-template-columns: 1fr;
      gap: 6px;
      margin-bottom: 0.7rem;
    }
    .field-specs {
      grid-column: span 1;
    }
    .field-group {
      padding: 0.45rem 0.7rem;
      min-height: 48px;
      gap: 6px;
    }
    .field-input {
      font-size: 0.78rem;
    }
    .field-value {
      font-size: 0.78rem;
    }
    .field-sub {
      font-size: 0.65rem;
    }

    /* --- Advanced Filters --- */
    .add-filter-btn {
      font-size: 0.76rem;
      gap: 4px;
    }

    /* --- Search Button --- */
    .search-btn-wrapper {
      width: 92%;
      max-width: 300px;
    }
    .search-btn-bottom {
      padding: 0.55rem 1.5rem;
      font-size: 0.8rem;
    }
    .search-btn-bottom svg {
      width: 16px;
      height: 16px;
    }

    /* --- Filter Panel --- */
    .filter-panel-inner {
      padding: 0.75rem 0;
    }
    .section-header {
      padding: 0.5rem 0.4rem;
      font-size: 0.8rem;
    }
    .section-icon {
      width: 24px;
      height: 24px;
    }
    .section-icon svg {
      width: 12px;
      height: 12px;
    }
    .filter-grid {
      grid-template-columns: 1fr;
      gap: 0.6rem;
    }
    .filter-group-inner.span-2 {
      grid-column: span 1;
    }
    .filter-label {
      font-size: 0.65rem;
      margin-bottom: 5px;
    }
    .chip {
      padding: 0.28rem 0.6rem;
      font-size: 0.7rem;
    }
    .range-inputs input {
      padding: 0.35rem;
      font-size: 0.7rem;
    }

    /* --- Filter Actions --- */
    .filter-actions {
      padding: 0.6rem 0;
    }
    .btn-reset {
      font-size: 0.75rem;
    }
    .btn-apply {
      padding: 0.45rem 1rem;
      font-size: 0.75rem;
    }
  }

  /* ========== VERY SMALL SCREENS (max-width: 360px) ========== */
  @media (max-width: 360px) {
    .search-tool-wrapper-outer {
      padding: 0 8px;
    }
    .search-tab {
      padding: 0.3rem 0.5rem;
      font-size: 0.62rem;
    }
    .search-tab svg {
      width: 10px;
      height: 10px;
    }
    .search-card {
      padding: 0.7rem 0.7rem 2rem; /* Keep bottom padding for button */
    }
    .search-btn-wrapper {
      width: 85%;
      max-width: 280px;
    }
    .search-btn-bottom {
      font-size: 0.75rem;
      padding: 0.5rem 1.25rem;
    }
    .search-btn-bottom svg {
      width: 14px;
      height: 14px;
    }
  }

  /* ========== NEW AUTOCOMPLETE & POPOVER STYLES ========== */
  .autocomplete-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-surface, #fff);
    border: 1px solid var(--search-border, rgba(0,0,0,0.08));
    border-radius: 0 0 8px 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
    display: none;
    padding: 0.5rem 0;
  }
  .autocomplete-dropdown.show { display: block; }
  
  .ac-category {
    padding: 0.4rem 1rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #94a3b8;
    background: #f8fafc;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .ac-item {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    color: #334155;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    justify-content: space-between;
  }
  .ac-item:hover { background: #eff6ff; color: #3b82f6; }
  .ac-item .item-sub { font-size: 0.75rem; color: #94a3b8; }

  /* Price Popover */
  .field-price-range { position: relative; }
  .price-popover {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 280px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    padding: 1rem;
    z-index: 100;
    display: none;
    cursor: default;
  }
  .price-popover.show { display: block; animation: fadeIn 0.15s ease-out; }
  
  .price-popover-inputs { display: flex; align-items: center; gap: 8px; margin-bottom: 1rem; }
  .price-input-group { flex: 1; }
  .price-input-group label { display: block; font-size: 0.7rem; color: #64748b; margin-bottom: 4px; }
  .price-input-group input { 
    width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; 
    font-size: 0.85rem; outline: none; transition: border-color 0.2s;
  }
  .price-input-group input:focus { border-color: #3b82f6; }
  .price-sep { color: #cbd5e1; font-weight: bold; padding-top: 14px;}
  
  .price-presets { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .preset-btn {
    padding: 0.4rem;
    background: #f1f5f9;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
  }
  .preset-btn:hover { background: #e2e8f0; color: #1e293b; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

  /* Dark Mode for new elements */
  :root[data-theme="dark"] .autocomplete-dropdown { background: #1e293b; border-color: rgba(255,255,255,0.1); }
  :root[data-theme="dark"] .ac-category { background: #0f172a; color: #64748b; }
  :root[data-theme="dark"] .ac-item { color: #f1f5f9; }
  :root[data-theme="dark"] .ac-item:hover { background: rgba(59,130,246,0.1); }
  :root[data-theme="dark"] .price-popover { background: #1e293b; border-color: rgba(255,255,255,0.1); }
  :root[data-theme="dark"] .price-input-group input { background: #0f172a; border-color: rgba(255,255,255,0.1); color: #fff; }
  :root[data-theme="dark"] .preset-btn { background: #334155; color: #cbd5e1; }
  :root[data-theme="dark"] .preset-btn:hover { background: #475569; color: #fff; }

  .continent-btn {
    cursor: pointer !important;
    user-select: none !important;
  }
  .country-card-premium {
    cursor: pointer !important;
    user-select: none !important;
  }
  .country-card-premium * {
    cursor: pointer !important;
  }
` }} />
    </>
  );
}
