"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function NotificationBell() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close dropdown on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchRecentLeads = async () => {
            try {
                const user = apiClient.getUser();
                if (!user || user.role !== 'agent') return;

                let agentId = user.agent;
                if (typeof agentId === 'object' && agentId !== null) {
                    agentId = agentId.id;
                }

                const res = await fetch(`${API_BASE_URL}/api/leads?where[agent][equals]=${agentId}&sort=-createdAt&limit=5`);
                if (!res.ok) return;

                const data = await res.json();
                if (data && data.docs) {
                    setNotifications(data.docs);
                    // For demonstration, let's treat anything from today/yesterday as 'unread' or just assume the first 2 are new if it's new status
                    const newLeads = data.docs.filter((lead: any) => lead.status === 'new').length;
                    setUnreadCount(newLeads);
                }
            } catch (err) {
                console.error('Failed to fetch lead notifications', err);
            }
        };

        fetchRecentLeads();
        // In a real app we might poll every 30s or use real-time sockets
        const interval = setInterval(fetchRecentLeads, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const handleLeadClick = () => {
        setShowDropdown(false);
        // Usually we would navigate to the lead view or mark as read. Taking user to leads page for now
        window.location.href = '/dashboard/leads';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all relative shadow-sm"
                aria-label="Notifications"
            >
                <Bell size={18} strokeWidth={2.5} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 animate-pulse border border-white"></span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((lead: any, idx) => (
                                <div
                                    key={lead.id || idx}
                                    onClick={handleLeadClick}
                                    className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${lead.status === 'new' ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${lead.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            New Lead: {lead.name}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            {lead.message ? lead.message : 'Interested in a property'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1.5 flex justify-between items-center">
                                            <span>{formatTimeAgo(lead.createdAt)}</span>
                                            {lead.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-slate-400 text-sm">
                                No recent notifications
                            </div>
                        )}
                    </div>

                    <div className="p-2 bg-slate-50 border-t border-slate-100">
                        <button
                            onClick={handleLeadClick}
                            className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 p-2"
                        >
                            View all leads
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
