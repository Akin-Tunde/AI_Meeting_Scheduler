import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { Button } from '@/components/ui/button'
import ChatInterface from '@/components/ChatInterface'
import HostDashboard from '@/components/HostDashboard'
import RequesterDashboard from '@/components/RequesterDashboard'
import EnhancedHostDashboard from '@/components/EnhancedHostDashboard'
import EnhancedRequesterDashboard from '@/components/EnhancedRequesterDashboard'
import HostMarketplace from '@/components/HostMarketplace'
import { cn } from '@/lib/utils'

interface User {
  address: string
  isConnected: boolean
  ensName?: string
}

type ViewType = 'home' | 'host' | 'requester' | 'marketplace' | 'chat'

function App() {
  const { address, isConnected, chain } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [demoMode, setDemoMode] = useState(false)
  
  const user: User = {
    address: address || '',
    isConnected: isConnected || demoMode,
    ensName: ensName || undefined
  }

  const handleHostSelect = (host: any) => {
    console.log('Selected host:', host)
    // Navigate to booking or chat interface
    setCurrentView('chat')
  }

  const handleBookMeeting = (host: any, details: any) => {
    console.log('Booking meeting with:', host, details)
    // Handle meeting booking logic
  }

  const renderContent = () => {
    if (!user.isConnected) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Meeting Scheduler
              </h1>
              <p className="text-lg text-gray-600">
                Decentralized meeting scheduling powered by AI and blockchain technology
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Connect Your Wallet</h2>
                <p className="text-sm text-gray-600">
                  Connect your Web3 wallet to start scheduling meetings
                </p>
              </div>
              
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="w-full"
                    variant="outline"
                  >
                    Connect {connector.name}
                  </Button>
                ))}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button
                onClick={() => setDemoMode(true)}
                className="w-full"
                variant="secondary"
              >
                Try Demo Mode
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Supports Base network • XMTP messaging • Smart contract escrow</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold">AI Scheduler</span>
                </div>
                
                <div className="hidden md:flex space-x-1">
                  <Button
                    variant={currentView === 'marketplace' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('marketplace')}
                  >
                    Marketplace
                  </Button>
                  <Button
                    variant={currentView === 'requester' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('requester')}
                  >
                    My Meetings
                  </Button>
                  <Button
                    variant={currentView === 'host' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('host')}
                  >
                    Host Dashboard
                  </Button>
                  <Button
                    variant={currentView === 'chat' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('chat')}
                  >
                    AI Chat
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {user.ensName || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => demoMode ? setDemoMode(false) : disconnect()}
                >
                  {demoMode ? 'Exit Demo' : 'Disconnect'}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {currentView === 'marketplace' && (
            <HostMarketplace
              user={user}
              onHostSelect={handleHostSelect}
              onBookMeeting={handleBookMeeting}
            />
          )}
          {currentView === 'requester' && (
            <EnhancedRequesterDashboard
              user={user}
              onBookMeeting={handleBookMeeting}
            />
          )}
          {currentView === 'host' && (
            <EnhancedHostDashboard user={user} />
          )}
          {currentView === 'chat' && (
            <ChatInterface user={user} />
          )}
          {currentView === 'home' && (
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to AI Meeting Scheduler
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover hosts, book meetings, and manage your schedule with AI assistance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-2">Browse Marketplace</h3>
                  <p className="text-gray-600 mb-4">Discover verified hosts and book meetings</p>
                  <Button onClick={() => setCurrentView('marketplace')} className="w-full">
                    Explore Hosts
                  </Button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-2">Manage Meetings</h3>
                  <p className="text-gray-600 mb-4">Track your bookings and meeting history</p>
                  <Button onClick={() => setCurrentView('requester')} className="w-full">
                    My Meetings
                  </Button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-2">Become a Host</h3>
                  <p className="text-gray-600 mb-4">Set up your availability and start earning</p>
                  <Button onClick={() => setCurrentView('host')} className="w-full">
                    Host Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  return renderContent()
}

export default App
