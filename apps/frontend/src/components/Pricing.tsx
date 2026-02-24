import { useTranslations } from 'next-intl';

export default function Pricing() {
    const t = useTranslations('pricing');

    const plans = [
        {
            name: t("categories.starter"),
            price: "$0",
            description: "Gain invaluable predictive analytics actionable insights empowering.",
            features: [
                t("features.projects", { count: 3 }),
                t("features.basicAnalytics"),
                t("features.communitySupport"),
                t("features.storage", { size: "1gb" })
            ],
            highlight: false,
            cta: t("cta.free"),
        },
        {
            name: t("categories.pro"),
            price: "$49",
            description: "Priority support and advanced features for growing teams.",
            features: [
                t("features.unlimitedProjects"),
                t("features.advancedAnalytics"),
                t("features.prioritySupport"),
                t("features.storage", { size: "10gb" })
            ],
            highlight: true,
            cta: t("cta.started"),
        },
        {
            name: t("categories.enterprise"),
            price: t("custom"),
            description: "Custom solutions for large scale organizations and enterprises.",
            features: [
                t("features.customIntegration"),
                t("features.dedicatedAccount"),
                t("features.sla"),
                t("features.unlimitedStorage")
            ],
            highlight: false,
            cta: t("cta.sales"),
        },
    ];

    return (
        <section id="pricing" className="py-[180px] border-t border-[var(--card-border)] relative z-30">
            <div className="container mx-auto px-4">
                <div className="text-center gsap-reveal">
                    <h2 className="text-4xl lg:text-[3.5rem] mb-6 text-[var(--text-primary)] font-bold">
                        {t.rich("title", {
                            span: (chunks) => <span className="text-gradient">{chunks}</span>
                        })}
                    </h2>
                    <p className="text-[1.1rem] text-[var(--text-secondary)] mb-16">
                        {t("subtitle")}
                    </p>

                    <div className="flex items-center justify-center gap-6 font-semibold mb-20">
                        <span className="text-[var(--text-primary)]">{t("monthly")}</span>
                        <div className="w-[60px] h-[32px] bg-[var(--bg-glass)] border border-[var(--border-medium)] rounded-full relative cursor-pointer">
                            <div className="absolute top-[3px] left-[4px] w-[24px] h-[24px] bg-[var(--text-main)] rounded-full transition-transform"></div>
                        </div>
                        <span className="text-[var(--text-dim)]">{t("yearly")}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[450px] lg:max-w-none mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`gsap-reveal bg-[var(--bg-card)] border border-[var(--card-border)] rounded-[40px] p-12 flex flex-col relative transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${plan.highlight
                                ? "bg-[var(--bg-surface)] border-[var(--border-medium)] scale-100 lg:scale-105 z-10 shadow-[var(--shadow-card)]"
                                : ""
                                }`}
                            style={{ transitionDelay: `${index * 0.1}s` }}
                        >
                            {plan.highlight && (
                                <div className="absolute top-[30px] right-[40px] bg-blue-500 text-white px-4 py-1.5 rounded-full text-[0.8rem] font-bold">
                                    {t("mostPopular")}
                                </div>
                            )}
                            <div className="mb-auto">
                                <h3 className="text-2xl mb-6 text-[var(--text-primary)] font-bold">{plan.name}</h3>
                                <p className="text-[var(--text-secondary)] text-base mb-12 leading-[1.5]">
                                    {plan.description}
                                </p>
                                <div className="mb-12">
                                    <span className="text-6xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                                    {plan.price !== t("custom") && <span className="text-[var(--text-secondary)] text-[1.1rem]">{t("mo")}</span>}
                                </div>
                            </div>

                            <ul className="list-none mb-16 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-4 mb-5 text-[var(--text-primary)] font-medium">
                                        <span className="text-yellow-400 font-bold">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div>
                                <a
                                    href="#"
                                    className={`btn ${plan.highlight ? "btn-primary" : "btn-outline"} w-full justify-between px-8 py-5 text-lg rounded-full flex items-center`}
                                >
                                    {plan.cta}
                                    <span>→</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
