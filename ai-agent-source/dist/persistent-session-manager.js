"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_client_1 = __importDefault(require("./supabase-client"));
class PersistentSessionManager {
    constructor() {
        this.isInitialized = false;
        this.supabaseClient = new supabase_client_1.default();
    }
    async initialize() {
        try {
            await this.supabaseClient.initialize();
            this.isInitialized = true;
            console.log('Persistent Session Manager initialized successfully');
            // Start cleanup routine for expired sessions
            this.startCleanupRoutine();
        }
        catch (error) {
            console.error('Failed to initialize Persistent Session Manager:', error);
            throw error;
        }
    }
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('Session manager not initialized. Call initialize() first.');
        }
    }
    // Session CRUD Operations
    async createSession(sessionData) {
        this.ensureInitialized();
        try {
            const session = await this.supabaseClient.createSession({
                session_id: sessionData.sessionId,
                host_address: sessionData.hostAddress,
                requester_address: sessionData.requesterAddress,
                status: sessionData.status,
                meeting_start_time: sessionData.meetingStartTime?.toISOString(),
                meeting_end_time: sessionData.meetingEndTime?.toISOString(),
                meeting_duration: sessionData.meetingDuration,
                meeting_price: sessionData.meetingPrice,
                meeting_currency: sessionData.meetingCurrency || 'ETH',
                meeting_id: sessionData.meetingId,
                blockchain_tx_hash: sessionData.blockchainTxHash,
                metadata: sessionData.metadata || {},
                notes: sessionData.notes
            });
            return this.convertFromDbSession(session);
        }
        catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }
    async getSession(sessionId) {
        this.ensureInitialized();
        try {
            const session = await this.supabaseClient.getSession(sessionId);
            return session ? this.convertFromDbSession(session) : null;
        }
        catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }
    async updateSession(sessionId, updates) {
        this.ensureInitialized();
        try {
            const dbUpdates = {};
            if (updates.status)
                dbUpdates.status = updates.status;
            if (updates.meetingStartTime)
                dbUpdates.meeting_start_time = updates.meetingStartTime.toISOString();
            if (updates.meetingEndTime)
                dbUpdates.meeting_end_time = updates.meetingEndTime.toISOString();
            if (updates.meetingDuration !== undefined)
                dbUpdates.meeting_duration = updates.meetingDuration;
            if (updates.meetingPrice !== undefined)
                dbUpdates.meeting_price = updates.meetingPrice;
            if (updates.meetingCurrency)
                dbUpdates.meeting_currency = updates.meetingCurrency;
            if (updates.meetingId)
                dbUpdates.meeting_id = updates.meetingId;
            if (updates.blockchainTxHash)
                dbUpdates.blockchain_tx_hash = updates.blockchainTxHash;
            if (updates.metadata)
                dbUpdates.metadata = updates.metadata;
            if (updates.notes)
                dbUpdates.notes = updates.notes;
            const session = await this.supabaseClient.updateSession(sessionId, dbUpdates);
            return this.convertFromDbSession(session);
        }
        catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    }
    async deleteSession(sessionId) {
        this.ensureInitialized();
        try {
            await this.supabaseClient.deleteSession(sessionId);
        }
        catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }
    // Session Query Methods
    async getSessionsByHost(hostAddress, status) {
        this.ensureInitialized();
        try {
            const sessions = await this.supabaseClient.getSessionsByHost(hostAddress, status);
            return sessions.map(session => this.convertFromDbSession(session));
        }
        catch (error) {
            console.error('Error getting sessions by host:', error);
            throw error;
        }
    }
    async getSessionsByRequester(requesterAddress, status) {
        this.ensureInitialized();
        try {
            const sessions = await this.supabaseClient.getSessionsByRequester(requesterAddress, status);
            return sessions.map(session => this.convertFromDbSession(session));
        }
        catch (error) {
            console.error('Error getting sessions by requester:', error);
            throw error;
        }
    }
    async getActiveSessions() {
        this.ensureInitialized();
        try {
            // Get all pending and confirmed sessions
            const pendingSessions = await this.supabaseClient.getSessionsByHost('', 'pending');
            const confirmedSessions = await this.supabaseClient.getSessionsByHost('', 'confirmed');
            const allSessions = [...pendingSessions, ...confirmedSessions];
            return allSessions.map(session => this.convertFromDbSession(session));
        }
        catch (error) {
            console.error('Error getting active sessions:', error);
            return [];
        }
    }
    // Message Management
    async addMessage(sessionId, messageType, content, senderAddress, xmtpMessageId) {
        this.ensureInitialized();
        try {
            // Get session to get the UUID
            const session = await this.supabaseClient.getSession(sessionId);
            if (!session) {
                throw new Error(`Session ${sessionId} not found`);
            }
            await this.supabaseClient.addMessage({
                session_id: session.id,
                message_type: messageType,
                sender_address: senderAddress,
                message_content: content,
                xmtp_message_id: xmtpMessageId,
                xmtp_timestamp: new Date().toISOString(),
                metadata: {}
            });
        }
        catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    }
    async getSessionMessages(sessionId, limit = 50) {
        this.ensureInitialized();
        try {
            const messages = await this.supabaseClient.getSessionMessages(sessionId, limit);
            return messages.map(msg => ({
                type: msg.message_type,
                content: msg.message_content,
                timestamp: new Date(msg.created_at),
                senderAddress: msg.sender_address,
                xmtpMessageId: msg.xmtp_message_id
            }));
        }
        catch (error) {
            console.error('Error getting session messages:', error);
            return [];
        }
    }
    // Session State Management
    async updateSessionState(sessionId, step, stepData = {}) {
        this.ensureInitialized();
        try {
            await this.supabaseClient.updateSessionState(sessionId, step, stepData);
        }
        catch (error) {
            console.error('Error updating session state:', error);
            throw error;
        }
    }
    async getCurrentSessionState(sessionId) {
        this.ensureInitialized();
        try {
            const state = await this.supabaseClient.getCurrentSessionState(sessionId);
            return state ? {
                step: state.current_step,
                data: state.step_data
            } : null;
        }
        catch (error) {
            console.error('Error getting current session state:', error);
            return null;
        }
    }
    // Host Profile Management
    async createOrUpdateHostProfile(hostAddress, profileData) {
        this.ensureInitialized();
        try {
            await this.supabaseClient.createOrUpdateHostProfile({
                host_address: hostAddress,
                display_name: profileData.displayName,
                bio: profileData.bio,
                profile_image_url: profileData.profileImageUrl,
                default_price: profileData.defaultPrice,
                default_currency: profileData.defaultCurrency || 'ETH',
                timezone: profileData.timezone || 'UTC',
                agent_personality: profileData.agentPersonality || {},
                auto_confirm_meetings: profileData.autoConfirmMeetings || false,
                response_delay_seconds: profileData.responseDelaySeconds || 0,
                is_active: true,
                metadata: profileData.metadata || {} // ✅ Use it here
            });
        }
        catch (error) {
            console.error('Error creating/updating host profile:', error);
            throw error;
        }
    }
    async getHostProfile(hostAddress) {
        this.ensureInitialized();
        try {
            const profile = await this.supabaseClient.getHostProfile(hostAddress);
            return profile ? {
                displayName: profile.display_name,
                bio: profile.bio,
                profileImageUrl: profile.profile_image_url,
                defaultPrice: profile.default_price,
                defaultCurrency: profile.default_currency,
                timezone: profile.timezone,
                agentPersonality: profile.agent_personality,
                autoConfirmMeetings: profile.auto_confirm_meetings,
                responseDelaySeconds: profile.response_delay_seconds,
                metadata: profile.metadata // ✅ Use it here
            } : null;
        }
        catch (error) {
            console.error('Error getting host profile:', error);
            return null;
        }
    }
    // Analytics and Statistics
    async getHostStats(hostAddress) {
        this.ensureInitialized();
        try {
            const stats = await this.supabaseClient.getHostStats(hostAddress);
            return stats ? {
                totalSessions: stats.total_sessions,
                confirmedSessions: stats.confirmed_sessions,
                completedSessions: stats.completed_sessions,
                cancelledSessions: stats.cancelled_sessions,
                totalEarnings: stats.total_earnings,
                avgSessionDuration: stats.avg_session_duration
            } : null;
        }
        catch (error) {
            console.error('Error getting host stats:', error);
            return null;
        }
    }
    // Utility Methods
    convertFromDbSession(dbSession) {
        return {
            sessionId: dbSession.session_id,
            hostAddress: dbSession.host_address,
            requesterAddress: dbSession.requester_address,
            status: dbSession.status,
            meetingStartTime: dbSession.meeting_start_time ? new Date(dbSession.meeting_start_time) : undefined,
            meetingEndTime: dbSession.meeting_end_time ? new Date(dbSession.meeting_end_time) : undefined,
            meetingDuration: dbSession.meeting_duration,
            meetingPrice: dbSession.meeting_price,
            meetingCurrency: dbSession.meeting_currency,
            meetingId: dbSession.meeting_id,
            blockchainTxHash: dbSession.blockchain_tx_hash,
            metadata: dbSession.metadata,
            notes: dbSession.notes
        };
    }
    async startCleanupRoutine() {
        // Run cleanup every hour
        setInterval(async () => {
            try {
                const expiredCount = await this.supabaseClient.cleanupExpiredSessions();
                if (expiredCount > 0) {
                    console.log(`Cleaned up ${expiredCount} expired sessions`);
                }
            }
            catch (error) {
                console.error('Error during session cleanup:', error);
            }
        }, 60 * 60 * 1000); // 1 hour
    }
    // Real-time subscriptions
    subscribeToSessionUpdates(sessionId, callback) {
        this.ensureInitialized();
        return this.supabaseClient.subscribeToSessionUpdates(sessionId, (payload) => {
            if (payload.new) {
                const session = this.convertFromDbSession(payload.new);
                callback(session);
            }
        });
    }
    subscribeToNewMessages(sessionId, callback) {
        this.ensureInitialized();
        return this.supabaseClient.subscribeToNewMessages(sessionId, (payload) => {
            if (payload.new) {
                const message = {
                    type: payload.new.message_type,
                    content: payload.new.message_content,
                    timestamp: new Date(payload.new.created_at),
                    senderAddress: payload.new.sender_address
                };
                callback(message);
            }
        });
    }
    // Backward compatibility methods (to replace the old in-memory session manager)
    async hasSession(sessionId) {
        const session = await this.getSession(sessionId);
        return session !== null;
    }
    async getAllSessions() {
        return await this.getActiveSessions();
    }
    async clearExpiredSessions() {
        try {
            await this.supabaseClient.cleanupExpiredSessions();
        }
        catch (error) {
            console.error('Error clearing expired sessions:', error);
        }
    }
    async updateSessionData(sessionId, newMetadata) {
        this.ensureInitialized();
        const session = await this.getSession(sessionId);
        if (!session)
            throw new Error(`Session ${sessionId} not found`);
        const updatedMetadata = { ...session.metadata, ...newMetadata };
        await this.updateSession(sessionId, { metadata: updatedMetadata });
    }
}
exports.default = PersistentSessionManager;
