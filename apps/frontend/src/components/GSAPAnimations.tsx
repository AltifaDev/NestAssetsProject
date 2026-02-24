"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function GSAPAnimations() {
    useEffect(() => {
        // 1. Initialize Lenis (Smooth Scroll)
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // 2. Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Synchronize Lenis with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        // 2.5 Hook Hash Links for Smooth Scroll
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.hash && anchor.origin === window.location.origin) {
                const targetElement = document.querySelector(anchor.hash);
                if (targetElement) {
                    e.preventDefault();
                    lenis.scrollTo(anchor.hash, {
                        offset: -100, // Account for fixed navbar
                        duration: 1.5,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }
            }
        };

        window.addEventListener('click', handleAnchorClick);

        // 3. Reveal Animations (Standard Fade In Up)
        const reveals = document.querySelectorAll(".gsap-reveal");
        reveals.forEach((el) => {
            gsap.fromTo(el,
                {
                    opacity: 0,
                    y: 30,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    }
                }
            );
        });

        // 4. Staggered Reveals (For lists and grids)
        const staggerGroups = document.querySelectorAll(".gsap-stagger-group");
        staggerGroups.forEach((group) => {
            const items = group.querySelectorAll(".gsap-stagger-item");
            gsap.fromTo(items,
                {
                    opacity: 0,
                    y: 40
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: group,
                        start: "top 80%",
                    }
                }
            );
        });

        // 5. Parallax Effect for Images
        const parallaxImages = document.querySelectorAll(".gsap-parallax");
        parallaxImages.forEach((image) => {
            gsap.to(image, {
                yPercent: -20,
                ease: "none",
                scrollTrigger: {
                    trigger: image,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // 6. Hero 3D Perspective Tilt on Scroll
        const heroVisual = document.querySelector(".hero-visual");
        if (heroVisual) {
            gsap.to(heroVisual, {
                rotateX: 0,
                y: -50,
                scale: 1.05,
                scrollTrigger: {
                    trigger: ".hero-content",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // Cleanup
        return () => {
            window.removeEventListener('click', handleAnchorClick);
            lenis.destroy();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return null;
}
