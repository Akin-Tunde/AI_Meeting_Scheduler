# AI Meeting Scheduler Agent - Technical Documentation

## Overview

The AI Meeting Scheduler Agent is a sophisticated Node.js application built with TypeScript that facilitates decentralized meeting scheduling through natural language processing and XMTP messaging. This agent serves as the core intelligence layer for the meeting scheduling system outlined in the project requirements.

## Architecture

### Core Components

The agent consists of several interconnected modules:

1. **XMTP Client** (`xmtp-client.ts`) - Handles real-time messaging
2. **NLP Processor** (`nlp-processor.ts`) - Processes natural language queries
3. **Host Availability** (`host-availability.ts`) - Manages scheduling availability
4. **Smart Contract Interface** (`mock-smart-contract.ts`) - Handles payment operations
5. **Session Manager** (`session-manager.ts`) - Tracks meeting bookings
6. **Main Agent Logic** (`index.ts`) - Orchestrates all components

### Technology Stack

- **Runtime**: Node.js v22.13.0
- **Language**: TypeScript 5.8.3
- **Messaging**: XMTP Protocol (@xmtp/xmtp-js)
- **NLP**: node-nlp library
- **Blockchain**: Ethers.js for wallet management
- **Environment**: dotenv for configuration

## Features and Capabilities

### Natural Language Processing

The agent uses a trained NLP model that recognizes the following intents:

- **check.availability**: User inquiries about available time slots
- **check.pricing**: Requests for pricing information
- **book.meeting**: Meeting booking requests
- **cancel.meeting**: Cancellation and refund requests
- **greeting**: Basic greetings and introductions
- **help**: Assistance and capability inquiries

### XMTP Integration

The agent connects to the XMTP development network and provides:

- Real-time message listening and processing
- Automated responses based on NLP analysis
- Persistent connection management
- Message history tracking

### Mock Smart Contract Operations

Currently implements placeholder functions for:

- **Deposit**: Simulates escrow payment deposits
- **Release**: Handles fund release to meeting hosts
- **Refund**: Processes cancellation refunds
- **Balance Check**: Queries account balances

### Session Management

Tracks meeting sessions with the following data structure:

```typescript
interface MeetingSession {
  id: string;
  requesterAddress: string;
  hostAddress: string;
  dateTime: string;
  duration: number; // in minutes
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}
```

## Installation and Setup

### Prerequisites

- Node.js v20+ 
- npm or yarn package manager
- Valid Ethereum wallet private key

### Installation Steps

1. Clone or extract the project files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate environment configuration:
   ```bash
   npx ts-node generate-key.ts
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the agent:
   ```bash
   npm start
   ```

### Environment Variables

The agent requires a `.env` file with:

```
PRIVATE_KEY=your_ethereum_private_key_here
```

## Usage Examples

### Checking Availability

User: "Are you available on Monday?"
Agent: "I have the following slots available: Monday 9:00 AM - 10:00 AM, Monday 2:00 PM - 3:00 PM. Would you like to book one of these slots?"

### Pricing Inquiry

User: "How much do you charge?"
Agent: "My rates are: 30-minute session: $50 USDC, 60-minute session: $90 USDC. Payment is handled securely through smart contracts on the Base network."

### Booking a Meeting

User: "I want to book a meeting"
Agent: "Great! I've created a booking session (ID: session_1234567890). Mock: Successfully deposited 50 USDC. Transaction ID: mockTx123. Please confirm your preferred time slot and I'll finalize the booking."

## Development Notes

### Current Limitations

1. **Mock Implementation**: Smart contract interactions are currently simulated
2. **In-Memory Storage**: Session data is stored in memory (not persistent)
3. **Development Network**: Uses XMTP dev network (not production)
4. **Single Host**: Currently configured for one host address

### Future Enhancements

1. **Real Smart Contracts**: Deploy actual Solidity contracts on Base network
2. **Database Integration**: Implement persistent storage for sessions
3. **Multi-Host Support**: Enable multiple meeting hosts
4. **Production XMTP**: Migrate to production XMTP network
5. **Enhanced NLP**: Add more sophisticated intent recognition
6. **Calendar Integration**: Connect with real calendar systems

## Deployment

The agent is designed to run as a persistent background service. Key deployment considerations:

- Ensure stable internet connection for XMTP messaging
- Monitor process health and implement restart mechanisms
- Secure private key management in production
- Log monitoring and error handling
- Resource usage optimization for long-running processes

## Security Considerations

- Private keys are loaded from environment variables
- XMTP communications are encrypted by default
- Mock smart contract functions include basic validation
- Session IDs are generated with timestamps for uniqueness

## Integration with Frontend

The agent works in conjunction with the deployed frontend application at `https://hekdzudl.manus.space`. Users can:

1. Connect their wallets through the frontend
2. Initiate XMTP conversations with the agent
3. Receive real-time responses and booking confirmations
4. Track their meeting sessions through the interface

## Monitoring and Logs

The agent provides console logging for:

- XMTP connection status
- NLP training progress
- Message processing events
- Mock transaction confirmations
- Error conditions and debugging information

This documentation provides a comprehensive overview of the AI Meeting Scheduler Agent's current implementation and serves as a foundation for future development and deployment activities.

