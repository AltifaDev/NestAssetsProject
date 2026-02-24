"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/api-client';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, User, Bell, Lock, Globe } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = apiClient.getUser();
            if (!currentUser) {
                router.push('/agent/login');
                return;
            }
            setUser(currentUser);
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

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-zinc-400">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="text-blue-400" size={20} />
                        <h2 className="text-xl font-semibold text-white">Account Information</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Name</label>
                            <input
                                type="text"
                                value={user?.name || ''}
                                readOnly
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Role</label>
                            <input
                                type="text"
                                value={user?.role || ''}
                                readOnly
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white capitalize"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="text-blue-400" size={20} />
                        <h2 className="text-xl font-semibold text-white">Notifications</h2>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between">
                            <span className="text-white">Email notifications</span>
                            <input type="checkbox" className="w-5 h-5" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-white">New lead alerts</span>
                            <input type="checkbox" className="w-5 h-5" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-white">Property view notifications</span>
                            <input type="checkbox" className="w-5 h-5" />
                        </label>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="text-blue-400" size={20} />
                        <h2 className="text-xl font-semibold text-white">Security</h2>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                        Change Password
                    </button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="text-blue-400" size={20} />
                        <h2 className="text-xl font-semibold text-white">Preferences</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Language</label>
                            <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                                <option>English</option>
                                <option>ไทย</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Timezone</label>
                            <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                                <option>Asia/Bangkok</option>
                                <option>UTC</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
