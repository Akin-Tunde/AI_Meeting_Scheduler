"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeXMTP = initializeXMTP;
exports.sendMessage = sendMessage;
exports.listenForMessages = listenForMessages;
const xmtp_js_1 = require("@xmtp/xmtp-js");
let xmtp;
async function initializeXMTP(wallet) {
    if (xmtp) {
        return xmtp;
    }
    xmtp = await xmtp_js_1.Client.create(wallet, {
        env: 'dev',
    });
    console.log('XMTP client initialized for', wallet.address);
    return xmtp;
}
async function sendMessage(peerAddress, message) {
    if (!xmtp) {
        throw new Error('XMTP client not initialized');
    }
    const conversation = await xmtp.conversations.newConversation(peerAddress);
    await conversation.send(message);
    console.log(`Sent message to ${peerAddress}: ${message}`);
}
async function listenForMessages(callback) {
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
