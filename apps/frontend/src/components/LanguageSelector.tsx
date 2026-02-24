"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const selectedLang = languages.find(lang => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setIsOpen(false);
    
    // Remove current locale from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/(en|th|zh|de|fr|es|ja|ko|pt|ru)/, '');
    
    // Add new locale to pathname
    const newPathname = `/${lang.code}${pathnameWithoutLocale || '/'}`;
    
    router.push(newPathname);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
      >
        <span className="lang-flag">{selectedLang.flag}</span>
        <svg
          className={`lang-chevron ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-inner">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${selectedLang.code === lang.code ? "active" : ""}`}
                onClick={() => handleLanguageChange(lang)}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-name">{lang.name}</span>
                {selectedLang.code === lang.code && (
                  <svg
                    className="lang-check"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .language-selector {
          position: relative;
          display: flex;
          align-items: center;
        }

        .language-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--bg-glass, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--nav-border, rgba(255, 255, 255, 0.1));
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--text-secondary);
        }

        .language-trigger:hover {
          background: var(--bg-surface, rgba(255, 255, 255, 0.1));
          border-color: var(--border-medium, rgba(255, 255, 255, 0.2));
          transform: translateY(-1px);
        }

        .lang-flag {
          font-size: 1.2rem;
          line-height: 1;
        }

        .lang-chevron {
          transition: transform 0.3s ease;
          color: var(--text-secondary);
        }

        .lang-chevron.open {
          transform: rotate(180deg);
        }

        .language-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--bg-surface, #fff);
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          z-index: 1000;
          animation: slideDown 0.3s ease;
          backdrop-filter: blur(20px);
        }

        .language-dropdown-inner {
          padding: 8px;
          max-height: 400px;
          overflow-y: auto;
        }

        .language-dropdown-inner::-webkit-scrollbar {
          width: 6px;
        }

        .language-dropdown-inner::-webkit-scrollbar-track {
          background: transparent;
        }

        .language-dropdown-inner::-webkit-scrollbar-thumb {
          background: var(--border-medium, rgba(0, 0, 0, 0.2));
          border-radius: 3px;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);
          text-align: left;
        }

        .language-option:hover {
          background: var(--bg-glass, rgba(59, 130, 246, 0.08));
        }

        .language-option.active {
          background: var(--bg-glass, rgba(59, 130, 246, 0.1));
          color: #3b82f6;
          font-weight: 600;
        }

        .lang-name {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .lang-check {
          color: #3b82f6;
          flex-shrink: 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Dark mode adjustments */
        :global([data-theme="dark"]) .language-dropdown {
          background: rgba(15, 23, 42, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
        }

        :global([data-theme="dark"]) .language-option:hover {
          background: rgba(59, 130, 246, 0.15);
        }

        :global([data-theme="dark"]) .language-option.active {
          background: rgba(59, 130, 246, 0.2);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .language-dropdown {
            right: -8px;
            min-width: 180px;
          }

          .language-option {
            padding: 8px 10px;
          }

          .lang-name {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
