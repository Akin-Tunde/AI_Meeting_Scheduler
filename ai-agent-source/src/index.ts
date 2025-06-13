require("dotenv").config();

import { Wallet } from 'ethers';
import { initializeXMTP, listenForMessages, sendMessage } from './xmtp-client';
import { processNLP } from './nlp-processor';
import { getMockAvailability } from './host-availability';
import SmartContractInterface from './smart-contract';
import { createMeetingSession, getMeetingSession, updateMeetingSessionStatus, getUserSessions } from './session-manager';

// Replace with your AI Agent's private key (for development purposes only)
// In a production environment, use a secure method to manage private keys
const privateKey = process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE'; 

// Host address - this should be the AI agent's address acting as the meeting host
let HOST_ADDRESS = '';

// Smart contract interface
const smartContract = new SmartContractInterface();

async function main() {
  if (privateKey === 'YOUR_PRIVATE_KEY_HERE') {
    console.error('Please set your AI Agent\'s private key in the PRIVATE_KEY environment variable or replace YOUR_PRIVATE_KEY_HERE with an actual private key.');
    return;
  }

  const wallet = new Wallet(privateKey);
  HOST_ADDRESS = wallet.address;
  console.log(`AI Agent Wallet Address: ${wallet.address}`);

  // Initialize smart contract with wallet
  smartContract.initializeWallet(privateKey);

  // Check if host price is set, if not set a default price
  try {
    const currentPrice = await smartContract.getHostPrice(HOST_ADDRESS);
    if (currentPrice === '0.0') {
      console.log('Setting default host price to 0.01 ETH...');
      const txHash = await smartContract.setHostPrice('0.01');
      console.log(`Host price set. Transaction hash: ${txHash}`);
    } else {
      console.log(`Current host price: ${currentPrice} ETH`);
    }
  } catch (error) {
    console.error('Error setting up host price:', error);
  }

  const xmtp = await initializeXMTP(wallet);
  console.log(`XMTP client initialized for address: ${xmtp.address}`);

  console.log('Listening for messages...');
  await listenForMessages(async (message, senderAddress) => {
    console.log(`Received message from ${senderAddress}: ${message}`);

    // Process message with NLP
    const nlpResponse = await processNLP(message);
    let responseText = nlpResponse.answer || "I'm not sure how to respond to that. Can you rephrase?";

    // Extract entities
    const dateEntity = nlpResponse.entities.find((entity: any) => entity.entity === 'date');
    let availabilityDate: string | undefined;
    if (dateEntity) {
      availabilityDate = dateEntity.sourceText;
    }

    // Handle different intents
    switch (nlpResponse.intent) {
      case 'check.availability':
        const availableSlots = getMockAvailability(availabilityDate);
        if (availableSlots.length > 0) {
          responseText = `I have the following slots available: ${availableSlots.join(', ')}. Would you like to book one of these slots?`;
        } else {
          responseText = `I don't have any slots available for ${availabilityDate || 'that period'}. Would you like to check other dates?`;
        }
        break;

      case 'check.pricing':
        try {
          const hostPrice = await smartContract.getHostPrice(HOST_ADDRESS);
          const platformFee = await smartContract.getPlatformFeePercentage();
          responseText = `My rate is ${hostPrice} ETH per meeting. Platform fee: ${platformFee}%. Payment is handled securely through smart contracts on the Base network.`;
        } catch (error) {
          responseText = "I'm having trouble accessing pricing information. Please try again later.";
        }
        break;

      case 'book.meeting':
        try {
          // Create a meeting session first
          const session = createMeetingSession(
            senderAddress,
            HOST_ADDRESS,
            availabilityDate || 'TBD',
            30, // default 30 minutes
            0.01, // price in ETH
            'ETH'
          );
          
          // For now, we'll create the session but require user confirmation
          // In a full implementation, you'd need to get specific time slots
          responseText = `Great! I've prepared a booking session (ID: ${session.id}). To complete the booking, please specify your preferred time slot. The meeting will cost 0.01 ETH and will be processed through our smart contract on Base network.`;
          
        } catch (error) {
          console.error('Error creating booking session:', error);
          responseText = "I'm having trouble processing your booking request. Please try again later.";
        }
        break;

      case 'cancel.meeting':
        // For demo, we'll handle cancellation through the smart contract
        const userSessions = getUserSessions(senderAddress);
        if (userSessions.length > 0) {
          const latestSession = userSessions[userSessions.length - 1];
          responseText = `I found your booking (ID: ${latestSession.id}). To cancel and receive a refund, please provide the meeting ID from your transaction. Cancellations are processed through the smart contract.`;
          updateMeetingSessionStatus(latestSession.id, 'cancelled');
        } else {
          responseText = "I couldn't find any bookings to cancel. Please check your booking details.";
        }
        break;

      case 'greeting':
      case 'help':
        // Use the default response from NLP
        break;

      default:
        responseText = "I'm here to help with scheduling meetings. You can ask about availability, pricing, or book a meeting. How can I assist you?";
    }

    await sendMessage(senderAddress, responseText);
  });
}

main().catch(console.error);

