"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import Header from '../../../../components/app/Header';
import Sidebar from '../../../../components/app/Sidebar';
import PropertyList from '../../../../components/dashboard/PropertyList';
import LeadsCRM from '../../../../components/dashboard/LeadsCRM';
import AnalyticsDashboard from '../../../../components/dashboard/AnalyticsDashboard';
import AgentProfileForm from '../../../../components/dashboard/AgentProfileForm';

type TabType = 'properties' | 'leads' | 'analytics' | 'profile';

export default function AgentDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('properties');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = apiClient.getUser();
                if (!currentUser) {
                    router.push('/agent/login');
                    return;
                }

                // Verify token is still valid
                const profile = await apiClient.getProfile();
                if (!profile) {
                    router.push('/agent/login');
                    return;
                }

                setUser(profile);
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/agent/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Header user={user} />
            <div className="flex">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userRole="agent" />
                <main className="flex-1 p-8 ml-64">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'properties' && <PropertyList />}
                        {activeTab === 'leads' && <LeadsCRM />}
                        {activeTab === 'analytics' && <AnalyticsDashboard />}
                        {activeTab === 'profile' && <AgentProfileForm />}
                    </div>
                </main>
            </div>
        </div>
    );
}
