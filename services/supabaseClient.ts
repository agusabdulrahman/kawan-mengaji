import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://pwjsypfxepuedelurjjg.supabase.co';
export const supabaseAnonKey = 'sb_publishable_1V6t_35XiQyjYOV84NSLoA_UdpsM-2s';
// export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pwjsypfxepuedelurjjg.supabase.co';
// export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1V6t_35XiQyjYOV84NSLoA_UdpsM-2s';

export function createSupabaseClient(accessToken?: () => Promise<string | null>) {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    accessToken
      ? {
          accessToken,
        }
      : undefined,
  );
}
