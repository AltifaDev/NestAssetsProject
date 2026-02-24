"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        // Check initial user preference or stored theme
        const storedTheme = localStorage.getItem("theme");

        // Default to light mode unless dark is explicitly stored
        if (storedTheme === "dark") {
            setIsLight(false);
            document.documentElement.setAttribute("data-theme", "dark");
            document.documentElement.classList.add("dark");
        } else {
            setIsLight(true);
            document.documentElement.setAttribute("data-theme", "light");
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = isLight ? "dark" : "light";
        setIsLight(!isLight);
        document.documentElement.setAttribute("data-theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="bg-transparent border border-[var(--border-subtle)] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-[var(--text-main)] transition-all duration-300 ease-in-out relative overflow-hidden hover:bg-[var(--bg-glass)] hover:text-[var(--accent-primary)] hover:border-[var(--border-medium)]"
            aria-label="Toggle Dark Layout"
        >
            <span
                className={`absolute transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isLight ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
                    }`}
            >
                <Sun size={20} />
            </span>
            <span
                className={`absolute transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isLight ? "opacity-0 -rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                    }`}
            >
                <Moon size={20} />
            </span>
        </button>
    );
}
