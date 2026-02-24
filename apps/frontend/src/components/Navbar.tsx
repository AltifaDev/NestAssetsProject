import { Link } from "@/i18n/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { useTranslations } from 'next-intl';

export default function Navbar() {
    const t = useTranslations('nav');

    return (
        <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[94%] max-w-[1400px] h-[70px] bg-[var(--nav-bg)] backdrop-blur-[20px] border border-[var(--nav-border)] rounded-full z-50 flex items-center shadow-2xl">
            <div className="container mx-auto px-8 flex justify-between items-center w-full">
                <div>
                    <Logo />
                </div>

                <div className="hidden lg:flex gap-10 items-center">
                    <a href="#services" className="text-[var(--text-secondary)] text-[0.95rem] font-medium transition-colors duration-300 py-5 hover:text-[var(--text-primary)]">{t('services')}</a>
                    <a href="#portfolio" className="text-[var(--text-secondary)] text-[0.95rem] font-medium transition-colors duration-300 py-5 hover:text-[var(--text-primary)]">{t('portfolio')}</a>
                    <a href="#contact" className="text-[var(--text-secondary)] text-[0.95rem] font-medium transition-colors duration-300 py-5 hover:text-[var(--text-primary)]">{t('contact')}</a>
                </div>

                <div className="hidden lg:flex items-center gap-6 group">
                    <LanguageSelector />
                    <ThemeToggle />
                    <Link href="/login" className="btn btn-outline rounded-full px-6 py-3 text-sm">{t('signIn')}</Link>

                    <Link
                        href="/agent/login"
                        className="flex items-center justify-center w-7 h-7 rounded-full text-[var(--text-secondary)] opacity-0 pointer-events-none transition-all duration-400 ease-in-out -ml-2 group-hover:opacity-35 group-hover:pointer-events-auto hover:!opacity-100 hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)]"
                        title={t('agentPortal')}
                        aria-label={t('agentPortal')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="lg:hidden block" aria-label="Toggle Menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-primary)]">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>
        </nav>
    );
}
