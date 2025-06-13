import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import ChatInterface from '@/components/ChatInterface'
import { cn } from '@/lib/utils'

interface RequesterDashboardProps {
  className?: string
}

const RequesterDashboard: React.FC<RequesterDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'bookings' | 'chat'>('discover')

  const hosts = [
    {
      id: 1,
      name: 'alex.base.eth',
      rating: 4.8,
      totalMeetings: 127,
      specialties: ['DeFi Strategy', 'Smart Contracts', 'Tokenomics'],
      pricing: { '30min': 50, '60min': 90 },
      availability: {
        'Monday': ['09:00-10:00', '14:00-15:00'],
        'Wednesday': ['10:00-11:00'],
        'Friday': ['15:00-16:00']
      },
      online: true
    },
    {
      id: 2,
      name: 'sarah.base.eth',
      rating: 4.9,
      totalMeetings: 89,
      specialties: ['NFT Development', 'Web3 UX', 'Frontend'],
      pricing: { '30min': 75, '60min': 130 },
      availability: {
        'Tuesday': ['11:00-12:00', '16:00-17:00'],
        'Thursday': ['09:00-10:00', '13:00-14:00']
      },
      online: false
    },
    {
      id: 3,
      name: 'mike.base.eth',
      rating: 4.7,
      totalMeetings: 203,
      specialties: ['Security Audits', 'Solidity', 'Protocol Design'],
      pricing: { '30min': 100, '60min': 180 },
      availability: {
        'Monday': ['10:00-11:00'],
        'Wednesday': ['14:00-15:00', '16:00-17:00'],
        'Friday': ['09:00-10:00']
      },
      online: true
    }
  ]

  const bookings = [
    {
      id: 1,
      host: 'alex.base.eth',
      date: 'Monday 09:00-10:00 (60 min)',
      price: 50,
      bookedAt: '6/10/2024 at 3:30:00 PM',
      paymentTx: '0xabc123...',
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      status: 'confirmed'
    },
    {
      id: 2,
      host: 'sarah.base.eth',
      date: 'Tuesday 11:00-12:00 (30 min)',
      price: 75,
      bookedAt: '6/11/2024 at 9:15:00 AM',
      status: 'pending'
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={cn("text-sm", i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300")}>
        ★
      </span>
    ))
  }

  const renderDiscoverHosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Discover Meeting Hosts</h3>
        <p className="text-sm text-gray-600">Find experts in your area of interest</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hosts.map((host) => (
          <div key={host.id} className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="font-semibold text-gray-900">{host.name}</h4>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  host.online ? "bg-green-400" : "bg-red-400"
                )} />
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  {renderStars(host.rating)}
                  <span className="text-sm text-gray-600 ml-1">({host.totalMeetings} meetings)</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {host.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4 space-y-1">
              <p className="text-sm font-medium text-gray-700">Pricing:</p>
              <p className="text-sm text-gray-600">30 min: {host.pricing['30min']} USDC</p>
              <p className="text-sm text-gray-600">60 min: {host.pricing['60min']} USDC</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available:</p>
              <div className="space-y-1">
                {Object.entries(host.availability).map(([day, times]) => (
                  <div key={day} className="text-sm text-gray-600">
                    <span className="font-medium">{day}:</span> {times.join(', ')}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button size="sm" className="flex-1">
                Chat with {host.name.split('.')[0]}
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Quick Book
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Your Bookings</h3>
        <p className="text-sm text-gray-600">Manage your scheduled meetings</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{booking.host}</h4>
                <p className="text-sm text-gray-600">{booking.date}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase",
                  booking.status === 'confirmed'
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                )}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Price:</span>
                <span className="ml-2 text-gray-900">{booking.price} USDC</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Booked:</span>
                <span className="ml-2 text-gray-900">{booking.bookedAt}</span>
              </div>
              {booking.paymentTx && (
                <div>
                  <span className="font-medium text-gray-700">Payment:</span>
                  <a
                    href={`https://basescan.org/tx/${booking.paymentTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    {booking.paymentTx}
                  </a>
                </div>
              )}
              {booking.meetingLink && (
                <div>
                  <span className="font-medium text-gray-700">Meeting Link:</span>
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {booking.status === 'confirmed' && booking.meetingLink && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Join Meeting
                </Button>
              )}
              {booking.status === 'pending' && (
                <>
                  <Button size="sm">
                    Complete Payment
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Chat with AI Agent</h3>
        <p className="text-sm text-gray-600">Ask about availability, pricing, or book a meeting</p>
      </div>
      
      <div className="bg-white rounded-lg border">
        <ChatInterface />
      </div>
    </div>
  )

  const tabs = [
    { id: 'discover', label: 'Discover Hosts', badge: null },
    { id: 'bookings', label: 'My Bookings', badge: bookings.length },
    { id: 'chat', label: 'Chat', badge: null },
  ] as const

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Meeting Scheduler</h2>
        <p className="text-gray-600 mt-2">Discover experts and book meetings</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'discover' && renderDiscoverHosts()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'chat' && renderChat()}
      </div>
    </div>
  )
}

export default RequesterDashboard

