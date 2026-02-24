"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, API_BASE_URL } from '../../../../lib/api-client';
import Header from '../../../../components/app/Header';
import Sidebar from '../../../../components/app/Sidebar';
import {
    Users, Building2, TrendingUp, Activity, Database, Server,
    Shield, UserPlus, Edit2, Trash2, Eye, CheckCircle,
    XCircle
} from 'lucide-react';

type TabType = 'overview' | 'agents' | 'properties' | 'reports';

interface SystemOverview {
    total_agents: number;
    total_properties: number;
    total_leads: number;
    active_agents: number;
}

interface AgentData {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    verified: boolean;
    created_at: string;
}

interface PropertyData {
    id: string;
    title: string;
    price: number;
    status: string;
    views_count: number;
    agent_id: string;
    created_at: string;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [user, setUser] = useState<any>(null);
    const [overview, setOverview] = useState<SystemOverview | null>(null);
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [properties, setProperties] = useState<PropertyData[]>([]);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = apiClient.getUser();
                if (!currentUser || currentUser.role !== 'admin') {
                    router.push('/admin/login');
                    return;
                }

                setUser(currentUser);
                await loadDashboardData();
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const loadDashboardData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Load overview
            const overviewRes = await fetch(`${API_BASE_URL}/api/admin/overview`, { headers });
            if (overviewRes.ok) {
                const data = await overviewRes.json();
                setOverview(data);
            }

            // Load agents
            const agentsRes = await fetch(`${API_BASE_URL}/api/agents`, { headers });
            if (agentsRes.ok) {
                const data = await agentsRes.json();
                setAgents(data);
            }

            // Load properties
            const propertiesRes = await fetch(`${API_BASE_URL}/api/properties`, { headers });
            if (propertiesRes.ok) {
                const data = await propertiesRes.json();
                setProperties(data.data || []);
            }

            // Load activities
            const activitiesRes = await fetch(`${API_BASE_URL}/api/admin/activities?limit=10`, { headers });
            if (activitiesRes.ok) {
                const data = await activitiesRes.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleDeleteAgent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agent?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                setAgents(agents.filter(a => a.id !== id));
                alert('Agent deleted successfully');
            }
        } catch (error) {
            alert('Failed to delete agent');
        }
    };

    const handleDeleteProperty = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;

        try {
            await apiClient.deleteProperty(id);
            setProperties(properties.filter(p => p.id !== id));
            alert('Property deleted successfully');
        } catch (error) {
            alert('Failed to delete property');
        }
    };

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
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} userRole="admin" />
                <main className="flex-1 p-8 ml-64 mt-16">
                    <div className="max-w-7xl mx-auto">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">System Administration</h1>
                                        <p className="text-slate-400 mt-2">Manage backend system and monitor performance</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-green-400 text-sm font-medium">System Online</span>
                                    </div>
                                </div>

                                {/* System Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        icon={<Database className="w-6 h-6" />}
                                        title="Database"
                                        value="Connected"
                                        subtitle="Supabase PostgreSQL"
                                        color="blue"
                                        status="online"
                                    />
                                    <StatCard
                                        icon={<Server className="w-6 h-6" />}
                                        title="API Server"
                                        value="Running"
                                        subtitle="NestJS Backend"
                                        color="green"
                                        status="online"
                                    />
                                    <StatCard
                                        icon={<Shield className="w-6 h-6" />}
                                        title="Security"
                                        value="Active"
                                        subtitle="JWT Authentication"
                                        color="purple"
                                        status="online"
                                    />
                                    <StatCard
                                        icon={<Activity className="w-6 h-6" />}
                                        title="Uptime"
                                        value="99.9%"
                                        subtitle="Last 30 days"
                                        color="orange"
                                        status="online"
                                    />
                                </div>

                                {/* Resource Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ResourceCard
                                        icon={<Users className="w-5 h-5" />}
                                        title="Total Agents"
                                        value={overview?.total_agents || 0}
                                        subtitle={`${overview?.active_agents || 0} active`}
                                        color="blue"
                                    />
                                    <ResourceCard
                                        icon={<Building2 className="w-5 h-5" />}
                                        title="Properties"
                                        value={overview?.total_properties || 0}
                                        subtitle="Listed properties"
                                        color="green"
                                    />
                                    <ResourceCard
                                        icon={<TrendingUp className="w-5 h-5" />}
                                        title="Leads"
                                        value={overview?.total_leads || 0}
                                        subtitle="Total leads"
                                        color="purple"
                                    />
                                    <ResourceCard
                                        icon={<Activity className="w-5 h-5" />}
                                        title="Active Rate"
                                        value={overview ? `${Math.round((overview.active_agents / overview.total_agents) * 100)}%` : '0%'}
                                        subtitle="Agent activity"
                                        color="orange"
                                    />
                                </div>

                                {/* Recent Activities */}
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Recent System Activities
                                    </h2>
                                    <div className="space-y-2">
                                        {activities.length > 0 ? (
                                            activities.map((activity, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                            <Activity className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white text-sm">{activity.action}</p>
                                                            <p className="text-slate-400 text-xs">{activity.entity_type}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-slate-500 text-xs">
                                                        {new Date(activity.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 text-center py-4">No recent activities</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Agents Tab */}
                        {activeTab === 'agents' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="text-3xl font-bold text-white">Agent Management</h1>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                                        <UserPlus className="w-4 h-4" />
                                        Add New Agent
                                    </button>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Agent</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Verified</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {agents.map((agent) => (
                                                <tr key={agent.id} className="hover:bg-slate-800/30">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                                {agent.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-white font-medium">{agent.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">{agent.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium capitalize">
                                                            {agent.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${agent.status === 'active'
                                                                ? 'bg-green-500/10 text-green-400'
                                                                : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            {agent.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {agent.verified ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-400" />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 hover:bg-slate-700 rounded-lg transition">
                                                                <Edit2 className="w-4 h-4 text-slate-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAgent(agent.id)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg transition"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Properties Tab */}
                        {activeTab === 'properties' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="text-3xl font-bold text-white">Property Management</h1>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Property</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Views</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {properties.map((property) => (
                                                <tr key={property.id} className="hover:bg-slate-800/30">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Building2 className="w-8 h-8 text-slate-600" />
                                                            <span className="text-white font-medium">{property.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        ฿{property.price?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${property.status === 'active'
                                                                ? 'bg-green-500/10 text-green-400'
                                                                : property.status === 'pending'
                                                                    ? 'bg-yellow-500/10 text-yellow-400'
                                                                    : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            {property.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-300">
                                                            <Eye className="w-4 h-4" />
                                                            {property.views_count || 0}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-2 hover:bg-slate-700 rounded-lg transition">
                                                                <Eye className="w-4 h-4 text-slate-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProperty(property.id)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg transition"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Reports Tab */}
                        {activeTab === 'reports' && (
                            <div className="space-y-6">
                                <h1 className="text-3xl font-bold text-white mb-6">System Reports</h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Agent Performance</h3>
                                        <p className="text-slate-400 mb-4">Generate detailed agent performance reports</p>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                                            Generate Report
                                        </button>
                                    </div>

                                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Property Analytics</h3>
                                        <p className="text-slate-400 mb-4">View property performance and trends</p>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                                            View Analytics
                                        </button>
                                    </div>

                                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">System Logs</h3>
                                        <p className="text-slate-400 mb-4">Access system activity logs</p>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                                            View Logs
                                        </button>
                                    </div>

                                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Database Backup</h3>
                                        <p className="text-slate-400 mb-4">Manage database backups</p>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                                            Manage Backups
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtitle, color, status }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
    status?: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                    {icon}
                </div>
                {status === 'online' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-slate-500 text-xs">{subtitle}</p>
        </div>
    );
}

function ResourceCard({ icon, title, value, subtitle, color }: {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    subtitle: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses: Record<string, string> = {
        blue: 'text-blue-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
        orange: 'text-orange-400',
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
                <div className={colorClasses[color]}>
                    {icon}
                </div>
                <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
    );
}
