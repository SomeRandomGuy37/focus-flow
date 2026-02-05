
const SUPABASE_URL = 'https://yfmohwbmpjsoyplonwes.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ApoIYHE7P1rytoaOwi_hVQ_ZuvMmvr_';

// Access the global supabase object from the CDN
const supabaseGlobal = (window as any).supabase;

export const supabase = supabaseGlobal ? supabaseGlobal.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
