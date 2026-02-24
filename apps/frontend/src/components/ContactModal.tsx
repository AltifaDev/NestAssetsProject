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
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-0 md:p-6 overflow-y-auto md:overflow-hidden"
            style={{ display: 'none', perspective: '1000px' }}
        >
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className="relative w-full max-w-6xl bg-[#0a0c10]/95 backdrop-blur-2xl border border-white/10 rounded-t-[32px] md:rounded-[48px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] flex flex-col md:flex-row h-fit md:h-full max-h-fit md:max-h-[90vh] overflow-visible md:overflow-hidden mt-auto md:mt-0"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-all border border-white/5 group active:scale-95"
                    aria-label="Close"
                >
                    <X size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Left Side: Form */}
                <div className="flex-1 p-6 md:p-14 md:overflow-y-auto custom-scrollbar h-fit md:h-full">
                    <div className="gsap-reveal mb-8 md:mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 animate-pulse" />
                            Get in Touch
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tight">{t("title")}</h2>
                        <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl">{t("subtitle")}</p>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="gsap-reveal space-y-2 md:space-y-3">
                                <label className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("name")}</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 py-3.5 md:px-6 md:py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner text-sm md:text-base"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                />
                            </div>

                            <div className="gsap-reveal space-y-2 md:space-y-3">
                                <label className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("email")}</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 py-3.5 md:px-6 md:py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner text-sm md:text-base"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="gsap-reveal space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("phone")}</label>
                            <input
                                type="tel"
                                placeholder="+66 XX XXX XXXX"
                                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 py-3.5 md:px-6 md:py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all shadow-inner text-sm md:text-base"
                                value={formState.phone}
                                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                            />
                        </div>

                        <div className="gsap-reveal space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-widest ml-1">{t("message")}</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Tell us about your goals..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[32px] px-5 py-4 md:px-6 md:py-5 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all resize-none shadow-inner text-sm md:text-base"
                                value={formState.message}
                                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={isSubmitting || isSuccess}
                            className="gsap-reveal w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black py-4 md:py-6 rounded-2xl md:rounded-[32px] flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] mt-2 md:mt-4"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                            {isSuccess ? (
                                <>
                                    <CheckCircle2 size={20} className="md:w-6 md:h-6 text-emerald-300" />
                                    <span className="text-lg md:text-xl">Sent Successfully!</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} className={`md:w-5 md:h-5 ${isSubmitting ? 'animate-bounce' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'}`} />
                                    <span className="text-lg md:text-xl">{isSubmitting ? 'Sending Transmission...' : t("submit")}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Side: Info Panel - Simplified on mobile */}
                <div className="w-full md:w-[420px] bg-white/[0.03] p-6 md:p-14 border-t md:border-t-0 md:border-l border-white/5 flex flex-col md:overflow-y-auto h-fit md:h-full">
                    <div className="gsap-reveal mb-8 md:mb-14">
                        <h3 className="text-xl md:text-2xl font-black text-white mb-6 md:mb-10 flex items-center gap-3 md:gap-4">
                            <div className="w-1 h-6 md:h-8 bg-blue-500 rounded-full" />
                            {t("infoTitle")}
                        </h3>

                        <div className="space-y-6 md:space-y-10">
                            {/* Primary Office only on mobile to speed up display */}
                            <div className="gsap-reveal flex gap-4 md:gap-5 group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[22px] bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
                                    <MapPin size={24} className="md:w-7 md:h-7" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white mb-1 md:mb-2 text-base md:text-lg">{t("officeBkk")}</h4>
                                    <p className="text-white/40 text-xs md:text-sm leading-relaxed">{t("addressBkk")}</p>
                                </div>
                            </div>

                            {/* Show Pattaya only on Desktop or if space allows */}
                            <div className="hidden md:flex gsap-reveal gap-5 group">
                                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-2 text-lg">{t("officePty")}</h4>
                                    <p className="text-white/40 text-sm leading-relaxed">{t("addressPty")}</p>
                                </div>
                            </div>

                            <div className="gsap-reveal flex gap-4 md:gap-5 group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[22px] bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
                                    <Phone size={24} className="md:w-7 md:h-7" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white mb-1 md:mb-2 text-base md:text-lg">{t("phoneLabel")}</h4>
                                    <p className="text-white/50 text-xs md:text-sm font-medium">{t("thailand")}: <span className="text-white font-bold ml-1">+66 065 414 6124</span></p>
                                </div>
                            </div>

                            <div className="gsap-reveal flex gap-4 md:gap-5 group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[22px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                                    <Mail size={24} className="md:w-7 md:h-7" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white mb-1 md:mb-2 text-base md:text-lg">{t("emailLabel")}</h4>
                                    <p className="text-white/40 text-xs md:text-sm break-all font-medium">info@nest-of-assets.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hidden on mobile for faster rendering */}
                    <div className="hidden md:block gsap-reveal mt-auto pt-10">
                        <div className="bg-gradient-to-br from-white/5 to-transparent rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
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
