import { createClient, SupabaseClient as SupabaseJSClient } from '@supabase/supabase-js';

// Database types based on our schema
export interface Session {
  id: string;
  session_id: string;
  host_address: string;
  requester_address: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  meeting_start_time?: string;
  meeting_end_time?: string;
  meeting_duration?: number;
  meeting_price?: number;
  meeting_currency: string;
  meeting_id?: string;
  blockchain_tx_hash?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  metadata: Record<string, any>;
  notes?: string;
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  message_type: 'user' | 'agent' | 'system';
  sender_address?: string;
  message_content: string;
  xmtp_message_id?: string;
  xmtp_timestamp?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface HostProfile {
  id: string;
  host_address: string;
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  default_price?: number;
  default_currency: string;
  timezone: string;
  agent_personality: Record<string, any>;
  auto_confirm_meetings: boolean;
  response_delay_seconds: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  metadata: Record<string, any>;
}

export interface SessionState {
  id: string;
  session_id: string;
  current_step: string;
  previous_step?: string;
  step_data: Record<string, any>;
  entered_at: string;
  expected_completion_at?: string;
  metadata: Record<string, any>;
}

class SupabaseClient {
  private client: SupabaseJSClient;
  private isInitialized: boolean = false;

  constructor() {
    // These would be set via environment variables in production
    const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
    
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async initialize(): Promise<void> {
    try {
      // Test connection
      const { data, error } = await this.client.from('sessions').select('count').limit(1);
      if (error) {
        console.error('Failed to connect to Supabase:', error);
        throw error;
      }
      this.isInitialized = true;
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Supabase client not initialized. Call initialize() first.');
    }
  }

  // Session Management Methods
  async createSession(sessionData: Partial<Session>): Promise<Session> {
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

    return data as Session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
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

    return data as Session;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
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

    return data as Session;
  }

  async deleteSession(sessionId: string): Promise<void> {
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

  async getSessionsByHost(hostAddress: string, status?: string): Promise<Session[]> {
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

    return data as Session[];
  }

  async getSessionsByRequester(requesterAddress: string, status?: string): Promise<Session[]> {
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

    return data as Session[];
  }

  // Conversation Message Methods
  async addMessage(messageData: Partial<ConversationMessage>): Promise<ConversationMessage> {
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

    return data as ConversationMessage;
  }

  async getSessionMessages(sessionId: string, limit: number = 50): Promise<ConversationMessage[]> {
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

    return data as ConversationMessage[];
  }

  // Host Profile Methods
  async createOrUpdateHostProfile(profileData: Partial<HostProfile>): Promise<HostProfile> {
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

    return data as HostProfile;
  }

  async getHostProfile(hostAddress: string): Promise<HostProfile | null> {
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

    return data as HostProfile;
  }

  // Session State Management
  async updateSessionState(sessionId: string, step: string, stepData: Record<string, any> = {}): Promise<SessionState> {
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

    const stateData: Partial<SessionState> = {
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

    return data as SessionState;
  }

  async getCurrentSessionState(sessionId: string): Promise<SessionState | null> {
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

    return data as SessionState;
  }

  // Utility Methods
  async cleanupExpiredSessions(): Promise<number> {
    this.ensureInitialized();
    
    const { data, error } = await this.client.rpc('cleanup_expired_sessions');

    if (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }

    return data as number;
  }

  async getHostStats(hostAddress: string): Promise<{
    total_sessions: number;
    confirmed_sessions: number;
    completed_sessions: number;
    cancelled_sessions: number;
    total_earnings: number;
    avg_session_duration: string;
  } | null> {
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
  subscribeToSessionUpdates(sessionId: string, callback: (payload: any) => void) {
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

  subscribeToNewMessages(sessionId: string, callback: (payload: any) => void) {
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

export default SupabaseClient;

