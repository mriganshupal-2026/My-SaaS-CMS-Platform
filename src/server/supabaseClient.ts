import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to load DB state from Supabase table 'viralmuse_state' synchronously (for serverless cold starts)
 */
export function fetchDbFromSupabaseSync(): any | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    const url = `${supabaseUrl}/rest/v1/viralmuse_state?key=eq.main_db`;
    const cmd = `curl -s -H "apikey: ${supabaseAnonKey}" -H "Authorization: Bearer ${supabaseAnonKey}" "${url}"`;
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 5000 });
    const json = JSON.parse(output);
    if (Array.isArray(json) && json.length > 0 && json[0].value) {
      return json[0].value;
    }
  } catch (err) {
    console.warn('[Supabase Sync Fetch Error]:', err);
  }
  return null;
}

/**
 * Helper to load DB state from Supabase table 'viralmuse_state'
 */
export async function fetchDbFromSupabase(): Promise<any | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('viralmuse_state')
      .select('value')
      .eq('key', 'main_db')
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is row not found
        console.warn('[Supabase DB Fetch Warning]:', error.message);
      }
      return null;
    }

    return data?.value || null;
  } catch (err) {
    console.warn('[Supabase DB Fetch Error]:', err);
    return null;
  }
}

/**
 * Helper to save DB state to Supabase table 'viralmuse_state'
 */
export async function saveDbToSupabase(dbData: any): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('viralmuse_state')
      .upsert({ key: 'main_db', value: dbData, updated_at: new Date().toISOString() });

    if (error) {
      console.warn('[Supabase DB Save Error]:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase DB Save Exception]:', err);
    return false;
  }
}
