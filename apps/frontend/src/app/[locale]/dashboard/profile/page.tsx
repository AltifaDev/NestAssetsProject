"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/api-client';
import { useRouter } from 'next/navigation';
import AgentProfileForm from '../../../../components/dashboard/AgentProfileForm';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = apiClient.getUser();
            if (!currentUser) {
                router.push('/agent/login');
                return;
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return <AgentProfileForm />;
}
