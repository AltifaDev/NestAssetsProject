"use client";

import AuthForm from "@/components/AuthForm";
import Logo from "@/components/Logo";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const t = useTranslations("auth");

    return (
        <main className="min-h-screen bg-[#020617] relative flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]"></div>
            </div>

            {/* Top Navigation Bar (Standalone) */}
            <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-20">
                <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-sm font-medium uppercase tracking-widest">{t("backToHome") || "Back to Home"}</span>
                </Link>

                <div className="hidden md:block">
                    <Logo />
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="md:hidden flex justify-center mb-8">
                    <Logo />
                </div>
                <AuthForm />
            </div>

            {/* Bottom Footer (Simplified) */}
            <div className="absolute bottom-6 left-0 w-full text-center z-20">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} NEST OF ASSETS CO, LTD. ALL RIGHTS RESERVED.
                </p>
            </div>
        </main>
    );
}
