"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const xmtp_js_1 = require("@xmtp/xmtp-js");
const ethers_1 = require("ethers");
const nlp_processor_1 = require("./nlp-processor");
const enhanced_smart_contract_1 = __importDefault(require("./enhanced-smart-contract"));
const enhanced_host_availability_1 = __importDefault(require("./enhanced-host-availability"));
const persistent_session_manager_1 = __importDefault(require("./persistent-session-manager"));
class AIAgent {
    constructor() {
        this.xmtpClient = null;
        this.isRunning = false;
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("PRIVATE_KEY environment variable is required");
        }
        this.wallet = new ethers_1.Wallet(privateKey);
        this.smartContract = new enhanced_smart_contract_1.default();
        this.smartContract.initializeWallet(privateKey);
        this.availabilityManager = new enhanced_host_availability_1.default(this.smartContract, this.wallet.address);
        this.sessionManager = new persistent_session_manager_1.default();
        console.log(`AI Agent wallet address: ${this.wallet.address}`);
    }
    async initialize() {
        try {
            console.log("Initializing AI Agent...");
            // Initialize session manager
            await this.sessionManager.initialize();
            // Initialize XMTP client
            this.xmtpClient = await xmtp_js_1.Client.create(this.wallet, { env: "dev" });
            console.log("XMTP client initialized");
            // Check if host is registered, if not register with default settings
            const isRegistered = await this.smartContract.isHostRegistered(this.wallet.address);
            if (!isRegistered) {
                console.log("Host not registered, registering with default settings...");
                await this.smartContract.registerAsHost("0.01", JSON.stringify({
                    name: "AI Meeting Scheduler",
                    description: "Automated meeting scheduling agent",
                    version: "2.0.0"
                }));
                console.log("Host registered successfully");
            }
            // Create or update host profile in database
            await this.sessionManager.createOrUpdateHostProfile(this.wallet.address, {
                displayName: "AI Meeting Scheduler",
                bio: "Automated meeting scheduling agent powered by AI",
                defaultPrice: 0.01,
                defaultCurrency: "ETH",
                timezone: "UTC",
                agentPersonality: {
                    tone: "professional",
                    responseStyle: "helpful",
                    language: "english"
                },
                autoConfirmMeetings: false,
                responseDelaySeconds: 1
            });
            console.log("AI Agent initialized successfully");
        }
        catch (error) {
            console.error("Failed to initialize AI Agent:", error);
            throw error;
        }
    }
    async start() {
        if (!this.xmtpClient) {
            throw new Error("XMTP client not initialized");
        }
        this.isRunning = true;
        console.log("AI Agent started, listening for messages...");
        // Listen for new conversations
        for await (const conversation of await this.xmtpClient.conversations.stream()) {
            if (!this.isRunning)
                break;
            console.log(`New conversation with ${conversation.peerAddress}`);
            this.handleConversation(conversation);
        }
    }
    async handleConversation(conversation) {
        try {
            // Listen for messages in this conversation
            for await (const message of await conversation.streamMessages()) {
                if (!this.isRunning)
                    break;
                console.log(`Received message from ${message.senderAddress}: ${message.content}`);
                // Create or get session
                const sessionId = this.generateSessionId(message.senderAddress, this.wallet.address);
                let session = await this.sessionManager.getSession(sessionId);
                if (!session) {
                    session = await this.sessionManager.createSession({
                        sessionId,
                        hostAddress: this.wallet.address,
                        requesterAddress: message.senderAddress,
                        status: 'pending',
                        metadata: {
                            conversationTopic: conversation.topic
                        }
                    });
                    console.log(`Created new session: ${sessionId}`);
                }
                // Store the incoming message
                await this.sessionManager.addMessage(sessionId, 'user', message.content, message.senderAddress, message.id);
                // Process the message and generate response
                const response = await this.processMessage(message.content, session);
                if (response) {
                    // Send response
                    await conversation.send(response);
                    console.log(`Sent response: ${response}`);
                    // Store the outgoing message
                    await this.sessionManager.addMessage(sessionId, 'agent', response, this.wallet.address);
                }
            }
        }
        catch (error) {
            console.error("Error handling conversation:", error);
        }
    }
    async processMessage(message, session) {
        try {
            // Process message with NLP
            const nlpResult = await (0, nlp_processor_1.processNLP)(message);
            console.log("NLP Result:", nlpResult);
            // Update session state based on intent
            await this.sessionManager.updateSessionState(session.sessionId, nlpResult.intent, {
                entities: nlpResult.entities,
                confidence: nlpResult.score
            });
            // Generate response based on intent
            switch (nlpResult.intent) {
                case 'greeting':
                    return this.handleGreeting(session);
                case 'availability':
                    return await this.handleAvailabilityInquiry(message, session);
                case 'pricing':
                    return await this.handlePricingInquiry(session);
                case 'booking':
                    return await this.handleBookingRequest(message, session);
                case 'cancellation':
                    return await this.handleCancellationRequest(session);
                case 'help':
                    return this.handleHelpRequest();
                default:
                    return this.handleUnknownIntent(message);
            }
        }
        catch (error) {
            console.error("Error processing message:", error);
            return "I apologize, but I encountered an error processing your message. Please try again.";
        }
    }
    handleGreeting(session) {
        return `Hello! I'm an AI agent that helps schedule meetings with ${this.wallet.address}. I can help you check availability, get pricing information, and book meetings. How can I assist you today?`;
    }
    async handleAvailabilityInquiry(message, session) {
        try {
            // Extract date from message (simple implementation)
            const dateMatch = message.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)\b/i);
            const dateQuery = dateMatch ? dateMatch[0] : undefined;
            const availableSlots = await this.availabilityManager.getAvailabilityForDate(dateQuery);
            if (availableSlots.length === 0) {
                return `I don't have any available slots${dateQuery ? ` for ${dateQuery}` : ' at the moment'}. Would you like me to check a different date?`;
            }
            let response = `Here are the available time slots${dateQuery ? ` for ${dateQuery}` : ''}:\n\n`;
            availableSlots.slice(0, 5).forEach((slot, index) => {
                response += `${index + 1}. ${slot}\n`;
            });
            if (availableSlots.length > 5) {
                response += `\n... and ${availableSlots.length - 5} more slots available.`;
            }
            response += "\n\nWould you like to book any of these slots?";
            return response;
        }
        catch (error) {
            console.error("Error handling availability inquiry:", error);
            return "I'm having trouble checking availability right now. Please try again in a moment.";
        }
    }
    async handlePricingInquiry(session) {
        try {
            const hostInfo = await this.smartContract.getHostInfo(this.wallet.address);
            if (hostInfo.isRegistered && hostInfo.defaultPrice) {
                return `My current rate is ${hostInfo.defaultPrice} ETH per meeting. This covers a standard 1-hour session. Some specific time slots may have different pricing. Would you like to check availability and pricing for a specific date?`;
            }
            else {
                return "I'm currently setting up my pricing. Please check back in a moment or ask about availability for specific dates.";
            }
        }
        catch (error) {
            console.error("Error handling pricing inquiry:", error);
            return "I'm having trouble retrieving pricing information right now. Please try again in a moment.";
        }
    }
    async handleBookingRequest(message, session) {
        try {
            // This is a simplified booking flow
            // In a full implementation, you would parse the specific time slot requested
            // and guide the user through the smart contract booking process
            const currentState = await this.sessionManager.getCurrentSessionState(session.sessionId);
            if (currentState?.step === 'booking') {
                return "I see you're interested in booking a meeting. To proceed, you'll need to:\n\n1. Choose a specific time slot from the available options\n2. Confirm the meeting details\n3. Complete the payment through the smart contract\n\nWhich time slot would you like to book?";
            }
            else {
                await this.sessionManager.updateSessionState(session.sessionId, 'booking', {
                    requestedAt: new Date().toISOString()
                });
                return "Great! I'd be happy to help you book a meeting. First, let me show you the available time slots. What date are you looking for?";
            }
        }
        catch (error) {
            console.error("Error handling booking request:", error);
            return "I'm having trouble processing your booking request right now. Please try again in a moment.";
        }
    }
    async handleCancellationRequest(session) {
        try {
            // Check if there are any confirmed meetings for this user
            const userSessions = await this.sessionManager.getSessionsByRequester(session.requesterAddress, 'confirmed');
            if (userSessions.length === 0) {
                return "I don't see any confirmed meetings to cancel. If you have a meeting booked, please provide the meeting ID or transaction hash.";
            }
            return "I can help you cancel a meeting. Please note that cancellation policies may apply depending on how close to the meeting time it is. Which meeting would you like to cancel?";
        }
        catch (error) {
            console.error("Error handling cancellation request:", error);
            return "I'm having trouble processing your cancellation request right now. Please try again in a moment.";
        }
    }
    handleHelpRequest() {
        return `I'm here to help you schedule meetings! Here's what I can do:

🗓️ **Check Availability** - Ask me "Are you available tomorrow?" or "What's available next week?"

💰 **Get Pricing** - Ask "What do you charge?" or "How much for a meeting?"

📅 **Book Meetings** - Say "I'd like to book a meeting" and I'll guide you through the process

❌ **Cancel Meetings** - Say "I need to cancel my meeting" if you need to cancel

Just send me a message with what you need, and I'll help you out!`;
    }
    handleUnknownIntent(message) {
        return `I'm not sure I understood that. I can help you with:
- Checking availability
- Getting pricing information  
- Booking meetings
- Cancelling meetings

Could you please rephrase your request or ask for help if you need more information?`;
    }
    generateSessionId(requesterAddress, hostAddress) {
        const timestamp = Math.floor(Date.now() / 1000);
        return `session_${requesterAddress.slice(-8)}_${hostAddress.slice(-8)}_${timestamp}`;
    }
    async stop() {
        this.isRunning = false;
        console.log("AI Agent stopped");
    }
    // Getter methods for external access
    getWalletAddress() {
        return this.wallet.address;
    }
    async getSessionStats() {
        try {
            return await this.sessionManager.getHostStats(this.wallet.address);
        }
        catch (error) {
            console.error("Error getting session stats:", error);
            return null;
        }
    }
}
// Start the AI Agent
async function main() {
    const agent = new AIAgent();
    try {
        await agent.initialize();
        await agent.start();
    }
    catch (error) {
        console.error("Failed to start AI Agent:", error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
if (require.main === module) {
    main();
}
exports.default = AIAgent;
