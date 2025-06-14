"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNLP = processNLP;
const node_nlp_1 = require("node-nlp");
const manager = new node_nlp_1.NlpManager({ languages: ["en"] });
// Train the NLP manager with intents
// Example: User asks about availability
manager.addDocument("en", "Are you available on %date%", "check.availability");
manager.addDocument("en", "Do you have any openings on %date%", "check.availability");
manager.addDocument("en", "What is your schedule like on %date%", "check.availability");
manager.addDocument("en", "Can I book a meeting on %date%", "check.availability");
manager.addDocument("en", "What times are available", "check.availability");
manager.addDocument("en", "Show me your availability", "check.availability");
// Example: User asks about pricing
manager.addDocument("en", "How much do you charge", "check.pricing");
manager.addDocument("en", "What is your rate", "check.pricing");
manager.addDocument("en", "How much for a meeting", "check.pricing");
manager.addDocument("en", "What are your fees", "check.pricing");
manager.addDocument("en", "Cost of consultation", "check.pricing");
// Example: User wants to book a meeting
manager.addDocument("en", "I want to book a meeting", "book.meeting");
manager.addDocument("en", "Schedule a meeting for me", "book.meeting");
manager.addDocument("en", "Book a session", "book.meeting");
manager.addDocument("en", "Reserve a time slot", "book.meeting");
// Example: User wants to cancel or refund
manager.addDocument("en", "I want to cancel my meeting", "cancel.meeting");
manager.addDocument("en", "Cancel my booking", "cancel.meeting");
manager.addDocument("en", "I need a refund", "cancel.meeting");
// Example: General greetings and help
manager.addDocument("en", "Hello", "greeting");
manager.addDocument("en", "Hi", "greeting");
manager.addDocument("en", "Hey", "greeting");
manager.addDocument("en", "Help", "help");
manager.addDocument("en", "What can you do", "help");
// Add answers for the intents
manager.addAnswer("en", "check.availability", "I can check my availability for you. What date are you interested in?");
manager.addAnswer("en", "check.pricing", "My standard rate is $50 USDC for a 30-minute session and $90 USDC for a 60-minute session. Would you like to know more?");
manager.addAnswer("en", "book.meeting", "Great! To book a meeting, I need to know your preferred date and time. What works best for you?");
manager.addAnswer("en", "cancel.meeting", "I can help you cancel your meeting. Please provide your booking details.");
manager.addAnswer("en", "greeting", "Hello! I'm your AI scheduling assistant. I can help you check availability, pricing, and book meetings. How can I assist you today?");
manager.addAnswer("en", "help", "I can help you with: 1) Checking availability, 2) Viewing pricing, 3) Booking meetings, 4) Canceling bookings. What would you like to do?");
// Train the NLP manager
(async () => {
    await manager.train();
    manager.save();
    console.log("NLP manager trained and saved.");
})();
async function processNLP(query) {
    const response = await manager.process("en", query);
    return response;
}
