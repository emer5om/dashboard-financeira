import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
    public: {
        Tables: {
            transactions: {
                Row: {
                    id: string;
                    date: string;
                    type: 'ads' | 'expense' | 'revenue';
                    amount: number;
                    category: string | null;
                    note: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    date: string;
                    type: 'ads' | 'expense' | 'revenue';
                    amount: number;
                    category?: string | null;
                    note?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    date?: string;
                    type?: 'ads' | 'expense' | 'revenue';
                    amount?: number;
                    category?: string | null;
                    note?: string | null;
                    created_at?: string;
                };
            };
        };
    };
};
