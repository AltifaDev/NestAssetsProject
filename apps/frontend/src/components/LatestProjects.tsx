import React from 'react';
import { useTranslations } from "next-intl";

const projects = [
    {
        title: "Boutique Resort Koh Samui",
        location: "Koh Samui, Surat Thani",
        priceValue: "45.0",
        image: "/managed_hotel.png",
        typeKey: "hospitality"
    },
    {
        title: "Premier Wellness Center",
        location: "Sukhumvit, Bangkok",
        priceValue: "12.5",
        image: "/luxury_spa.png",
        typeKey: "wellness"
    },
    {
        title: "Sathorn Business Hub",
        location: "Sathorn, Bangkok",
        priceValue: "88.0",
        image: "/project_condo_1_1771746340513.png",
        typeKey: "commercial"
    },
    {
        title: "Luxury Retail Cluster",
        location: "Pathum Wan, Bangkok",
        priceValue: "32.0",
        image: "/project_house_2_1771746357895.png",
        typeKey: "retail"
    }
];

const LatestProjects = () => {
    const t = useTranslations("latestProjects");
    return (
        <section id="portfolio" className="py-20 md:py-32 relative z-30">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 gsap-reveal">
                    <div className="max-w-4xl">
                        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[var(--text-primary)] mb-8 leading-tight" dangerouslySetInnerHTML={{ __html: t.raw("title") }}>
                        </h2>
                        <p className="text-[var(--text-dim)] text-base sm:text-lg leading-relaxed">
                            {t("description")}
                        </p>
                    </div>
                    <a href="#" className="hidden md:flex items-center gap-3 text-red-600 font-bold hover:gap-5 transition-all uppercase tracking-widest text-sm border-b-2 border-red-600/10 pb-1 hover:border-red-600">
                        {t("viewAll")} <span>→</span>
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 gsap-stagger-group">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className="group bg-[var(--bg-card)] rounded-none overflow-hidden border border-[var(--card-border)] hover:border-red-600/30 transition-all duration-700 hover:shadow-3xl hover:shadow-red-600/5 flex flex-col h-full gsap-stagger-item"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute top-10 left-10 bg-red-600 text-white text-[10px] font-black h-[42px] px-8 rounded-none uppercase tracking-[0.2em] shadow-xl shadow-red-600/40 flex items-center justify-center leading-none">
                                    {t("newProject")}
                                </div>
                                <div className="absolute bottom-10 right-10 bg-black/80 backdrop-blur-2xl text-white text-[10px] uppercase font-black h-[42px] px-8 rounded-none border border-white/10 tracking-[0.2em] flex items-center justify-center leading-none">
                                    {t(`types.${project.typeKey}` as any)}
                                </div>
                            </div>

                            <div
                                className="flex flex-col flex-grow"
                                style={{ padding: '40px 50px 50px 50px' }}
                            >
                                <h3 className="font-bold text-[var(--text-primary)] text-xl sm:text-2xl mb-10 line-clamp-1 group-hover:text-red-600 transition-colors tracking-tight leading-tight">
                                    {project.title}
                                </h3>
                                <p className="text-[var(--text-dim)] text-[12px] sm:text-sm mb-14 flex items-center gap-4 opacity-80 uppercase tracking-widest font-semibold">
                                    <svg className="w-5 h-5 text-red-600/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {project.location}
                                </p>
                                <div className="mt-auto pt-12 border-t border-[var(--card-border)] flex justify-between items-center gap-10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-[var(--text-dim)] uppercase font-black tracking-widest mb-4 opacity-50">{t("startingPriceLabel")}</span>
                                        <span className="text-red-600 font-black text-2xl sm:text-3xl whitespace-nowrap leading-none">
                                            {t("priceValue", { value: project.priceValue })}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 w-16 h-16 rounded-none bg-[var(--bg-main)] border border-[var(--card-border)] flex items-center justify-center group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all duration-700 transform group-hover:rotate-[360deg] shadow-xl">
                                        <span className="text-3xl">→</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-14 md:hidden text-center">
                    <a href="#" className="inline-block text-red-600 font-bold border-b-2 border-red-600 pb-2 tracking-widest text-sm uppercase">{t("visitPortal")}</a>
                </div>
            </div>
        </section>
    );
};

export default LatestProjects;
