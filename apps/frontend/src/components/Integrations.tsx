import { useTranslations } from 'next-intl';

export default function Integrations() {
    const t = useTranslations('opportunities');

    return (
        <section id="investment" className="py-[100px]">
            <div className="container mx-auto px-4">
                <div className="gsap-reveal relative bg-[var(--bg-surface)] border border-[var(--card-border)] rounded-[48px] p-8 md:p-24 text-center overflow-hidden shadow-[0_40px_100px_var(--shadow-color)]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] z-0 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)" }}></div>

                    <h2 className="relative z-10 text-4xl md:text-6xl mb-6 text-[var(--text-primary)] font-bold">
                        {t.rich("title", {
                            br: () => <br />
                        })}
                    </h2>
                    <p className="relative z-10 text-xl text-[var(--text-secondary)] max-w-[600px] mx-auto mb-12">
                        {t("description")}
                    </p>

                    <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-6 mb-10 w-full sm:w-auto max-w-[300px] sm:max-w-none mx-auto">
                        <a href="#" className="btn btn-primary px-10 py-4 text-lg rounded-full">{t("viewAll")}</a>
                        <a href="#" className="btn btn-outline px-10 py-4 text-lg rounded-full">{t("contact")}</a>
                    </div>

                    <div className="relative z-10 text-base text-[var(--text-secondary)] flex items-center justify-center gap-4">
                        <span>{t("verified")}</span>
                        <span className="text-[var(--text-secondary)]">•</span>
                        <span>{t("dueDiligence")}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
