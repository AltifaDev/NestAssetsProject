import React from 'react';
import { useTranslations } from "next-intl";

const locations = [
    "bangkok", "nonthaburi", "pathumThani", "chiangMai",
    "chiangRai", "chonburi", "huaHin", "phuket",
    "rayong", "suratThani", "nakhonRatchasima", "khonKaen",
    "pattaya", "kohSamui", "pakChong", "phangNga"
];

const PopularLocations = () => {
    const t = useTranslations("popularLocations");

    const highlights = [
        {
            icon: (
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            title: t("listingsTitle"),
            desc: t("listingsDesc")
        },
        {
            icon: (
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            title: t("condoTitle"),
            desc: t("condoDesc")
        },
        {
            icon: (
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
            title: t("reviewsTitle"),
            desc: t("reviewsDesc")
        },
        {
            icon: (
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            title: t("tipsTitle"),
            desc: t("tipsDesc")
        }
    ];

    return (
        <section className="py-20 md:py-32 bg-[var(--bg-main)]">
            <div className="container">

                {/* Locations Grid */}
                <div className="mb-24 md:mb-40">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)]" dangerouslySetInnerHTML={{ __html: t.raw("title") }}>
                        </h2>
                        <a href="#" className="flex items-center gap-3 text-red-600 font-bold border-b-2 border-red-600/10 hover:border-red-600 transition-all text-sm uppercase tracking-widest pb-1">
                            {t("searchByProvince")} <span className="text-lg">→</span>
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12 py-16 border-y border-[var(--card-border)]">
                        {locations.map((loc, index) => (
                            <a
                                key={index}
                                href="#"
                                className="text-[var(--text-dim)] hover:text-red-600 transition-all text-lg font-medium flex items-center gap-3 group"
                            >
                                <span className="w-1.5 h-1.5 bg-red-600/30 rounded-full group-hover:bg-red-600 group-hover:scale-150 transition-all"></span>
                                {t(`cities.${loc}` as any)}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Highlights Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                    {highlights.map((item, index) => (
                        <div key={index} className="text-center group px-4">
                            <div className="mb-10 flex justify-center transform transition-transform duration-700 group-hover:scale-125 group-hover:-translate-y-2">
                                <div className="p-6 rounded-[32px] bg-red-600/5 border border-red-600/10 shadow-inner">
                                    {item.icon}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 group-hover:text-red-600 transition-colors">{item.title}</h3>
                            <p className="text-[var(--text-dim)] text-base leading-relaxed max-w-[280px] mx-auto opacity-80">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default PopularLocations;
