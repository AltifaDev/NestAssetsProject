"use client";

import { useRef, useEffect, useState } from 'react';
import { useTranslations } from "next-intl";
import { gsap } from 'gsap';
import { X, Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const t = useTranslations("contactSection");
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            // Reset visibility and initial states
            gsap.set(modalRef.current, { display: 'flex' });
            gsap.set(overlayRef.current, { opacity: 0 });
            gsap.set(contentRef.current, { y: 100, opacity: 0, scale: 0.9, rotateX: 10 });

            const tl = gsap.timeline();

            tl.to(overlayRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
            })
                .to(contentRef.current, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.8)'
                }, "-=0.3");

            // GSAP Entrance for form elements and info items
            const elements = contentRef.current?.querySelectorAll('.gsap-reveal');
            if (elements) {
                tl.fromTo(elements,
                    { y: 30, opacity: 0, filter: 'blur(10px)' },
                    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.08, ease: 'power3.out' },
                    "-=0.5"
                );
            }
        } else {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(modalRef.current, { display: 'none' });
                    document.body.style.overflow = 'unset';
                }
            });

            tl.to(contentRef.current, {
                y: 50,
                opacity: 0,
                scale: 0.95,
                duration: 0.4,
                ease: 'power3.in'
            })
                .to(overlayRef.current, {
                    opacity: 0,
                    duration: 0.3
                }, "-=0.2");
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);

            // Success animation on the button
            const btn = formRef.current?.querySelector('button');
            if (btn) {
                gsap.to(btn, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
            }

            setTimeout(() => {
                setIsSuccess(false);
                onClose();
                // Reset form after close
                setTimeout(() => setFormState({ name: '', email: '', phone: '', message: '' }), 500);
            }, 2000);
        }, 1500);
    };

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-6"
            style={{ display: 'none', perspective: '1000px' }}
        >
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className="relative w-full max-w-6xl bg-[#0a0c10]/90 backdrop-blur-2xl border border-white/10 md:rounded-[48px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] flex flex-col md:flex-row max-h-screen md:max-h-[90vh] overflow-hidden"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-all border border-white/5 group active:scale-95"
                    aria-label="Close"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Left Side: Form */}
                <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar">
                    <div className="gsap-reveal mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Get in Touch
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{t("title")}</h2>
                        <p className="text-white/50 text-lg leading-relaxed max-w-xl">{t("subtitle")}</p>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="gsap-reveal space-y-3">
                                <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("name")}</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                />
                            </div>

                            <div className="gsap-reveal space-y-3">
                                <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("email")}</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="gsap-reveal space-y-3">
                            <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("phone")}</label>
                            <input
                                type="tel"
                                placeholder="+66 XX XXX XXXX"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner"
                                value={formState.phone}
                                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                            />
                        </div>

                        <div className="gsap-reveal space-y-3">
                            <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("message")}</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Tell us about your goals..."
                                className="w-full bg-white/5 border border-white/10 rounded-[32px] px-6 py-5 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all resize-none shadow-inner"
                                value={formState.message}
                                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={isSubmitting || isSuccess}
                            className="gsap-reveal w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black py-6 rounded-[32px] flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] mt-4"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                            {isSuccess ? (
                                <>
                                    <CheckCircle2 size={24} className="text-emerald-300" />
                                    <span className="text-xl">Sent Successfully!</span>
                                </>
                            ) : (
                                <>
                                    <Send size={22} className={`${isSubmitting ? 'animate-bounce' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'}`} />
                                    <span className="text-xl">{isSubmitting ? 'Sending Transmission...' : t("submit")}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Side: Info Panel */}
                <div className="w-full md:w-[420px] bg-white/[0.03] p-8 md:p-14 border-t md:border-t-0 md:border-l border-white/5 flex flex-col overflow-y-auto">
                    <div className="gsap-reveal mb-14">
                        <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                            <div className="w-1 h-8 bg-blue-500 rounded-full" />
                            {t("infoTitle")}
                        </h3>

                        <div className="space-y-10">
                            <div className="gsap-reveal flex gap-5 group">
                                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-blue-500/20 to-blue-600/5 group-hover:from-blue-500/30 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 transition-all group-hover:scale-110 shadow-lg shadow-blue-500/5">
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-lg">{t("officeBkk")}</h4>
                                    <p className="text-white/40 text-sm leading-relaxed">{t("addressBkk")}</p>
                                </div>
                            </div>

                            <div className="gsap-reveal flex gap-5 group">
                                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 group-hover:from-indigo-500/30 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 transition-all group-hover:scale-110 shadow-lg shadow-indigo-500/5">
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-lg">{t("officePty")}</h4>
                                    <p className="text-white/40 text-sm leading-relaxed">{t("addressPty")}</p>
                                </div>
                            </div>

                            <div className="gsap-reveal flex gap-5 group">
                                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-purple-500/20 to-purple-600/5 group-hover:from-purple-500/30 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 transition-all group-hover:scale-110 shadow-lg shadow-purple-500/5">
                                    <Phone size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-lg">{t("phoneLabel")}</h4>
                                    <p className="text-white/50 text-sm mb-1 font-medium">{t("thailand")}: <span className="text-white font-bold ml-1">+66 065 414 6124</span></p>
                                    <p className="text-white/50 text-sm font-medium">{t("canada")}: <span className="text-white font-bold ml-1">+1 647 866 0201</span></p>
                                </div>
                            </div>

                            <div className="gsap-reveal flex gap-5 group">
                                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 group-hover:from-emerald-500/30 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 transition-all group-hover:scale-110 shadow-lg shadow-emerald-500/5">
                                    <Mail size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-lg">{t("emailLabel")}</h4>
                                    <p className="text-white/40 text-sm break-all font-medium group-hover:text-emerald-300 transition-colors">info@nest-of-assets.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="gsap-reveal mt-auto pt-10">
                        <div className="bg-gradient-to-br from-white/5 to-transparent rounded-[32px] p-8 border border-white/5 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                            <div className="flex items-center gap-4 mb-6 text-white font-black text-lg">
                                <Clock size={24} className="text-blue-400" />
                                <span>{t("hoursTitle")}</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-tighter">{t("monFri")}</span>
                                    <span className="text-white font-black">09:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <span className="text-white/40 text-xs font-bold uppercase tracking-tighter">{t("sat")}</span>
                                    <span className="text-white font-black">10:00 - 16:00</span>
                                </div>
                                <div className="flex justify-between items-center bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                                    <span className="text-rose-400/60 text-xs font-bold uppercase tracking-tighter">{t("sun")}</span>
                                    <span className="text-rose-400 font-black px-3 py-1 rounded-lg bg-rose-500/10">{t("closed")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
}
