"use client";

import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Home,
    Plus,
    Users,
    BarChart3,
    Settings,
    LogOut,
    User,
    Sun,
    Moon,
    Building2,
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
    activeTab?: string;
    onTabChange?: (tab: any) => void;
    userRole?: 'agent' | 'admin';
}

export default function Sidebar({ activeTab, onTabChange, userRole }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const currentUser = apiClient.getUser();
        setUser(currentUser);
        
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDark(savedTheme === 'dark');
            document.documentElement.classList.toggle('light', savedTheme === 'light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    const handleLogout = () => {
        apiClient.logout();
    };

    // If using controlled mode (with props)
    if (onTabChange && userRole) {
        const agentMenuItems = [
            { id: 'properties', label: 'Properties', icon: Building2 },
            { id: 'leads', label: 'Leads', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: User },
        ];

        const adminMenuItems = [
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'agents', label: 'Agents', icon: Users },
            { id: 'properties', label: 'Properties', icon: Building2 },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
        ];

        const menuItems = userRole === 'admin' ? adminMenuItems : agentMenuItems;

        return (
            <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-900/50 border-r border-slate-800 backdrop-blur-xl">
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                    isActive
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        );
    }

    // Default mode (navigation-based)
    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Properties", href: "/dashboard/properties", icon: Home },
        { name: "Add Property", href: "/dashboard/properties/new", icon: Plus },
        { name: "Leads", href: "/dashboard/leads", icon: Users },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Profile", href: "/dashboard/profile", icon: User },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    const handleNavigation = (href: string) => {
        router.push(href);
    };

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <div className="logo-icon">N</div>
                <span className="logo-text">Nest of Assets</span>
            </div>

            <nav className="nav-menu">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => handleNavigation(item.href)}
                            className={`nav-item ${isActive ? "active" : ""}`}
                        >
                            <Icon className="nav-icon" />
                            <span>{item.name}</span>
                            {isActive && <div className="active-indicator" />}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button 
                    onClick={toggleTheme}
                    className="theme-toggle"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <div className="user-profile">
                    <div className="avatar">
                        {user?.name?.substring(0, 2).toUpperCase() || "AG"}
                    </div>
                    <div className="user-info">
                        <p className="name">{user?.name || "Agent"}</p>
                        <p className="role">{user?.role || "Agent"}</p>
                    </div>
                    <button className="logout-btn" aria-label="Logout" onClick={handleLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 3rem;
          padding-left: 0.5rem;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1.2rem;
        }

        .logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          position: relative;
          font-weight: 500;
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: var(--nav-hover);
        }

        .nav-item.active {
          color: var(--text-primary);
          background: var(--nav-active);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
        }

        .active-indicator {
          position: absolute;
          right: 1rem;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 10px #3b82f6;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--sidebar-border);
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: var(--nav-hover);
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          width: 100%;
        }

        .theme-toggle:hover {
          background: var(--nav-active);
          color: var(--text-primary);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #334155, #1e293b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          border: 1px solid var(--sidebar-border);
          font-size: 0.875rem;
        }

        .user-info {
          flex: 1;
          overflow: hidden;
        }

        .name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        .role {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
          text-transform: capitalize;
        }

        .logout-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn:hover {
          background: var(--nav-hover);
          color: var(--text-primary);
        }

        /* Dark mode (default) */
        :global(:root) {
          --sidebar-bg: #0a0a0a;
          --sidebar-border: rgba(255, 255, 255, 0.1);
          --text-primary: #ffffff;
          --text-secondary: #94a3b8;
          --nav-hover: rgba(255, 255, 255, 0.05);
          --nav-active: rgba(59, 130, 246, 0.15);
        }

        /* Light mode */
        :global(:root.light) {
          --sidebar-bg: #ffffff;
          --sidebar-border: rgba(0, 0, 0, 0.1);
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --nav-hover: rgba(0, 0, 0, 0.05);
          --nav-active: rgba(59, 130, 246, 0.1);
        }

        :global(:root.light) .sidebar {
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
        }

        :global(:root.light) .avatar {
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          color: #1e293b;
        }
      `}</style>
        </aside>
    );
}
