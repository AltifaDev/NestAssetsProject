import { useTranslations } from "next-intl";

export default function FeatureGrid() {
    const t = useTranslations("features");
    return (
        <section id="services" className="py-20 md:py-40 relative">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="gsap-reveal">
                        <h2 className="text-4xl lg:text-[4rem] mb-8 leading-[1.1] text-[var(--text-primary)] font-bold" dangerouslySetInnerHTML={{ __html: t.raw("title").replace("Business Solutions", "<br /> Business Solutions") }}>
                        </h2>
                        <p className="text-[1.2rem] text-[var(--text-secondary)] mb-12 leading-[1.6]">
                            {t("description")}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16 gsap-stagger-group">
                            <div className="flex items-center gap-4 text-[1.1rem] font-semibold text-[var(--text-primary)] gsap-stagger-item">
                                <span className="text-yellow-400 text-[1.2rem]">✓</span>
                                <span>{t("equity")}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[1.1rem] font-semibold text-[var(--text-primary)] gsap-stagger-item">
                                <span className="text-yellow-400 text-[1.2rem]">✓</span>
                                <span>{t("hospitality")}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[1.1rem] font-semibold text-[var(--text-primary)] gsap-stagger-item">
                                <span className="text-yellow-400 text-[1.2rem]">✓</span>
                                <span>{t("massage")}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[1.1rem] font-semibold text-[var(--text-primary)] gsap-stagger-item">
                                <span className="text-yellow-400 text-[1.2rem]">✓</span>
                                <span>{t("realEstate")}</span>
                            </div>
                        </div>

                        <a href="#" className="btn btn-primary px-10 py-4 text-[1.1rem] rounded-full inline-flex items-center gap-2 gsap-reveal">
                            {t("getStarted")}
                            <span className="text-xl leading-none">→</span>
                        </a>
                    </div>

                    <div className="visual-side gsap-reveal relative bg-[var(--bg-surface)] rounded-[40px] p-8 lg:p-16 border border-[var(--card-border)]">
                        <div className="bg-[var(--bg-surface)] border border-[var(--card-border)] rounded-[20px] p-8 w-full gsap-stagger-group">
                            <div className="mb-10 gsap-stagger-item">
                                <h4 className="text-[1.2rem] text-[var(--text-primary)] font-bold">{t("salesOvertime")}</h4>
                            </div>
                            <div className="flex items-end gap-6 h-[200px] mb-6">
                                <div className="flex-1 bg-[var(--border-subtle)] rounded relative gsap-stagger-item" style={{ height: "40%" }}></div>
                                <div className="flex-1 bg-[var(--border-subtle)] rounded relative gsap-stagger-item" style={{ height: "60%" }}></div>
                                <div className="flex-1 bg-[var(--border-subtle)] rounded relative gsap-stagger-item" style={{ height: "50%" }}></div>
                                <div
                                    className="flex-1 rounded relative bg-gradient-to-b from-yellow-400 to-rose-600 gsap-stagger-item"
                                    style={{ height: "90%" }}
                                >
                                    <div className="absolute -top-[45px] left-1/2 -translate-x-1/2 bg-[var(--bg-card)] px-3 py-1.5 rounded-lg text-[0.75rem] whitespace-nowrap border border-[var(--card-border)] text-[var(--text-primary)]">
                                        {t("salesCount", { count: 412 })}
                                    </div>
                                </div>
                                <div className="flex-1 bg-[var(--border-subtle)] rounded relative" style={{ height: "55%" }}></div>
                                <div className="flex-1 bg-[var(--border-subtle)] rounded relative" style={{ height: "70%" }}></div>
                                <div className="flex-1 bg-[var(--border-subtle)] rounded relative" style={{ height: "45%" }}></div>
                            </div>
                            <div className="flex justify-between text-[var(--text-secondary)] text-[0.8rem]">
                                <span>{t("days.jan1")}</span><span>{t("days.jan2")}</span><span>{t("days.jan3")}</span><span>{t("days.jan4")}</span>
                                <span>{t("days.jan5")}</span><span>{t("days.jan6")}</span><span>{t("days.jan7")}</span>
                            </div>
                        </div>

                        <div className="static lg:absolute lg:-bottom-[20px] lg:-right-[40px] bg-[var(--bg-card)] border border-[var(--card-border)] rounded-[20px] p-8 w-full lg:w-[280px] shadow-[0_10px_30px_var(--shadow-card)] mt-8 lg:mt-0">
                            <div className="text-[1rem] mb-6 text-[var(--text-secondary)]">{t("monthlySales")}</div>
                            <div className="flex gap-8">
                                <div>
                                    <span className="text-[0.75rem] text-[var(--text-secondary)]">{t("totalProduct")}</span>
                                    <strong className="block text-[1.4rem] text-[var(--text-primary)] mt-2">25.4k</strong>
                                </div>
                                <div>
                                    <span className="text-[0.75rem] text-[var(--text-secondary)]">{t("revenue")}</span>
                                    <strong className="block text-[1.4rem] text-[var(--text-primary)] mt-2">$6,35,240</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
