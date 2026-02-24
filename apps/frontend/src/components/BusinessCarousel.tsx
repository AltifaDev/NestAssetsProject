"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";

const businessItems = [
    { id: 1, type: "equity", image: "/project_condo_1_1771746340513.png" },
    { id: 2, type: "hospitality", image: "/managed_hotel.png" },
    { id: 3, type: "wellness", image: "/luxury_spa.png" },
    { id: 4, type: "retail", image: "/project_house_2_1771746357895.png" },
    { id: 5, type: "business", image: "/premium_restaurant.png" },
];

export default function BusinessCarousel() {
    const t = useTranslations("businessTypes");
    const scrollRef = useRef<HTMLDivElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        if (!scrollRef.current) return;

        const scrollWidth = scrollRef.current.offsetWidth / 2;

        tweenRef.current = gsap.to(scrollRef.current, {
            x: -scrollWidth,
            duration: 40, // Elegant slow speed
            ease: "none",
            repeat: -1,
        });

        return () => {
            if (tweenRef.current) tweenRef.current.kill();
        };
    }, []);

    const handleMouseEnter = () => {
        if (tweenRef.current) {
            // Smoothly slow down to stop
            gsap.to(tweenRef.current, { timeScale: 0, duration: 0.8, overwrite: true });
        }
    };

    const handleMouseLeave = () => {
        if (tweenRef.current) {
            // Smoothly resume
            gsap.to(tweenRef.current, { timeScale: 1, duration: 0.8, overwrite: true });
        }
    };

    return (
        <section className="py-24 overflow-hidden relative z-20">
            <div
                className="w-full flex cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    ref={scrollRef}
                    className="flex gap-10 px-4"
                    style={{ width: "fit-content" }}
                >
                    {[...businessItems, ...businessItems].map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="group relative w-[320px] aspect-square rounded-[40px] overflow-hidden border border-white/10 bg-slate-900/50 transition-all duration-700 hover:-translate-y-2"
                        >
                            {/* Blue shadow glow on hover */}
                            <div className="absolute inset-0 rounded-[40px] opacity-0 group-hover:opacity-100 transition-all duration-700 shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)] z-0"></div>

                            <Image
                                src={item.image}
                                alt={t(item.type)}
                                fill
                                className="object-cover z-10 transition-transform duration-1000 group-hover:scale-110"
                                sizes="320px"
                            />

                            {/* Overlay bottom gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20"></div>

                            {/* Content Card with Glass effect */}
                            <div className="absolute bottom-8 left-8 right-8 z-30 transform transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                                    <span className="text-white font-bold text-sm sm:text-base tracking-[0.1em] uppercase block">
                                        {t(item.type)}
                                    </span>
                                </div>
                            </div>

                            {/* Hover Border Glow Effect */}
                            <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/30 rounded-[40px] z-40 transition-all duration-700"></div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                section::before,
                section::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    width: 250px;
                    height: 100%;
                    z-index: 25;
                    pointer-events: none;
                }
                section::before {
                    left: 0;
                    background: linear-gradient(to right, var(--bg-main) 0%, transparent 100%);
                }
                section::after {
                    right: 0;
                    background: linear-gradient(to left, var(--bg-main) 0%, transparent 100%);
                }
                :global([data-theme="light"]) section::before {
                    background: linear-gradient(to right, #f8fafc 0%, transparent 100%);
                }
                :global([data-theme="light"]) section::after {
                    background: linear-gradient(to left, #f8fafc 0%, transparent 100%);
                }
            `}</style>
        </section>
    );
}
