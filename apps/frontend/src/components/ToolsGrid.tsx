import { useTranslations } from 'next-intl';

export default function ToolsGrid() {
    const t = useTranslations('sectors');

    const tools = [
        { name: t("hospitality"), icon: "H", bgColor: "#FF4A00" },
        { name: t("realEstate"), icon: "R", bgColor: "#FF7A59" },
        { name: t("retail"), icon: "S", bgColor: "#05CE78" },
        { name: t("finance"), icon: "F", bgColor: "#0057FF" },
        { name: t("logistics"), icon: "L", bgColor: "#FFE01B" },
        { name: t("wellness"), icon: "W", bgColor: "#95BF47" },
        { name: t("tech"), icon: "T", bgColor: "#000000" },
        { name: t("energy"), icon: "E", bgColor: "#F24E1E" },
    ];

    const toolsRow2 = [...tools.slice().reverse()];

    return (
        <>
            <section className="py-[100px]">
                <div className="container mx-auto px-4">
                    <div className="bg-[var(--bg-surface)] border border-[var(--card-border)] rounded-[48px] py-24 overflow-hidden gsap-reveal shadow-sm">
                        <div className="text-center max-w-[700px] mx-auto px-8 mb-20 lg:mb-[5rem]">
                            <h2 className="text-4xl lg:text-[3.5rem] mb-6 text-[var(--text-primary)] leading-[1.1] font-bold gradient-text">
                                {t("title")}
                            </h2>
                            <p className="text-[1.15rem] text-[var(--text-secondary)] leading-[1.6] mb-10">
                                {t("description")}
                            </p>
                            <div>
                                <a href="#" className="btn btn-primary px-8 py-3 rounded-full inline-flex items-center gap-2">
                                    {t("exploreAll")} <span>→</span>
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Row 1 */}
                            <div
                                className="flex overflow-hidden select-none"
                                style={{
                                    maskImage:
                                        "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                                }}
                            >
                                <div className="flex gap-6 min-w-full animate-scroll-fast">
                                    {[...tools, ...tools].map((tool, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] px-6 py-3 rounded-full shrink-0"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[0.85rem] text-white"
                                                style={{ backgroundColor: tool.bgColor }}
                                            >
                                                {tool.icon}
                                            </div>
                                            <span className="text-[var(--text-primary)] font-medium text-[0.95rem]">
                                                {tool.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div
                                className="flex overflow-hidden select-none"
                                style={{
                                    maskImage:
                                        "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                                }}
                            >
                                <div className="flex gap-6 min-w-full animate-scroll-fast-reverse">
                                    {[...toolsRow2, ...toolsRow2].map((tool, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] px-6 py-3 rounded-full shrink-0"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[0.85rem] text-white"
                                                style={{ backgroundColor: tool.bgColor }}
                                            >
                                                {tool.icon}
                                            </div>
                                            <span className="text-[var(--text-primary)] font-medium text-[0.95rem]">
                                                {tool.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-fast {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll-fast-reverse {
          animation: scroll 40s linear infinite reverse;
        }
      `}</style>
        </>
    );
}
