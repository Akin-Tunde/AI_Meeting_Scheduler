"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const xmtp_js_1 = require("@xmtp/xmtp-js");
const ethers_1 = require("ethers");
const nlp_processor_1 = require("./nlp-processor");
const advanced_smart_contract_fixed_1 = __importDefault(require("./advanced-smart-contract-fixed"));
const advanced_host_availability_1 = __importDefault(require("./advanced-host-availability"));
const persistent_session_manager_1 = __importDefault(require("./persistent-session-manager"));
const multi_host_manager_1 = __importDefault(require("./multi-host-manager"));
class MultiHostAIAgent {
    constructor() {
        this.xmtpClient = null;
        this.isRunning = false;
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("PRIVATE_KEY environment variable is required");
        }
        this.wallet = new ethers_1.Wallet(privateKey);
        this.currentHostAddress = this.wallet.address;
        this.smartContract = new advanced_smart_contract_fixed_1.default();
        this.smartContract.initializeWallet(privateKey);
        this.sessionManager = new persistent_session_manager_1.default();
        this.multiHostManager = new multi_host_manager_1.default(this.smartContract, this.sessionManager);
        this.availabilityManager = new advanced_host_availability_1.default(this.smartContract, this.currentHostAddress);
        console.log(`Multi-Host AI Agent wallet address: ${this.wallet.address}`);
    }
    async initialize() {
        try {
            console.log("Initializing Multi-Host AI Agent...");
            // Initialize session manager
            await this.sessionManager.initialize();
            // Initialize XMTP client
            this.xmtpClient = await xmtp_js_1.Client.create(this.wallet, { env: "dev" });
            console.log("XMTP client initialized");
            // Register as host if not already registered
            await this.ensureHostRegistration();
            console.log("Multi-Host AI Agent initialized successfully");
        }
        catch (error) {
            console.error("Failed to initialize Multi-Host AI Agent:", error);
            throw error;
        }
    }
    async start() {
        if (!this.xmtpClient) {
            throw new Error("AI Agent not initialized. Call initialize() first.");
        }
        this.isRunning = true;
        console.log("Multi-Host AI Agent started. Listening for messages...");
        // Listen for new conversations
        for await (const conversation of await this.xmtpClient.conversations.stream()) {
            if (this.isRunning) {
                this.handleConversation(conversation);
            }
        }
    }
    async stop() {
        this.isRunning = false;
        console.log("Multi-Host AI Agent stopped");
    }
    async ensureHostRegistration() {
        try {
            const hostInfo = await this.smartContract.getAdvancedHostInfo(this.currentHostAddress);
            if (!hostInfo.isRegistered) {
                console.log("Registering as host...");
                await this.smartContract.registerAsAdvancedHost(JSON.stringify({
                    name: "AI Meeting Assistant",
                    description: "AI-powered meeting scheduling assistant with multi-host support",
                    type: "ai_agent",
                    version: "2.0"
                }), "0.01", // Default price
                0, // Fixed pricing model
                24, // 24 hours minimum notice
                24 // 24 hours cancellation window
                );
                console.log("Successfully registered as host");
            }
            else {
                console.log("Already registered as host");
            }
        }
        catch (error) {
            console.error("Error ensuring host registration:", error);
        }
    }
    async handleConversation(conversation) {
        try {
            const peerAddress = conversation.peerAddress;
            console.log(`New conversation with: ${peerAddress}`);
            // Get or create session
            const allSessions = await this.sessionManager.getActiveSessions();
            let session = allSessions.find(s => s.requesterAddress === peerAddress && s.hostAddress === this.currentHostAddress);
            if (!session) {
                session = await this.sessionManager.createSession({
                    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                    hostAddress: this.currentHostAddress,
                    requesterAddress: peerAddress,
                    status: 'pending',
                    metadata: { type: 'multi_host_discovery' }
                });
            }
            // Listen for messages in this conversation
            for await (const message of await conversation.streamMessages()) {
                if (this.isRunning && message.senderAddress !== this.wallet.address) {
                    console.log(`Received message from ${message.senderAddress}: ${message.content}`);
                    // Store message
                    await this.sessionManager.addMessage(session.sessionId, 'user', message.content, message.senderAddress);
                    // Process and respond
                    const response = await this.processMessage(message.content, session);
                    if (response) {
                        await conversation.send(response);
                        // Store response
                        await this.sessionManager.addMessage(session.sessionId, 'agent', response, this.wallet.address);
                    }
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
            // Generate response based on intent with multi-host support
            switch (nlpResult.intent) {
                case 'greeting':
                    return this.handleGreeting(session);
                case 'host_search':
                    return await this.handleHostSearch(message, session);
                case 'host_comparison':
                    return await this.handleHostComparison(message, session);
                case 'check.availability':
                    return await this.handleAvailabilityCheck(message, session);
                case 'book.meeting':
                    return await this.handleMeetingBooking(message, session);
                case 'get_recommendations':
                    return await this.handleRecommendations(message, session);
                case 'browse_specialties':
                    return await this.handleSpecialtyBrowsing(message, session);
                case 'marketplace_info':
                    return await this.handleMarketplaceInfo(session);
                case 'help':
                    return this.handleHelp();
                default:
                    return await this.handleGeneralQuery(message, session);
            }
        }
        catch (error) {
            console.error("Error processing message:", error);
            return "I apologize, but I encountered an error processing your request. Please try again.";
        }
    }
    handleGreeting(session) {
        return `Hello! I'm your AI-powered meeting scheduling assistant with access to multiple hosts. 

I can help you:
🔍 Search and discover hosts by specialty, price, rating, and availability
⭐ Get personalized host recommendations
📊 Compare different hosts side-by-side
📅 Check availability and book meetings
🏷️ Browse hosts by specialty categories
📈 Get marketplace insights and analytics

What would you like to do today?`;
    }
    async handleHostSearch(message, session) {
        try {
            // Parse search criteria from message
            const filters = this.parseSearchFilters(message);
            const sortBy = this.parseSortCriteria(message);
            const searchResult = await this.multiHostManager.searchHosts(filters, sortBy, 1, 10);
            if (searchResult.hosts.length === 0) {
                return "I couldn't find any hosts matching your criteria. Try adjusting your search filters or check back later for new hosts.";
            }
            let response = `Found ${searchResult.totalCount} hosts matching your criteria:\n\n`;
            for (let i = 0; i < Math.min(5, searchResult.hosts.length); i++) {
                const host = searchResult.hosts[i];
                response += this.formatHostSummary(host, i + 1);
            }
            if (searchResult.totalCount > 5) {
                response += `\n... and ${searchResult.totalCount - 5} more hosts.\n`;
            }
            response += "\nWould you like to see more details about any specific host, or refine your search?";
            // Store search results in session for follow-up
            await this.sessionManager.updateSessionData(session.sessionId, {
                lastSearchResults: searchResult.hosts.slice(0, 10),
                searchFilters: filters
            });
            return response;
        }
        catch (error) {
            console.error("Error handling host search:", error);
            return "I encountered an error while searching for hosts. Please try again.";
        }
    }
    async handleHostComparison(message, session) {
        try {
            // Extract host addresses or use previous search results
            const hostAddresses = this.extractHostAddresses(message);
            if (hostAddresses.length < 2) {
                return "Please specify at least 2 hosts to compare. You can use their addresses or refer to hosts from your previous search.";
            }
            const comparison = await this.multiHostManager.compareHosts(hostAddresses);
            let response = `Comparison of ${comparison.hosts.length} hosts:\n\n`;
            // Price comparison
            response += `💰 Price Range: ${comparison.comparison.priceRange.min.toFixed(4)} - ${comparison.comparison.priceRange.max.toFixed(4)} ETH\n`;
            // Rating comparison
            response += `⭐ Rating Range: ${comparison.comparison.ratingRange.min.toFixed(1)} - ${comparison.comparison.ratingRange.max.toFixed(1)}/10\n\n`;
            // Individual host details
            comparison.hosts.forEach((host, index) => {
                response += `${index + 1}. ${host.displayName}\n`;
                response += `   Price: ${host.defaultPrice} ETH | Rating: ${host.rating.toFixed(1)}/10\n`;
                response += `   Specialties: ${host.specialties.join(', ')}\n`;
                response += `   Next Available: ${host.availability.nextAvailable ? host.availability.nextAvailable.toLocaleDateString() : 'Not available'}\n\n`;
            });
            if (comparison.comparison.specialtyOverlap.length > 0) {
                response += `🎯 Common Specialties: ${comparison.comparison.specialtyOverlap.join(', ')}\n`;
            }
            response += "\nWould you like to book with any of these hosts or need more information?";
            return response;
        }
        catch (error) {
            console.error("Error handling host comparison:", error);
            return "I encountered an error while comparing hosts. Please try again.";
        }
    }
    async handleAvailabilityCheck(message, session) {
        try {
            // Check if user specified a particular host
            const specifiedHost = this.extractHostFromMessage(message);
            if (specifiedHost) {
                // Check availability for specific host
                const hostProfile = await this.multiHostManager.getHostProfile(specifiedHost);
                if (!hostProfile) {
                    return "I couldn't find information for that host. Please check the host address or search for available hosts.";
                }
                const availability = await this.availabilityManager.getAvailabilityForDate(message);
                if (availability.length === 0) {
                    return `${hostProfile.displayName} doesn't have any available slots for the requested time. Would you like to check other dates or see alternative hosts?`;
                }
                let response = `${hostProfile.displayName}'s availability:\n\n`;
                availability.slice(0, 5).forEach((slot, index) => {
                    response += `${index + 1}. ${slot}\n`;
                });
                if (availability.length > 5) {
                    response += `... and ${availability.length - 5} more slots.\n`;
                }
                response += "\nWould you like to book any of these slots?";
                return response;
            }
            else {
                // Show availability across multiple hosts
                const recommendedHosts = await this.multiHostManager.getRecommendedHosts(session.requesterAddress, {}, 5);
                let response = "Here's availability from recommended hosts:\n\n";
                for (const host of recommendedHosts) {
                    if (host.availability.slotsThisWeek > 0 || host.availability.slotsNextWeek > 0) {
                        response += `${host.displayName} (${host.rating.toFixed(1)}⭐)\n`;
                        response += `  ${host.availability.slotsThisWeek} slots this week, ${host.availability.slotsNextWeek} slots next week\n`;
                        response += `  Price: ${host.defaultPrice} ETH | Specialties: ${host.specialties.slice(0, 2).join(', ')}\n\n`;
                    }
                }
                response += "Would you like to see detailed availability for any specific host?";
                return response;
            }
        }
        catch (error) {
            console.error("Error handling availability check:", error);
            return "I encountered an error while checking availability. Please try again.";
        }
    }
    async handleMeetingBooking(message, session) {
        try {
            // Extract booking details from message
            const bookingDetails = this.parseBookingDetails(message);
            if (!bookingDetails.hostAddress) {
                return "Please specify which host you'd like to book with. You can use their address or refer to a host from your previous search.";
            }
            if (!bookingDetails.dateTime) {
                return "Please specify when you'd like to schedule the meeting. For example: 'tomorrow at 2 PM' or 'next Monday at 10 AM'.";
            }
            const hostProfile = await this.multiHostManager.getHostProfile(bookingDetails.hostAddress);
            if (!hostProfile) {
                return "I couldn't find information for that host. Please check the host address.";
            }
            // Check if the slot is available
            const startTime = bookingDetails.dateTime;
            const endTime = new Date(startTime.getTime() + (bookingDetails.duration || 60) * 60 * 1000);
            const availableSlots = await this.smartContract.getAvailableSlots(bookingDetails.hostAddress, startTime, endTime);
            if (availableSlots.length === 0) {
                return `Unfortunately, ${hostProfile.displayName} is not available at that time. Would you like to see their available slots or check other hosts?`;
            }
            // Proceed with booking
            const price = bookingDetails.price || hostProfile.defaultPrice;
            try {
                const result = await this.smartContract.scheduleMeetingAdvanced(bookingDetails.hostAddress, startTime, endTime, price, bookingDetails.templateId || '0', bookingDetails.notes || '');
                // Update session with booking information
                await this.sessionManager.updateSessionData(session.sessionId, {
                    lastBooking: {
                        meetingId: result.meetingId,
                        hostAddress: bookingDetails.hostAddress,
                        startTime,
                        endTime,
                        price,
                        txHash: result.txHash
                    }
                });
                return `🎉 Meeting booked successfully!

📅 Meeting Details:
Host: ${hostProfile.displayName}
Date & Time: ${startTime.toLocaleString()}
Duration: ${Math.round((endTime.getTime() - startTime.getTime()) / 60000)} minutes
Price: ${price} ETH
Meeting ID: ${result.meetingId}

The host will confirm your meeting shortly. You'll receive the meeting link once confirmed.

Transaction Hash: ${result.txHash}`;
            }
            catch (contractError) {
                console.error("Error booking meeting:", contractError);
                return "I encountered an error while booking the meeting. Please ensure you have sufficient funds and try again.";
            }
        }
        catch (error) {
            console.error("Error handling meeting booking:", error);
            return "I encountered an error while processing your booking request. Please try again.";
        }
    }
    async handleRecommendations(message, session) {
        try {
            // Parse preferences from message
            const preferences = this.parsePreferences(message);
            const recommendations = await this.multiHostManager.getRecommendedHosts(session.requesterAddress, preferences, 5);
            if (recommendations.length === 0) {
                return "I couldn't find any hosts matching your preferences. Try adjusting your criteria or check back later.";
            }
            let response = "Here are my personalized recommendations for you:\n\n";
            recommendations.forEach((host, index) => {
                response += `${index + 1}. ${host.displayName} ⭐${host.rating.toFixed(1)}\n`;
                response += `   ${host.bio || 'Professional meeting host'}\n`;
                response += `   Price: ${host.defaultPrice} ETH | Specialties: ${host.specialties.join(', ')}\n`;
                response += `   ${host.availability.slotsThisWeek} slots available this week\n`;
                if (host.metadata.verified)
                    response += `   ✅ Verified Host\n`;
                if (host.metadata.instantBooking)
                    response += `   ⚡ Instant Booking\n`;
                response += `\n`;
            });
            response += "Would you like to see more details about any of these hosts or check their availability?";
            // Store recommendations in session
            await this.sessionManager.updateSessionData(session.sessionId, {
                lastRecommendations: recommendations
            });
            return response;
        }
        catch (error) {
            console.error("Error handling recommendations:", error);
            return "I encountered an error while getting recommendations. Please try again.";
        }
    }
    async handleSpecialtyBrowsing(message, session) {
        try {
            const specialties = await this.multiHostManager.getAvailableSpecialties();
            if (specialties.length === 0) {
                return "No specialties are currently available. Please check back later.";
            }
            let response = "Available specialties and host counts:\n\n";
            specialties.slice(0, 10).forEach((specialty, index) => {
                response += `${index + 1}. ${specialty.specialty} (${specialty.hostCount} hosts, avg ${specialty.averagePrice.toFixed(4)} ETH)\n`;
            });
            response += "\nWhich specialty interests you? I can show you hosts in that category.";
            return response;
        }
        catch (error) {
            console.error("Error handling specialty browsing:", error);
            return "I encountered an error while browsing specialties. Please try again.";
        }
    }
    async handleMarketplaceInfo(session) {
        try {
            const analytics = await this.multiHostManager.getMarketplaceAnalytics();
            let response = "📊 Marketplace Overview:\n\n";
            response += `👥 Total Hosts: ${analytics.totalHosts} (${analytics.activeHosts} active)\n`;
            response += `⭐ Average Rating: ${analytics.averageRating.toFixed(1)}/10\n`;
            response += `💰 Average Price: ${analytics.averagePrice.toFixed(4)} ETH\n`;
            response += `📅 Total Meetings: ${analytics.totalMeetings}\n\n`;
            response += "🏆 Top Specialties:\n";
            analytics.topSpecialties.slice(0, 5).forEach((specialty, index) => {
                response += `${index + 1}. ${specialty.specialty} (${specialty.count} hosts)\n`;
            });
            response += "\n💰 Price Distribution:\n";
            analytics.priceDistribution.forEach(dist => {
                response += `${dist.range}: ${dist.count} hosts\n`;
            });
            response += "\nWould you like to search for hosts or get personalized recommendations?";
            return response;
        }
        catch (error) {
            console.error("Error handling marketplace info:", error);
            return "I encountered an error while getting marketplace information. Please try again.";
        }
    }
    handleHelp() {
        return `🤖 Multi-Host AI Assistant Help

I can help you with:

🔍 **Host Discovery**
- "Search for hosts in [specialty]"
- "Find hosts under 0.05 ETH"
- "Show verified hosts only"

⭐ **Recommendations**
- "Recommend hosts for me"
- "Find hosts for [specific need]"
- "Show top-rated hosts"

📊 **Comparison**
- "Compare host A and host B"
- "Show me host details"

📅 **Booking**
- "Book with [host] tomorrow at 2 PM"
- "Check availability for [host]"
- "Schedule a 30-minute meeting"

🏷️ **Browse**
- "Show available specialties"
- "Browse by category"
- "Marketplace overview"

Just tell me what you need in natural language!`;
    }
    async handleGeneralQuery(message, session) {
        // Handle general queries that don't fit specific intents
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('host') && lowerMessage.includes('how many')) {
            const hostCount = await this.multiHostManager.getActiveHostCount();
            return `There are currently ${hostCount} active hosts available on the platform.`;
        }
        if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            const analytics = await this.multiHostManager.getMarketplaceAnalytics();
            return `The average meeting price is ${analytics.averagePrice.toFixed(4)} ETH. Prices range from as low as 0.001 ETH to 0.5+ ETH depending on the host and specialty.`;
        }
        if (lowerMessage.includes('rating') || lowerMessage.includes('review')) {
            const analytics = await this.multiHostManager.getMarketplaceAnalytics();
            return `The average host rating is ${analytics.averageRating.toFixed(1)}/10. All hosts are rated by users after meetings to ensure quality.`;
        }
        return "I'm not sure I understand. Could you please rephrase your request? You can ask me to search for hosts, get recommendations, check availability, or book meetings. Type 'help' for more options.";
    }
    // Helper methods for parsing user input
    parseSearchFilters(message) {
        const filters = {};
        const lowerMessage = message.toLowerCase();
        // Price range parsing
        const priceMatch = lowerMessage.match(/under (\d+\.?\d*)|below (\d+\.?\d*)|less than (\d+\.?\d*)/);
        if (priceMatch) {
            const maxPrice = parseFloat(priceMatch[1] || priceMatch[2] || priceMatch[3]);
            filters.priceRange = { min: 0, max: maxPrice };
        }
        // Rating parsing
        const ratingMatch = lowerMessage.match(/rating (\d+\.?\d*)\+|above (\d+\.?\d*)|over (\d+\.?\d*)/);
        if (ratingMatch) {
            filters.rating = parseFloat(ratingMatch[1] || ratingMatch[2] || ratingMatch[3]);
        }
        // Verified hosts
        if (lowerMessage.includes('verified')) {
            filters.verified = true;
        }
        // Instant booking
        if (lowerMessage.includes('instant')) {
            filters.instantBooking = true;
        }
        // Premium hosts
        if (lowerMessage.includes('premium') || lowerMessage.includes('top')) {
            filters.premiumOnly = true;
        }
        return filters;
    }
    parseSortCriteria(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('cheapest') || lowerMessage.includes('price')) {
            return 'price';
        }
        if (lowerMessage.includes('available') || lowerMessage.includes('availability')) {
            return 'availability';
        }
        if (lowerMessage.includes('fast') || lowerMessage.includes('quick') || lowerMessage.includes('response')) {
            return 'responseTime';
        }
        return 'rating'; // Default to rating
    }
    extractHostAddresses(message) {
        // Extract Ethereum addresses from message
        const addressRegex = /0x[a-fA-F0-9]{40}/g;
        return message.match(addressRegex) || [];
    }
    extractHostFromMessage(message) {
        const addresses = this.extractHostAddresses(message);
        return addresses.length > 0 ? addresses[0] : null;
    }
    parseBookingDetails(message) {
        const details = {};
        // Extract host address
        const hostAddress = this.extractHostFromMessage(message);
        if (hostAddress) {
            details.hostAddress = hostAddress;
        }
        // Parse date/time (simplified)
        const lowerMessage = message.toLowerCase();
        const now = new Date();
        if (lowerMessage.includes('tomorrow')) {
            details.dateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }
        else if (lowerMessage.includes('next week')) {
            details.dateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
        // Parse duration
        const durationMatch = lowerMessage.match(/(\d+)\s*(minute|hour)/);
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2];
            details.duration = unit === 'hour' ? value * 60 : value;
        }
        return details;
    }
    parsePreferences(message) {
        const preferences = {};
        const lowerMessage = message.toLowerCase();
        // Budget parsing
        const budgetMatch = lowerMessage.match(/budget (\d+\.?\d*)|under (\d+\.?\d*)/);
        if (budgetMatch) {
            preferences.budget = parseFloat(budgetMatch[1] || budgetMatch[2]);
        }
        // Specialty parsing (simplified)
        if (lowerMessage.includes('consulting'))
            preferences.specialty = 'Consulting';
        if (lowerMessage.includes('coaching'))
            preferences.specialty = 'Coaching';
        if (lowerMessage.includes('technical'))
            preferences.specialty = 'Technical Support';
        return preferences;
    }
    formatHostSummary(host, index) {
        let summary = `${index}. ${host.displayName} ⭐${host.rating.toFixed(1)}\n`;
        summary += `   Price: ${host.defaultPrice} ETH | Specialties: ${host.specialties.slice(0, 2).join(', ')}\n`;
        summary += `   ${host.availability.slotsThisWeek} slots this week`;
        if (host.metadata.verified)
            summary += ` | ✅ Verified`;
        if (host.metadata.instantBooking)
            summary += ` | ⚡ Instant`;
        summary += `\n   Address: ${host.address}\n\n`;
        return summary;
    }
}
// Main execution
async function main() {
    const agent = new MultiHostAIAgent();
    try {
        await agent.initialize();
        await agent.start();
    }
    catch (error) {
        console.error("Failed to start Multi-Host AI Agent:", error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
if (require.main === module) {
    main();
}
exports.default = MultiHostAIAgent;
