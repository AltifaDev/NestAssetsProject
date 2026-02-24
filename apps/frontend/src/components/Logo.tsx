import Image from "next/image";
import logoImage from "../assets/Logo.png";

export default function Logo() {
    return (
        <div className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
            <Image
                src={logoImage}
                alt="NEST OF ASSETS Logo"
                width={32}
                height={32}
                className="transition-all duration-300 dark:invert invert-0 group-hover:scale-110"
                style={{ filter: 'var(--logo-filter)' }}
            />
            <span className="text-[var(--text-primary)] tracking-tight">NEST OF ASSETS CO, LTD</span>
        </div>
    );
}
