import { useTranslations } from 'next-intl';

export default function FeatureGridDetailed() {
    const t = useTranslations('whyChooseUs');

    const features = [
        {
            title: t("expertise.title"),
            desc: t("expertise.desc"),
        },
        {
            title: t("trackRecord.title"),
            desc: t("trackRecord.desc"),
        },
        {
            title: t("solutions.title"),
            desc: t("solutions.desc"),
        },
        {
            title: t("efficiency.title"),
            desc: t("efficiency.desc"),
        },
        {
            title: t("growth.title"),
            desc: t("growth.desc"),
        },
        {
            title: t("risk.title"),
            desc: t("risk.desc"),
        },
    ];

    return (
        <section className="py-[100px]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20 gsap-reveal">
                    <h2 className="text-4xl lg:text-[3.5rem] font-bold text-[var(--text-primary)]">{t("title")}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="gsap-reveal bg-[var(--bg-card)] border border-[var(--card-border)] rounded-[24px] p-12 transition-all duration-300 ease-in-out hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-[5px] hover:bg-[var(--bg-surface)]"
                            style={{ transitionDelay: `${i * 0.05}s` }}
                        >
                            <div className="w-[60px] h-[60px] bg-[var(--card-bg-alpha)] rounded-2xl flex items-center justify-center text-2xl mb-8">
                                ✳️
                            </div>
                            <h3 className="text-2xl font-bold mb-5 text-[var(--text-primary)]">{f.title}</h3>
                            <p className="text-[1.05rem] text-[var(--text-secondary)] leading-[1.6]">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
