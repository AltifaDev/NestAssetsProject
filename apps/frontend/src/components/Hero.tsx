import SearchTool from "./SearchTool";
import { useTranslations } from "next-intl";

export default function Hero() {
    const t = useTranslations("hero");

    return (
        <section
            className="pb-[160px] text-center relative min-h-screen flex flex-col items-center"
            style={{ paddingTop: '280px' }}
        >
            {/* Video Background Container - Layered correctly above page background */}
            <div className="absolute top-0 left-0 w-full h-[900px] z-0 overflow-hidden pointer-events-none">
                <video
                    src="https://framerusercontent.com/assets/xvr7KUKetv3S6umsLgFm1dNklxM.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-100"
                ></video>
                {/* Premium Cinematic Overlays - Adjusted for light/dark visibility */}
                <div className="absolute inset-0 bg-white/40 dark:bg-black/60"></div>
                {/* Bottom smooth fade to transparent background */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[var(--bg-main)] to-transparent"></div>
            </div>

            <div className="container mx-auto hero-content relative z-10">
                <div className="w-full flex flex-col items-center text-center">
                    <h1 className="text-[clamp(2.2rem,5.5vw,4.8rem)] max-w-[1100px] mx-auto mb-6 bg-gradient-to-b from-[var(--hero-title-from)] to-[var(--hero-title-to)] bg-clip-text text-transparent leading-[1.15] font-bold tracking-[-0.02em] text-center gsap-reveal">
                        {t("title")}
                    </h1>

                    <p className="text-[1.05rem] text-[var(--text-muted)] max-w-[650px] mb-12 leading-[1.6] font-medium tracking-[0.01em] text-center gsap-reveal">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="w-full flex justify-center" style={{ marginBottom: '80px' }}>
                    <div className="w-full max-w-[1000px] relative z-20 gsap-reveal">
                        <SearchTool />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-10 gsap-reveal">
                    <a href="#contact" className="btn btn-primary px-8 py-3.5 text-[1rem] rounded-full inline-flex items-center gap-2 font-semibold">
                        {t("getConsultation")}
                        <span className="text-lg leading-none">→</span>
                    </a>
                    <a href="#portfolio" className="btn btn-outline px-8 py-3.5 text-[1rem] rounded-full font-semibold">
                        {t("viewPortfolio")}
                    </a>
                </div>

                <div className="text-[0.875rem] text-[var(--text-dim)] flex items-center justify-center gap-2.5 mb-16 gsap-reveal font-medium">
                    <span>{t("privateEquity")}</span>
                    <span className="text-[var(--text-dim)] opacity-50">•</span>
                    <span>{t("assetManagement")}</span>
                    <span className="text-[var(--text-dim)] opacity-50">•</span>
                    <span>{t("businessDevelopment")}</span>
                </div>

                <div className="w-full max-w-[1400px] mx-auto perspective-1000 gsap-reveal hero-visual">
                    <div className="bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)] transform rotate-x-10">
                        <div className="h-[50px] bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center px-6 gap-8">
                            <div className="flex gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-medium)]"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-medium)]"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-medium)]"></span>
                            </div>
                            <div className="bg-[var(--bg-glass)] px-4 py-1 rounded-md text-[0.8rem] text-[var(--text-muted)] w-full max-w-[400px]">
                                nest-of-assets.com
                            </div>
                        </div>
                        <div className="flex h-auto aspect-video bg-black">
                            <video
                                src="https://res.cloudinary.com/dgbrieymr/video/upload/q_auto,f_auto/v1771533564/Thailand_Real_Estate_Video_Generation_kzhhyn.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                            ></video>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes flow {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(5%, 5%) scale(1.1);
          }
        }
        .animate-flow-red {
          animation: flow 20s infinite alternate;
        }
        .animate-flow-blue {
          animation: flow 25s infinite alternate-reverse;
        }
        :global([data-theme="light"]) .animate-flow-red,
        :global([data-theme="light"]) .animate-flow-blue {
          opacity: 0.08;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-10 {
          transform: rotateX(10deg);
        }
      `}</style>
        </section>
    );
}
