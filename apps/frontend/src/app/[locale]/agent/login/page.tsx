"use client";

import AgentLoginForm from "@/components/AgentLoginForm";
import Logo from "@/components/Logo";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AgentLoginPage() {
    const t = useTranslations("auth");

    return (
        <main className="min-h-screen bg-black relative flex flex-col items-center justify-center p-4 overflow-hidden font-sans selection:bg-zinc-500/30">
            {/* High-End Neural Grid Background (CSS Powered for Stability) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                {/* Base Dark Gradient */}
                <div className="absolute inset-0 bg-[#020202]"></div>

                {/* Animated Neural Grid */}
                <div className="absolute inset-0 opacity-[0.2]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #333 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
                    }}>
                </div>

                {/* Moving Light Rays */}
                <div className="absolute inset-0 opacity-[0.4] overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(255,255,255,0.03)_15%,transparent_30%)] animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0%,rgba(255,255,255,0.02)_15%,transparent_30%)] animate-[spin_30s_linear_infinite_reverse]"></div>
                </div>

                {/* Floating Digital Particles */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
                    <div className="absolute w-[2px] h-[2px] bg-white rounded-full animate-[pulse_4s_infinite] top-[15%] left-[25%]" style={{ boxShadow: '0 0 10px white' }}></div>
                    <div className="absolute w-1 h-1 bg-white/50 rounded-full animate-[pulse_3s_infinite] top-[45%] left-[75%]" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute w-[2px] h-[2px] bg-white rounded-full animate-[pulse_5s_infinite] top-[85%] left-[35%]" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute w-1 h-1 bg-white/50 rounded-full animate-[pulse_6s_infinite] top-[25%] left-[85%]" style={{ animationDelay: '1.5s' }}></div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-20 pointer-events-none bg-[size:100%_4px,3px_100%] opacity-20"></div>

                {/* Ambient Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-zinc-800/10 blur-[200px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-900/20 blur-[200px] rounded-full"></div>
            </div>

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-40">
                <Link href="/" className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all duration-500 backdrop-blur-md bg-white/[0.02] border border-white/5 px-6 py-3 rounded-full hover:bg-white/[0.05] hover:border-white/10 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all group-hover:rotate-[-45deg] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{t("backToHome") || "Back to Home"}</span>
                </Link>

                <div className="hidden md:block group animate-in fade-in slide-in-from-right-8 duration-1000">
                    <div className="relative">
                        <div className="absolute -inset-8 bg-white/5 blur-2xl rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
                        <div className="relative brightness-100 hover:brightness-125 transition-all duration-500 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                            <Logo />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-30 w-full max-w-md px-6">
                <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-16 duration-1000 delay-300">
                    <div className="md:hidden flex justify-center mb-16 grayscale opacity-80 scale-110">
                        <Logo />
                    </div>

                    <div className="relative [animation:float_10s_ease-in-out_infinite] group/form">
                        {/* Interactive HUD Corners */}
                        <div className="absolute -top-12 -left-12 w-24 h-24 border-t border-l border-white/10 rounded-tl-3xl opacity-50 group-hover/form:opacity-100 transition-opacity duration-1000 group-hover/form:scale-105 pointer-events-none"></div>
                        <div className="absolute -bottom-12 -right-12 w-24 h-24 border-b border-r border-white/10 rounded-br-3xl opacity-50 group-hover/form:opacity-100 transition-opacity duration-1000 group-hover/form:scale-105 pointer-events-none"></div>

                        <AgentLoginForm />

                        {/* Dynamic Status Lines */}
                        <div className="absolute -right-2 top-1/4 h-24 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                        <div className="absolute -left-2 bottom-1/4 h-24 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) skewX(0deg); }
                    50% { transform: translateY(-20px) skewX(0.5deg); }
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Bottom Footer - High Tech Branding */}
            <div className="absolute bottom-12 left-0 w-full text-center z-40 animate-in fade-in duration-1000 delay-1000">
                <div className="inline-flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6 px-8 py-3 bg-white/[0.02] border border-white/5 rounded-full backdrop-blur-sm grayscale opacity-60 hover:opacity-100 transition-opacity duration-700">
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">
                            SYSTEM STATUS: OPERATIONAL
                        </p>
                        <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    <p className="text-zinc-800 text-[9px] font-bold uppercase tracking-[0.8em] opacity-40">
                        ENCRYPTED ACCESS NODE 071-X
                    </p>
                </div>
            </div>
        </main>
    );
}
