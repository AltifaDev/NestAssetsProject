import { useEffect, useState } from 'react';
import { apiClient, API_BASE_URL } from '../../lib/api-client';
import { Home, Plus, Edit2, Trash2, MapPin, Eye, TrendingUp, Clock, Filter, Search, BedDouble, Bath, Ruler } from 'lucide-react';

interface PropertyListProps {
    variant?: 'overview' | 'properties';
}

export default function PropertyList({ variant = 'overview' }: PropertyListProps) {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            const data = await apiClient.getProperties();
            setProperties(Array.isArray(data.docs) ? data.docs : []);
        } catch (error) {
            console.error('Failed to load properties', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            await apiClient.deleteProperty(id);
            setProperties(properties.filter(p => p.id !== id));
        } catch (error) {
            alert('Unable to delete listing.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem' }}>
            <div className="pl-spin-loader"></div>
        </div>
    );

    // Compute real stats from property data
    const totalViews = properties.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0);
    const pendingCount = properties.filter((p: any) => p.status === 'pending').length;
    const activeCount = properties.filter((p: any) => p.status === 'active').length;
    const clickRate = totalViews > 0 && properties.length > 0
        ? ((activeCount / properties.length) * 100).toFixed(1)
        : '0.0';

    const stats = [
        {
            label: 'Total Listings',
            val: String(properties.length),
            sub: 'ALL LISTINGS',
            icon: Home,
            accent: '#3b82f6',
            accentBg: 'rgba(59,130,246,0.1)',
            accentGlow: 'rgba(59,130,246,0.15)',
        },
        {
            label: 'Total Views',
            val: totalViews.toLocaleString(),
            sub: 'TOTAL VIEWS',
            icon: Eye,
            accent: '#8b5cf6',
            accentBg: 'rgba(139,92,246,0.1)',
            accentGlow: 'rgba(139,92,246,0.15)',
        },
        {
            label: 'Active Rate',
            val: `${clickRate}%`,
            sub: 'ACTIVE LISTINGS',
            icon: TrendingUp,
            accent: '#10b981',
            accentBg: 'rgba(16,185,129,0.1)',
            accentGlow: 'rgba(16,185,129,0.15)',
        },
        {
            label: 'Pending Review',
            val: String(pendingCount),
            sub: 'PENDING REVIEW',
            icon: Clock,
            accent: '#f59e0b',
            accentBg: 'rgba(245,158,11,0.1)',
            accentGlow: 'rgba(245,158,11,0.15)',
        },
    ];

    const displayProperties = variant === 'overview' ? properties.slice(0, 4) : properties;

    return (
        <div className="pl-root">
            {/* ── Stats Row (Only on Overview) ── */}
            {variant === 'overview' && (
                <div className="pl-stats-grid">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="pl-stat-card" style={{ '--stat-accent': stat.accent, '--stat-bg': stat.accentBg, '--stat-glow': stat.accentGlow } as any}>
                                <div className="pl-stat-header">
                                    <div className="pl-stat-icon">
                                        <Icon size={17} />
                                    </div>
                                    <span className="pl-stat-sub">{stat.sub}</span>
                                </div>
                                <div className="pl-stat-value">{stat.val}</div>
                                <div className="pl-stat-label">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Section Header ── */}
            <div className="pl-section-header">
                <div className="pl-section-title-block">
                    <h2 className="pl-section-title">
                        {variant === 'overview' ? 'Recent Listings' : 'Property Portfolio'}
                    </h2>
                    <p className="pl-section-sub">
                        {variant === 'overview'
                            ? 'A quick glance at your latest property listings.'
                            : 'Manage your property listings with Asia-Pacific\'s professional management system.'}
                    </p>
                </div>
                <div className="pl-controls">
                    {variant === 'properties' && (
                        <>
                            <div className="pl-search-wrap">
                                <Search size={14} className="pl-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name / ID..."
                                    className="pl-search-input"
                                />
                            </div>
                            <button className="pl-filter-btn" title="Filter">
                                <Filter size={16} />
                            </button>
                        </>
                    )}
                    {variant === 'overview' && properties.length > 4 && (
                        <a href="/dashboard/properties" className="pl-add-btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-main)', boxShadow: 'none' }}>
                            <span>View All</span>
                        </a>
                    )}
                    <a href="/dashboard/properties/new" className="pl-add-btn">
                        <Plus size={15} />
                        <span>Add New Listing</span>
                    </a>
                </div>
            </div>

            {/* ── Properties Display ── */}
            {variant === 'overview' ? (
                <div className="pl-props-grid">
                    {displayProperties.length === 0 ? (
                        <div className="pl-empty">
                            <div className="pl-empty-icon-wrap">
                                <Home size={28} className="pl-empty-icon" />
                            </div>
                            <h3 className="pl-empty-title">No listings in your portfolio yet</h3>
                            <p className="pl-empty-sub">
                                Start creating your first property listing to present via the Nest of Assets system.
                            </p>
                            <a href="/dashboard/properties/new" className="pl-empty-cta">Start Listing Now</a>
                        </div>
                    ) : (
                        displayProperties.map((prop) => (
                            <div key={prop.id} className="pl-prop-card">
                                <div className="pl-prop-thumb">
                                    {prop.thumbnail ? (
                                        <img
                                            src={typeof prop.thumbnail === 'object' && prop.thumbnail.url
                                                ? (prop.thumbnail.url.startsWith('http') ? prop.thumbnail.url : `${API_BASE_URL}${prop.thumbnail.url}`)
                                                : (typeof prop.thumbnail === 'string' && prop.thumbnail.startsWith('http') ? prop.thumbnail : `${API_BASE_URL}${prop.thumbnail}`)}
                                            alt={prop.title}
                                            className="pl-prop-img"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600';
                                            }}
                                        />
                                    ) : (
                                        <div className="pl-prop-placeholder">
                                            <Home size={32} />
                                        </div>
                                    )}
                                    <div className="pl-prop-badges">
                                        <span className="pl-badge pl-badge-type">
                                            {prop.listingType === 'sale' ? 'Sale' : 'Rent'}
                                        </span>
                                        <span className={`pl-badge ${prop.status === 'active' ? 'pl-badge-active' : 'pl-badge-pending'}`}>
                                            {prop.status === 'active' ? 'Online' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div className="pl-prop-body">
                                    <div className="pl-prop-meta">
                                        <h3 className="pl-prop-title">{prop.title}</h3>
                                        <span className="pl-prop-id">#{String(prop.id).slice(-4)}</span>
                                    </div>
                                    {prop.project_name && (
                                        <p className="pl-prop-project">{prop.project_name}</p>
                                    )}
                                    <p className="pl-prop-addr">
                                        <MapPin size={11} />
                                        <span>{prop.address}</span>
                                    </p>
                                    <div className="pl-prop-specs">
                                        {prop.stats?.bedrooms != null && (
                                            <span className="pl-spec"><BedDouble size={12} /> {prop.stats.bedrooms}</span>
                                        )}
                                        {prop.stats?.bathrooms != null && (
                                            <span className="pl-spec"><Bath size={12} /> {prop.stats.bathrooms}</span>
                                        )}
                                        {prop.stats?.livingArea != null && (
                                            <span className="pl-spec"><Ruler size={12} /> {prop.stats.livingArea} sqm</span>
                                        )}
                                        {(prop.view_count != null && prop.view_count > 0) && (
                                            <span className="pl-spec pl-spec-views"><Eye size={12} /> {prop.view_count.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <div className="pl-prop-footer">
                                        <div>
                                            <p className="pl-price-label">Investment</p>
                                            <div className="pl-price">
                                                <span>฿{prop.price?.toLocaleString()}</span>
                                                {prop.listingType === 'rent' && <span className="pl-price-unit">/mo</span>}
                                            </div>
                                        </div>
                                        <div className="pl-prop-actions">
                                            <a href={`/dashboard/edit/${prop.id}`} className="pl-action-btn pl-edit-btn" title="Edit">
                                                <Edit2 size={13} />
                                            </a>
                                            <button onClick={() => handleDelete(prop.id)} className="pl-action-btn pl-delete-btn" title="Delete">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="pl-table-wrapper">
                    {displayProperties.length === 0 ? (
                        <div className="pl-empty">
                            <div className="pl-empty-icon-wrap"><Home size={28} className="pl-empty-icon" /></div>
                            <h3 className="pl-empty-title">No listings in your portfolio yet</h3>
                            <p className="pl-empty-sub">Start creating your first property listing to present via the Nest of Assets system.</p>
                            <a href="/dashboard/properties/new" className="pl-empty-cta">Start Listing Now</a>
                        </div>
                    ) : (
                        <table className="pl-table">
                            <thead>
                                <tr>
                                    <th>Listing Details</th>
                                    <th>Location</th>
                                    <th>Status / Type</th>
                                    <th>Specs</th>
                                    <th>Price</th>
                                    <th>Views</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayProperties.map((prop) => (
                                    <tr key={prop.id}>
                                        <td>
                                            <div className="plt-listing">
                                                <div className="plt-thumb">
                                                    {prop.thumbnail ? (
                                                        <img
                                                            src={typeof prop.thumbnail === 'object' && prop.thumbnail.url
                                                                ? (prop.thumbnail.url.startsWith('http') ? prop.thumbnail.url : `${API_BASE_URL}${prop.thumbnail.url}`)
                                                                : (typeof prop.thumbnail === 'string' && prop.thumbnail.startsWith('http') ? prop.thumbnail : `${API_BASE_URL}${prop.thumbnail}`)}
                                                            alt={prop.title}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200'; }}
                                                        />
                                                    ) : (
                                                        <div className="plt-placeholder"><Home size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="plt-info">
                                                    <div className="plt-title" title={prop.title}>{prop.title}</div>
                                                    <div className="plt-id">#{String(prop.id).slice(-4)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="plt-loc" title={prop.address}>
                                                <MapPin size={11} /><span>{prop.address || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="plt-status-col">
                                                <span className={`pl-badge ${prop.status === 'active' ? 'pl-badge-active' : 'pl-badge-pending'}`}>
                                                    {prop.status === 'active' ? 'Online' : 'Pending'}
                                                </span>
                                                <span className="pl-badge pl-badge-type">
                                                    {prop.listingType === 'sale' ? 'Sale' : 'Rent'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="plt-specs">
                                                <span><BedDouble size={12} /> {prop.stats?.bedrooms || '-'}</span>
                                                <span><Bath size={12} /> {prop.stats?.bathrooms || '-'}</span>
                                                <span><Ruler size={12} /> {prop.stats?.livingArea || '-'}m²</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="plt-price">
                                                ฿{prop.price?.toLocaleString() || '-'}
                                                {prop.listingType === 'rent' && <span className="plt-price-unit">/mo</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="plt-views">
                                                <Eye size={12} /> {prop.view_count?.toLocaleString() || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="plt-actions" style={{ justifyContent: 'flex-end' }}>
                                                <a href={`/dashboard/edit/${prop.id}`} className="pl-action-btn pl-edit-btn" title="Edit">
                                                    <Edit2 size={13} />
                                                </a>
                                                <button onClick={() => handleDelete(prop.id)} className="pl-action-btn pl-delete-btn" title="Delete">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <style>{`
                /* ─── Root ─── */
                .pl-root {
                    display: flex;
                    flex-direction: column;
                    gap: 1.75rem;
                    width: 100%;
                    min-width: 0;
                    box-sizing: border-box;
                }

                /* ─── Loader ─── */
                .pl-spin-loader {
                    width: 36px;
                    height: 36px;
                    border: 2.5px solid rgba(59,130,246,0.15);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: pl-spin 0.75s linear infinite;
                }
                @keyframes pl-spin { to { transform: rotate(360deg); } }

                /* ─── Stats Grid ─── */
                .pl-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    width: 100%;
                    min-width: 0;
                    box-sizing: border-box;
                }

                .pl-stat-card {
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 14px;
                    padding: 1.25rem 1.25rem 1.125rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.625rem;
                    min-width: 0;
                    overflow: hidden;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                    position: relative;
                }

                .pl-stat-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 14px;
                    background: linear-gradient(135deg, var(--stat-glow, transparent) 0%, transparent 60%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .pl-stat-card:hover {
                    border-color: var(--border-medium, rgba(255,255,255,0.1));
                    box-shadow: 0 6px 20px -6px rgba(0,0,0,0.15);
                }

                .pl-stat-card:hover::before {
                    opacity: 1;
                }

                .pl-stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                }

                .pl-stat-icon {
                    width: 34px;
                    height: 34px;
                    min-width: 34px;
                    border-radius: 9px;
                    background: var(--stat-bg, rgba(59,130,246,0.1));
                    color: var(--stat-accent, #3b82f6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pl-stat-sub {
                    font-size: 8.5px;
                    font-weight: 700;
                    color: var(--text-dim, rgba(255,255,255,0.2));
                    letter-spacing: 0.1em;
                    text-align: right;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: calc(100% - 42px);
                }

                .pl-stat-value {
                    font-size: 1.875rem;
                    font-weight: 300;
                    letter-spacing: -0.03em;
                    color: var(--text-main, #f0f4f8);
                    line-height: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pl-stat-label {
                    font-size: 0.775rem;
                    font-weight: 400;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* ─── Section Header ─── */
                .pl-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 1.25rem;
                    padding-top: 0.25rem;
                    border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.05));
                    flex-wrap: wrap;
                    min-width: 0;
                }

                .pl-section-title-block {
                    min-width: 0;
                }

                .pl-section-title {
                    font-size: 1.5rem;
                    font-weight: 300;
                    letter-spacing: -0.02em;
                    color: var(--text-main, #f0f4f8);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pl-section-sub {
                    font-size: 0.775rem;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    margin-top: 0.2rem;
                    font-weight: 300;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pl-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }

                .pl-search-wrap {
                    position: relative;
                    flex-shrink: 0;
                }

                .pl-search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-dim, rgba(255,255,255,0.2));
                    pointer-events: none;
                }

                .pl-search-input {
                    background: var(--bg-glass, rgba(255,255,255,0.03));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 9px;
                    padding: 0.55rem 0.875rem 0.55rem 2.25rem;
                    font-size: 0.8rem;
                    font-weight: 300;
                    color: var(--text-main, #f0f4f8);
                    outline: none;
                    transition: border-color 0.2s ease;
                    width: 200px;
                    font-family: inherit;
                }

                .pl-search-input::placeholder {
                    color: var(--text-dim, rgba(255,255,255,0.2));
                }

                .pl-search-input:focus {
                    border-color: var(--accent-primary, #3b82f6);
                }

                .pl-filter-btn {
                    width: 36px;
                    height: 36px;
                    background: var(--bg-glass, rgba(255,255,255,0.03));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .pl-filter-btn:hover {
                    color: var(--text-main, #f0f4f8);
                    border-color: var(--border-medium, rgba(255,255,255,0.1));
                }

                .pl-add-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: var(--accent-primary, #3b82f6);
                    color: white;
                    padding: 0.55rem 1.125rem;
                    border-radius: 9px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .pl-add-btn:hover {
                    box-shadow: 0 6px 18px -4px var(--accent-primary, #3b82f6);
                    transform: translateY(-1px);
                }

                /* ─── Properties Grid ─── */
                .pl-props-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1rem;
                    width: 100%;
                    min-width: 0;
                    box-sizing: border-box;
                }

                /* ─── Empty State ─── */
                .pl-empty {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    background: var(--bg-glass, rgba(255,255,255,0.02));
                    border: 1.5px dashed var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 16px;
                    text-align: center;
                    transition: border-color 0.25s ease;
                }

                .pl-empty:hover {
                    border-color: var(--border-medium, rgba(255,255,255,0.1));
                }

                .pl-empty-icon-wrap {
                    width: 64px;
                    height: 64px;
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }

                .pl-empty-icon {
                    color: var(--text-dim, rgba(255,255,255,0.2));
                }

                .pl-empty-title {
                    font-size: 1.125rem;
                    font-weight: 400;
                    color: var(--text-main, #f0f4f8);
                    margin-bottom: 0.5rem;
                }

                .pl-empty-sub {
                    font-size: 0.8rem;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    font-weight: 300;
                    line-height: 1.65;
                    max-width: 320px;
                    margin-bottom: 1.75rem;
                }

                .pl-empty-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: transparent;
                    border: 1px solid var(--border-medium, rgba(255,255,255,0.1));
                    color: var(--text-main, #f0f4f8);
                    padding: 0.625rem 1.375rem;
                    border-radius: 9px;
                    font-size: 0.825rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .pl-empty-cta:hover {
                    background: var(--accent-primary, #3b82f6);
                    border-color: var(--accent-primary, #3b82f6);
                    color: white;
                    box-shadow: 0 6px 18px -4px var(--accent-primary, #3b82f6);
                }

                /* ─── Property Card ─── */
                .pl-prop-card {
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 14px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
                    min-width: 0;
                }

                .pl-prop-card:hover {
                    border-color: var(--border-medium, rgba(255,255,255,0.1));
                    box-shadow: 0 12px 32px -8px rgba(0,0,0,0.2);
                    transform: translateY(-2px);
                }

                .pl-prop-thumb {
                    position: relative;
                    aspect-ratio: 16/9;
                    overflow: hidden;
                    background: var(--bg-glass, rgba(255,255,255,0.02));
                    flex-shrink: 0;
                }

                .pl-prop-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                    display: block;
                }

                .pl-prop-card:hover .pl-prop-img {
                    transform: scale(1.04);
                }

                .pl-prop-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-dim, rgba(255,255,255,0.2));
                }

                .pl-prop-badges {
                    position: absolute;
                    top: 0.625rem;
                    left: 0.625rem;
                    display: flex;
                    gap: 0.3rem;
                }

                .pl-badge {
                    padding: 0.175rem 0.55rem;
                    border-radius: 5px;
                    font-size: 9px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    backdrop-filter: blur(8px);
                    border: 1px solid;
                }

                .pl-badge-type {
                    background: rgba(0,0,0,0.45);
                    border-color: rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.9);
                }

                .pl-badge-active {
                    background: rgba(16,185,129,0.3);
                    border-color: rgba(16,185,129,0.25);
                    color: #6ee7b7;
                }

                .pl-badge-pending {
                    background: rgba(245,158,11,0.3);
                    border-color: rgba(245,158,11,0.25);
                    color: #fcd34d;
                }

                .pl-prop-body {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                    flex: 1;
                    min-width: 0;
                }

                .pl-prop-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.5rem;
                    min-width: 0;
                }

                .pl-prop-title {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text-main, #f0f4f8);
                    line-height: 1.4;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    min-width: 0;
                }

                .pl-prop-id {
                    font-size: 9px;
                    font-family: monospace;
                    color: var(--text-dim, rgba(255,255,255,0.2));
                    font-weight: 700;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .pl-prop-addr {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.75rem;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    font-weight: 300;
                    overflow: hidden;
                    min-width: 0;
                }

                .pl-prop-addr svg {
                    color: var(--accent-primary, #3b82f6);
                    flex-shrink: 0;
                }

                .pl-prop-addr span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .pl-prop-project {
                    font-size: 0.7rem;
                    color: var(--accent-primary, #3b82f6);
                    font-weight: 500;
                    opacity: 0.8;
                }

                .pl-prop-specs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding: 0.5rem 0 0.25rem;
                }

                .pl-spec {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.7rem;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    font-weight: 400;
                }

                .pl-spec svg {
                    color: var(--text-dim, rgba(255,255,255,0.25));
                }

                .pl-spec-views {
                    color: var(--accent-secondary, #8b5cf6);
                }
                .pl-spec-views svg {
                    color: var(--accent-secondary, #8b5cf6);
                }

                .pl-prop-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: auto;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.05));
                    min-width: 0;
                }

                .pl-price-label {
                    font-size: 8px;
                    font-weight: 700;
                    color: var(--text-dim, rgba(255,255,255,0.2));
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    margin-bottom: 0.2rem;
                }

                .pl-price {
                    display: flex;
                    align-items: baseline;
                    gap: 0.2rem;
                    font-size: 1.125rem;
                    font-weight: 300;
                    color: var(--text-main, #f0f4f8);
                    letter-spacing: -0.02em;
                    white-space: nowrap;
                }

                .pl-price-unit {
                    font-size: 0.7rem;
                    color: var(--text-dim, rgba(255,255,255,0.2));
                }

                .pl-prop-actions {
                    display: flex;
                    gap: 0.3rem;
                    flex-shrink: 0;
                }

                .pl-action-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-glass, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    cursor: pointer;
                    transition: all 0.18s ease;
                    text-decoration: none;
                }

                .pl-edit-btn {
                    color: var(--text-muted, rgba(255,255,255,0.4));
                }

                .pl-edit-btn:hover {
                    background: var(--accent-primary, #3b82f6);
                    border-color: var(--accent-primary, #3b82f6);
                    color: white;
                }

                .pl-delete-btn {
                    color: var(--text-dim, rgba(255,255,255,0.2));
                }

                .pl-delete-btn:hover {
                    background: rgba(239,68,68,0.12);
                    border-color: rgba(239,68,68,0.25);
                    color: #f87171;
                }

                /* ─── Table Layout ─── */
                .pl-table-wrapper {
                    width: 100%;
                    overflow-x: auto;
                    background: var(--bg-card, rgba(255,255,255,0.02));
                    border: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    border-radius: 14px;
                    /* Customize scrollbar */
                    scrollbar-width: thin;
                    scrollbar-color: var(--border-medium) transparent;
                }
                .pl-table-wrapper::-webkit-scrollbar {
                    height: 8px;
                }
                .pl-table-wrapper::-webkit-scrollbar-thumb {
                    background-color: var(--border-medium);
                    border-radius: 4px;
                }

                .pl-table {
                    width: 100%;
                    min-width: 900px;
                    border-collapse: collapse;
                    text-align: left;
                }

                .pl-table th {
                    padding: 1rem 1.25rem;
                    font-size: 0.725rem;
                    font-weight: 700;
                    color: var(--text-muted, rgba(255,255,255,0.4));
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                }

                .pl-table td {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
                    vertical-align: middle;
                }

                .pl-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .pl-table tbody tr {
                    transition: background 0.2s ease;
                }

                .pl-table tbody tr:hover {
                    background: var(--bg-glass, rgba(255,255,255,0.02));
                }
                
                .plt-listing {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .plt-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: var(--bg-glass);
                    flex-shrink: 0;
                    border: 1px solid var(--border-subtle);
                }
                
                .plt-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .plt-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                }

                .plt-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    max-width: 250px;
                }

                .plt-title {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--text-main);
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .plt-id {
                    font-size: 0.65rem;
                    font-family: monospace;
                    color: var(--text-dim);
                }

                .plt-loc {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .plt-loc svg {
                    color: var(--accent-primary);
                }
                .plt-loc span {
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .plt-status-col {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.4rem;
                }

                .plt-specs {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .plt-specs span {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .plt-specs svg {
                    color: var(--text-dim);
                }

                .plt-price {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-main);
                }
                .plt-price-unit {
                    font-size: 0.7rem;
                    color: var(--text-dim);
                    font-weight: 400;
                    margin-left: 2px;
                }

                .plt-views {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.75rem;
                    color: var(--accent-secondary);
                    font-weight: 500;
                }

                .plt-actions {
                    display: flex;
                    gap: 0.4rem;
                }

                /* ─── Responsive ─── */
                @media (max-width: 1400px) {
                    .pl-stats-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                @media (max-width: 1100px) {
                    .pl-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 900px) {
                    .pl-section-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .pl-controls {
                        width: 100%;
                        flex-wrap: wrap;
                    }
                    .pl-search-wrap {
                        flex: 1;
                    }
                    .pl-search-input {
                        width: 100%;
                    }
                    .pl-add-btn {
                        flex: 1;
                        justify-content: center;
                    }
                }

                @media (max-width: 600px) {
                    .pl-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }
                    .pl-stat-card {
                        padding: 1rem;
                    }
                    .pl-stat-value {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
