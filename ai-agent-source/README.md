# AI Meeting Scheduler Agent

An AI-powered meeting scheduling agent that uses XMTP for communication and processes natural language queries to help users book meetings.

## Features

- Natural Language Processing for understanding user queries
- XMTP integration for real-time messaging
- Mock smart contract interactions for payment handling
- Session management for tracking meeting bookings
- Support for availability checking, pricing, and booking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Set up environment variables:
Create a `.env` file with:
```
PRIVATE_KEY=your_private_key_here
```

4. Start the agent:
```bash
npm start
```

## Agent Capabilities

- **Greeting**: Responds to hello, hi, hey
- **Help**: Provides information about available commands
- **Check Availability**: Shows available time slots
- **Check Pricing**: Displays meeting rates
- **Book Meeting**: Creates booking sessions with mock payment
- **Cancel Meeting**: Handles cancellations and refunds

## AI Agent Address

The agent will display its wallet address when started. Users can send XMTP messages to this address to interact with the scheduling system.

