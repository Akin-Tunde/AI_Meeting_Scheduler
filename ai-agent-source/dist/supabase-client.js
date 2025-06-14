"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
class SupabaseClient {
    constructor() {
        this.isInitialized = false;
        // These would be set via environment variables in production
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Key must be provided.');
        }
        this.client = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async initialize() {
        try {
            // Test connection
            const { data, error } = await this.client.from('sessions').select('count').limit(1);
            if (error) {
                console.error('Failed to connect to Supabase:', error);
                throw error;
            }
            this.isInitialized = true;
            console.log('Supabase client initialized successfully');
        }
        catch (error) {
            console.error('Supabase initialization failed:', error);
            throw error;
        }
    }
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('Supabase client not initialized. Call initialize() first.');
        }
    }
    // Session Management Methods
    async createSession(sessionData) {
        this.ensureInitialized();
        const { data, error } = await this.client
            .from('sessions')
            .insert([{
                ...sessionData,
                expires_at: sessionData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours default
            }])
            .select()
            .single();
        if (error) {
            console.error('Error creating session:', error);
            throw error;
        }
        return data;
    }
    async getSession(sessionId) {
        this.ensureInitialized();
        const { data, error } = await this.client
            .from('sessions')
            .select('*')
            .eq('session_id', sessionId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows returned
            }
            console.error('Error getting session:', error);
            throw error;
        }
        return data;
    }
    async updateSession(sessionId, updates) {
        this.ensureInitialized();
        const { data, error } = await this.client
            .from('sessions')
            .update(updates)
            .eq('session_id', sessionId)
            .select()
            .single();
        if (error) {
            console.error('Error updating session:', error);
            throw error;
        }
        return data;
    }
    async deleteSession(sessionId) {
        this.ensureInitialized();
        const { error } = await this.client
            .from('sessions')
            .delete()
            .eq('session_id', sessionId);
        if (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }
    async getSessionsByHost(hostAddress, status) {
        this.ensureInitialized();
        let query = this.client
            .from('sessions')
            .select('*')
            .eq('host_address', hostAddress)
            .order('created_at', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error getting sessions by host:', error);
            throw error;
        }
        return data;
    }
    async getSessionsByRequester(requesterAddress, status) {
        this.ensureInitialized();
        let query = this.client
            .from('sessions')
            .select('*')
            .eq('requester_address', requesterAddress)
            .order('created_at', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error getting sessions by requester:', error);
            throw error;
        }
        return data;
    }
    // Conversation Message Methods
    async addMessage(messageData) {
        this.ensureInitialized();
        const { data, error } = await this.client
            .from('conversation_messages')
            .insert([messageData])
            .select()
            .single();
        if (error) {
            console.error('Error adding message:', error);
            throw error;
        }
        return data;
    }
    async getSessionMessages(sessionId, limit = 50) {
        this.ensureInitialized();
        // Get session UUID from session_id
        const session = await this.getSession(sessionId);
        if (!session) {
            return [];
        }
        const { data, error } = await this.client
            .from('conversation_messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error) {
            console.error('Error getting session messages:', error);
            throw error;
        }
        return data;
    }
    // Host Profile Methods
    async createOrUpdateHostProfile(profileData) {
        this.ensureInitialized();
        const { data, error } = await this.client
            .from('host_profiles')
            .upsert([profileData], { onConflict: 'host_address' })
            .select()
            .single();
        if (error) {
            console.error('Error creating/updating host profile:', error);
            throw error;
        }
        return data;
    }
    async getHostProfile(hostAddress) {
        this.ensureInitialized();
        const { data, error } = await this.client
            .from('host_profiles')
            .select('*')
            .eq('host_address', hostAddress)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows returned
            }
            console.error('Error getting host profile:', error);
            throw error;
        }
        return data;
    }
    // Session State Management
    async updateSessionState(sessionId, step, stepData = {}) {
        this.ensureInitialized();
        // Get session UUID
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        // Get current state to set as previous
        const { data: currentState } = await this.client
            .from('session_states')
            .select('current_step')
            .eq('session_id', session.id)
            .order('entered_at', { ascending: false })
            .limit(1)
            .single();
        const stateData = {
            session_id: session.id,
            current_step: step,
            previous_step: currentState?.current_step,
            step_data: stepData,
            entered_at: new Date().toISOString()
        };
        const { data, error } = await this.client
            .from('session_states')
            .insert([stateData])
            .select()
            .single();
        if (error) {
            console.error('Error updating session state:', error);
            throw error;
        }
        return data;
    }
    async getCurrentSessionState(sessionId) {
        this.ensureInitialized();
        // Get session UUID
        const session = await this.getSession(sessionId);
        if (!session) {
            return null;
        }
        const { data, error } = await this.client
            .from('session_states')
            .select('*')
            .eq('session_id', session.id)
            .order('entered_at', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows returned
            }
            console.error('Error getting current session state:', error);
            throw error;
        }
        return data;
    }
    // Utility Methods
    async cleanupExpiredSessions() {
        this.ensureInitialized();
        const { data, error } = await this.client.rpc('cleanup_expired_sessions');
        if (error) {
            console.error('Error cleaning up expired sessions:', error);
            throw error;
        }
        return data;
    }
    async getHostStats(hostAddress) {
        this.ensureInitialized();
        const { data, error } = await this.client.rpc('get_host_session_stats', {
            host_addr: hostAddress
        });
        if (error) {
            console.error('Error getting host stats:', error);
            throw error;
        }
        return data?.[0] || null;
    }
    // Real-time subscriptions
    subscribeToSessionUpdates(sessionId, callback) {
        this.ensureInitialized();
        return this.client
            .channel(`session-${sessionId}`)
            .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'sessions',
            filter: `session_id=eq.${sessionId}`
        }, callback)
            .subscribe();
    }
    subscribeToNewMessages(sessionId, callback) {
        this.ensureInitialized();
        return this.client
            .channel(`messages-${sessionId}`)
            .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'conversation_messages'
        }, callback)
            .subscribe();
    }
}
exports.default = SupabaseClient;
