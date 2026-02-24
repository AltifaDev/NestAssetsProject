"use client";

import Sidebar from '../../../components/app/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="dashboard-main">
                {children}
            </main>
            <style jsx global>{`
                .dashboard-wrapper {
                    display: flex;
                    min-height: 100vh;
                    background: var(--page-bg);
                    transition: background 0.3s ease;
                }

                .dashboard-main {
                    flex: 1;
                    margin-left: 280px;
                    padding: 2rem;
                    color: var(--text-primary);
                }

                /* Dark mode (default) */
                :root {
                    --page-bg: #000000;
                    --text-primary: #ffffff;
                    --text-secondary: #94a3b8;
                }

                /* Light mode */
                :root.light {
                    --page-bg: #f8fafc;
                    --text-primary: #1e293b;
                    --text-secondary: #64748b;
                }

                :root.light .dashboard-main {
                    background: #f8fafc;
                }
            `}</style>
        </div>
    );
}

