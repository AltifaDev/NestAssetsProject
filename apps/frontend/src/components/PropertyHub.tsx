import React from 'react';
import { useTranslations } from "next-intl";

const PropertyHub = () => {
    const t = useTranslations("propHub");
    return (
        <section className="py-20 md:py-32 relative z-30">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">

                    {/* Left Column: Two Vertical Cards */}
                    <div className="lg:col-span-4 flex flex-col gap-10">
                        <div className="space-y-4 px-2">
                            <h2 className="text-4xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
                                {t("titleLeft")}<br />
                                <span className="text-gradient">{t("titleLeftSub")}</span>
                            </h2>
                            <p className="text-[var(--text-dim)] text-lg">{t("descLeft")}</p>
                        </div>

                        {/* Guide Card */}
                        <div className="relative group overflow-hidden rounded-[40px] bg-[var(--bg-card)] border border-[var(--card-border)] aspect-[4/3] lg:h-[350px] shadow-xl">
                            <img
                                src="/modern_living_guide_1771746245928.png"
                                alt={t("guideBadge")}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                            <div className="absolute top-8 left-8 flex flex-col gap-2">
                                <span className="bg-red-600/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-black w-fit shadow-lg shadow-red-600/30">
                                    {t("guideBadge")}
                                </span>
                            </div>
                            <div className="relative h-full p-8 sm:p-12 flex flex-col justify-end">
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-tight">{t("guideTitle")}</h3>
                                <button className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-8 py-3.5 rounded-2xl font-bold hover:bg-white hover:text-black transition-all w-fit text-sm sm:text-base">
                                    {t("explore")}
                                </button>
                            </div>
                        </div>

                        {/* Agent Card */}
                        <div className="relative group overflow-hidden rounded-[40px] bg-[var(--bg-card)] border border-[var(--card-border)] aspect-[4/3] lg:h-[350px] shadow-xl">
                            <img
                                src="/real_estate_agent_professional_1771746262503.png"
                                alt={t("agentBadge")}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                            <div className="absolute top-8 left-8 flex flex-col gap-2">
                                <span className="bg-red-600/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-black w-fit shadow-lg shadow-red-600/30">
                                    {t("agentBadge")}
                                </span>
                            </div>
                            <div className="relative h-full p-8 sm:p-12 flex flex-col justify-end">
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-tight">{t("agentTitle")}</h3>
                                <button className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-8 py-3.5 rounded-2xl font-bold hover:bg-white hover:text-black transition-all w-fit text-sm sm:text-base">
                                    {t("findAgent")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Hero Banner */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        <div className="space-y-4 px-2">
                            <h2 className="text-4xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
                                {t("titleRight")} <span className="text-gradient">{t("homeJourney")}</span>
                            </h2>
                            <p className="text-[var(--text-dim)] text-lg">{t("descRight")}</p>
                        </div>

                        <div className="relative group flex-grow overflow-hidden rounded-[56px] bg-[var(--bg-card)] border border-[var(--card-border)] min-h-[500px] lg:min-h-0 lg:h-full flex items-center shadow-2xl">
                            <img
                                src="/new_homes_banner_v2_1771746321356.png"
                                alt={t("viewNewProjects")}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 lg:bg-transparent lg:bg-gradient-to-r lg:from-black/80 lg:via-black/20 lg:to-transparent"></div>

                            <div className="relative z-10 p-8 sm:p-16 max-w-xl">
                                <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-10 lg:p-14 rounded-[40px] shadow-2xl">
                                    <div className="inline-block bg-red-600 !text-white px-6 py-2.5 rounded-full text-[11px] uppercase font-black tracking-[0.2em] mb-8 shadow-lg shadow-red-600/30">
                                        {t("featuredBadge")}
                                    </div>
                                    <h4 className="!text-white text-3xl sm:text-4xl lg:text-5xl font-black mb-10 leading-[1.2] tracking-tight">
                                        {t("dreamHomeTitle")}
                                    </h4>
                                    <button className="bg-white text-black px-10 sm:px-12 py-4 sm:py-5 rounded-[24px] font-black text-base sm:text-lg hover:bg-red-600 !hover:text-white hover:scale-105 transition-all shadow-xl">
                                        {t("viewNewProjects")}
                                    </button>
                                </div>
                            </div>

                            {/* Top Floating Badge */}
                            <div className="absolute top-10 right-10 hidden lg:block bg-white/95 backdrop-blur-md px-8 py-3.5 rounded-full border border-white/50 shadow-2xl">
                                <span className="text-red-600 font-extrabold text-sm tracking-[0.2em] italic">{t("newmarketPreview")}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default PropertyHub;
