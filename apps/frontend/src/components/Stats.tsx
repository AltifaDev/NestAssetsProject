import { useTranslations } from "next-intl";

export default function Stats() {
    const t = useTranslations("stats");

    const stats = [
        { label: t("totalAssets"), value: "$10M+", icon: "⚡" },
        { label: t("managedBusinesses"), value: "50+", icon: "🏢" },
        { label: t("happyInvestors"), value: "200+", icon: "👤" },
        { label: t("yearlyGrowth"), value: "15%", icon: "📊" },
    ];
    return (
        <>
            <section className="py-[60px] pb-[100px]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-[120px]">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="gsap-reveal bg-[var(--bg-card)] border border-[var(--card-border)] p-10 px-8 rounded-[24px] flex flex-col gap-6 transition-all duration-300 ease-in-out hover:border-[var(--border-medium)] hover:-translate-y-[5px] hover:bg-[var(--bg-surface)]"
                                style={{ transitionDelay: `${index * 0.1}s` }}
                            >
                                <div className="w-12 h-12 bg-[var(--card-bg-alpha)] rounded-xl flex items-center justify-center text-xl">
                                    {stat.icon}
                                </div>
                                <div>
                                    <span className="text-base text-[var(--text-secondary)] block mb-2">{stat.label}</span>
                                    <h3 className="text-[2.2rem] font-bold text-[var(--text-primary)]">{stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center gsap-reveal">
                        <p className="text-[1.1rem] text-[var(--text-secondary)] mb-12">
                            {t("trustedBy")}
                        </p>
                        <div className="flex justify-start items-center gap-[6rem] opacity-50 grayscale overflow-hidden whitespace-nowrap w-full relative py-5">
                            <div className="flex gap-[6rem] min-w-full animate-marquee">
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("hospitality")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("realEstate")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("retail")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("investment")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("development")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("management")}</div>
                                {/* Repeating for seamless loop */}
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("hospitality")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("realEstate")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("retail")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("investment")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("development")}</div>
                                <div className="text-[1.8rem] font-extrabold tracking-[-0.05em] shrink-0">{t("management")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
        </>
    );
}
