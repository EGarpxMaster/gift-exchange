import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

// Types
export interface Participant {
    id: string;
    created_at: string;
    encrypted_name: string;
    category: 'elite' | 'diversion';
    gift_options: string[];
    assigned_to_id: string | null;
}

export interface Settings {
    id: string;
    encryption_password_hash: string;
    names_revealed: boolean;
    sorteo_completed: boolean;
    updated_at: string;
}

// Database helpers
export async function getParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
}

export async function getParticipantById(id: string): Promise<Participant | null> {
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error fetching participant:', error);
        return null;
    }
    return data;
}

export async function createParticipant(
    encryptedName: string,
    category: 'elite' | 'diversion',
    giftOptions: string[]
): Promise<Participant> {
    const { data, error } = await supabase
        .from('participants')
        .insert({
            encrypted_name: encryptedName,
            category,
            gift_options: giftOptions
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function updateParticipantAssignment(
    participantId: string,
    assignedToId: string
): Promise<void> {
    const { error } = await supabase
        .from('participants')
        .update({ assigned_to_id: assignedToId })
        .eq('id', participantId);
    
    if (error) throw error;
}

export async function getSettings(): Promise<Settings> {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
    
    if (error) throw error;
    return data;
}

export async function updateSettings(
    updates: Partial<Omit<Settings, 'id' | 'updated_at'>>
): Promise<Settings> {
    const { data, error } = await supabase
        .from('settings')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', (await getSettings()).id)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function checkNameExists(encryptedName: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('participants')
        .select('id')
        .eq('encrypted_name', encryptedName)
        .limit(1);
    
    if (error) throw error;
    return (data?.length || 0) > 0;
}

