import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowUpRight, TrendingUp,  } from "lucide-react";
import PerformanceChart from "../charts/PerformanceChart";

export default function DashboardView() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCommitted: 0,
        remainingCapital: 0,
        tvpi: 0,
        dpi: 0,
        distributions: 0,
        fundsCount: 0
    });

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    window.location.href = "/login";
                    return;
                }

                // Fetch Profile
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                setProfile(profileData || { full_name: user.email?.split('@')[0] });

                // Fetch Stats (Mock calculation from real holdings if any, else 0)
                // In a real app, this would be a complex query or a materialized view
                const { data: holdings } = await supabase
                    .from("portfolio_holdings")
                    .select("committed_amount, contributed_amount, current_value, distributions");

                if (holdings && holdings.length > 0) {
                    const totalCommitted = holdings.reduce((acc, h) => acc + (h.committed_amount || 0), 0);
                    const totalContributed = holdings.reduce((acc, h) => acc + (h.contributed_amount || 0), 0);
                    const totalValue = holdings.reduce((acc, h) => acc + (h.current_value || 0), 0);
                    const totalDistributions = holdings.reduce((acc, h) => acc + (h.distributions || 0), 0);

                    const tvpi = totalContributed > 0 ? (totalValue + totalDistributions) / totalContributed : 0;
                    const dpi = totalContributed > 0 ? totalDistributions / totalContributed : 0;

                    setStats({
                        totalCommitted,
                        remainingCapital: totalCommitted - totalContributed,
                        tvpi,
                        dpi,
                        distributions: totalDistributions,
                        fundsCount: holdings.length
                    });
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end mb-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Welcome back, {profile?.full_name || "Investor"} 👋
                    </h2>
                    <p className="text-slate-400">
                        Here's what's happening with your portfolio today.
                    </p>
                </div>
                <div className="text-sm text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Total Committed"
                    value={`$${stats.totalCommitted.toLocaleString()}`}
                    trend="+12.5%"
                    trendType="positive"
                    footer={`Across ${stats.fundsCount} Funds`}
                />
                <StatCard
                    label="Remaining Capital"
                    value={`$${stats.remainingCapital.toLocaleString()}`}
                    trend="0.0%"
                    trendType="neutral"
                    footer="Available for call"
                />
                <StatCard
                    label="Net Multiple (TVPI)"
                    value={`${stats.tvpi.toFixed(2)}x`}
                    trend="+0.4x"
                    trendType="positive"
                    footer="Target: 2.0x"
                />
                <StatCard
                    label="Distributions (DPI)"
                    value={`${stats.dpi.toFixed(2)}x`}
                    footer={`$${stats.distributions.toLocaleString()} Returned`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
                        <select className="bg-[#020617] border border-[#1E293B] text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                            <option>YTD</option>
                            <option>1Y</option>
                            <option>3Y</option>
                            <option>All</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full bg-slate-900/20 rounded-xl overflow-hidden relative border border-white/5">
                        <PerformanceChart />
                    </div>
                </div>

                <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        <ActivityItem
                            type="call"
                            title="Capital Call: Fund IV"
                            description="Called 15% of commitment"
                            amount="-$150,000"
                            date="2 days ago"
                        />
                        <ActivityItem
                            type="dist"
                            title="Distribution: Fund II"
                            description="Proceeds from Project Alpha exit"
                            amount="+$45,200"
                            date="1 week ago"
                            isPositive
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, trendType = "neutral", footer }: any) {
    return (
        <div className="bg-[#0F172A] border border-[#1E293B] p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-200">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-slate-400 font-medium">{label}</span>
                {trend && (
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${trendType === "positive"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-slate-500/10 text-slate-400"
                            }`}
                    >
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            {footer && <div className="text-sm text-slate-500">{footer}</div>}
        </div>
    );
}

function ActivityItem({ type, title, description, amount, date, isPositive }: any) {
    return (
        <div className="flex items-center gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${type === "call"
                    ? "bg-red-500/10 border border-red-500/20 text-red-500"
                    : "bg-green-500/10 border border-green-500/20 text-green-500"
                    }`}
            >
                {type === "call" ? <ArrowUpRight size={18} /> : <TrendingUp size={18} />}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
                <p className="text-xs text-slate-400 truncate">{description}</p>
            </div>
            <div className="text-right">
                <span
                    className={`block text-sm font-semibold ${isPositive ? "text-green-400" : "text-white"
                        }`}
                >
                    {amount}
                </span>
                <span className="text-xs text-slate-500">{date}</span>
            </div>
        </div>
    );
}
