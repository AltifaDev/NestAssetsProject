import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations("footer");
    return (
        <footer className="bg-[#111] text-white pt-[100px] pb-[60px] border-t border-white/5">
            {/* Top Bar: Apps & Socials */}
            <div className="container pb-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <span className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">{t("experience")}</span>
                    <div className="flex gap-6">
                        <a href="#" className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] px-6 py-3 rounded-2xl border border-white/10 transition-all hover:-translate-y-1">
                            <span className="text-2xl">🤖</span>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-white/40 uppercase font-bold mb-1">{t("getItOn")}</span>
                                <span className="text-sm font-black tracking-tight">Google Play</span>
                            </div>
                        </a>
                        <a href="#" className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] px-6 py-3 rounded-2xl border border-white/10 transition-all hover:-translate-y-1">
                            <span className="text-2xl">🍎</span>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-white/40 uppercase font-bold mb-1">{t("downloadOn")}</span>
                                <span className="text-sm font-black tracking-tight">App Store</span>
                            </div>
                        </a>
                    </div>
                </div>
                <div className="flex items-center gap-10">
                    <span className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">{t("connect")}</span>
                    <div className="flex gap-6 text-white/50">
                        <a href="#" className="hover:text-red-600 transition-all hover:scale-125">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <a href="#" className="hover:text-red-600 transition-all hover:scale-125">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zM18.406 3.506a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg>
                        </a>
                        <a href="#" className="hover:text-red-600 transition-all hover:scale-125">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        </a>
                        <a href="#" className="hover:text-red-600 transition-all hover:scale-125">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Links */}
            <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 text-3xl font-black mb-10">
                        <span className="text-white">✳️</span>
                        <span className="tracking-tighter">NEST OF ASSETS</span>
                    </div>
                    <p className="text-white/50 leading-relaxed text-lg max-w-[400px] mb-10">
                        {t("missionText")}
                    </p>
                    <a href="#" className="inline-flex items-center gap-2 text-red-600 font-black hover:gap-4 transition-all uppercase tracking-widest text-sm">
                        {t("aboutMission")} <span>→</span>
                    </a>
                </div>

                <div>
                    <h4 className="font-black mb-10 text-white uppercase tracking-[0.15em] text-xs">{t("saleTitle")}</h4>
                    <ul className="space-y-6 text-white/40 font-medium">
                        <li><a href="#" className="hover:text-red-600 transition-colors">{t("links.luxuryCondos")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.residentialHouses")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.townhomes")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.investmentLand")}</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black mb-10 text-white uppercase tracking-[0.15em] text-xs">{t("rentTitle")}</h4>
                    <ul className="space-y-6 text-white/40 font-medium">
                        <li><a href="#" className="hover:text-red-600 transition-colors">{t("links.monthlyRentals")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.servicedApartments")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.commercialSpace")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.vacationHomes")}</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black mb-10 text-white uppercase tracking-[0.15em] text-xs">{t("newTitle")}</h4>
                    <ul className="space-y-6 text-white/40 font-medium">
                        <li><a href="#" className="hover:text-red-600 transition-colors">{t("links.offPlanProjects")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.projectReviews")}</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">{t("links.investmentInsights")}</a></li>
                    </ul>
                    <Link href="/agent/login" className="inline-block mt-12 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest border border-white/10 px-6 py-3 rounded-xl transition-all">
                        {t("agentPortal")}
                    </Link>
                </div>
            </div>

            {/* Partner Logos */}
            <div className="container py-16 border-y border-white/5 mb-16">
                <div className="flex flex-wrap items-center justify-between gap-12 opacity-20 grayscale hover:opacity-50 transition-all duration-1000">
                    <span className="text-2xl font-black tracking-tightest">ThinkOfLiving</span>
                    <span className="text-2xl font-black tracking-tighter">PropertyGuru</span>
                    <span className="text-2xl font-black tracking-tight">Asia Real Estate</span>
                    <span className="text-2xl font-black tracking-tighter">PROPERTY REPORT</span>
                    <span className="text-2xl font-black tracking-widest">iProperty</span>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="container flex flex-col md:flex-row justify-between items-center text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold gap-8">
                <p>&copy; 2026 {t("copyright")}</p>
                <div className="flex gap-10">
                    <a href="#" className="hover:text-white transition-colors">{t("privacy")}</a>
                    <a href="#" className="hover:text-white transition-colors">{t("terms")}</a>
                    <a href="#" className="hover:text-white transition-colors">{t("cookies")}</a>
                </div>
            </div>
        </footer>
    );
}
