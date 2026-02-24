"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
    user: any;
}

export default function Header({ user }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/50 border-b border-slate-800 backdrop-blur-xl z-50">
            <div className="h-full px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        N
                    </div>
                    <h1 className="text-xl font-bold text-white">Nest of Assets</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-64 pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            {user?.name?.substring(0, 2).toUpperCase() || 'AG'}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{user?.name || 'Agent'}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role || 'agent'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
