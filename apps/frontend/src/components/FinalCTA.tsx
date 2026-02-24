import { useTranslations } from "next-intl";

export default function FinalCTA() {
    const t = useTranslations("finalCTA");
    return (
        <section id="contact" className="py-[100px]">
            <div className="container mx-auto px-4">
                <div className="gsap-reveal bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--card-border)] rounded-[48px] p-8 md:p-24 text-center shadow-[0_40px_100px_var(--shadow-color)]">
                    <h2 className="text-4xl md:text-6xl mb-6 text-[var(--text-primary)] font-bold">{t("title")}</h2>
                    <p className="text-xl text-[var(--text-secondary)] max-w-[700px] mx-auto mb-14">
                        {t("description")}
                    </p>

                    <div>
                        <a href="#" className="btn btn-primary px-12 py-5 text-lg rounded-full inline-block">{t("contactButton")}</a>
                    </div>
                </div>
            </div>
        </section>
    );
}
