import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE_URL } from '../../lib/api-client';
import { TrendingUp, Users, Home, Eye, Loader2, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalProperties: 0,
        totalViews: 0,
        newLeads: 0,
        activeLeads: 0,
        conversionRate: 0,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            const user = apiClient.getUser();
            if (!user || user.role !== 'agent' || !user.agent) return;
            const agentId = typeof user.agent === 'object' ? user.agent.id : user.agent;

            try {
                // Fetch properties for views
                const propsRes = await fetch(`${API_BASE_URL}/api/properties?where[agent][equals]=${agentId}&limit=1000`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
                const propsData = await propsRes.json();
                const totalProps = propsData.totalDocs || 0;

                let totalViews = 0;
                if (propsData.docs) {
                    propsData.docs.forEach((p: any) => {
                        totalViews += p.view_count || 0;
                    });
                }

                // Fetch leads
                const leadsRes = await fetch(`${API_BASE_URL}/api/leads?where[agent][equals]=${agentId}&limit=1000`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                });
                const leadsData = await leadsRes.json();

                let newL = 0;
                let activeL = 0;
                let won = 0;

                if (leadsData.docs) {
                    leadsData.docs.forEach((l: any) => {
                        if (l.status === 'new') newL++;
                        if (['new', 'contacted', 'viewing', 'negotiating'].includes(l.status)) activeL++;
                        if (l.status === 'closed_won') won++;
                    });
                }

                const convRate = leadsData.totalDocs > 0 ? Math.round((won / leadsData.totalDocs) * 100) : 0;

                setMetrics({
                    totalProperties: totalProps,
                    totalViews,
                    newLeads: newL,
                    activeLeads: activeL,
                    conversionRate: convRate,
                });

            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="ana-loading"><Loader2 className="animate-spin" /> Loading Analytics Data...</div>;

    return (
        <div className="ana-container">
            <div className="ana-header">
                <div>
                    <h2 className="ana-title">Performance Analytics</h2>
                    <p className="ana-description">Monitor your property portfolio and lead engagement.</p>
                </div>
                <div className="ana-badge">
                    <Activity size={16} /> Data is calculated in real-time
                </div>
            </div>

            <div className="ana-grid">
                {/* Metric 1 */}
                <div className="ana-card">
                    <div className="ana-card-icon bg-blue-500/10 text-blue-500">
                        <Home size={22} />
                    </div>
                    <div className="ana-card-info">
                        <p className="ana-card-label">Active Properties</p>
                        <h3 className="ana-card-value">{metrics.totalProperties}</h3>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="ana-card">
                    <div className="ana-card-icon bg-purple-500/10 text-purple-500">
                        <Eye size={22} />
                    </div>
                    <div className="ana-card-info">
                        <p className="ana-card-label">Total Portfolio Views</p>
                        <div className="ana-value-row">
                            <h3 className="ana-card-value">{metrics.totalViews.toLocaleString()}</h3>
                            <span className="ana-trend positive"><ArrowUpRight size={14} /> 12%</span>
                        </div>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="ana-card">
                    <div className="ana-card-icon bg-yellow-500/10 text-yellow-500">
                        <Users size={22} />
                    </div>
                    <div className="ana-card-info">
                        <p className="ana-card-label">Active Leads</p>
                        <div className="ana-value-row">
                            <h3 className="ana-card-value">{metrics.activeLeads}</h3>
                            <span className="ana-badge-small">{metrics.newLeads} new</span>
                        </div>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="ana-card">
                    <div className="ana-card-icon bg-green-500/10 text-green-500">
                        <TrendingUp size={22} />
                    </div>
                    <div className="ana-card-info">
                        <p className="ana-card-label">Conversion Rate</p>
                        <div className="ana-value-row">
                            <h3 className="ana-card-value">{metrics.conversionRate}%</h3>
                            {metrics.conversionRate >= 10 ? (
                                <span className="ana-trend positive"><ArrowUpRight size={14} /> Good</span>
                            ) : (
                                <span className="ana-trend"><ArrowDownRight size={14} /> Avg</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for future graphs */}
            <div className="ana-charts-grid">
                <div className="ana-chart-card">
                    <h3 className="ana-chart-title">Views over time (Last 30 Days)</h3>
                    <div className="ana-chart-placeholder">
                        {/* CSS Bar Chart Simulation */}
                        <div className="ana-bar-wrapper"><div className="ana-bar" style={{ height: '30%' }}></div></div>
                        <div className="ana-bar-wrapper"><div className="ana-bar" style={{ height: '50%' }}></div></div>
                        <div className="ana-bar-wrapper"><div className="ana-bar" style={{ height: '40%' }}></div></div>
                        <div className="ana-bar-wrapper"><div className="ana-bar" style={{ height: '70%' }}></div></div>
                        <div className="ana-bar-wrapper"><div className="ana-bar" style={{ height: '60%' }}></div></div>
                        <div className="ana-bar-wrapper"><div className="ana-bar" style={{ height: '90%' }}></div></div>
                        <div className="ana-bar-wrapper"><div className="ana-bar" style={{ height: '80%' }}></div></div>
                    </div>
                </div>

                <div className="ana-chart-card">
                    <h3 className="ana-chart-title">Lead Sources</h3>
                    <div className="ana-chart-placeholder-circle">
                        <div className="ana-donut"></div>
                        <div className="ana-legend">
                            <div className="ana-legend-item"><span className="ana-dot p-blue"></span> Website</div>
                            <div className="ana-legend-item"><span className="ana-dot p-purple"></span> Social</div>
                            <div className="ana-legend-item"><span className="ana-dot p-yellow"></span> Referrals</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .ana-container { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 1200px; margin: 0 auto; }
                
                .ana-header { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 1rem; }
                .ana-title { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; }
                .ana-description { font-size: 0.85rem; color: var(--text-muted); }
                
                .ana-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.4rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 500; border: 1px solid rgba(16, 185, 129, 0.2); }
                .ana-loading { padding: 4rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-muted); }

                .ana-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
                
                .ana-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; }
                .ana-card:hover { transform: translateY(-2px); border-color: var(--border-medium); }
                
                .ana-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                
                .ana-card-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .ana-card-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
                .ana-value-row { display: flex; align-items: baseline; gap: 0.75rem; }
                .ana-card-value { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; line-height: 1; }
                
                .ana-trend { font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.1rem; color: var(--text-dim); }
                .ana-trend.positive { color: #10b981; }
                
                .ana-badge-small { font-size: 0.65rem; background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600; text-transform: uppercase; }

                .ana-charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin-top: 0.5rem; }
                @media (max-width: 768px) { .ana-charts-grid { grid-template-columns: 1fr; } }
                
                .ana-chart-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; }
                .ana-chart-title { font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 1.5rem; }
                
                .ana-chart-placeholder { height: 200px; display: flex; align-items: flex-end; justify-content: space-between; padding-top: 2rem; border-bottom: 1px solid var(--border-subtle); gap: 1rem; }
                .ana-bar-wrapper { flex: 1; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
                .ana-bar { width: 100%; max-width: 32px; background: linear-gradient(to top, rgba(59,130,246,0.2), rgba(59,130,246,0.8)); border-radius: 4px 4px 0 0; border: 1px solid rgba(59,130,246,0.5); border-bottom: none; transition: height 1s ease-out; }
                .ana-bar:hover { background: rgba(59,130,246,1); }

                .ana-chart-placeholder-circle { height: 200px; display: flex; align-items: center; justify-content: center; gap: 2rem; }
                .ana-donut { width: 120px; height: 120px; border-radius: 50%; border: 20px solid var(--border-subtle); border-top-color: #3b82f6; border-right-color: #8b5cf6; border-bottom-color: #eab308; transform: rotate(-45deg); }
                .ana-legend { display: flex; flex-direction: column; gap: 0.75rem; }
                .ana-legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
                .ana-dot { width: 10px; height: 10px; border-radius: 50%; }
                .p-blue { background: #3b82f6; }
                .p-purple { background: #8b5cf6; }
                .p-yellow { background: #eab308; }
            `}</style>
        </div>
    );
}
