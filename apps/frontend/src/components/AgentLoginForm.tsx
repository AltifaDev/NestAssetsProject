"use client";

import { useState } from 'react';
import { apiClient } from '../lib/api-client';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AgentLoginForm() {
    const t = useTranslations('agentLogin');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data: any = await apiClient.login(email, password);
            if (data.user && data.user.role !== 'agent') {
                setError(t('errors.accessDenied'));
                apiClient.logout();
                return;
            }
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || t('errors.loginFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[440px] px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-1000">
            {/* Header Area */}
            <div className="text-center mb-10 space-y-4 w-full">
                <div className="relative inline-flex mb-2">
                    <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full"></div>
                    <div className="relative bg-zinc-950 border border-white/5 p-5 rounded-3xl text-zinc-100 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                        <ShieldCheck size={42} strokeWidth={1} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center justify-center gap-3">
                        {t('title')}
                        <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-[0.4em] font-black">
                            {t('highlight')}
                        </span>
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide max-w-[300px] mx-auto opacity-60 uppercase tracking-[0.1em]">{t('subtitle')}</p>
                </div>
            </div>

            {/* Main Login Card */}
            <div className="relative w-full group">
                <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800/20 to-zinc-900/20 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-[#050505]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span className="text-xs font-bold leading-relaxed">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        {/* Email Entry */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">
                                {t('fields.email')}
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-white transition-colors z-20">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('placeholders.email')}
                                    style={{ paddingLeft: '3.5rem' }}
                                    className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl h-14 pr-5 text-white placeholder:text-zinc-800 outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Entry */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">
                                {t('fields.password')}
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-white transition-colors z-20">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('placeholders.password')}
                                    style={{ paddingLeft: '3.5rem' }}
                                    className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl h-14 pr-5 text-white placeholder:text-zinc-800 outline-none focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/5 group uppercase tracking-[0.2em] text-xs"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>{t('submit')}</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Explicit Footer to avoid collision */}
            <div className="mt-10 mb-6 text-center space-y-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/5 shadow-xl opacity-40">
                        <ShieldCheck size={14} className="text-zinc-500" />
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em]">
                            Authorized Personnel Only
                        </span>
                    </div>
                </div>
                <p className="text-[10px] text-zinc-800 font-bold opacity-30">
                    &copy; {new Date().getFullYear()} NEST OF ASSETS CO., LTD. ALL RIGHTS RESERVED.
                </p>
            </div>
        </div>
    );
}
