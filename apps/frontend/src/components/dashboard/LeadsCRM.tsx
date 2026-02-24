import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE_URL } from '../../lib/api-client';
import { User, Mail, Phone, Clock, FileText, Loader2, MessageSquare, Briefcase } from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'contacted' | 'viewing' | 'negotiating' | 'closed_won' | 'closed_lost';
    source: string;
    createdAt: string;
    property?: { id: number; title: string };
}

export default function LeadsCRM() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const user = apiClient.getUser();
            if (!user || user.role !== 'agent' || !user.agent) return;
            const agentId = typeof user.agent === 'object' ? user.agent.id : user.agent;

            const response = await fetch(`${API_BASE_URL}/api/leads?where[agent][equals]=${agentId}&depth=1&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLeads(data.docs || []);
            }
        } catch (err) {
            console.error("Failed to fetch leads", err);
        } finally {
            setLoading(false);
        }
    };

    const updateLeadStatus = async (leadId: number, targetStatus: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${localStorage.getItem('payload_token')}`
                },
                body: JSON.stringify({ status: targetStatus })
            });

            if (response.ok) {
                setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: targetStatus as any } : lead));
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'contacted': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'viewing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'negotiating': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'closed_won': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'closed_lost': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new': return 'New Lead';
            case 'contacted': return 'Contacted';
            case 'viewing': return 'Viewing Arranged';
            case 'negotiating': return 'Negotiating';
            case 'closed_won': return 'Closed (Won)';
            case 'closed_lost': return 'Closed (Lost)';
            default: return status;
        }
    };

    const filteredLeads = leads.filter(lead => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['new', 'contacted', 'viewing', 'negotiating'].includes(lead.status);
        if (filter === 'closed') return ['closed_won', 'closed_lost'].includes(lead.status);
        return lead.status === filter;
    });

    if (loading) return <div className="lcrm-loading"><Loader2 className="animate-spin" /> Loading Leads...</div>;

    return (
        <div className="lcrm-container">
            <div className="lcrm-header">
                <div>
                    <h2 className="lcrm-title">Leads & CRM Pipeline</h2>
                    <p className="lcrm-description">Track your client inquiries and deal progress.</p>
                </div>
                <div className="lcrm-filters">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Leads</button>
                    <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
                    <button className={filter === 'closed' ? 'active' : ''} onClick={() => setFilter('closed')}>Closed</button>
                </div>
            </div>

            {filteredLeads.length === 0 ? (
                <div className="lcrm-empty">
                    <Briefcase size={40} className="lcrm-empty-icon" />
                    <p>No leads found in this category.</p>
                    <p className="lcrm-empty-sub">When clients contact you regarding properties, they will appear here.</p>
                </div>
            ) : (
                <div className="lcrm-grid">
                    {filteredLeads.map(lead => (
                        <div key={lead.id} className="lcrm-card">
                            <div className="lcrm-card-header">
                                <div className="lcrm-card-title">
                                    <User size={16} />
                                    <h3>{lead.name}</h3>
                                </div>
                                <span className={`lcrm-status-badge ${getStatusColor(lead.status)}`}>
                                    {getStatusLabel(lead.status)}
                                </span>
                            </div>

                            <div className="lcrm-card-body">
                                {(lead.email || lead.phone) && (
                                    <div className="lcrm-contact-info">
                                        {lead.email && <div className="lcrm-info-row"><Mail size={14} /> <span>{lead.email}</span></div>}
                                        {lead.phone && <div className="lcrm-info-row"><Phone size={14} /> <span>{lead.phone}</span></div>}
                                    </div>
                                )}

                                {lead.property && (
                                    <div className="lcrm-property-ref">
                                        <strong>Inquiry for:</strong> {lead.property.title}
                                    </div>
                                )}

                                {lead.message && (
                                    <div className="lcrm-message">
                                        <MessageSquare size={14} className="lcrm-msg-icon" />
                                        <p>{lead.message}</p>
                                    </div>
                                )}

                                <div className="lcrm-info-row lcrm-timestamp">
                                    <Clock size={12} />
                                    <span>Received {new Date(lead.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="lcrm-card-footer">
                                <select
                                    value={lead.status}
                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                    className="lcrm-status-select"
                                >
                                    <option value="new">Move to: New</option>
                                    <option value="contacted">Move to: Contacted</option>
                                    <option value="viewing">Move to: Viewing</option>
                                    <option value="negotiating">Move to: Negotiating</option>
                                    <option value="closed_won">Deal Won</option>
                                    <option value="closed_lost">Deal Lost</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .lcrm-container { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 1200px; margin: 0 auto; }
                .lcrm-header { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 1rem; }
                .lcrm-title { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem; }
                .lcrm-description { font-size: 0.85rem; color: var(--text-muted); }
                
                .lcrm-filters { display: flex; gap: 0.5rem; background: var(--bg-main); padding: 0.25rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
                .lcrm-filters button { background: transparent; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
                .lcrm-filters button:hover { color: var(--text-main); }
                .lcrm-filters button.active { background: var(--text-main); color: var(--bg-main); }

                .lcrm-loading { padding: 4rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--text-muted); }
                
                .lcrm-empty { padding: 5rem 2rem; background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--border-medium); text-align: center; color: var(--text-muted); }
                .lcrm-empty-icon { opacity: 0.3; margin-bottom: 1rem; }
                .lcrm-empty p { font-size: 1rem; font-weight: 500; color: var(--text-main); }
                .lcrm-empty .lcrm-empty-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem; font-weight: 400; }

                .lcrm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
                
                .lcrm-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
                .lcrm-card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.15); border-color: var(--border-medium); }

                .lcrm-card-header { padding: 1.25rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
                .lcrm-card-title { display: flex; align-items: center; gap: 0.5rem; color: var(--text-main); }
                .lcrm-card-title h3 { font-size: 1rem; font-weight: 600; margin: 0; line-height: 1.2; }
                .lcrm-status-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 99px; border: 1px solid; white-space: nowrap; }

                .lcrm-card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }
                
                .lcrm-contact-info { display: flex; flex-direction: column; gap: 0.4rem; background: var(--bg-main); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-subtle); }
                .lcrm-info-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-main); }
                .lcrm-info-row svg { color: var(--text-muted); }

                .lcrm-property-ref { font-size: 0.8rem; color: var(--text-main); background: rgba(59,130,246,0.1); padding: 0.5rem 0.75rem; border-radius: 6px; border-left: 3px solid var(--accent-primary); }
                .lcrm-property-ref strong { color: var(--accent-primary); font-weight: 600; }

                .lcrm-message { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; background: var(--bg-main); padding: 0.75rem; border-radius: 8px; position: relative; }
                .lcrm-msg-icon { position: absolute; top: 0.75rem; left: 0.75rem; opacity: 0.3; }
                .lcrm-message p { margin: 0; padding-left: 1.5rem; }

                .lcrm-timestamp { font-size: 0.75rem; color: var(--text-dim); margin-top: auto; }

                .lcrm-card-footer { padding: 0.75rem 1.25rem; background: var(--bg-main); border-top: 1px solid var(--border-subtle); }
                .lcrm-status-select { width: 100%; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-subtle); padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; cursor: pointer; }
                .lcrm-status-select:focus { outline: none; border-color: var(--accent-primary); }
            `}</style>
        </div>
    );
}
