"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
    Mail,
    Lock,
    User,
    Phone,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Shield
} from "lucide-react";

export default function AuthForm() {
    const t = useTranslations("auth");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                window.location.href = "/";
            } else {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name, phone: phone } },
                });
                if (error) throw error;
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    setError(t("messages.alreadyRegistered"));
                } else {
                    setMessage(t("messages.confirmationSent"));
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: `${window.location.origin}/` },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[460px] px-4 py-12 flex flex-col items-center justify-center min-h-[85vh] animate-in fade-in zoom-in duration-1000">
            {/* Branding Header */}
            <div className="text-center space-y-4 mb-10 w-full animate-in slide-in-from-top-4 duration-1200">
                <h1 className="text-5xl font-black text-white tracking-tighter sm:text-6xl">
                    {isLogin ? t("login.title") : t("register.title")}
                </h1>
                <p className="text-slate-400 text-sm font-medium tracking-wide max-w-[320px] mx-auto opacity-70">
                    {isLogin ? t("login.subtitle") : t("register.subtitle")}
                </p>
            </div>

            {/* Auth Card Container */}
            <div className="relative w-full group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-[#0a0f1d]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8 overflow-hidden">

                    {/* Messaging System */}
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span className="text-[11px] font-bold leading-relaxed tracking-wider">{error}</span>
                        </div>
                    )}
                    {message && (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                            <span className="text-[11px] font-bold leading-relaxed tracking-wider">{message}</span>
                        </div>
                    )}

                    {/* Social OAuth Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-3 h-14 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-lg"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            className="flex items-center justify-center gap-3 h-14 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-lg"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            Facebook
                        </button>
                    </div>

                    <div className="relative flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/5"></div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-0.5">{t("social.continueWith")}</span>
                        <div className="flex-1 h-px bg-white/5"></div>
                    </div>

                    {/* Authentication Logic Form */}
                    <form onSubmit={handleAuth} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">{t("fields.fullName")}</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-500 transition-colors z-20"><User size={18} /></div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={{ paddingLeft: '3.5rem' }}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl h-14 pr-5 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                                            placeholder={t("placeholders.fullName")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">{t("fields.phone")}</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-500 transition-colors z-20"><Phone size={18} /></div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            style={{ paddingLeft: '3.5rem' }}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl h-14 pr-5 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                                            placeholder={t("placeholders.phone")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">{t("fields.email")}</label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-500 transition-colors z-20"><Mail size={18} /></div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: '3.5rem' }}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl h-14 pr-5 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                                    placeholder={t("placeholders.email")}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-2 pr-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t("fields.password")}</label>
                                {isLogin && (
                                    <button type="button" className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">
                                        {t("fields.forgot")}
                                    </button>
                                )}
                            </div>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-500 transition-colors z-20"><Lock size={18} /></div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingLeft: '3.5rem' }}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl h-14 pr-5 text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit CTA */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20 group relative overflow-hidden"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span className="uppercase tracking-[0.3em] text-[11px] font-black">{isLogin ? t("login.submit") : t("register.submit")}</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Link */}
                    <div className="text-center pt-2">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
                            className="text-[11px] text-slate-500 font-bold hover:text-white transition-all uppercase tracking-[0.1em] group"
                        >
                            {isLogin ? t("login.togglePrompt") : t("register.togglePrompt")}{" "}
                            <span className="text-blue-500 border-b-2 border-blue-500/10 group-hover:border-blue-500 ml-1.5 transition-all">
                                {isLogin ? t("login.toggleAction") : t("register.toggleAction")}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Footer Bridge */}
            <div className="mt-12 text-center space-y-6 w-full animate-in fade-in duration-1500 delay-500">
                <div className="flex justify-center">
                    <Link
                        href="/agent/login"
                        className="flex items-center gap-4 px-10 py-4 rounded-full bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-slate-900/50 hover:border-white/10 transition-all text-[10px] font-black uppercase tracking-[0.4em] group shadow-2xl backdrop-blur-md"
                    >
                        <Shield size={16} className="group-hover:text-blue-500 transition-colors" />
                        {t("agentPortal")}
                    </Link>
                </div>
                <div className="space-y-2 pb-10">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.5em] opacity-40">
                        Secure Access Powered by Nest Assets Engine
                    </p>
                    <p className="text-[10px] text-slate-700 font-medium">
                        &copy; {new Date().getFullYear()} NEST OF ASSETS CO., LTD. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </div>
    );
}
