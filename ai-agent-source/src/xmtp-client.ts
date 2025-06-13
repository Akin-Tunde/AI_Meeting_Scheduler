import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';

let xmtp: Client | undefined;

export async function initializeXMTP(wallet: Wallet) {
  if (xmtp) {
    return xmtp;
  }
  xmtp = await Client.create(wallet, {
    env: 'dev',
  });
  console.log('XMTP client initialized for', wallet.address);
  return xmtp;
}

export async function sendMessage(peerAddress: string, message: string) {
  if (!xmtp) {
    throw new Error('XMTP client not initialized');
  }
  const conversation = await xmtp.conversations.newConversation(peerAddress);
  await conversation.send(message);
  console.log(`Sent message to ${peerAddress}: ${message}`);
}

export async function listenForMessages(callback: (message: string, senderAddress: string) => void) {
  if (!xmtp) {
    throw new Error('XMTP client not initialized');
  }
  for await (const message of await xmtp.conversations.streamAllMessages()) {
    if (message.senderAddress === xmtp.address) {
      // This is a message from me, ignore
      continue;
    }
    callback(message.content, message.senderAddress);
  }
}


