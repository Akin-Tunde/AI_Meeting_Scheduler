// Real XMTP implementation for connecting to the deployed AI agent
import { Client } from '@xmtp/xmtp-js'
import { Wallet } from 'ethers'

export interface XMTPMessage {
  id: string
  content: string
  senderAddress: string
  timestamp: Date
  conversation: string
}

export interface XMTPConversation {
  peerAddress: string
  messages: XMTPMessage[]
}

// AI Agent wallet address from deployment
const AI_AGENT_ADDRESS = '0xdFec4Ae81303e7449B8f22c1fd2939118B5dE346'

export class RealXMTPClient {
  private client: Client | null = null
  private address: string
  private conversations: Map<string, XMTPConversation> = new Map()
  private messageListeners: ((message: XMTPMessage) => void)[] = []

  constructor(address: string) {
    this.address = address
  }

  static async create(signer: any): Promise<RealXMTPClient> {
    const address = await signer.getAddress()
    const instance = new RealXMTPClient(address)
    
    try {
      // Initialize XMTP client with the signer
      instance.client = await Client.create(signer, { env: 'dev' })
      console.log('XMTP client initialized for address:', address)
    } catch (error) {
      console.error('Failed to initialize XMTP client:', error)
      throw error
    }
    
    return instance
  }

  async newConversation(peerAddress: string): Promise<XMTPConversation> {
    if (!this.client) {
      throw new Error('XMTP client not initialized')
    }

    if (!this.conversations.has(peerAddress)) {
      this.conversations.set(peerAddress, {
        peerAddress,
        messages: []
      })
    }
    return this.conversations.get(peerAddress)!
  }

  async sendMessage(peerAddress: string, content: string): Promise<XMTPMessage> {
    if (!this.client) {
      throw new Error('XMTP client not initialized')
    }

    try {
      // Create or get conversation with the peer
      const conversation = await this.client.conversations.newConversation(peerAddress)
      
      // Send the message
      await conversation.send(content)
      
      const message: XMTPMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        senderAddress: this.address,
        timestamp: new Date(),
        conversation: peerAddress
      }
      
      // Add to local conversation
      const localConversation = await this.newConversation(peerAddress)
      localConversation.messages.push(message)
      
      // Notify listeners
      this.messageListeners.forEach(listener => listener(message))
      
      console.log('Message sent via XMTP to:', peerAddress)
      return message
    } catch (error) {
      console.error('Failed to send XMTP message:', error)
      throw error
    }
  }

  async startListening() {
    if (!this.client) {
      throw new Error('XMTP client not initialized')
    }

    try {
      // Listen for new conversations
      for await (const conversation of await this.client.conversations.stream()) {
        console.log('New conversation with:', conversation.peerAddress)
        
        // Listen for messages in this conversation
        for await (const message of await conversation.streamMessages()) {
          if (message.senderAddress !== this.address) {
            const xmtpMessage: XMTPMessage = {
              id: `received_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              content: message.content,
              senderAddress: message.senderAddress,
              timestamp: message.sent,
              conversation: conversation.peerAddress
            }
            
            // Add to local conversation
            const localConversation = await this.newConversation(conversation.peerAddress)
            localConversation.messages.push(xmtpMessage)
            
            // Notify listeners
            this.messageListeners.forEach(listener => listener(xmtpMessage))
            
            console.log('Received XMTP message from:', message.senderAddress)
          }
        }
      }
    } catch (error) {
      console.error('Error listening for XMTP messages:', error)
    }
  }

  getConversation(peerAddress: string): XMTPConversation | undefined {
    return this.conversations.get(peerAddress)
  }

  getAllConversations(): XMTPConversation[] {
    return Array.from(this.conversations.values())
  }

  onMessage(callback: (message: XMTPMessage) => void) {
    this.messageListeners.push(callback)
    return () => {
      const index = this.messageListeners.indexOf(callback)
      if (index > -1) {
        this.messageListeners.splice(index, 1)
      }
    }
  }
}

// Global client instance
let globalClient: RealXMTPClient | null = null

// Simplified functions for the ChatInterface component
export async function initializeXMTP(signer?: any): Promise<void> {
  if (!globalClient && signer) {
    try {
      globalClient = await RealXMTPClient.create(signer)
      // Start listening for messages
      globalClient.startListening()
    } catch (error) {
      console.error('Failed to initialize XMTP:', error)
      throw error
    }
  }
}

export async function sendMessage(content: string): Promise<void> {
  if (globalClient) {
    await globalClient.sendMessage(AI_AGENT_ADDRESS, content)
  } else {
    throw new Error('XMTP client not initialized')
  }
}

export async function getMessages(): Promise<XMTPMessage[]> {
  if (globalClient) {
    const conversation = globalClient.getConversation(AI_AGENT_ADDRESS)
    return conversation?.messages || []
  }
  return []
}

// React hook for XMTP functionality
import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWalletClient } from 'wagmi'

export function useXMTP() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [client, setClient] = useState<RealXMTPClient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we're in demo mode
  const isDemoMode = address === 'demo.base.eth' || !isConnected
  const isWalletReady = isConnected && walletClient && !isDemoMode

  const initializeClient = useCallback(async () => {
    if (!isWalletReady || !walletClient) return

    setIsLoading(true)
    setError(null)

    try {
      // Create a signer-like object from walletClient for XMTP
      const signerLike = {
        getAddress: () => Promise.resolve(address!),
        signMessage: (message: string) => walletClient.signMessage({ message })
      }
      
      const xmtpClient = await RealXMTPClient.create(signerLike)
      setClient(xmtpClient)
      globalClient = xmtpClient
      
      // Start listening for messages
      xmtpClient.startListening()
      
      console.log('XMTP client ready for address:', address)
    } catch (err) {
      console.error('XMTP initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize XMTP client')
    } finally {
      setIsLoading(false)
    }
  }, [address, isWalletReady, walletClient])

  useEffect(() => {
    if (isWalletReady && !client) {
      initializeClient()
    } else if (!isWalletReady) {
      setClient(null)
      globalClient = null
    }
  }, [isWalletReady, client, initializeClient])

  return {
    client,
    isLoading,
    error,
    isReady: !!client && isWalletReady,
    isDemoMode,
    aiAgentAddress: AI_AGENT_ADDRESS
  }
}

// Fallback to mock implementation for demo mode
export class MockXMTPClient {
  private address: string
  private conversations: Map<string, XMTPConversation> = new Map()
  private messageListeners: ((message: XMTPMessage) => void)[] = []

  constructor(address: string) {
    this.address = address
  }

  static async create(signer: any): Promise<MockXMTPClient> {
    const address = await signer.getAddress()
    return new MockXMTPClient(address)
  }

  async newConversation(peerAddress: string): Promise<XMTPConversation> {
    if (!this.conversations.has(peerAddress)) {
      this.conversations.set(peerAddress, {
        peerAddress,
        messages: []
      })
    }
    return this.conversations.get(peerAddress)!
  }

  async sendMessage(peerAddress: string, content: string): Promise<XMTPMessage> {
    const conversation = await this.newConversation(peerAddress)
    const message: XMTPMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      senderAddress: this.address,
      timestamp: new Date(),
      conversation: peerAddress
    }
    
    conversation.messages.push(message)
    this.messageListeners.forEach(listener => listener(message))
    
    // Simulate AI agent response for demo purposes
    if (peerAddress === AI_AGENT_ADDRESS) {
      setTimeout(() => {
        this.simulateAIResponse(content)
      }, 1000)
    }
    
    return message
  }

  private simulateAIResponse(userMessage: string) {
    const aiResponses = [
      "Hello! I'm your AI meeting scheduler. How can I help you today?",
      "I can help you find available meeting slots. What type of meeting are you looking for?",
      "Let me check the host's availability for you...",
      "I found some available slots. Would you like to book one of these times?",
      "Great! I'll process your meeting request and send you a payment link.",
      "The host has availability on Monday 2-3 PM, Wednesday 10-11 AM, and Friday 3-4 PM. Which works best for you?",
      "Perfect! The meeting rate is 50 USDC for a 30-minute slot. Shall I proceed with the booking?",
      "I've initiated the smart contract for payment. Please confirm the transaction to complete your booking."
    ]
    
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
    
    const aiMessage: XMTPMessage = {
      id: `ai_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: randomResponse,
      senderAddress: AI_AGENT_ADDRESS,
      timestamp: new Date(),
      conversation: this.address
    }
    
    const conversation = this.conversations.get(AI_AGENT_ADDRESS)
    if (conversation) {
      conversation.messages.push(aiMessage)
      this.messageListeners.forEach(listener => listener(aiMessage))
    }
  }

  getConversation(peerAddress: string): XMTPConversation | undefined {
    return this.conversations.get(peerAddress)
  }

  getAllConversations(): XMTPConversation[] {
    return Array.from(this.conversations.values())
  }

  onMessage(callback: (message: XMTPMessage) => void) {
    this.messageListeners.push(callback)
    return () => {
      const index = this.messageListeners.indexOf(callback)
      if (index > -1) {
        this.messageListeners.splice(index, 1)
      }
    }
  }
}

