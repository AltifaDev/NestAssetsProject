import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Types matching your database schema
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string; // references auth.users
                    email: string;
                    full_name: string;
                    kyc_status: 'pending' | 'verified' | 'rejected';
                    role: 'investor' | 'admin' | 'fund_manager';
                    avatar_url?: string;
                    created_at: string;
                };
            };
            funds: {
                Row: {
                    id: string;
                    name: string;
                    description?: string;
                    vintage_year: number;
                    target_irr: number;
                    status: 'raising' | 'active' | 'liquidated';
                    total_commitment: number;
                };
            };
            portfolio_holdings: {
                Row: {
                    id: string;
                    investor_id: string;
                    fund_id: string;
                    committed_amount: number;
                    contributed_amount: number;
                    current_value: number;
                    distributions: number;
                    created_at: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    holding_id: string;
                    type: 'capital_call' | 'distribution' | 'fee';
                    amount: number;
                    transaction_date: string;
                    status: 'pending' | 'completed' | 'failed';
                    description?: string;
                };
            };
            documents: {
                Row: {
                    id: string;
                    title: string;
                    file_path: string;
                    type: 'report' | 'tax' | 'legal';
                    fund_id?: string;
                    investor_id?: string;
                    created_at: string;
                };
            };
        };
    };
};
