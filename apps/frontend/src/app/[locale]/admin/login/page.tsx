"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    const MAX_ATTEMPTS = 3;
    const LOCKOUT_TIME = 300000; // 5 minutes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLocked) {
            setError('บัญชีถูกล็อคชั่วคราว กรุณารอ 5 นาที');
            return;
        }

        if (attempts >= MAX_ATTEMPTS) {
            setIsLocked(true);
            setError('พยายาม login เกินจำนวนครั้งที่กำหนด บัญชีถูกล็อคเป็นเวลา 5 นาที');
            setTimeout(() => {
                setIsLocked(false);
                setAttempts(0);
            }, LOCKOUT_TIME);
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await apiClient.login(email, password);
            
            // ตรวจสอบว่าเป็น admin หรือไม่
            if (response.user.role !== 'admin') {
                setError('⛔ คุณไม่มีสิทธิ์เข้าถึงระบบ Admin');
                setAttempts(prev => prev + 1);
                
                // Log unauthorized access attempt
                console.warn('Unauthorized admin access attempt:', {
                    email,
                    role: response.user.role,
                    timestamp: new Date().toISOString()
                });
                
                // Logout ทันที
                apiClient.logout();
                return;
            }

            // Log successful admin login
            console.log('Admin login successful:', {
                email: response.user.email,
                timestamp: new Date().toISOString()
            });

            // Redirect to admin dashboard
            router.push('/admin/dashboard');
        } catch (err: any) {
            setAttempts(prev => prev + 1);
            setError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            
            // Log failed login attempt
            console.warn('Failed admin login attempt:', {
                email,
                attempts: attempts + 1,
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
            
            <div className="relative w-full max-w-md">
                {/* Security Warning Banner */}
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-red-400 font-semibold mb-1">⚠️ ระบบจัดการแอดมิน</p>
                            <p className="text-red-300/80">
                                หน้านี้สำหรับผู้ดูแลระบบเท่านั้น การเข้าถึงโดยไม่ได้รับอนุญาตจะถูกบันทึกและดำเนินการตามกฎหมาย
                            </p>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-red-500/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Admin Login
                        </h1>
                        <p className="text-slate-400 text-sm">
                            ระบบจัดการแบ็คเอนด์
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                            {attempts > 0 && attempts < MAX_ATTEMPTS && (
                                <p className="text-red-300/60 text-xs mt-2">
                                    ความพยายามที่เหลือ: {MAX_ATTEMPTS - attempts} ครั้ง
                                </p>
                            )}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                                    placeholder="admin@example.com"
                                    required
                                    disabled={isLocked}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLocked}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                    disabled={isLocked}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || isLocked}
                            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    กำลังตรวจสอบ...
                                </span>
                            ) : isLocked ? (
                                'บัญชีถูกล็อค'
                            ) : (
                                'เข้าสู่ระบบ Admin'
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="flex items-start gap-2 text-xs text-slate-500">
                            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                การเข้าสู่ระบบนี้ได้รับการเข้ารหัสและบันทึกทุกครั้ง 
                                หากคุณไม่ใช่ผู้ดูแลระบบ กรุณาออกจากหน้านี้ทันที
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to Main Site */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-slate-400 hover:text-white text-sm transition"
                    >
                        ← กลับไปหน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    );
}
