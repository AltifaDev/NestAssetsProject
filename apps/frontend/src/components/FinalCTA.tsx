"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import ContactModal from "./ContactModal";

export default function FinalCTA() {
    const t = useTranslations("finalCTA");
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    return (
        <section id="contact" className="py-[100px]">
            <div className="container mx-auto px-4">
                <div className="gsap-reveal bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--card-border)] rounded-[48px] p-8 md:p-24 text-center shadow-[0_40px_100px_var(--shadow-color)]">
                    <h2 className="text-4xl md:text-6xl mb-6 text-[var(--text-primary)] font-bold">{t("title")}</h2>
                    <p className="text-xl text-[var(--text-secondary)] max-w-[700px] mx-auto mb-14">
                        {t("description")}
                    </p>

                    <div>
                        <button
                            onClick={() => setIsContactModalOpen(true)}
                            className="btn btn-primary px-12 py-5 text-lg rounded-full inline-block cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        >
                            {t("contactButton")}
                        </button>
                    </div>
                </div>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </section>
    );
}
