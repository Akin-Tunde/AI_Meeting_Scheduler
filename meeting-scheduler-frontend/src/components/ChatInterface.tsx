import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useXMTP, sendMessage, getMessages } from '@/lib/xmtp'
import { cn } from '@/lib/utils'
import { useAccount } from 'wagmi'

interface Message {
  id: string
  content: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface ChatInterfaceProps {
  className?: string
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { address, isConnected } = useAccount()
  const { client, isLoading: xmtpLoading, error: xmtpError, isReady, isDemoMode, aiAgentAddress } = useXMTP()

  // Check if we're in demo mode
  const demoMode = isDemoMode || address === 'demo.base.eth' || !isConnected

  useEffect(() => {
    // Add welcome message when component mounts
    const welcomeMessage: Message = {
      id: '1',
      content: demoMode 
        ? 'Hello! I\'m your AI scheduling assistant (Demo Mode). I can help you find available meeting slots, check pricing, and book meetings with experts. How can I assist you today?'
        : `Hello! I'm your AI scheduling assistant. I'm connected via XMTP to agent ${aiAgentAddress}. I can help you find available meeting slots, check pricing, and book meetings with experts. How can I assist you today?`,
      sender: 'agent',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [demoMode, aiAgentAddress])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Listen for incoming XMTP messages if we have a real client
    if (client && !demoMode) {
      const unsubscribe = client.onMessage((xmtpMessage) => {
        if (xmtpMessage.senderAddress === aiAgentAddress) {
          const newMessage: Message = {
            id: xmtpMessage.id,
            content: xmtpMessage.content,
            sender: 'agent',
            timestamp: xmtpMessage.timestamp
          }
          setMessages(prev => [...prev, newMessage])
        }
      })

      return unsubscribe
    }
  }, [client, demoMode, aiAgentAddress])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    try {
      if (demoMode) {
        // Demo mode - simulate response
        setTimeout(() => {
          const responses = [
            "I can help you with that! Let me check the available time slots for you.",
            "Based on your request, I found several experts who might be a good fit. Would you like me to show you their availability?",
            "The pricing for consultations varies by expert. Most 30-minute sessions range from $50-100 USDC. Would you like to see specific rates?",
            "I can schedule that meeting for you. Please confirm the time slot and I'll send the booking request to the host.",
            "Great question! Let me provide you with more details about that topic.",
            `You asked: "${messageContent}". In demo mode, I'm simulating responses. Connect a real wallet to use live XMTP communication with the AI agent.`
          ]
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]
          
          const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: randomResponse,
            sender: 'agent',
            timestamp: new Date()
          }

          setMessages(prev => [...prev, agentMessage])
          setIsLoading(false)
        }, 1000 + Math.random() * 2000)
      } else {
        // Real XMTP mode
        if (isReady && client) {
          await sendMessage(messageContent)
          console.log('Message sent via XMTP to AI agent:', aiAgentAddress)
          setIsLoading(false)
        } else {
          throw new Error('XMTP client not ready')
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'agent',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Show loading state while XMTP is initializing
  if (!demoMode && xmtpLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96 bg-gray-50 rounded-lg", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to XMTP network...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing secure messaging with AI agent</p>
        </div>
      </div>
    )
  }

  // Show error state if XMTP failed to initialize
  if (!demoMode && xmtpError) {
    return (
      <div className={cn("flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200", className)}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">Failed to connect to XMTP</p>
          <p className="text-red-600 text-sm mt-2">{xmtpError}</p>
          <p className="text-gray-600 text-sm mt-2">Please try refreshing the page or use demo mode</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-96 bg-white rounded-lg border", className)}>
      {/* Connection Status Header */}
      <div className="border-b px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Chat with AI Agent</h3>
          <div className="flex items-center space-x-2">
            {demoMode ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Demo Mode
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                XMTP Connected
              </span>
            )}
          </div>
        </div>
        {!demoMode && (
          <p className="text-xs text-gray-500 mt-1">
            Connected to AI agent: {aiAgentAddress}
          </p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                message.sender === 'user'
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={cn(
                  "text-xs mt-1",
                  message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                )}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={demoMode ? "Type your message (Demo Mode)..." : "Type your message to AI agent..."}
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            Send
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
          {demoMode && " • Demo mode active - connect wallet for real XMTP"}
        </p>
      </div>
    </div>
  )
}

export default ChatInterface

