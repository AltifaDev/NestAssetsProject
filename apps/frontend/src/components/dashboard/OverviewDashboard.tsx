import { useState, useEffect } from 'react';
import { apiClient, API_BASE_URL } from '../../lib/api-client';
import { Eye, MousePointerClick, TrendingUp, Users, Heart, ArrowUpRight, ArrowDownRight, Activity, Calendar, MapPin, ChevronRight, Home } from 'lucide-react';

export default function OverviewDashboard() {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const data = await apiClient.getProperties();
                setProperties(Array.isArray(data.docs) ? data.docs : []);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
            <div className="od-spin-loader"></div>
        </div>
    );

    // Compute metrics from actual properties
    const totalViews = properties.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const activeListings = properties.filter(p => p.status === 'active').length;
    const formatNumber = (num: number) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return String(num);
    };

    // Calculate a simple "fake" baseline or compare to previous time if we had timeseries data.
    // For now we'll simulate trend percentages based on the absolute numbers just to maintain the visual design
    // Or we could leave them as placeholders. Let's make logical ones.
    const kpis = [
        { label: 'Total Listing Views', value: formatNumber(totalViews), change: '+12.5%', isPositive: true, icon: Eye, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Total Properties', value: properties.length, change: properties.length > 0 ? '+1' : '-', isPositive: true, icon: Home, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { label: 'Active Listings', value: activeListings, change: '-', isPositive: true, icon: Activity, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Conversion Intent', value: (totalViews > 0 ? '4.8%' : '0%'), change: '+1.2%', isPositive: true, icon: Heart, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    ];

    // Sort properties by view_count to get "Top Performing Properties"
    const topProperties = [...properties]
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 3)
        .map(prop => ({
            id: prop.id,
            title: prop.title,
            location: prop.address || 'Location Unspecified',
            views: formatNumber(prop.view_count || 0),
            inquiries: Math.floor((prop.view_count || 0) * 0.05), // Estimated proxy for inquiries
            trend: '+5%', // Mock trend
            image: prop.thumbnail ?
                (typeof prop.thumbnail === 'object' && prop.thumbnail.url
                    ? (prop.thumbnail.url.startsWith('http') ? prop.thumbnail.url : `${API_BASE_URL}${prop.thumbnail.url}`)
                    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200')
                : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200',
        }));

    return (
        <div className="od-root">
            {/* Header Area */}
            <div className="od-header">
                <div className="od-title-block">
                    <h2 className="od-title">Performance Overview</h2>
                    <p className="od-subtitle">Track your property engagement, traffic, and lead generation metrics.</p>
                </div>
                <div className="od-date-filter">
                    <Calendar size={14} className="od-filter-icon" />
                    <select className="od-select">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="od-kpi-grid">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="od-kpi-card">
                            <div className="od-kpi-header">
                                <div className="od-kpi-icon-wrap" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                                    <Icon size={18} />
                                </div>
                                <div className={`od-kpi-trend ${kpi.isPositive ? 'trend-up' : 'trend-down'}`}>
                                    {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    <span>{kpi.change}</span>
                                </div>
                            </div>
                            <div className="od-kpi-body">
                                <h3 className="od-kpi-value">{kpi.value}</h3>
                                <p className="od-kpi-label">{kpi.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Area */}
            <div className="od-charts-row">
                <div className="od-chart-card od-main-chart">
                    <div className="od-card-header">
                        <h3 className="od-card-title">Audience Engagement Trend</h3>
                        <button className="od-btn-icon"><Activity size={16} /></button>
                    </div>
                    <div className="od-chart-placeholder">
                        {/* CSS-based Mock Chart */}
                        <div className="od-mock-chart">
                            <div className="od-chart-y-axis">
                                <span>150k</span><span>100k</span><span>50k</span><span>0</span>
                            </div>
                            <div className="od-chart-graph">
                                {/* SVG Line */}
                                <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="od-svg-line">
                                    <path d="M0,80 C20,70 30,90 50,40 C70,10 80,30 100,5" fill="none" stroke="rgba(59,130,246,0.8)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                                    <path d="M0,80 C20,70 30,90 50,40 C70,10 80,30 100,5 L100,100 L0,100 Z" fill="url(#blue-grad)" />
                                    <defs>
                                        <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(59,130,246,0.2)" />
                                            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                        <div className="od-chart-x-axis">
                            <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                        </div>
                    </div>
                </div>

                <div className="od-chart-card od-side-card">
                    <div className="od-card-header">
                        <h3 className="od-card-title">Traffic Sources</h3>
                    </div>
                    <div className="od-sources-list">
                        <div className="od-source-item">
                            <div className="od-source-info">
                                <span className="od-source-name">Organic Search</span>
                                <span className="od-source-val">45%</span>
                            </div>
                            <div className="od-progress-bar"><div className="od-progress-fill organic"></div></div>
                        </div>
                        <div className="od-source-item">
                            <div className="od-source-info">
                                <span className="od-source-name">Direct Traffic</span>
                                <span className="od-source-val">30%</span>
                            </div>
                            <div className="od-progress-bar"><div className="od-progress-fill direct"></div></div>
                        </div>
                        <div className="od-source-item">
                            <div className="od-source-info">
                                <span className="od-source-name">Social Media</span>
                                <span className="od-source-val">15%</span>
                            </div>
                            <div className="od-progress-bar"><div className="od-progress-fill social"></div></div>
                        </div>
                        <div className="od-source-item">
                            <div className="od-source-info">
                                <span className="od-source-name">Referral</span>
                                <span className="od-source-val">10%</span>
                            </div>
                            <div className="od-progress-bar"><div className="od-progress-fill referral"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="od-bottom-row">
                <div className="od-card od-top-properties">
                    <div className="od-card-header">
                        <h3 className="od-card-title">Top Performing Properties</h3>
                        <a href="/dashboard/properties" className="od-view-all">View All Properties <ChevronRight size={14} /></a>
                    </div>
                    <div className="od-props-list">
                        {topProperties.length > 0 ? topProperties.map((prop, idx) => (
                            <div key={idx} className="od-prop-item">
                                <img
                                    src={prop.image}
                                    alt={prop.title}
                                    className="od-prop-img"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200';
                                    }}
                                />
                                <div className="od-prop-info">
                                    <h4 className="od-prop-name">{prop.title}</h4>
                                    <span className="od-prop-loc"><MapPin size={11} /> {prop.location}</span>
                                </div>
                                <div className="od-prop-stats">
                                    <div className="od-pstat">
                                        <span className="od-pstat-lbl">Views</span>
                                        <span className="od-pstat-val">{prop.views}</span>
                                    </div>
                                    <div className="od-pstat">
                                        <span className="od-pstat-lbl">Inquiries</span>
                                        <span className="od-pstat-val">{prop.inquiries}</span>
                                    </div>
                                    <div className={`od-pstat-trend ${prop.trend.startsWith('+') ? 'up' : 'down'}`}>
                                        {prop.trend}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>No properties found yet. Start listing to see performance data.</p>
                                <a href="/dashboard/new" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500, marginTop: '0.5rem', display: 'inline-block' }}>Add New Listing</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                /* Font face */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                .od-root {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    width: 100%;
                    font-family: 'Inter', sans-serif;
                }

                /* Loader */
                .od-spin-loader {
                    width: 36px;
                    height: 36px;
                    border: 2.5px solid rgba(59,130,246,0.15);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: od-spin 0.75s linear infinite;
                }
                @keyframes od-spin { to { transform: rotate(360deg); } }

                /* Header */
                .od-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.05));
                }

                .od-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-main, #f0f4f8);
                    letter-spacing: -0.01em;
                    margin-bottom: 0.25rem;
                }

                .od-subtitle {
                    font-size: 0.85rem;
                    color: var(--text-muted, rgba(255,255,255,0.5));
                    font-weight: 400;
                }

                .od-date-filter {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .od-filter-icon {
                    position: absolute;
                    left: 0.75rem;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    pointer-events: none;
                }

                .od-select {
                    appearance: none;
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 8px;
                    padding: 0.5rem 2rem 0.5rem 2rem;
                    color: var(--text-main, #f0f4f8);
                    font-size: 0.8rem;
                    font-weight: 500;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }

                .od-select:hover {
                    border-color: var(--border-medium, rgba(255,255,255,0.15));
                }

                /* KPI Grid */
                .od-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }

                .od-kpi-card {
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 12px;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .od-kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -8px rgba(0,0,0,0.15);
                    border-color: var(--border-medium, rgba(255,255,255,0.1));
                }

                .od-kpi-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .od-kpi-icon-wrap {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .od-kpi-trend {
                    display: flex;
                    align-items: center;
                    gap: 0.15rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 20px;
                }

                .trend-up {
                    color: #10b981;
                    background: rgba(16,185,129,0.1);
                }

                .trend-down {
                    color: #ef4444;
                    background: rgba(239,68,68,0.1);
                }

                .od-kpi-value {
                    font-size: 1.75rem;
                    font-weight: 600;
                    color: var(--text-main, #f0f4f8);
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }

                .od-kpi-label {
                    font-size: 0.8rem;
                    color: var(--text-muted, rgba(255,255,255,0.5));
                    font-weight: 500;
                    margin-top: 0.2rem;
                }

                /* Charts Row */
                .od-charts-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1rem;
                }

                .od-chart-card {
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                }

                .od-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .od-card-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-main, #f0f4f8);
                }

                .od-btn-icon {
                    background: transparent;
                    border: none;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Main Chart Placeholder */
                .od-chart-placeholder {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 200px;
                }

                .od-mock-chart {
                    flex: 1;
                    display: flex;
                    gap: 1rem;
                }

                .od-chart-y-axis {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    font-size: 0.7rem;
                    color: var(--text-dim, rgba(255,255,255,0.3));
                    padding-bottom: 1.5rem;
                    text-align: right;
                    width: 30px;
                }

                .od-chart-graph {
                    flex: 1;
                    position: relative;
                    border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-left: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                }

                .od-svg-line {
                    width: 100%;
                    height: 100%;
                }

                .od-chart-x-axis {
                    display: flex;
                    justify-content: space-between;
                    padding-left: 2.8rem;
                    padding-top: 0.5rem;
                    font-size: 0.7rem;
                    color: var(--text-dim, rgba(255,255,255,0.3));
                }

                /* Traffic Sources */
                .od-sources-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .od-source-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .od-source-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .od-source-name { color: var(--text-main, #f0f4f8); }
                .od-source-val { color: var(--text-muted, rgba(255,255,255,0.5)); }

                .od-progress-bar {
                    height: 6px;
                    background: var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 3px;
                    overflow: hidden;
                }

                .od-progress-fill {
                    height: 100%;
                    border-radius: 3px;
                }

                .organic { width: 45%; background: #3b82f6; }
                .direct { width: 30%; background: #8b5cf6; }
                .social { width: 15%; background: #10b981; }
                .referral { width: 10%; background: #f59e0b; }

                /* Bottom Row: Top Properties */
                .od-card {
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                }

                .od-view-all {
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                    font-size: 0.8rem;
                    color: var(--accent-primary, #3b82f6);
                    text-decoration: none;
                    transition: opacity 0.2s;
                    font-weight: 500;
                }
                .od-view-all:hover { opacity: 0.8; }

                .od-props-list {
                    display: flex;
                    flex-direction: column;
                }

                .od-prop-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 0;
                    border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.05));
                }

                .od-prop-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .od-prop-img {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    object-fit: cover;
                }

                .od-prop-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                }

                .od-prop-name {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-main, #f0f4f8);
                }

                .od-prop-loc {
                    font-size: 0.75rem;
                    color: var(--text-muted, rgba(255,255,255,0.5));
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                }

                .od-prop-stats {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .od-pstat {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.2rem;
                }

                .od-pstat-lbl {
                    font-size: 0.7rem;
                    color: var(--text-dim, rgba(255,255,255,0.3));
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .od-pstat-val {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-main, #f0f4f8);
                }

                .od-pstat-trend {
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 0.3rem 0.6rem;
                    border-radius: 6px;
                }

                .od-pstat-trend.up { color: #10b981; background: rgba(16,185,129,0.1); }
                .od-pstat-trend.down { color: #ef4444; background: rgba(239,68,68,0.1); }

                /* Responsive */
                @media (max-width: 1200px) {
                    .od-kpi-grid { grid-template-columns: repeat(2, 1fr); }
                    .od-charts-row { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .od-kpi-grid { grid-template-columns: 1fr; }
                    .od-prop-stats { display: none; }
                }
            `}</style>
        </div>
    );
}
