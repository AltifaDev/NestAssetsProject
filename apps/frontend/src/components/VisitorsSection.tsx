import { useTranslations } from "next-intl";

export default function VisitorsSection() {
    const t = useTranslations("portfolio");
    return (
        <section id="portfolio" className="py-20 md:py-40 relative z-20">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center">
                    <div className="gsap-reveal">
                        <h2 className="text-4xl lg:text-[3.5rem] mb-8 text-[var(--text-primary)] leading-[1.1] font-bold" dangerouslySetInnerHTML={{ __html: t.raw("title").replace("Investment", "<br /> Investment") }}>
                        </h2>
                        <p className="text-[1.15rem] text-[var(--text-secondary)] mb-12 leading-[1.6]">
                            {t("description")}
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none p-0 text-[var(--text-primary)]">
                            <li className="flex items-center gap-3 font-semibold text-[1.05rem]">
                                <span className="text-yellow-400">✓</span> {t("hospitality")}
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-[1.05rem]">
                                <span className="text-yellow-400">✓</span> {t("commercial")}
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-[1.05rem]">
                                <span className="text-yellow-400">✓</span> {t("retail")}
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-[1.05rem]">
                                <span className="text-yellow-400">✓</span> {t("digital")}
                            </li>
                        </ul>
                    </div>
                    <div className="gsap-reveal relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[32px] p-8 lg:p-12">
                        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-[20px] p-8">
                            <div className="mb-8">
                                <h4 className="text-[1.1rem] text-[var(--text-secondary)] font-medium">{t("portfolioGrowth")}</h4>
                            </div>
                            <div className="w-full">
                                <svg viewBox="0 0 400 200" className="w-full h-auto">
                                    <path
                                        d="M0 150 Q 50 130 100 140 T 200 80 T 300 110 T 400 50"
                                        fill="none"
                                        stroke="#3B82F6"
                                        strokeWidth="4"
                                    ></path>
                                    <path
                                        d="M0 150 Q 50 130 100 140 T 200 80 T 300 110 T 400 50 V 200 H 0 Z"
                                        fill="url(#grad1)"
                                        opacity="0.1"
                                    ></path>
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: "#3B82F6", stopOpacity: 1 }}></stop>
                                            <stop offset="100%" style={{ stopColor: "#3B82F6", stopOpacity: 0 }}></stop>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                        <div className="static lg:absolute lg:-bottom-[30px] lg:-left-[40px] bg-[var(--bg-card)] border border-[var(--card-border)] rounded-[20px] px-8 py-6 w-full lg:w-[200px] shadow-[var(--shadow-card)] mt-8 lg:mt-0">
                            <div className="text-[0.85rem] text-[var(--text-secondary)] mb-2">{t("revenueGrowth")}</div>
                            <div className="text-[1.75rem] font-bold text-[var(--text-primary)]">$12.5k</div>
                            <div className="text-[#10b981] text-[0.85rem] mt-1">+12.5%</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
