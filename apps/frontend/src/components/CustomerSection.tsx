import { useTranslations } from "next-intl";

export default function CustomerSection() {
    const t = useTranslations("roi");
    return (
        <section className="py-20 md:py-40 relative border-t border-[var(--border-subtle)] z-10">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-center">
                    <div className="gsap-reveal relative bg-[var(--bg-card)] border border-[var(--card-border)] rounded-[40px] px-8 py-16 lg:p-24 flex justify-center order-2 lg:order-1 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative w-full max-w-[320px] lg:max-w-none flex flex-col items-center lg:block">
                            <div className="relative">
                                <div className="absolute -inset-10 bg-blue-500/10 blur-[50px] rounded-full animate-pulse"></div>
                                <div className="relative border-[1px] border-white/10 rounded-full p-8 bg-slate-900/50 backdrop-blur-md shadow-2xl gsap-parallax">
                                    <div className="w-[180px] h-[180px] lg:w-[240px] lg:h-[240px] rounded-full border border-dashed border-blue-500/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                                        <div className="w-4 h-4 bg-blue-500 rounded-full absolute -top-2 left-1/2 -translate-x-1/2 shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-[0.6rem] uppercase tracking-[0.3em] text-blue-400 mb-1 font-black">Performance</div>
                                            <div className="text-4xl lg:text-5xl font-black text-white">+124%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="static lg:absolute lg:top-[15%] lg:-right-[40px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-7 w-full lg:w-[240px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-10 lg:mt-0 transition-transform duration-500 hover:scale-105 gsap-parallax" data-speed="1.2">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-[0.7rem] uppercase tracking-widest text-slate-500 font-bold">{t("netProfit")}</div>
                                    <div className="bg-emerald-500/10 text-emerald-400 text-[0.6rem] px-2 py-1 rounded-full font-black">ACTIVE</div>
                                </div>
                                <div className="text-3xl lg:text-4xl font-black text-white mb-5 tracking-tight">$12.4M</div>
                                <div className="space-y-3">
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden w-full">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[82%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-tighter">
                                        <span>THRESHOLD RECHED</span>
                                        <span>82%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="gsap-reveal order-1 lg:order-2">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                            Asset Intelligence
                        </div>
                        <h2 className="text-4xl lg:text-[4rem] mb-8 text-white leading-[1.05] font-black tracking-tighter" dangerouslySetInnerHTML={{ __html: t.raw("title").replace("ROI", "<span class='text-blue-500'>ROI</span>") }}>
                        </h2>
                        <p className="text-lg text-[var(--text-secondary)] mb-12 leading-relaxed">
                            {t("description")}
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none p-0 text-[var(--text-primary)] gsap-stagger-group">
                            <li className="flex items-center gap-3 font-semibold text-lg gsap-stagger-item">
                                <span className="text-yellow-400">✓</span> {t("stableCashflow")}
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-lg gsap-stagger-item">
                                <span className="text-yellow-400">✓</span> {t("assetAppreciation")}
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-lg gsap-stagger-item">
                                <span className="text-yellow-400">✓</span> {t("operationalEfficiency")}
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-lg gsap-stagger-item">
                                <span className="text-yellow-400">✓</span> {t("strategicExits")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
