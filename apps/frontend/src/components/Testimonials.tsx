import { useTranslations } from "next-intl";

export default function Testimonials() {
    const t = useTranslations("testimonials");

    const testimonials = [
        {
            text: t("sarahText"),
            author: t("sarahAuthor"),
            role: t("sarahRole"),
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
            size: "large",
        },
        {
            text: t("michaelText"),
            author: t("michaelAuthor"),
            role: t("michaelRole"),
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
            size: "small",
        },
    ];
    return (
        <section className="py-32 md:py-48 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>

            <div className="container mx-auto px-6">
                <div className="text-center mb-24 gsap-reveal">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                        Verification of Excellence
                    </div>
                    <h2 className="text-4xl lg:text-[4.5rem] text-white font-black tracking-tighter leading-none">
                        {t("title")}
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 gsap-reveal">
                    {testimonials.map((test, i) => (
                        <div
                            key={i}
                            className={`group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 md:p-14 flex flex-col justify-between transition-all duration-700 hover:border-blue-500/30 hover:bg-slate-900/60 shadow-2xl ${test.size === "large" ? "lg:min-h-[500px]" : "lg:min-h-[400px]"
                                }`}
                        >
                            <div className="absolute top-10 right-10 text-slate-800 text-8xl font-serif pointer-events-none opacity-20 transition-opacity group-hover:opacity-40">"</div>

                            <div>
                                <div className="flex gap-1 mb-10">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-5 h-5 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#EAB308"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                        </div>
                                    ))}
                                </div>
                                <p
                                    className={`text-white leading-[1.6] mb-12 font-medium tracking-tight ${test.size === "large" ? "text-2xl md:text-3xl" : "text-xl"
                                        }`}
                                >
                                    {test.text}
                                </p>
                            </div>
                            <div className="flex items-center gap-5 pt-8 border-t border-white/5">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                    <img
                                        src={test.image}
                                        alt={test.author}
                                        className="w-14 h-14 rounded-full object-cover relative z-10 border-2 border-slate-950"
                                    />
                                </div>
                                <div>
                                    <strong className="block text-white text-lg font-black tracking-tight">
                                        {test.author}
                                    </strong>
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                        {test.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
